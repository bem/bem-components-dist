var BH = (function() {

var lastGenId = 0;

/**
 * BH: BEMJSON -> HTML процессор.
 * @constructor
 */
function BH() {
    /**
     * Используется для идентификации шаблонов.
     * Каждому шаблону дается уникальный id для того, чтобы избежать повторного применения
     * шаблона к одному и тому же узлу BEMJSON-дерева.
     * @type {Number}
     * @private
     */
    this._lastMatchId = 0;
    /**
     * Плоский массив для хранения матчеров.
     * Каждый элемент — массив с двумя элементами: [{String} выражение, {Function} шаблон}]
     * @type {Array}
     * @private
     */
    this._matchers = [];
    /**
     * Флаг, включающий автоматическую систему поиска зацикливаний. Следует использовать в development-режиме,
     * чтобы определять причины зацикливания.
     * @type {Boolean}
     * @private
     */
    this._infiniteLoopDetection = false;

    /**
     * Неймспейс для библиотек. Сюда можно писать различный функционал для дальнейшего использования в шаблонах.
     * ```javascript
     * bh.lib.objects = bh.lib.objects || {};
     * bh.lib.objects.inverse = bh.lib.objects.inverse || function(obj) { ... };
     * ```
     * @type {Object}
     */
    this.lib = {};
    this._inited = false;
    /**
     * Опции BH. Задаются через setOptions.
     * @type {Object}
     */
    this._options = {};
    this._optJsAttrName = 'onclick';
    this._optJsAttrIsJs = true;
    this._optEscapeContent = false;
    this.utils = {
        _expandoId: new Date().getTime(),
        bh: this,
        /**
         * Проверяет, что объект является примитивом.
         * ```javascript
         * bh.match('link', function(ctx) {
         *     ctx.tag(ctx.isSimple(ctx.content()) ? 'span' : 'div');
         * });
         * ```
         * @param {*} obj
         * @returns {Boolean}
         */
        isSimple: function(obj) {
            if (!obj || obj === true) return true;
            var t = typeof obj;
            return t === 'string' || t === 'number';
        },
        /**
         * Расширяет один объект свойствами другого (других).
         * Аналог jQuery.extend.
         * ```javascript
         * obj = ctx.extend(obj, {a: 1});
         * ```
         * @param {Object} target
         * @returns {Object}
         */
        extend: function(target) {
            if (!target || typeof target !== 'object') {
                target = {};
            }
            for (var i = 1, len = arguments.length; i < len; i++) {
                var obj = arguments[i],
                    key;
                /* istanbul ignore else */
                if (obj) {
                    for (key in obj) {
                        target[key] = obj[key];
                    }
                }
            }
            return target;
        },
        /**
         * Возвращает позицию элемента в рамках родителя.
         * Отсчет производится с 1 (единицы).
         * ```javascript
         * bh.match('list__item', function(ctx) {
         *     ctx.mod('pos', ctx.position());
         * });
         * ```
         * @returns {Number}
         */
        position: function() {
            var node = this.node;
            return node.index === 'content' ? 1 : node.position;
        },
        /**
         * Возвращает true, если текущий BEMJSON-элемент первый в рамках родительского BEMJSON-элемента.
         * ```javascript
         * bh.match('list__item', function(ctx) {
         *     if (ctx.isFirst()) {
         *         ctx.mod('first', 'yes');
         *     }
         * });
         * ```
         * @returns {Boolean}
         */
        isFirst: function() {
            var node = this.node;
            return node.index === 'content' || node.position === 1;
        },
        /**
         * Возвращает true, если текущий BEMJSON-элемент последний в рамках родительского BEMJSON-элемента.
         * ```javascript
         * bh.match('list__item', function(ctx) {
         *     if (ctx.isLast()) {
         *         ctx.mod('last', 'yes');
         *     }
         * });
         * ```
         * @returns {Boolean}
         */
        isLast: function() {
            var node = this.node;
            return node.index === 'content' || node.position === node.arr._listLength;
        },
        /**
         * Передает параметр вглубь BEMJSON-дерева.
         * **force** — задать значение параметра даже если оно было задано ранее.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     ctx.content({ elem: 'control' });
         *     ctx.tParam('value', ctx.param('value'));
         * });
         * bh.match('input__control', function(ctx) {
         *     ctx.attr('value', ctx.tParam('value'));
         * });
         * ```
         * @param {String} key
         * @param {*} value
         * @param {Boolean} [force]
         * @returns {*|Ctx}
         */
        tParam: function(key, value, force) {
            var keyName = '__tp_' + key;
            var node = this.node;
            if (arguments.length > 1) {
                if (force || !node.hasOwnProperty(keyName))
                    node[keyName] = value;
                return this;
            } else {
                while (node) {
                    if (node.hasOwnProperty(keyName)) {
                        return node[keyName];
                    }
                    node = node.parentNode;
                }
                return undefined;
            }
        },
        /**
         * Применяет матчинг для переданного фрагмента BEMJSON.
         * Возвращает результат преобразований.
         * @param {BemJson} bemJson
         * @returns {Object|Array}
         */
        apply: function(bemJson) {
            var prevCtx = this.ctx,
                prevNode = this.node;
            var res = this.bh.processBemJson(bemJson, prevCtx.block);
            this.ctx = prevCtx;
            this.node = prevNode;
            return res;
        },
        /**
         * Выполняет преобразования данного BEMJSON-элемента остальными шаблонами.
         * Может понадобиться, например, чтобы добавить элемент в самый конец содержимого, если в базовых шаблонах в конец содержимого добавляются другие элементы.
         * Пример:
         * ```javascript
         * bh.match('header', function(ctx) {
         *    ctx.content([
         *        ctx.content(),
         *        { elem: 'under' }
         *    ], true);
         * });
         * bh.match('header_float_yes', function(ctx) {
         *    ctx.applyBase();
         *    ctx.content([
         *        ctx.content(),
         *        { elem: 'clear' }
         *    ], true);
         * });
         * ```
         * @returns {Ctx}
         */
        applyBase: function() {
            var node = this.node;
            var json = node.json;

            if (!json.elem && json.mods) json.blockMods = json.mods;
            var block = json.block;
            var blockMods = json.blockMods;

            var subRes = this.bh._fastMatcher(this, json);
            if (subRes !== undefined) {
                this.ctx = node.arr[node.index] = node.json = subRes;
                node.blockName = block;
                node.blockMods = blockMods;
            }
            return this;
        },
        /**
         * Останавливает выполнение прочих шаблонов для данного BEMJSON-элемента.
         * Пример:
         * ```javascript
         * bh.match('button', function(ctx) {
         *     ctx.tag('button', true);
         * });
         * bh.match('button', function(ctx) {
         *     ctx.tag('span');
         *     ctx.stop();
         * });
         * ```
         * @returns {Ctx}
         */
        stop: function() {
            this.ctx._stop = true;
            return this;
        },
        /**
         * Возвращает уникальный идентификатор. Может использоваться, например,
         * чтобы задать соответствие между `label` и `input`.
         * @returns {String}
         */
        generateId: function() {
            return 'uniq' + this._expandoId + (++lastGenId);
        },
        /**
         * Возвращает/устанавливает модификатор в зависимости от аргументов.
         * **force** — задать модификатор даже если он был задан ранее.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     ctx.mod('native', 'yes');
         *     ctx.mod('disabled', true);
         * });
         * bh.match('input_islands_yes', function(ctx) {
         *     ctx.mod('native', '', true);
         *     ctx.mod('disabled', false, true);
         * });
         * ```
         * @param {String} key
         * @param {String|Boolean} [value]
         * @param {Boolean} [force]
         * @returns {String|undefined|Ctx}
         */
        mod: function(key, value, force) {
            var mods;
            if (arguments.length > 1) {
                mods = this.ctx.mods || (this.ctx.mods = {});
                mods[key] = !mods.hasOwnProperty(key) || force ? value : mods[key];
                return this;
            } else {
                mods = this.ctx.mods;
                return mods ? mods[key] : undefined;
            }
        },
        /**
         * Возвращает/устанавливает модификаторы в зависимости от аргументов.
         * **force** — задать модификаторы даже если они были заданы ранее.
         * ```javascript
         * bh.match('paranja', function(ctx) {
         *     ctx.mods({
         *         theme: 'normal',
         *         disabled: true
         *     });
         * });
         * ```
         * @param {Object} [values]
         * @param {Boolean} [force]
         * @returns {Object|Ctx}
         */
        mods: function(values, force) {
            var mods = this.ctx.mods || (this.ctx.mods = {});
            if (values !== undefined) {
                this.ctx.mods = force ? this.extend(mods, values) : this.extend(values, mods);
                return this;
            } else {
                return mods;
            }
        },
        /**
         * Возвращает/устанавливает тег в зависимости от аргументов.
         * **force** — задать значение тега даже если оно было задано ранее.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     ctx.tag('input');
         * });
         * ```
         * @param {String} [tagName]
         * @param {Boolean} [force]
         * @returns {String|undefined|Ctx}
         */
        tag: function(tagName, force) {
            if (tagName !== undefined) {
                this.ctx.tag = this.ctx.tag === undefined || force ? tagName : this.ctx.tag;
                return this;
            } else {
                return this.ctx.tag;
            }
        },
        /**
         * Возвращает/устанавливает значение mix в зависимости от аргументов.
         * При установке значения, если force равен true, то переданный микс заменяет прежнее значение,
         * в противном случае миксы складываются.
         * ```javascript
         * bh.match('button_pseudo_yes', function(ctx) {
         *     ctx.mix({ block: 'link', mods: { pseudo: 'yes' } });
         *     ctx.mix([
         *         { elem: 'text' },
         *         { block: 'ajax' }
         *     ]);
         * });
         * ```
         * @param {Array|BemJson} [mix]
         * @param {Boolean} [force]
         * @returns {Array|undefined|Ctx}
         */
        mix: function(mix, force) {
            if (mix !== undefined) {
                if (force) {
                    this.ctx.mix = mix;
                } else {
                    if (this.ctx.mix) {
                        this.ctx.mix = Array.isArray(this.ctx.mix) ?
                            this.ctx.mix.concat(mix) :
                            [this.ctx.mix].concat(mix);
                    } else {
                        this.ctx.mix = mix;
                    }
                }
                return this;
            } else {
                return this.ctx.mix;
            }
        },
        /**
         * Возвращает/устанавливает значение атрибута в зависимости от аргументов.
         * **force** — задать значение атрибута даже если оно было задано ранее.
         * @param {String} key
         * @param {String} [value]
         * @param {Boolean} [force]
         * @returns {String|undefined|Ctx}
         */
        attr: function(key, value, force) {
            var attrs;
            if (arguments.length > 1) {
                attrs = this.ctx.attrs || (this.ctx.attrs = {});
                attrs[key] = !attrs.hasOwnProperty(key) || force ? value : attrs[key];
                return this;
            } else {
                attrs = this.ctx.attrs;
                return attrs ? attrs[key] : undefined;
            }
        },
        /**
         * Возвращает/устанавливает атрибуты в зависимости от аргументов.
         * **force** — задать атрибуты даже если они были заданы ранее.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     ctx.attrs({
         *         name: ctx.param('name'),
         *         autocomplete: 'off'
         *     });
         * });
         * ```
         * @param {Object} [values]
         * @param {Boolean} [force]
         * @returns {Object|Ctx}
         */
        attrs: function(values, force) {
            var attrs = this.ctx.attrs || {};
            if (values !== undefined) {
                this.ctx.attrs = force ? this.extend(attrs, values) : this.extend(values, attrs);
                return this;
            } else {
                return attrs;
            }
        },
        /**
         * Возвращает/устанавливает значение bem в зависимости от аргументов.
         * **force** — задать значение bem даже если оно было задано ранее.
         * Если `bem` имеет значение `false`, то для элемента не будут генерироваться BEM-классы.
         * ```javascript
         * bh.match('meta', function(ctx) {
         *     ctx.bem(false);
         * });
         * ```
         * @param {Boolean} [bem]
         * @param {Boolean} [force]
         * @returns {Boolean|undefined|Ctx}
         */
        bem: function(bem, force) {
            if (bem !== undefined) {
                this.ctx.bem = this.ctx.bem === undefined || force ? bem : this.ctx.bem;
                return this;
            } else {
                return this.ctx.bem;
            }
        },
        /**
         * Возвращает/устанавливает значение `js` в зависимости от аргументов.
         * **force** — задать значение `js` даже если оно было задано ранее.
         * Значение `js` используется для инициализации блоков в браузере через `BEM.DOM.init()`.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     ctx.js(true);
         * });
         * ```
         * @param {Boolean|Object} [js]
         * @param {Boolean} [force]
         * @returns {Boolean|Object|Ctx}
         */
        js: function(js, force) {
            if (js !== undefined) {
                this.ctx.js = force ?
                    (js === true ? {} : js) :
                    js ? this.extend(this.ctx.js, js) : this.ctx.js;
                return this;
            } else {
                return this.ctx.js;
            }
        },
        /**
         * Возвращает/устанавливает значение CSS-класса в зависимости от аргументов.
         * **force** — задать значение CSS-класса даже если оно было задано ранее.
         * ```javascript
         * bh.match('page', function(ctx) {
         *     ctx.cls('ua_js_no ua_css_standard');
         * });
         * ```
         * @param {String} [cls]
         * @param {Boolean} [force]
         * @returns {String|Ctx}
         */
        cls: function(cls, force) {
            if (cls !== undefined) {
                this.ctx.cls = this.ctx.cls === undefined || force ? cls : this.ctx.cls;
                return this;
            } else {
                return this.ctx.cls;
            }
        },
        /**
         * Возвращает/устанавливает параметр текущего BEMJSON-элемента.
         * **force** — задать значение параметра, даже если оно было задано ранее.
         * Например:
         * ```javascript
         * // Пример входного BEMJSON: { block: 'search', action: '/act' }
         * bh.match('search', function(ctx) {
         *     ctx.attr('action', ctx.param('action') || '/');
         * });
         * ```
         * @param {String} key
         * @param {*} [value]
         * @param {Boolean} [force]
         * @returns {*|Ctx}
         */
        param: function(key, value, force) {
            if (value !== undefined) {
                this.ctx[key] = this.ctx[key] === undefined || force ? value : this.ctx[key];
                return this;
            } else {
                return this.ctx[key];
            }
        },
        /**
         * Возвращает/устанавливает защищенное содержимое в зависимости от аргументов.
         * **force** — задать содержимое даже если оно было задано ранее.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     ctx.content({ elem: 'control' });
         * });
         * ```
         * @param {BemJson} [value]
         * @param {Boolean} [force]
         * @returns {BemJson|Ctx}
         */
        content: function(value, force) {
            if (arguments.length > 0) {
                this.ctx.content = this.ctx.content === undefined || force ? value : this.ctx.content;
                return this;
            } else {
                return this.ctx.content;
            }
        },
        /**
         * Возвращает/устанавливает незащищенное содержимое в зависимости от аргументов.
         * **force** — задать содержимое даже если оно было задано ранее.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     ctx.html({ elem: 'control' });
         * });
         * ```
         * @param {String} [value]
         * @param {Boolean} [force]
         * @returns {String|Ctx}
         */
        html: function(value, force) {
            if (arguments.length > 0) {
                this.ctx.html = this.ctx.html === undefined || force ? value : this.ctx.html;
                return this;
            } else {
                return this.ctx.html;
            }
        },
        /**
         * Возвращает текущий фрагмент BEMJSON-дерева.
         * Может использоваться в связке с `return` для враппинга и подобных целей.
         * ```javascript
         * bh.match('input', function(ctx) {
         *     return {
         *         elem: 'wrapper',
         *         content: ctx.json()
         *     };
         * });
         * ```
         * @returns {Object|Array}
         */
        json: function() {
            return this.ctx;
        }
    };
}

BH.prototype = {

    /**
     * Задает опции шаблонизации.
     *
     * @param {Object} options
     *        {String} options[jsAttrName] Атрибут, в который записывается значение поля `js`. По умолчанию, `onclick`.
     *        {String} options[jsAttrScheme] Схема данных для `js`-значения.
     *                 Форматы:
     *                     `js` — значение по умолчанию. Получаем `return { ... }`.
     *                     `json` — JSON-формат. Получаем `{ ... }`.
     * @returns {BH}
     */
    setOptions: function(options) {
        var i;
        for (i in options) {
            this._options[i] = options[i];
        }
        if (options.jsAttrName) {
            this._optJsAttrName = options.jsAttrName;
        }
        if (options.jsAttrScheme) {
            this._optJsAttrIsJs = options.jsAttrScheme === 'js';
        }
        if (options.escapeContent) {
            this._optEscapeContent = options.escapeContent;
        }
        return this;
    },

    /**
     * Возвращает опции шаблонизации.
     *
     * @returns {Object}
     */
    getOptions: function() {
        return this._options;
    },

    /**
     * Включает/выключает механизм определения зацикливаний.
     *
     * @param {Boolean} enable
     * @returns {BH}
     */
    enableInfiniteLoopDetection: function(enable) {
        this._infiniteLoopDetection = enable;
        return this;
    },

    /**
     * Преобразует BEMJSON в HTML-код.
     * @param {BemJson} bemJson
     * @returns {String}
     */
    apply: function(bemJson) {
        return this.toHtml(this.processBemJson(bemJson));
    },

    /**
     * Объявляет шаблон.
     * ```javascript
     * bh.match('page', function(ctx) {
     *     ctx.mix([{ block: 'ua' }]);
     *     ctx.cls('ua_js_no ua_css_standard');
     * });
     * bh.match('block_mod_modVal', function(ctx) {
     *     ctx.tag('span');
     * });
     * bh.match('block__elem', function(ctx) {
     *     ctx.attr('disabled', 'disabled');
     * });
     * bh.match('block__elem_elemMod', function(ctx) {
     *     ctx.mix([{ block: 'link' }]);
     * });
     * bh.match('block__elem_elemMod_elemModVal', function(ctx) {
     *     ctx.mod('active', 'yes');
     * });
     * bh.match('block_blockMod__elem', function(ctx) {
     *     ctx.param('checked', true);
     * });
     * bh.match('block_blockMod_blockModVal__elem', function(ctx) {
     *     ctx.content({
     *         elem: 'wrapper',
     *         content: ctx
     *     };
     * });
     * ```
     * @param {String|Array|Object} expr
     * @param {Function} matcher
     * @returns {BH}
     */
    match: function(expr, matcher) {
        if (!expr) return this;

        if (Array.isArray(expr)) {
            expr.forEach(function(match, i) {
                this.match(expr[i], matcher);
            }, this);
            return this;
        }

        if (typeof expr === 'object') {
            for (var i in expr) {
                this.match(i, expr[i]);
            }
            return this;
        }

        matcher.__id = '__func' + (this._lastMatchId++);
        this._matchers.push([expr, matcher]);
        this._fastMatcher = null;
        return this;
    },

    /**
     * Вспомогательный метод для компиляции шаблонов с целью их быстрого дальнейшего исполнения.
     * @returns {String}
     */
    buildMatcher: function() {

        /**
         * Группирует селекторы матчеров по указанному ключу.
         * @param {Array} data
         * @param {String} key
         * @returns {Object}
         */
        function groupBy(data, key) {
            var res = {};
            for (var i = 0, l = data.length; i < l; i++) {
                var item = data[i];
                var value = item[key] || '__no_value__';
                (res[value] || (res[value] = [])).push(item);
            }
            return res;
        }

        var i, j, l;
        var res = [];
        var vars = ['bh = this'];
        var allMatchers = this._matchers;
        var decl, expr, matcherInfo;
        var declarations = [], exprBits, blockExprBits;
        for (i = allMatchers.length - 1; i >= 0; i--) {
            matcherInfo = allMatchers[i];
            expr = matcherInfo[0];
            vars.push('_m' + i + ' = ms[' + i + '][1]');
            decl = { fn: matcherInfo[1], index: i };
            if (~expr.indexOf('__')) {
                exprBits = expr.split('__');
                blockExprBits = exprBits[0].split('_');
                decl.block = blockExprBits[0];
                if (blockExprBits.length > 1) {
                    decl.blockMod = blockExprBits[1];
                    decl.blockModVal = blockExprBits[2] || true;
                }
                exprBits = exprBits[1].split('_');
                decl.elem = exprBits[0];
                if (exprBits.length > 1) {
                    decl.elemMod = exprBits[1];
                    decl.elemModVal = exprBits[2] || true;
                }
            } else {
                exprBits = expr.split('_');
                decl.block = exprBits[0];
                if (exprBits.length > 1) {
                    decl.blockMod = exprBits[1];
                    decl.blockModVal = exprBits[2] || true;
                }
            }
            declarations.push(decl);
        }
        var declByBlock = groupBy(declarations, 'block');
        res.push('var ' + vars.join(', ') + ';');
        res.push('function applyMatchers(ctx, json) {');
        res.push('var subRes;');

        res.push('switch (json.block) {');
        for (var blockName in declByBlock) {
            res.push('case "' + blockName + '":');
            var declsByElem = groupBy(declByBlock[blockName], 'elem');

            res.push('switch (json.elem) {');
            for (var elemName in declsByElem) {
                if (elemName === '__no_value__') {
                    res.push('case undefined:');
                } else {
                    res.push('case "' + elemName + '":');
                }
                var decls = declsByElem[elemName];
                for (j = 0, l = decls.length; j < l; j++) {
                    decl = decls[j];
                    var fn = decl.fn;
                    var conds = [];
                    conds.push('!json.' + fn.__id);
                    if (decl.elemMod) {
                        conds.push(
                            'json.mods && json.mods["' + decl.elemMod + '"] === ' +
                                (decl.elemModVal === true || '"' + decl.elemModVal + '"'));
                    }
                    if (decl.blockMod) {
                        conds.push(
                            'json.blockMods["' + decl.blockMod + '"] === ' +
                                (decl.blockModVal === true || '"' + decl.blockModVal + '"'));
                    }
                    res.push('if (' + conds.join(' && ') + ') {');
                    res.push('json.' + fn.__id + ' = true;');
                    res.push('subRes = _m' + decl.index + '(ctx, json);');
                    res.push('if (subRes !== undefined) { return (subRes || "") }');
                    res.push('if (json._stop) return;');
                    res.push('}');
                }
                res.push('return;');
            }
            res.push('}');

            res.push('return;');
        }
        res.push('}');
        res.push('};');
        res.push('return applyMatchers;');
        return res.join('\n');
    },

    /**
     * Раскрывает BEMJSON, превращая его из краткого в полный.
     * @param {BemJson} bemJson
     * @param {String} [blockName]
     * @param {Boolean} [ignoreContent]
     * @returns {Object|Array}
     */
    processBemJson: function(bemJson, blockName, ignoreContent) {
        if (bemJson == null) return;
        if (!this._inited) {
            this._init();
        }
        var resultArr = [bemJson];
        var nodes = [{ json: bemJson, arr: resultArr, index: 0, blockName: blockName, blockMods: !bemJson.elem && bemJson.mods || {} }];
        var node, json, block, blockMods, i, j, l, p, child, subRes;
        var compiledMatcher = (this._fastMatcher || (this._fastMatcher = Function('ms', this.buildMatcher())(this._matchers)));
        var processContent = !ignoreContent;
        var infiniteLoopDetection = this._infiniteLoopDetection;

        /**
         * Враппер для json-узла.
         * @constructor
         */
        function Ctx() {
            this.ctx = null;
        }
        Ctx.prototype = this.utils;
        var ctx = new Ctx();
        while (node = nodes.shift()) {
            json = node.json;
            block = node.blockName;
            blockMods = node.blockMods;
            if (Array.isArray(json)) {
                for (i = 0, j = 0, l = json.length; i < l; i++) {
                    child = json[i];
                    if (child !== false && child != null && typeof child === 'object') {
                        nodes.push({ json: child, arr: json, index: i, position: ++j, blockName: block, blockMods: blockMods, parentNode: node });
                    }
                }
                json._listLength = j;
            } else {
                var content, stopProcess = false;
                if (json.elem) {
                    block = json.block = json.block || block;
                    blockMods = json.blockMods = json.blockMods || blockMods;
                    if (json.elemMods) {
                        json.mods = json.elemMods;
                    }
                } else if (json.block) {
                    block = json.block;
                    blockMods = json.blockMods = json.mods || {};
                }

                if (json.block) {

                    if (infiniteLoopDetection) {
                        json.__processCounter = (json.__processCounter || 0) + 1;
                        compiledMatcher.__processCounter = (compiledMatcher.__processCounter || 0) + 1;
                        if (json.__processCounter > 100) {
                            throw new Error('Infinite json loop detected at "' + json.block + (json.elem ? '__' + json.elem : '') + '".');
                        }
                        if (compiledMatcher.__processCounter > 1000) {
                            throw new Error('Infinite matcher loop detected at "' + json.block + (json.elem ? '__' + json.elem : '') + '".');
                        }
                    }

                    subRes = undefined;

                    /* istanbul ignore else */
                    if (!json._stop) {
                        ctx.node = node;
                        ctx.ctx = json;
                        subRes = compiledMatcher(ctx, json);
                        if (subRes !== undefined) {
                            json = subRes;
                            node.json = json;
                            node.blockName = block;
                            node.blockMods = blockMods;
                            nodes.push(node);
                            stopProcess = true;
                        }
                    }

                }
                if (!stopProcess) {
                    if (processContent && (content = json.content)) {
                        if (Array.isArray(content)) {
                            var flatten;
                            do {
                                flatten = false;
                                for (i = 0, l = content.length; i < l; i++) {
                                    if (Array.isArray(content[i])) {
                                        flatten = true;
                                        break;
                                    }
                                }
                                if (flatten) {
                                    json.content = content = content.concat.apply([], content);
                                }
                            } while (flatten);
                            for (i = 0, j = 0, l = content.length, p = l - 1; i < l; i++) {
                                child = content[i];
                                if (child !== false && child != null && typeof child === 'object') {
                                    nodes.push({ json: child, arr: content, index: i, position: ++j, blockName: block, blockMods: blockMods, parentNode: node });
                                }
                            }
                            content._listLength = j;
                        } else {
                            nodes.push({ json: content, arr: json, index: 'content', blockName: block, blockMods: blockMods, parentNode: node });
                        }
                    }
                }
            }
            node.arr[node.index] = json;
        }
        return resultArr[0];
    },

    /**
     * Превращает раскрытый BEMJSON в HTML.
     * @param {BemJson} json
     * @returns {String}
     */
    toHtml: function(json) {
        var res, i, l, item;
        if (json === false || json == null) return '';
        if (typeof json !== 'object') {
            return this._optEscapeContent ? xmlEscape(json) : json;
        } else if (Array.isArray(json)) {
            res = '';
            for (i = 0, l = json.length; i < l; i++) {
                item = json[i];
                if (item !== false && item != null) {
                    res += this.toHtml(item);
                }
            }
            return res;
        } else {
            var isBEM = json.bem !== false;
            if (typeof json.tag !== 'undefined' && !json.tag) {
                return json.html || json.content ? this.toHtml(json.content) : '';
            }
            if (json.mix && !Array.isArray(json.mix)) {
                json.mix = [json.mix];
            }
            var cls = '',
                jattr, jval, attrs = '', jsParams, hasMixJsParams = false;

            if (jattr = json.attrs) {
                for (i in jattr) {
                    jval = jattr[i];
                    if (jval !== null && jval !== undefined) {
                        attrs += ' ' + i + '="' + attrEscape(jval) + '"';
                    }
                }
            }

            if (isBEM) {
                var base = json.block + (json.elem ? '__' + json.elem : '');

                if (json.block) {
                    cls = toBemCssClasses(json, base);
                    if (json.js) {
                        (jsParams = {})[base] = json.js === true ? {} : json.js;
                    }
                }

                var addJSInitClass = jsParams && !json.elem;

                var mixes = json.mix;
                if (mixes && mixes.length) {
                    for (i = 0, l = mixes.length; i < l; i++) {
                        var mix = mixes[i];
                        if (mix && mix.bem !== false) {
                            var mixBlock = mix.block || json.block || '',
                                mixElem = mix.elem || (mix.block ? null : json.block && json.elem),
                                mixBase = mixBlock + (mixElem ? '__' + mixElem : '');

                            if (mixBlock) {
                                cls += toBemCssClasses(mix, mixBase, base);
                                if (mix.js) {
                                    (jsParams = jsParams || {})[mixBase] = mix.js === true ? {} : mix.js;
                                    hasMixJsParams = true;
                                    if (!addJSInitClass) addJSInitClass = mixBlock && !mixElem;
                                }
                            }
                        }
                    }
                }

                if (jsParams) {
                    if (addJSInitClass) cls += ' i-bem';
                    var jsData = (!hasMixJsParams && json.js === true ?
                        '{&quot;' + base + '&quot;:{}}' :
                        attrEscape(JSON.stringify(jsParams)));
                    attrs += ' ' + (json.jsAttr || this._optJsAttrName) + '="' +
                        (this._optJsAttrIsJs ? 'return ' + jsData : jsData) + '"';
                }
            }

            if (json.cls) {
                cls = cls ? cls + ' ' + json.cls : json.cls;
            }

            var content, tag = (json.tag || 'div');
            res = '<' + tag + (cls ? ' class="' + attrEscape(cls) + '"' : '') + (attrs ? attrs : '');

            if (selfCloseHtmlTags[tag]) {
                res += '/>';
            } else {
                res += '>';
                if (json.html) {
                    res += json.html;
                } else if ((content = json.content) != null) {
                    if (Array.isArray(content)) {
                        for (i = 0, l = content.length; i < l; i++) {
                            item = content[i];
                            if (item !== false && item != null) {
                                res += this.toHtml(item);
                            }
                        }
                    } else {
                        res += this.toHtml(content);
                    }
                }
                res += '</' + tag + '>';
            }
            return res;
        }
    },

    /**
     * Инициализация BH.
     */
    _init: function() {
        this._inited = true;
        /*
            Копируем ссылку на BEM.I18N в bh.lib.i18n, если это возможно.
        */
        if (typeof BEM !== 'undefined' && typeof BEM.I18N !== 'undefined') {
            this.lib.i18n = this.lib.i18n || BEM.I18N;
        }
    }
};

/**
 * @deprecated
 */
BH.prototype.processBemjson = BH.prototype.processBemJson;

var selfCloseHtmlTags = {
    area: 1,
    base: 1,
    br: 1,
    col: 1,
    command: 1,
    embed: 1,
    hr: 1,
    img: 1,
    input: 1,
    keygen: 1,
    link: 1,
    menuitem: 1,
    meta: 1,
    param: 1,
    source: 1,
    track: 1,
    wbr: 1
};

var xmlEscape = BH.prototype.xmlEscape = function(str) {
    return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
var attrEscape = BH.prototype.attrEscape = function(str) {
    return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

var toBemCssClasses = function(json, base, parentBase) {
    var mods, mod, res = '', i;

    if (parentBase !== base) {
        if (parentBase) res += ' ';
        res += base;
    }

    if (mods = json.mods || json.elem && json.elemMods) {
        for (i in mods) {
            mod = mods[i];
            if (mod || mod === 0) {
                res += ' ' + base + '_' + i + (mod === true ? '' : '_' + mod);
            }
        }
    }
    return res;
};

return BH;
})();

/* istanbul ignore else */
if (typeof module !== 'undefined') {
    module.exports = BH;
}

var bh = new BH();
bh.setOptions({
    jsAttrName: 'data-bem',
    jsAttrScheme: 'json'
});
// begin: ../../libs/bem-core/common.blocks/page/page.bh.js


    bh.match('page', function(ctx, json) {
        ctx
            .tag('body')
            .tParam('nonceCsp', json.nonce)
            .content([
                ctx.content(),
                json.scripts
            ], true);

        return [
            json.doctype || '<!DOCTYPE html>',
            {
                tag : 'html',
                cls : 'ua_js_no',
                content : [
                    {
                        elem : 'head',
                        content : [
                            { tag : 'meta', attrs : { charset : 'utf-8' } },
                            json.uaCompatible === false? '' : {
                                tag : 'meta',
                                attrs: {
                                    'http-equiv' : 'X-UA-Compatible',
                                    content : json.uaCompatible || 'IE=edge'
                                }
                            },
                            { tag : 'title', content : json.title },
                            { block : 'ua',  attrs : { nonce : json.nonce } },
                            json.head,
                            json.styles,
                            json.favicon? { elem : 'favicon', url : json.favicon } : '',
                        ]
                    },
                    json
                ]
            }
        ];
    });

    bh.match('page__head', function(ctx) {
        ctx.bem(false).tag('head');
    });

    bh.match('page__meta', function(ctx) {
        ctx.bem(false).tag('meta');
    });

    bh.match('page__link', function(ctx) {
        ctx.bem(false).tag('link');
    });

    bh.match('page__favicon', function(ctx, json) {
        ctx
            .bem(false)
            .tag('link')
            .attr('rel', 'shortcut icon')
            .attr('href', json.url);
    });


// end: ../../libs/bem-core/common.blocks/page/page.bh.js
// begin: ../../libs/bem-core/touch.blocks/page/page.bh.js

    bh.match('page', function(ctx) {
        ctx.mix({ block : 'ua', js : true });
    });

    bh.match('page__head', function(ctx, json) {
        ctx
            .applyBase()
            .content([
                json.content,
                {
                    elem : 'meta',
                    attrs : {
                        name : 'viewport',
                        content : 'width=device-width,' +
                            (json.zoom?
                                'initial-scale=1' :
                                'maximum-scale=1,initial-scale=1,user-scalable=0')
                    }
                },
                { elem : 'meta', attrs : { name : 'format-detection', content : 'telephone=no' } },
                { elem : 'link', attrs : { name : 'apple-mobile-web-app-capable', content : 'yes' } }
            ], true);
    });


// end: ../../libs/bem-core/touch.blocks/page/page.bh.js
// begin: ../../libs/bem-core/common.blocks/ua/ua.bh.js


    bh.match('ua', function(ctx) {
        ctx
            .bem(false)
            .tag('script')
            .content([
                '(function(e,c){',
                    'e[c]=e[c].replace(/(ua_js_)no/g,"$1yes");',
                '})(document.documentElement,"className");'
            ], true);
    });


// end: ../../libs/bem-core/common.blocks/ua/ua.bh.js
// begin: ../../libs/bem-core/touch.blocks/ua/ua.bh.js

    bh.match('ua', function(ctx) {
        ctx.js(true);
    });

// end: ../../libs/bem-core/touch.blocks/ua/ua.bh.js
// begin: ../../libs/bem-core/common.blocks/page/__css/page__css.bh.js


    bh.match('page__css', function(ctx, json) {
        ctx.bem(false);

        if(json.url) {
            ctx
                .tag('link')
                .attr('rel', 'stylesheet')
                .attr('href', json.url);
        } else {
            ctx.tag('style');
        }

    });


// end: ../../libs/bem-core/common.blocks/page/__css/page__css.bh.js
// begin: ../../libs/bem-core/common.blocks/page/__js/page__js.bh.js


    bh.match('page__js', function(ctx, json) {
        var nonce = ctx.tParam('nonceCsp');
        ctx
            .bem(false)
            .tag('script');

        if(json.url) {
            ctx.attr('src', json.url);
        } else if(nonce) {
            ctx.attr('nonce', nonce);
        }
    });


// end: ../../libs/bem-core/common.blocks/page/__js/page__js.bh.js
// begin: ../../libs/bem-core/common.blocks/ua/__svg/ua__svg.bh.js


    bh.match('ua', function(ctx, json) {
        ctx.applyBase();
        ctx.content([
            json.content,
            '(function(d,n){',
                'd.documentElement.className+=',
                '" ua_svg_"+(d[n]&&d[n]("http://www.w3.org/2000/svg","svg").createSVGRect?"yes":"no");',
            '})(document,"createElementNS");'
        ], true);
    });


// end: ../../libs/bem-core/common.blocks/ua/__svg/ua__svg.bh.js
// begin: ../../libs/bem-core/touch.blocks/page/__icon/page__icon.bh.js

    bh.match('page__icon', function(ctx, json) {
        ctx.content([
            json.src16 && {
                elem : 'link',
                attrs : { rel : 'shortcut icon', href : json.src16 }
            },
            json.src114 && {
                elem : 'link',
                attrs : {
                    rel : 'apple-touch-icon-precomposed',
                    sizes : '114x114',
                    href : json.src114
                }
            },
            json.src72 && {
                elem : 'link',
                attrs : {
                    rel : 'apple-touch-icon-precomposed',
                    sizes : '72x72',
                    href : json.src72
                }
            },
            json.src57 && {
                elem : 'link',
                attrs : { rel : 'apple-touch-icon-precomposed', href : json.src57 }
            }
        ], true);
    });

// end: ../../libs/bem-core/touch.blocks/page/__icon/page__icon.bh.js
// begin: ../../common.blocks/attach/attach.bh.js


    bh.match('attach', function(ctx, json) {
        ctx
            .tParam('_attach', json)
            .tag('span')
            .js(true);

        var button = json.button;
        typeof button === 'object' || (button = {
            block : 'button',
            tag : 'span',
            text : button
        });

        var attachMods = ctx.mods(),
            buttonMods = button.mods || (button.mods = {});
        ['size', 'theme', 'disabled', 'focused'].forEach(function(mod) {
            buttonMods[mod] || (buttonMods[mod] = attachMods[mod]);
        });

        ctx.content([
            button,
            {
                elem : 'no-file',
                content : json.noFileText
            }
        ], true);
    });


// end: ../../common.blocks/attach/attach.bh.js
// begin: ../../common.blocks/button/button.bh.js


    bh.match('button', function(ctx, json) {
        var modType = ctx.mod('type'),
            isRealButton = !modType || modType === 'submit';

        ctx
            .tParam('_button', json)
            .tag(json.tag || 'button')
            .js(true)
            .attrs({
                role : 'button',
                tabindex : json.tabIndex,
                id : json.id,
                type : isRealButton? modType || 'button' : undefined,
                name : json.name,
                value : json.val,
                title : json.title
            })
            .mix({ elem : 'control' }); // NOTE: satisfy interface of `control`

        isRealButton &&
            ctx.mod('disabled') &&
            ctx.attr('disabled', 'disabled');

        var content = ctx.content();
        if(typeof content === 'undefined') {
            content = [json.icon];
            'text' in json && content.push({ elem : 'text', content : json.text });
            ctx.content(content);
        }
    });


// end: ../../common.blocks/button/button.bh.js
// begin: ../../common.blocks/button/__text/button__text.bh.js

    bh.match('button__text', function(ctx) {
        ctx.tag('span');
    });

// end: ../../common.blocks/button/__text/button__text.bh.js
// begin: ../../common.blocks/button/_focused/button_focused.bh.js


    bh.match('button_focused', function(ctx, json) {
        ctx.js(ctx.extend(json.js, { live : false }), true);
    });


// end: ../../common.blocks/button/_focused/button_focused.bh.js
// begin: ../../common.blocks/icon/icon.bh.js

    bh.match('icon', function(ctx, json) {
        var attrs = { 'aria-hidden' : 'true' },
            url = json.url;
        if(url) attrs.style = 'background-image:url(' + url + ')';
        ctx
            .tag('i')
            .attrs(attrs);
    });

// end: ../../common.blocks/icon/icon.bh.js
// begin: ../../common.blocks/attach/__button/attach__button.bh.js


    bh.match('button', function(ctx) {
        if(ctx.tParam('_attach')) {
            ctx
                .applyBase()
                .tag('span', true)
                .content([
                    { block : 'attach', elem : 'control' },
                    ctx.content()
                ], true);
        }
    });


// end: ../../common.blocks/attach/__button/attach__button.bh.js
// begin: ../../common.blocks/attach/__control/attach__control.bh.js


    bh.match('attach__control', function(ctx) {
        var attrs = { type : 'file' },
            attach = ctx.tParam('_attach');

        // в js генерим html для attach__control без самого attach
        if(attach) {
            attrs.name = attach.name;
            attach.mods && attach.mods.disabled && (attrs.disabled = 'disabled');
            attach.tabIndex && (attrs.tabindex = attach.tabIndex);
        }

        ctx
            .tag('input')
            .attrs(attrs);

    });


// end: ../../common.blocks/attach/__control/attach__control.bh.js
// begin: ../../common.blocks/attach/__no-file/attach__no-file.bh.js

    bh.match('attach__no-file', function(ctx) {
        ctx.tag('span');
    });

// end: ../../common.blocks/attach/__no-file/attach__no-file.bh.js
// begin: ../../common.blocks/attach/__file/attach__file.bh.js

    bh.match('attach__file', function(ctx) {
        ctx.tag('span');
    });

// end: ../../common.blocks/attach/__file/attach__file.bh.js
// begin: ../../common.blocks/attach/__text/attach__text.bh.js

    bh.match('attach__text', function(ctx) {
        ctx.tag('span');
    });

// end: ../../common.blocks/attach/__text/attach__text.bh.js
// begin: ../../common.blocks/attach/__clear/attach__clear.bh.js

    bh.match('attach__clear', function(ctx) {
        ctx.tag('i');
    });

// end: ../../common.blocks/attach/__clear/attach__clear.bh.js
// begin: ../../common.blocks/button/_type/button_type_link.bh.js


    bh.match('button_type_link', function(ctx, json) {
        ctx.tag('a');

        json.target && ctx.attr('target', json.target);
        ctx.mod('disabled')?
            ctx
                .attr('aria-disabled', true)
                .js({ url : json.url }) :
            ctx.attr('href', json.url);
    });


// end: ../../common.blocks/button/_type/button_type_link.bh.js
// begin: ../../common.blocks/checkbox/checkbox.bh.js


    bh.match('checkbox', function(ctx, json) {
        ctx.tag('label')
            .js(true)
            .content([
                {
                    elem : 'box',
                    content : {
                        elem : 'control',
                        checked : ctx.mod('checked'),
                        disabled : ctx.mod('disabled'),
                        name : json.name,
                        val : json.val
                    }
                },
                json.text
            ]);
    });


// end: ../../common.blocks/checkbox/checkbox.bh.js
// begin: ../../common.blocks/checkbox/__box/checkbox__box.bh.js

    bh.match('checkbox__box', function(ctx) {
        ctx.tag('span');
    });

// end: ../../common.blocks/checkbox/__box/checkbox__box.bh.js
// begin: ../../common.blocks/checkbox/__control/checkbox__control.bh.js


    bh.match('checkbox__control', function(ctx, json) {
        ctx.tag('input');

        // NOTE: don't remove autocomplete attribute, otherwise js and DOM may be desynced
        var attrs = { type : 'checkbox', autocomplete : 'off' };

        attrs.name = json.name;
        attrs.value = json.val;
        json.checked && (attrs.checked = 'checked');
        json.disabled && (attrs.disabled = 'disabled');

        ctx.attrs(attrs);
    });


// end: ../../common.blocks/checkbox/__control/checkbox__control.bh.js
// begin: ../../common.blocks/checkbox/_type/checkbox_type_button.bh.js


    bh.match('checkbox_type_button', function(ctx, json) {
        var mods = ctx.mods();

        ctx.content([{
            block : 'button',
            mods : {
                togglable : 'check',
                checked : mods.checked,
                disabled : mods.disabled,
                theme : mods.theme,
                size : mods.size
            },
            title : json.title,
            content : [
                json.icon,
                typeof json.text !== 'undefined'?
                    { elem : 'text', content : json.text } :
                    ''
            ]
        }, {
            block : 'checkbox',
            elem : 'control',
            checked : mods.checked,
            disabled : mods.disabled,
            name : json.name,
            val : json.val
        }]);
    });


// end: ../../common.blocks/checkbox/_type/checkbox_type_button.bh.js
// begin: ../../common.blocks/checkbox-group/checkbox-group.bh.js


    bh.match('checkbox-group', function(ctx, json) {
        ctx
            .tag('span')
            .js(true)
            .mix({ block : 'control-group' });

        var mods = ctx.mods(),
            val = json.val,
            isValDef = typeof val !== 'undefined';

        if(isValDef && !Array.isArray(val)) throw Error('checkbox-group: val must be an array');

        ctx.content((json.options || []).map(function(option, i) {
            return [
                !!i && !mods.type && { tag : 'br' },
                {
                    block : 'checkbox',
                    mods : {
                        type : mods.type,
                        theme : mods.theme,
                        size : mods.size,
                        checked : isValDef && val.indexOf(option.val) > -1,
                        disabled : option.disabled || mods.disabled
                    },
                    name : json.name,
                    val : option.val,
                    text : option.text,
                    title : option.title,
                    icon : option.icon
                }
            ];
        }));
    });


// end: ../../common.blocks/checkbox-group/checkbox-group.bh.js
// begin: ../../common.blocks/dropdown/dropdown.bh.js


    bh.match('dropdown', function(ctx, json) {
        ctx.js(true);

        var popup = json.popup;

        if(ctx.isSimple(popup) || popup.block !== 'popup') {
            popup = { block : 'popup', content : popup };
        }

        var popupMods = popup.mods || (popup.mods = {});
        popupMods.theme || (popupMods.theme = ctx.mod('theme'));
        popupMods.hasOwnProperty('autoclosable') || (popupMods.autoclosable = true);

        popupMods.target = 'anchor';

        ctx.content([
           { elem : 'switcher', content : json.switcher },
           popup
        ], true);
    });


// end: ../../common.blocks/dropdown/dropdown.bh.js
// begin: ../../common.blocks/dropdown/__switcher/dropdown__switcher.bh.js

    bh.match('dropdown__switcher', function(ctx) {
        ctx.tag(false);
    });

// end: ../../common.blocks/dropdown/__switcher/dropdown__switcher.bh.js
// begin: ../../common.blocks/popup/popup.bh.js

    bh.match('popup', function(ctx, json) {
        ctx.js({
            mainOffset : json.mainOffset,
            secondaryOffset : json.secondaryOffset,
            viewportOffset : json.viewportOffset,
            directions : json.directions,
            zIndexGroupLevel : json.zIndexGroupLevel
        });
    });

// end: ../../common.blocks/popup/popup.bh.js
// begin: ../../common.blocks/dropdown/_switcher/dropdown_switcher_button.bh.js


    bh.match('dropdown_switcher_button__switcher', function(ctx, json) {
        var content = ctx.content();
        if(Array.isArray(content)) return content;

        var res = ctx.isSimple(content)?
            { block : 'button', text : content } :
            content;

        if(res.block === 'button') {
            var resMods = res.mods || (res.mods = {}),
                dropdownMods = json.blockMods;
            resMods.size || (resMods.size = dropdownMods.size);
            resMods.theme || (resMods.theme = dropdownMods.theme);
            resMods.disabled = dropdownMods.disabled;
        }

        return res;
    });


// end: ../../common.blocks/dropdown/_switcher/dropdown_switcher_button.bh.js
// begin: ../../common.blocks/dropdown/_switcher/dropdown_switcher_link.bh.js


    bh.match('dropdown_switcher_link__switcher', function(ctx, json) {
        var content = ctx.content();
        if(Array.isArray(content)) return content;

        var res = ctx.isSimple(content)?
            { block : 'link', mods : { pseudo : true }, content : content } :
            content;

        if(res.block === 'link') {
            var resMods = res.mods || (res.mods = {}),
                dropdownMods = json.blockMods;
            resMods.theme || (resMods.theme = dropdownMods.theme);
            resMods.disabled = dropdownMods.disabled;
        }

        return res;
    });


// end: ../../common.blocks/dropdown/_switcher/dropdown_switcher_link.bh.js
// begin: ../../common.blocks/link/link.bh.js


    bh.match('link', function(ctx, json) {
        ctx
            .tag('a')
            .mix({ elem : 'control' }); // satisfy interface of `control`

        var url = typeof json.url === 'object'? // url could contain bemjson
                bh.apply(json.url) :
                json.url,
            attrs = {},
            tabIndex;

        if(!ctx.mod('disabled')) {
            if(url) {
                attrs.href = url;
                tabIndex = json.tabIndex;
            } else {
                tabIndex = json.tabIndex || 0;
            }
            ctx.js(true);
        } else {
            ctx.js(url? { url : url } : true);
        }

        typeof tabIndex === 'undefined' || (attrs.tabindex = tabIndex);

        json.title && (attrs.title = json.title);
        json.target && (attrs.target = json.target);

        ctx.attrs(attrs);
    });


// end: ../../common.blocks/link/link.bh.js
// begin: ../../common.blocks/link/_pseudo/link_pseudo.bh.js

    bh.match('link_pseudo', function(ctx, json) {
        json.url || ctx.tag('span');
    });

// end: ../../common.blocks/link/_pseudo/link_pseudo.bh.js
// begin: ../../common.blocks/image/image.bh.js

    bh.match('image', function(ctx, json) {
        ctx.attr('role', 'img');

        if(typeof json.content !== 'undefined') {
            ctx.tag('span');
        } else {
            ctx
                .tag('img')
                .attrs({
                    src : json.url,
                    width : json.width,
                    height : json.height,
                    alt : json.alt,
                    title : json.title
                });
        }
    });

// end: ../../common.blocks/image/image.bh.js
// begin: ../../common.blocks/input/input.bh.js


    bh.match('input', function(ctx, json) {
        ctx
            .tag('span')
            .js(true)
            .tParam('_input', json)
            .content({ elem : 'box', content : { elem : 'control' } }, true);
    });


// end: ../../common.blocks/input/input.bh.js
// begin: ../../common.blocks/input/__box/input__box.bh.js

    bh.match('input__box', function(ctx) {
        ctx.tag('span');
    });

// end: ../../common.blocks/input/__box/input__box.bh.js
// begin: ../../common.blocks/input/__control/input__control.bh.js


    bh.match('input__control', function(ctx) {
        ctx.tag('input');

        var input = ctx.tParam('_input'),
            attrs = {
                id : input.id,
                name : input.name,
                value : input.val,
                maxlength : input.maxLength,
                tabindex : input.tabIndex,
                placeholder : input.placeholder
            };

        input.autocomplete === false && (attrs.autocomplete = 'off');

        if(input.mods && input.mods.disabled) {
            attrs.disabled = 'disabled';
        }

        ctx.attrs(attrs);
    });


// end: ../../common.blocks/input/__control/input__control.bh.js
// begin: ../../touch.blocks/input/__control/input__control.bh.js

    bh.match('input__control', function(ctx) {
        ctx
            .applyBase()
            .attrs({
                autocomplete : 'off',
                autocorrect : 'off',
                autocapitalize : 'off',
                spellcheck : 'false'
            });
    });

// end: ../../touch.blocks/input/__control/input__control.bh.js
// begin: ../../common.blocks/input/_has-clear/input_has-clear.bh.js

    bh.match('input_has-clear__box', function(ctx) {
        ctx.content([ctx.content(), { elem : 'clear' }], true);
    });

// end: ../../common.blocks/input/_has-clear/input_has-clear.bh.js
// begin: ../../common.blocks/input/__clear/input__clear.bh.js

    bh.match('input__clear', function(ctx) {
        ctx.tag('i');
    });

// end: ../../common.blocks/input/__clear/input__clear.bh.js
// begin: ../../common.blocks/input/_type/input_type_password.bh.js

    bh.match('input_type_password__control', function(ctx) {
        ctx.attr('type', 'password');
    });

// end: ../../common.blocks/input/_type/input_type_password.bh.js
// begin: ../../common.blocks/input/_type/input_type_search.bh.js

    bh.match('input_type_search__control', function(ctx) {
        ctx.attr('type', 'search');
    });

// end: ../../common.blocks/input/_type/input_type_search.bh.js
// begin: ../../common.blocks/menu/menu.bh.js


    bh.match('menu', function(ctx, json) {
        var menuMods = {
            theme : ctx.mod('theme'),
            disabled : ctx.mod('disabled')
        };

        ctx
            .js(true)
            .tParam('menuMods', menuMods)
            .mix({ elem : 'control' });

        var attrs = { role : 'menu' };
        ctx.mod('disabled') || (attrs.tabindex = 0);
        ctx.attrs(attrs);

        var firstItem,
            checkedItems = [];

        if(json.content) {
            var isValDef = typeof json.val !== 'undefined',
                isModeCheck = ctx.mod('mode') === 'check',
                containsVal = function(val) {
                    return isValDef &&
                        (isModeCheck?
                            json.val.indexOf(val) > -1 :
                            json.val === val);
                },
                iterateItems = function(content) {
                    var i = 0, itemOrGroup;
                    while(itemOrGroup = content[i++]) {
                        if(itemOrGroup.block === 'menu-item') {
                            firstItem || (firstItem = itemOrGroup);
                            if(containsVal(itemOrGroup.val)) {
                                (itemOrGroup.mods = itemOrGroup.mods || {}).checked = true;
                                checkedItems.push(itemOrGroup);
                            }
                        } else { // menu__group
                            iterateItems(itemOrGroup.content);
                        }
                    }
                };

            if(!Array.isArray(json.content)) throw Error('menu: content must be an array of the menu items');

            iterateItems(json.content);
        }

        ctx
            .tParam('firstItem', firstItem)
            .tParam('checkedItems', checkedItems);
    });

// end: ../../common.blocks/menu/menu.bh.js
// begin: ../../common.blocks/menu-item/menu-item.bh.js

    bh.match('menu-item', function(ctx, json) {
        var menuMods = ctx.tParam('menuMods');

        menuMods && ctx.mods({
            theme : menuMods.theme,
            disabled : menuMods.disabled
        });

        ctx
            .js({ val : json.val })
            .attr('role', 'menuitem');
    });

// end: ../../common.blocks/menu-item/menu-item.bh.js
// begin: ../../common.blocks/menu/_focused/menu_focused.bh.js

    bh.match('menu_focused', function(ctx) {
        var js = ctx.extend(ctx.js() || {}, { live : false });
        ctx.js(js);
    });

// end: ../../common.blocks/menu/_focused/menu_focused.bh.js
// begin: ../../common.blocks/menu/__group/menu__group.bh.js


    bh.match('menu__group', function(ctx, json) {
        ctx.attr('role', 'group');

        var title = json.title;
        if(typeof title !== 'undefined') {
            ctx
                .attr('aria-label', title, true)
                .content([
                    { elem : 'group-title', content : title },
                    ctx.content()
                ], true);
        }
    });


// end: ../../common.blocks/menu/__group/menu__group.bh.js
// begin: ../../common.blocks/menu/__group-title/menu__group-title.bh.js

    bh.match('menu__group-title', function(ctx) {
        ctx.attr('role', 'presentation');
    });

// end: ../../common.blocks/menu/__group-title/menu__group-title.bh.js
// begin: ../../common.blocks/menu/_mode/menu_mode_radio.bh.js

    bh.match('menu_mode_radio', function(ctx) {
        ctx.applyBase();
        var firstItem = ctx.tParam('firstItem');
        if(firstItem && !ctx.tParam('checkedItems').length) {
            (firstItem.mods = firstItem.mods || {}).checked = true;
        }
    });

// end: ../../common.blocks/menu/_mode/menu_mode_radio.bh.js
// begin: ../../common.blocks/menu-item/_type/menu-item_type_link.bh.js


    bh.match('menu-item_type_link', function(ctx) {
        ctx.applyBase();

        ctx.mod('disabled') && ctx.tParam('_menuItemDisabled', true);
    });

    bh.match('link', function(ctx) {
        ctx.tParam('_menuItemDisabled') && ctx.mod('disabled', true);
    });


// end: ../../common.blocks/menu-item/_type/menu-item_type_link.bh.js
// begin: ../../common.blocks/modal/modal.bh.js


    bh.match('modal', function(ctx, json) {
        ctx
            .js(true)
            .mix({
                block : 'popup',
                js : { zIndexGroupLevel : json.zIndexGroupLevel || 20 },
                mods : { autoclosable : ctx.mod('autoclosable') }
            })
            .content({
                elem : 'table',
                content : {
                    elem : 'cell',
                    content : {
                        elem : 'content',
                        content : ctx.content()
                    }
                }
            }, true);
    });


// end: ../../common.blocks/modal/modal.bh.js
// begin: ../../common.blocks/progressbar/progressbar.bh.js


    bh.match('progressbar', function(ctx, json) {
        var val = json.val;

        ctx
            .js({ val : val })
            .content({
                elem : 'bar',
                attrs : { style : 'width:' + val + '%' }
            });
    });

// end: ../../common.blocks/progressbar/progressbar.bh.js
// begin: ../../common.blocks/radio/radio.bh.js


    bh.match('radio', function(ctx, json) {
        ctx
            .tag('label')
            .js(true)
            .content([
                {
                    elem : 'box',
                    content : {
                        elem : 'control',
                        checked : ctx.mod('checked'),
                        disabled : ctx.mod('disabled'),
                        name : json.name,
                        val : json.val
                    }
                },
                json.text
            ]);
    });


// end: ../../common.blocks/radio/radio.bh.js
// begin: ../../common.blocks/radio/__box/radio__box.bh.js

    bh.match('radio__box', function(ctx) {
        ctx.tag('span');
    });

// end: ../../common.blocks/radio/__box/radio__box.bh.js
// begin: ../../common.blocks/radio/__control/radio__control.bh.js


    bh.match('radio__control', function(ctx, json) {
        ctx.tag('input');

        // NOTE: don't remove autocomplete attribute, otherwise js and DOM may be desynced
        var attrs = {
                type : 'radio',
                autocomplete : 'off',
                name : json.name,
                value : json.val
            };

        json.checked && (attrs.checked = 'checked');
        json.disabled && (attrs.disabled = 'disabled');

        ctx.attrs(attrs);
    });


// end: ../../common.blocks/radio/__control/radio__control.bh.js
// begin: ../../common.blocks/radio/_type/radio_type_button.bh.js


    bh.match('radio_type_button', function(ctx, json) {
        var mods = ctx.mods();

        ctx.content([{
            block : 'button',
            mods : {
                togglable : mods.mode === 'radio-check'?
                    'check' :
                    'radio',
                checked : mods.checked,
                disabled : mods.disabled,
                theme : mods.theme,
                size : mods.size
            },
            title : json.title,
            content : [
                json.icon,
                typeof json.text !== 'undefined'?
                    { elem : 'text', content : json.text } :
                    ''
            ]
        }, {
            block : 'radio',
            elem : 'control',
            checked : mods.checked,
            disabled : mods.disabled,
            name : json.name,
            val : json.val
        }]);
    });


// end: ../../common.blocks/radio/_type/radio_type_button.bh.js
// begin: ../../common.blocks/radio-group/radio-group.bh.js


    bh.match('radio-group', function(ctx, json) {
        ctx
            .tag('span')
            .js(true)
            .mix({ block : 'control-group' });

        var mods = ctx.mods(),
            isValDef = typeof json.val !== 'undefined';

        ctx.content((json.options || []).map(function(option, i) {
            return [
                !!i && !mods.type && { tag : 'br' },
                {
                    block : 'radio',
                    mods : {
                        type : mods.type,
                        mode : mods.mode,
                        theme : mods.theme,
                        size : mods.size,
                        checked : isValDef && json.val === option.val,
                        disabled : option.disabled || mods.disabled
                    },
                    name : json.name,
                    val : option.val,
                    text : option.text,
                    title : option.title,
                    icon : option.icon
                }
            ];
        }));
    });


// end: ../../common.blocks/radio-group/radio-group.bh.js
// begin: ../../common.blocks/radio-group/_mode/radio-group_mode_radio-check.bh.js


    bh.match('radio-group_mode_radio-check', function(ctx) {
        if(ctx.mod('type') !== 'button')
            throw Error('Modifier mode=radio-check can be only with modifier type=button');
    });


// end: ../../common.blocks/radio-group/_mode/radio-group_mode_radio-check.bh.js
// begin: ../../common.blocks/select/select.bh.js


    bh.match('select', function(ctx, json) {
        if(!ctx.mod('mode')) throw Error('Can\'t build select without mode modifier');

        function containsVal(val) {
            return isValDef &&
                (isModeCheck?
                    json.val.indexOf(val) > -1 :
                    json.val === val);
        }

        function iterateOptions(content) {
            var i = 0, option;
            while(option = content[i++]) {
                if(option.group) {
                    iterateOptions(option.group);
                } else {
                    firstOption || (firstOption = option);
                    if(containsVal(option.val)) {
                        option.checked = true;
                        checkedOptions.push(option);
                    }
                }
            }
        }

        var isValDef = typeof json.val !== 'undefined',
            isModeCheck = ctx.mod('mode') === 'check',
            firstOption, checkedOptions = [];

        iterateOptions(json.options);

        ctx
            .js({
                name : json.name,
                optionsMaxHeight : json.optionsMaxHeight
            })
            .tParam('select', json)
            .tParam('firstOption', firstOption)
            .tParam('checkedOptions', checkedOptions)
            .content([
                { elem : 'button' },
                {
                    block : 'popup',
                    mods : { target : 'anchor', theme : ctx.mod('theme'), autoclosable : true },
                    directions : ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
                    content : { block : json.block, mods : ctx.mods(), elem : 'menu' }
                }
            ]);
    });


// end: ../../common.blocks/select/select.bh.js
// begin: ../../common.blocks/select/_focused/select_focused.bh.js


    bh.match('select_focused', function(ctx) {
        ctx
            .applyBase()
            .extend(ctx.js(), { live : false });
    });


// end: ../../common.blocks/select/_focused/select_focused.bh.js
// begin: ../../common.blocks/select/__control/select__control.bh.js


    bh.match('select__control', function(ctx, json) {
        ctx
            .tag('input')
            .attrs({
                type : 'hidden',
                name : ctx.tParam('select').name,
                value : json.val,
                disabled : json.blockMods.disabled? 'disabled' : undefined
            });
    });


// end: ../../common.blocks/select/__control/select__control.bh.js
// begin: ../../common.blocks/select/__button/select__button.bh.js


    bh.match('select__button', function(ctx, json) {
        var mods = json.blockMods,
            select = ctx.tParam('select'),
            checkedOptions = ctx.tParam('checkedOptions');

        return {
            block : 'button',
            mix : { block : json.block, elem : json.elem },
            mods : {
                size : mods.size,
                theme : mods.theme,
                view : mods.view,
                focused : mods.focused,
                disabled : mods.disabled,
                checked : mods.mode !== 'radio' && !!checkedOptions.length
            },
            id : select.id,
            tabIndex : select.tabIndex,
            content : [
                ctx.content(),
                { block : 'icon', mix : { block : 'select', elem : 'tick' } }
            ]
        };
    });


// end: ../../common.blocks/select/__button/select__button.bh.js
// begin: ../../common.blocks/select/__menu/select__menu.bh.js


    bh.match('select__menu', function(ctx, json) {
        var mods = ctx.mods(),
            select = ctx.tParam('select'),
            optionToMenuItem = function(option) {
                var res = {
                        block : 'menu-item',
                        mods : { disabled : mods.disabled || option.disabled },
                        val : option.val,
                        js : { checkedText : option.checkedText },
                        content : option.text
                    };

                if(option.icon) {
                    res.js.text = option.text;
                    res.content = [
                        option.icon,
                        res.content
                    ];
                }

                return res;
            };

        return {
            block : 'menu',
            mix : { block : json.block, elem : json.elem },
            mods : {
                size : mods.size,
                theme : mods.theme,
                disabled : mods.disabled,
                mode : mods.mode
            },
            val : select.val,
            attrs : { tabindex : null },
            content : select.options.map(function(optionOrGroup) {
                return optionOrGroup.group?
                    {
                        elem : 'group',
                        mods : { 'has-title' : !!optionOrGroup.title },
                        title : optionOrGroup.title,
                        content : optionOrGroup.group.map(optionToMenuItem)
                    } :
                    optionToMenuItem(optionOrGroup);
            })
        };
    });


// end: ../../common.blocks/select/__menu/select__menu.bh.js
// begin: ../../common.blocks/select/_mode/select_mode_check.bh.js


    bh.match('select_mode_check', function(ctx, json) {
        ctx
            .applyBase()
            .extend(ctx.js(), { text : json.text });

        var checkedOptions = ctx.tParam('checkedOptions');

        if(checkedOptions[0]) {
            var res = checkedOptions.map(function(option) {
                return {
                    elem : 'control',
                    val : option.val
                };
            });

            ctx.content([
                res,
                ctx.content()
            ], true);
        }
    });

    bh.match('select_mode_check__button', function(ctx) {
        var checkedOptions = ctx.tParam('checkedOptions');

        ctx.content({
            elem : 'text',
            content : checkedOptions.length === 1?
                checkedOptions[0].text :
                checkedOptions.reduce(function(res, option) {
                    return res + (res? ', ' : '') + (option.checkedText || option.text);
                }, '') ||
                    ctx.tParam('select').text
        });
    });


// end: ../../common.blocks/select/_mode/select_mode_check.bh.js
// begin: ../../common.blocks/select/_mode/select_mode_radio-check.bh.js


    bh.match('select_mode_radio-check', function(ctx, json) {
        ctx
            .applyBase()
            .extend(ctx.js(), { text : json.text });

        var checkedOptions = ctx.tParam('checkedOptions');

        if(checkedOptions[0]) {
            ctx.content([
                {
                    elem : 'control',
                    val : checkedOptions[0].val
                },
                ctx.content()
            ], true);
        }
    });

    bh.match('select_mode_radio-check__button', function(ctx) {
        var checkedOptions = ctx.tParam('checkedOptions');

        ctx.content({
            elem : 'text',
            content : (checkedOptions[0] || ctx.tParam('select')).text
        });
    });


// end: ../../common.blocks/select/_mode/select_mode_radio-check.bh.js
// begin: ../../common.blocks/select/_mode/select_mode_radio.bh.js


    bh.match('select_mode_radio', function(ctx) {
        ctx.applyBase();

        var checkedOptions = ctx.tParam('checkedOptions'),
            firstOption = ctx.tParam('firstOption');

        if(firstOption && !checkedOptions.length) {
            firstOption.checked = true;
            checkedOptions = [firstOption];
        }

        ctx
            .tParam('checkedOption', checkedOptions[0])
            .content([
                {
                    elem : 'control',
                    val : checkedOptions[0].val
                },
                ctx.content()
            ], true);
    });

    bh.match('select_mode_radio__button', function(ctx) {
        ctx.content({
            elem : 'text',
            content : ctx.tParam('checkedOption').text
        });
    });


// end: ../../common.blocks/select/_mode/select_mode_radio.bh.js
// begin: ../../common.blocks/spin/spin.bh.js

    bh.match('spin', function(ctx) {
        ctx.tag('span');
    });

// end: ../../common.blocks/spin/spin.bh.js
// begin: ../../common.blocks/textarea/textarea.bh.js

    bh.match('textarea', function(ctx, json) {
        var attrs = {
                id : json.id,
                name : json.name,
                tabindex : json.tabIndex,
                placeholder : json.placeholder
            };

        json.autocomplete === false && (attrs.autocomplete = 'off');
        ctx.mod('disabled') && (attrs.disabled = 'disabled');

        ctx
            .js(true)
            .tag('textarea')
            .mix({ elem : 'control' }) // NOTE: satisfy interface of `control`
            .attrs(attrs)
            .content(json.val, true);
    });

// end: ../../common.blocks/textarea/textarea.bh.js
// begin: ../../design/common.blocks/progressbar/_theme/progressbar_theme_simple.bh.js


    bh.match('progressbar_theme_simple', function(ctx, json) {

        ctx
            .applyBase()
            .content([
                {
                    elem : 'box',
                    content : json.content
                },
                {
                    elem : 'text',
                    content : json.val
                }
            ], true);

    });


// end: ../../design/common.blocks/progressbar/_theme/progressbar_theme_simple.bh.js
module.exports = bh;
