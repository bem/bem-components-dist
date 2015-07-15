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
        if (__$ctx.ctx && __$ctx.ctx._vow && (__$ctx.__$a1 & 64) === 0) {
            var __$r = __$b159(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (__$ctx.isSimple(__$ctx.ctx)) {
            var __$r = __$b160(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (!__$ctx.ctx) {
            var __$r = __$b161(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (__$ctx.isArray(__$ctx.ctx)) {
            var __$r = __$b162(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        var __$r = __$b163(__$ctx, __$ref);
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
    };
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
    var ts = {
        '"': "&quot;",
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
    }, f = function(t) {
        return ts[t] || t;
    };
    var buildEscape = function(r) {
        r = new RegExp(r, "g");
        return function(s) {
            return ("" + s).replace(r, f);
        };
    };
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
    BEMContext.prototype.xmlEscape = buildEscape("[&<>]");
    BEMContext.prototype.attrEscape = buildEscape('["&<>]');
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
        ctx["_attach"] = undefined;
        ctx["__$a1"] = 0;
        ctx["_ieCommented"] = undefined;
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
    var ctx__$189 = __$ctx.ctx, content__$190 = [ ctx__$189.icon ];
    "text" in ctx__$189 && content__$190.push({
        elem: "text",
        content: ctx__$189.text
    });
    return content__$190;
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
    var content__$154 = __$ctx.ctx.content;
    if (Array.isArray(content__$154)) return content__$154;
    var res__$155 = __$ctx.isSimple(content__$154) ? {
        block: "button",
        text: content__$154
    } : content__$154;
    if (res__$155.block === "button") {
        var resMods__$156 = res__$155.mods || (res__$155.mods = {}), dropdownMods__$157 = $$mods;
        resMods__$156.size || (resMods__$156.size = dropdownMods__$157.size);
        resMods__$156.theme || (resMods__$156.theme = dropdownMods__$157.theme);
        resMods__$156.disabled = dropdownMods__$157.disabled;
    }
    return res__$155;
}

function __$b23(__$ctx, __$ref) {
    var content__$150 = __$ctx.ctx.content;
    if (Array.isArray(content__$150)) return content__$150;
    var res__$151 = __$ctx.isSimple(content__$150) ? {
        block: "link",
        mods: {
            pseudo: true
        },
        content: content__$150
    } : content__$150;
    if (res__$151.block === "link") {
        var resMods__$152 = res__$151.mods || (res__$151.mods = {}), dropdownMods__$153 = $$mods;
        resMods__$152.theme || (resMods__$152.theme = dropdownMods__$153.theme);
        resMods__$152.disabled = dropdownMods__$153.disabled;
    }
    return res__$151;
}

function __$b24(__$ctx, __$ref) {
    var popup__$159 = __$ctx.ctx.popup;
    if (__$ctx.isSimple(popup__$159) || popup__$159.block !== "popup") {
        popup__$159 = {
            block: "popup",
            content: popup__$159
        };
    }
    var popupMods__$160 = popup__$159.mods || (popup__$159.mods = {});
    popupMods__$160.theme || (popupMods__$160.theme = $$mods.theme);
    popupMods__$160.hasOwnProperty("autoclosable") || (popupMods__$160.autoclosable = true);
    popupMods__$160.target = "anchor";
    return [ {
        elem: "switcher",
        content: __$ctx.ctx.switcher
    }, popup__$159 ];
}

function __$b25(__$ctx, __$ref) {
    var mods__$161 = $$mods, ctx__$162 = __$ctx.ctx, val__$163 = ctx__$162.val, isValDef__$164 = typeof val__$163 !== "undefined";
    if (isValDef__$164 && !Array.isArray(val__$163)) throw Error("checkbox-group: val must be an array");
    return (ctx__$162.options || []).map(function(option, i) {
        return [ !!i && !mods__$161.type && {
            tag: "br"
        }, {
            block: "checkbox",
            mods: {
                type: mods__$161.type,
                theme: mods__$161.theme,
                size: mods__$161.size,
                checked: isValDef__$164 && val__$163.indexOf(option.val) > -1,
                disabled: option.disabled || mods__$161.disabled
            },
            name: ctx__$162.name,
            val: option.val,
            text: option.text,
            title: option.title,
            icon: option.icon
        } ];
    });
}

function __$b26(__$ctx, __$ref) {
    var ctx__$165 = __$ctx.ctx, mods__$166 = $$mods;
    return [ {
        block: "button",
        mods: {
            togglable: "check",
            checked: mods__$166.checked,
            disabled: mods__$166.disabled,
            theme: mods__$166.theme,
            size: mods__$166.size
        },
        title: ctx__$165.title,
        content: [ ctx__$165.icon, typeof ctx__$165.text !== "undefined" ? {
            elem: "text",
            content: ctx__$165.text
        } : "" ]
    }, {
        block: "checkbox",
        elem: "control",
        checked: mods__$166.checked,
        disabled: mods__$166.disabled,
        name: ctx__$165.name,
        val: ctx__$165.val
    } ];
}

function __$b27(__$ctx, __$ref) {
    var ctx__$169 = __$ctx.ctx, mods__$170 = $$mods;
    return [ {
        elem: "box",
        content: {
            elem: "control",
            checked: mods__$170.checked,
            disabled: mods__$170.disabled,
            name: ctx__$169.name,
            val: ctx__$169.val
        }
    }, ctx__$169.text ];
}

function __$b28(__$ctx, __$ref) {
    var ctx__$197 = __$ctx.ctx, button__$198 = ctx__$197.button;
    __$ctx.isSimple(button__$198) && (button__$198 = {
        block: "button",
        tag: "span",
        text: button__$198
    });
    var attachMods__$199 = $$mods, buttonMods__$200 = button__$198.mods || (button__$198.mods = {});
    [ "size", "theme", "disabled", "focused" ].forEach(function(mod) {
        buttonMods__$200[mod] || (buttonMods__$200[mod] = attachMods__$199[mod]);
    });
    return [ button__$198, {
        elem: "no-file",
        content: __$ctx.ctx.noFileText
    } ];
}

function __$b29(__$ctx, __$ref) {
    var ctx__$207 = __$ctx.ctx, cond__$208 = ctx__$207.condition.replace("<", "lt").replace(">", "gt").replace("=", "e"), hasNegation__$209 = cond__$208.indexOf("!") > -1, includeOthers__$210 = ctx__$207.msieOnly === false, hasNegationOrIncludeOthers__$211 = hasNegation__$209 || includeOthers__$210;
    return [ "<!--[if " + cond__$208 + "]>", includeOthers__$210 ? "<!" : "", hasNegationOrIncludeOthers__$211 ? "-->" : "", function __$lb__$212() {
        var __$r__$213;
        var __$l0__$214 = __$ctx.__$a1;
        __$ctx.__$a1 = __$ctx.__$a1 | 2;
        __$r__$213 = applyc(__$ctx, __$ref);
        __$ctx.__$a1 = __$l0__$214;
        return __$r__$213;
    }(), hasNegationOrIncludeOthers__$211 ? "<!--" : "", "<![endif]-->" ];
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
    var ctx__$174 = __$ctx.ctx, attrs__$175 = {};
    ctx__$174.target && (attrs__$175.target = ctx__$174.target);
    $$mods.disabled ? attrs__$175["aria-disabled"] = true : attrs__$175.href = ctx__$174.url;
    return __$ctx.extend(function __$lb__$176() {
        var __$r__$177;
        var __$l0__$178 = __$ctx.__$a0;
        __$ctx.__$a0 = __$ctx.__$a0 | 67108864;
        __$r__$177 = applyc(__$ctx, __$ref);
        __$ctx.__$a0 = __$l0__$178;
        return __$r__$177;
    }(), attrs__$175);
}

function __$b38(__$ctx, __$ref) {
    var ctx__$191 = __$ctx.ctx, attrs__$192 = {
        type: $$mods.type || "button",
        name: ctx__$191.name,
        value: ctx__$191.val
    };
    $$mods.disabled && (attrs__$192.disabled = "disabled");
    return __$ctx.extend(function __$lb__$193() {
        var __$r__$194;
        var __$l0__$195 = __$ctx.__$a0;
        __$ctx.__$a0 = __$ctx.__$a0 | 536870912;
        __$r__$194 = applyc(__$ctx, __$ref);
        __$ctx.__$a0 = __$l0__$195;
        return __$r__$194;
    }(), attrs__$192);
}

function __$b39(__$ctx, __$ref) {
    var ctx__$196 = __$ctx.ctx;
    return {
        role: "button",
        tabindex: ctx__$196.tabIndex,
        id: ctx__$196.id,
        title: ctx__$196.title
    };
}

function __$b43(__$ctx, __$ref) {
    var attrs__$104 = {
        role: "menu"
    };
    $$mods.disabled || (attrs__$104.tabindex = 0);
    return attrs__$104;
}

function __$b44(__$ctx, __$ref) {
    var ctx__$143 = __$ctx.ctx, attrs__$144 = {}, tabIndex__$145;
    if (!$$mods.disabled) {
        if (ctx__$143.url) {
            attrs__$144.href = ctx__$143.url;
            tabIndex__$145 = ctx__$143.tabIndex;
        } else {
            tabIndex__$145 = ctx__$143.tabIndex || 0;
        }
    }
    typeof tabIndex__$145 === "undefined" || (attrs__$144.tabindex = tabIndex__$145);
    ctx__$143.title && (attrs__$144.title = ctx__$143.title);
    ctx__$143.target && (attrs__$144.target = ctx__$143.target);
    return attrs__$144;
}

function __$b48(__$ctx, __$ref) {
    var input__$128 = __$ctx._input, attrs__$129 = {
        id: input__$128.id,
        name: input__$128.name,
        value: input__$128.val,
        maxlength: input__$128.maxLength,
        tabindex: input__$128.tabIndex,
        placeholder: input__$128.placeholder
    };
    input__$128.autocomplete === false && (attrs__$129.autocomplete = "off");
    $$mods.disabled && (attrs__$129.disabled = "disabled");
    return attrs__$129;
}

function __$b49(__$ctx, __$ref) {
    var ctx__$136 = __$ctx.ctx;
    return __$ctx.extend(function __$lb__$137() {
        var __$r__$138;
        var __$l0__$139 = __$ctx.__$a0;
        __$ctx.__$a0 = __$ctx.__$a0 | 4194304;
        __$r__$138 = applyc(__$ctx, __$ref);
        __$ctx.__$a0 = __$l0__$139;
        return __$r__$138;
    }(), {
        src: ctx__$136.url,
        width: ctx__$136.width,
        height: ctx__$136.height,
        alt: ctx__$136.alt,
        title: ctx__$136.title
    });
}

function __$b51(__$ctx, __$ref) {
    var attrs__$167 = {
        type: "checkbox",
        autocomplete: "off"
    }, ctx__$168 = __$ctx.ctx;
    attrs__$167.name = ctx__$168.name;
    attrs__$167.value = ctx__$168.val;
    ctx__$168.checked && (attrs__$167.checked = "checked");
    ctx__$168.disabled && (attrs__$167.disabled = "disabled");
    return attrs__$167;
}

function __$b52(__$ctx, __$ref) {
    var attrs__$179 = {
        type: "file"
    }, attach__$180 = __$ctx._attach;
    if (attach__$180) {
        attrs__$179.name = attach__$180.name;
        attach__$180.mods && attach__$180.mods.disabled && (attrs__$179.disabled = "disabled");
        attach__$180.tabIndex && (attrs__$179.tabindex = attach__$180.tabIndex);
    }
    return attrs__$179;
}

function __$b53(__$ctx, __$ref) {
    var attrs__$184 = {
        "aria-hidden": "true"
    }, url__$185 = __$ctx.ctx.url;
    if (url__$185) attrs__$184.style = "background-image:url(" + url__$185 + ")";
    return attrs__$184;
}

function __$b54(__$ctx, __$ref) {
    var attrs__$218 = {};
    if (__$ctx.ctx.url) {
        attrs__$218.src = __$ctx.ctx.url;
    } else if (__$ctx._nonceCsp) {
        attrs__$218.nonce = __$ctx._nonceCsp;
    }
    return attrs__$218;
}

function __$b114(__$ctx, __$ref) {
    var ctx__$53 = __$ctx.ctx;
    return {
        name: ctx__$53.name,
        optionsMaxHeight: ctx__$53.optionsMaxHeight
    };
}

function __$b127(__$ctx, __$ref) {
    var ctx__$158 = __$ctx.ctx;
    return {
        mainOffset: ctx__$158.mainOffset,
        secondaryOffset: ctx__$158.secondaryOffset,
        viewportOffset: ctx__$158.viewportOffset,
        directions: ctx__$158.directions,
        zIndexGroupLevel: ctx__$158.zIndexGroupLevel
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
    return;
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
    return;
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
                mods: {
                    "has-title": !!optionOrGroup.title
                },
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
    return;
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
    return;
}

function __$b136(__$ctx, __$ref) {
    (__$ctx._firstItem.mods = __$ctx._firstItem.mods || {}).checked = true;
    var __$r__$89;
    var __$l0__$90 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 8192;
    __$r__$89 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l0__$90;
    return;
}

function __$b137(__$ctx, __$ref) {
    var ctx__$105 = __$ctx.ctx, mods__$106 = $$mods, firstItem__$107, checkedItems__$108 = [];
    if (ctx__$105.content) {
        var isValDef__$109 = typeof ctx__$105.val !== "undefined", containsVal__$110 = function(val) {
            return isValDef__$109 && (mods__$106.mode === "check" ? ctx__$105.val.indexOf(val) > -1 : ctx__$105.val === val);
        }, iterateItems__$111 = function(content) {
            var i__$112 = 0, itemOrGroup__$113;
            while (itemOrGroup__$113 = content[i__$112++]) {
                if (itemOrGroup__$113.block === "menu-item") {
                    firstItem__$107 || (firstItem__$107 = itemOrGroup__$113);
                    if (containsVal__$110(itemOrGroup__$113.val)) {
                        (itemOrGroup__$113.mods = itemOrGroup__$113.mods || {}).checked = true;
                        checkedItems__$108.push(itemOrGroup__$113);
                    }
                } else if (itemOrGroup__$113.content) {
                    iterateItems__$111(itemOrGroup__$113.content);
                }
            }
        };
        if (!__$ctx.isArray(ctx__$105.content)) throw Error("menu: content must be an array of the menu items");
        iterateItems__$111(ctx__$105.content);
    }
    var __$r__$115;
    var __$l0__$116 = __$ctx._firstItem;
    __$ctx._firstItem = firstItem__$107;
    var __$l1__$117 = __$ctx._checkedItems;
    __$ctx._checkedItems = checkedItems__$108;
    var __$l2__$118 = __$ctx._menuMods;
    __$ctx._menuMods = {
        theme: mods__$106.theme,
        disabled: mods__$106.disabled
    };
    var __$r__$120;
    var __$l3__$121 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 262144;
    __$r__$120 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l3__$121;
    __$r__$115 = __$r__$120;
    __$ctx._firstItem = __$l0__$116;
    __$ctx._checkedItems = __$l1__$117;
    __$ctx._menuMods = __$l2__$118;
    return;
}

function __$b138(__$ctx, __$ref) {
    if ($$mods.type !== "button") throw Error("Modifier mode=radio-check can be only with modifier type=button");
    var __$r__$72;
    var __$l0__$73 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 2048;
    __$r__$72 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l0__$73;
    return;
}

function __$b139(__$ctx, __$ref) {
    delete __$ctx._menuItemDisabled;
    $$mods.disabled = true;
    applyc(__$ctx, __$ref);
    return;
}

function __$b140(__$ctx, __$ref) {
    var ctx__$146 = __$ctx.ctx;
    typeof ctx__$146.url === "object" && (ctx__$146.url = __$ctx.reapply(ctx__$146.url));
    var __$r__$148;
    var __$l0__$149 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 16777216;
    __$r__$148 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l0__$149;
    return;
}

function __$b141(__$ctx, __$ref) {
    var __$r__$86;
    var __$l0__$87 = __$ctx._menuItemDisabled;
    __$ctx._menuItemDisabled = true;
    __$r__$86 = applyc(__$ctx, __$ref);
    __$ctx._menuItemDisabled = __$l0__$87;
    return;
}

function __$b142(__$ctx, __$ref) {
    var mods__$100 = $$mods;
    mods__$100.theme = mods__$100.theme || __$ctx._menuMods.theme;
    mods__$100.disabled = mods__$100.disabled || __$ctx._menuMods.disabled;
    var __$r__$102;
    var __$l0__$103 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 131072;
    __$r__$102 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l0__$103;
    return;
}

function __$b143(__$ctx, __$ref) {
    var __$r__$131;
    var __$l0__$132 = __$ctx._input;
    __$ctx._input = __$ctx.ctx;
    var __$r__$134;
    var __$l1__$135 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 2097152;
    __$r__$134 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l1__$135;
    __$r__$131 = __$r__$134;
    __$ctx._input = __$l0__$132;
    return;
}

function __$b144(__$ctx, __$ref) {
    var __$r__$202;
    var __$l0__$203 = __$ctx._attach;
    __$ctx._attach = __$ctx.ctx;
    var __$r__$205;
    var __$l1__$206 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 1;
    __$r__$205 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l1__$206;
    __$r__$202 = __$r__$205;
    __$ctx._attach = __$l0__$203;
    return;
}

function __$b145(__$ctx, __$ref) {
    var url__$219 = __$ctx.ctx.url;
    var __$r__$221;
    var __$l0__$222 = $$mode;
    $$mode = "";
    var __$l1__$223 = __$ctx.ctx;
    __$ctx.ctx = [ 6, 7, 8, 9 ].map(function(v) {
        return {
            elem: "css",
            url: url__$219 + ".ie" + v + ".css",
            ie: "IE " + v
        };
    });
    var __$r__$225;
    var __$l2__$226 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 8;
    __$r__$225 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$226;
    __$r__$221 = __$r__$225;
    $$mode = __$l0__$222;
    __$ctx.ctx = __$l1__$223;
    return;
}

function __$b146(__$ctx, __$ref) {
    var ie__$227 = __$ctx.ctx.ie, hideRule__$228 = !ie__$227 ? [ "gt IE 9", "<!-->", "<!--" ] : ie__$227 === "!IE" ? [ ie__$227, "<!-->", "<!--" ] : [ ie__$227, "", "" ];
    var __$r__$230;
    var __$l0__$231 = $$mode;
    $$mode = "";
    var __$l3__$232 = __$ctx.ctx;
    var __$l1__$233 = __$l3__$232._ieCommented;
    __$l3__$232._ieCommented = true;
    var __$l2__$234 = __$ctx.ctx;
    __$ctx.ctx = [ "<!--[if " + hideRule__$228[0] + "]>" + hideRule__$228[1], __$ctx.ctx, hideRule__$228[2] + "<![endif]-->" ];
    __$r__$230 = applyc(__$ctx, __$ref);
    $$mode = __$l0__$231;
    __$l3__$232._ieCommented = __$l1__$233;
    __$ctx.ctx = __$l2__$234;
    return;
}

function __$b147(__$ctx, __$ref) {
    var ctx__$238 = __$ctx.ctx;
    __$ctx._nonceCsp = ctx__$238.nonce;
    var __$r__$240;
    var __$l0__$241 = $$mode;
    $$mode = "";
    var __$l1__$242 = __$ctx.ctx;
    __$ctx.ctx = [ ctx__$238.doctype || "<!DOCTYPE html>", {
        tag: "html",
        cls: "ua_js_no",
        content: [ {
            elem: "head",
            content: [ {
                tag: "meta",
                attrs: {
                    charset: "utf-8"
                }
            }, ctx__$238.uaCompatible === false ? "" : {
                tag: "meta",
                attrs: {
                    "http-equiv": "X-UA-Compatible",
                    content: ctx__$238.uaCompatible || "IE=edge"
                }
            }, {
                tag: "title",
                content: ctx__$238.title
            }, {
                block: "ua",
                attrs: {
                    nonce: ctx__$238.nonce
                }
            }, ctx__$238.head, ctx__$238.styles, ctx__$238.favicon ? {
                elem: "favicon",
                url: ctx__$238.favicon
            } : "" ]
        }, ctx__$238 ]
    } ];
    var __$r__$244;
    var __$l2__$245 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 32;
    __$r__$244 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$245;
    __$r__$240 = __$r__$244;
    $$mode = __$l0__$241;
    __$ctx.ctx = __$l1__$242;
    return;
}

function __$b148(__$ctx, __$ref) {
    if (!__$ctx.ctx) return "";
    var ctx__$246 = __$ctx.ctx, keyset__$247 = ctx__$246.keyset, key__$248 = ctx__$246.key, params__$249 = ctx__$246.params || {};
    if (!(keyset__$247 || key__$248)) return "";
    if (typeof ctx__$246.content === "undefined" || ctx__$246.content !== null) {
        params__$249.content = exports.apply(ctx__$246.content);
    }
    __$ctx._buf.push(BEM.I18N(keyset__$247, key__$248, params__$249));
    return;
}

function __$b149(__$ctx, __$ref) {
    var BEM_INTERNAL__$250 = __$ctx.BEM.INTERNAL, ctx__$251 = __$ctx.ctx, isBEM__$252, tag__$253, res__$254;
    var __$r__$256;
    var __$l0__$257 = __$ctx._str;
    __$ctx._str = "";
    var vBlock__$258 = $$block;
    var __$r__$260;
    var __$l1__$261 = $$mode;
    $$mode = "tag";
    __$r__$260 = applyc(__$ctx, __$ref);
    $$mode = __$l1__$261;
    tag__$253 = __$r__$260;
    typeof tag__$253 !== "undefined" || (tag__$253 = ctx__$251.tag);
    typeof tag__$253 !== "undefined" || (tag__$253 = "div");
    if (tag__$253) {
        var jsParams__$262, js__$263;
        if (vBlock__$258 && ctx__$251.js !== false) {
            var __$r__$264;
            var __$l2__$265 = $$mode;
            $$mode = "js";
            __$r__$264 = applyc(__$ctx, __$ref);
            $$mode = __$l2__$265;
            js__$263 = __$r__$264;
            js__$263 = js__$263 ? __$ctx.extend(ctx__$251.js, js__$263 === true ? {} : js__$263) : ctx__$251.js === true ? {} : ctx__$251.js;
            js__$263 && ((jsParams__$262 = {})[BEM_INTERNAL__$250.buildClass(vBlock__$258, ctx__$251.elem)] = js__$263);
        }
        __$ctx._str += "<" + tag__$253;
        var __$r__$266;
        var __$l3__$267 = $$mode;
        $$mode = "bem";
        __$r__$266 = applyc(__$ctx, __$ref);
        $$mode = __$l3__$267;
        isBEM__$252 = __$r__$266;
        typeof isBEM__$252 !== "undefined" || (isBEM__$252 = typeof ctx__$251.bem !== "undefined" ? ctx__$251.bem : ctx__$251.block || ctx__$251.elem);
        var __$r__$269;
        var __$l4__$270 = $$mode;
        $$mode = "cls";
        __$r__$269 = applyc(__$ctx, __$ref);
        $$mode = __$l4__$270;
        var cls__$268 = __$r__$269;
        cls__$268 || (cls__$268 = ctx__$251.cls);
        var addJSInitClass__$271 = ctx__$251.block && jsParams__$262 && !ctx__$251.elem;
        if (isBEM__$252 || cls__$268) {
            __$ctx._str += ' class="';
            if (isBEM__$252) {
                __$ctx._str += BEM_INTERNAL__$250.buildClasses(vBlock__$258, ctx__$251.elem, ctx__$251.elemMods || ctx__$251.mods);
                var __$r__$273;
                var __$l5__$274 = $$mode;
                $$mode = "mix";
                __$r__$273 = applyc(__$ctx, __$ref);
                $$mode = __$l5__$274;
                var mix__$272 = __$r__$273;
                ctx__$251.mix && (mix__$272 = mix__$272 ? [].concat(mix__$272, ctx__$251.mix) : ctx__$251.mix);
                if (mix__$272) {
                    var visited__$275 = {}, visitedKey__$276 = function(block, elem) {
                        return (block || "") + "__" + (elem || "");
                    };
                    visited__$275[visitedKey__$276(vBlock__$258, $$elem)] = true;
                    __$ctx.isArray(mix__$272) || (mix__$272 = [ mix__$272 ]);
                    for (var i__$277 = 0; i__$277 < mix__$272.length; i__$277++) {
                        var mixItem__$278 = mix__$272[i__$277], hasItem__$279 = mixItem__$278.block && (vBlock__$258 !== ctx__$251.block || mixItem__$278.block !== vBlock__$258) || mixItem__$278.elem, mixBlock__$280 = mixItem__$278.block || mixItem__$278._block || $$block, mixElem__$281 = mixItem__$278.elem || mixItem__$278._elem || $$elem;
                        hasItem__$279 && (__$ctx._str += " ");
                        __$ctx._str += BEM_INTERNAL__$250[hasItem__$279 ? "buildClasses" : "buildModsClasses"](mixBlock__$280, mixItem__$278.elem || mixItem__$278._elem || (mixItem__$278.block ? undefined : $$elem), mixItem__$278.elemMods || mixItem__$278.mods);
                        if (mixItem__$278.js) {
                            (jsParams__$262 || (jsParams__$262 = {}))[BEM_INTERNAL__$250.buildClass(mixBlock__$280, mixItem__$278.elem)] = mixItem__$278.js === true ? {} : mixItem__$278.js;
                            addJSInitClass__$271 || (addJSInitClass__$271 = mixBlock__$280 && !mixItem__$278.elem);
                        }
                        if (hasItem__$279 && !visited__$275[visitedKey__$276(mixBlock__$280, mixElem__$281)]) {
                            visited__$275[visitedKey__$276(mixBlock__$280, mixElem__$281)] = true;
                            var __$r__$283;
                            var __$l6__$284 = $$mode;
                            $$mode = "mix";
                            var __$l7__$285 = $$block;
                            $$block = mixBlock__$280;
                            var __$l8__$286 = $$elem;
                            $$elem = mixElem__$281;
                            __$r__$283 = applyc(__$ctx, __$ref);
                            $$mode = __$l6__$284;
                            $$block = __$l7__$285;
                            $$elem = __$l8__$286;
                            var nestedMix__$282 = __$r__$283;
                            if (nestedMix__$282) {
                                for (var j__$287 = 0; j__$287 < nestedMix__$282.length; j__$287++) {
                                    var nestedItem__$288 = nestedMix__$282[j__$287];
                                    if (!nestedItem__$288.block && !nestedItem__$288.elem || !visited__$275[visitedKey__$276(nestedItem__$288.block, nestedItem__$288.elem)]) {
                                        nestedItem__$288._block = mixBlock__$280;
                                        nestedItem__$288._elem = mixElem__$281;
                                        mix__$272.splice(i__$277 + 1, 0, nestedItem__$288);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            cls__$268 && (__$ctx._str += isBEM__$252 ? " " + cls__$268 : cls__$268);
            __$ctx._str += addJSInitClass__$271 ? ' i-bem"' : '"';
        }
        if (isBEM__$252 && jsParams__$262) {
            __$ctx._str += ' data-bem="' + __$ctx.attrEscape(JSON.stringify(jsParams__$262)) + '"';
        }
        var __$r__$290;
        var __$l9__$291 = $$mode;
        $$mode = "attrs";
        __$r__$290 = applyc(__$ctx, __$ref);
        $$mode = __$l9__$291;
        var attrs__$289 = __$r__$290;
        attrs__$289 = __$ctx.extend(attrs__$289, ctx__$251.attrs);
        if (attrs__$289) {
            var name__$292, attr__$293;
            for (name__$292 in attrs__$289) {
                attr__$293 = attrs__$289[name__$292];
                if (typeof attr__$293 === "undefined") continue;
                __$ctx._str += " " + name__$292 + '="' + __$ctx.attrEscape(__$ctx.isSimple(attr__$293) ? attr__$293 : __$ctx.reapply(attr__$293)) + '"';
            }
        }
    }
    if (__$ctx.isShortTag(tag__$253)) {
        __$ctx._str += "/>";
    } else {
        tag__$253 && (__$ctx._str += ">");
        var __$r__$295;
        var __$l10__$296 = $$mode;
        $$mode = "content";
        __$r__$295 = applyc(__$ctx, __$ref);
        $$mode = __$l10__$296;
        var content__$294 = __$r__$295;
        if (content__$294 || content__$294 === 0) {
            isBEM__$252 = vBlock__$258 || $$elem;
            var __$r__$297;
            var __$l11__$298 = $$mode;
            $$mode = "";
            var __$l12__$299 = __$ctx._notNewList;
            __$ctx._notNewList = false;
            var __$l13__$300 = __$ctx.position;
            __$ctx.position = isBEM__$252 ? 1 : __$ctx.position;
            var __$l14__$301 = __$ctx._listLength;
            __$ctx._listLength = isBEM__$252 ? 1 : __$ctx._listLength;
            var __$l15__$302 = __$ctx.ctx;
            __$ctx.ctx = content__$294;
            __$r__$297 = applyc(__$ctx, __$ref);
            $$mode = __$l11__$298;
            __$ctx._notNewList = __$l12__$299;
            __$ctx.position = __$l13__$300;
            __$ctx._listLength = __$l14__$301;
            __$ctx.ctx = __$l15__$302;
        }
        tag__$253 && (__$ctx._str += "</" + tag__$253 + ">");
    }
    res__$254 = __$ctx._str;
    __$r__$256 = undefined;
    __$ctx._str = __$l0__$257;
    __$ctx._buf.push(res__$254);
    return;
}

function __$b159(__$ctx, __$ref) {
    var __$r__$304;
    var __$l0__$305 = $$mode;
    $$mode = "";
    var __$l1__$306 = __$ctx.ctx;
    __$ctx.ctx = __$ctx.ctx._value;
    var __$r__$308;
    var __$l2__$309 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 64;
    __$r__$308 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$309;
    __$r__$304 = __$r__$308;
    $$mode = __$l0__$305;
    __$ctx.ctx = __$l1__$306;
    return;
}

function __$b160(__$ctx, __$ref) {
    __$ctx._listLength--;
    var ctx__$310 = __$ctx.ctx;
    if (ctx__$310 && ctx__$310 !== true || ctx__$310 === 0) {
        __$ctx._str += ctx__$310 + "";
    }
    return;
}

function __$b161(__$ctx, __$ref) {
    __$ctx._listLength--;
    return;
}

function __$b162(__$ctx, __$ref) {
    var ctx__$311 = __$ctx.ctx, len__$312 = ctx__$311.length, i__$313 = 0, prevPos__$314 = __$ctx.position, prevNotNewList__$315 = __$ctx._notNewList;
    if (prevNotNewList__$315) {
        __$ctx._listLength += len__$312 - 1;
    } else {
        __$ctx.position = 0;
        __$ctx._listLength = len__$312;
    }
    __$ctx._notNewList = true;
    while (i__$313 < len__$312) (function __$lb__$316() {
        var __$r__$317;
        var __$l0__$318 = __$ctx.ctx;
        __$ctx.ctx = ctx__$311[i__$313++];
        __$r__$317 = applyc(__$ctx, __$ref);
        __$ctx.ctx = __$l0__$318;
        return __$r__$317;
    })();
    prevNotNewList__$315 || (__$ctx.position = prevPos__$314);
    return;
}

function __$b163(__$ctx, __$ref) {
    __$ctx.ctx || (__$ctx.ctx = {});
    var vBlock__$319 = __$ctx.ctx.block, vElem__$320 = __$ctx.ctx.elem, block__$321 = __$ctx._currBlock || $$block;
    var __$r__$323;
    var __$l0__$324 = $$mode;
    $$mode = "default";
    var __$l1__$325 = $$block;
    $$block = vBlock__$319 || (vElem__$320 ? block__$321 : undefined);
    var __$l2__$326 = __$ctx._currBlock;
    __$ctx._currBlock = vBlock__$319 || vElem__$320 ? undefined : block__$321;
    var __$l3__$327 = $$elem;
    $$elem = vElem__$320;
    var __$l4__$328 = $$mods;
    $$mods = vBlock__$319 ? __$ctx.ctx.mods || (__$ctx.ctx.mods = {}) : $$mods;
    var __$l5__$329 = $$elemMods;
    $$elemMods = __$ctx.ctx.elemMods || {};
    $$block || $$elem ? __$ctx.position = (__$ctx.position || 0) + 1 : __$ctx._listLength--;
    applyc(__$ctx, __$ref);
    __$r__$323 = undefined;
    $$mode = __$l0__$324;
    $$block = __$l1__$325;
    __$ctx._currBlock = __$l2__$326;
    $$elem = __$l3__$327;
    $$mods = __$l4__$328;
    $$elemMods = __$l5__$329;
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
            if (__$ctx._attach && (__$ctx.__$a0 & 134217728) === 0) {
                return [ {
                    block: "attach",
                    elem: "control"
                }, function __$lb__$181() {
                    var __$r__$182;
                    var __$l0__$183 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 134217728;
                    __$r__$182 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$183;
                    return __$r__$182;
                }() ];
            }
            if (typeof __$ctx.ctx.content !== "undefined") {
                return __$ctx.ctx.content;
            }
            var __$r = __$b16(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "menu") {
        if ($$elem === "group" && typeof __$ctx.ctx.title !== "undefined" && (__$ctx.__$a0 & 16384) === 0) {
            return [ {
                elem: "group-title",
                content: __$ctx.ctx.title
            }, function __$lb__$91() {
                var __$r__$92;
                var __$l0__$93 = __$ctx.__$a0;
                __$ctx.__$a0 = __$ctx.__$a0 | 16384;
                __$r__$92 = applyc(__$ctx, __$ref);
                __$ctx.__$a0 = __$l0__$93;
                return __$r__$92;
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
        if ($$elem === "conditional-comment" && (__$ctx.__$a1 & 2) === 0) {
            var __$r = __$b29(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (!$$elem && (__$ctx.__$a1 & 16) === 0) {
            return [ function __$lb__$235() {
                var __$r__$236;
                var __$l0__$237 = __$ctx.__$a1;
                __$ctx.__$a1 = __$ctx.__$a1 | 16;
                __$r__$236 = applyc(__$ctx, __$ref);
                __$ctx.__$a1 = __$l0__$237;
                return __$r__$236;
            }(), __$ctx.ctx.scripts ];
        }
    } else if (__$t === "ua") {
        if (!$$elem && (__$ctx.__$a1 & 4) === 0) {
            return [ function __$lb__$215() {
                var __$r__$216;
                var __$l0__$217 = __$ctx.__$a1;
                __$ctx.__$a1 = __$ctx.__$a1 | 4;
                __$r__$216 = applyc(__$ctx, __$ref);
                __$ctx.__$a1 = __$l0__$217;
                return __$r__$216;
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
            if ($$mods && $$mods["type"] === "link" && (__$ctx.__$a0 & 67108864) === 0) {
                var __$r = __$b37(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            if ((!$$mods.type || $$mods.type === "submit") && (__$ctx.__$a0 & 536870912) === 0) {
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
            if (typeof __$ctx.ctx.title !== "undefined" && (__$ctx.__$a0 & 32768) === 0) {
                var __$r = __$ctx.extend(function __$lb__$94() {
                    var __$r__$95;
                    var __$l0__$96 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 32768;
                    __$r__$95 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$96;
                    return __$r__$95;
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
                    if ((__$ctx.__$a0 & 524288) === 0) {
                        var __$r = __$ctx.extend(function __$lb__$122() {
                            var __$r__$123;
                            var __$l0__$124 = __$ctx.__$a0;
                            __$ctx.__$a0 = __$ctx.__$a0 | 524288;
                            __$r__$123 = applyc(__$ctx, __$ref);
                            __$ctx.__$a0 = __$l0__$124;
                            return __$r__$123;
                        }(), {
                            type: "search"
                        });
                        if (__$r !== __$ref) return __$r;
                    }
                } else if (__$t === "password") {
                    if ((__$ctx.__$a0 & 1048576) === 0) {
                        var __$r = __$ctx.extend(function __$lb__$125() {
                            var __$r__$126;
                            var __$l0__$127 = __$ctx.__$a0;
                            __$ctx.__$a0 = __$ctx.__$a0 | 1048576;
                            __$r__$126 = applyc(__$ctx, __$ref);
                            __$ctx.__$a0 = __$l0__$127;
                            return __$r__$126;
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
            if (typeof __$ctx.ctx.content === "undefined" && (__$ctx.__$a0 & 4194304) === 0) {
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
                if ($$mods && $$mods["type"] === "link" && $$mods["disabled"] === true && (__$ctx.__$a0 & 33554432) === 0) {
                    var __$r = __$ctx.extend(function __$lb__$171() {
                        var __$r__$172;
                        var __$l0__$173 = __$ctx.__$a0;
                        __$ctx.__$a0 = __$ctx.__$a0 | 33554432;
                        __$r__$172 = applyc(__$ctx, __$ref);
                        __$ctx.__$a0 = __$l0__$173;
                        return __$r__$172;
                    }(), {
                        url: __$ctx.ctx.url
                    });
                    if (__$r !== __$ref) return __$r;
                }
                if ($$mods["focused"] === true && (__$ctx.__$a0 & 268435456) === 0) {
                    var __$r = __$ctx.extend(function __$lb__$186() {
                        var __$r__$187;
                        var __$l0__$188 = __$ctx.__$a0;
                        __$ctx.__$a0 = __$ctx.__$a0 | 268435456;
                        __$r__$187 = applyc(__$ctx, __$ref);
                        __$ctx.__$a0 = __$l0__$188;
                        return __$r__$187;
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
            if ($$mods && $$mods["focused"] === true && (__$ctx.__$a0 & 65536) === 0) {
                var __$r = __$ctx.extend(function __$lb__$97() {
                    var __$r__$98;
                    var __$l0__$99 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 65536;
                    __$r__$98 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$99;
                    return __$r__$98;
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
            if ($$mods && $$mods["disabled"] === true && (__$ctx.__$a0 & 8388608) === 0) {
                var __$r = __$ctx.extend(function __$lb__$140() {
                    var __$r__$141;
                    var __$l0__$142 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 8388608;
                    __$r__$141 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$142;
                    return __$r__$141;
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
    } else if (__$t === "menu") {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods["mode"] === "radio" && __$ctx._firstItem && __$ctx._checkedItems && !__$ctx._checkedItems.length && (__$ctx.__$a0 & 8192) === 0) {
                var __$r = __$b136(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            if ((__$ctx.__$a0 & 262144) === 0) {
                var __$r = __$b137(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
        }
    } else if (__$t === "radio-group") {
        if (!$$elem && $$mods && $$mods["mode"] === "radio-check" && (__$ctx.__$a0 & 2048) === 0) {
            var __$r = __$b138(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "link") {
        var __$t = !$$elem;
        if (__$t) {
            if (__$ctx._menuItemDisabled) {
                var __$r = __$b139(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            if ((__$ctx.__$a0 & 16777216) === 0) {
                var __$r = __$b140(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
        }
    } else if (__$t === "menu-item") {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods && $$mods["type"] === "link" && $$mods["disabled"] === true && !__$ctx._menuItemDisabled) {
                var __$r = __$b141(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            if (__$ctx._menuMods && (__$ctx.__$a0 & 131072) === 0) {
                var __$r = __$b142(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
        }
    } else if (__$t === "input") {
        if (!$$elem && (__$ctx.__$a0 & 2097152) === 0) {
            var __$r = __$b143(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "attach") {
        if (!$$elem && (__$ctx.__$a1 & 1) === 0) {
            var __$r = __$b144(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "page") {
        var __$t = $$elem;
        if (__$t === "css") {
            var __$t = !__$ctx.ctx._ieCommented;
            if (__$t) {
                var __$t = __$ctx.ctx.hasOwnProperty("ie");
                if (__$t) {
                    if (__$ctx.ctx.ie === true && (__$ctx.__$a1 & 8) === 0) {
                        var __$r = __$b145(__$ctx, __$ref);
                        if (__$r !== __$ref) return __$r;
                    }
                    var __$r = __$b146(__$ctx, __$ref);
                    if (__$r !== __$ref) return __$r;
                }
            }
        }
        if (!$$elem && (__$ctx.__$a1 & 32) === 0) {
            var __$r = __$b147(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "i-bem") {
        if ($$elem === "i18n") {
            var __$r = __$b148(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    }
    var __$r = __$b149(__$ctx, __$ref);
    if (__$r !== __$ref) return __$r;
    return __$ref;
};
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