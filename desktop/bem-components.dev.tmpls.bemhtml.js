/* ../../libs/bem-core/common.blocks/ua/ua.bemhtml.js begin */
block('ua')(
    tag()('script'),
    bem()(false),
    content()([
        '(function(e,c){',
            'e[c]=e[c].replace(/(ua_js_)no/g,"$1yes");',
        '})(document.documentElement,"className");'
    ])
);

/* ../../libs/bem-core/common.blocks/ua/ua.bemhtml.js end */

/* ../../libs/bem-core/common.blocks/page/page.bemhtml.js begin */
block('page')(

    mode('doctype')(function() {
        return { html : this.ctx.doctype || '<!DOCTYPE html>' };
    }),

    wrap()(function() {
        var ctx = this.ctx;
        this._nonceCsp = ctx.nonce;

        return [
            apply('doctype'),
            {
                tag : 'html',
                attrs : { lang : ctx.lang },
                cls : 'ua_js_no',
                content : [
                    {
                        elem : 'head',
                        content : [
                            { tag : 'meta', attrs : { charset : 'utf-8' } },
                            ctx.uaCompatible === false? '' : {
                                tag : 'meta',
                                attrs : {
                                    'http-equiv' : 'X-UA-Compatible',
                                    content : ctx.uaCompatible || 'IE=edge'
                                }
                            },
                            { tag : 'title', content : ctx.title },
                            { block : 'ua', attrs : { nonce : ctx.nonce } },
                            ctx.head,
                            ctx.styles,
                            ctx.favicon? { elem : 'favicon', url : ctx.favicon } : ''
                        ]
                    },
                    ctx
                ]
            }
        ];
    }),

    tag()('body'),

    content()(function() {
        return [
            applyNext(),
            this.ctx.scripts
        ];
    }),

    elem('head')(
        bem()(false),
        tag()('head')
    ),

    elem('meta')(
        bem()(false),
        tag()('meta')
    ),

    elem('link')(
        bem()(false),
        tag()('link')
    ),

    elem('favicon')(
        bem()(false),
        tag()('link'),
        attrs()(function() {
            return this.extend(applyNext() || {}, { rel : 'shortcut icon', href : this.ctx.url });
        })
    )

);

/* ../../libs/bem-core/common.blocks/page/page.bemhtml.js end */

/* ../../libs/bem-core/common.blocks/page/__css/page__css.bemhtml.js begin */
block('page').elem('css')(
    bem()(false),
    tag()('style'),
    match(function() { return this.ctx.url; })(
        tag()('link'),
        attrs()(function() {
            return this.extend(applyNext() || {}, { rel : 'stylesheet', href : this.ctx.url });
        })
    )
);

/* ../../libs/bem-core/common.blocks/page/__css/page__css.bemhtml.js end */

/* ../../libs/bem-core/common.blocks/page/__js/page__js.bemhtml.js begin */
block('page').elem('js')(
    bem()(false),
    tag()('script'),
    attrs()(function() {
        var attrs = {};
        if(this.ctx.url) {
            attrs.src = this.ctx.url;
        } else if(this._nonceCsp) {
            attrs.nonce = this._nonceCsp;
        }

        return this.extend(applyNext() || {}, attrs);
    })
);

/* ../../libs/bem-core/common.blocks/page/__js/page__js.bemhtml.js end */

/* ../../libs/bem-core/common.blocks/ua/__svg/ua__svg.bemhtml.js begin */
block('ua').content()(function() {
    return [
        applyNext(),
        {
            html : [
                '(function(d,n){',
                    'd.documentElement.className+=',
                    '" ua_svg_"+(d[n]&&d[n]("http://www.w3.org/2000/svg","svg").createSVGRect?"yes":"no");',
                '})(document,"createElementNS");'
            ].join('')
        }
    ];
});

/* ../../libs/bem-core/common.blocks/ua/__svg/ua__svg.bemhtml.js end */

/* ../../libs/bem-core/desktop.blocks/page/__conditional-comment/page__conditional-comment.bemhtml.js begin */
block('page').elem('conditional-comment')(
    tag()(false),

    content()(function() {
        var ctx = this.ctx,
            cond = ctx.condition
                .replace('<', 'lt')
                .replace('>', 'gt')
                .replace('=', 'e'),
            hasNegation = cond.indexOf('!') > -1,
            includeOthers = ctx.msieOnly === false,
            hasNegationOrIncludeOthers = hasNegation || includeOthers;

        return [
            { html : '<!--[if ' + cond + ']>' },
            includeOthers? { html : '<!' } : '',
            hasNegationOrIncludeOthers? { html : '-->' } : '',
            applyNext(),
            hasNegationOrIncludeOthers? { html : '<!--' } : '',
            { html : '<![endif]-->' }
        ];
    })
);

/* ../../libs/bem-core/desktop.blocks/page/__conditional-comment/page__conditional-comment.bemhtml.js end */

/* ../../common.blocks/attach/attach.bemhtml.js begin */
block('attach')(
    def()(function() { return applyNext({ _attach : this.ctx }); }),

    tag()('span'),

    js()(true),

    content()(
        function() {
            var ctx = this.ctx,
                button = ctx.button;

            this.isSimple(button) && (button = {
                block : 'button',
                tag : 'span',
                text : button
            });

            var attachMods = this.mods,
                buttonMods = button.mods || (button.mods = {});
            ['size', 'theme', 'disabled', 'focused'].forEach(function(mod) {
                buttonMods[mod] || (buttonMods[mod] = attachMods[mod]);
            });

            return [
                button,
                {
                    elem : 'no-file',
                    content : this.ctx.noFileText
                }
            ];
        }
    )
);

/* ../../common.blocks/attach/attach.bemhtml.js end */

/* ../../common.blocks/button/button.bemhtml.js begin */
block('button')(
    def()(function() {
        var tag = apply('tag'),
            isRealButton = (tag === 'button') && (!this.mods.type || this.mods.type === 'submit');

        return applyNext({ _isRealButton : isRealButton });
    }),

    tag()(function() {
        return this.ctx.tag || 'button';
    }),

    js()(true),

    // NOTE: mix below is to satisfy interface of `control`
    addMix()({ elem : 'control' }),

    addAttrs()(
        // Common attributes
        function() {
            var ctx = this.ctx,
                a = applyNext(),
                attrs = {
                    role : (a && a.role) || 'button',
                    tabindex : ctx.tabIndex,
                    id : ctx.id,
                    title : ctx.title
                };

            this.mods.disabled &&
                !this._isRealButton && (attrs['aria-disabled'] = 'true');

            return attrs;
        },

        // Attributes for button variant
        match(function() { return this._isRealButton; })(function() {
            var ctx = this.ctx,
                attrs = {
                    type : this.mods.type || 'button',
                    name : ctx.name,
                    value : ctx.val
                };

            this.mods.disabled && (attrs.disabled = 'disabled');

            return attrs;
        })
    ),

    content()(
        function() {
            var ctx = this.ctx,
                content = [ctx.icon];
            // NOTE: wasn't moved to separate template for optimization
            /* jshint eqnull: true */
            ctx.text != null && content.push({ elem : 'text', content : ctx.text });
            return content;
        },
        match(function() { return typeof this.ctx.content !== 'undefined'; })(function() {
            return this.ctx.content;
        })
    )
);

/* ../../common.blocks/button/button.bemhtml.js end */

/* ../../common.blocks/button/__text/button__text.bemhtml.js begin */
block('button').elem('text').tag()('span');

/* ../../common.blocks/button/__text/button__text.bemhtml.js end */

/* ../../common.blocks/button/_focused/button_focused.bemhtml.js begin */
block('button').mod('focused', true).js()(function() {
    return this.extend(applyNext(), { lazyInit : false });
});

/* ../../common.blocks/button/_focused/button_focused.bemhtml.js end */

/* ../../common.blocks/icon/icon.bemhtml.js begin */
block('icon')(
    tag()('span'),
    addAttrs()(function() {
        var attrs = {},
            url = this.ctx.url;
        if(url) attrs.style = 'background-image:url(' + url + ')';
        return attrs;
    })
);

/* ../../common.blocks/icon/icon.bemhtml.js end */

/* ../../common.blocks/attach/__button/attach__button.bemhtml.js begin */
block('button').match(function() { return this._attach; })(
    tag()('span'),
    content()(function() {
        return [
            { block : 'attach', elem : 'control' },
            applyNext()
        ];
    })
);

/* ../../common.blocks/attach/__button/attach__button.bemhtml.js end */

/* ../../common.blocks/attach/__control/attach__control.bemhtml.js begin */
block('attach').elem('control')(

    tag()('input'),

    addAttrs()(function() {
        var attrs = { type : 'file' },
            attach = this._attach;

        // в js генерим html для attach__control без самого attach
        if(attach) {
            attrs.name = attach.name;
            attach.mods && attach.mods.disabled && (attrs.disabled = 'disabled');
            attach.tabIndex && (attrs.tabindex = attach.tabIndex);
        }

        return attrs;
    })

);

/* ../../common.blocks/attach/__control/attach__control.bemhtml.js end */

/* ../../common.blocks/attach/__no-file/attach__no-file.bemhtml.js begin */
block('attach').elem('no-file').tag()('span');

/* ../../common.blocks/attach/__no-file/attach__no-file.bemhtml.js end */

/* ../../common.blocks/attach/__file/attach__file.bemhtml.js begin */
block('attach').elem('file').tag()('span');

/* ../../common.blocks/attach/__file/attach__file.bemhtml.js end */

/* ../../common.blocks/attach/__text/attach__text.bemhtml.js begin */
block('attach').elem('text').tag()('span');

/* ../../common.blocks/attach/__text/attach__text.bemhtml.js end */

/* ../../common.blocks/attach/__clear/attach__clear.bemhtml.js begin */
block('attach').elem('clear').tag()('span');

/* ../../common.blocks/attach/__clear/attach__clear.bemhtml.js end */

/* ../../common.blocks/button/_togglable/button_togglable_check.bemhtml.js begin */
block('button').mod('togglable', 'check').addAttrs()(function() {
    return this.extend({ 'aria-pressed' : String(!!this.mods.checked) },
        applyNext());
});

/* ../../common.blocks/button/_togglable/button_togglable_check.bemhtml.js end */

/* ../../common.blocks/button/_togglable/button_togglable_radio.bemhtml.js begin */
block('button').mod('togglable', 'radio').addAttrs()(function() {
    return { 'aria-pressed' : String(!!this.mods.checked) };
});

/* ../../common.blocks/button/_togglable/button_togglable_radio.bemhtml.js end */

/* ../../common.blocks/button/_type/button_type_link.bemhtml.js begin */
block('button').mod('type', 'link')(
    tag()('a'),

    addAttrs()(function() {
        var ctx = this.ctx,
            attrs = { role : 'link' };

        ctx.target && (attrs.target = ctx.target);
        this.mods.disabled?
            attrs['aria-disabled'] = 'true' :
            attrs.href = ctx.url;

        return attrs;
    }),

    mod('disabled', true)
        .js()(function() {
            return this.extend(applyNext(), { url : this.ctx.url });
        })
);

/* ../../common.blocks/button/_type/button_type_link.bemhtml.js end */

/* ../../common.blocks/checkbox/checkbox.bemhtml.js begin */
block('checkbox')(
    tag()('label'),

    js()(true),

    content()(function() {
        var ctx = this.ctx,
            mods = this.mods;

        return [
            {
                elem : 'box',
                content : {
                    elem : 'control',
                    checked : mods.checked,
                    disabled : mods.disabled,
                    name : ctx.name,
                    val : ctx.val
                }
            },
            ctx.text && {
                elem : 'text',
                content : ctx.text
            }
        ];
    })
);

/* ../../common.blocks/checkbox/checkbox.bemhtml.js end */

/* ../../common.blocks/checkbox/__box/checkbox__box.bemhtml.js begin */
block('checkbox').elem('box').tag()('span');

/* ../../common.blocks/checkbox/__box/checkbox__box.bemhtml.js end */

/* ../../common.blocks/checkbox/__control/checkbox__control.bemhtml.js begin */
block('checkbox').elem('control')(
    tag()('input'),

    addAttrs()(function() {
        // NOTE: don't remove autocomplete attribute, otherwise js and DOM may be desynced
        var attrs = { type : 'checkbox', autocomplete : 'off' },
            ctx = this.ctx;

        attrs.name = ctx.name;
        attrs.value = ctx.val;
        ctx.checked && (attrs.checked = 'checked');
        ctx.disabled && (attrs.disabled = 'disabled');

        return attrs;
    })
);

/* ../../common.blocks/checkbox/__control/checkbox__control.bemhtml.js end */

/* ../../common.blocks/checkbox/__text/checkbox__text.bemhtml.js begin */
block('checkbox').elem('text')(
    tag()('span'),
    addAttrs()({ role : 'presentation' })
);

/* ../../common.blocks/checkbox/__text/checkbox__text.bemhtml.js end */

/* ../../common.blocks/checkbox/_type/checkbox_type_button.bemhtml.js begin */
block('checkbox').mod('type', 'button')(
    content()(function() {
        var ctx = this.ctx,
            mods = this.mods;

        return [{
            block : 'button',
            mods : {
                togglable : 'check',
                checked : mods.checked,
                disabled : mods.disabled,
                theme : mods.theme,
                size : mods.size
            },
            attrs : {
                role : 'checkbox',
                'aria-pressed' : undefined,
                'aria-checked' : String(!!mods.checked)
            },
            title : ctx.title,
            content : [
                ctx.icon,
                typeof ctx.text !== 'undefined'?
                    { elem : 'text', content : ctx.text } :
                    ''
            ]
        }, {
            block : 'checkbox',
            elem : 'control',
            checked : mods.checked,
            disabled : mods.disabled,
            name : ctx.name,
            val : ctx.val
        }];
    })
);

/* ../../common.blocks/checkbox/_type/checkbox_type_button.bemhtml.js end */

/* ../../common.blocks/checkbox-group/checkbox-group.bemhtml.js begin */
block('checkbox-group')(
    tag()('span'),

    addAttrs()({ role : 'group' }),

    js()(true),

    addMix()([{ block : 'control-group' }]),

    content()(function() {
        var mods = this.mods,
            ctx = this.ctx,
            val = ctx.val,
            isValDef = typeof val !== 'undefined';

        if(isValDef && !Array.isArray(val)) throw Error('checkbox-group: val must be an array');

        return (ctx.options || []).map(function(option, i) {
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
                    name : ctx.name,
                    val : option.val,
                    text : option.text,
                    title : option.title,
                    icon : option.icon
                }
            ];
        });
    })
);

/* ../../common.blocks/checkbox-group/checkbox-group.bemhtml.js end */

/* ../../common.blocks/control-group/control-group.bemhtml.js begin */
block('control-group').addAttrs()({ role : 'group' });

/* ../../common.blocks/control-group/control-group.bemhtml.js end */

/* ../../common.blocks/dropdown/dropdown.bemhtml.js begin */
block('dropdown')(
    replace()(function() {
        return [{ elem : 'popup' }, { elem : 'switcher' }];
    }),
    def()(function() {
        var ctx = this.ctx;

        ctx.js = this.extend(apply('js'), ctx.js);
        return applyNext({ _dropdown : ctx, _popupId : this.generateId() });
    }),
    js()(function() {
        return { id : this.generateId() };
    }),
    elem('switcher').replace()(function() {
        var dropdown = this._dropdown,
            switcher = dropdown.switcher;

        switcher.block && (switcher.mix = apply('mix'));

        return switcher;
    }),
    elem('switcher').mix()(function() {
        var dropdown = this._dropdown;

        return [dropdown].concat(dropdown.switcher.mix || [], dropdown.mix || [], {
            block : this.block,
            elem : this.elem,
            elemMods : { switcher : this.mods.switcher },
            js : true
        });
    }),
    elem('popup').replace()(function() {
        var dropdown = this._dropdown,
            popup = dropdown.popup;

        if(this.isSimple(popup) || popup.block !== 'popup') {
            popup = { block : 'popup', content : popup };
        }

        var popupMods = popup.mods || (popup.mods = {}),
            popupAttrs = popup.attrs || (popup.attrs = {});
        popupMods.theme || (popupMods.theme = this.mods.theme);
        popupMods.hasOwnProperty('autoclosable') || (popupMods.autoclosable = true);

        popupMods.target = 'anchor';
        popupAttrs.id = this._popupId;

        popup.mix = [dropdown].concat(popup.mix || []);

        return popup;
    })
);

/* ../../common.blocks/dropdown/dropdown.bemhtml.js end */

/* ../../common.blocks/popup/popup.bemhtml.js begin */
block('popup')(
    js()(function() {
        var ctx = this.ctx;
        return {
            mainOffset : ctx.mainOffset,
            secondaryOffset : ctx.secondaryOffset,
            viewportOffset : ctx.viewportOffset,
            directions : ctx.directions,
            zIndexGroupLevel : ctx.zIndexGroupLevel
        };
    }),
    addAttrs()({ 'aria-hidden' : 'true' })
);

/* ../../common.blocks/popup/popup.bemhtml.js end */

/* ../../common.blocks/dropdown/_switcher/dropdown_switcher_button.bemhtml.js begin */
block('dropdown').mod('switcher', 'button').elem('switcher').replace()(function() {
    var dropdown = this._dropdown,
        switcher = dropdown.switcher;

    if(Array.isArray(switcher)) return switcher;

    var res = this.isSimple(switcher)?
        { block : 'button', text : switcher } :
        switcher;

    if(res.block === 'button') {
        var resMods = res.mods || (res.mods = {}),
            resAttrs = res.attrs || (res.attrs = {}),
            dropdownMods = this.mods;
        resMods.size || (resMods.size = dropdownMods.size);
        resMods.theme || (resMods.theme = dropdownMods.theme);
        resMods.disabled = dropdownMods.disabled;

        resAttrs['aria-haspopup'] = 'true';
        resAttrs['aria-controls'] = this._popupId;
        resAttrs['aria-expanded'] = 'false';

        res.mix = apply('mix');
    }

    return res;
});

/* ../../common.blocks/dropdown/_switcher/dropdown_switcher_button.bemhtml.js end */

/* ../../common.blocks/dropdown/_switcher/dropdown_switcher_link.bemhtml.js begin */
block('dropdown').mod('switcher', 'link').elem('switcher').replace()(function() {
    var dropdown = this._dropdown,
        switcher = dropdown.switcher;

    if(Array.isArray(switcher)) return switcher;

    var res = this.isSimple(switcher)?
        { block : 'link', mods : { pseudo : true }, content : switcher } :
        switcher;

    if(res.block === 'link') {
        var resMods = res.mods || (res.mods = {}),
            resAttrs = res.attrs || (res.attrs = {}),
            dropdownMods = this.mods;
        resMods.theme || (resMods.theme = dropdownMods.theme);
        resMods.disabled = dropdownMods.disabled;

        resAttrs['aria-haspopup'] = 'true';
        resAttrs['aria-controls'] = this._popupId;
        resAttrs['aria-expanded'] = 'false';

        res.mix = apply('mix');
    }

    return res;
});

/* ../../common.blocks/dropdown/_switcher/dropdown_switcher_link.bemhtml.js end */

/* ../../common.blocks/link/link.bemhtml.js begin */
block('link')(
    def()(function() {
        var ctx = this.ctx;
        typeof ctx.url === 'object' && // url could contain bemjson
            (ctx.url = this.reapply(ctx.url));
        return applyNext();
    }),

    tag()('a'),

    js()(true),

    // NOTE: mix below is to satisfy interface of `control`
    addMix()([{ elem : 'control' }]),

    addAttrs()(function() {
        var ctx = this.ctx,
            attrs = { role : 'link' },
            tabIndex;

        if(!this.mods.disabled) {
            if(ctx.url) {
                attrs.href = ctx.url;
                tabIndex = ctx.tabIndex;
            } else {
                tabIndex = ctx.tabIndex || 0;
            }
        } else {
            attrs['aria-disabled'] = 'true';
        }

        typeof tabIndex === 'undefined' || (attrs.tabindex = tabIndex);

        ctx.title && (attrs.title = ctx.title);
        ctx.target && (attrs.target = ctx.target);

        return attrs;
    }),

    mod('disabled', true)
        .js()(function() {
            return this.extend(applyNext(), { url : this.ctx.url });
        })
);

/* ../../common.blocks/link/link.bemhtml.js end */

/* ../../common.blocks/link/_pseudo/link_pseudo.bemhtml.js begin */
block('link').mod('pseudo', true).match(function() { return !this.ctx.url; })(
    tag()('span'),
    addAttrs()(function() {
        return this.extend(applyNext(), { role : 'button' });
    })
);

/* ../../common.blocks/link/_pseudo/link_pseudo.bemhtml.js end */

/* ../../common.blocks/image/image.bemhtml.js begin */
block('image')(
    addAttrs()({ role : 'img' }),

    tag()('span'),

    match(function() { return typeof this.ctx.content === 'undefined'; })(
        tag()('img'),
        addAttrs()(function() {
            var ctx = this.ctx;
            return this.extend(applyNext(),
                {
                    role : undefined,
                    src : ctx.url,
                    width : ctx.width,
                    height : ctx.height,
                    alt : ctx.alt,
                    title : ctx.title
                });
        })
    )
);

/* ../../common.blocks/image/image.bemhtml.js end */

/* ../../common.blocks/input/input.bemhtml.js begin */
block('input')(
    tag()('span'),
    js()(true),
    def()(function() {
        return applyNext({ _input : this.ctx });
    }),
    content()({ elem : 'box', content : { elem : 'control' } })
);

/* ../../common.blocks/input/input.bemhtml.js end */

/* ../../common.blocks/input/__box/input__box.bemhtml.js begin */
block('input').elem('box').tag()('span');

/* ../../common.blocks/input/__box/input__box.bemhtml.js end */

/* ../../common.blocks/input/__control/input__control.bemhtml.js begin */
block('input').elem('control')(
    tag()('input'),

    addAttrs()(function() {
        var input = this._input,
            attrs = {
                id : input.id,
                name : input.name,
                value : input.val,
                maxlength : input.maxLength,
                tabindex : input.tabIndex,
                placeholder : input.placeholder
            };

        input.autocomplete === false && (attrs.autocomplete = 'off');
        this.mods.disabled && (attrs.disabled = 'disabled');

        return attrs;
    })
);

/* ../../common.blocks/input/__control/input__control.bemhtml.js end */

/* ../../common.blocks/input/_has-clear/input_has-clear.bemhtml.js begin */
block('input').mod('has-clear', true).elem('box')
    .content()(function() {
        return [this.ctx.content, { elem : 'clear' }];
    });

/* ../../common.blocks/input/_has-clear/input_has-clear.bemhtml.js end */

/* ../../common.blocks/input/__clear/input__clear.bemhtml.js begin */
block('input').elem('clear').tag()('span');

/* ../../common.blocks/input/__clear/input__clear.bemhtml.js end */

/* ../../common.blocks/input/_type/input_type_password.bemhtml.js begin */
block('input').mod('type', 'password').elem('control').attrs()(function() {
    return this.extend(applyNext(), { type : 'password' });
});

/* ../../common.blocks/input/_type/input_type_password.bemhtml.js end */

/* ../../common.blocks/input/_type/input_type_search.bemhtml.js begin */
block('input').mod('type', 'search').elem('control').attrs()(function() {
    return this.extend(applyNext(), { type : 'search' });
});

/* ../../common.blocks/input/_type/input_type_search.bemhtml.js end */

/* ../../common.blocks/menu/menu.bemhtml.js begin */
block('menu')(
    def()(function() {
        var ctx = this.ctx,
            mods = this.mods,
            firstItem,
            checkedItems = [];

        if(ctx.content) {
            var isValDef = typeof ctx.val !== 'undefined',
                containsVal = function(val) {
                    return isValDef &&
                        (mods.mode === 'check'?
                            ctx.val.indexOf(val) > -1 :
                            ctx.val === val);
                },
                iterateItems = function(content) {
                    var i = 0, itemOrGroup;
                    while(itemOrGroup = content[i++]) {
                        if(itemOrGroup.elem === 'item') {
                            firstItem || (firstItem = itemOrGroup);
                            if(containsVal(itemOrGroup.val)) {
                                (itemOrGroup.elemMods = itemOrGroup.elemMods || {}).checked = true;
                                checkedItems.push(itemOrGroup);
                            }
                        } else if(itemOrGroup.content) { // menu__group
                            iterateItems(itemOrGroup.content);
                        }
                    }
                };

            if(!Array.isArray(ctx.content)) throw Error('menu: content must be an array of the menu items');

            iterateItems(ctx.content);
        }

        return applyNext({
            _firstItem : firstItem,
            _checkedItems : checkedItems,
            _menuMods : mods
        });
    }),
    attrs()(function() {
        var attrs = { role : 'menu' };

        this.mods.disabled?
            attrs['aria-disabled'] = 'true' :
            attrs.tabindex = 0;

        // extend in backwards order:
        // bemjson has more priority
        return this.extend(attrs, applyNext());
    }),
    js()(true),
    addMix()({ elem : 'control' }),
    mod('disabled', true)
        .js()(function() {
            return this.extend(applyNext(), { tabIndex : 0 });
        })
);

/* ../../common.blocks/menu/menu.bemhtml.js end */

/* ../../common.blocks/menu/_focused/menu_focused.bemhtml.js begin */
block('menu').mod('focused', true).js()(function() {
    return this.extend(applyNext(), { lazyInit : false });
});

/* ../../common.blocks/menu/_focused/menu_focused.bemhtml.js end */

/* ../../common.blocks/menu/__item/menu__item.bemhtml.js begin */
block('menu').elem('item')(
    def().match(function() { return this._menuMods; })(function() {
        var elemMods = this.elemMods;
        elemMods.theme = elemMods.theme || this._menuMods.theme;
        elemMods.disabled = elemMods.disabled || this._menuMods.disabled;
        return applyNext();
    }),
    addJs()(function() {
        return { val : this.ctx.val };
    }),
    addAttrs()(function(){
        var elemMods = this.elemMods,
            menuMode = this._menuMods && this._menuMods.mode,
            a = applyNext(),
            role = (a && a.role) || (menuMode?
                        (menuMode === 'check'? 'menuitemcheckbox' : 'menuitemradio') :
                        'menuitem'),
            attrs = {
                role : role,
                id : this.ctx.id || this.generateId(),
                'aria-disabled' : elemMods.disabled && 'true',
                'aria-checked' : menuMode && String(!!elemMods.checked)
            };

        return attrs;
    })
);

/* ../../common.blocks/menu/__item/menu__item.bemhtml.js end */

/* ../../common.blocks/menu/__group/menu__group.bemhtml.js begin */
block('menu').elem('group')(
    addAttrs()({ role : 'group' }),
    match(function() { return typeof this.ctx.title !== 'undefined'; })(
        addAttrs()(function() {
            return this.extend(applyNext(), {
                'aria-label' : undefined,
                'aria-labelledby' : this.generateId()
            });
        }),
        content()(function() {
            return [
                {
                    elem : 'group-title',
                    attrs : {
                        role : 'presentation',
                        id : this.generateId()
                    },
                    content : this.ctx.title
                },
                applyNext()
            ];
        })
    )
);

/* ../../common.blocks/menu/__group/menu__group.bemhtml.js end */

/* ../../common.blocks/menu/_mode/menu_mode_radio.bemhtml.js begin */
block('menu')
    .mod('mode', 'radio')
    .match(function() {
        return this._firstItem && this._checkedItems && !this._checkedItems.length;
    })
    .def()(function() {
        (this._firstItem.elemMods || (this._firstItem.elemMods = {})).checked = true;
        return applyNext();
    });

/* ../../common.blocks/menu/_mode/menu_mode_radio.bemhtml.js end */

/* ../../common.blocks/menu/__item/_type/menu__item_type_link.bemhtml.js begin */
block('menu').elem('item').elemMod('type', 'link').elemMod('disabled', true).match(function() {
    return !this._menuItemDisabled;
}).def()(function() {
    return applyNext({ _menuItemDisabled : true });
});

block('link').match(function() {
    return this._menuItemDisabled;
}).def()(function() {
    delete this._menuItemDisabled;
    this.mods.disabled = true;
    return applyNext();
});

/* ../../common.blocks/menu/__item/_type/menu__item_type_link.bemhtml.js end */

/* ../../common.blocks/modal/modal.bemhtml.js begin */
block('modal')(
    js()(true),

    addMix()(function() {
        return {
            block : 'popup',
            js : { zIndexGroupLevel : this.ctx.zIndexGroupLevel || 20 },
            mods : { autoclosable : this.mods.autoclosable }
        };
    }),

    addAttrs()({
        role : 'dialog',
        'aria-hidden' : 'true'
    }),

    content()(function() {
        return {
            elem : 'table',
            content : {
                elem : 'cell',
                content : {
                    elem : 'content',
                    content : applyNext()
                }
            }
        };
    })
);

/* ../../common.blocks/modal/modal.bemhtml.js end */

/* ../../common.blocks/progressbar/progressbar.bemhtml.js begin */
block('progressbar')(
    def()(function() {
        return applyNext({ _val : this.ctx.val || 0 });
    }),

    js()(function(){
        return { val : this._val };
    }),

    addAttrs()(function() {
        return {
            role : 'progressbar',
            'aria-valuenow' : this._val + '%' /* NOTE: JAWS doesn't add 'percent' automatically */
        };
    }),

    content()(
        function() {
            return {
                elem : 'bar',
                attrs : { style : 'width:' + this._val + '%' }
            };
        },
        match(function() { return typeof this.ctx.content !== 'undefined'; })(function() {
            return this.ctx.content;
        })
    )
);

/* ../../common.blocks/progressbar/progressbar.bemhtml.js end */

/* ../../common.blocks/radio/radio.bemhtml.js begin */
block('radio')(
    tag()('label'),
    js()(true),
    content()(function() {
        var ctx = this.ctx;
        return [
            {
                elem : 'box',
                content : {
                    elem : 'control',
                    checked : this.mods.checked,
                    disabled : this.mods.disabled,
                    name : ctx.name,
                    val : ctx.val
                }
            },
            ctx.text && {
                elem : 'text',
                content : ctx.text
            }
        ];
    })
);

/* ../../common.blocks/radio/radio.bemhtml.js end */

/* ../../common.blocks/radio/__box/radio__box.bemhtml.js begin */
block('radio').elem('box').tag()('span');

/* ../../common.blocks/radio/__box/radio__box.bemhtml.js end */

/* ../../common.blocks/radio/__control/radio__control.bemhtml.js begin */
block('radio').elem('control')(
    tag()('input'),

    addAttrs()(function() {
        // NOTE: don't remove autocomplete attribute, otherwise js and DOM may be desynced
        var ctx = this.ctx,
            attrs = {
                type : 'radio',
                autocomplete : 'off',
                name : ctx.name,
                value : ctx.val
            };

        ctx.checked && (attrs.checked = 'checked');
        ctx.disabled && (attrs.disabled = 'disabled');

        return attrs;
    })
);

/* ../../common.blocks/radio/__control/radio__control.bemhtml.js end */

/* ../../common.blocks/radio/__text/radio__text.bemhtml.js begin */
block('radio').elem('text')(
    tag()('span'),
    addAttrs()(function() {
        return { role : 'presentation' };
    })
);

/* ../../common.blocks/radio/__text/radio__text.bemhtml.js end */

/* ../../common.blocks/radio/_type/radio_type_button.bemhtml.js begin */
block('radio').mod('type', 'button')(
    content()(function() {
        var ctx = this.ctx,
            mods = this.mods;

        return [{
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
            title : ctx.title,
            content : [
                ctx.icon,
                typeof ctx.text !== 'undefined'?
                    { elem : 'text', content : ctx.text } :
                    ''
            ]
        }, {
            block : 'radio',
            elem : 'control',
            checked : mods.checked,
            disabled : mods.disabled,
            name : ctx.name,
            val : ctx.val
        }];
    })
);

/* ../../common.blocks/radio/_type/radio_type_button.bemhtml.js end */

/* ../../common.blocks/radio-group/radio-group.bemhtml.js begin */
block('radio-group')(
    tag()('span'),

    addAttrs()({ role : 'radiogroup' }),

    js()(true),

    addMix()([{ block : 'control-group' }]),

    content()(function() {
        var mods = this.mods,
            ctx = this.ctx,
            isValDef = typeof ctx.val !== 'undefined';

        return (ctx.options || []).map(function(option, i) {
            return [
                !!i && !mods.type && { tag : 'br' },
                {
                    block : 'radio',
                    mods : {
                        type : mods.type,
                        mode : mods.mode,
                        theme : mods.theme,
                        size : mods.size,
                        checked : isValDef && ctx.val === option.val,
                        disabled : option.disabled || mods.disabled
                    },
                    name : ctx.name,
                    val : option.val,
                    text : option.text,
                    title : option.title,
                    icon : option.icon
                }
            ];
        });
    })
);

/* ../../common.blocks/radio-group/radio-group.bemhtml.js end */

/* ../../common.blocks/radio-group/_mode/radio-group_mode_radio-check.bemhtml.js begin */
block('radio-group').mod('mode', 'radio-check')(
    def()(function() {
        if(this.mods.type !== 'button')
            throw Error('Modifier mode=radio-check can be only with modifier type=button');

        return applyNext();
    })
);

/* ../../common.blocks/radio-group/_mode/radio-group_mode_radio-check.bemhtml.js end */

/* ../../common.blocks/select/select.bemhtml.js begin */
block('select')(
    def().match(function() { return !this._select; })(function() { // TODO: check BEM-XJST for proper applyNext
        if(!this.mods.mode) throw Error('Can\'t build select without mode modifier');

        var _this = this,
            ctx = this.ctx,
            isValDef = typeof ctx.val !== 'undefined',
            isModeCheck = this.mods.mode === 'check',
            firstOption, checkedOptions = [],
            optionIds = [],
            containsVal = function(val) {
                return isValDef &&
                    (isModeCheck?
                        ctx.val.indexOf(val) > -1 :
                        ctx.val === val);
            },
            iterateOptions = function(content) {
                var i = 0, option;
                while(option = content[i++]) {
                    if(option.group) {
                        iterateOptions(option.group);
                    } else {
                        firstOption || (firstOption = option);
                        optionIds.push(option.id = _this.identify(option));
                        if(containsVal(option.val)) {
                            option.checked = true;
                            checkedOptions.push(option);
                        }
                    }
                }
            };

        iterateOptions(ctx.options);

        return applyNext({
            _select : ctx,
            _checkedOptions : checkedOptions,
            _firstOption : firstOption,
            _optionIds : optionIds
        });
    }),

    addJs()(function() {
        var ctx = this.ctx;
        return {
            name : ctx.name,
            optionsMaxHeight : ctx.optionsMaxHeight
        };
    }),

    content()(function() {
        return [
            { elem : 'button' },
            {
                block : 'popup',
                mods : { target : 'anchor', theme : this.mods.theme, autoclosable : true },
                directions : ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
                content : { block : this.block, mods : this.mods, elem : 'menu' }
            }
        ];
    })
);

/* ../../common.blocks/select/select.bemhtml.js end */

/* ../../common.blocks/select/_focused/select_focused.bemhtml.js begin */
block('select').mod('focused', true).js()(function() {
    return this.extend(applyNext(), { lazyInit : false });
});

/* ../../common.blocks/select/_focused/select_focused.bemhtml.js end */

/* ../../common.blocks/select/__control/select__control.bemhtml.js begin */
block('select').elem('control')(
    tag()('input'),
    addAttrs()(function() {
        return {
            type : 'hidden',
            name : this._select.name,
            value : this.ctx.val,
            disabled : this.mods.disabled? 'disabled' : undefined,
            autocomplete : 'off'
        };
    })
);

/* ../../common.blocks/select/__control/select__control.bemhtml.js end */

/* ../../common.blocks/select/__button/select__button.bemhtml.js begin */
block('select').elem('button')(
    replace()(function() {
        var select = this._select,
            mods = this.mods;

        return {
            block : 'button',
            mix : { block : this.block, elem : this.elem },
            mods : {
                size : mods.size,
                theme : mods.theme,
                view : mods.view,
                focused : mods.focused,
                disabled : mods.disabled,
                checked : mods.mode !== 'radio' && !!this._checkedOptions.length
            },
            attrs : {
                role : 'listbox',
                'aria-owns' : this._optionIds.join(' '),
                'aria-multiselectable' : mods.mode === 'check'? 'true' : undefined,
                'aria-labelledby' : this._selectTextId
            },
            id : select.id,
            tabIndex : select.tabIndex,
            content : [
                apply('content'),
                { block : 'icon', mix : { block : 'select', elem : 'tick' } }
            ]
        };
    }),
    def()(function() {
        return applyNext({ _selectTextId : this.generateId() });
    })
);

block('button').elem('text').match(function() { return this._select; })(
    addAttrs()(function() {
        return { id : this._selectTextId };
    })
);

/* ../../common.blocks/select/__button/select__button.bemhtml.js end */

/* ../../common.blocks/select/__menu/select__menu.bemhtml.js begin */
block('select').elem('menu')(
    replace()(function() {
        var mods = this.mods,
            optionToMenuItem = function(option) {
                var res = {
                        block : 'menu',
                        elem : 'item',
                        elemMods : { disabled : mods.disabled || option.disabled },
                        attrs : { role : 'option' },
                        id : option.id,
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
            mix : { block : this.block, elem : this.elem },
            mods : {
                size : mods.size,
                theme : mods.theme,
                disabled : mods.disabled,
                mode : mods.mode
            },
            val : this._select.val,
            attrs : { role : undefined, tabindex : undefined },
            content : this._select.options.map(function(optionOrGroup) {
                return optionOrGroup.group?
                    {
                        elem : 'group',
                        title : optionOrGroup.title,
                        content : optionOrGroup.group.map(optionToMenuItem)
                    } :
                    optionToMenuItem(optionOrGroup);
            })
        };
    })
);

/* ../../common.blocks/select/__menu/select__menu.bemhtml.js end */

/* ../../common.blocks/select/_mode/select_mode_check.bemhtml.js begin */
block('select').mod('mode', 'check')(
    js()(function() {
        return this.extend(applyNext(), { text : this.ctx.text });
    }),

    elem('button').content()(function() {
        var checkedOptions = this._checkedOptions;
        return [
            {
                elem : 'text',
                content : checkedOptions.length === 1?
                    checkedOptions[0].text :
                    checkedOptions.reduce(function(res, option) {
                        return res + (res? ', ' : '') + (option.checkedText || option.text);
                    }, '') ||
                        this._select.text
            }
            // TODO: with icons
        ];
    }),

    match(function() { return this._checkedOptions[0]; }).content()(function() {
        var res = this._checkedOptions.map(function(option) {
            return {
                elem : 'control',
                val : option.val
            };
        });
        res.push(applyNext());
        return res;
    })
);

/* ../../common.blocks/select/_mode/select_mode_check.bemhtml.js end */

/* ../../common.blocks/select/_mode/select_mode_radio-check.bemhtml.js begin */
block('select').mod('mode', 'radio-check')(
    js()(function() {
        return this.extend(applyNext(), { text : this.ctx.text });
    }),

    elem('button').content()(function() {
        return [
            { elem : 'text', content : (this._checkedOptions[0] || this._select).text }
            // TODO: with icons
        ];
    }),

    match(function() { return this._checkedOptions[0]; })(
        content()(function() {
            return [
                {
                    elem : 'control',
                    val : this._checkedOptions[0].val
                },
                applyNext()
            ];
        })
    )
);

/* ../../common.blocks/select/_mode/select_mode_radio-check.bemhtml.js end */

/* ../../common.blocks/select/_mode/select_mode_radio.bemhtml.js begin */
block('select').mod('mode', 'radio')(
    def().match(function() { return this._checkedOptions; })(function() {
        var checkedOptions = this._checkedOptions,
            firstOption = this._firstOption;
        if(firstOption && !checkedOptions.length) {
            firstOption.checked = true;
            checkedOptions = [firstOption];
        }
        return applyNext({ _checkedOption : checkedOptions[0] });
    }),

    content()(function() {
        return [
            {
                elem : 'control',
                val : this._checkedOption.val
            },
            applyNext()
        ];
    }),

    elem('button').content()(function() {
        return [
            { elem : 'text', content : this._checkedOption.text }
            // TODO: with icons
        ];
    })
);

/* ../../common.blocks/select/_mode/select_mode_radio.bemhtml.js end */

/* ../../common.blocks/spin/spin.bemhtml.js begin */
block('spin')(
    tag()('span')
);

/* ../../common.blocks/spin/spin.bemhtml.js end */

/* ../../common.blocks/textarea/textarea.bemhtml.js begin */
block('textarea')(
    js()(true),
    tag()('textarea'),

    // NOTE: mix below is to satisfy interface of `control`
    addMix()({ elem : 'control' }),

    addAttrs()(function() {
        var ctx = this.ctx,
            attrs = {
                id : ctx.id,
                name : ctx.name,
                tabindex : ctx.tabIndex,
                placeholder : ctx.placeholder
            };

        ctx.autocomplete === false && (attrs.autocomplete = 'off');
        this.mods.disabled && (attrs.disabled = 'disabled');

        return attrs;
    }),
    content()(function() {
        return this.ctx.val;
    })
);

/* ../../common.blocks/textarea/textarea.bemhtml.js end */

/* ../../design/common.blocks/progressbar/_theme/progressbar_theme_simple.bemhtml.js begin */
block('progressbar').mod('theme', 'simple').content()(function() {
    return [
        {
            elem : 'box',
            content : applyNext()
        },
        {
            elem : 'text',
            content : this.ctx.val || 0
        }
    ];
});

/* ../../design/common.blocks/progressbar/_theme/progressbar_theme_simple.bemhtml.js end */
