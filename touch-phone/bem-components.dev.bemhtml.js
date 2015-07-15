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
        } else if (__$t === "page") {
            if (!$$elem && (__$ctx.__$a1 & 16) === 0) {
                var __$r = __$b66(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
        }
        return undefined;
    } else if (__$t === "tag") {
        var __$r = __$g2(__$ctx, __$ref);
        if (__$r !== __$ref) return __$r;
    } else if (__$t === "js") {
        var __$mr = __$m1[$$block];
        if (__$mr) {
            __$mr = __$mr(__$ctx, __$ref);
            if (__$mr !== __$ref) return __$mr;
        }
        return undefined;
    } else if (__$t === "default") {
        var __$r = __$g3(__$ctx, __$ref);
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
            } else if (__$t === "head") {
                return false;
            } else if (__$t === "favicon") {
                return false;
            } else if (__$t === "meta") {
                return false;
            }
        } else if (__$t === "ua") {
            if (!$$elem) {
                return false;
            }
        }
        return undefined;
    } else if (__$t === "cls") {
        return undefined;
    } else if (__$t === "") {
        if (__$ctx.ctx && __$ctx.ctx._vow && (__$ctx.__$a1 & 256) === 0) {
            var __$r = __$b136(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (__$ctx.isSimple(__$ctx.ctx)) {
            var __$r = __$b137(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (!__$ctx.ctx) {
            var __$r = __$b138(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (__$ctx.isArray(__$ctx.ctx)) {
            var __$r = __$b139(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        var __$r = __$b140(__$ctx, __$ref);
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
        ctx["__$a1"] = 0;
        ctx["_attach"] = undefined;
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

var __$m1 = {
    progressbar: function(__$ctx, __$ref) {
        if (!$$elem) {
            return {
                val: __$ctx.ctx.val || 0
            };
        }
        return __$ref;
    },
    textarea: function(__$ctx, __$ref) {
        if (!$$elem) {
            return true;
        }
        return __$ref;
    },
    radio: function(__$ctx, __$ref) {
        if (!$$elem) {
            return true;
        }
        return __$ref;
    },
    select: function(__$ctx, __$ref) {
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
            var __$r = __$b147(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        return __$ref;
    },
    button: function(__$ctx, __$ref) {
        var __$t = !$$elem;
        if (__$t) {
            var __$t = $$mods;
            if (__$t) {
                if ($$mods && $$mods["type"] === "link" && $$mods["disabled"] === true && (__$ctx.__$a0 & 67108864) === 0) {
                    var __$r = __$ctx.extend(function __$lb__$174() {
                        var __$r__$175;
                        var __$l0__$176 = __$ctx.__$a0;
                        __$ctx.__$a0 = __$ctx.__$a0 | 67108864;
                        __$r__$175 = applyc(__$ctx, __$ref);
                        __$ctx.__$a0 = __$l0__$176;
                        return __$r__$175;
                    }(), {
                        url: __$ctx.ctx.url
                    });
                    if (__$r !== __$ref) return __$r;
                }
                if ($$mods["focused"] === true && (__$ctx.__$a0 & 536870912) === 0) {
                    var __$r = __$ctx.extend(function __$lb__$189() {
                        var __$r__$190;
                        var __$l0__$191 = __$ctx.__$a0;
                        __$ctx.__$a0 = __$ctx.__$a0 | 536870912;
                        __$r__$190 = applyc(__$ctx, __$ref);
                        __$ctx.__$a0 = __$l0__$191;
                        return __$r__$190;
                    }(), {
                        live: false
                    });
                    if (__$r !== __$ref) return __$r;
                }
            }
            return true;
        }
        return __$ref;
    },
    menu: function(__$ctx, __$ref) {
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
        return __$ref;
    },
    "radio-group": function(__$ctx, __$ref) {
        if (!$$elem) {
            return true;
        }
        return __$ref;
    },
    modal: function(__$ctx, __$ref) {
        if (!$$elem) {
            return true;
        }
        return __$ref;
    },
    link: function(__$ctx, __$ref) {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods["disabled"] === true && (__$ctx.__$a0 & 16777216) === 0) {
                var __$r = __$ctx.extend(function __$lb__$143() {
                    var __$r__$144;
                    var __$l0__$145 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 16777216;
                    __$r__$144 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$145;
                    return __$r__$144;
                }(), {
                    url: __$ctx.ctx.url
                });
                if (__$r !== __$ref) return __$r;
            }
            return true;
        }
        return __$ref;
    },
    "menu-item": function(__$ctx, __$ref) {
        if (!$$elem) {
            return {
                val: __$ctx.ctx.val
            };
        }
        return __$ref;
    },
    input: function(__$ctx, __$ref) {
        if (!$$elem) {
            return true;
        }
        return __$ref;
    },
    dropdown: function(__$ctx, __$ref) {
        if (!$$elem) {
            return true;
        }
        return __$ref;
    },
    popup: function(__$ctx, __$ref) {
        if (!$$elem) {
            var __$r = __$b160(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        return __$ref;
    },
    "checkbox-group": function(__$ctx, __$ref) {
        if (!$$elem) {
            return true;
        }
        return __$ref;
    },
    checkbox: function(__$ctx, __$ref) {
        if (!$$elem) {
            return true;
        }
        return __$ref;
    },
    attach: function(__$ctx, __$ref) {
        if (!$$elem) {
            return true;
        }
        return __$ref;
    },
    ua: function(__$ctx, __$ref) {
        if (!$$elem) {
            return true;
        }
        return __$ref;
    }
};

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
    var ctx__$192 = __$ctx.ctx, content__$193 = [ ctx__$192.icon ];
    "text" in ctx__$192 && content__$193.push({
        elem: "text",
        content: ctx__$192.text
    });
    return content__$193;
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
    var content__$157 = __$ctx.ctx.content;
    if (Array.isArray(content__$157)) return content__$157;
    var res__$158 = __$ctx.isSimple(content__$157) ? {
        block: "button",
        text: content__$157
    } : content__$157;
    if (res__$158.block === "button") {
        var resMods__$159 = res__$158.mods || (res__$158.mods = {}), dropdownMods__$160 = $$mods;
        resMods__$159.size || (resMods__$159.size = dropdownMods__$160.size);
        resMods__$159.theme || (resMods__$159.theme = dropdownMods__$160.theme);
        resMods__$159.disabled = dropdownMods__$160.disabled;
    }
    return res__$158;
}

function __$b23(__$ctx, __$ref) {
    var content__$153 = __$ctx.ctx.content;
    if (Array.isArray(content__$153)) return content__$153;
    var res__$154 = __$ctx.isSimple(content__$153) ? {
        block: "link",
        mods: {
            pseudo: true
        },
        content: content__$153
    } : content__$153;
    if (res__$154.block === "link") {
        var resMods__$155 = res__$154.mods || (res__$154.mods = {}), dropdownMods__$156 = $$mods;
        resMods__$155.theme || (resMods__$155.theme = dropdownMods__$156.theme);
        resMods__$155.disabled = dropdownMods__$156.disabled;
    }
    return res__$154;
}

function __$b24(__$ctx, __$ref) {
    var popup__$162 = __$ctx.ctx.popup;
    if (__$ctx.isSimple(popup__$162) || popup__$162.block !== "popup") {
        popup__$162 = {
            block: "popup",
            content: popup__$162
        };
    }
    var popupMods__$163 = popup__$162.mods || (popup__$162.mods = {});
    popupMods__$163.theme || (popupMods__$163.theme = $$mods.theme);
    popupMods__$163.hasOwnProperty("autoclosable") || (popupMods__$163.autoclosable = true);
    popupMods__$163.target = "anchor";
    return [ {
        elem: "switcher",
        content: __$ctx.ctx.switcher
    }, popup__$162 ];
}

function __$b25(__$ctx, __$ref) {
    var mods__$164 = $$mods, ctx__$165 = __$ctx.ctx, val__$166 = ctx__$165.val, isValDef__$167 = typeof val__$166 !== "undefined";
    if (isValDef__$167 && !Array.isArray(val__$166)) throw Error("checkbox-group: val must be an array");
    return (ctx__$165.options || []).map(function(option, i) {
        return [ !!i && !mods__$164.type && {
            tag: "br"
        }, {
            block: "checkbox",
            mods: {
                type: mods__$164.type,
                theme: mods__$164.theme,
                size: mods__$164.size,
                checked: isValDef__$167 && val__$166.indexOf(option.val) > -1,
                disabled: option.disabled || mods__$164.disabled
            },
            name: ctx__$165.name,
            val: option.val,
            text: option.text,
            title: option.title,
            icon: option.icon
        } ];
    });
}

function __$b26(__$ctx, __$ref) {
    var ctx__$168 = __$ctx.ctx, mods__$169 = $$mods;
    return [ {
        block: "button",
        mods: {
            togglable: "check",
            checked: mods__$169.checked,
            disabled: mods__$169.disabled,
            theme: mods__$169.theme,
            size: mods__$169.size
        },
        title: ctx__$168.title,
        content: [ ctx__$168.icon, typeof ctx__$168.text !== "undefined" ? {
            elem: "text",
            content: ctx__$168.text
        } : "" ]
    }, {
        block: "checkbox",
        elem: "control",
        checked: mods__$169.checked,
        disabled: mods__$169.disabled,
        name: ctx__$168.name,
        val: ctx__$168.val
    } ];
}

function __$b27(__$ctx, __$ref) {
    var ctx__$172 = __$ctx.ctx, mods__$173 = $$mods;
    return [ {
        elem: "box",
        content: {
            elem: "control",
            checked: mods__$173.checked,
            disabled: mods__$173.disabled,
            name: ctx__$172.name,
            val: ctx__$172.val
        }
    }, ctx__$172.text ];
}

function __$b28(__$ctx, __$ref) {
    var ctx__$200 = __$ctx.ctx, button__$201 = ctx__$200.button;
    __$ctx.isSimple(button__$201) && (button__$201 = {
        block: "button",
        tag: "span",
        text: button__$201
    });
    var attachMods__$202 = $$mods, buttonMods__$203 = button__$201.mods || (button__$201.mods = {});
    [ "size", "theme", "disabled", "focused" ].forEach(function(mod) {
        buttonMods__$203[mod] || (buttonMods__$203[mod] = attachMods__$202[mod]);
    });
    return [ button__$201, {
        elem: "no-file",
        content: __$ctx.ctx.noFileText
    } ];
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
    var ctx__$177 = __$ctx.ctx, attrs__$178 = {};
    ctx__$177.target && (attrs__$178.target = ctx__$177.target);
    $$mods.disabled ? attrs__$178["aria-disabled"] = true : attrs__$178.href = ctx__$177.url;
    return __$ctx.extend(function __$lb__$179() {
        var __$r__$180;
        var __$l0__$181 = __$ctx.__$a0;
        __$ctx.__$a0 = __$ctx.__$a0 | 134217728;
        __$r__$180 = applyc(__$ctx, __$ref);
        __$ctx.__$a0 = __$l0__$181;
        return __$r__$180;
    }(), attrs__$178);
}

function __$b38(__$ctx, __$ref) {
    var ctx__$194 = __$ctx.ctx, attrs__$195 = {
        type: $$mods.type || "button",
        name: ctx__$194.name,
        value: ctx__$194.val
    };
    $$mods.disabled && (attrs__$195.disabled = "disabled");
    return __$ctx.extend(function __$lb__$196() {
        var __$r__$197;
        var __$l0__$198 = __$ctx.__$a1;
        __$ctx.__$a1 = __$ctx.__$a1 | 1;
        __$r__$197 = applyc(__$ctx, __$ref);
        __$ctx.__$a1 = __$l0__$198;
        return __$r__$197;
    }(), attrs__$195);
}

function __$b39(__$ctx, __$ref) {
    var ctx__$199 = __$ctx.ctx;
    return {
        role: "button",
        tabindex: ctx__$199.tabIndex,
        id: ctx__$199.id,
        title: ctx__$199.title
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
    var ctx__$146 = __$ctx.ctx, attrs__$147 = {}, tabIndex__$148;
    if (!$$mods.disabled) {
        if (ctx__$146.url) {
            attrs__$147.href = ctx__$146.url;
            tabIndex__$148 = ctx__$146.tabIndex;
        } else {
            tabIndex__$148 = ctx__$146.tabIndex || 0;
        }
    }
    typeof tabIndex__$148 === "undefined" || (attrs__$147.tabindex = tabIndex__$148);
    ctx__$146.title && (attrs__$147.title = ctx__$146.title);
    ctx__$146.target && (attrs__$147.target = ctx__$146.target);
    return attrs__$147;
}

function __$b49(__$ctx, __$ref) {
    var input__$131 = __$ctx._input, attrs__$132 = {
        id: input__$131.id,
        name: input__$131.name,
        value: input__$131.val,
        maxlength: input__$131.maxLength,
        tabindex: input__$131.tabIndex,
        placeholder: input__$131.placeholder
    };
    input__$131.autocomplete === false && (attrs__$132.autocomplete = "off");
    $$mods.disabled && (attrs__$132.disabled = "disabled");
    return attrs__$132;
}

function __$b50(__$ctx, __$ref) {
    var ctx__$139 = __$ctx.ctx;
    return __$ctx.extend(function __$lb__$140() {
        var __$r__$141;
        var __$l0__$142 = __$ctx.__$a0;
        __$ctx.__$a0 = __$ctx.__$a0 | 8388608;
        __$r__$141 = applyc(__$ctx, __$ref);
        __$ctx.__$a0 = __$l0__$142;
        return __$r__$141;
    }(), {
        src: ctx__$139.url,
        width: ctx__$139.width,
        height: ctx__$139.height,
        alt: ctx__$139.alt,
        title: ctx__$139.title
    });
}

function __$b52(__$ctx, __$ref) {
    var attrs__$170 = {
        type: "checkbox",
        autocomplete: "off"
    }, ctx__$171 = __$ctx.ctx;
    attrs__$170.name = ctx__$171.name;
    attrs__$170.value = ctx__$171.val;
    ctx__$171.checked && (attrs__$170.checked = "checked");
    ctx__$171.disabled && (attrs__$170.disabled = "disabled");
    return attrs__$170;
}

function __$b53(__$ctx, __$ref) {
    var attrs__$182 = {
        type: "file"
    }, attach__$183 = __$ctx._attach;
    if (attach__$183) {
        attrs__$182.name = attach__$183.name;
        attach__$183.mods && attach__$183.mods.disabled && (attrs__$182.disabled = "disabled");
        attach__$183.tabIndex && (attrs__$182.tabindex = attach__$183.tabIndex);
    }
    return attrs__$182;
}

function __$b54(__$ctx, __$ref) {
    var attrs__$187 = {
        "aria-hidden": "true"
    }, url__$188 = __$ctx.ctx.url;
    if (url__$188) attrs__$187.style = "background-image:url(" + url__$188 + ")";
    return attrs__$187;
}

function __$b55(__$ctx, __$ref) {
    var attrs__$221 = {};
    if (__$ctx.ctx.url) {
        attrs__$221.src = __$ctx.ctx.url;
    } else if (__$ctx._nonceCsp) {
        attrs__$221.nonce = __$ctx._nonceCsp;
    }
    return attrs__$221;
}

function __$b66(__$ctx, __$ref) {
    var mix__$222 = function __$lb__$223() {
        var __$r__$224;
        var __$l0__$225 = __$ctx.__$a1;
        __$ctx.__$a1 = __$ctx.__$a1 | 16;
        __$r__$224 = applyc(__$ctx, __$ref);
        __$ctx.__$a1 = __$l0__$225;
        return __$r__$224;
    }(), uaMix__$226 = [ {
        block: "ua",
        attrs: {
            nonce: __$ctx._nonceCsp
        },
        js: true
    } ];
    return mix__$222 ? uaMix__$226.concat(mix__$222) : uaMix__$226;
}

function __$b110(__$ctx, __$ref) {
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

function __$b111(__$ctx, __$ref) {
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

function __$b112(__$ctx, __$ref) {
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

function __$b113(__$ctx, __$ref) {
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

function __$b114(__$ctx, __$ref) {
    (__$ctx._firstItem.mods = __$ctx._firstItem.mods || {}).checked = true;
    var __$r__$89;
    var __$l0__$90 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 8192;
    __$r__$89 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l0__$90;
    return;
}

function __$b115(__$ctx, __$ref) {
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

function __$b116(__$ctx, __$ref) {
    if ($$mods.type !== "button") throw Error("Modifier mode=radio-check can be only with modifier type=button");
    var __$r__$72;
    var __$l0__$73 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 2048;
    __$r__$72 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l0__$73;
    return;
}

function __$b117(__$ctx, __$ref) {
    delete __$ctx._menuItemDisabled;
    $$mods.disabled = true;
    applyc(__$ctx, __$ref);
    return;
}

function __$b118(__$ctx, __$ref) {
    var ctx__$149 = __$ctx.ctx;
    typeof ctx__$149.url === "object" && (ctx__$149.url = __$ctx.reapply(ctx__$149.url));
    var __$r__$151;
    var __$l0__$152 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 33554432;
    __$r__$151 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l0__$152;
    return;
}

function __$b119(__$ctx, __$ref) {
    var __$r__$86;
    var __$l0__$87 = __$ctx._menuItemDisabled;
    __$ctx._menuItemDisabled = true;
    __$r__$86 = applyc(__$ctx, __$ref);
    __$ctx._menuItemDisabled = __$l0__$87;
    return;
}

function __$b120(__$ctx, __$ref) {
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

function __$b121(__$ctx, __$ref) {
    var __$r__$134;
    var __$l0__$135 = __$ctx._input;
    __$ctx._input = __$ctx.ctx;
    var __$r__$137;
    var __$l1__$138 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 4194304;
    __$r__$137 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l1__$138;
    __$r__$134 = __$r__$137;
    __$ctx._input = __$l0__$135;
    return;
}

function __$b122(__$ctx, __$ref) {
    var __$r__$205;
    var __$l0__$206 = __$ctx._attach;
    __$ctx._attach = __$ctx.ctx;
    var __$r__$208;
    var __$l1__$209 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 2;
    __$r__$208 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l1__$209;
    __$r__$205 = __$r__$208;
    __$ctx._attach = __$l0__$206;
    return;
}

function __$b123(__$ctx, __$ref) {
    var ctx__$210 = __$ctx.ctx;
    var __$r__$212;
    var __$l0__$213 = $$mode;
    $$mode = "";
    var __$l1__$214 = __$ctx.ctx;
    __$ctx.ctx = [ ctx__$210.src16 && {
        elem: "link",
        attrs: {
            rel: "shortcut icon",
            href: ctx__$210.src16
        }
    }, ctx__$210.src114 && {
        elem: "link",
        attrs: {
            rel: "apple-touch-icon-precomposed",
            sizes: "114x114",
            href: ctx__$210.src114
        }
    }, ctx__$210.src72 && {
        elem: "link",
        attrs: {
            rel: "apple-touch-icon-precomposed",
            sizes: "72x72",
            href: ctx__$210.src72
        }
    }, ctx__$210.src57 && {
        elem: "link",
        attrs: {
            rel: "apple-touch-icon-precomposed",
            href: ctx__$210.src57
        }
    } ];
    var __$r__$216;
    var __$l2__$217 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 4;
    __$r__$216 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$217;
    __$r__$212 = __$r__$216;
    $$mode = __$l0__$213;
    __$ctx.ctx = __$l1__$214;
    return;
}

function __$b124(__$ctx, __$ref) {
    var ctx__$233 = __$ctx.ctx;
    __$ctx._nonceCsp = ctx__$233.nonce;
    var __$r__$235;
    var __$l0__$236 = $$mode;
    $$mode = "";
    var __$l1__$237 = __$ctx.ctx;
    __$ctx.ctx = [ ctx__$233.doctype || "<!DOCTYPE html>", {
        tag: "html",
        cls: "ua_js_no",
        content: [ {
            elem: "head",
            content: [ {
                tag: "meta",
                attrs: {
                    charset: "utf-8"
                }
            }, ctx__$233.uaCompatible === false ? "" : {
                tag: "meta",
                attrs: {
                    "http-equiv": "X-UA-Compatible",
                    content: ctx__$233.uaCompatible || "IE=edge"
                }
            }, {
                tag: "title",
                content: ctx__$233.title
            }, {
                block: "ua",
                attrs: {
                    nonce: ctx__$233.nonce
                }
            }, ctx__$233.head, ctx__$233.styles, ctx__$233.favicon ? {
                elem: "favicon",
                url: ctx__$233.favicon
            } : "" ]
        }, ctx__$233 ]
    } ];
    var __$r__$239;
    var __$l2__$240 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 128;
    __$r__$239 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$240;
    __$r__$235 = __$r__$239;
    $$mode = __$l0__$236;
    __$ctx.ctx = __$l1__$237;
    return;
}

function __$b125(__$ctx, __$ref) {
    if (!__$ctx.ctx) return "";
    var ctx__$241 = __$ctx.ctx, keyset__$242 = ctx__$241.keyset, key__$243 = ctx__$241.key, params__$244 = ctx__$241.params || {};
    if (!(keyset__$242 || key__$243)) return "";
    if (typeof ctx__$241.content === "undefined" || ctx__$241.content !== null) {
        params__$244.content = exports.apply(ctx__$241.content);
    }
    __$ctx._buf.push(BEM.I18N(keyset__$242, key__$243, params__$244));
    return;
}

function __$b126(__$ctx, __$ref) {
    var BEM_INTERNAL__$245 = __$ctx.BEM.INTERNAL, ctx__$246 = __$ctx.ctx, isBEM__$247, tag__$248, res__$249;
    var __$r__$251;
    var __$l0__$252 = __$ctx._str;
    __$ctx._str = "";
    var vBlock__$253 = $$block;
    var __$r__$255;
    var __$l1__$256 = $$mode;
    $$mode = "tag";
    __$r__$255 = applyc(__$ctx, __$ref);
    $$mode = __$l1__$256;
    tag__$248 = __$r__$255;
    typeof tag__$248 !== "undefined" || (tag__$248 = ctx__$246.tag);
    typeof tag__$248 !== "undefined" || (tag__$248 = "div");
    if (tag__$248) {
        var jsParams__$257, js__$258;
        if (vBlock__$253 && ctx__$246.js !== false) {
            var __$r__$259;
            var __$l2__$260 = $$mode;
            $$mode = "js";
            __$r__$259 = applyc(__$ctx, __$ref);
            $$mode = __$l2__$260;
            js__$258 = __$r__$259;
            js__$258 = js__$258 ? __$ctx.extend(ctx__$246.js, js__$258 === true ? {} : js__$258) : ctx__$246.js === true ? {} : ctx__$246.js;
            js__$258 && ((jsParams__$257 = {})[BEM_INTERNAL__$245.buildClass(vBlock__$253, ctx__$246.elem)] = js__$258);
        }
        __$ctx._str += "<" + tag__$248;
        var __$r__$261;
        var __$l3__$262 = $$mode;
        $$mode = "bem";
        __$r__$261 = applyc(__$ctx, __$ref);
        $$mode = __$l3__$262;
        isBEM__$247 = __$r__$261;
        typeof isBEM__$247 !== "undefined" || (isBEM__$247 = typeof ctx__$246.bem !== "undefined" ? ctx__$246.bem : ctx__$246.block || ctx__$246.elem);
        var __$r__$264;
        var __$l4__$265 = $$mode;
        $$mode = "cls";
        __$r__$264 = applyc(__$ctx, __$ref);
        $$mode = __$l4__$265;
        var cls__$263 = __$r__$264;
        cls__$263 || (cls__$263 = ctx__$246.cls);
        var addJSInitClass__$266 = ctx__$246.block && jsParams__$257 && !ctx__$246.elem;
        if (isBEM__$247 || cls__$263) {
            __$ctx._str += ' class="';
            if (isBEM__$247) {
                __$ctx._str += BEM_INTERNAL__$245.buildClasses(vBlock__$253, ctx__$246.elem, ctx__$246.elemMods || ctx__$246.mods);
                var __$r__$268;
                var __$l5__$269 = $$mode;
                $$mode = "mix";
                __$r__$268 = applyc(__$ctx, __$ref);
                $$mode = __$l5__$269;
                var mix__$267 = __$r__$268;
                ctx__$246.mix && (mix__$267 = mix__$267 ? [].concat(mix__$267, ctx__$246.mix) : ctx__$246.mix);
                if (mix__$267) {
                    var visited__$270 = {}, visitedKey__$271 = function(block, elem) {
                        return (block || "") + "__" + (elem || "");
                    };
                    visited__$270[visitedKey__$271(vBlock__$253, $$elem)] = true;
                    __$ctx.isArray(mix__$267) || (mix__$267 = [ mix__$267 ]);
                    for (var i__$272 = 0; i__$272 < mix__$267.length; i__$272++) {
                        var mixItem__$273 = mix__$267[i__$272], hasItem__$274 = mixItem__$273.block && (vBlock__$253 !== ctx__$246.block || mixItem__$273.block !== vBlock__$253) || mixItem__$273.elem, mixBlock__$275 = mixItem__$273.block || mixItem__$273._block || $$block, mixElem__$276 = mixItem__$273.elem || mixItem__$273._elem || $$elem;
                        hasItem__$274 && (__$ctx._str += " ");
                        __$ctx._str += BEM_INTERNAL__$245[hasItem__$274 ? "buildClasses" : "buildModsClasses"](mixBlock__$275, mixItem__$273.elem || mixItem__$273._elem || (mixItem__$273.block ? undefined : $$elem), mixItem__$273.elemMods || mixItem__$273.mods);
                        if (mixItem__$273.js) {
                            (jsParams__$257 || (jsParams__$257 = {}))[BEM_INTERNAL__$245.buildClass(mixBlock__$275, mixItem__$273.elem)] = mixItem__$273.js === true ? {} : mixItem__$273.js;
                            addJSInitClass__$266 || (addJSInitClass__$266 = mixBlock__$275 && !mixItem__$273.elem);
                        }
                        if (hasItem__$274 && !visited__$270[visitedKey__$271(mixBlock__$275, mixElem__$276)]) {
                            visited__$270[visitedKey__$271(mixBlock__$275, mixElem__$276)] = true;
                            var __$r__$278;
                            var __$l6__$279 = $$mode;
                            $$mode = "mix";
                            var __$l7__$280 = $$block;
                            $$block = mixBlock__$275;
                            var __$l8__$281 = $$elem;
                            $$elem = mixElem__$276;
                            __$r__$278 = applyc(__$ctx, __$ref);
                            $$mode = __$l6__$279;
                            $$block = __$l7__$280;
                            $$elem = __$l8__$281;
                            var nestedMix__$277 = __$r__$278;
                            if (nestedMix__$277) {
                                for (var j__$282 = 0; j__$282 < nestedMix__$277.length; j__$282++) {
                                    var nestedItem__$283 = nestedMix__$277[j__$282];
                                    if (!nestedItem__$283.block && !nestedItem__$283.elem || !visited__$270[visitedKey__$271(nestedItem__$283.block, nestedItem__$283.elem)]) {
                                        nestedItem__$283._block = mixBlock__$275;
                                        nestedItem__$283._elem = mixElem__$276;
                                        mix__$267.splice(i__$272 + 1, 0, nestedItem__$283);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            cls__$263 && (__$ctx._str += isBEM__$247 ? " " + cls__$263 : cls__$263);
            __$ctx._str += addJSInitClass__$266 ? ' i-bem"' : '"';
        }
        if (isBEM__$247 && jsParams__$257) {
            __$ctx._str += ' data-bem="' + __$ctx.attrEscape(JSON.stringify(jsParams__$257)) + '"';
        }
        var __$r__$285;
        var __$l9__$286 = $$mode;
        $$mode = "attrs";
        __$r__$285 = applyc(__$ctx, __$ref);
        $$mode = __$l9__$286;
        var attrs__$284 = __$r__$285;
        attrs__$284 = __$ctx.extend(attrs__$284, ctx__$246.attrs);
        if (attrs__$284) {
            var name__$287, attr__$288;
            for (name__$287 in attrs__$284) {
                attr__$288 = attrs__$284[name__$287];
                if (typeof attr__$288 === "undefined") continue;
                __$ctx._str += " " + name__$287 + '="' + __$ctx.attrEscape(__$ctx.isSimple(attr__$288) ? attr__$288 : __$ctx.reapply(attr__$288)) + '"';
            }
        }
    }
    if (__$ctx.isShortTag(tag__$248)) {
        __$ctx._str += "/>";
    } else {
        tag__$248 && (__$ctx._str += ">");
        var __$r__$290;
        var __$l10__$291 = $$mode;
        $$mode = "content";
        __$r__$290 = applyc(__$ctx, __$ref);
        $$mode = __$l10__$291;
        var content__$289 = __$r__$290;
        if (content__$289 || content__$289 === 0) {
            isBEM__$247 = vBlock__$253 || $$elem;
            var __$r__$292;
            var __$l11__$293 = $$mode;
            $$mode = "";
            var __$l12__$294 = __$ctx._notNewList;
            __$ctx._notNewList = false;
            var __$l13__$295 = __$ctx.position;
            __$ctx.position = isBEM__$247 ? 1 : __$ctx.position;
            var __$l14__$296 = __$ctx._listLength;
            __$ctx._listLength = isBEM__$247 ? 1 : __$ctx._listLength;
            var __$l15__$297 = __$ctx.ctx;
            __$ctx.ctx = content__$289;
            __$r__$292 = applyc(__$ctx, __$ref);
            $$mode = __$l11__$293;
            __$ctx._notNewList = __$l12__$294;
            __$ctx.position = __$l13__$295;
            __$ctx._listLength = __$l14__$296;
            __$ctx.ctx = __$l15__$297;
        }
        tag__$248 && (__$ctx._str += "</" + tag__$248 + ">");
    }
    res__$249 = __$ctx._str;
    __$r__$251 = undefined;
    __$ctx._str = __$l0__$252;
    __$ctx._buf.push(res__$249);
    return;
}

function __$b136(__$ctx, __$ref) {
    var __$r__$299;
    var __$l0__$300 = $$mode;
    $$mode = "";
    var __$l1__$301 = __$ctx.ctx;
    __$ctx.ctx = __$ctx.ctx._value;
    var __$r__$303;
    var __$l2__$304 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 256;
    __$r__$303 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$304;
    __$r__$299 = __$r__$303;
    $$mode = __$l0__$300;
    __$ctx.ctx = __$l1__$301;
    return;
}

function __$b137(__$ctx, __$ref) {
    __$ctx._listLength--;
    var ctx__$305 = __$ctx.ctx;
    if (ctx__$305 && ctx__$305 !== true || ctx__$305 === 0) {
        __$ctx._str += ctx__$305 + "";
    }
    return;
}

function __$b138(__$ctx, __$ref) {
    __$ctx._listLength--;
    return;
}

function __$b139(__$ctx, __$ref) {
    var ctx__$306 = __$ctx.ctx, len__$307 = ctx__$306.length, i__$308 = 0, prevPos__$309 = __$ctx.position, prevNotNewList__$310 = __$ctx._notNewList;
    if (prevNotNewList__$310) {
        __$ctx._listLength += len__$307 - 1;
    } else {
        __$ctx.position = 0;
        __$ctx._listLength = len__$307;
    }
    __$ctx._notNewList = true;
    while (i__$308 < len__$307) (function __$lb__$311() {
        var __$r__$312;
        var __$l0__$313 = __$ctx.ctx;
        __$ctx.ctx = ctx__$306[i__$308++];
        __$r__$312 = applyc(__$ctx, __$ref);
        __$ctx.ctx = __$l0__$313;
        return __$r__$312;
    })();
    prevNotNewList__$310 || (__$ctx.position = prevPos__$309);
    return;
}

function __$b140(__$ctx, __$ref) {
    __$ctx.ctx || (__$ctx.ctx = {});
    var vBlock__$314 = __$ctx.ctx.block, vElem__$315 = __$ctx.ctx.elem, block__$316 = __$ctx._currBlock || $$block;
    var __$r__$318;
    var __$l0__$319 = $$mode;
    $$mode = "default";
    var __$l1__$320 = $$block;
    $$block = vBlock__$314 || (vElem__$315 ? block__$316 : undefined);
    var __$l2__$321 = __$ctx._currBlock;
    __$ctx._currBlock = vBlock__$314 || vElem__$315 ? undefined : block__$316;
    var __$l3__$322 = $$elem;
    $$elem = vElem__$315;
    var __$l4__$323 = $$mods;
    $$mods = vBlock__$314 ? __$ctx.ctx.mods || (__$ctx.ctx.mods = {}) : $$mods;
    var __$l5__$324 = $$elemMods;
    $$elemMods = __$ctx.ctx.elemMods || {};
    $$block || $$elem ? __$ctx.position = (__$ctx.position || 0) + 1 : __$ctx._listLength--;
    applyc(__$ctx, __$ref);
    __$r__$318 = undefined;
    $$mode = __$l0__$319;
    $$block = __$l1__$320;
    __$ctx._currBlock = __$l2__$321;
    $$elem = __$l3__$322;
    $$mods = __$l4__$323;
    $$elemMods = __$l5__$324;
    return;
}

function __$b147(__$ctx, __$ref) {
    var ctx__$53 = __$ctx.ctx;
    return {
        name: ctx__$53.name,
        optionsMaxHeight: ctx__$53.optionsMaxHeight
    };
}

function __$b160(__$ctx, __$ref) {
    var ctx__$161 = __$ctx.ctx;
    return {
        mainOffset: ctx__$161.mainOffset,
        secondaryOffset: ctx__$161.secondaryOffset,
        viewportOffset: ctx__$161.viewportOffset,
        directions: ctx__$161.directions,
        zIndexGroupLevel: ctx__$161.zIndexGroupLevel
    };
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
            if (__$ctx._attach && (__$ctx.__$a0 & 268435456) === 0) {
                return [ {
                    block: "attach",
                    elem: "control"
                }, function __$lb__$184() {
                    var __$r__$185;
                    var __$l0__$186 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 268435456;
                    __$r__$185 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$186;
                    return __$r__$185;
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
        if ($$elem === "head" && (__$ctx.__$a1 & 32) === 0) {
            return [ function __$lb__$227() {
                var __$r__$228;
                var __$l0__$229 = __$ctx.__$a1;
                __$ctx.__$a1 = __$ctx.__$a1 | 32;
                __$r__$228 = applyc(__$ctx, __$ref);
                __$ctx.__$a1 = __$l0__$229;
                return __$r__$228;
            }(), {
                elem: "meta",
                attrs: {
                    name: "viewport",
                    content: "width=device-width," + (__$ctx.ctx.zoom ? "initial-scale=1" : "maximum-scale=1,initial-scale=1,user-scalable=0")
                }
            }, {
                elem: "meta",
                attrs: {
                    name: "format-detection",
                    content: "telephone=no"
                }
            }, {
                elem: "link",
                attrs: {
                    name: "apple-mobile-web-app-capable",
                    content: "yes"
                }
            } ];
        }
        if (!$$elem && (__$ctx.__$a1 & 64) === 0) {
            return [ function __$lb__$230() {
                var __$r__$231;
                var __$l0__$232 = __$ctx.__$a1;
                __$ctx.__$a1 = __$ctx.__$a1 | 64;
                __$r__$231 = applyc(__$ctx, __$ref);
                __$ctx.__$a1 = __$l0__$232;
                return __$r__$231;
            }(), __$ctx.ctx.scripts ];
        }
    } else if (__$t === "ua") {
        var __$t = !$$elem;
        if (__$t) {
            if ((__$ctx.__$a1 & 8) === 0) {
                return [ function __$lb__$218() {
                    var __$r__$219;
                    var __$l0__$220 = __$ctx.__$a1;
                    __$ctx.__$a1 = __$ctx.__$a1 | 8;
                    __$r__$219 = applyc(__$ctx, __$ref);
                    __$ctx.__$a1 = __$l0__$220;
                    return __$r__$219;
                }(), "(function(d,n){", "d.documentElement.className+=", '" ua_svg_"+(d[n]&&d[n]("http://www.w3.org/2000/svg","svg").createSVGRect?"yes":"no");', '})(document,"createElementNS");' ];
            }
            return [ "(function(e,c){", 'e[c]=e[c].replace(/(ua_js_)no/g,"$1yes");', '})(document.documentElement,"className");' ];
        }
    }
    return __$ctx.ctx.content;
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
            if ($$mods && $$mods["type"] === "link" && (__$ctx.__$a0 & 134217728) === 0) {
                var __$r = __$b37(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            if ((!$$mods.type || $$mods.type === "submit") && (__$ctx.__$a1 & 1) === 0) {
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
            if ((__$ctx.__$a0 & 2097152) === 0) {
                var __$r = __$ctx.extend({
                    autocomplete: "off",
                    autocorrect: "off",
                    autocapitalize: "off",
                    spellcheck: "false"
                }, function __$lb__$128() {
                    var __$r__$129;
                    var __$l0__$130 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 2097152;
                    __$r__$129 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$130;
                    return __$r__$129;
                }());
                if (__$r !== __$ref) return __$r;
            }
            var __$r = __$b49(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "image") {
        var __$t = !$$elem;
        if (__$t) {
            if (typeof __$ctx.ctx.content === "undefined" && (__$ctx.__$a0 & 8388608) === 0) {
                var __$r = __$b50(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            return {
                role: "img"
            };
        }
    } else if (__$t === "checkbox") {
        if ($$elem === "control") {
            var __$r = __$b52(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "attach") {
        if ($$elem === "control") {
            var __$r = __$b53(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "icon") {
        if (!$$elem) {
            var __$r = __$b54(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "page") {
        var __$t = $$elem;
        if (__$t === "js") {
            var __$r = __$b55(__$ctx, __$ref);
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
        } else if (__$t === "css") {
            if (__$ctx.ctx.url) {
                return "link";
            }
            return "style";
        } else if (__$t === "head") {
            return "head";
        } else if (__$t === "favicon") {
            return "link";
        } else if (__$t === "meta") {
            return "meta";
        }
        if (!$$elem) {
            return "body";
        }
    } else if (__$t === "ua") {
        if (!$$elem) {
            return "script";
        }
    }
    return undefined;
    return __$ref;
}

function __$g3(__$ctx, __$ref) {
    var __$t = $$block;
    if (__$t === "select") {
        if (!$$elem && $$mods && $$mods["mode"] === "radio" && __$ctx._checkedOptions && (__$ctx.__$a0 & 4) === 0) {
            var __$r = __$b110(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        var __$t = $$elem;
        if (__$t === "button") {
            if ((__$ctx.__$a0 & 256) === 0) {
                var __$r = __$b111(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
        } else if (__$t === "menu") {
            if ((__$ctx.__$a0 & 128) === 0) {
                var __$r = __$b112(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
        }
        if (!$$elem && !__$ctx._select && (__$ctx.__$a0 & 1024) === 0) {
            var __$r = __$b113(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "menu") {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods["mode"] === "radio" && __$ctx._firstItem && __$ctx._checkedItems && !__$ctx._checkedItems.length && (__$ctx.__$a0 & 8192) === 0) {
                var __$r = __$b114(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            if ((__$ctx.__$a0 & 262144) === 0) {
                var __$r = __$b115(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
        }
    } else if (__$t === "radio-group") {
        if (!$$elem && $$mods && $$mods["mode"] === "radio-check" && (__$ctx.__$a0 & 2048) === 0) {
            var __$r = __$b116(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "link") {
        var __$t = !$$elem;
        if (__$t) {
            if (__$ctx._menuItemDisabled) {
                var __$r = __$b117(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            if ((__$ctx.__$a0 & 33554432) === 0) {
                var __$r = __$b118(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
        }
    } else if (__$t === "menu-item") {
        var __$t = !$$elem;
        if (__$t) {
            if ($$mods && $$mods && $$mods["type"] === "link" && $$mods["disabled"] === true && !__$ctx._menuItemDisabled) {
                var __$r = __$b119(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
            if (__$ctx._menuMods && (__$ctx.__$a0 & 131072) === 0) {
                var __$r = __$b120(__$ctx, __$ref);
                if (__$r !== __$ref) return __$r;
            }
        }
    } else if (__$t === "input") {
        if (!$$elem && (__$ctx.__$a0 & 4194304) === 0) {
            var __$r = __$b121(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "attach") {
        if (!$$elem && (__$ctx.__$a1 & 2) === 0) {
            var __$r = __$b122(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "page") {
        if ($$elem === "icon" && (__$ctx.__$a1 & 4) === 0) {
            var __$r = __$b123(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (!$$elem && (__$ctx.__$a1 & 128) === 0) {
            var __$r = __$b124(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    } else if (__$t === "i-bem") {
        if ($$elem === "i18n") {
            var __$r = __$b125(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
    }
    var __$r = __$b126(__$ctx, __$ref);
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