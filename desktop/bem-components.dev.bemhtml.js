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
    var ctx__$187 = __$ctx.ctx, content__$188 = [ ctx__$187.icon ];
    "text" in ctx__$187 && content__$188.push({
        elem: "text",
        content: ctx__$187.text
    });
    return content__$188;
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
    var content__$152 = __$ctx.ctx.content;
    if (Array.isArray(content__$152)) return content__$152;
    var res__$153 = __$ctx.isSimple(content__$152) ? {
        block: "button",
        text: content__$152
    } : content__$152;
    if (res__$153.block === "button") {
        var resMods__$154 = res__$153.mods || (res__$153.mods = {}), dropdownMods__$155 = $$mods;
        resMods__$154.size || (resMods__$154.size = dropdownMods__$155.size);
        resMods__$154.theme || (resMods__$154.theme = dropdownMods__$155.theme);
        resMods__$154.disabled = dropdownMods__$155.disabled;
    }
    return res__$153;
}

function __$b23(__$ctx, __$ref) {
    var content__$148 = __$ctx.ctx.content;
    if (Array.isArray(content__$148)) return content__$148;
    var res__$149 = __$ctx.isSimple(content__$148) ? {
        block: "link",
        mods: {
            pseudo: true
        },
        content: content__$148
    } : content__$148;
    if (res__$149.block === "link") {
        var resMods__$150 = res__$149.mods || (res__$149.mods = {}), dropdownMods__$151 = $$mods;
        resMods__$150.theme || (resMods__$150.theme = dropdownMods__$151.theme);
        resMods__$150.disabled = dropdownMods__$151.disabled;
    }
    return res__$149;
}

function __$b24(__$ctx, __$ref) {
    var popup__$157 = __$ctx.ctx.popup;
    if (__$ctx.isSimple(popup__$157) || popup__$157.block !== "popup") {
        popup__$157 = {
            block: "popup",
            content: popup__$157
        };
    }
    var popupMods__$158 = popup__$157.mods || (popup__$157.mods = {});
    popupMods__$158.theme || (popupMods__$158.theme = $$mods.theme);
    popupMods__$158.hasOwnProperty("autoclosable") || (popupMods__$158.autoclosable = true);
    popupMods__$158.target = "anchor";
    return [ {
        elem: "switcher",
        content: __$ctx.ctx.switcher
    }, popup__$157 ];
}

function __$b25(__$ctx, __$ref) {
    var mods__$159 = $$mods, ctx__$160 = __$ctx.ctx, val__$161 = ctx__$160.val, isValDef__$162 = typeof val__$161 !== "undefined";
    if (isValDef__$162 && !Array.isArray(val__$161)) throw Error("checkbox-group: val must be an array");
    return (ctx__$160.options || []).map(function(option, i) {
        return [ !!i && !mods__$159.type && {
            tag: "br"
        }, {
            block: "checkbox",
            mods: {
                type: mods__$159.type,
                theme: mods__$159.theme,
                size: mods__$159.size,
                checked: isValDef__$162 && val__$161.indexOf(option.val) > -1,
                disabled: option.disabled || mods__$159.disabled
            },
            name: ctx__$160.name,
            val: option.val,
            text: option.text,
            title: option.title,
            icon: option.icon
        } ];
    });
}

function __$b26(__$ctx, __$ref) {
    var ctx__$163 = __$ctx.ctx, mods__$164 = $$mods;
    return [ {
        block: "button",
        mods: {
            togglable: "check",
            checked: mods__$164.checked,
            disabled: mods__$164.disabled,
            theme: mods__$164.theme,
            size: mods__$164.size
        },
        title: ctx__$163.title,
        content: [ ctx__$163.icon, typeof ctx__$163.text !== "undefined" ? {
            elem: "text",
            content: ctx__$163.text
        } : "" ]
    }, {
        block: "checkbox",
        elem: "control",
        checked: mods__$164.checked,
        disabled: mods__$164.disabled,
        name: ctx__$163.name,
        val: ctx__$163.val
    } ];
}

function __$b27(__$ctx, __$ref) {
    var ctx__$167 = __$ctx.ctx, mods__$168 = $$mods;
    return [ {
        elem: "box",
        content: {
            elem: "control",
            checked: mods__$168.checked,
            disabled: mods__$168.disabled,
            name: ctx__$167.name,
            val: ctx__$167.val
        }
    }, ctx__$167.text ];
}

function __$b28(__$ctx, __$ref) {
    var ctx__$195 = __$ctx.ctx, button__$196 = ctx__$195.button;
    __$ctx.isSimple(button__$196) && (button__$196 = {
        block: "button",
        tag: "span",
        text: button__$196
    });
    var attachMods__$197 = $$mods, buttonMods__$198 = button__$196.mods || (button__$196.mods = {});
    [ "size", "theme", "disabled", "focused" ].forEach(function(mod) {
        buttonMods__$198[mod] || (buttonMods__$198[mod] = attachMods__$197[mod]);
    });
    return [ button__$196, {
        elem: "no-file",
        content: __$ctx.ctx.noFileText
    } ];
}

function __$b29(__$ctx, __$ref) {
    var ctx__$205 = __$ctx.ctx, cond__$206 = ctx__$205.condition.replace("<", "lt").replace(">", "gt").replace("=", "e"), hasNegation__$207 = cond__$206.indexOf("!") > -1, includeOthers__$208 = ctx__$205.msieOnly === false, hasNegationOrIncludeOthers__$209 = hasNegation__$207 || includeOthers__$208;
    return [ "<!--[if " + cond__$206 + "]>", includeOthers__$208 ? "<!" : "", hasNegationOrIncludeOthers__$209 ? "-->" : "", function __$lb__$210() {
        var __$r__$211;
        var __$l0__$212 = __$ctx.__$a1;
        __$ctx.__$a1 = __$ctx.__$a1 | 2;
        __$r__$211 = applyc(__$ctx, __$ref);
        __$ctx.__$a1 = __$l0__$212;
        return __$r__$211;
    }(), hasNegationOrIncludeOthers__$209 ? "<!--" : "", "<![endif]-->" ];
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
    var ctx__$172 = __$ctx.ctx, attrs__$173 = {};
    ctx__$172.target && (attrs__$173.target = ctx__$172.target);
    $$mods.disabled ? attrs__$173["aria-disabled"] = true : attrs__$173.href = ctx__$172.url;
    return __$ctx.extend(function __$lb__$174() {
        var __$r__$175;
        var __$l0__$176 = __$ctx.__$a0;
        __$ctx.__$a0 = __$ctx.__$a0 | 67108864;
        __$r__$175 = applyc(__$ctx, __$ref);
        __$ctx.__$a0 = __$l0__$176;
        return __$r__$175;
    }(), attrs__$173);
}

function __$b38(__$ctx, __$ref) {
    var ctx__$189 = __$ctx.ctx, attrs__$190 = {
        type: $$mods.type || "button",
        name: ctx__$189.name,
        value: ctx__$189.val
    };
    $$mods.disabled && (attrs__$190.disabled = "disabled");
    return __$ctx.extend(function __$lb__$191() {
        var __$r__$192;
        var __$l0__$193 = __$ctx.__$a0;
        __$ctx.__$a0 = __$ctx.__$a0 | 536870912;
        __$r__$192 = applyc(__$ctx, __$ref);
        __$ctx.__$a0 = __$l0__$193;
        return __$r__$192;
    }(), attrs__$190);
}

function __$b39(__$ctx, __$ref) {
    var ctx__$194 = __$ctx.ctx;
    return {
        role: "button",
        tabindex: ctx__$194.tabIndex,
        id: ctx__$194.id,
        title: ctx__$194.title
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
    var ctx__$141 = __$ctx.ctx, attrs__$142 = {}, tabIndex__$143;
    if (!$$mods.disabled) {
        if (ctx__$141.url) {
            attrs__$142.href = ctx__$141.url;
            tabIndex__$143 = ctx__$141.tabIndex;
        } else {
            tabIndex__$143 = ctx__$141.tabIndex || 0;
        }
    }
    typeof tabIndex__$143 === "undefined" || (attrs__$142.tabindex = tabIndex__$143);
    ctx__$141.title && (attrs__$142.title = ctx__$141.title);
    ctx__$141.target && (attrs__$142.target = ctx__$141.target);
    return attrs__$142;
}

function __$b48(__$ctx, __$ref) {
    var input__$126 = __$ctx._input, attrs__$127 = {
        id: input__$126.id,
        name: input__$126.name,
        value: input__$126.val,
        maxlength: input__$126.maxLength,
        tabindex: input__$126.tabIndex,
        placeholder: input__$126.placeholder
    };
    input__$126.autocomplete === false && (attrs__$127.autocomplete = "off");
    $$mods.disabled && (attrs__$127.disabled = "disabled");
    return attrs__$127;
}

function __$b49(__$ctx, __$ref) {
    var ctx__$134 = __$ctx.ctx;
    return __$ctx.extend(function __$lb__$135() {
        var __$r__$136;
        var __$l0__$137 = __$ctx.__$a0;
        __$ctx.__$a0 = __$ctx.__$a0 | 4194304;
        __$r__$136 = applyc(__$ctx, __$ref);
        __$ctx.__$a0 = __$l0__$137;
        return __$r__$136;
    }(), {
        src: ctx__$134.url,
        width: ctx__$134.width,
        height: ctx__$134.height,
        alt: ctx__$134.alt,
        title: ctx__$134.title
    });
}

function __$b51(__$ctx, __$ref) {
    var attrs__$165 = {
        type: "checkbox",
        autocomplete: "off"
    }, ctx__$166 = __$ctx.ctx;
    attrs__$165.name = ctx__$166.name;
    attrs__$165.value = ctx__$166.val;
    ctx__$166.checked && (attrs__$165.checked = "checked");
    ctx__$166.disabled && (attrs__$165.disabled = "disabled");
    return attrs__$165;
}

function __$b52(__$ctx, __$ref) {
    var attrs__$177 = {
        type: "file"
    }, attach__$178 = __$ctx._attach;
    if (attach__$178) {
        attrs__$177.name = attach__$178.name;
        attach__$178.mods && attach__$178.mods.disabled && (attrs__$177.disabled = "disabled");
        attach__$178.tabIndex && (attrs__$177.tabindex = attach__$178.tabIndex);
    }
    return attrs__$177;
}

function __$b53(__$ctx, __$ref) {
    var attrs__$182 = {
        "aria-hidden": "true"
    }, url__$183 = __$ctx.ctx.url;
    if (url__$183) attrs__$182.style = "background-image:url(" + url__$183 + ")";
    return attrs__$182;
}

function __$b54(__$ctx, __$ref) {
    var attrs__$216 = {};
    if (__$ctx.ctx.url) {
        attrs__$216.src = __$ctx.ctx.url;
    } else if (__$ctx._nonceCsp) {
        attrs__$216.nonce = __$ctx._nonceCsp;
    }
    return attrs__$216;
}

function __$b114(__$ctx, __$ref) {
    var ctx__$53 = __$ctx.ctx;
    return {
        name: ctx__$53.name,
        optionsMaxHeight: ctx__$53.optionsMaxHeight
    };
}

function __$b127(__$ctx, __$ref) {
    var ctx__$156 = __$ctx.ctx;
    return {
        mainOffset: ctx__$156.mainOffset,
        secondaryOffset: ctx__$156.secondaryOffset,
        viewportOffset: ctx__$156.viewportOffset,
        directions: ctx__$156.directions,
        zIndexGroupLevel: ctx__$156.zIndexGroupLevel
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
                } else {
                    iterateItems__$111(itemOrGroup__$113.content);
                }
            }
        };
        if (!__$ctx.isArray(ctx__$105.content)) throw Error("menu: content must be an array of the menu items");
        iterateItems__$111(ctx__$105.content);
    }
    __$ctx._firstItem = firstItem__$107;
    __$ctx._checkedItems = checkedItems__$108;
    var __$r__$115;
    var __$l0__$116 = __$ctx._menuMods;
    __$ctx._menuMods = {
        theme: mods__$106.theme,
        disabled: mods__$106.disabled
    };
    var __$r__$118;
    var __$l1__$119 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 262144;
    __$r__$118 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l1__$119;
    __$r__$115 = __$r__$118;
    __$ctx._menuMods = __$l0__$116;
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
    var ctx__$144 = __$ctx.ctx;
    typeof ctx__$144.url === "object" && (ctx__$144.url = __$ctx.reapply(ctx__$144.url));
    var __$r__$146;
    var __$l0__$147 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 16777216;
    __$r__$146 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l0__$147;
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
    var __$r__$129;
    var __$l0__$130 = __$ctx._input;
    __$ctx._input = __$ctx.ctx;
    var __$r__$132;
    var __$l1__$133 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 2097152;
    __$r__$132 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l1__$133;
    __$r__$129 = __$r__$132;
    __$ctx._input = __$l0__$130;
    return;
}

function __$b144(__$ctx, __$ref) {
    var __$r__$200;
    var __$l0__$201 = __$ctx._attach;
    __$ctx._attach = __$ctx.ctx;
    var __$r__$203;
    var __$l1__$204 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 1;
    __$r__$203 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l1__$204;
    __$r__$200 = __$r__$203;
    __$ctx._attach = __$l0__$201;
    return;
}

function __$b145(__$ctx, __$ref) {
    var url__$217 = __$ctx.ctx.url;
    var __$r__$219;
    var __$l0__$220 = $$mode;
    $$mode = "";
    var __$l1__$221 = __$ctx.ctx;
    __$ctx.ctx = [ 6, 7, 8, 9 ].map(function(v) {
        return {
            elem: "css",
            url: url__$217 + ".ie" + v + ".css",
            ie: "IE " + v
        };
    });
    var __$r__$223;
    var __$l2__$224 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 8;
    __$r__$223 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$224;
    __$r__$219 = __$r__$223;
    $$mode = __$l0__$220;
    __$ctx.ctx = __$l1__$221;
    return;
}

function __$b146(__$ctx, __$ref) {
    var ie__$225 = __$ctx.ctx.ie, hideRule__$226 = !ie__$225 ? [ "gt IE 9", "<!-->", "<!--" ] : ie__$225 === "!IE" ? [ ie__$225, "<!-->", "<!--" ] : [ ie__$225, "", "" ];
    var __$r__$228;
    var __$l0__$229 = $$mode;
    $$mode = "";
    var __$l3__$230 = __$ctx.ctx;
    var __$l1__$231 = __$l3__$230._ieCommented;
    __$l3__$230._ieCommented = true;
    var __$l2__$232 = __$ctx.ctx;
    __$ctx.ctx = [ "<!--[if " + hideRule__$226[0] + "]>" + hideRule__$226[1], __$ctx.ctx, hideRule__$226[2] + "<![endif]-->" ];
    __$r__$228 = applyc(__$ctx, __$ref);
    $$mode = __$l0__$229;
    __$l3__$230._ieCommented = __$l1__$231;
    __$ctx.ctx = __$l2__$232;
    return;
}

function __$b147(__$ctx, __$ref) {
    var ctx__$236 = __$ctx.ctx;
    __$ctx._nonceCsp = ctx__$236.nonce;
    var __$r__$238;
    var __$l0__$239 = $$mode;
    $$mode = "";
    var __$l1__$240 = __$ctx.ctx;
    __$ctx.ctx = [ ctx__$236.doctype || "<!DOCTYPE html>", {
        tag: "html",
        cls: "ua_js_no",
        content: [ {
            elem: "head",
            content: [ {
                tag: "meta",
                attrs: {
                    charset: "utf-8"
                }
            }, ctx__$236.uaCompatible === false ? "" : {
                tag: "meta",
                attrs: {
                    "http-equiv": "X-UA-Compatible",
                    content: ctx__$236.uaCompatible || "IE=edge"
                }
            }, {
                tag: "title",
                content: ctx__$236.title
            }, {
                block: "ua",
                attrs: {
                    nonce: ctx__$236.nonce
                }
            }, ctx__$236.head, ctx__$236.styles, ctx__$236.favicon ? {
                elem: "favicon",
                url: ctx__$236.favicon
            } : "" ]
        }, ctx__$236 ]
    } ];
    var __$r__$242;
    var __$l2__$243 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 32;
    __$r__$242 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$243;
    __$r__$238 = __$r__$242;
    $$mode = __$l0__$239;
    __$ctx.ctx = __$l1__$240;
    return;
}

function __$b148(__$ctx, __$ref) {
    if (!__$ctx.ctx) return "";
    var ctx__$244 = __$ctx.ctx, keyset__$245 = ctx__$244.keyset, key__$246 = ctx__$244.key, params__$247 = ctx__$244.params || {};
    if (!(keyset__$245 || key__$246)) return "";
    if (typeof ctx__$244.content === "undefined" || ctx__$244.content !== null) {
        params__$247.content = exports.apply(ctx__$244.content);
    }
    __$ctx._buf.push(BEM.I18N(keyset__$245, key__$246, params__$247));
    return;
}

function __$b149(__$ctx, __$ref) {
    var BEM_INTERNAL__$248 = __$ctx.BEM.INTERNAL, ctx__$249 = __$ctx.ctx, isBEM__$250, tag__$251, res__$252;
    var __$r__$254;
    var __$l0__$255 = __$ctx._str;
    __$ctx._str = "";
    var vBlock__$256 = $$block;
    var __$r__$258;
    var __$l1__$259 = $$mode;
    $$mode = "tag";
    __$r__$258 = applyc(__$ctx, __$ref);
    $$mode = __$l1__$259;
    tag__$251 = __$r__$258;
    typeof tag__$251 !== "undefined" || (tag__$251 = ctx__$249.tag);
    typeof tag__$251 !== "undefined" || (tag__$251 = "div");
    if (tag__$251) {
        var jsParams__$260, js__$261;
        if (vBlock__$256 && ctx__$249.js !== false) {
            var __$r__$262;
            var __$l2__$263 = $$mode;
            $$mode = "js";
            __$r__$262 = applyc(__$ctx, __$ref);
            $$mode = __$l2__$263;
            js__$261 = __$r__$262;
            js__$261 = js__$261 ? __$ctx.extend(ctx__$249.js, js__$261 === true ? {} : js__$261) : ctx__$249.js === true ? {} : ctx__$249.js;
            js__$261 && ((jsParams__$260 = {})[BEM_INTERNAL__$248.buildClass(vBlock__$256, ctx__$249.elem)] = js__$261);
        }
        __$ctx._str += "<" + tag__$251;
        var __$r__$264;
        var __$l3__$265 = $$mode;
        $$mode = "bem";
        __$r__$264 = applyc(__$ctx, __$ref);
        $$mode = __$l3__$265;
        isBEM__$250 = __$r__$264;
        typeof isBEM__$250 !== "undefined" || (isBEM__$250 = typeof ctx__$249.bem !== "undefined" ? ctx__$249.bem : ctx__$249.block || ctx__$249.elem);
        var __$r__$267;
        var __$l4__$268 = $$mode;
        $$mode = "cls";
        __$r__$267 = applyc(__$ctx, __$ref);
        $$mode = __$l4__$268;
        var cls__$266 = __$r__$267;
        cls__$266 || (cls__$266 = ctx__$249.cls);
        var addJSInitClass__$269 = ctx__$249.block && jsParams__$260 && !ctx__$249.elem;
        if (isBEM__$250 || cls__$266) {
            __$ctx._str += ' class="';
            if (isBEM__$250) {
                __$ctx._str += BEM_INTERNAL__$248.buildClasses(vBlock__$256, ctx__$249.elem, ctx__$249.elemMods || ctx__$249.mods);
                var __$r__$271;
                var __$l5__$272 = $$mode;
                $$mode = "mix";
                __$r__$271 = applyc(__$ctx, __$ref);
                $$mode = __$l5__$272;
                var mix__$270 = __$r__$271;
                ctx__$249.mix && (mix__$270 = mix__$270 ? [].concat(mix__$270, ctx__$249.mix) : ctx__$249.mix);
                if (mix__$270) {
                    var visited__$273 = {}, visitedKey__$274 = function(block, elem) {
                        return (block || "") + "__" + (elem || "");
                    };
                    visited__$273[visitedKey__$274(vBlock__$256, $$elem)] = true;
                    __$ctx.isArray(mix__$270) || (mix__$270 = [ mix__$270 ]);
                    for (var i__$275 = 0; i__$275 < mix__$270.length; i__$275++) {
                        var mixItem__$276 = mix__$270[i__$275], hasItem__$277 = mixItem__$276.block && (vBlock__$256 !== ctx__$249.block || mixItem__$276.block !== vBlock__$256) || mixItem__$276.elem, mixBlock__$278 = mixItem__$276.block || mixItem__$276._block || $$block, mixElem__$279 = mixItem__$276.elem || mixItem__$276._elem || $$elem;
                        hasItem__$277 && (__$ctx._str += " ");
                        __$ctx._str += BEM_INTERNAL__$248[hasItem__$277 ? "buildClasses" : "buildModsClasses"](mixBlock__$278, mixItem__$276.elem || mixItem__$276._elem || (mixItem__$276.block ? undefined : $$elem), mixItem__$276.elemMods || mixItem__$276.mods);
                        if (mixItem__$276.js) {
                            (jsParams__$260 || (jsParams__$260 = {}))[BEM_INTERNAL__$248.buildClass(mixBlock__$278, mixItem__$276.elem)] = mixItem__$276.js === true ? {} : mixItem__$276.js;
                            addJSInitClass__$269 || (addJSInitClass__$269 = mixBlock__$278 && !mixItem__$276.elem);
                        }
                        if (hasItem__$277 && !visited__$273[visitedKey__$274(mixBlock__$278, mixElem__$279)]) {
                            visited__$273[visitedKey__$274(mixBlock__$278, mixElem__$279)] = true;
                            var __$r__$281;
                            var __$l6__$282 = $$mode;
                            $$mode = "mix";
                            var __$l7__$283 = $$block;
                            $$block = mixBlock__$278;
                            var __$l8__$284 = $$elem;
                            $$elem = mixElem__$279;
                            __$r__$281 = applyc(__$ctx, __$ref);
                            $$mode = __$l6__$282;
                            $$block = __$l7__$283;
                            $$elem = __$l8__$284;
                            var nestedMix__$280 = __$r__$281;
                            if (nestedMix__$280) {
                                for (var j__$285 = 0; j__$285 < nestedMix__$280.length; j__$285++) {
                                    var nestedItem__$286 = nestedMix__$280[j__$285];
                                    if (!nestedItem__$286.block && !nestedItem__$286.elem || !visited__$273[visitedKey__$274(nestedItem__$286.block, nestedItem__$286.elem)]) {
                                        nestedItem__$286._block = mixBlock__$278;
                                        nestedItem__$286._elem = mixElem__$279;
                                        mix__$270.splice(i__$275 + 1, 0, nestedItem__$286);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            cls__$266 && (__$ctx._str += isBEM__$250 ? " " + cls__$266 : cls__$266);
            __$ctx._str += addJSInitClass__$269 ? ' i-bem"' : '"';
        }
        if (isBEM__$250 && jsParams__$260) {
            __$ctx._str += ' data-bem="' + __$ctx.attrEscape(JSON.stringify(jsParams__$260)) + '"';
        }
        var __$r__$288;
        var __$l9__$289 = $$mode;
        $$mode = "attrs";
        __$r__$288 = applyc(__$ctx, __$ref);
        $$mode = __$l9__$289;
        var attrs__$287 = __$r__$288;
        attrs__$287 = __$ctx.extend(attrs__$287, ctx__$249.attrs);
        if (attrs__$287) {
            var name__$290, attr__$291;
            for (name__$290 in attrs__$287) {
                attr__$291 = attrs__$287[name__$290];
                if (typeof attr__$291 === "undefined") continue;
                __$ctx._str += " " + name__$290 + '="' + __$ctx.attrEscape(__$ctx.isSimple(attr__$291) ? attr__$291 : __$ctx.reapply(attr__$291)) + '"';
            }
        }
    }
    if (__$ctx.isShortTag(tag__$251)) {
        __$ctx._str += "/>";
    } else {
        tag__$251 && (__$ctx._str += ">");
        var __$r__$293;
        var __$l10__$294 = $$mode;
        $$mode = "content";
        __$r__$293 = applyc(__$ctx, __$ref);
        $$mode = __$l10__$294;
        var content__$292 = __$r__$293;
        if (content__$292 || content__$292 === 0) {
            isBEM__$250 = vBlock__$256 || $$elem;
            var __$r__$295;
            var __$l11__$296 = $$mode;
            $$mode = "";
            var __$l12__$297 = __$ctx._notNewList;
            __$ctx._notNewList = false;
            var __$l13__$298 = __$ctx.position;
            __$ctx.position = isBEM__$250 ? 1 : __$ctx.position;
            var __$l14__$299 = __$ctx._listLength;
            __$ctx._listLength = isBEM__$250 ? 1 : __$ctx._listLength;
            var __$l15__$300 = __$ctx.ctx;
            __$ctx.ctx = content__$292;
            __$r__$295 = applyc(__$ctx, __$ref);
            $$mode = __$l11__$296;
            __$ctx._notNewList = __$l12__$297;
            __$ctx.position = __$l13__$298;
            __$ctx._listLength = __$l14__$299;
            __$ctx.ctx = __$l15__$300;
        }
        tag__$251 && (__$ctx._str += "</" + tag__$251 + ">");
    }
    res__$252 = __$ctx._str;
    __$r__$254 = undefined;
    __$ctx._str = __$l0__$255;
    __$ctx._buf.push(res__$252);
    return;
}

function __$b159(__$ctx, __$ref) {
    var __$r__$302;
    var __$l0__$303 = $$mode;
    $$mode = "";
    var __$l1__$304 = __$ctx.ctx;
    __$ctx.ctx = __$ctx.ctx._value;
    var __$r__$306;
    var __$l2__$307 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 64;
    __$r__$306 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$307;
    __$r__$302 = __$r__$306;
    $$mode = __$l0__$303;
    __$ctx.ctx = __$l1__$304;
    return;
}

function __$b160(__$ctx, __$ref) {
    __$ctx._listLength--;
    var ctx__$308 = __$ctx.ctx;
    if (ctx__$308 && ctx__$308 !== true || ctx__$308 === 0) {
        __$ctx._str += ctx__$308 + "";
    }
    return;
}

function __$b161(__$ctx, __$ref) {
    __$ctx._listLength--;
    return;
}

function __$b162(__$ctx, __$ref) {
    var ctx__$309 = __$ctx.ctx, len__$310 = ctx__$309.length, i__$311 = 0, prevPos__$312 = __$ctx.position, prevNotNewList__$313 = __$ctx._notNewList;
    if (prevNotNewList__$313) {
        __$ctx._listLength += len__$310 - 1;
    } else {
        __$ctx.position = 0;
        __$ctx._listLength = len__$310;
    }
    __$ctx._notNewList = true;
    while (i__$311 < len__$310) (function __$lb__$314() {
        var __$r__$315;
        var __$l0__$316 = __$ctx.ctx;
        __$ctx.ctx = ctx__$309[i__$311++];
        __$r__$315 = applyc(__$ctx, __$ref);
        __$ctx.ctx = __$l0__$316;
        return __$r__$315;
    })();
    prevNotNewList__$313 || (__$ctx.position = prevPos__$312);
    return;
}

function __$b163(__$ctx, __$ref) {
    __$ctx.ctx || (__$ctx.ctx = {});
    var vBlock__$317 = __$ctx.ctx.block, vElem__$318 = __$ctx.ctx.elem, block__$319 = __$ctx._currBlock || $$block;
    var __$r__$321;
    var __$l0__$322 = $$mode;
    $$mode = "default";
    var __$l1__$323 = $$block;
    $$block = vBlock__$317 || (vElem__$318 ? block__$319 : undefined);
    var __$l2__$324 = __$ctx._currBlock;
    __$ctx._currBlock = vBlock__$317 || vElem__$318 ? undefined : block__$319;
    var __$l3__$325 = $$elem;
    $$elem = vElem__$318;
    var __$l4__$326 = $$mods;
    $$mods = vBlock__$317 ? __$ctx.ctx.mods || (__$ctx.ctx.mods = {}) : $$mods;
    var __$l5__$327 = $$elemMods;
    $$elemMods = __$ctx.ctx.elemMods || {};
    $$block || $$elem ? __$ctx.position = (__$ctx.position || 0) + 1 : __$ctx._listLength--;
    applyc(__$ctx, __$ref);
    __$r__$321 = undefined;
    $$mode = __$l0__$322;
    $$block = __$l1__$323;
    __$ctx._currBlock = __$l2__$324;
    $$elem = __$l3__$325;
    $$mods = __$l4__$326;
    $$elemMods = __$l5__$327;
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
                    content: __$ctx.ctx.val
                } ];
            }
            if (typeof __$ctx.ctx.content !== "undefined") {
                return __$ctx.ctx.content;
            }
            return {
                elem: "bar",
                attrs: {
                    style: "width:" + __$ctx.ctx.val + "%"
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
                }, function __$lb__$179() {
                    var __$r__$180;
                    var __$l0__$181 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 134217728;
                    __$r__$180 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$181;
                    return __$r__$180;
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
            return [ function __$lb__$233() {
                var __$r__$234;
                var __$l0__$235 = __$ctx.__$a1;
                __$ctx.__$a1 = __$ctx.__$a1 | 16;
                __$r__$234 = applyc(__$ctx, __$ref);
                __$ctx.__$a1 = __$l0__$235;
                return __$r__$234;
            }(), __$ctx.ctx.scripts ];
        }
    } else if (__$t === "ua") {
        if (!$$elem && (__$ctx.__$a1 & 4) === 0) {
            return [ function __$lb__$213() {
                var __$r__$214;
                var __$l0__$215 = __$ctx.__$a1;
                __$ctx.__$a1 = __$ctx.__$a1 | 4;
                __$r__$214 = applyc(__$ctx, __$ref);
                __$ctx.__$a1 = __$l0__$215;
                return __$r__$214;
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
                        var __$r = __$ctx.extend(function __$lb__$120() {
                            var __$r__$121;
                            var __$l0__$122 = __$ctx.__$a0;
                            __$ctx.__$a0 = __$ctx.__$a0 | 524288;
                            __$r__$121 = applyc(__$ctx, __$ref);
                            __$ctx.__$a0 = __$l0__$122;
                            return __$r__$121;
                        }(), {
                            type: "search"
                        });
                        if (__$r !== __$ref) return __$r;
                    }
                } else if (__$t === "password") {
                    if ((__$ctx.__$a0 & 1048576) === 0) {
                        var __$r = __$ctx.extend(function __$lb__$123() {
                            var __$r__$124;
                            var __$l0__$125 = __$ctx.__$a0;
                            __$ctx.__$a0 = __$ctx.__$a0 | 1048576;
                            __$r__$124 = applyc(__$ctx, __$ref);
                            __$ctx.__$a0 = __$l0__$125;
                            return __$r__$124;
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
                val: __$ctx.ctx.val
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
                    var __$r = __$ctx.extend(function __$lb__$169() {
                        var __$r__$170;
                        var __$l0__$171 = __$ctx.__$a0;
                        __$ctx.__$a0 = __$ctx.__$a0 | 33554432;
                        __$r__$170 = applyc(__$ctx, __$ref);
                        __$ctx.__$a0 = __$l0__$171;
                        return __$r__$170;
                    }(), {
                        url: __$ctx.ctx.url
                    });
                    if (__$r !== __$ref) return __$r;
                }
                if ($$mods["focused"] === true && (__$ctx.__$a0 & 268435456) === 0) {
                    var __$r = __$ctx.extend(function __$lb__$184() {
                        var __$r__$185;
                        var __$l0__$186 = __$ctx.__$a0;
                        __$ctx.__$a0 = __$ctx.__$a0 | 268435456;
                        __$r__$185 = applyc(__$ctx, __$ref);
                        __$ctx.__$a0 = __$l0__$186;
                        return __$r__$185;
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
                var __$r = __$ctx.extend(function __$lb__$138() {
                    var __$r__$139;
                    var __$l0__$140 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 8388608;
                    __$r__$139 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$140;
                    return __$r__$139;
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