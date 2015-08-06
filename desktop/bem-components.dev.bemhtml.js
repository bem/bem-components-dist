(function(g) {
  var __bem_xjst = function(exports) {
     var $$mode = "", $$block = "", $$elem = "", $$elemMods = null, $$mods = null;

var __$ref = {};

function apply(ctx) {
    ctx = ctx || this;
    $$mods = ctx["mods"];
    $$elemMods = ctx["elemMods"];
    $$elem = ctx["elem"];
    $$block = ctx["block"];
    $$mode = ctx["_mode"];
    try {
        return applyc(ctx, __$ref);
    } catch (e) {
        e.xjstContext = ctx;
        throw e;
    }
}

exports.apply = apply;

function applyc(__$ctx, __$ref) {
    var __$t = $$mode;
    if (__$t === "content") {
        var __$r = __$g0(__$ctx, __$ref);
        if (__$r !== __$ref) return __$r;
    } else if (__$t === "attrs") {
        var __$r = __$g1(__$ctx, __$ref);
        if (__$r !== __$ref) return __$r;
    } else if (__$t === "mix") {
        var __$t = $$block;
        if (__$t === "textarea") {
            if (!$$elem) {
                return {
                    elem: "control"
                };
            }
        } else if (__$t === "button") {
            if (!$$elem) {
                return {
                    elem: "control"
                };
            }
        } else if (__$t === "menu") {
            if (!$$elem) {
                return [ {
                    elem: "control"
                } ];
            }
        } else if (__$t === "radio-group") {
            if (!$$elem) {
                return [ {
                    block: "control-group"
                } ];
            }
        } else if (__$t === "modal") {
            if (!$$elem) {
                return {
                    block: "popup",
                    js: {
                        zIndexGroupLevel: __$ctx.ctx.zIndexGroupLevel || 20
                    },
                    mods: {
                        autoclosable: $$mods.autoclosable
                    }
                };
            }
        } else if (__$t === "link") {
            if (!$$elem) {
                return [ {
                    elem: "control"
                } ];
            }
        } else if (__$t === "checkbox-group") {
            if (!$$elem) {
                return [ {
                    block: "control-group"
                } ];
            }
        }
        return undefined;
    } else if (__$t === "tag") {
        var __$r = __$g2(__$ctx, __$ref);
        if (__$r !== __$ref) return __$r;
    } else if (__$t === "js") {
        var __$r = __$g3(__$ctx, __$ref);
        if (__$r !== __$ref) return __$r;
    } else if (__$t === "default") {
        var __$r = __$g4(__$ctx, __$ref);
        if (__$r !== __$ref) return __$r;
    } else if (__$t === "bem") {
        var __$t = $$block;
        if (__$t === "page") {
            var __$t = $$elem;
            if (__$t === "js") {
                return false;
            } else if (__$t === "link") {
                return false;
            } else if (__$t === "css") {
                return false;
            } else if (__$t === "favicon") {
                return false;
            } else if (__$t === "meta") {
                return false;
            } else if (__$t === "head") {
                return false;
            }
        }
        return undefined;
        if ($$block === "ua" && !$$elem) {
            return false;
        }
    } else if (__$t === "cls") {
        return undefined;
    } else if (__$t === "") {
        if (__$ctx.ctx && __$ctx.ctx._vow && (__$ctx.__$a1 & 1024) === 0) {
            var __$r = __$b160(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (__$ctx.isSimple(__$ctx.ctx)) {
            var __$r = __$b161(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (!__$ctx.ctx) {
            var __$r = __$b162(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (__$ctx.isArray(__$ctx.ctx)) {
            var __$r = __$b163(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        var __$r = __$b164(__$ctx, __$ref);
        if (__$r !== __$ref) return __$r;
    }
}

[ function(exports, context) {
    var undef, BEM_ = {}, toString = Object.prototype.toString, slice = Array.prototype.slice, isArray = Array.isArray || function(obj) {
        return toString.call(obj) === "[object Array]";
    }, SHORT_TAGS = {
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
        meta: 1,
        param: 1,
        source: 1,
        wbr: 1
    }, resetApplyNext = context.resetApplyNext || function() {};
    (function(BEM, undefined) {
        var MOD_DELIM = "_", ELEM_DELIM = "__", NAME_PATTERN = "[a-zA-Z0-9-]+";
        function buildModPostfix(modName, modVal) {
            var res = MOD_DELIM + modName;
            if (modVal !== true) res += MOD_DELIM + modVal;
            return res;
        }
        function buildBlockClass(name, modName, modVal) {
            var res = name;
            if (modVal) res += buildModPostfix(modName, modVal);
            return res;
        }
        function buildElemClass(block, name, modName, modVal) {
            var res = buildBlockClass(block) + ELEM_DELIM + name;
            if (modVal) res += buildModPostfix(modName, modVal);
            return res;
        }
        BEM.INTERNAL = {
            NAME_PATTERN: NAME_PATTERN,
            MOD_DELIM: MOD_DELIM,
            ELEM_DELIM: ELEM_DELIM,
            buildModPostfix: buildModPostfix,
            buildClass: function(block, elem, modName, modVal) {
                var typeOfModName = typeof modName;
                if (typeOfModName === "string" || typeOfModName === "boolean") {
                    var typeOfModVal = typeof modVal;
                    if (typeOfModVal !== "string" && typeOfModVal !== "boolean") {
                        modVal = modName;
                        modName = elem;
                        elem = undef;
                    }
                } else if (typeOfModName !== "undefined") {
                    modName = undef;
                } else if (elem && typeof elem !== "string") {
                    elem = undef;
                }
                if (!(elem || modName)) {
                    return block;
                }
                return elem ? buildElemClass(block, elem, modName, modVal) : buildBlockClass(block, modName, modVal);
            },
            buildModsClasses: function(block, elem, mods) {
                var res = "";
                if (mods) {
                    var modName;
                    for (modName in mods) {
                        if (!mods.hasOwnProperty(modName)) continue;
                        var modVal = mods[modName];
                        if (!modVal && modVal !== 0) continue;
                        typeof modVal !== "boolean" && (modVal += "");
                        res += " " + (elem ? buildElemClass(block, elem, modName, modVal) : buildBlockClass(block, modName, modVal));
                    }
                }
                return res;
            },
            buildClasses: function(block, elem, mods) {
                var res = "";
                res += elem ? buildElemClass(block, elem) : buildBlockClass(block);
                res += this.buildModsClasses(block, elem, mods);
                return res;
            }
        };
    })(BEM_);
    context.BEMContext = BEMContext;
    function BEMContext(context, apply_) {
        this.ctx = typeof context === "undefined" ? "" : context;
        this.apply = apply_;
        this._str = "";
        var _this = this;
        this._buf = {
            push: function() {
                var chunks = slice.call(arguments).join("");
                _this._str += chunks;
            },
            join: function() {
                return this._str;
            }
        };
        this._ = this;
        this._start = true;
        this._mode = "";
        this._listLength = 0;
        this._notNewList = false;
        this.position = 0;
        this.block = undef;
        this.elem = undef;
        this.mods = undef;
        this.elemMods = undef;
        this._resetApplyNext = resetApplyNext;
    }
    BEMContext.prototype.isArray = isArray;
    BEMContext.prototype.isSimple = function isSimple(obj) {
        if (!obj || obj === true) return true;
        var t = typeof obj;
        return t === "string" || t === "number";
    };
    BEMContext.prototype.isShortTag = function isShortTag(t) {
        return SHORT_TAGS.hasOwnProperty(t);
    };
    BEMContext.prototype.extend = function extend(o1, o2) {
        if (!o1 || !o2) return o1 || o2;
        var res = {}, n;
        for (n in o1) o1.hasOwnProperty(n) && (res[n] = o1[n]);
        for (n in o2) o2.hasOwnProperty(n) && (res[n] = o2[n]);
        return res;
    };
    var cnt = 0, id = +new Date(), expando = "__" + id, get = function() {
        return "uniq" + id + ++cnt;
    };
    BEMContext.prototype.identify = function(obj, onlyGet) {
        if (!obj) return get();
        if (onlyGet || obj[expando]) {
            return obj[expando];
        } else {
            return obj[expando] = get();
        }
    };
    BEMContext.prototype.xmlEscape = function xmlEscape(str) {
        return (str + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };
    BEMContext.prototype.attrEscape = function attrEscape(str) {
        return (str + "").replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    };
    BEMContext.prototype.jsAttrEscape = function jsAttrEscape(str) {
        return (str + "").replace(/&/g, "&amp;").replace(/'/g, "&#39;");
    };
    BEMContext.prototype.BEM = BEM_;
    BEMContext.prototype.isFirst = function isFirst() {
        return this.position === 1;
    };
    BEMContext.prototype.isLast = function isLast() {
        return this.position === this._listLength;
    };
    BEMContext.prototype.generateId = function generateId() {
        return this.identify(this.ctx);
    };
    var oldApply = exports.apply;
    exports.apply = BEMContext.apply = function BEMContext_apply(context) {
        var ctx = new BEMContext(context || this, oldApply);
        ctx.apply();
        return ctx._str;
    };
    BEMContext.prototype.reapply = BEMContext.apply;
}, function() {
    (function(global, bem_) {
        if (bem_.I18N) {
            return;
        }
        global.BEM = bem_;
        var i18n = global.BEM.I18N = function(keyset, key) {
            return key;
        };
        i18n.keyset = function() {
            return i18n;
        };
        i18n.key = function(key) {
            return key;
        };
        i18n.lang = function() {
            return;
        };
    })(this, typeof BEM === "undefined" ? {} : BEM);
} ].forEach(function(fn) {
    fn(exports, this);
}, {
    recordExtensions: function(ctx) {
        ctx["__$a0"] = 0;
        ctx["_checkedOption"] = undefined;
        ctx["_mode"] = undefined;
        ctx["ctx"] = undefined;
        ctx["_select"] = undefined;
        ctx["_checkedOptions"] = undefined;
        ctx["_firstOption"] = undefined;
        ctx["_menuItemDisabled"] = undefined;
        ctx["_firstItem"] = undefined;
        ctx["_checkedItems"] = undefined;
        ctx["_menuMods"] = undefined;
        ctx["_input"] = undefined;
        ctx["__$a1"] = 0;
        ctx["_isRealButton"] = undefined;
        ctx["_attach"] = undefined;
        ctx["_pageInit"] = undefined;
        ctx["_str"] = undefined;
        ctx["block"] = undefined;
        ctx["elem"] = undefined;
        ctx["_notNewList"] = undefined;
        ctx["position"] = undefined;
        ctx["_listLength"] = undefined;
        ctx["_currBlock"] = undefined;
        ctx["mods"] = undefined;
        ctx["elemMods"] = undefined;
    },
    resetApplyNext: function(ctx) {
        ctx["__$a0"] = 0;
        ctx["__$a1"] = 0;
    }
});

function __$b5(__$ctx, __$ref) {
    var ctx__$77 = __$ctx.ctx, mods__$78 = $$mods;
    return [ {
        block: "button",
        mods: {
            togglable: mods__$78.mode === "radio-check" ? "check" : "radio",
            checked: mods__$78.checked,
            disabled: mods__$78.disabled,
            theme: mods__$78.theme,
            size: mods__$78.size
        },
        title: ctx__$77.title,
        content: [ ctx__$77.icon, typeof ctx__$77.text !== "undefined" ? {
            elem: "text",
            content: ctx__$77.text
        } : "" ]
    }, {
        block: "radio",
        elem: "control",
        checked: mods__$78.checked,
        disabled: mods__$78.disabled,
        name: ctx__$77.name,
        val: ctx__$77.val
    } ];
}

function __$b6(__$ctx, __$ref) {
    var ctx__$81 = __$ctx.ctx;
    return [ {
        elem: "box",
        content: {
            elem: "control",
            checked: $$mods.checked,
            disabled: $$mods.disabled,
            name: ctx__$81.name,
            val: ctx__$81.val
        }
    }, ctx__$81.text ];
}

function __$b11(__$ctx, __$ref) {
    var res__$22 = __$ctx._checkedOptions.map(function(option) {
        return {
            elem: "control",
            val: option.val
        };
    });
    res__$22.push(function __$lb__$23() {
        var __$r__$24;
        var __$l0__$25 = __$ctx.__$a0;
        __$ctx.__$a0 = __$ctx.__$a0 | 32;
        __$r__$24 = applyc(__$ctx, __$ref);
        __$ctx.__$a0 = __$l0__$25;
        return __$r__$24;
    }());
    return res__$22;
}

function __$b12(__$ctx, __$ref) {
    var checkedOptions__$26 = __$ctx._checkedOptions;
    return [ {
        elem: "text",
        content: checkedOptions__$26.length === 1 ? checkedOptions__$26[0].text : checkedOptions__$26.reduce(function(res, option) {
            return res + (res ? ", " : "") + (option.checkedText || option.text);
        }, "") || __$ctx._select.text
    } ];
}

function __$b16(__$ctx, __$ref) {
    var ctx__$195 = __$ctx.ctx, content__$196 = [ ctx__$195.icon ];
    "text" in ctx__$195 && content__$196.push({
        elem: "text",
        content: ctx__$195.text
    });
    return content__$196;
}

function __$b18(__$ctx, __$ref) {
    var mods__$74 = $$mods, ctx__$75 = __$ctx.ctx, isValDef__$76 = typeof ctx__$75.val !== "undefined";
    return (ctx__$75.options || []).map(function(option, i) {
        return [ !!i && !mods__$74.type && {
            tag: "br"
        }, {
            block: "radio",
            mods: {
                type: mods__$74.type,
                mode: mods__$74.mode,
                theme: mods__$74.theme,
                size: mods__$74.size,
                checked: isValDef__$76 && ctx__$75.val === option.val,
                disabled: option.disabled || mods__$74.disabled
            },
            name: ctx__$75.name,
            val: option.val,
            text: option.text,
            title: option.title,
            icon: option.icon
        } ];
    });
}

function __$b22(__$ctx, __$ref) {
    var content__$160 = __$ctx.ctx.content;
    if (Array.isArray(content__$160)) return content__$160;
    var res__$161 = __$ctx.isSimple(content__$160) ? {
        block: "button",
        text: content__$160
    } : content__$160;
    if (res__$161.block === "button") {
        var resMods__$162 = res__$161.mods || (res__$161.mods = {}), dropdownMods__$163 = $$mods;
        resMods__$162.size || (resMods__$162.size = dropdownMods__$163.size);
        resMods__$162.theme || (resMods__$162.theme = dropdownMods__$163.theme);
        resMods__$162.disabled = dropdownMods__$163.disabled;
    }
    return res__$161;
}

function __$b23(__$ctx, __$ref) {
    var content__$156 = __$ctx.ctx.content;
    if (Array.isArray(content__$156)) return content__$156;
    var res__$157 = __$ctx.isSimple(content__$156) ? {
        block: "link",
        mods: {
            pseudo: true
        },
        content: content__$156
    } : content__$156;
    if (res__$157.block === "link") {
        var resMods__$158 = res__$157.mods || (res__$157.mods = {}), dropdownMods__$159 = $$mods;
        resMods__$158.theme || (resMods__$158.theme = dropdownMods__$159.theme);
        resMods__$158.disabled = dropdownMods__$159.disabled;
    }
    return res__$157;
}

function __$b24(__$ctx, __$ref) {
    var popup__$165 = __$ctx.ctx.popup;
    if (__$ctx.isSimple(popup__$165) || popup__$165.block !== "popup") {
        popup__$165 = {
            block: "popup",
            content: popup__$165
        };
    }
    var popupMods__$166 = popup__$165.mods || (popup__$165.mods = {});
    popupMods__$166.theme || (popupMods__$166.theme = $$mods.theme);
    popupMods__$166.hasOwnProperty("autoclosable") || (popupMods__$166.autoclosable = true);
    popupMods__$166.target = "anchor";
    return [ {
        elem: "switcher",
        content: __$ctx.ctx.switcher
    }, popup__$165 ];
}

function __$b25(__$ctx, __$ref) {
    var mods__$167 = $$mods, ctx__$168 = __$ctx.ctx, val__$169 = ctx__$168.val, isValDef__$170 = typeof val__$169 !== "undefined";
    if (isValDef__$170 && !Array.isArray(val__$169)) throw Error("checkbox-group: val must be an array");
    return (ctx__$168.options || []).map(function(option, i) {
        return [ !!i && !mods__$167.type && {
            tag: "br"
        }, {
            block: "checkbox",
            mods: {
                type: mods__$167.type,
                theme: mods__$167.theme,
                size: mods__$167.size,
                checked: isValDef__$170 && val__$169.indexOf(option.val) > -1,
                disabled: option.disabled || mods__$167.disabled
            },
            name: ctx__$168.name,
            val: option.val,
            text: option.text,
            title: option.title,
            icon: option.icon
        } ];
    });
}

function __$b26(__$ctx, __$ref) {
    var ctx__$171 = __$ctx.ctx, mods__$172 = $$mods;
    return [ {
        block: "button",
        mods: {
            togglable: "check",
            checked: mods__$172.checked,
            disabled: mods__$172.disabled,
            theme: mods__$172.theme,
            size: mods__$172.size
        },
        title: ctx__$171.title,
        content: [ ctx__$171.icon, typeof ctx__$171.text !== "undefined" ? {
            elem: "text",
            content: ctx__$171.text
        } : "" ]
    }, {
        block: "checkbox",
        elem: "control",
        checked: mods__$172.checked,
        disabled: mods__$172.disabled,
        name: ctx__$171.name,
        val: ctx__$171.val
    } ];
}

function __$b27(__$ctx, __$ref) {
    var ctx__$175 = __$ctx.ctx, mods__$176 = $$mods;
    return [ {
        elem: "box",
        content: {
            elem: "control",
            checked: mods__$176.checked,
            disabled: mods__$176.disabled,
            name: ctx__$175.name,
            val: ctx__$175.val
        }
    }, ctx__$175.text ];
}

function __$b28(__$ctx, __$ref) {
    var ctx__$214 = __$ctx.ctx, button__$215 = ctx__$214.button;
    __$ctx.isSimple(button__$215) && (button__$215 = {
        block: "button",
        tag: "span",
        text: button__$215
    });
    var attachMods__$216 = $$mods, buttonMods__$217 = button__$215.mods || (button__$215.mods = {});
    [ "size", "theme", "disabled", "focused" ].forEach(function(mod) {
        buttonMods__$217[mod] || (buttonMods__$217[mod] = attachMods__$216[mod]);
    });
    return [ button__$215, {
        elem: "no-file",
        content: __$ctx.ctx.noFileText
    } ];
}

function __$b29(__$ctx, __$ref) {
    var ctx__$224 = __$ctx.ctx, cond__$225 = ctx__$224.condition.replace("<", "lt").replace(">", "gt").replace("=", "e"), hasNegation__$226 = cond__$225.indexOf("!") > -1, includeOthers__$227 = ctx__$224.msieOnly === false, hasNegationOrIncludeOthers__$228 = hasNegation__$226 || includeOthers__$227;
    return [ "<!--[if " + cond__$225 + "]>", includeOthers__$227 ? "<!" : "", hasNegationOrIncludeOthers__$228 ? "-->" : "", function __$lb__$229() {
        var __$r__$230;
        var __$l0__$231 = __$ctx.__$a1;
        __$ctx.__$a1 = __$ctx.__$a1 | 16;
        __$r__$230 = applyc(__$ctx, __$ref);
        __$ctx.__$a1 = __$l0__$231;
        return __$r__$230;
    }(), hasNegationOrIncludeOthers__$228 ? "<!--" : "", "<![endif]-->" ];
}

function __$b34(__$ctx, __$ref) {
    var ctx__$3 = __$ctx.ctx, attrs__$4 = {
        id: ctx__$3.id,
        name: ctx__$3.name,
        tabindex: ctx__$3.tabIndex,
        placeholder: ctx__$3.placeholder
    };
    ctx__$3.autocomplete === false && (attrs__$4.autocomplete = "off");
    $$mods.disabled && (attrs__$4.disabled = "disabled");
    return attrs__$4;
}

function __$b35(__$ctx, __$ref) {
    var ctx__$79 = __$ctx.ctx, attrs__$80 = {
        type: "radio",
        autocomplete: "off",
        name: ctx__$79.name,
        value: ctx__$79.val
    };
    ctx__$79.checked && (attrs__$80.checked = "checked");
    ctx__$79.disabled && (attrs__$80.disabled = "disabled");
    return attrs__$80;
}

function __$b37(__$ctx, __$ref) {
    var ctx__$180 = __$ctx.ctx, attrs__$181 = {};
    ctx__$180.target && (attrs__$181.target = ctx__$180.target);
    $$mods.disabled ? attrs__$181["aria-disabled"] = true : attrs__$181.href = ctx__$180.url;
    return __$ctx.extend(function __$lb__$182() {
        var __$r__$183;
        var __$l0__$184 = __$ctx.__$a0;
        __$ctx.__$a0 = __$ctx.__$a0 | 268435456;
        __$r__$183 = applyc(__$ctx, __$ref);
        __$ctx.__$a0 = __$l0__$184;
        return __$r__$183;
    }(), attrs__$181);
}

function __$b38(__$ctx, __$ref) {
    var ctx__$197 = __$ctx.ctx, attrs__$198 = {
        type: $$mods.type || "button",
        name: ctx__$197.name,
        value: ctx__$197.val
    };
    $$mods.disabled && (attrs__$198.disabled = "disabled");
    return __$ctx.extend(function __$lb__$199() {
        var __$r__$200;
        var __$l0__$201 = __$ctx.__$a1;
        __$ctx.__$a1 = __$ctx.__$a1 | 2;
        __$r__$200 = applyc(__$ctx, __$ref);
        __$ctx.__$a1 = __$l0__$201;
        return __$r__$200;
    }(), attrs__$198);
}

function __$b39(__$ctx, __$ref) {
    var ctx__$202 = __$ctx.ctx, attrs__$203 = {
        role: "button",
        tabindex: ctx__$202.tabIndex,
        id: ctx__$202.id,
        title: ctx__$202.title
    };
    $$mods.disabled && !__$ctx._isRealButton && (attrs__$203["aria-disabled"] = true);
    return attrs__$203;
}

function __$b43(__$ctx, __$ref) {
    var attrs__$110 = {
        role: "menu"
    };
    $$mods.disabled || (attrs__$110.tabindex = 0);
    return attrs__$110;
}

function __$b44(__$ctx, __$ref) {
    var ctx__$149 = __$ctx.ctx, attrs__$150 = {}, tabIndex__$151;
    if (!$$mods.disabled) {
        if (ctx__$149.url) {
            attrs__$150.href = ctx__$149.url;
            tabIndex__$151 = ctx__$149.tabIndex;
        } else {
            tabIndex__$151 = ctx__$149.tabIndex || 0;
        }
    }
    typeof tabIndex__$151 === "undefined" || (attrs__$150.tabindex = tabIndex__$151);
    ctx__$149.title && (attrs__$150.title = ctx__$149.title);
    ctx__$149.target && (attrs__$150.target = ctx__$149.target);
    return attrs__$150;
}

function __$b48(__$ctx, __$ref) {
    var input__$134 = __$ctx._input, attrs__$135 = {
        id: input__$134.id,
        name: input__$134.name,
        value: input__$134.val,
        maxlength: input__$134.maxLength,
        tabindex: input__$134.tabIndex,
        placeholder: input__$134.placeholder
    };
    input__$134.autocomplete === false && (attrs__$135.autocomplete = "off");
    $$mods.disabled && (attrs__$135.disabled = "disabled");
    return attrs__$135;
}

function __$b49(__$ctx, __$ref) {
    var ctx__$142 = __$ctx.ctx;
    return __$ctx.extend(function __$lb__$143() {
        var __$r__$144;
        var __$l0__$145 = __$ctx.__$a0;
        __$ctx.__$a0 = __$ctx.__$a0 | 16777216;
        __$r__$144 = applyc(__$ctx, __$ref);
        __$ctx.__$a0 = __$l0__$145;
        return __$r__$144;
    }(), {
        src: ctx__$142.url,
        width: ctx__$142.width,
        height: ctx__$142.height,
        alt: ctx__$142.alt,
        title: ctx__$142.title
    });
}

function __$b51(__$ctx, __$ref) {
    var attrs__$173 = {
        type: "checkbox",
        autocomplete: "off"
    }, ctx__$174 = __$ctx.ctx;
    attrs__$173.name = ctx__$174.name;
    attrs__$173.value = ctx__$174.val;
    ctx__$174.checked && (attrs__$173.checked = "checked");
    ctx__$174.disabled && (attrs__$173.disabled = "disabled");
    return attrs__$173;
}

function __$b52(__$ctx, __$ref) {
    var attrs__$185 = {
        type: "file"
    }, attach__$186 = __$ctx._attach;
    if (attach__$186) {
        attrs__$185.name = attach__$186.name;
        attach__$186.mods && attach__$186.mods.disabled && (attrs__$185.disabled = "disabled");
        attach__$186.tabIndex && (attrs__$185.tabindex = attach__$186.tabIndex);
    }
    return attrs__$185;
}

function __$b53(__$ctx, __$ref) {
    var attrs__$190 = {
        "aria-hidden": "true"
    }, url__$191 = __$ctx.ctx.url;
    if (url__$191) attrs__$190.style = "background-image:url(" + url__$191 + ")";
    return attrs__$190;
}

function __$b54(__$ctx, __$ref) {
    var attrs__$235 = {};
    if (__$ctx.ctx.url) {
        attrs__$235.src = __$ctx.ctx.url;
    } else if (__$ctx._nonceCsp) {
        attrs__$235.nonce = __$ctx._nonceCsp;
    }
    return attrs__$235;
}

function __$b114(__$ctx, __$ref) {
    var ctx__$53 = __$ctx.ctx;
    return {
        name: ctx__$53.name,
        optionsMaxHeight: ctx__$53.optionsMaxHeight
    };
}

function __$b127(__$ctx, __$ref) {
    var ctx__$164 = __$ctx.ctx;
    return {
        mainOffset: ctx__$164.mainOffset,
        secondaryOffset: ctx__$164.secondaryOffset,
        viewportOffset: ctx__$164.viewportOffset,
        directions: ctx__$164.directions,
        zIndexGroupLevel: ctx__$164.zIndexGroupLevel
    };
}

function __$b132(__$ctx, __$ref) {
    var checkedOptions__$8 = __$ctx._checkedOptions, firstOption__$9 = __$ctx._firstOption;
    if (firstOption__$9 && !checkedOptions__$8.length) {
        firstOption__$9.checked = true;
        checkedOptions__$8 = [ firstOption__$9 ];
    }
    var __$r__$11;
    var __$l0__$12 = __$ctx._checkedOption;
    __$ctx._checkedOption = checkedOptions__$8[0];
    var __$r__$14;
    var __$l1__$15 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 4;
    __$r__$14 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l1__$15;
    __$r__$11 = __$r__$14;
    __$ctx._checkedOption = __$l0__$12;
    return __$r__$11;
}

function __$b133(__$ctx, __$ref) {
    var mods__$40 = $$mods;
    var __$r__$42;
    var __$l0__$43 = $$mode;
    $$mode = "";
    var __$l1__$44 = __$ctx.ctx;
    __$ctx.ctx = {
        block: "button",
        mix: {
            block: $$block,
            elem: $$elem
        },
        mods: {
            size: mods__$40.size,
            theme: mods__$40.theme,
            view: mods__$40.view,
            focused: mods__$40.focused,
            disabled: mods__$40.disabled,
            checked: mods__$40.mode !== "radio" && !!__$ctx._checkedOptions.length
        },
        id: __$ctx._select.id,
        tabIndex: __$ctx._select.tabIndex,
        content: [ function __$lb__$45() {
            var __$r__$46;
            var __$l3__$47 = $$mode;
            $$mode = "content";
            __$r__$46 = applyc(__$ctx, __$ref);
            $$mode = __$l3__$47;
            return __$r__$46;
        }(), {
            block: "icon",
            mix: {
                block: "select",
                elem: "tick"
            }
        } ]
    };
    var __$r__$48;
    var __$l2__$49 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 256;
    __$r__$48 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l2__$49;
    __$r__$42 = __$r__$48;
    $$mode = __$l0__$43;
    __$ctx.ctx = __$l1__$44;
    return __$r__$42;
}

function __$b134(__$ctx, __$ref) {
    var mods__$30 = $$mods, optionToMenuItem__$31 = function(option) {
        var res__$32 = {
            block: "menu-item",
            mods: {
                disabled: mods__$30.disabled || option.disabled
            },
            val: option.val,
            js: {
                checkedText: option.checkedText
            },
            content: option.text
        };
        if (option.icon) {
            res__$32.js.text = option.text;
            res__$32.content = [ option.icon, res__$32.content ];
        }
        return res__$32;
    };
    var __$r__$34;
    var __$l0__$35 = $$mode;
    $$mode = "";
    var __$l1__$36 = __$ctx.ctx;
    __$ctx.ctx = {
        block: "menu",
        mix: {
            block: $$block,
            elem: $$elem
        },
        mods: {
            size: mods__$30.size,
            theme: mods__$30.theme,
            disabled: mods__$30.disabled,
            mode: mods__$30.mode
        },
        val: __$ctx._select.val,
        attrs: {
            tabindex: undefined
        },
        content: __$ctx._select.options.map(function(optionOrGroup) {
            return optionOrGroup.group ? {
                elem: "group",
                title: optionOrGroup.title,
                content: optionOrGroup.group.map(optionToMenuItem__$31)
            } : optionToMenuItem__$31(optionOrGroup);
        })
    };
    var __$r__$38;
    var __$l2__$39 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 128;
    __$r__$38 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l2__$39;
    __$r__$34 = __$r__$38;
    $$mode = __$l0__$35;
    __$ctx.ctx = __$l1__$36;
    return __$r__$34;
}

function __$b135(__$ctx, __$ref) {
    if (!$$mods.mode) throw Error("Can't build select without mode modifier");
    var ctx__$54 = __$ctx.ctx, isValDef__$55 = typeof ctx__$54.val !== "undefined", isModeCheck__$56 = $$mods.mode === "check", firstOption__$57, checkedOptions__$58 = [], containsVal__$59 = function(val) {
        return isValDef__$55 && (isModeCheck__$56 ? ctx__$54.val.indexOf(val) > -1 : ctx__$54.val === val);
    }, iterateOptions__$60 = function(content) {
        var i__$61 = 0, option__$62;
        while (option__$62 = content[i__$61++]) {
            if (option__$62.group) {
                iterateOptions__$60(option__$62.group);
            } else {
                firstOption__$57 || (firstOption__$57 = option__$62);
                if (containsVal__$59(option__$62.val)) {
                    option__$62.checked = true;
                    checkedOptions__$58.push(option__$62);
                }
            }
        }
    };
    iterateOptions__$60(ctx__$54.options);
    var __$r__$64;
    var __$l0__$65 = __$ctx._select;
    __$ctx._select = __$ctx.ctx;
    var __$l1__$66 = __$ctx._checkedOptions;
    __$ctx._checkedOptions = checkedOptions__$58;
    var __$l2__$67 = __$ctx._firstOption;
    __$ctx._firstOption = firstOption__$57;
    var __$r__$69;
    var __$l3__$70 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 1024;
    __$r__$69 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l3__$70;
    __$r__$64 = __$r__$69;
    __$ctx._select = __$l0__$65;
    __$ctx._checkedOptions = __$l1__$66;
    __$ctx._firstOption = __$l2__$67;
    return __$r__$64;
}

function __$b136(__$ctx, __$ref) {
    var tag__$204 = function __$lb__$205() {
        var __$r__$206;
        var __$l2__$207 = $$mode;
        $$mode = "tag";
        __$r__$206 = applyc(__$ctx, __$ref);
        $$mode = __$l2__$207;
        return __$r__$206;
    }(), isRealButton__$208 = tag__$204 === "button" && (!$$mods.type || $$mods.type === "submit");
    var __$r__$209;
    var __$l0__$210 = __$ctx._isRealButton;
    __$ctx._isRealButton = isRealButton__$208;
    var __$r__$212;
    var __$l1__$213 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 4;
    __$r__$212 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l1__$213;
    __$r__$209 = __$r__$212;
    __$ctx._isRealButton = __$l0__$210;
    return __$r__$209;
}

function __$b137(__$ctx, __$ref) {
    (__$ctx._firstItem.mods || (__$ctx._firstItem.mods = {})).checked = true;
    var __$r__$95;
    var __$l0__$96 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 32768;
    __$r__$95 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l0__$96;
    return __$r__$95;
}

function __$b138(__$ctx, __$ref) {
    var ctx__$111 = __$ctx.ctx, mods__$112 = $$mods, firstItem__$113, checkedItems__$114 = [];
    if (ctx__$111.content) {
        var isValDef__$115 = typeof ctx__$111.val !== "undefined", containsVal__$116 = function(val) {
            return isValDef__$115 && (mods__$112.mode === "check" ? ctx__$111.val.indexOf(val) > -1 : ctx__$111.val === val);
        }, iterateItems__$117 = function(content) {
            var i__$118 = 0, itemOrGroup__$119;
            while (itemOrGroup__$119 = content[i__$118++]) {
                if (itemOrGroup__$119.block === "menu-item") {
                    firstItem__$113 || (firstItem__$113 = itemOrGroup__$119);
                    if (containsVal__$116(itemOrGroup__$119.val)) {
                        (itemOrGroup__$119.mods = itemOrGroup__$119.mods || {}).checked = true;
                        checkedItems__$114.push(itemOrGroup__$119);
                    }
                } else if (itemOrGroup__$119.content) {
                    iterateItems__$117(itemOrGroup__$119.content);
                }
            }
        };
        if (!__$ctx.isArray(ctx__$111.content)) throw Error("menu: content must be an array of the menu items");
        iterateItems__$117(ctx__$111.content);
    }
    var __$r__$121;
    var __$l0__$122 = __$ctx._firstItem;
    __$ctx._firstItem = firstItem__$113;
    var __$l1__$123 = __$ctx._checkedItems;
    __$ctx._checkedItems = checkedItems__$114;
    var __$l2__$124 = __$ctx._menuMods;
    __$ctx._menuMods = {
        theme: mods__$112.theme,
        disabled: mods__$112.disabled
    };
    var __$r__$126;
    var __$l3__$127 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 1048576;
    __$r__$126 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l3__$127;
    __$r__$121 = __$r__$126;
    __$ctx._firstItem = __$l0__$122;
    __$ctx._checkedItems = __$l1__$123;
    __$ctx._menuMods = __$l2__$124;
    return __$r__$121;
}

function __$b139(__$ctx, __$ref) {
    if ($$mods.type !== "button") throw Error("Modifier mode=radio-check can be only with modifier type=button");
    var __$r__$72;
    var __$l0__$73 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 2048;
    __$r__$72 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l0__$73;
    return __$r__$72;
}

function __$b140(__$ctx, __$ref) {
    delete __$ctx._menuItemDisabled;
    $$mods.disabled = true;
    var __$r__$86;
    var __$l0__$87 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 8192;
    __$r__$86 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l0__$87;
    return __$r__$86;
}

function __$b141(__$ctx, __$ref) {
    var ctx__$152 = __$ctx.ctx;
    typeof ctx__$152.url === "object" && (ctx__$152.url = __$ctx.reapply(ctx__$152.url));
    var __$r__$154;
    var __$l0__$155 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 67108864;
    __$r__$154 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l0__$155;
    return __$r__$154;
}

function __$b143(__$ctx, __$ref) {
    var mods__$106 = $$mods;
    mods__$106.theme = mods__$106.theme || __$ctx._menuMods.theme;
    mods__$106.disabled = mods__$106.disabled || __$ctx._menuMods.disabled;
    var __$r__$108;
    var __$l0__$109 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 524288;
    __$r__$108 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l0__$109;
    return __$r__$108;
}

function __$b146(__$ctx, __$ref) {
    var url__$236 = __$ctx.ctx.url;
    var __$r__$238;
    var __$l0__$239 = $$mode;
    $$mode = "";
    var __$l1__$240 = __$ctx.ctx;
    __$ctx.ctx = [ 6, 7, 8, 9 ].map(function(v) {
        return {
            elem: "css",
            url: url__$236 + ".ie" + v + ".css",
            ie: "IE " + v
        };
    });
    var __$r__$242;
    var __$l2__$243 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 64;
    __$r__$242 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$243;
    __$r__$238 = __$r__$242;
    $$mode = __$l0__$239;
    __$ctx.ctx = __$l1__$240;
    return __$r__$238;
}

function __$b147(__$ctx, __$ref) {
    var ie__$244 = __$ctx.ctx.ie, hideRule__$245 = !ie__$244 ? [ "gt IE 9", "<!-->", "<!--" ] : ie__$244 === "!IE" ? [ ie__$244, "<!-->", "<!--" ] : [ ie__$244, "", "" ];
    var __$r__$247;
    var __$l0__$248 = $$mode;
    $$mode = "";
    var __$l1__$249 = __$ctx.ctx;
    __$ctx.ctx = [ "<!--[if " + hideRule__$245[0] + "]>" + hideRule__$245[1], __$ctx.ctx, hideRule__$245[2] + "<![endif]-->" ];
    var __$r__$251;
    var __$l2__$252 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 128;
    __$r__$251 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$252;
    __$r__$247 = __$r__$251;
    $$mode = __$l0__$248;
    __$ctx.ctx = __$l1__$249;
    return __$r__$247;
}

function __$b148(__$ctx, __$ref) {
    var ctx__$256 = __$ctx.ctx;
    __$ctx._nonceCsp = ctx__$256.nonce;
    var __$r__$258;
    var __$l0__$259 = __$ctx._pageInit;
    __$ctx._pageInit = true;
    var __$r__$261;
    var __$l1__$262 = $$mode;
    $$mode = "";
    var __$l2__$263 = __$ctx.ctx;
    __$ctx.ctx = [ ctx__$256.doctype || "<!DOCTYPE html>", {
        tag: "html",
        cls: "ua_js_no",
        content: [ {
            elem: "head",
            content: [ {
                tag: "meta",
                attrs: {
                    charset: "utf-8"
                }
            }, ctx__$256.uaCompatible === false ? "" : {
                tag: "meta",
                attrs: {
                    "http-equiv": "X-UA-Compatible",
                    content: ctx__$256.uaCompatible || "IE=edge"
                }
            }, {
                tag: "title",
                content: ctx__$256.title
            }, {
                block: "ua",
                attrs: {
                    nonce: ctx__$256.nonce
                }
            }, ctx__$256.head, ctx__$256.styles, ctx__$256.favicon ? {
                elem: "favicon",
                url: ctx__$256.favicon
            } : "" ]
        }, ctx__$256 ]
    } ];
    var __$r__$265;
    var __$l3__$266 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 512;
    __$r__$265 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l3__$266;
    __$r__$261 = __$r__$265;
    $$mode = __$l1__$262;
    __$ctx.ctx = __$l2__$263;
    __$r__$258 = __$r__$261;
    __$ctx._pageInit = __$l0__$259;
    return __$r__$258;
}

function __$b149(__$ctx, __$ref) {
    if (!__$ctx.ctx) return "";
    var ctx__$267 = __$ctx.ctx, keyset__$268 = ctx__$267.keyset, key__$269 = ctx__$267.key, params__$270 = ctx__$267.params || {};
    if (!(keyset__$268 || key__$269)) return "";
    if (typeof ctx__$267.content === "undefined" || ctx__$267.content !== null) {
        params__$270.content = exports.apply(ctx__$267.content);
    }
    __$ctx._buf.push(BEM.I18N(keyset__$268, key__$269, params__$270));
    return;
}

function __$b150(__$ctx, __$ref) {
    var BEM_INTERNAL__$271 = __$ctx.BEM.INTERNAL, ctx__$272 = __$ctx.ctx, isBEM__$273, tag__$274, res__$275;
    var __$r__$277;
    var __$l0__$278 = __$ctx._str;
    __$ctx._str = "";
    var vBlock__$279 = $$block;
    var __$r__$281;
    var __$l1__$282 = $$mode;
    $$mode = "tag";
    __$r__$281 = applyc(__$ctx, __$ref);
    $$mode = __$l1__$282;
    tag__$274 = __$r__$281;
    typeof tag__$274 !== "undefined" || (tag__$274 = ctx__$272.tag);
    typeof tag__$274 !== "undefined" || (tag__$274 = "div");
    if (tag__$274) {
        var jsParams__$283, js__$284;
        if (vBlock__$279 && ctx__$272.js !== false) {
            var __$r__$285;
            var __$l2__$286 = $$mode;
            $$mode = "js";
            __$r__$285 = applyc(__$ctx, __$ref);
            $$mode = __$l2__$286;
            js__$284 = __$r__$285;
            js__$284 = js__$284 ? __$ctx.extend(ctx__$272.js, js__$284 === true ? {} : js__$284) : ctx__$272.js === true ? {} : ctx__$272.js;
            js__$284 && ((jsParams__$283 = {})[BEM_INTERNAL__$271.buildClass(vBlock__$279, ctx__$272.elem)] = js__$284);
        }
        __$ctx._str += "<" + tag__$274;
        var __$r__$287;
        var __$l3__$288 = $$mode;
        $$mode = "bem";
        __$r__$287 = applyc(__$ctx, __$ref);
        $$mode = __$l3__$288;
        isBEM__$273 = __$r__$287;
        typeof isBEM__$273 !== "undefined" || (isBEM__$273 = typeof ctx__$272.bem !== "undefined" ? ctx__$272.bem : ctx__$272.block || ctx__$272.elem);
        var __$r__$290;
        var __$l4__$291 = $$mode;
        $$mode = "cls";
        __$r__$290 = applyc(__$ctx, __$ref);
        $$mode = __$l4__$291;
        var cls__$289 = __$r__$290;
        cls__$289 || (cls__$289 = ctx__$272.cls);
        var addJSInitClass__$292 = ctx__$272.block && jsParams__$283 && !ctx__$272.elem;
        if (isBEM__$273 || cls__$289) {
            __$ctx._str += ' class="';
            if (isBEM__$273) {
                __$ctx._str += BEM_INTERNAL__$271.buildClasses(vBlock__$279, ctx__$272.elem, ctx__$272.elemMods || ctx__$272.mods);
                var __$r__$294;
                var __$l5__$295 = $$mode;
                $$mode = "mix";
                __$r__$294 = applyc(__$ctx, __$ref);
                $$mode = __$l5__$295;
                var mix__$293 = __$r__$294;
                ctx__$272.mix && (mix__$293 = mix__$293 ? [].concat(mix__$293, ctx__$272.mix) : ctx__$272.mix);
                if (mix__$293) {
                    var visited__$296 = {}, visitedKey__$297 = function(block, elem) {
                        return (block || "") + "__" + (elem || "");
                    };
                    visited__$296[visitedKey__$297(vBlock__$279, $$elem)] = true;
                    __$ctx.isArray(mix__$293) || (mix__$293 = [ mix__$293 ]);
                    for (var i__$298 = 0; i__$298 < mix__$293.length; i__$298++) {
                        var mixItem__$299 = mix__$293[i__$298];
                        typeof mixItem__$299 === "string" && (mixItem__$299 = {
                            block: mixItem__$299
                        });
                        var hasItem__$300 = mixItem__$299.block && (vBlock__$279 !== ctx__$272.block || mixItem__$299.block !== vBlock__$279) || mixItem__$299.elem, mixBlock__$301 = mixItem__$299.block || mixItem__$299._block || $$block, mixElem__$302 = mixItem__$299.elem || mixItem__$299._elem || $$elem;
                        hasItem__$300 && (__$ctx._str += " ");
                        __$ctx._str += BEM_INTERNAL__$271[hasItem__$300 ? "buildClasses" : "buildModsClasses"](mixBlock__$301, mixItem__$299.elem || mixItem__$299._elem || (mixItem__$299.block ? undefined : $$elem), mixItem__$299.elemMods || mixItem__$299.mods);
                        if (mixItem__$299.js) {
                            (jsParams__$283 || (jsParams__$283 = {}))[BEM_INTERNAL__$271.buildClass(mixBlock__$301, mixItem__$299.elem)] = mixItem__$299.js === true ? {} : mixItem__$299.js;
                            addJSInitClass__$292 || (addJSInitClass__$292 = mixBlock__$301 && !mixItem__$299.elem);
                        }
                        if (hasItem__$300 && !visited__$296[visitedKey__$297(mixBlock__$301, mixElem__$302)]) {
                            visited__$296[visitedKey__$297(mixBlock__$301, mixElem__$302)] = true;
                            var __$r__$304;
                            var __$l6__$305 = $$mode;
                            $$mode = "mix";
                            var __$l7__$306 = $$block;
                            $$block = mixBlock__$301;
                            var __$l8__$307 = $$elem;
                            $$elem = mixElem__$302;
                            __$r__$304 = applyc(__$ctx, __$ref);
                            $$mode = __$l6__$305;
                            $$block = __$l7__$306;
                            $$elem = __$l8__$307;
                            var nestedMix__$303 = __$r__$304;
                            if (nestedMix__$303) {
                                Array.isArray(nestedMix__$303) || (nestedMix__$303 = [ nestedMix__$303 ]);
                                for (var j__$308 = 0; j__$308 < nestedMix__$303.length; j__$308++) {
                                    var nestedItem__$309 = nestedMix__$303[j__$308];
                                    if (!nestedItem__$309.block && !nestedItem__$309.elem || !visited__$296[visitedKey__$297(nestedItem__$309.block, nestedItem__$309.elem)]) {
                                        nestedItem__$309._block = mixBlock__$301;
                                        nestedItem__$309._elem = mixElem__$302;
                                        mix__$293.splice(i__$298 + 1, 0, nestedItem__$309);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            cls__$289 && (__$ctx._str += isBEM__$273 ? " " + cls__$289 : cls__$289);
            __$ctx._str += addJSInitClass__$292 ? ' i-bem"' : '"';
        }
        if (isBEM__$273 && jsParams__$283) {
            __$ctx._str += " data-bem='" + __$ctx.jsAttrEscape(JSON.stringify(jsParams__$283)) + "'";
        }
        var __$r__$311;
        var __$l9__$312 = $$mode;
        $$mode = "attrs";
        __$r__$311 = applyc(__$ctx, __$ref);
        $$mode = __$l9__$312;
        var attrs__$310 = __$r__$311;
        attrs__$310 = __$ctx.extend(attrs__$310, ctx__$272.attrs);
        if (attrs__$310) {
            var name__$313, attr__$314;
            for (name__$313 in attrs__$310) {
                attr__$314 = attrs__$310[name__$313];
                if (typeof attr__$314 === "undefined") continue;
                __$ctx._str += " " + name__$313 + '="' + __$ctx.attrEscape(__$ctx.isSimple(attr__$314) ? attr__$314 : __$ctx.reapply(attr__$314)) + '"';
            }
        }
    }
    if (__$ctx.isShortTag(tag__$274)) {
        __$ctx._str += "/>";
    } else {
        tag__$274 && (__$ctx._str += ">");
        var __$r__$316;
        var __$l10__$317 = $$mode;
        $$mode = "content";
        __$r__$316 = applyc(__$ctx, __$ref);
        $$mode = __$l10__$317;
        var content__$315 = __$r__$316;
        if (content__$315 || content__$315 === 0) {
            __$ctx._resetApplyNext(__$wrapThis(__$ctx));
            isBEM__$273 = vBlock__$279 || $$elem;
            var __$r__$318;
            var __$l11__$319 = $$mode;
            $$mode = "";
            var __$l12__$320 = __$ctx._notNewList;
            __$ctx._notNewList = false;
            var __$l13__$321 = __$ctx.position;
            __$ctx.position = isBEM__$273 ? 1 : __$ctx.position;
            var __$l14__$322 = __$ctx._listLength;
            __$ctx._listLength = isBEM__$273 ? 1 : __$ctx._listLength;
            var __$l15__$323 = __$ctx.ctx;
            __$ctx.ctx = content__$315;
            __$r__$318 = applyc(__$ctx, __$ref);
            $$mode = __$l11__$319;
            __$ctx._notNewList = __$l12__$320;
            __$ctx.position = __$l13__$321;
            __$ctx._listLength = __$l14__$322;
            __$ctx.ctx = __$l15__$323;
        }
        tag__$274 && (__$ctx._str += "</" + tag__$274 + ">");
    }
    res__$275 = __$ctx._str;
    __$r__$277 = undefined;
    __$ctx._str = __$l0__$278;
    __$ctx._buf.push(res__$275);
    return;
}

function __$b160(__$ctx, __$ref) {
    var __$r__$325;
    var __$l0__$326 = $$mode;
    $$mode = "";
    var __$l1__$327 = __$ctx.ctx;
    __$ctx.ctx = __$ctx.ctx._value;
    var __$r__$329;
    var __$l2__$330 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 1024;
    __$r__$329 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$330;
    __$r__$325 = __$r__$329;
    $$mode = __$l0__$326;
    __$ctx.ctx = __$l1__$327;
    return;
}

function __$b161(__$ctx, __$ref) {
    __$ctx._listLength--;
    var ctx__$331 = __$ctx.ctx;
    if (ctx__$331 && ctx__$331 !== true || ctx__$331 === 0) {
        __$ctx._str += ctx__$331 + "";
    }
    return;
}

function __$b162(__$ctx, __$ref) {
    __$ctx._listLength--;
    return;
}

function __$b163(__$ctx, __$ref) {
    var ctx__$332 = __$ctx.ctx, len__$333 = ctx__$332.length, i__$334 = 0, prevPos__$335 = __$ctx.position, prevNotNewList__$336 = __$ctx._notNewList;
    if (prevNotNewList__$336) {
        __$ctx._listLength += len__$333 - 1;
    } else {
        __$ctx.position = 0;
        __$ctx._listLength = len__$333;
    }
    __$ctx._notNewList = true;
    while (i__$334 < len__$333) (function __$lb__$337() {
        var __$r__$338;
        var __$l0__$339 = __$ctx.ctx;
        __$ctx.ctx = ctx__$332[i__$334++];
        __$r__$338 = applyc(__$ctx, __$ref);
        __$ctx.ctx = __$l0__$339;
        return __$r__$338;
    })();
    prevNotNewList__$336 || (__$ctx.position = prevPos__$335);
    return;
}

function __$b164(__$ctx, __$ref) {
    __$ctx.ctx || (__$ctx.ctx = {});
    var vBlock__$340 = __$ctx.ctx.block, vElem__$341 = __$ctx.ctx.elem, block__$342 = __$ctx._currBlock || $$block;
    var __$r__$344;
    var __$l0__$345 = $$mode;
    $$mode = "default";
    var __$l1__$346 = $$block;
    $$block = vBlock__$340 || (vElem__$341 ? block__$342 : undefined);
    var __$l2__$347 = __$ctx._currBlock;
    __$ctx._currBlock = vBlock__$340 || vElem__$341 ? undefined : block__$342;
    var __$l3__$348 = $$elem;
    $$elem = vElem__$341;
    var __$l4__$349 = $$mods;
    $$mods = vBlock__$340 ? __$ctx.ctx.mods || (__$ctx.ctx.mods = {}) : $$mods;
    var __$l5__$350 = $$elemMods;
    $$elemMods = __$ctx.ctx.elemMods || {};
    $$block || $$elem ? __$ctx.position = (__$ctx.position || 0) + 1 : __$ctx._listLength--;
    applyc(__$ctx, __$ref);
    __$r__$344 = undefined;
    $$mode = __$l0__$345;
    $$block = __$l1__$346;
    __$ctx._currBlock = __$l2__$347;
    $$elem = __$l3__$348;
    $$mods = __$l4__$349;
    $$elemMods = __$l5__$350;
    return;
}

function __$g0(__$ctx, __$ref) {
    var __$t = $$block;
    if (__$t === "progressbar") {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods["theme"] === "simple" && (__$ctx.__$a0 & 1) === 0) {
                return [ {
                    elem: "box",
                    content: function __$lb__$0() {
                        var __$r__$1;
                        var __$l0__$2 = __$ctx.__$a0;
                        __$ctx.__$a0 = __$ctx.__$a0 | 1;
                        __$r__$1 = applyc(__$ctx, __$ref);
                        __$ctx.__$a0 = __$l0__$2;
                        return __$r__$1;
                    }()
                }, {
                    elem: "text",
                    content: __$ctx.ctx.val || 0
                } ];
            }
            if (typeof __$ctx.ctx.content !== "undefined") {
                return __$ctx.ctx.content;
            }
            return {
                elem: "bar",
                attrs: {
                    style: "width:" + (__$ctx.ctx.val || 0) + "%"
                }
            };
        }
    } else if (__$t === "textarea") {
        if (!$$elem) {
            return __$ctx.ctx.val;
        }
    } else if (__$t === "radio") {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods["type"] === "button") {
                var __$r = __$b5(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            var __$r = __$b6(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "select") {
        if ($$elem === "button" && $$mods && $$mods["mode"] === "radio") {
            return [ {
                elem: "text",
                content: __$ctx._checkedOption.text
            } ];
        }
        var __$t = !$$elem;
        if (__$t) {
            var __$t = $$mods;
            if (__$t) {
                var __$t = $$mods["mode"];
                if (__$t === "radio") {
                    if ((__$ctx.__$a0 & 2) === 0) {
                        return [ {
                            elem: "control",
                            val: __$ctx._checkedOption.val
                        }, function __$lb__$5() {
                            var __$r__$6;
                            var __$l0__$7 = __$ctx.__$a0;
                            __$ctx.__$a0 = __$ctx.__$a0 | 2;
                            __$r__$6 = applyc(__$ctx, __$ref);
                            __$ctx.__$a0 = __$l0__$7;
                            return __$r__$6;
                        }() ];
                    }
                } else if (__$t === "radio-check") {
                    if (__$ctx._checkedOptions[0] && (__$ctx.__$a0 & 8) === 0) {
                        return [ {
                            elem: "control",
                            val: __$ctx._checkedOptions[0].val
                        }, function __$lb__$16() {
                            var __$r__$17;
                            var __$l0__$18 = __$ctx.__$a0;
                            __$ctx.__$a0 = __$ctx.__$a0 | 8;
                            __$r__$17 = applyc(__$ctx, __$ref);
                            __$ctx.__$a0 = __$l0__$18;
                            return __$r__$17;
                        }() ];
                    }
                }
            }
        }
        if ($$elem === "button" && $$mods && $$mods["mode"] === "radio-check") {
            return [ {
                elem: "text",
                content: (__$ctx._checkedOptions[0] || __$ctx._select).text
            } ];
        }
        if (!$$elem && $$mods && $$mods["mode"] === "check" && __$ctx._checkedOptions[0] && (__$ctx.__$a0 & 32) === 0) {
            var __$r = __$b11(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if ($$elem === "button" && $$mods && $$mods["mode"] === "check") {
            var __$r = __$b12(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (!$$elem) {
            return [ {
                elem: "button"
            }, {
                block: "popup",
                mods: {
                    target: "anchor",
                    theme: $$mods.theme,
                    autoclosable: true
                },
                directions: [ "bottom-left", "bottom-right", "top-left", "top-right" ],
                content: {
                    block: $$block,
                    mods: $$mods,
                    elem: "menu"
                }
            } ];
        }
    } else if (__$t === "button") {
        var __$t = !$$elem;
        if (__$t) {
            if (__$ctx._attach && (__$ctx.__$a0 & 536870912) === 0) {
                return [ {
                    block: "attach",
                    elem: "control"
                }, function __$lb__$187() {
                    var __$r__$188;
                    var __$l0__$189 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 536870912;
                    __$r__$188 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$189;
                    return __$r__$188;
                }() ];
            }
            if (typeof __$ctx.ctx.content !== "undefined") {
                return __$ctx.ctx.content;
            }
            var __$r = __$b16(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "menu") {
        if ($$elem === "group" && typeof __$ctx.ctx.title !== "undefined" && (__$ctx.__$a0 & 65536) === 0) {
            return [ {
                elem: "group-title",
                content: __$ctx.ctx.title
            }, function __$lb__$97() {
                var __$r__$98;
                var __$l0__$99 = __$ctx.__$a0;
                __$ctx.__$a0 = __$ctx.__$a0 | 65536;
                __$r__$98 = applyc(__$ctx, __$ref);
                __$ctx.__$a0 = __$l0__$99;
                return __$r__$98;
            }() ];
        }
    } else if (__$t === "radio-group") {
        if (!$$elem) {
            var __$r = __$b18(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "modal") {
        if (!$$elem && (__$ctx.__$a0 & 4096) === 0) {
            return {
                elem: "table",
                content: {
                    elem: "cell",
                    content: {
                        elem: "content",
                        content: function __$lb__$82() {
                            var __$r__$83;
                            var __$l0__$84 = __$ctx.__$a0;
                            __$ctx.__$a0 = __$ctx.__$a0 | 4096;
                            __$r__$83 = applyc(__$ctx, __$ref);
                            __$ctx.__$a0 = __$l0__$84;
                            return __$r__$83;
                        }()
                    }
                }
            };
        }
    } else if (__$t === "input") {
        if ($$elem === "box" && $$mods && $$mods["has-clear"] === true) {
            return [ __$ctx.ctx.content, {
                elem: "clear"
            } ];
        }
        if (!$$elem) {
            return {
                elem: "box",
                content: {
                    elem: "control"
                }
            };
        }
    } else if (__$t === "dropdown") {
        var __$t = $$elem;
        if (__$t === "switcher") {
            var __$t = $$mods;
            if (__$t) {
                var __$t = $$mods["switcher"];
                if (__$t === "button") {
                    var __$r = __$b22(__$ctx, __$ref);
                    if (__$r !== __$ref) return __$r;
                } else if (__$t === "link") {
                    var __$r = __$b23(__$ctx, __$ref);
                    if (__$r !== __$ref) return __$r;
                }
            }
        }
        if (!$$elem) {
            var __$r = __$b24(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "checkbox-group") {
        if (!$$elem) {
            var __$r = __$b25(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "checkbox") {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods["type"] === "button") {
                var __$r = __$b26(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            var __$r = __$b27(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "attach") {
        if (!$$elem) {
            var __$r = __$b28(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "page") {
        if ($$elem === "conditional-comment" && (__$ctx.__$a1 & 16) === 0) {
            var __$r = __$b29(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (!$$elem && (__$ctx.__$a1 & 256) === 0) {
            return [ function __$lb__$253() {
                var __$r__$254;
                var __$l0__$255 = __$ctx.__$a1;
                __$ctx.__$a1 = __$ctx.__$a1 | 256;
                __$r__$254 = applyc(__$ctx, __$ref);
                __$ctx.__$a1 = __$l0__$255;
                return __$r__$254;
            }(), __$ctx.ctx.scripts ];
        }
    } else if (__$t === "ua") {
        if (!$$elem && (__$ctx.__$a1 & 32) === 0) {
            return [ function __$lb__$232() {
                var __$r__$233;
                var __$l0__$234 = __$ctx.__$a1;
                __$ctx.__$a1 = __$ctx.__$a1 | 32;
                __$r__$233 = applyc(__$ctx, __$ref);
                __$ctx.__$a1 = __$l0__$234;
                return __$r__$233;
            }(), "(function(d,n){", "d.documentElement.className+=", '" ua_svg_"+(d[n]&&d[n]("http://www.w3.org/2000/svg","svg").createSVGRect?"yes":"no");', '})(document,"createElementNS");' ];
        }
    }
    return __$ctx.ctx.content;
    if ($$block === "ua" && !$$elem) {
        return [ "(function(e,c){", 'e[c]=e[c].replace(/(ua_js_)no/g,"$1yes");', '})(document.documentElement,"className");' ];
    }
    return __$ref;
}

function __$g1(__$ctx, __$ref) {
    var __$t = $$block;
    if (__$t === "textarea") {
        if (!$$elem) {
            var __$r = __$b34(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "radio") {
        if ($$elem === "control") {
            var __$r = __$b35(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "select") {
        if ($$elem === "control") {
            return {
                type: "hidden",
                name: __$ctx._select.name,
                value: __$ctx.ctx.val,
                disabled: $$mods.disabled ? "disabled" : undefined
            };
        }
    } else if (__$t === "button") {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods["type"] === "link" && (__$ctx.__$a0 & 268435456) === 0) {
                var __$r = __$b37(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            if (__$ctx._isRealButton && (__$ctx.__$a1 & 2) === 0) {
                var __$r = __$b38(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            var __$r = __$b39(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "menu") {
        var __$t = $$elem;
        if (__$t === "group-title") {
            return {
                role: "presentation"
            };
        } else if (__$t === "group") {
            if (typeof __$ctx.ctx.title !== "undefined" && (__$ctx.__$a0 & 131072) === 0) {
                var __$r = __$ctx.extend(function __$lb__$100() {
                    var __$r__$101;
                    var __$l0__$102 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 131072;
                    __$r__$101 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$102;
                    return __$r__$101;
                }(), {
                    "aria-label": __$ctx.ctx.title
                });
                if (__$r !== __$ref) return __$r;
            }
            return {
                role: "group"
            };
        }
        if (!$$elem) {
            var __$r = __$b43(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "link") {
        if (!$$elem) {
            var __$r = __$b44(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "menu-item") {
        if (!$$elem) {
            return {
                role: "menuitem"
            };
        }
    } else if (__$t === "input") {
        var __$t = $$elem;
        if (__$t === "control") {
            var __$t = $$mods;
            if (__$t) {
                var __$t = $$mods["type"];
                if (__$t === "search") {
                    if ((__$ctx.__$a0 & 2097152) === 0) {
                        var __$r = __$ctx.extend(function __$lb__$128() {
                            var __$r__$129;
                            var __$l0__$130 = __$ctx.__$a0;
                            __$ctx.__$a0 = __$ctx.__$a0 | 2097152;
                            __$r__$129 = applyc(__$ctx, __$ref);
                            __$ctx.__$a0 = __$l0__$130;
                            return __$r__$129;
                        }(), {
                            type: "search"
                        });
                        if (__$r !== __$ref) return __$r;
                    }
                } else if (__$t === "password") {
                    if ((__$ctx.__$a0 & 4194304) === 0) {
                        var __$r = __$ctx.extend(function __$lb__$131() {
                            var __$r__$132;
                            var __$l0__$133 = __$ctx.__$a0;
                            __$ctx.__$a0 = __$ctx.__$a0 | 4194304;
                            __$r__$132 = applyc(__$ctx, __$ref);
                            __$ctx.__$a0 = __$l0__$133;
                            return __$r__$132;
                        }(), {
                            type: "password"
                        });
                        if (__$r !== __$ref) return __$r;
                    }
                }
            }
            var __$r = __$b48(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "image") {
        var __$t = !$$elem;
        if (__$t) {
            if (typeof __$ctx.ctx.content === "undefined" && (__$ctx.__$a0 & 16777216) === 0) {
                var __$r = __$b49(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            return {
                role: "img"
            };
        }
    } else if (__$t === "checkbox") {
        if ($$elem === "control") {
            var __$r = __$b51(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "attach") {
        if ($$elem === "control") {
            var __$r = __$b52(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "icon") {
        if (!$$elem) {
            var __$r = __$b53(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "page") {
        var __$t = $$elem;
        if (__$t === "js") {
            var __$r = __$b54(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        } else if (__$t === "css") {
            if (__$ctx.ctx.url) {
                return {
                    rel: "stylesheet",
                    href: __$ctx.ctx.url
                };
            }
        } else if (__$t === "favicon") {
            return {
                rel: "shortcut icon",
                href: __$ctx.ctx.url
            };
        }
    }
    return undefined;
    return __$ref;
}

function __$g2(__$ctx, __$ref) {
    var __$t = $$block;
    if (__$t === "textarea") {
        if (!$$elem) {
            return "textarea";
        }
    } else if (__$t === "spin") {
        if (!$$elem) {
            return "span";
        }
    } else if (__$t === "radio") {
        var __$t = $$elem;
        if (__$t === "control") {
            return "input";
        } else if (__$t === "box") {
            return "span";
        }
        if (!$$elem) {
            return "label";
        }
    } else if (__$t === "select") {
        if ($$elem === "control") {
            return "input";
        }
    } else if (__$t === "button") {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods["type"] === "link") {
                return "a";
            }
            if (__$ctx._attach) {
                return "span";
            }
        }
        if ($$elem === "text") {
            return "span";
        }
        if (!$$elem) {
            return __$ctx.ctx.tag || "button";
        }
    } else if (__$t === "radio-group") {
        if (!$$elem) {
            return "span";
        }
    } else if (__$t === "link") {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods["pseudo"] === true && !__$ctx.ctx.url) {
                return "span";
            }
            return "a";
        }
    } else if (__$t === "input") {
        var __$t = $$elem;
        if (__$t === "control") {
            return "input";
        } else if (__$t === "box") {
            return "span";
        } else if (__$t === "clear") {
            return "i";
        }
        if (!$$elem) {
            return "span";
        }
    } else if (__$t === "image") {
        var __$t = !$$elem;
        if (__$t) {
            if (typeof __$ctx.ctx.content === "undefined") {
                return "img";
            }
            return "span";
        }
    } else if (__$t === "dropdown") {
        if ($$elem === "switcher") {
            return false;
        }
    } else if (__$t === "checkbox-group") {
        if (!$$elem) {
            return "span";
        }
    } else if (__$t === "checkbox") {
        var __$t = $$elem;
        if (__$t === "control") {
            return "input";
        } else if (__$t === "box") {
            return "span";
        }
        if (!$$elem) {
            return "label";
        }
    } else if (__$t === "attach") {
        var __$t = $$elem;
        if (__$t === "control") {
            return "input";
        } else if (__$t === "clear") {
            return "i";
        } else if (__$t === "text") {
            return "span";
        } else if (__$t === "file") {
            return "span";
        } else if (__$t === "no-file") {
            return "span";
        }
        if (!$$elem) {
            return "span";
        }
    } else if (__$t === "icon") {
        if (!$$elem) {
            return "i";
        }
    } else if (__$t === "page") {
        var __$t = $$elem;
        if (__$t === "js") {
            return "script";
        } else if (__$t === "link") {
            return "link";
        } else if (__$t === "conditional-comment") {
            return false;
        } else if (__$t === "css") {
            if (__$ctx.ctx.url) {
                return "link";
            }
            return "style";
        } else if (__$t === "favicon") {
            return "link";
        } else if (__$t === "meta") {
            return "meta";
        } else if (__$t === "head") {
            return "head";
        }
        if (!$$elem) {
            return "body";
        }
    }
    return undefined;
    if ($$block === "ua" && !$$elem) {
        return "script";
    }
    return __$ref;
}

function __$g3(__$ctx, __$ref) {
    var __$t = $$block;
    if (__$t === "progressbar") {
        if (!$$elem) {
            return {
                val: __$ctx.ctx.val || 0
            };
        }
    } else if (__$t === "textarea") {
        if (!$$elem) {
            return true;
        }
    } else if (__$t === "radio") {
        if (!$$elem) {
            return true;
        }
    } else if (__$t === "select") {
        var __$t = !$$elem;
        if (__$t) {
            var __$t = $$mods;
            if (__$t) {
                var __$t = $$mods["mode"];
                if (__$t === "radio-check") {
                    if ((__$ctx.__$a0 & 16) === 0) {
                        var __$r = __$ctx.extend(function __$lb__$19() {
                            var __$r__$20;
                            var __$l0__$21 = __$ctx.__$a0;
                            __$ctx.__$a0 = __$ctx.__$a0 | 16;
                            __$r__$20 = applyc(__$ctx, __$ref);
                            __$ctx.__$a0 = __$l0__$21;
                            return __$r__$20;
                        }(), {
                            text: __$ctx.ctx.text
                        });
                        if (__$r !== __$ref) return __$r;
                    }
                } else if (__$t === "check") {
                    if ((__$ctx.__$a0 & 64) === 0) {
                        var __$r = __$ctx.extend(function __$lb__$27() {
                            var __$r__$28;
                            var __$l0__$29 = __$ctx.__$a0;
                            __$ctx.__$a0 = __$ctx.__$a0 | 64;
                            __$r__$28 = applyc(__$ctx, __$ref);
                            __$ctx.__$a0 = __$l0__$29;
                            return __$r__$28;
                        }(), {
                            text: __$ctx.ctx.text
                        });
                        if (__$r !== __$ref) return __$r;
                    }
                }
                if ($$mods["focused"] === true && (__$ctx.__$a0 & 512) === 0) {
                    var __$r = __$ctx.extend(function __$lb__$50() {
                        var __$r__$51;
                        var __$l0__$52 = __$ctx.__$a0;
                        __$ctx.__$a0 = __$ctx.__$a0 | 512;
                        __$r__$51 = applyc(__$ctx, __$ref);
                        __$ctx.__$a0 = __$l0__$52;
                        return __$r__$51;
                    }(), {
                        live: false
                    });
                    if (__$r !== __$ref) return __$r;
                }
            }
            var __$r = __$b114(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "button") {
        var __$t = !$$elem;
        if (__$t) {
            var __$t = $$mods;
            if (__$t) {
                if ($$mods && $$mods["type"] === "link" && $$mods["disabled"] === true && (__$ctx.__$a0 & 134217728) === 0) {
                    var __$r = __$ctx.extend(function __$lb__$177() {
                        var __$r__$178;
                        var __$l0__$179 = __$ctx.__$a0;
                        __$ctx.__$a0 = __$ctx.__$a0 | 134217728;
                        __$r__$178 = applyc(__$ctx, __$ref);
                        __$ctx.__$a0 = __$l0__$179;
                        return __$r__$178;
                    }(), {
                        url: __$ctx.ctx.url
                    });
                    if (__$r !== __$ref) return __$r;
                }
                if ($$mods["focused"] === true && (__$ctx.__$a1 & 1) === 0) {
                    var __$r = __$ctx.extend(function __$lb__$192() {
                        var __$r__$193;
                        var __$l0__$194 = __$ctx.__$a1;
                        __$ctx.__$a1 = __$ctx.__$a1 | 1;
                        __$r__$193 = applyc(__$ctx, __$ref);
                        __$ctx.__$a1 = __$l0__$194;
                        return __$r__$193;
                    }(), {
                        live: false
                    });
                    if (__$r !== __$ref) return __$r;
                }
            }
            return true;
        }
    } else if (__$t === "menu") {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods["focused"] === true && (__$ctx.__$a0 & 262144) === 0) {
                var __$r = __$ctx.extend(function __$lb__$103() {
                    var __$r__$104;
                    var __$l0__$105 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 262144;
                    __$r__$104 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$105;
                    return __$r__$104;
                }(), {
                    live: false
                });
                if (__$r !== __$ref) return __$r;
            }
            return true;
        }
    } else if (__$t === "radio-group") {
        if (!$$elem) {
            return true;
        }
    } else if (__$t === "modal") {
        if (!$$elem) {
            return true;
        }
    } else if (__$t === "link") {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods["disabled"] === true && (__$ctx.__$a0 & 33554432) === 0) {
                var __$r = __$ctx.extend(function __$lb__$146() {
                    var __$r__$147;
                    var __$l0__$148 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 33554432;
                    __$r__$147 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$148;
                    return __$r__$147;
                }(), {
                    url: __$ctx.ctx.url
                });
                if (__$r !== __$ref) return __$r;
            }
            return true;
        }
    } else if (__$t === "menu-item") {
        if (!$$elem) {
            return {
                val: __$ctx.ctx.val
            };
        }
    } else if (__$t === "input") {
        if (!$$elem) {
            return true;
        }
    } else if (__$t === "dropdown") {
        if (!$$elem) {
            return true;
        }
    } else if (__$t === "popup") {
        if (!$$elem) {
            var __$r = __$b127(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "checkbox-group") {
        if (!$$elem) {
            return true;
        }
    } else if (__$t === "checkbox") {
        if (!$$elem) {
            return true;
        }
    } else if (__$t === "attach") {
        if (!$$elem) {
            return true;
        }
    }
    return undefined;
    return __$ref;
}

function __$g4(__$ctx, __$ref) {
    var __$t = $$block;
    if (__$t === "select") {
        if (!$$elem && $$mods && $$mods["mode"] === "radio" && __$ctx._checkedOptions && (__$ctx.__$a0 & 4) === 0) {
            var __$r = __$b132(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        var __$t = $$elem;
        if (__$t === "button") {
            if ((__$ctx.__$a0 & 256) === 0) {
                var __$r = __$b133(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
        } else if (__$t === "menu") {
            if ((__$ctx.__$a0 & 128) === 0) {
                var __$r = __$b134(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
        }
        if (!$$elem && !__$ctx._select && (__$ctx.__$a0 & 1024) === 0) {
            var __$r = __$b135(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "button") {
        if (!$$elem && (__$ctx.__$a1 & 4) === 0) {
            var __$r = __$b136(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "menu") {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods["mode"] === "radio" && __$ctx._firstItem && __$ctx._checkedItems && !__$ctx._checkedItems.length && (__$ctx.__$a0 & 32768) === 0) {
                var __$r = __$b137(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            if ((__$ctx.__$a0 & 1048576) === 0) {
                var __$r = __$b138(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
        }
    } else if (__$t === "radio-group") {
        if (!$$elem && $$mods && $$mods["mode"] === "radio-check" && (__$ctx.__$a0 & 2048) === 0) {
            var __$r = __$b139(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "link") {
        var __$t = !$$elem;
        if (__$t) {
            if (__$ctx._menuItemDisabled && (__$ctx.__$a0 & 8192) === 0) {
                var __$r = __$b140(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            if ((__$ctx.__$a0 & 67108864) === 0) {
                var __$r = __$b141(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
        }
    } else if (__$t === "menu-item") {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods && $$mods["type"] === "link" && $$mods["disabled"] === true && !__$ctx._menuItemDisabled && (__$ctx.__$a0 & 16384) === 0) {
                var __$r__$89;
                var __$l0__$90 = __$ctx._menuItemDisabled;
                __$ctx._menuItemDisabled = true;
                var __$r__$92;
                var __$l1__$93 = __$ctx.__$a0;
                __$ctx.__$a0 = __$ctx.__$a0 | 16384;
                __$r__$92 = applyc(__$ctx, __$ref);
                __$ctx.__$a0 = __$l1__$93;
                __$r__$89 = __$r__$92;
                __$ctx._menuItemDisabled = __$l0__$90;
                var __$r = __$r__$89;
                if (__$r !== __$ref) return __$r;
            }
            if (__$ctx._menuMods && (__$ctx.__$a0 & 524288) === 0) {
                var __$r = __$b143(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
        }
    } else if (__$t === "input") {
        if (!$$elem && (__$ctx.__$a0 & 8388608) === 0) {
            var __$r__$137;
            var __$l0__$138 = __$ctx._input;
            __$ctx._input = __$ctx.ctx;
            var __$r__$140;
            var __$l1__$141 = __$ctx.__$a0;
            __$ctx.__$a0 = __$ctx.__$a0 | 8388608;
            __$r__$140 = applyc(__$ctx, __$ref);
            __$ctx.__$a0 = __$l1__$141;
            __$r__$137 = __$r__$140;
            __$ctx._input = __$l0__$138;
            var __$r = __$r__$137;
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "attach") {
        if (!$$elem && (__$ctx.__$a1 & 8) === 0) {
            var __$r__$219;
            var __$l0__$220 = __$ctx._attach;
            __$ctx._attach = __$ctx.ctx;
            var __$r__$222;
            var __$l1__$223 = __$ctx.__$a1;
            __$ctx.__$a1 = __$ctx.__$a1 | 8;
            __$r__$222 = applyc(__$ctx, __$ref);
            __$ctx.__$a1 = __$l1__$223;
            __$r__$219 = __$r__$222;
            __$ctx._attach = __$l0__$220;
            var __$r = __$r__$219;
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "page") {
        var __$t = $$elem;
        if (__$t === "css") {
            var __$t = __$ctx.ctx.hasOwnProperty("ie");
            if (__$t) {
                if (__$ctx.ctx.ie === true && (__$ctx.__$a1 & 64) === 0) {
                    var __$r = __$b146(__$ctx, __$ref);
                    if (__$r !== __$ref) return __$r;
                }
                if ((__$ctx.__$a1 & 128) === 0) {
                    var __$r = __$b147(__$ctx, __$ref);
                    if (__$r !== __$ref) return __$r;
                }
            }
        }
        if (!$$elem && !__$ctx._pageInit && (__$ctx.__$a1 & 512) === 0) {
            var __$r = __$b148(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "i-bem") {
        if ($$elem === "i18n") {
            var __$r = __$b149(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    }
    var __$r = __$b150(__$ctx, __$ref);
    if (__$r !== __$ref) return __$r;
    return __$ref;
}

function __$wrapThis(ctx) {
    ctx._mode = $$mode;
    ctx.block = $$block;
    ctx.elem = $$elem;
    ctx.elemMods = $$elemMods;
    ctx.mods = $$mods;
    return ctx;
}

;
     return exports;
  }
  var defineAsGlobal = true;
  if(typeof exports === "object") {
    exports["BEMHTML"] = __bem_xjst({});
    defineAsGlobal = false;
  }
  if(typeof modules === "object") {
    modules.define("BEMHTML",
      function(provide) {
        provide(__bem_xjst({})) });
    defineAsGlobal = false;
  }
  defineAsGlobal && (g["BEMHTML"] = __bem_xjst({}));
})(this);