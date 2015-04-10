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
                val: __$ctx.ctx.val
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
                    var __$r = __$ctx.extend(function __$lb__$172() {
                        var __$r__$173;
                        var __$l0__$174 = __$ctx.__$a0;
                        __$ctx.__$a0 = __$ctx.__$a0 | 67108864;
                        __$r__$173 = applyc(__$ctx, __$ref);
                        __$ctx.__$a0 = __$l0__$174;
                        return __$r__$173;
                    }(), {
                        url: __$ctx.ctx.url
                    });
                    if (__$r !== __$ref) return __$r;
                }
                if ($$mods["focused"] === true && (__$ctx.__$a0 & 536870912) === 0) {
                    var __$r = __$ctx.extend(function __$lb__$187() {
                        var __$r__$188;
                        var __$l0__$189 = __$ctx.__$a0;
                        __$ctx.__$a0 = __$ctx.__$a0 | 536870912;
                        __$r__$188 = applyc(__$ctx, __$ref);
                        __$ctx.__$a0 = __$l0__$189;
                        return __$r__$188;
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
                var __$r = __$ctx.extend(function __$lb__$141() {
                    var __$r__$142;
                    var __$l0__$143 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 16777216;
                    __$r__$142 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$143;
                    return __$r__$142;
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
    var ctx__$190 = __$ctx.ctx, content__$191 = [ ctx__$190.icon ];
    "text" in ctx__$190 && content__$191.push({
        elem: "text",
        content: ctx__$190.text
    });
    return content__$191;
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
    var content__$155 = __$ctx.ctx.content;
    if (Array.isArray(content__$155)) return content__$155;
    var res__$156 = __$ctx.isSimple(content__$155) ? {
        block: "button",
        text: content__$155
    } : content__$155;
    if (res__$156.block === "button") {
        var resMods__$157 = res__$156.mods || (res__$156.mods = {}), dropdownMods__$158 = $$mods;
        resMods__$157.size || (resMods__$157.size = dropdownMods__$158.size);
        resMods__$157.theme || (resMods__$157.theme = dropdownMods__$158.theme);
        resMods__$157.disabled = dropdownMods__$158.disabled;
    }
    return res__$156;
}

function __$b23(__$ctx, __$ref) {
    var content__$151 = __$ctx.ctx.content;
    if (Array.isArray(content__$151)) return content__$151;
    var res__$152 = __$ctx.isSimple(content__$151) ? {
        block: "link",
        mods: {
            pseudo: true
        },
        content: content__$151
    } : content__$151;
    if (res__$152.block === "link") {
        var resMods__$153 = res__$152.mods || (res__$152.mods = {}), dropdownMods__$154 = $$mods;
        resMods__$153.theme || (resMods__$153.theme = dropdownMods__$154.theme);
        resMods__$153.disabled = dropdownMods__$154.disabled;
    }
    return res__$152;
}

function __$b24(__$ctx, __$ref) {
    var popup__$160 = __$ctx.ctx.popup;
    if (__$ctx.isSimple(popup__$160) || popup__$160.block !== "popup") {
        popup__$160 = {
            block: "popup",
            content: popup__$160
        };
    }
    var popupMods__$161 = popup__$160.mods || (popup__$160.mods = {});
    popupMods__$161.theme || (popupMods__$161.theme = $$mods.theme);
    popupMods__$161.hasOwnProperty("autoclosable") || (popupMods__$161.autoclosable = true);
    popupMods__$161.target = "anchor";
    return [ {
        elem: "switcher",
        content: __$ctx.ctx.switcher
    }, popup__$160 ];
}

function __$b25(__$ctx, __$ref) {
    var mods__$162 = $$mods, ctx__$163 = __$ctx.ctx, val__$164 = ctx__$163.val, isValDef__$165 = typeof val__$164 !== "undefined";
    if (isValDef__$165 && !Array.isArray(val__$164)) throw Error("checkbox-group: val must be an array");
    return (ctx__$163.options || []).map(function(option, i) {
        return [ !!i && !mods__$162.type && {
            tag: "br"
        }, {
            block: "checkbox",
            mods: {
                type: mods__$162.type,
                theme: mods__$162.theme,
                size: mods__$162.size,
                checked: isValDef__$165 && val__$164.indexOf(option.val) > -1,
                disabled: option.disabled || mods__$162.disabled
            },
            name: ctx__$163.name,
            val: option.val,
            text: option.text,
            title: option.title,
            icon: option.icon
        } ];
    });
}

function __$b26(__$ctx, __$ref) {
    var ctx__$166 = __$ctx.ctx, mods__$167 = $$mods;
    return [ {
        block: "button",
        mods: {
            togglable: "check",
            checked: mods__$167.checked,
            disabled: mods__$167.disabled,
            theme: mods__$167.theme,
            size: mods__$167.size
        },
        title: ctx__$166.title,
        content: [ ctx__$166.icon, typeof ctx__$166.text !== "undefined" ? {
            elem: "text",
            content: ctx__$166.text
        } : "" ]
    }, {
        block: "checkbox",
        elem: "control",
        checked: mods__$167.checked,
        disabled: mods__$167.disabled,
        name: ctx__$166.name,
        val: ctx__$166.val
    } ];
}

function __$b27(__$ctx, __$ref) {
    var ctx__$170 = __$ctx.ctx, mods__$171 = $$mods;
    return [ {
        elem: "box",
        content: {
            elem: "control",
            checked: mods__$171.checked,
            disabled: mods__$171.disabled,
            name: ctx__$170.name,
            val: ctx__$170.val
        }
    }, ctx__$170.text ];
}

function __$b28(__$ctx, __$ref) {
    var ctx__$198 = __$ctx.ctx, button__$199 = ctx__$198.button;
    __$ctx.isSimple(button__$199) && (button__$199 = {
        block: "button",
        tag: "span",
        text: button__$199
    });
    var attachMods__$200 = $$mods, buttonMods__$201 = button__$199.mods || (button__$199.mods = {});
    [ "size", "theme", "disabled", "focused" ].forEach(function(mod) {
        buttonMods__$201[mod] || (buttonMods__$201[mod] = attachMods__$200[mod]);
    });
    return [ button__$199, {
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
    var ctx__$175 = __$ctx.ctx, attrs__$176 = {};
    ctx__$175.target && (attrs__$176.target = ctx__$175.target);
    $$mods.disabled ? attrs__$176["aria-disabled"] = true : attrs__$176.href = ctx__$175.url;
    return __$ctx.extend(function __$lb__$177() {
        var __$r__$178;
        var __$l0__$179 = __$ctx.__$a0;
        __$ctx.__$a0 = __$ctx.__$a0 | 134217728;
        __$r__$178 = applyc(__$ctx, __$ref);
        __$ctx.__$a0 = __$l0__$179;
        return __$r__$178;
    }(), attrs__$176);
}

function __$b38(__$ctx, __$ref) {
    var ctx__$192 = __$ctx.ctx, attrs__$193 = {
        type: $$mods.type || "button",
        name: ctx__$192.name,
        value: ctx__$192.val
    };
    $$mods.disabled && (attrs__$193.disabled = "disabled");
    return __$ctx.extend(function __$lb__$194() {
        var __$r__$195;
        var __$l0__$196 = __$ctx.__$a1;
        __$ctx.__$a1 = __$ctx.__$a1 | 1;
        __$r__$195 = applyc(__$ctx, __$ref);
        __$ctx.__$a1 = __$l0__$196;
        return __$r__$195;
    }(), attrs__$193);
}

function __$b39(__$ctx, __$ref) {
    var ctx__$197 = __$ctx.ctx;
    return {
        role: "button",
        tabindex: ctx__$197.tabIndex,
        id: ctx__$197.id,
        title: ctx__$197.title
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
    var ctx__$144 = __$ctx.ctx, attrs__$145 = {}, tabIndex__$146;
    if (!$$mods.disabled) {
        if (ctx__$144.url) {
            attrs__$145.href = ctx__$144.url;
            tabIndex__$146 = ctx__$144.tabIndex;
        } else {
            tabIndex__$146 = ctx__$144.tabIndex || 0;
        }
    }
    typeof tabIndex__$146 === "undefined" || (attrs__$145.tabindex = tabIndex__$146);
    ctx__$144.title && (attrs__$145.title = ctx__$144.title);
    ctx__$144.target && (attrs__$145.target = ctx__$144.target);
    return attrs__$145;
}

function __$b49(__$ctx, __$ref) {
    var input__$129 = __$ctx._input, attrs__$130 = {
        id: input__$129.id,
        name: input__$129.name,
        value: input__$129.val,
        maxlength: input__$129.maxLength,
        tabindex: input__$129.tabIndex,
        placeholder: input__$129.placeholder
    };
    input__$129.autocomplete === false && (attrs__$130.autocomplete = "off");
    $$mods.disabled && (attrs__$130.disabled = "disabled");
    return attrs__$130;
}

function __$b50(__$ctx, __$ref) {
    var ctx__$137 = __$ctx.ctx;
    return __$ctx.extend(function __$lb__$138() {
        var __$r__$139;
        var __$l0__$140 = __$ctx.__$a0;
        __$ctx.__$a0 = __$ctx.__$a0 | 8388608;
        __$r__$139 = applyc(__$ctx, __$ref);
        __$ctx.__$a0 = __$l0__$140;
        return __$r__$139;
    }(), {
        src: ctx__$137.url,
        width: ctx__$137.width,
        height: ctx__$137.height,
        alt: ctx__$137.alt,
        title: ctx__$137.title
    });
}

function __$b52(__$ctx, __$ref) {
    var attrs__$168 = {
        type: "checkbox",
        autocomplete: "off"
    }, ctx__$169 = __$ctx.ctx;
    attrs__$168.name = ctx__$169.name;
    attrs__$168.value = ctx__$169.val;
    ctx__$169.checked && (attrs__$168.checked = "checked");
    ctx__$169.disabled && (attrs__$168.disabled = "disabled");
    return attrs__$168;
}

function __$b53(__$ctx, __$ref) {
    var attrs__$180 = {
        type: "file"
    }, attach__$181 = __$ctx._attach;
    if (attach__$181) {
        attrs__$180.name = attach__$181.name;
        attach__$181.mods && attach__$181.mods.disabled && (attrs__$180.disabled = "disabled");
        attach__$181.tabIndex && (attrs__$180.tabindex = attach__$181.tabIndex);
    }
    return attrs__$180;
}

function __$b54(__$ctx, __$ref) {
    var attrs__$185 = {
        "aria-hidden": "true"
    }, url__$186 = __$ctx.ctx.url;
    if (url__$186) attrs__$185.style = "background-image:url(" + url__$186 + ")";
    return attrs__$185;
}

function __$b55(__$ctx, __$ref) {
    var attrs__$219 = {};
    if (__$ctx.ctx.url) {
        attrs__$219.src = __$ctx.ctx.url;
    } else if (__$ctx._nonceCsp) {
        attrs__$219.nonce = __$ctx._nonceCsp;
    }
    return attrs__$219;
}

function __$b66(__$ctx, __$ref) {
    var mix__$220 = function __$lb__$221() {
        var __$r__$222;
        var __$l0__$223 = __$ctx.__$a1;
        __$ctx.__$a1 = __$ctx.__$a1 | 16;
        __$r__$222 = applyc(__$ctx, __$ref);
        __$ctx.__$a1 = __$l0__$223;
        return __$r__$222;
    }(), uaMix__$224 = [ {
        block: "ua",
        attrs: {
            nonce: __$ctx._nonceCsp
        },
        js: true
    } ];
    return mix__$220 ? uaMix__$224.concat(mix__$220) : uaMix__$224;
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
    var ctx__$147 = __$ctx.ctx;
    typeof ctx__$147.url === "object" && (ctx__$147.url = __$ctx.reapply(ctx__$147.url));
    var __$r__$149;
    var __$l0__$150 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 33554432;
    __$r__$149 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l0__$150;
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
    var __$r__$132;
    var __$l0__$133 = __$ctx._input;
    __$ctx._input = __$ctx.ctx;
    var __$r__$135;
    var __$l1__$136 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 4194304;
    __$r__$135 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l1__$136;
    __$r__$132 = __$r__$135;
    __$ctx._input = __$l0__$133;
    return;
}

function __$b122(__$ctx, __$ref) {
    var __$r__$203;
    var __$l0__$204 = __$ctx._attach;
    __$ctx._attach = __$ctx.ctx;
    var __$r__$206;
    var __$l1__$207 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 2;
    __$r__$206 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l1__$207;
    __$r__$203 = __$r__$206;
    __$ctx._attach = __$l0__$204;
    return;
}

function __$b123(__$ctx, __$ref) {
    var ctx__$208 = __$ctx.ctx;
    var __$r__$210;
    var __$l0__$211 = $$mode;
    $$mode = "";
    var __$l1__$212 = __$ctx.ctx;
    __$ctx.ctx = [ ctx__$208.src16 && {
        elem: "link",
        attrs: {
            rel: "shortcut icon",
            href: ctx__$208.src16
        }
    }, ctx__$208.src114 && {
        elem: "link",
        attrs: {
            rel: "apple-touch-icon-precomposed",
            sizes: "114x114",
            href: ctx__$208.src114
        }
    }, ctx__$208.src72 && {
        elem: "link",
        attrs: {
            rel: "apple-touch-icon-precomposed",
            sizes: "72x72",
            href: ctx__$208.src72
        }
    }, ctx__$208.src57 && {
        elem: "link",
        attrs: {
            rel: "apple-touch-icon-precomposed",
            href: ctx__$208.src57
        }
    } ];
    var __$r__$214;
    var __$l2__$215 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 4;
    __$r__$214 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$215;
    __$r__$210 = __$r__$214;
    $$mode = __$l0__$211;
    __$ctx.ctx = __$l1__$212;
    return;
}

function __$b124(__$ctx, __$ref) {
    var ctx__$231 = __$ctx.ctx;
    __$ctx._nonceCsp = ctx__$231.nonce;
    var __$r__$233;
    var __$l0__$234 = $$mode;
    $$mode = "";
    var __$l1__$235 = __$ctx.ctx;
    __$ctx.ctx = [ ctx__$231.doctype || "<!DOCTYPE html>", {
        tag: "html",
        cls: "ua_js_no",
        content: [ {
            elem: "head",
            content: [ {
                tag: "meta",
                attrs: {
                    charset: "utf-8"
                }
            }, ctx__$231.uaCompatible === false ? "" : {
                tag: "meta",
                attrs: {
                    "http-equiv": "X-UA-Compatible",
                    content: ctx__$231.uaCompatible || "IE=edge"
                }
            }, {
                tag: "title",
                content: ctx__$231.title
            }, {
                block: "ua",
                attrs: {
                    nonce: ctx__$231.nonce
                }
            }, ctx__$231.head, ctx__$231.styles, ctx__$231.favicon ? {
                elem: "favicon",
                url: ctx__$231.favicon
            } : "" ]
        }, ctx__$231 ]
    } ];
    var __$r__$237;
    var __$l2__$238 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 128;
    __$r__$237 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$238;
    __$r__$233 = __$r__$237;
    $$mode = __$l0__$234;
    __$ctx.ctx = __$l1__$235;
    return;
}

function __$b125(__$ctx, __$ref) {
    if (!__$ctx.ctx) return "";
    var ctx__$239 = __$ctx.ctx, keyset__$240 = ctx__$239.keyset, key__$241 = ctx__$239.key, params__$242 = ctx__$239.params || {};
    if (!(keyset__$240 || key__$241)) return "";
    if (typeof ctx__$239.content === "undefined" || ctx__$239.content !== null) {
        params__$242.content = exports.apply(ctx__$239.content);
    }
    __$ctx._buf.push(BEM.I18N(keyset__$240, key__$241, params__$242));
    return;
}

function __$b126(__$ctx, __$ref) {
    var BEM_INTERNAL__$243 = __$ctx.BEM.INTERNAL, ctx__$244 = __$ctx.ctx, isBEM__$245, tag__$246, res__$247;
    var __$r__$249;
    var __$l0__$250 = __$ctx._str;
    __$ctx._str = "";
    var vBlock__$251 = $$block;
    var __$r__$253;
    var __$l1__$254 = $$mode;
    $$mode = "tag";
    __$r__$253 = applyc(__$ctx, __$ref);
    $$mode = __$l1__$254;
    tag__$246 = __$r__$253;
    typeof tag__$246 !== "undefined" || (tag__$246 = ctx__$244.tag);
    typeof tag__$246 !== "undefined" || (tag__$246 = "div");
    if (tag__$246) {
        var jsParams__$255, js__$256;
        if (vBlock__$251 && ctx__$244.js !== false) {
            var __$r__$257;
            var __$l2__$258 = $$mode;
            $$mode = "js";
            __$r__$257 = applyc(__$ctx, __$ref);
            $$mode = __$l2__$258;
            js__$256 = __$r__$257;
            js__$256 = js__$256 ? __$ctx.extend(ctx__$244.js, js__$256 === true ? {} : js__$256) : ctx__$244.js === true ? {} : ctx__$244.js;
            js__$256 && ((jsParams__$255 = {})[BEM_INTERNAL__$243.buildClass(vBlock__$251, ctx__$244.elem)] = js__$256);
        }
        __$ctx._str += "<" + tag__$246;
        var __$r__$259;
        var __$l3__$260 = $$mode;
        $$mode = "bem";
        __$r__$259 = applyc(__$ctx, __$ref);
        $$mode = __$l3__$260;
        isBEM__$245 = __$r__$259;
        typeof isBEM__$245 !== "undefined" || (isBEM__$245 = typeof ctx__$244.bem !== "undefined" ? ctx__$244.bem : ctx__$244.block || ctx__$244.elem);
        var __$r__$262;
        var __$l4__$263 = $$mode;
        $$mode = "cls";
        __$r__$262 = applyc(__$ctx, __$ref);
        $$mode = __$l4__$263;
        var cls__$261 = __$r__$262;
        cls__$261 || (cls__$261 = ctx__$244.cls);
        var addJSInitClass__$264 = ctx__$244.block && jsParams__$255 && !ctx__$244.elem;
        if (isBEM__$245 || cls__$261) {
            __$ctx._str += ' class="';
            if (isBEM__$245) {
                __$ctx._str += BEM_INTERNAL__$243.buildClasses(vBlock__$251, ctx__$244.elem, ctx__$244.elemMods || ctx__$244.mods);
                var __$r__$266;
                var __$l5__$267 = $$mode;
                $$mode = "mix";
                __$r__$266 = applyc(__$ctx, __$ref);
                $$mode = __$l5__$267;
                var mix__$265 = __$r__$266;
                ctx__$244.mix && (mix__$265 = mix__$265 ? [].concat(mix__$265, ctx__$244.mix) : ctx__$244.mix);
                if (mix__$265) {
                    var visited__$268 = {}, visitedKey__$269 = function(block, elem) {
                        return (block || "") + "__" + (elem || "");
                    };
                    visited__$268[visitedKey__$269(vBlock__$251, $$elem)] = true;
                    __$ctx.isArray(mix__$265) || (mix__$265 = [ mix__$265 ]);
                    for (var i__$270 = 0; i__$270 < mix__$265.length; i__$270++) {
                        var mixItem__$271 = mix__$265[i__$270], hasItem__$272 = mixItem__$271.block && (vBlock__$251 !== ctx__$244.block || mixItem__$271.block !== vBlock__$251) || mixItem__$271.elem, mixBlock__$273 = mixItem__$271.block || mixItem__$271._block || $$block, mixElem__$274 = mixItem__$271.elem || mixItem__$271._elem || $$elem;
                        hasItem__$272 && (__$ctx._str += " ");
                        __$ctx._str += BEM_INTERNAL__$243[hasItem__$272 ? "buildClasses" : "buildModsClasses"](mixBlock__$273, mixItem__$271.elem || mixItem__$271._elem || (mixItem__$271.block ? undefined : $$elem), mixItem__$271.elemMods || mixItem__$271.mods);
                        if (mixItem__$271.js) {
                            (jsParams__$255 || (jsParams__$255 = {}))[BEM_INTERNAL__$243.buildClass(mixBlock__$273, mixItem__$271.elem)] = mixItem__$271.js === true ? {} : mixItem__$271.js;
                            addJSInitClass__$264 || (addJSInitClass__$264 = mixBlock__$273 && !mixItem__$271.elem);
                        }
                        if (hasItem__$272 && !visited__$268[visitedKey__$269(mixBlock__$273, mixElem__$274)]) {
                            visited__$268[visitedKey__$269(mixBlock__$273, mixElem__$274)] = true;
                            var __$r__$276;
                            var __$l6__$277 = $$mode;
                            $$mode = "mix";
                            var __$l7__$278 = $$block;
                            $$block = mixBlock__$273;
                            var __$l8__$279 = $$elem;
                            $$elem = mixElem__$274;
                            __$r__$276 = applyc(__$ctx, __$ref);
                            $$mode = __$l6__$277;
                            $$block = __$l7__$278;
                            $$elem = __$l8__$279;
                            var nestedMix__$275 = __$r__$276;
                            if (nestedMix__$275) {
                                for (var j__$280 = 0; j__$280 < nestedMix__$275.length; j__$280++) {
                                    var nestedItem__$281 = nestedMix__$275[j__$280];
                                    if (!nestedItem__$281.block && !nestedItem__$281.elem || !visited__$268[visitedKey__$269(nestedItem__$281.block, nestedItem__$281.elem)]) {
                                        nestedItem__$281._block = mixBlock__$273;
                                        nestedItem__$281._elem = mixElem__$274;
                                        mix__$265.splice(i__$270 + 1, 0, nestedItem__$281);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            cls__$261 && (__$ctx._str += isBEM__$245 ? " " + cls__$261 : cls__$261);
            __$ctx._str += addJSInitClass__$264 ? ' i-bem"' : '"';
        }
        if (isBEM__$245 && jsParams__$255) {
            __$ctx._str += ' data-bem="' + __$ctx.attrEscape(JSON.stringify(jsParams__$255)) + '"';
        }
        var __$r__$283;
        var __$l9__$284 = $$mode;
        $$mode = "attrs";
        __$r__$283 = applyc(__$ctx, __$ref);
        $$mode = __$l9__$284;
        var attrs__$282 = __$r__$283;
        attrs__$282 = __$ctx.extend(attrs__$282, ctx__$244.attrs);
        if (attrs__$282) {
            var name__$285, attr__$286;
            for (name__$285 in attrs__$282) {
                attr__$286 = attrs__$282[name__$285];
                if (typeof attr__$286 === "undefined") continue;
                __$ctx._str += " " + name__$285 + '="' + __$ctx.attrEscape(__$ctx.isSimple(attr__$286) ? attr__$286 : __$ctx.reapply(attr__$286)) + '"';
            }
        }
    }
    if (__$ctx.isShortTag(tag__$246)) {
        __$ctx._str += "/>";
    } else {
        tag__$246 && (__$ctx._str += ">");
        var __$r__$288;
        var __$l10__$289 = $$mode;
        $$mode = "content";
        __$r__$288 = applyc(__$ctx, __$ref);
        $$mode = __$l10__$289;
        var content__$287 = __$r__$288;
        if (content__$287 || content__$287 === 0) {
            isBEM__$245 = vBlock__$251 || $$elem;
            var __$r__$290;
            var __$l11__$291 = $$mode;
            $$mode = "";
            var __$l12__$292 = __$ctx._notNewList;
            __$ctx._notNewList = false;
            var __$l13__$293 = __$ctx.position;
            __$ctx.position = isBEM__$245 ? 1 : __$ctx.position;
            var __$l14__$294 = __$ctx._listLength;
            __$ctx._listLength = isBEM__$245 ? 1 : __$ctx._listLength;
            var __$l15__$295 = __$ctx.ctx;
            __$ctx.ctx = content__$287;
            __$r__$290 = applyc(__$ctx, __$ref);
            $$mode = __$l11__$291;
            __$ctx._notNewList = __$l12__$292;
            __$ctx.position = __$l13__$293;
            __$ctx._listLength = __$l14__$294;
            __$ctx.ctx = __$l15__$295;
        }
        tag__$246 && (__$ctx._str += "</" + tag__$246 + ">");
    }
    res__$247 = __$ctx._str;
    __$r__$249 = undefined;
    __$ctx._str = __$l0__$250;
    __$ctx._buf.push(res__$247);
    return;
}

function __$b136(__$ctx, __$ref) {
    var __$r__$297;
    var __$l0__$298 = $$mode;
    $$mode = "";
    var __$l1__$299 = __$ctx.ctx;
    __$ctx.ctx = __$ctx.ctx._value;
    var __$r__$301;
    var __$l2__$302 = __$ctx.__$a1;
    __$ctx.__$a1 = __$ctx.__$a1 | 256;
    __$r__$301 = applyc(__$ctx, __$ref);
    __$ctx.__$a1 = __$l2__$302;
    __$r__$297 = __$r__$301;
    $$mode = __$l0__$298;
    __$ctx.ctx = __$l1__$299;
    return;
}

function __$b137(__$ctx, __$ref) {
    __$ctx._listLength--;
    var ctx__$303 = __$ctx.ctx;
    if (ctx__$303 && ctx__$303 !== true || ctx__$303 === 0) {
        __$ctx._str += ctx__$303 + "";
    }
    return;
}

function __$b138(__$ctx, __$ref) {
    __$ctx._listLength--;
    return;
}

function __$b139(__$ctx, __$ref) {
    var ctx__$304 = __$ctx.ctx, len__$305 = ctx__$304.length, i__$306 = 0, prevPos__$307 = __$ctx.position, prevNotNewList__$308 = __$ctx._notNewList;
    if (prevNotNewList__$308) {
        __$ctx._listLength += len__$305 - 1;
    } else {
        __$ctx.position = 0;
        __$ctx._listLength = len__$305;
    }
    __$ctx._notNewList = true;
    while (i__$306 < len__$305) (function __$lb__$309() {
        var __$r__$310;
        var __$l0__$311 = __$ctx.ctx;
        __$ctx.ctx = ctx__$304[i__$306++];
        __$r__$310 = applyc(__$ctx, __$ref);
        __$ctx.ctx = __$l0__$311;
        return __$r__$310;
    })();
    prevNotNewList__$308 || (__$ctx.position = prevPos__$307);
    return;
}

function __$b140(__$ctx, __$ref) {
    __$ctx.ctx || (__$ctx.ctx = {});
    var vBlock__$312 = __$ctx.ctx.block, vElem__$313 = __$ctx.ctx.elem, block__$314 = __$ctx._currBlock || $$block;
    var __$r__$316;
    var __$l0__$317 = $$mode;
    $$mode = "default";
    var __$l1__$318 = $$block;
    $$block = vBlock__$312 || (vElem__$313 ? block__$314 : undefined);
    var __$l2__$319 = __$ctx._currBlock;
    __$ctx._currBlock = vBlock__$312 || vElem__$313 ? undefined : block__$314;
    var __$l3__$320 = $$elem;
    $$elem = vElem__$313;
    var __$l4__$321 = $$mods;
    $$mods = vBlock__$312 ? __$ctx.ctx.mods || (__$ctx.ctx.mods = {}) : $$mods;
    var __$l5__$322 = $$elemMods;
    $$elemMods = __$ctx.ctx.elemMods || {};
    $$block || $$elem ? __$ctx.position = (__$ctx.position || 0) + 1 : __$ctx._listLength--;
    applyc(__$ctx, __$ref);
    __$r__$316 = undefined;
    $$mode = __$l0__$317;
    $$block = __$l1__$318;
    __$ctx._currBlock = __$l2__$319;
    $$elem = __$l3__$320;
    $$mods = __$l4__$321;
    $$elemMods = __$l5__$322;
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
    var ctx__$159 = __$ctx.ctx;
    return {
        mainOffset: ctx__$159.mainOffset,
        secondaryOffset: ctx__$159.secondaryOffset,
        viewportOffset: ctx__$159.viewportOffset,
        directions: ctx__$159.directions,
        zIndexGroupLevel: ctx__$159.zIndexGroupLevel
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
            if (__$ctx._attach && (__$ctx.__$a0 & 268435456) === 0) {
                return [ {
                    block: "attach",
                    elem: "control"
                }, function __$lb__$182() {
                    var __$r__$183;
                    var __$l0__$184 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 268435456;
                    __$r__$183 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$184;
                    return __$r__$183;
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
            return [ function __$lb__$225() {
                var __$r__$226;
                var __$l0__$227 = __$ctx.__$a1;
                __$ctx.__$a1 = __$ctx.__$a1 | 32;
                __$r__$226 = applyc(__$ctx, __$ref);
                __$ctx.__$a1 = __$l0__$227;
                return __$r__$226;
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
            return [ function __$lb__$228() {
                var __$r__$229;
                var __$l0__$230 = __$ctx.__$a1;
                __$ctx.__$a1 = __$ctx.__$a1 | 64;
                __$r__$229 = applyc(__$ctx, __$ref);
                __$ctx.__$a1 = __$l0__$230;
                return __$r__$229;
            }(), __$ctx.ctx.scripts ];
        }
    } else if (__$t === "ua") {
        var __$t = !$$elem;
        if (__$t) {
            if ((__$ctx.__$a1 & 8) === 0) {
                return [ function __$lb__$216() {
                    var __$r__$217;
                    var __$l0__$218 = __$ctx.__$a1;
                    __$ctx.__$a1 = __$ctx.__$a1 | 8;
                    __$r__$217 = applyc(__$ctx, __$ref);
                    __$ctx.__$a1 = __$l0__$218;
                    return __$r__$217;
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
            if ((__$ctx.__$a0 & 2097152) === 0) {
                var __$r = __$ctx.extend({
                    autocomplete: "off",
                    autocorrect: "off",
                    autocapitalize: "off",
                    spellcheck: "false"
                }, function __$lb__$126() {
                    var __$r__$127;
                    var __$l0__$128 = __$ctx.__$a0;
                    __$ctx.__$a0 = __$ctx.__$a0 | 2097152;
                    __$r__$127 = applyc(__$ctx, __$ref);
                    __$ctx.__$a0 = __$l0__$128;
                    return __$r__$127;
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