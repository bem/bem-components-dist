var BH=function(){function t(){this._lastMatchId=0,this._matchers=[],this._infiniteLoopDetection=!1,this.lib={},this._inited=!1,this._options={},this._optJsAttrName="onclick",this._optJsAttrIsJs=!0,this._optEscapeContent=!1,this.utils={_expandoId:(new Date).getTime(),bh:this,isSimple:function(t){if(!t||t===!0)return!0;var e=typeof t;return"string"===e||"number"===e},extend:function(t){t&&"object"==typeof t||(t={});for(var e=1,n=arguments.length;n>e;e++){var o,a=arguments[e];if(a)for(o in a)t[o]=a[o]}return t},position:function(){var t=this.node;return"content"===t.index?1:t.position},isFirst:function(){var t=this.node;return"content"===t.index||1===t.position},isLast:function(){var t=this.node;return"content"===t.index||t.position===t.arr._listLength},tParam:function(t,e,n){var o="__tp_"+t,a=this.node;if(arguments.length>1)return(n||!a.hasOwnProperty(o))&&(a[o]=e),this;for(;a;){if(a.hasOwnProperty(o))return a[o];a=a.parentNode}return void 0},apply:function(t){var e=this.ctx,n=this.node,o=this.bh.processBemJson(t,e.block);return this.ctx=e,this.node=n,o},applyBase:function(){var t=this.node,e=t.json;!e.elem&&e.mods&&(e.blockMods=e.mods);var n=e.block,o=e.blockMods,a=this.bh._fastMatcher(this,e);return void 0!==a&&(this.ctx=t.arr[t.index]=t.json=a,t.blockName=n,t.blockMods=o),this},stop:function(){return this.ctx._stop=!0,this},generateId:function(){return"uniq"+this._expandoId+ ++e},mod:function(t,e,n){var o;return arguments.length>1?(o=this.ctx.mods||(this.ctx.mods={}),o[t]=!o.hasOwnProperty(t)||n?e:o[t],this):(o=this.ctx.mods,o?o[t]:void 0)},mods:function(t,e){var n=this.ctx.mods||(this.ctx.mods={});return void 0!==t?(this.ctx.mods=e?this.extend(n,t):this.extend(t,n),this):n},tag:function(t,e){return void 0!==t?(this.ctx.tag=void 0===this.ctx.tag||e?t:this.ctx.tag,this):this.ctx.tag},mix:function(t,e){return void 0!==t?(this.ctx.mix=e?t:this.ctx.mix?Array.isArray(this.ctx.mix)?this.ctx.mix.concat(t):[this.ctx.mix].concat(t):t,this):this.ctx.mix},attr:function(t,e,n){var o;return arguments.length>1?(o=this.ctx.attrs||(this.ctx.attrs={}),o[t]=!o.hasOwnProperty(t)||n?e:o[t],this):(o=this.ctx.attrs,o?o[t]:void 0)},attrs:function(t,e){var n=this.ctx.attrs||{};return void 0!==t?(this.ctx.attrs=e?this.extend(n,t):this.extend(t,n),this):n},bem:function(t,e){return void 0!==t?(this.ctx.bem=void 0===this.ctx.bem||e?t:this.ctx.bem,this):this.ctx.bem},js:function(t,e){return void 0!==t?(this.ctx.js=e?t===!0?{}:t:t?this.extend(this.ctx.js,t):this.ctx.js,this):this.ctx.js},cls:function(t,e){return void 0!==t?(this.ctx.cls=void 0===this.ctx.cls||e?t:this.ctx.cls,this):this.ctx.cls},param:function(t,e,n){return void 0!==e?(this.ctx[t]=void 0===this.ctx[t]||n?e:this.ctx[t],this):this.ctx[t]},content:function(t,e){return arguments.length>0?(this.ctx.content=void 0===this.ctx.content||e?t:this.ctx.content,this):this.ctx.content},html:function(t,e){return arguments.length>0?(this.ctx.html=void 0===this.ctx.html||e?t:this.ctx.html,this):this.ctx.html},json:function(){return this.ctx}}}var e=0;t.prototype={setOptions:function(t){var e;for(e in t)this._options[e]=t[e];return t.jsAttrName&&(this._optJsAttrName=t.jsAttrName),t.jsAttrScheme&&(this._optJsAttrIsJs="js"===t.jsAttrScheme),t.escapeContent&&(this._optEscapeContent=t.escapeContent),this},getOptions:function(){return this._options},enableInfiniteLoopDetection:function(t){return this._infiniteLoopDetection=t,this},apply:function(t){return this.toHtml(this.processBemJson(t))},match:function(t,e){if(!t)return this;if(Array.isArray(t))return t.forEach(function(n,o){this.match(t[o],e)},this),this;if("object"==typeof t){for(var n in t)this.match(n,t[n]);return this}return e.__id="__func"+this._lastMatchId++,this._matchers.push([t,e]),this._fastMatcher=null,this},buildMatcher:function(){function t(t,e){for(var n={},o=0,a=t.length;a>o;o++){var c=t[o],i=c[e]||"__no_value__";(n[i]||(n[i]=[])).push(c)}return n}var e,n,o,a,c,i,s,r,l=[],h=["bh = this"],m=this._matchers,d=[];for(e=m.length-1;e>=0;e--)i=m[e],c=i[0],h.push("_m"+e+" = ms["+e+"][1]"),a={fn:i[1],index:e},~c.indexOf("__")?(s=c.split("__"),r=s[0].split("_"),a.block=r[0],r.length>1&&(a.blockMod=r[1],a.blockModVal=r[2]||!0),s=s[1].split("_"),a.elem=s[0],s.length>1&&(a.elemMod=s[1],a.elemModVal=s[2]||!0)):(s=c.split("_"),a.block=s[0],s.length>1&&(a.blockMod=s[1],a.blockModVal=s[2]||!0)),d.push(a);var u=t(d,"block");l.push("var "+h.join(", ")+";"),l.push("function applyMatchers(ctx, json) {"),l.push("var subRes;"),l.push("switch (json.block) {");for(var p in u){l.push('case "'+p+'":');var b=t(u[p],"elem");l.push("switch (json.elem) {");for(var f in b){l.push("__no_value__"===f?"case undefined:":'case "'+f+'":');var _=b[f];for(n=0,o=_.length;o>n;n++){a=_[n];var x=a.fn,v=[];v.push("!json."+x.__id),a.elemMod&&v.push('json.mods && json.mods["'+a.elemMod+'"] === '+(a.elemModVal===!0||'"'+a.elemModVal+'"')),a.blockMod&&v.push('json.blockMods["'+a.blockMod+'"] === '+(a.blockModVal===!0||'"'+a.blockModVal+'"')),l.push("if ("+v.join(" && ")+") {"),l.push("json."+x.__id+" = true;"),l.push("subRes = _m"+a.index+"(ctx, json);"),l.push('if (subRes !== undefined) { return (subRes || "") }'),l.push("if (json._stop) return;"),l.push("}")}l.push("return;")}l.push("}"),l.push("return;")}return l.push("}"),l.push("};"),l.push("return applyMatchers;"),l.join("\n")},processBemJson:function(t,e,n){function o(){this.ctx=null}if(null!=t){this._inited||this._init();var a,c,i,s,r,l,h,m,d,u,p=[t],b=[{json:t,arr:p,index:0,blockName:e,blockMods:!t.elem&&t.mods||{}}],f=this._fastMatcher||(this._fastMatcher=Function("ms",this.buildMatcher())(this._matchers)),_=!n,x=this._infiniteLoopDetection;o.prototype=this.utils;for(var v=new o;a=b.shift();){if(c=a.json,i=a.blockName,s=a.blockMods,Array.isArray(c)){for(r=0,l=0,h=c.length;h>r;r++)d=c[r],d!==!1&&null!=d&&"object"==typeof d&&b.push({json:d,arr:c,index:r,position:++l,blockName:i,blockMods:s,parentNode:a});c._listLength=l}else{var k,g=!1;if(c.elem?(i=c.block=c.block||i,s=c.blockMods=c.blockMods||s,c.elemMods&&(c.mods=c.elemMods)):c.block&&(i=c.block,s=c.blockMods=c.mods||{}),c.block){if(x){if(c.__processCounter=(c.__processCounter||0)+1,f.__processCounter=(f.__processCounter||0)+1,c.__processCounter>100)throw new Error('Infinite json loop detected at "'+c.block+(c.elem?"__"+c.elem:"")+'".');if(f.__processCounter>1e3)throw new Error('Infinite matcher loop detected at "'+c.block+(c.elem?"__"+c.elem:"")+'".')}u=void 0,c._stop||(v.node=a,v.ctx=c,u=f(v,c),void 0!==u&&(c=u,a.json=c,a.blockName=i,a.blockMods=s,b.push(a),g=!0))}if(!g&&_&&(k=c.content))if(Array.isArray(k)){var y;do{for(y=!1,r=0,h=k.length;h>r;r++)if(Array.isArray(k[r])){y=!0;break}y&&(c.content=k=k.concat.apply([],k))}while(y);for(r=0,l=0,h=k.length,m=h-1;h>r;r++)d=k[r],d!==!1&&null!=d&&"object"==typeof d&&b.push({json:d,arr:k,index:r,position:++l,blockName:i,blockMods:s,parentNode:a});k._listLength=l}else b.push({json:k,arr:c,index:"content",blockName:i,blockMods:s,parentNode:a})}a.arr[a.index]=c}return p[0]}},toHtml:function(t){var e,i,s,r;if(t===!1||null==t)return"";if("object"!=typeof t)return this._optEscapeContent?o(t):t;if(Array.isArray(t)){for(e="",i=0,s=t.length;s>i;i++)r=t[i],r!==!1&&null!=r&&(e+=this.toHtml(r));return e}var l=t.bem!==!1;if("undefined"!=typeof t.tag&&!t.tag)return t.html||t.content?this.toHtml(t.content):"";t.mix&&!Array.isArray(t.mix)&&(t.mix=[t.mix]);var h,m,d,u="",p="",b=!1;if(h=t.attrs)for(i in h)m=h[i],null!==m&&void 0!==m&&(p+=" "+i+'="'+a(m)+'"');if(l){var f=t.block+(t.elem?"__"+t.elem:"");t.block&&(u=c(t,f),t.js&&((d={})[f]=t.js===!0?{}:t.js));var _=d&&!t.elem,x=t.mix;if(x&&x.length)for(i=0,s=x.length;s>i;i++){var v=x[i];if(v&&v.bem!==!1){var k=v.block||t.block||"",g=v.elem||(v.block?null:t.block&&t.elem),y=k+(g?"__"+g:"");k&&(u+=c(v,y,f),v.js&&((d=d||{})[y]=v.js===!0?{}:v.js,b=!0,_||(_=k&&!g)))}}if(d){_&&(u+=" i-bem");var j=b||t.js!==!0?a(JSON.stringify(d)):"{&quot;"+f+"&quot;:{}}";p+=" "+(t.jsAttr||this._optJsAttrName)+'="'+(this._optJsAttrIsJs?"return "+j:j)+'"'}}t.cls&&(u=u?u+" "+t.cls:t.cls);var M,w=t.tag||"div";if(e="<"+w+(u?' class="'+a(u)+'"':"")+(p?p:""),n[w])e+="/>";else{if(e+=">",t.html)e+=t.html;else if(null!=(M=t.content))if(Array.isArray(M))for(i=0,s=M.length;s>i;i++)r=M[i],r!==!1&&null!=r&&(e+=this.toHtml(r));else e+=this.toHtml(M);e+="</"+w+">"}return e},_init:function(){this._inited=!0,"undefined"!=typeof BEM&&"undefined"!=typeof BEM.I18N&&(this.lib.i18n=this.lib.i18n||BEM.I18N)}},t.prototype.processBemjson=t.prototype.processBemJson;var n={area:1,base:1,br:1,col:1,command:1,embed:1,hr:1,img:1,input:1,keygen:1,link:1,menuitem:1,meta:1,param:1,source:1,track:1,wbr:1},o=t.prototype.xmlEscape=function(t){return(t+"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")},a=t.prototype.attrEscape=function(t){return(t+"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")},c=function(t,e,n){var o,a,c,i="";if(n!==e&&(n&&(i+=" "),i+=e),o=t.mods||t.elem&&t.elemMods)for(c in o)a=o[c],(a||0===a)&&(i+=" "+e+"_"+c+(a===!0?"":"_"+a));return i};return t}();"undefined"!=typeof module&&(module.exports=BH);var bh=new BH;bh.setOptions({jsAttrName:"data-bem",jsAttrScheme:"json"}),bh.match("page",function(t,e){return t.tag("body").tParam("nonceCsp",e.nonce).content([t.content(),e.scripts],!0),[e.doctype||"<!DOCTYPE html>",{tag:"html",cls:"ua_js_no",content:[{elem:"head",content:[{tag:"meta",attrs:{charset:"utf-8"}},e.uaCompatible===!1?"":{tag:"meta",attrs:{"http-equiv":"X-UA-Compatible",content:e.uaCompatible||"IE=edge"}},{tag:"title",content:e.title},{block:"ua",attrs:{nonce:e.nonce}},e.head,e.styles,e.favicon?{elem:"favicon",url:e.favicon}:""]},e]}]}),bh.match("page__head",function(t){t.bem(!1).tag("head")}),bh.match("page__meta",function(t){t.bem(!1).tag("meta")}),bh.match("page__link",function(t){t.bem(!1).tag("link")}),bh.match("page__favicon",function(t,e){t.bem(!1).tag("link").attr("rel","shortcut icon").attr("href",e.url)}),bh.match("page",function(t){t.mix({block:"ua",js:!0})}),bh.match("page__head",function(t,e){t.applyBase().content([e.content,{elem:"meta",attrs:{name:"viewport",content:"width=device-width,"+(e.zoom?"initial-scale=1":"maximum-scale=1,initial-scale=1,user-scalable=0")}},{elem:"meta",attrs:{name:"format-detection",content:"telephone=no"}},{elem:"link",attrs:{name:"apple-mobile-web-app-capable",content:"yes"}}],!0)}),bh.match("ua",function(t){t.bem(!1).tag("script").content(["(function(e,c){",'e[c]=e[c].replace(/(ua_js_)no/g,"$1yes");','})(document.documentElement,"className");'],!0)}),bh.match("ua",function(t){t.js(!0)}),bh.match("page__css",function(t,e){t.bem(!1),e.url?t.tag("link").attr("rel","stylesheet").attr("href",e.url):t.tag("style")}),bh.match("page__js",function(t,e){var n=t.tParam("nonceCsp");t.bem(!1).tag("script"),e.url?t.attr("src",e.url):n&&t.attr("nonce",n)}),bh.match("ua",function(t,e){t.applyBase(),t.content([e.content,"(function(d,n){","d.documentElement.className+=",'" ua_svg_"+(d[n]&&d[n]("http://www.w3.org/2000/svg","svg").createSVGRect?"yes":"no");','})(document,"createElementNS");'],!0)}),bh.match("page__icon",function(t,e){t.content([e.src16&&{elem:"link",attrs:{rel:"shortcut icon",href:e.src16}},e.src114&&{elem:"link",attrs:{rel:"apple-touch-icon-precomposed",sizes:"114x114",href:e.src114}},e.src72&&{elem:"link",attrs:{rel:"apple-touch-icon-precomposed",sizes:"72x72",href:e.src72}},e.src57&&{elem:"link",attrs:{rel:"apple-touch-icon-precomposed",href:e.src57}}],!0)}),bh.match("attach",function(t,e){t.tParam("_attach",e).tag("span").js(!0);var n=e.button;"object"==typeof n||(n={block:"button",tag:"span",text:n});var o=t.mods(),a=n.mods||(n.mods={});["size","theme","disabled","focused"].forEach(function(t){a[t]||(a[t]=o[t])}),t.content([n,{elem:"no-file",content:e.noFileText}],!0)}),bh.match("button",function(t,e){var n=t.mod("type"),o=!n||"submit"===n;t.tParam("_button",e).tag(e.tag||"button").js(!0).attrs({role:"button",tabindex:e.tabIndex,id:e.id,type:o?n||"button":void 0,name:e.name,value:e.val,title:e.title}).mix({elem:"control"}),o&&t.mod("disabled")&&t.attr("disabled","disabled");var a=t.content();"undefined"==typeof a&&(a=[e.icon],"text"in e&&a.push({elem:"text",content:e.text}),t.content(a))}),bh.match("button__text",function(t){t.tag("span")}),bh.match("button_focused",function(t,e){t.js(t.extend(e.js,{live:!1}),!0)}),bh.match("icon",function(t,e){var n={"aria-hidden":"true"},o=e.url;o&&(n.style="background-image:url("+o+")"),t.tag("i").attrs(n)}),bh.match("button",function(t){t.tParam("_attach")&&t.applyBase().tag("span",!0).content([{block:"attach",elem:"control"},t.content()],!0)}),bh.match("attach__control",function(t){var e={type:"file"},n=t.tParam("_attach");n&&(e.name=n.name,n.mods&&n.mods.disabled&&(e.disabled="disabled"),n.tabIndex&&(e.tabindex=n.tabIndex)),t.tag("input").attrs(e)}),bh.match("attach__no-file",function(t){t.tag("span")}),bh.match("attach__file",function(t){t.tag("span")}),bh.match("attach__text",function(t){t.tag("span")}),bh.match("attach__clear",function(t){t.tag("i")}),bh.match("button_type_link",function(t,e){t.tag("a"),e.target&&t.attr("target",e.target),t.mod("disabled")?t.attr("aria-disabled",!0).js({url:e.url}):t.attr("href",e.url)}),bh.match("checkbox",function(t,e){t.tag("label").js(!0).content([{elem:"box",content:{elem:"control",checked:t.mod("checked"),disabled:t.mod("disabled"),name:e.name,val:e.val}},e.text])}),bh.match("checkbox__box",function(t){t.tag("span")}),bh.match("checkbox__control",function(t,e){t.tag("input");var n={type:"checkbox",autocomplete:"off"};n.name=e.name,n.value=e.val,e.checked&&(n.checked="checked"),e.disabled&&(n.disabled="disabled"),t.attrs(n)}),bh.match("checkbox_type_button",function(t,e){var n=t.mods();t.content([{block:"button",mods:{togglable:"check",checked:n.checked,disabled:n.disabled,theme:n.theme,size:n.size},title:e.title,content:[e.icon,"undefined"!=typeof e.text?{elem:"text",content:e.text}:""]},{block:"checkbox",elem:"control",checked:n.checked,disabled:n.disabled,name:e.name,val:e.val}])}),bh.match("checkbox-group",function(t,e){t.tag("span").js(!0).mix({block:"control-group"});var n=t.mods(),o=e.val,a="undefined"!=typeof o;if(a&&!Array.isArray(o))throw Error("checkbox-group: val must be an array");t.content((e.options||[]).map(function(t,c){return[!!c&&!n.type&&{tag:"br"},{block:"checkbox",mods:{type:n.type,theme:n.theme,size:n.size,checked:a&&o.indexOf(t.val)>-1,disabled:t.disabled||n.disabled},name:e.name,val:t.val,text:t.text,title:t.title,icon:t.icon}]}))}),bh.match("dropdown",function(t,e){t.js(!0);var n=e.popup;(t.isSimple(n)||"popup"!==n.block)&&(n={block:"popup",content:n});var o=n.mods||(n.mods={});o.theme||(o.theme=t.mod("theme")),o.hasOwnProperty("autoclosable")||(o.autoclosable=!0),o.target="anchor",t.content([{elem:"switcher",content:e.switcher},n],!0)}),bh.match("dropdown__switcher",function(t){t.tag(!1)}),bh.match("popup",function(t,e){t.js({mainOffset:e.mainOffset,secondaryOffset:e.secondaryOffset,viewportOffset:e.viewportOffset,directions:e.directions,zIndexGroupLevel:e.zIndexGroupLevel})}),bh.match("dropdown_switcher_button__switcher",function(t,e){var n=t.content();if(Array.isArray(n))return n;var o=t.isSimple(n)?{block:"button",text:n}:n;if("button"===o.block){var a=o.mods||(o.mods={}),c=e.blockMods;a.size||(a.size=c.size),a.theme||(a.theme=c.theme),a.disabled=c.disabled}return o}),bh.match("dropdown_switcher_link__switcher",function(t,e){var n=t.content();if(Array.isArray(n))return n;var o=t.isSimple(n)?{block:"link",mods:{pseudo:!0},content:n}:n;if("link"===o.block){var a=o.mods||(o.mods={}),c=e.blockMods;a.theme||(a.theme=c.theme),a.disabled=c.disabled}return o}),bh.match("link",function(t,e){t.tag("a").mix({elem:"control"});var n,o="object"==typeof e.url?bh.apply(e.url):e.url,a={};t.mod("disabled")?t.js(o?{url:o}:!0):(o?(a.href=o,n=e.tabIndex):n=e.tabIndex||0,t.js(!0)),"undefined"==typeof n||(a.tabindex=n),e.title&&(a.title=e.title),e.target&&(a.target=e.target),t.attrs(a)}),bh.match("link_pseudo",function(t,e){e.url||t.tag("span")}),bh.match("image",function(t,e){t.attr("role","img"),"undefined"!=typeof e.content?t.tag("span"):t.tag("img").attrs({src:e.url,width:e.width,height:e.height,alt:e.alt,title:e.title})}),bh.match("input",function(t,e){t.tag("span").js(!0).tParam("_input",e).content({elem:"box",content:{elem:"control"}},!0)}),bh.match("input__box",function(t){t.tag("span")}),bh.match("input__control",function(t){t.tag("input");var e=t.tParam("_input"),n={id:e.id,name:e.name,value:e.val,maxlength:e.maxLength,tabindex:e.tabIndex,placeholder:e.placeholder};e.autocomplete===!1&&(n.autocomplete="off"),e.mods&&e.mods.disabled&&(n.disabled="disabled"),t.attrs(n)}),bh.match("input__control",function(t){t.applyBase().attrs({autocomplete:"off",autocorrect:"off",autocapitalize:"off",spellcheck:"false"})}),bh.match("input_has-clear__box",function(t){t.content([t.content(),{elem:"clear"}],!0)}),bh.match("input__clear",function(t){t.tag("i")}),bh.match("input_type_password__control",function(t){t.attr("type","password")}),bh.match("input_type_search__control",function(t){t.attr("type","search")}),bh.match("menu",function(t,e){var n={theme:t.mod("theme"),disabled:t.mod("disabled")};t.js(!0).tParam("menuMods",n).mix({elem:"control"});var o={role:"menu"};t.mod("disabled")||(o.tabindex=0),t.attrs(o);var a,c=[];if(e.content){var i="undefined"!=typeof e.val,s="check"===t.mod("mode"),r=function(t){return i&&(s?e.val.indexOf(t)>-1:e.val===t)},l=function(t){for(var e,n=0;e=t[n++];)"menu-item"===e.block?(a||(a=e),r(e.val)&&((e.mods=e.mods||{}).checked=!0,c.push(e))):l(e.content)};if(!Array.isArray(e.content))throw Error("menu: content must be an array of the menu items");l(e.content)}t.tParam("firstItem",a).tParam("checkedItems",c)}),bh.match("menu-item",function(t,e){var n=t.tParam("menuMods");n&&t.mods({theme:n.theme,disabled:n.disabled}),t.js({val:e.val}).attr("role","menuitem")}),bh.match("menu_focused",function(t){var e=t.extend(t.js()||{},{live:!1});t.js(e)}),bh.match("menu__group",function(t,e){t.attr("role","group");var n=e.title;"undefined"!=typeof n&&t.attr("aria-label",n,!0).content([{elem:"group-title",content:n},t.content()],!0)}),bh.match("menu__group-title",function(t){t.attr("role","presentation")}),bh.match("menu_mode_radio",function(t){t.applyBase();var e=t.tParam("firstItem");e&&!t.tParam("checkedItems").length&&((e.mods=e.mods||{}).checked=!0)}),bh.match("menu-item_type_link",function(t){t.applyBase(),t.mod("disabled")&&t.tParam("_menuItemDisabled",!0)}),bh.match("link",function(t){t.tParam("_menuItemDisabled")&&t.mod("disabled",!0)}),bh.match("modal",function(t,e){t.js(!0).mix({block:"popup",js:{zIndexGroupLevel:e.zIndexGroupLevel||20},mods:{autoclosable:t.mod("autoclosable")}}).content({elem:"table",content:{elem:"cell",content:{elem:"content",content:t.content()}}},!0)}),bh.match("progressbar",function(t,e){var n=e.val;t.js({val:n}).content({elem:"bar",attrs:{style:"width:"+n+"%"}})}),bh.match("radio",function(t,e){t.tag("label").js(!0).content([{elem:"box",content:{elem:"control",checked:t.mod("checked"),disabled:t.mod("disabled"),name:e.name,val:e.val}},e.text])}),bh.match("radio__box",function(t){t.tag("span")}),bh.match("radio__control",function(t,e){t.tag("input");var n={type:"radio",autocomplete:"off",name:e.name,value:e.val};e.checked&&(n.checked="checked"),e.disabled&&(n.disabled="disabled"),t.attrs(n)}),bh.match("radio_type_button",function(t,e){var n=t.mods();t.content([{block:"button",mods:{togglable:"radio-check"===n.mode?"check":"radio",checked:n.checked,disabled:n.disabled,theme:n.theme,size:n.size},title:e.title,content:[e.icon,"undefined"!=typeof e.text?{elem:"text",content:e.text}:""]},{block:"radio",elem:"control",checked:n.checked,disabled:n.disabled,name:e.name,val:e.val}])}),bh.match("radio-group",function(t,e){t.tag("span").js(!0).mix({block:"control-group"});var n=t.mods(),o="undefined"!=typeof e.val;t.content((e.options||[]).map(function(t,a){return[!!a&&!n.type&&{tag:"br"},{block:"radio",mods:{type:n.type,mode:n.mode,theme:n.theme,size:n.size,checked:o&&e.val===t.val,disabled:t.disabled||n.disabled},name:e.name,val:t.val,text:t.text,title:t.title,icon:t.icon}]}))}),bh.match("radio-group_mode_radio-check",function(t){if("button"!==t.mod("type"))throw Error("Modifier mode=radio-check can be only with modifier type=button")}),bh.match("select",function(t,e){function n(t){return c&&(i?e.val.indexOf(t)>-1:e.val===t)}function o(t){for(var e,c=0;e=t[c++];)e.group?o(e.group):(a||(a=e),n(e.val)&&(e.checked=!0,s.push(e)))}if(!t.mod("mode"))throw Error("Can't build select without mode modifier");var a,c="undefined"!=typeof e.val,i="check"===t.mod("mode"),s=[];o(e.options),t.js({name:e.name,optionsMaxHeight:e.optionsMaxHeight}).tParam("select",e).tParam("firstOption",a).tParam("checkedOptions",s).content([{elem:"button"},{block:"popup",mods:{target:"anchor",theme:t.mod("theme"),autoclosable:!0},directions:["bottom-left","bottom-right","top-left","top-right"],content:{block:e.block,mods:t.mods(),elem:"menu"}}])}),bh.match("select_focused",function(t){t.applyBase().extend(t.js(),{live:!1})}),bh.match("select__control",function(t,e){t.tag("input").attrs({type:"hidden",name:t.tParam("select").name,value:e.val,disabled:e.blockMods.disabled?"disabled":void 0})}),bh.match("select__button",function(t,e){var n=e.blockMods,o=t.tParam("select"),a=t.tParam("checkedOptions");return{block:"button",mix:{block:e.block,elem:e.elem},mods:{size:n.size,theme:n.theme,view:n.view,focused:n.focused,disabled:n.disabled,checked:"radio"!==n.mode&&!!a.length},id:o.id,tabIndex:o.tabIndex,content:[t.content(),{block:"icon",mix:{block:"select",elem:"tick"}}]}}),bh.match("select__menu",function(t,e){var n=t.mods(),o=t.tParam("select"),a=function(t){var e={block:"menu-item",mods:{disabled:n.disabled||t.disabled},val:t.val,js:{checkedText:t.checkedText},content:t.text};return t.icon&&(e.js.text=t.text,e.content=[t.icon,e.content]),e};return{block:"menu",mix:{block:e.block,elem:e.elem},mods:{size:n.size,theme:n.theme,disabled:n.disabled,mode:n.mode},val:o.val,attrs:{tabindex:null},content:o.options.map(function(t){return t.group?{elem:"group",mods:{"has-title":!!t.title},title:t.title,content:t.group.map(a)}:a(t)})}}),bh.match("select_mode_check",function(t,e){t.applyBase().extend(t.js(),{text:e.text});var n=t.tParam("checkedOptions");if(n[0]){var o=n.map(function(t){return{elem:"control",val:t.val}});t.content([o,t.content()],!0)}}),bh.match("select_mode_check__button",function(t){var e=t.tParam("checkedOptions");t.content({elem:"text",content:1===e.length?e[0].text:e.reduce(function(t,e){return t+(t?", ":"")+(e.checkedText||e.text)},"")||t.tParam("select").text})}),bh.match("select_mode_radio-check",function(t,e){t.applyBase().extend(t.js(),{text:e.text});var n=t.tParam("checkedOptions");n[0]&&t.content([{elem:"control",val:n[0].val},t.content()],!0)}),bh.match("select_mode_radio-check__button",function(t){var e=t.tParam("checkedOptions");t.content({elem:"text",content:(e[0]||t.tParam("select")).text})}),bh.match("select_mode_radio",function(t){t.applyBase();var e=t.tParam("checkedOptions"),n=t.tParam("firstOption");n&&!e.length&&(n.checked=!0,e=[n]),t.tParam("checkedOption",e[0]).content([{elem:"control",val:e[0].val},t.content()],!0)}),bh.match("select_mode_radio__button",function(t){t.content({elem:"text",content:t.tParam("checkedOption").text})}),bh.match("spin",function(t){t.tag("span")}),bh.match("textarea",function(t,e){var n={id:e.id,name:e.name,tabindex:e.tabIndex,placeholder:e.placeholder};e.autocomplete===!1&&(n.autocomplete="off"),t.mod("disabled")&&(n.disabled="disabled"),t.js(!0).tag("textarea").mix({elem:"control"}).attrs(n).content(e.val,!0)}),bh.match("progressbar_theme_simple",function(t,e){t.applyBase().content([{elem:"box",content:e.content},{elem:"text",content:e.val}],!0)}),module.exports=bh;