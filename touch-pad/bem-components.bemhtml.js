!function(e){var t=function(e){function t(e){e=e||this,ut=e.mods,ct=e.elemMods,ot=e.elem,at=e.block,it=e._mode;try{return r(e,lt)}catch(t){throw t.xjstContext=e,t}}function r(e,t){var r=it;if("content"===r){var n=et(e,t);if(n!==t)return n}else if("attrs"===r){var n=tt(e,t);if(n!==t)return n}else{if("mix"===r){var r=at;if("textarea"===r){if(!ot)return{elem:"control"}}else if("button"===r){if(!ot)return{elem:"control"}}else if("menu"===r){if(!ot)return[{elem:"control"}]}else if("radio-group"===r){if(!ot)return[{block:"control-group"}]}else if("modal"===r){if(!ot)return{block:"popup",js:{zIndexGroupLevel:e.ctx.zIndexGroupLevel||20},mods:{autoclosable:ut.autoclosable}}}else if("link"===r){if(!ot)return[{elem:"control"}]}else if("checkbox-group"===r){if(!ot)return[{block:"control-group"}]}else if("page"===r&&!ot&&0===(16&e.__$a1)){var n=L(e,t);if(n!==t)return n}return void 0}if("tag"===r){var n=rt(e,t);if(n!==t)return n}else{if("js"===r){var i=ft[at];return i&&(i=i(e,t),i!==t)?i:void 0}if("default"===r){var n=nt(e,t);if(n!==t)return n}else{if("bem"===r){var r=at;if("page"===r){var r=ot;if("js"===r)return!1;if("link"===r)return!1;if("css"===r)return!1;if("head"===r)return!1;if("favicon"===r)return!1;if("meta"===r)return!1}else if("ua"===r&&!ot)return!1;return void 0}if("cls"===r)return void 0;if(""===r){if(e.ctx&&e.ctx._vow&&0===(256&e.__$a1)){var n=V(e,t);if(n!==t)return n}if(e.isSimple(e.ctx)){var n=X(e,t);if(n!==t)return n}if(!e.ctx){var n=Y(e,t);if(n!==t)return n}if(e.isArray(e.ctx)){var n=Z(e,t);if(n!==t)return n}var n=K(e,t);if(n!==t)return n}}}}}function n(e){var t=e.ctx,r=ut;return[{block:"button",mods:{togglable:"radio-check"===r.mode?"check":"radio",checked:r.checked,disabled:r.disabled,theme:r.theme,size:r.size},title:t.title,content:[t.icon,"undefined"!=typeof t.text?{elem:"text",content:t.text}:""]},{block:"radio",elem:"control",checked:r.checked,disabled:r.disabled,name:t.name,val:t.val}]}function i(e){var t=e.ctx;return[{elem:"box",content:{elem:"control",checked:ut.checked,disabled:ut.disabled,name:t.name,val:t.val}},t.text]}function a(e,t){var n=e._checkedOptions.map(function(e){return{elem:"control",val:e.val}});return n.push(function(){var n,i=e.__$a0;return e.__$a0=32|e.__$a0,n=r(e,t),e.__$a0=i,n}()),n}function o(e){var t=e._checkedOptions;return[{elem:"text",content:1===t.length?t[0].text:t.reduce(function(e,t){return e+(e?", ":"")+(t.checkedText||t.text)},"")||e._select.text}]}function c(e){var t=e.ctx,r=[t.icon];return"text"in t&&r.push({elem:"text",content:t.text}),r}function u(e){var t=ut,r=e.ctx,n="undefined"!=typeof r.val;return(r.options||[]).map(function(e,i){return[!!i&&!t.type&&{tag:"br"},{block:"radio",mods:{type:t.type,mode:t.mode,theme:t.theme,size:t.size,checked:n&&r.val===e.val,disabled:e.disabled||t.disabled},name:r.name,val:e.val,text:e.text,title:e.title,icon:e.icon}]})}function l(e){var t=e.ctx.content;if(Array.isArray(t))return t;var r=e.isSimple(t)?{block:"button",text:t}:t;if("button"===r.block){var n=r.mods||(r.mods={}),i=ut;n.size||(n.size=i.size),n.theme||(n.theme=i.theme),n.disabled=i.disabled}return r}function f(e){var t=e.ctx.content;if(Array.isArray(t))return t;var r=e.isSimple(t)?{block:"link",mods:{pseudo:!0},content:t}:t;if("link"===r.block){var n=r.mods||(r.mods={}),i=ut;n.theme||(n.theme=i.theme),n.disabled=i.disabled}return r}function s(e){var t=e.ctx.popup;(e.isSimple(t)||"popup"!==t.block)&&(t={block:"popup",content:t});var r=t.mods||(t.mods={});return r.theme||(r.theme=ut.theme),r.hasOwnProperty("autoclosable")||(r.autoclosable=!0),r.target="anchor",[{elem:"switcher",content:e.ctx.switcher},t]}function _(e){var t=ut,r=e.ctx,n=r.val,i="undefined"!=typeof n;if(i&&!Array.isArray(n))throw Error("checkbox-group: val must be an array");return(r.options||[]).map(function(e,a){return[!!a&&!t.type&&{tag:"br"},{block:"checkbox",mods:{type:t.type,theme:t.theme,size:t.size,checked:i&&n.indexOf(e.val)>-1,disabled:e.disabled||t.disabled},name:r.name,val:e.val,text:e.text,title:e.title,icon:e.icon}]})}function d(e){var t=e.ctx,r=ut;return[{block:"button",mods:{togglable:"check",checked:r.checked,disabled:r.disabled,theme:r.theme,size:r.size},title:t.title,content:[t.icon,"undefined"!=typeof t.text?{elem:"text",content:t.text}:""]},{block:"checkbox",elem:"control",checked:r.checked,disabled:r.disabled,name:t.name,val:t.val}]}function v(e){var t=e.ctx,r=ut;return[{elem:"box",content:{elem:"control",checked:r.checked,disabled:r.disabled,name:t.name,val:t.val}},t.text]}function m(e){var t=e.ctx,r=t.button;e.isSimple(r)&&(r={block:"button",tag:"span",text:r});var n=ut,i=r.mods||(r.mods={});return["size","theme","disabled","focused"].forEach(function(e){i[e]||(i[e]=n[e])}),[r,{elem:"no-file",content:e.ctx.noFileText}]}function p(e){var t=e.ctx,r={id:t.id,name:t.name,tabindex:t.tabIndex,placeholder:t.placeholder};return t.autocomplete===!1&&(r.autocomplete="off"),ut.disabled&&(r.disabled="disabled"),r}function h(e){var t=e.ctx,r={type:"radio",autocomplete:"off",name:t.name,value:t.val};return t.checked&&(r.checked="checked"),t.disabled&&(r.disabled="disabled"),r}function b(e,t){var n=e.ctx,i={};return n.target&&(i.target=n.target),ut.disabled?i["aria-disabled"]=!0:i.href=n.url,e.extend(function(){var n,i=e.__$a0;return e.__$a0=134217728|e.__$a0,n=r(e,t),e.__$a0=i,n}(),i)}function x(e,t){var n=e.ctx,i={type:ut.type||"button",name:n.name,value:n.val};return ut.disabled&&(i.disabled="disabled"),e.extend(function(){var n,i=e.__$a1;return e.__$a1=1|e.__$a1,n=r(e,t),e.__$a1=i,n}(),i)}function $(e){var t=e.ctx;return{role:"button",tabindex:t.tabIndex,id:t.id,title:t.title}}function k(){var e={role:"menu"};return ut.disabled||(e.tabindex=0),e}function y(e){var t,r=e.ctx,n={};return ut.disabled||(r.url?(n.href=r.url,t=r.tabIndex):t=r.tabIndex||0),"undefined"==typeof t||(n.tabindex=t),r.title&&(n.title=r.title),r.target&&(n.target=r.target),n}function g(e){var t=e._input,r={id:t.id,name:t.name,value:t.val,maxlength:t.maxLength,tabindex:t.tabIndex,placeholder:t.placeholder};return t.autocomplete===!1&&(r.autocomplete="off"),ut.disabled&&(r.disabled="disabled"),r}function w(e,t){var n=e.ctx;return e.extend(function(){var n,i=e.__$a0;return e.__$a0=8388608|e.__$a0,n=r(e,t),e.__$a0=i,n}(),{src:n.url,width:n.width,height:n.height,alt:n.alt,title:n.title})}function O(e){var t={type:"checkbox",autocomplete:"off"},r=e.ctx;return t.name=r.name,t.value=r.val,r.checked&&(t.checked="checked"),r.disabled&&(t.disabled="disabled"),t}function M(e){var t={type:"file"},r=e._attach;return r&&(t.name=r.name,r.mods&&r.mods.disabled&&(t.disabled="disabled"),r.tabIndex&&(t.tabindex=r.tabIndex)),t}function E(e){var t={"aria-hidden":"true"},r=e.ctx.url;return r&&(t.style="background-image:url("+r+")"),t}function I(e){var t={};return e.ctx.url?t.src=e.ctx.url:e._nonceCsp&&(t.nonce=e._nonceCsp),t}function L(e,t){var n=function(){var n,i=e.__$a1;return e.__$a1=16|e.__$a1,n=r(e,t),e.__$a1=i,n}(),i=[{block:"ua",attrs:{nonce:e._nonceCsp},js:!0}];return n?i.concat(n):i}function j(e,t){var n=e._checkedOptions,i=e._firstOption;i&&!n.length&&(i.checked=!0,n=[i]);var a,o=e._checkedOption;e._checkedOption=n[0];var c,u=e.__$a0;e.__$a0=4|e.__$a0,c=r(e,t),e.__$a0=u,a=c,e._checkedOption=o}function z(e,t){var n,i=ut,a=it;it="";var o=e.ctx;e.ctx={block:"button",mix:{block:at,elem:ot},mods:{size:i.size,theme:i.theme,view:i.view,focused:i.focused,disabled:i.disabled,checked:"radio"!==i.mode&&!!e._checkedOptions.length},id:e._select.id,tabIndex:e._select.tabIndex,content:[function(){var n,i=it;return it="content",n=r(e,t),it=i,n}(),{block:"icon",mix:{block:"select",elem:"tick"}}]};var c,u=e.__$a0;e.__$a0=256|e.__$a0,c=r(e,t),e.__$a0=u,n=c,it=a,e.ctx=o}function A(e,t){var n,i=ut,a=function(e){var t={block:"menu-item",mods:{disabled:i.disabled||e.disabled},val:e.val,js:{checkedText:e.checkedText},content:e.text};return e.icon&&(t.js.text=e.text,t.content=[e.icon,t.content]),t},o=it;it="";var c=e.ctx;e.ctx={block:"menu",mix:{block:at,elem:ot},mods:{size:i.size,theme:i.theme,disabled:i.disabled,mode:i.mode},val:e._select.val,attrs:{tabindex:void 0},content:e._select.options.map(function(e){return e.group?{elem:"group",mods:{"has-title":!!e.title},title:e.title,content:e.group.map(a)}:a(e)})};var u,l=e.__$a0;e.__$a0=128|e.__$a0,u=r(e,t),e.__$a0=l,n=u,it=o,e.ctx=c}function N(e,t){if(!ut.mode)throw Error("Can't build select without mode modifier");var n,i=e.ctx,a="undefined"!=typeof i.val,o="check"===ut.mode,c=[],u=function(e){return a&&(o?i.val.indexOf(e)>-1:i.val===e)},l=function(e){for(var t,r=0;t=e[r++];)t.group?l(t.group):(n||(n=t),u(t.val)&&(t.checked=!0,c.push(t)))};l(i.options);var f,s=e._select;e._select=e.ctx;var _=e._checkedOptions;e._checkedOptions=c;var d=e._firstOption;e._firstOption=n;var v,m=e.__$a0;e.__$a0=1024|e.__$a0,v=r(e,t),e.__$a0=m,f=v,e._select=s,e._checkedOptions=_,e._firstOption=d}function C(e,t){(e._firstItem.mods=e._firstItem.mods||{}).checked=!0;var n,i=e.__$a0;e.__$a0=8192|e.__$a0,n=r(e,t),e.__$a0=i}function B(e,t){var n,i=e.ctx,a=ut,o=[];if(i.content){var c="undefined"!=typeof i.val,u=function(e){return c&&("check"===a.mode?i.val.indexOf(e)>-1:i.val===e)},l=function(e){for(var t,r=0;t=e[r++];)"menu-item"===t.block?(n||(n=t),u(t.val)&&((t.mods=t.mods||{}).checked=!0,o.push(t))):l(t.content)};if(!e.isArray(i.content))throw Error("menu: content must be an array of the menu items");l(i.content)}e._firstItem=n,e._checkedItems=o;var f,s=e._menuMods;e._menuMods={theme:a.theme,disabled:a.disabled};var _,d=e.__$a0;e.__$a0=262144|e.__$a0,_=r(e,t),e.__$a0=d,f=_,e._menuMods=s}function T(e,t){if("button"!==ut.type)throw Error("Modifier mode=radio-check can be only with modifier type=button");var n,i=e.__$a0;e.__$a0=2048|e.__$a0,n=r(e,t),e.__$a0=i}function S(e,t){delete e._menuItemDisabled,ut.disabled=!0,r(e,t)}function D(e,t){var n=e.ctx;"object"==typeof n.url&&(n.url=e.reapply(n.url));var i,a=e.__$a0;e.__$a0=33554432|e.__$a0,i=r(e,t),e.__$a0=a}function P(e,t){var n,i=e._menuItemDisabled;e._menuItemDisabled=!0,n=r(e,t),e._menuItemDisabled=i}function G(e,t){var n=ut;n.theme=n.theme||e._menuMods.theme,n.disabled=n.disabled||e._menuMods.disabled;var i,a=e.__$a0;e.__$a0=131072|e.__$a0,i=r(e,t),e.__$a0=a}function H(e,t){var n,i=e._input;e._input=e.ctx;var a,o=e.__$a0;e.__$a0=4194304|e.__$a0,a=r(e,t),e.__$a0=o,n=a,e._input=i}function R(e,t){var n,i=e._attach;e._attach=e.ctx;var a,o=e.__$a1;e.__$a1=2|e.__$a1,a=r(e,t),e.__$a1=o,n=a,e._attach=i}function q(e,t){var n,i=e.ctx,a=it;it="";var o=e.ctx;e.ctx=[i.src16&&{elem:"link",attrs:{rel:"shortcut icon",href:i.src16}},i.src114&&{elem:"link",attrs:{rel:"apple-touch-icon-precomposed",sizes:"114x114",href:i.src114}},i.src72&&{elem:"link",attrs:{rel:"apple-touch-icon-precomposed",sizes:"72x72",href:i.src72}},i.src57&&{elem:"link",attrs:{rel:"apple-touch-icon-precomposed",href:i.src57}}];var c,u=e.__$a1;e.__$a1=4|e.__$a1,c=r(e,t),e.__$a1=u,n=c,it=a,e.ctx=o}function F(e,t){var n=e.ctx;e._nonceCsp=n.nonce;var i,a=it;it="";var o=e.ctx;e.ctx=[n.doctype||"<!DOCTYPE html>",{tag:"html",cls:"ua_js_no",content:[{elem:"head",content:[{tag:"meta",attrs:{charset:"utf-8"}},n.uaCompatible===!1?"":{tag:"meta",attrs:{"http-equiv":"X-UA-Compatible",content:n.uaCompatible||"IE=edge"}},{tag:"title",content:n.title},{block:"ua",attrs:{nonce:n.nonce}},n.head,n.styles,n.favicon?{elem:"favicon",url:n.favicon}:""]},n]}];var c,u=e.__$a1;e.__$a1=128|e.__$a1,c=r(e,t),e.__$a1=u,i=c,it=a,e.ctx=o}function J(t){if(!t.ctx)return"";var r=t.ctx,n=r.keyset,i=r.key,a=r.params||{};return n||i?(("undefined"==typeof r.content||null!==r.content)&&(a.content=e.apply(r.content)),void t._buf.push(BEM.I18N(n,i,a))):""}function U(e,t){var n,i,a,o,c=e.BEM.INTERNAL,u=e.ctx,l=e._str;e._str="";var f,s=at,_=it;if(it="tag",f=r(e,t),it=_,i=f,"undefined"!=typeof i||(i=u.tag),"undefined"!=typeof i||(i="div"),i){var d,v;if(s&&u.js!==!1){var m,p=it;it="js",m=r(e,t),it=p,v=m,v=v?e.extend(u.js,v===!0?{}:v):u.js===!0?{}:u.js,v&&((d={})[c.buildClass(s,u.elem)]=v)}e._str+="<"+i;var h,b=it;it="bem",h=r(e,t),it=b,n=h,"undefined"!=typeof n||(n="undefined"!=typeof u.bem?u.bem:u.block||u.elem);var x,$=it;it="cls",x=r(e,t),it=$;var k=x;k||(k=u.cls);var y=u.block&&d&&!u.elem;if(n||k){if(e._str+=' class="',n){e._str+=c.buildClasses(s,u.elem,u.elemMods||u.mods);var g,w=it;it="mix",g=r(e,t),it=w;var O=g;if(u.mix&&(O=O?[].concat(O,u.mix):u.mix),O){var M={},E=function(e,t){return(e||"")+"__"+(t||"")};M[E(s,ot)]=!0,e.isArray(O)||(O=[O]);for(var I=0;I<O.length;I++){var L=O[I],j=L.block&&(s!==u.block||L.block!==s)||L.elem,z=L.block||L._block||at,A=L.elem||L._elem||ot;if(j&&(e._str+=" "),e._str+=c[j?"buildClasses":"buildModsClasses"](z,L.elem||L._elem||(L.block?void 0:ot),L.elemMods||L.mods),L.js&&((d||(d={}))[c.buildClass(z,L.elem)]=L.js===!0?{}:L.js,y||(y=z&&!L.elem)),j&&!M[E(z,A)]){M[E(z,A)]=!0;var N,C=it;it="mix";var B=at;at=z;var T=ot;ot=A,N=r(e,t),it=C,at=B,ot=T;var S=N;if(S)for(var D=0;D<S.length;D++){var P=S[D];(P.block||P.elem)&&M[E(P.block,P.elem)]||(P._block=z,P._elem=A,O.splice(I+1,0,P))}}}}}k&&(e._str+=n?" "+k:k),e._str+=y?' i-bem"':'"'}n&&d&&(e._str+=' data-bem="'+e.attrEscape(JSON.stringify(d))+'"');var G,H=it;it="attrs",G=r(e,t),it=H;var R=G;if(R=e.extend(R,u.attrs)){var q,F;for(q in R)F=R[q],"undefined"!=typeof F&&(e._str+=" "+q+'="'+e.attrEscape(e.isSimple(F)?F:e.reapply(F))+'"')}}if(e.isShortTag(i))e._str+="/>";else{i&&(e._str+=">");var J,U=it;it="content",J=r(e,t),it=U;var V=J;if(V||0===V){n=s||ot;var X,Y=it;it="";var Z=e._notNewList;e._notNewList=!1;var K=e.position;e.position=n?1:e.position;var Q=e._listLength;e._listLength=n?1:e._listLength;var W=e.ctx;e.ctx=V,X=r(e,t),it=Y,e._notNewList=Z,e.position=K,e._listLength=Q,e.ctx=W}i&&(e._str+="</"+i+">")}a=e._str,o=void 0,e._str=l,e._buf.push(a)}function V(e,t){var n,i=it;it="";var a=e.ctx;e.ctx=e.ctx._value;var o,c=e.__$a1;e.__$a1=256|e.__$a1,o=r(e,t),e.__$a1=c,n=o,it=i,e.ctx=a}function X(e){e._listLength--;var t=e.ctx;(t&&t!==!0||0===t)&&(e._str+=t+"")}function Y(e){e._listLength--}function Z(e,t){var n=e.ctx,i=n.length,a=0,o=e.position,c=e._notNewList;for(c?e._listLength+=i-1:(e.position=0,e._listLength=i),e._notNewList=!0;i>a;)(function(){var i,o=e.ctx;return e.ctx=n[a++],i=r(e,t),e.ctx=o,i})();c||(e.position=o)}function K(e,t){e.ctx||(e.ctx={});var n,i=e.ctx.block,a=e.ctx.elem,o=e._currBlock||at,c=it;it="default";var u=at;at=i||(a?o:void 0);var l=e._currBlock;e._currBlock=i||a?void 0:o;var f=ot;ot=a;var s=ut;ut=i?e.ctx.mods||(e.ctx.mods={}):ut;var _=ct;ct=e.ctx.elemMods||{},at||ot?e.position=(e.position||0)+1:e._listLength--,r(e,t),n=void 0,it=c,at=u,e._currBlock=l,ot=f,ut=s,ct=_}function Q(e){var t=e.ctx;return{name:t.name,optionsMaxHeight:t.optionsMaxHeight}}function W(e){var t=e.ctx;return{mainOffset:t.mainOffset,secondaryOffset:t.secondaryOffset,viewportOffset:t.viewportOffset,directions:t.directions,zIndexGroupLevel:t.zIndexGroupLevel}}function et(e,t){var p=at;if("progressbar"===p){var p=!ot;if(p)return ut&&"simple"===ut.theme&&0===(1&e.__$a0)?[{elem:"box",content:function(){var n,i=e.__$a0;return e.__$a0=1|e.__$a0,n=r(e,t),e.__$a0=i,n}()},{elem:"text",content:e.ctx.val}]:"undefined"!=typeof e.ctx.content?e.ctx.content:{elem:"bar",attrs:{style:"width:"+e.ctx.val+"%"}}}else if("textarea"===p){if(!ot)return e.ctx.val}else if("radio"===p){var p=!ot;if(p){if(ut&&"button"===ut.type){var h=n(e,t);if(h!==t)return h}var h=i(e,t);if(h!==t)return h}}else if("select"===p){if("button"===ot&&ut&&"radio"===ut.mode)return[{elem:"text",content:e._checkedOption.text}];var p=!ot;if(p){var p=ut;if(p){var p=ut.mode;if("radio"===p){if(0===(2&e.__$a0))return[{elem:"control",val:e._checkedOption.val},function(){var n,i=e.__$a0;return e.__$a0=2|e.__$a0,n=r(e,t),e.__$a0=i,n}()]}else if("radio-check"===p&&e._checkedOptions[0]&&0===(8&e.__$a0))return[{elem:"control",val:e._checkedOptions[0].val},function(){var n,i=e.__$a0;return e.__$a0=8|e.__$a0,n=r(e,t),e.__$a0=i,n}()]}}if("button"===ot&&ut&&"radio-check"===ut.mode)return[{elem:"text",content:(e._checkedOptions[0]||e._select).text}];if(!ot&&ut&&"check"===ut.mode&&e._checkedOptions[0]&&0===(32&e.__$a0)){var h=a(e,t);if(h!==t)return h}if("button"===ot&&ut&&"check"===ut.mode){var h=o(e,t);if(h!==t)return h}if(!ot)return[{elem:"button"},{block:"popup",mods:{target:"anchor",theme:ut.theme,autoclosable:!0},directions:["bottom-left","bottom-right","top-left","top-right"],content:{block:at,mods:ut,elem:"menu"}}]}else if("button"===p){var p=!ot;if(p){if(e._attach&&0===(268435456&e.__$a0))return[{block:"attach",elem:"control"},function(){var n,i=e.__$a0;return e.__$a0=268435456|e.__$a0,n=r(e,t),e.__$a0=i,n}()];if("undefined"!=typeof e.ctx.content)return e.ctx.content;var h=c(e,t);if(h!==t)return h}}else if("menu"===p){if("group"===ot&&"undefined"!=typeof e.ctx.title&&0===(16384&e.__$a0))return[{elem:"group-title",content:e.ctx.title},function(){var n,i=e.__$a0;return e.__$a0=16384|e.__$a0,n=r(e,t),e.__$a0=i,n}()]}else if("radio-group"===p){if(!ot){var h=u(e,t);if(h!==t)return h}}else if("modal"===p){if(!ot&&0===(4096&e.__$a0))return{elem:"table",content:{elem:"cell",content:{elem:"content",content:function(){var n,i=e.__$a0;return e.__$a0=4096|e.__$a0,n=r(e,t),e.__$a0=i,n}()}}}}else if("input"===p){if("box"===ot&&ut&&ut["has-clear"]===!0)return[e.ctx.content,{elem:"clear"}];if(!ot)return{elem:"box",content:{elem:"control"}}}else if("dropdown"===p){var p=ot;if("switcher"===p){var p=ut;if(p){var p=ut.switcher;if("button"===p){var h=l(e,t);if(h!==t)return h}else if("link"===p){var h=f(e,t);if(h!==t)return h}}}if(!ot){var h=s(e,t);if(h!==t)return h}}else if("checkbox-group"===p){if(!ot){var h=_(e,t);if(h!==t)return h}}else if("checkbox"===p){var p=!ot;if(p){if(ut&&"button"===ut.type){var h=d(e,t);if(h!==t)return h}var h=v(e,t);if(h!==t)return h}}else if("attach"===p){if(!ot){var h=m(e,t);if(h!==t)return h}}else if("page"===p){if("head"===ot&&0===(32&e.__$a1))return[function(){var n,i=e.__$a1;return e.__$a1=32|e.__$a1,n=r(e,t),e.__$a1=i,n}(),{elem:"meta",attrs:{name:"viewport",content:"width=device-width,"+(e.ctx.zoom?"initial-scale=1":"maximum-scale=1,initial-scale=1,user-scalable=0")}},{elem:"meta",attrs:{name:"format-detection",content:"telephone=no"}},{elem:"link",attrs:{name:"apple-mobile-web-app-capable",content:"yes"}}];if(!ot&&0===(64&e.__$a1))return[function(){var n,i=e.__$a1;return e.__$a1=64|e.__$a1,n=r(e,t),e.__$a1=i,n}(),e.ctx.scripts]}else if("ua"===p){var p=!ot;if(p)return 0===(8&e.__$a1)?[function(){var n,i=e.__$a1;return e.__$a1=8|e.__$a1,n=r(e,t),e.__$a1=i,n}(),"(function(d,n){","d.documentElement.className+=",'" ua_svg_"+(d[n]&&d[n]("http://www.w3.org/2000/svg","svg").createSVGRect?"yes":"no");','})(document,"createElementNS");']:["(function(e,c){",'e[c]=e[c].replace(/(ua_js_)no/g,"$1yes");','})(document.documentElement,"className");']}return e.ctx.content}function tt(e,t){var n=at;if("textarea"===n){if(!ot){var i=p(e,t);if(i!==t)return i}}else if("radio"===n){if("control"===ot){var i=h(e,t);if(i!==t)return i}}else if("select"===n){if("control"===ot)return{type:"hidden",name:e._select.name,value:e.ctx.val,disabled:ut.disabled?"disabled":void 0}}else if("button"===n){var n=!ot;if(n){if(ut&&"link"===ut.type&&0===(134217728&e.__$a0)){var i=b(e,t);if(i!==t)return i}if((!ut.type||"submit"===ut.type)&&0===(1&e.__$a1)){var i=x(e,t);if(i!==t)return i}var i=$(e,t);if(i!==t)return i}}else if("menu"===n){var n=ot;if("group-title"===n)return{role:"presentation"};if("group"===n){if("undefined"!=typeof e.ctx.title&&0===(32768&e.__$a0)){var i=e.extend(function(){var n,i=e.__$a0;return e.__$a0=32768|e.__$a0,n=r(e,t),e.__$a0=i,n}(),{"aria-label":e.ctx.title});if(i!==t)return i}return{role:"group"}}if(!ot){var i=k(e,t);if(i!==t)return i}}else if("link"===n){if(!ot){var i=y(e,t);if(i!==t)return i}}else if("menu-item"===n){if(!ot)return{role:"menuitem"}}else if("input"===n){var n=ot;if("control"===n){var n=ut;if(n){var n=ut.type;if("search"===n){if(0===(524288&e.__$a0)){var i=e.extend(function(){var n,i=e.__$a0;return e.__$a0=524288|e.__$a0,n=r(e,t),e.__$a0=i,n}(),{type:"search"});if(i!==t)return i}}else if("password"===n&&0===(1048576&e.__$a0)){var i=e.extend(function(){var n,i=e.__$a0;return e.__$a0=1048576|e.__$a0,n=r(e,t),e.__$a0=i,n}(),{type:"password"});if(i!==t)return i}}if(0===(2097152&e.__$a0)){var i=e.extend({autocomplete:"off",autocorrect:"off",autocapitalize:"off",spellcheck:"false"},function(){var n,i=e.__$a0;return e.__$a0=2097152|e.__$a0,n=r(e,t),e.__$a0=i,n}());if(i!==t)return i}var i=g(e,t);if(i!==t)return i}}else if("image"===n){var n=!ot;if(n){if("undefined"==typeof e.ctx.content&&0===(8388608&e.__$a0)){var i=w(e,t);if(i!==t)return i}return{role:"img"}}}else if("checkbox"===n){if("control"===ot){var i=O(e,t);if(i!==t)return i}}else if("attach"===n){if("control"===ot){var i=M(e,t);if(i!==t)return i}}else if("icon"===n){if(!ot){var i=E(e,t);if(i!==t)return i}}else if("page"===n){var n=ot;if("js"===n){var i=I(e,t);if(i!==t)return i}else if("css"===n){if(e.ctx.url)return{rel:"stylesheet",href:e.ctx.url}}else if("favicon"===n)return{rel:"shortcut icon",href:e.ctx.url}}return void 0}function rt(e,t){var r=at;if("textarea"===r){if(!ot)return"textarea"}else if("spin"===r){if(!ot)return"span"}else if("radio"===r){var r=ot;if("control"===r)return"input";if("box"===r)return"span";if(!ot)return"label"}else if("select"===r){if("control"===ot)return"input"}else if("button"===r){var r=!ot;if(r){if(ut&&"link"===ut.type)return"a";if(e._attach)return"span"}if("text"===ot)return"span";if(!ot)return e.ctx.tag||"button"}else if("radio-group"===r){if(!ot)return"span"}else if("link"===r){var r=!ot;if(r)return ut&&ut.pseudo===!0&&!e.ctx.url?"span":"a"}else if("input"===r){var r=ot;if("control"===r)return"input";if("box"===r)return"span";if("clear"===r)return"i";if(!ot)return"span"}else if("image"===r){var r=!ot;if(r)return"undefined"==typeof e.ctx.content?"img":"span"}else if("dropdown"===r){if("switcher"===ot)return!1}else if("checkbox-group"===r){if(!ot)return"span"}else if("checkbox"===r){var r=ot;if("control"===r)return"input";if("box"===r)return"span";if(!ot)return"label"}else if("attach"===r){var r=ot;if("control"===r)return"input";if("clear"===r)return"i";if("text"===r)return"span";if("file"===r)return"span";if("no-file"===r)return"span";if(!ot)return"span"}else if("icon"===r){if(!ot)return"i"}else if("page"===r){var r=ot;if("js"===r)return"script";if("link"===r)return"link";if("css"===r)return e.ctx.url?"link":"style";if("head"===r)return"head";if("favicon"===r)return"link";if("meta"===r)return"meta";if(!ot)return"body"}else if("ua"===r&&!ot)return"script";return void 0}function nt(e,t){var r=at;if("select"===r){if(!ot&&ut&&"radio"===ut.mode&&e._checkedOptions&&0===(4&e.__$a0)){var n=j(e,t);if(n!==t)return n}var r=ot;if("button"===r){if(0===(256&e.__$a0)){var n=z(e,t);if(n!==t)return n}}else if("menu"===r&&0===(128&e.__$a0)){var n=A(e,t);if(n!==t)return n}if(!ot&&!e._select&&0===(1024&e.__$a0)){var n=N(e,t);if(n!==t)return n}}else if("menu"===r){var r=!ot;if(r){if(ut&&"radio"===ut.mode&&e._firstItem&&e._checkedItems&&!e._checkedItems.length&&0===(8192&e.__$a0)){var n=C(e,t);if(n!==t)return n}if(0===(262144&e.__$a0)){var n=B(e,t);if(n!==t)return n}}}else if("radio-group"===r){if(!ot&&ut&&"radio-check"===ut.mode&&0===(2048&e.__$a0)){var n=T(e,t);if(n!==t)return n}}else if("link"===r){var r=!ot;if(r){if(e._menuItemDisabled){var n=S(e,t);if(n!==t)return n}if(0===(33554432&e.__$a0)){var n=D(e,t);if(n!==t)return n}}}else if("menu-item"===r){var r=!ot;if(r){if(ut&&ut&&"link"===ut.type&&ut.disabled===!0&&!e._menuItemDisabled){var n=P(e,t);if(n!==t)return n}if(e._menuMods&&0===(131072&e.__$a0)){var n=G(e,t);if(n!==t)return n}}}else if("input"===r){if(!ot&&0===(4194304&e.__$a0)){var n=H(e,t);if(n!==t)return n}}else if("attach"===r){if(!ot&&0===(2&e.__$a1)){var n=R(e,t);if(n!==t)return n}}else if("page"===r){if("icon"===ot&&0===(4&e.__$a1)){var n=q(e,t);if(n!==t)return n}if(!ot&&0===(128&e.__$a1)){var n=F(e,t);if(n!==t)return n}}else if("i-bem"===r&&"i18n"===ot){var n=J(e,t);if(n!==t)return n}var n=U(e,t);return n!==t?n:t}var it="",at="",ot="",ct=null,ut=null,lt={};e.apply=t,[function(e,t){function r(e,t){this.ctx="undefined"==typeof e?"":e,this.apply=t,this._str="";var r=this;this._buf={push:function(){var e=o.call(arguments).join("");r._str+=e},join:function(){return this._str}},this._=this,this._start=!0,this._mode="",this._listLength=0,this._notNewList=!1,this.position=0,this.block=n,this.elem=n,this.mods=n,this.elemMods=n}var n,i={},a=Object.prototype.toString,o=Array.prototype.slice,c=Array.isArray||function(e){return"[object Array]"===a.call(e)},u={area:1,base:1,br:1,col:1,command:1,embed:1,hr:1,img:1,input:1,keygen:1,link:1,meta:1,param:1,source:1,wbr:1};!function(e){function t(e,t){var r=a+e;return t!==!0&&(r+=a+t),r}function r(e,r,n){var i=e;return n&&(i+=t(r,n)),i}function i(e,n,i,a){var c=r(e)+o+n;return a&&(c+=t(i,a)),c}var a="_",o="__",c="[a-zA-Z0-9-]+";e.INTERNAL={NAME_PATTERN:c,MOD_DELIM:a,ELEM_DELIM:o,buildModPostfix:t,buildClass:function(e,t,a,o){var c=typeof a;if("string"===c||"boolean"===c){var u=typeof o;"string"!==u&&"boolean"!==u&&(o=a,a=t,t=n)}else"undefined"!==c?a=n:t&&"string"!=typeof t&&(t=n);return t||a?t?i(e,t,a,o):r(e,a,o):e},buildModsClasses:function(e,t,n){var a="";if(n){var o;for(o in n)if(n.hasOwnProperty(o)){var c=n[o];(c||0===c)&&("boolean"!=typeof c&&(c+=""),a+=" "+(t?i(e,t,o,c):r(e,o,c)))}}return a},buildClasses:function(e,t,n){var a="";return a+=t?i(e,t):r(e),a+=this.buildModsClasses(e,t,n)}}}(i);var l={'"':"&quot;","&":"&amp;","<":"&lt;",">":"&gt;"},f=function(e){return l[e]||e},s=function(e){return e=new RegExp(e,"g"),function(t){return(""+t).replace(e,f)}};t.BEMContext=r,r.prototype.isArray=c,r.prototype.isSimple=function(e){if(!e||e===!0)return!0;var t=typeof e;return"string"===t||"number"===t},r.prototype.isShortTag=function(e){return u.hasOwnProperty(e)},r.prototype.extend=function(e,t){if(!e||!t)return e||t;var r,n={};for(r in e)e.hasOwnProperty(r)&&(n[r]=e[r]);for(r in t)t.hasOwnProperty(r)&&(n[r]=t[r]);return n};var _=0,d=+new Date,v="__"+d,m=function(){return"uniq"+d+ ++_};r.prototype.identify=function(e,t){return e?t||e[v]?e[v]:e[v]=m():m()},r.prototype.xmlEscape=s("[&<>]"),r.prototype.attrEscape=s('["&<>]'),r.prototype.BEM=i,r.prototype.isFirst=function(){return 1===this.position},r.prototype.isLast=function(){return this.position===this._listLength},r.prototype.generateId=function(){return this.identify(this.ctx)};var p=e.apply;e.apply=r.apply=function(e){var t=new r(e||this,p);return t.apply(),t._str},r.prototype.reapply=r.apply},function(){!function(e,t){if(!t.I18N){e.BEM=t;var r=e.BEM.I18N=function(e,t){return t};r.keyset=function(){return r},r.key=function(e){return e},r.lang=function(){}}}(this,"undefined"==typeof BEM?{}:BEM)}].forEach(function(t){t(e,this)},{recordExtensions:function(e){e.__$a0=0,e._checkedOption=void 0,e._mode=void 0,e.ctx=void 0,e._select=void 0,e._checkedOptions=void 0,e._firstOption=void 0,e._menuItemDisabled=void 0,e._menuMods=void 0,e._input=void 0,e.__$a1=0,e._attach=void 0,e._str=void 0,e.block=void 0,e.elem=void 0,e._notNewList=void 0,e.position=void 0,e._listLength=void 0,e._currBlock=void 0,e.mods=void 0,e.elemMods=void 0},resetApplyNext:function(e){e.__$a0=0,e.__$a1=0}});var ft={progressbar:function(e,t){return ot?t:{val:e.ctx.val}},textarea:function(e,t){return ot?t:!0},radio:function(e,t){return ot?t:!0},select:function(e,t){var n=!ot;if(n){var n=ut;if(n){var n=ut.mode;if("radio-check"===n){if(0===(16&e.__$a0)){var i=e.extend(function(){var n,i=e.__$a0;return e.__$a0=16|e.__$a0,n=r(e,t),e.__$a0=i,n}(),{text:e.ctx.text});if(i!==t)return i}}else if("check"===n&&0===(64&e.__$a0)){var i=e.extend(function(){var n,i=e.__$a0;return e.__$a0=64|e.__$a0,n=r(e,t),e.__$a0=i,n}(),{text:e.ctx.text});if(i!==t)return i}if(ut.focused===!0&&0===(512&e.__$a0)){var i=e.extend(function(){var n,i=e.__$a0;return e.__$a0=512|e.__$a0,n=r(e,t),e.__$a0=i,n}(),{live:!1});if(i!==t)return i}}var i=Q(e,t);if(i!==t)return i}return t},button:function(e,t){var n=!ot;if(n){var n=ut;if(n){if(ut&&"link"===ut.type&&ut.disabled===!0&&0===(67108864&e.__$a0)){var i=e.extend(function(){var n,i=e.__$a0;return e.__$a0=67108864|e.__$a0,n=r(e,t),e.__$a0=i,n}(),{url:e.ctx.url});if(i!==t)return i}if(ut.focused===!0&&0===(536870912&e.__$a0)){var i=e.extend(function(){var n,i=e.__$a0;return e.__$a0=536870912|e.__$a0,n=r(e,t),e.__$a0=i,n}(),{live:!1});if(i!==t)return i}}return!0}return t},menu:function(e,t){var n=!ot;if(n){if(ut&&ut.focused===!0&&0===(65536&e.__$a0)){var i=e.extend(function(){var n,i=e.__$a0;return e.__$a0=65536|e.__$a0,n=r(e,t),e.__$a0=i,n}(),{live:!1});if(i!==t)return i}return!0}return t},"radio-group":function(e,t){return ot?t:!0},modal:function(e,t){return ot?t:!0},link:function(e,t){var n=!ot;if(n){if(ut&&ut.disabled===!0&&0===(16777216&e.__$a0)){var i=e.extend(function(){var n,i=e.__$a0;return e.__$a0=16777216|e.__$a0,n=r(e,t),e.__$a0=i,n}(),{url:e.ctx.url});if(i!==t)return i}return!0}return t},"menu-item":function(e,t){return ot?t:{val:e.ctx.val}},input:function(e,t){return ot?t:!0},dropdown:function(e,t){return ot?t:!0},popup:function(e,t){if(!ot){var r=W(e,t);if(r!==t)return r}return t},"checkbox-group":function(e,t){return ot?t:!0},checkbox:function(e,t){return ot?t:!0},attach:function(e,t){return ot?t:!0},ua:function(e,t){return ot?t:!0}};return e},r=!0;"object"==typeof exports&&(exports.BEMHTML=t({}),r=!1),"object"==typeof modules&&(modules.define("BEMHTML",function(e){e(t({}))}),r=!1),r&&(e.BEMHTML=t({}))}(this);