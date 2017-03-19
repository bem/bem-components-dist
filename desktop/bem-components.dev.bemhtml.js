var BEMHTML;

(function(global) {
    function buildBemXjst(__bem_xjst_libs__) {
        var exports = {};

        /// -------------------------------------
/// --------- BEM-XJST Runtime Start ----
/// -------------------------------------
var BEMHTML = function(module, exports) {
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bemhtml = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var inherits = require('inherits');
var Match = require('../bemxjst/match').Match;
var BemxjstEntity = require('../bemxjst/entity').Entity;

/**
 * @class Entity
 * @param {BEMXJST} bemxjst
 * @param {String} block
 * @param {String} elem
 * @param {Array} templates
 */
function Entity(bemxjst) {
  this.bemxjst = bemxjst;

  this.jsClass = null;

  // "Fast modes"
  this.tag = new Match(this, 'tag');
  this.attrs = new Match(this, 'attrs');
  this.js = new Match(this, 'js');
  this.mix = new Match(this, 'mix');
  this.bem = new Match(this, 'bem');
  this.cls = new Match(this, 'cls');

  BemxjstEntity.apply(this, arguments);
}

inherits(Entity, BemxjstEntity);
exports.Entity = Entity;

Entity.prototype.init = function(block, elem) {
  this.block = block;
  this.elem = elem;

  // Class for jsParams
  this.jsClass = this.bemxjst.classBuilder.build(this.block, this.elem);
};

Entity.prototype._initRest = function(key) {
  if (key === 'default') {
    this.rest[key] = this.def;
  } else if (key === 'tag' ||
    key === 'attrs' ||
    key === 'js' ||
    key === 'mix' ||
    key === 'bem' ||
    key === 'cls' ||
    key === 'content') {
    this.rest[key] = this[key];
  } else {
    if (!this.rest.hasOwnProperty(key))
      this.rest[key] = new Match(this, key);
  }
};

Entity.prototype.defaultBody = function(context) {
  return this.bemxjst.render(context,
                             this,
                             this.tag.exec(context),
                             context.ctx.js !== false ?
                               this.js.exec(context) :
                               undefined,
                             this.bem.exec(context),
                             this.cls.exec(context),
                             this.mix.exec(context),
                             this.attrs.exec(context),
                             this.content.exec(context));
};

},{"../bemxjst/entity":5,"../bemxjst/match":8,"inherits":11}],2:[function(require,module,exports){
var inherits = require('inherits');
var utils = require('../bemxjst/utils');
var Entity = require('./entity').Entity;
var BEMXJST = require('../bemxjst');

function BEMHTML(options) {
  BEMXJST.apply(this, arguments);

  this._shortTagCloser = typeof options.xhtml !== 'undefined' &&
                            options.xhtml ? '/>' : '>';

  this._elemJsInstances = options.elemJsInstances;
  this._omitOptionalEndTags = options.omitOptionalEndTags;
  this._unquotedAttrs = typeof options.unquotedAttrs === 'undefined' ?
    false :
    options.unquotedAttrs;
}

inherits(BEMHTML, BEMXJST);
module.exports = BEMHTML;

BEMHTML.prototype.Entity = Entity;

BEMHTML.prototype.runMany = function(arr) {
  var out = '';
  var context = this.context;
  var prevPos = context.position;
  var prevNotNewList = context._notNewList;

  if (prevNotNewList) {
    context._listLength += arr.length - 1;
  } else {
    context.position = 0;
    context._listLength = arr.length;
  }
  context._notNewList = true;

  if (this.canFlush) {
    for (var i = 0; i < arr.length; i++)
      out += context._flush(this._run(arr[i]));
  } else {
    for (var i = 0; i < arr.length; i++)
      out += this._run(arr[i]);
  }

  if (!prevNotNewList)
    context.position = prevPos;

  return out;
};

BEMHTML.prototype.render = function(context,
                                   entity,
                                   tag,
                                   js,
                                   bem,
                                   cls,
                                   mix,
                                   attrs,
                                   content) {
  var ctx = context.ctx;

  if (tag === undefined)
    tag = 'div';
  else if (!tag)
    return (content || content === 0) ? this._run(content) : '';

  var out = '<' + tag;

  var ctxJS = ctx.js;
  if (ctxJS !== false) {
    if (js === true)
      js = {};

    if (js && js !== ctx.js) {
      if (ctxJS !== true)
        js = utils.extend(ctxJS, js);
    }  else if (ctxJS === true) {
      js = {};
    }
  }

  var jsParams;
  if (js) {
    jsParams = {};
    jsParams[entity.jsClass] = js;
  }

  var isBEM = typeof bem !== 'undefined' ? bem : entity.block || entity.elem;
  isBEM = !!isBEM;

  var addJSInitClass = jsParams && (
    this._elemJsInstances ?
      (entity.block || entity.elem) :
      (entity.block && !entity.elem)
  );

  if (!isBEM && !cls)
    return this.renderClose(out, context, tag, attrs, isBEM, ctx, content);

  out += ' class=';
  var classValue = '';
  if (isBEM) {
    classValue += entity.jsClass;
    classValue += this.buildModsClasses(entity.block, entity.elem,
                                        entity.elem ?
                                          context.elemMods :
                                          context.mods);

    if (ctx.mix && mix && mix !== ctx.mix)
      mix = [].concat(mix, ctx.mix);

    if (mix) {
      var m = this.renderMix(entity, mix, jsParams, addJSInitClass);
      classValue += m.out;
      jsParams = m.jsParams;
      addJSInitClass = m.addJSInitClass;
    }

    if (cls)
      classValue += ' ' + (typeof cls === 'string' ?
                    utils.attrEscape(cls).trim() : cls);
  } else {
    classValue += typeof cls === 'string' ?
      utils.attrEscape(cls).trim() :
      cls;
  }

  if (addJSInitClass)
    classValue += ' i-bem';

  out += this._unquotedAttrs && utils.isUnquotedAttr(classValue) ?
    classValue :
    ('"' + classValue + '"');

  if (isBEM && jsParams)
    out += ' data-bem=\'' + utils.jsAttrEscape(JSON.stringify(jsParams)) + '\'';

  return this.renderClose(out, context, tag, attrs, isBEM, ctx, content);
};

var OPTIONAL_END_TAGS = {
  // html4 https://html.spec.whatwg.org/multipage/syntax.html#optional-tags
  html: 1, head: 1, body: 1, p: 1, ul: 1, ol: 1, li: 1, dt: 1, dd: 1,
  colgroup: 1, thead: 1, tbody: 1, tfoot: 1, tr: 1, th: 1, td: 1, option: 1,

  // html5 https://www.w3.org/TR/html5/syntax.html#optional-tags
  /* dl — Neither tag is omissible */ rb: 1, rt: 1, rtc: 1, rp: 1, optgroup: 1
};

BEMHTML.prototype.renderClose = function(prefix,
                                         context,
                                         tag,
                                         attrs,
                                         isBEM,
                                         ctx,
                                         content) {
  var out = prefix;

  out += this.renderAttrs(attrs, ctx);

  if (utils.isShortTag(tag)) {
    out += this._shortTagCloser;
    if (this.canFlush)
      out = context._flush(out);
  } else {
    out += '>';
    if (this.canFlush)
      out = context._flush(out);

    // TODO(indutny): skip apply next flags
    if (content || content === 0)
      out += this.renderContent(content, isBEM);

    if (!this._omitOptionalEndTags || !OPTIONAL_END_TAGS.hasOwnProperty(tag))
      out += '</' + tag + '>';
  }

  if (this.canFlush)
    out = context._flush(out);
  return out;
};

BEMHTML.prototype.renderAttrs = function(attrs, ctx) {
  var out = '';

  // NOTE: maybe we need to make an array for quicker serialization
  if (utils.isObj(attrs) || utils.isObj(ctx.attrs)) {
    attrs = utils.extend(attrs, ctx.attrs);

    /* jshint forin : false */
    for (var name in attrs) {
      var attr = attrs[name];
      if (attr === undefined || attr === false || attr === null)
        continue;

      if (attr === true) {
        out += ' ' + name;
      } else {
        var attrVal = utils.isSimple(attr) ? attr : this.context.reapply(attr);
        out += ' ' + name + '=';

        out += this._unquotedAttrs && utils.isUnquotedAttr(attrVal) ?
          attrVal :
          ('"' + utils.attrEscape(attrVal) + '"');
      }
    }
  }

  return out;
};

BEMHTML.prototype.renderMix = function(entity, mix, jsParams, addJSInitClass) {
  var visited = {};
  var context = this.context;
  var js = jsParams;
  var addInit = addJSInitClass;

  visited[entity.jsClass] = true;

  // Transform mix to the single-item array if it's not array
  if (!Array.isArray(mix))
    mix = [ mix ];

  var classBuilder = this.classBuilder;

  var out = '';
  for (var i = 0; i < mix.length; i++) {
    var item = mix[i];
    if (!item)
      continue;
    if (typeof item === 'string')
      item = { block: item, elem: undefined };

    var hasItem = false;

    if (item.elem) {
      hasItem = item.elem !== entity.elem && item.elem !== context.elem ||
        item.block && item.block !== entity.block;
    } else if (item.block) {
      hasItem = !(item.block === entity.block && item.mods) ||
        item.mods && entity.elem;
    }

    var block = item.block || item._block || context.block;
    var elem = item.elem || item._elem || context.elem;
    var key = classBuilder.build(block, elem);

    var classElem = item.elem ||
                    item._elem ||
                    (item.block ? undefined : context.elem);
    if (hasItem)
      out += ' ' + classBuilder.build(block, classElem);

    out += this.buildModsClasses(block, classElem,
      (item.elem || !item.block && (item._elem || context.elem)) ?
        item.elemMods : item.mods);

    if (item.js) {
      if (!js)
        js = {};

      js[classBuilder.build(block, item.elem)] =
          item.js === true ? {} : item.js;
      if (!addInit)
        addInit = block && !item.elem;
    }

    // Process nested mixes
    if (!hasItem || visited[key])
      continue;

    visited[key] = true;
    var nestedEntity = this.entities[key];
    if (!nestedEntity)
      continue;

    var oldBlock = context.block;
    var oldElem = context.elem;
    var nestedMix = nestedEntity.mix.exec(context);
    context.elem = oldElem;
    context.block = oldBlock;

    if (!nestedMix)
      continue;

    for (var j = 0; j < nestedMix.length; j++) {
      var nestedItem = nestedMix[j];
      if (!nestedItem) continue;

      if (!nestedItem.block &&
          !nestedItem.elem ||
          !visited[classBuilder.build(nestedItem.block, nestedItem.elem)]) {
        if (nestedItem.block) continue;

        nestedItem._block = block;
        nestedItem._elem = elem;
        mix = mix.slice(0, i + 1).concat(
          nestedItem,
          mix.slice(i + 1)
        );
      }
    }
  }

  return {
    out: out,
    jsParams: js,
    addJSInitClass: addInit
  };
};

BEMHTML.prototype.buildModsClasses = function(block, elem, mods) {
  if (!mods)
    return '';

  var res = '';

  var modName;

  /*jshint -W089 */
  for (modName in mods) {
    if (!mods.hasOwnProperty(modName) || modName === '')
      continue;

    var modVal = mods[modName];
    if (!modVal && modVal !== 0) continue;
    if (typeof modVal !== 'boolean')
      modVal += '';

    var builder = this.classBuilder;
    res += ' ' + (elem ?
                  builder.buildElemClass(block, elem, modName, modVal) :
                  builder.buildBlockClass(block, modName, modVal));
  }

  return res;
};

},{"../bemxjst":7,"../bemxjst/utils":10,"./entity":1,"inherits":11}],3:[function(require,module,exports){
function ClassBuilder(options) {
  this.modDelim = options.mod || '_';
  this.elemDelim = options.elem || '__';
}
exports.ClassBuilder = ClassBuilder;

ClassBuilder.prototype.build = function(block, elem) {
  if (!elem)
    return block;
  else
    return block + this.elemDelim + elem;
};

ClassBuilder.prototype.buildModPostfix = function(modName, modVal) {
  var res = this.modDelim + modName;
  if (modVal !== true) res += this.modDelim + modVal;
  return res;
};

ClassBuilder.prototype.buildBlockClass = function(name, modName, modVal) {
  var res = name;
  if (modVal) res += this.buildModPostfix(modName, modVal);
  return res;
};

ClassBuilder.prototype.buildElemClass = function(block, name, modName, modVal) {
  return this.buildBlockClass(block) +
    this.elemDelim +
    name +
    this.buildModPostfix(modName, modVal);
};

ClassBuilder.prototype.split = function(key) {
  return key.split(this.elemDelim, 2);
};

},{}],4:[function(require,module,exports){
var utils = require('./utils');

function Context(bemxjst) {
  this._bemxjst = bemxjst;

  this.ctx = null;
  this.block = '';

  // Save current block until the next BEM entity
  this._currBlock = '';

  this.elem = null;
  this.mods = {};
  this.elemMods = {};

  this.position = 0;
  this._listLength = 0;
  this._notNewList = false;

  this.escapeContent = bemxjst.options.escapeContent === true;
}
exports.Context = Context;

Context.prototype._flush = null;

Context.prototype.isSimple = utils.isSimple;

Context.prototype.isShortTag = utils.isShortTag;
Context.prototype.extend = utils.extend;
Context.prototype.identify = utils.identify;

Context.prototype.xmlEscape = utils.xmlEscape;
Context.prototype.attrEscape = utils.attrEscape;
Context.prototype.jsAttrEscape = utils.jsAttrEscape;

Context.prototype.isFirst = function() {
  return this.position === 1;
};

Context.prototype.isLast = function() {
  return this.position === this._listLength;
};

Context.prototype.generateId = function() {
  return utils.identify(this.ctx);
};

Context.prototype.reapply = function(ctx) {
  return this._bemxjst.run(ctx);
};

},{"./utils":10}],5:[function(require,module,exports){
var utils = require('./utils');
var Match = require('./match').Match;
var tree = require('./tree');
var Template = tree.Template;
var PropertyMatch = tree.PropertyMatch;
var CompilerOptions = tree.CompilerOptions;

function Entity(bemxjst, block, elem, templates) {
  this.bemxjst = bemxjst;

  this.block = null;
  this.elem = null;

  // Compiler options via `xjstOptions()`
  this.options = {};

  // `true` if entity has just a default renderer for `def()` mode
  this.canFlush = true;

  // "Fast modes"
  this.def = new Match(this);
  this.content = new Match(this, 'content');

  // "Slow modes"
  this.rest = {};

  // Initialize
  this.init(block, elem);
  this.initModes(templates);
}
exports.Entity = Entity;

Entity.prototype.init = function(block, elem) {
  this.block = block;
  this.elem = elem;
};

function contentMode() {
  return this.ctx.content;
}

Entity.prototype.initModes = function(templates) {
  /* jshint maxdepth : false */
  for (var i = 0; i < templates.length; i++) {
    var template = templates[i];

    for (var j = template.predicates.length - 1; j >= 0; j--) {
      var pred = template.predicates[j];
      if (!(pred instanceof PropertyMatch))
        continue;

      if (pred.key !== '_mode')
        continue;

      template.predicates.splice(j, 1);
      this._initRest(pred.value);

      // All templates should go there anyway
      this.rest[pred.value].push(template);
      break;
    }

    if (j === -1)
      this.def.push(template);

    // Merge compiler options
    for (var j = template.predicates.length - 1; j >= 0; j--) {
      var pred = template.predicates[j];
      if (!(pred instanceof CompilerOptions))
        continue;

      this.options = utils.extend(this.options, pred.options);
    }
  }
};

Entity.prototype.prepend = function(other) {
  // Prepend to the slow modes, fast modes are in this hashmap too anyway
  var keys = Object.keys(this.rest);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!other.rest[key])
      continue;

    this.rest[key].prepend(other.rest[key]);
  }

  // Add new slow modes
  keys = Object.keys(other.rest);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (this.rest[key])
      continue;

    this._initRest(key);
    this.rest[key].prepend(other.rest[key]);
  }
};

// NOTE: This could be potentially compiled into inlined invokations
Entity.prototype.run = function(context) {
  if (this.def.count !== 0)
    return this.def.exec(context);

  return this.defaultBody(context);
};

Entity.prototype.setDefaults = function() {
  // Default .content() template for applyNext()
  if (this.content.count !== 0)
    this.content.push(new Template([], contentMode));

  // .def() default
  if (this.def.count !== 0) {
    this.canFlush = this.options.flush || false;
    var self = this;
    this.def.push(new Template([], function defaultBodyProxy() {
      return self.defaultBody(this);
    }));
  }
};

},{"./match":8,"./tree":9,"./utils":10}],6:[function(require,module,exports){
function BEMXJSTError(msg, func) {
  this.name = 'BEMXJSTError';
  this.message = msg;

  if (Error.captureStackTrace)
    Error.captureStackTrace(this, func || this.constructor);
  else
    this.stack = (new Error()).stack;
}

BEMXJSTError.prototype = Object.create(Error.prototype);
BEMXJSTError.prototype.constructor = BEMXJSTError;

exports.BEMXJSTError = BEMXJSTError;

},{}],7:[function(require,module,exports){
var inherits = require('inherits');

var Tree = require('./tree').Tree;
var PropertyMatch = require('./tree').PropertyMatch;
var AddMatch = require('./tree').AddMatch;
var Context = require('./context').Context;
var ClassBuilder = require('./class-builder').ClassBuilder;
var utils = require('./utils');

function BEMXJST(options) {
  this.options = options || {};

  this.entities = null;
  this.defaultEnt = null;

  // Current tree
  this.tree = null;

  // Current match
  this.match = null;

  // Create new Context constructor for overriding prototype
  this.contextConstructor = function ContextChild(bemxjst) {
    Context.call(this, bemxjst);
  };
  inherits(this.contextConstructor, Context);
  this.context = null;

  this.classBuilder = new ClassBuilder(this.options.naming || {});

  // Execution depth, used to invalidate `applyNext` bitfields
  this.depth = 0;

  // Do not call `_flush` on overridden `def()` mode
  this.canFlush = false;

  // oninit templates
  this.oninit = null;

  // Initialize default entity (no block/elem match)
  this.defaultEnt = new this.Entity(this, '', '', []);
  this.defaultElemEnt = new this.Entity(this, '', '', []);
}
module.exports = BEMXJST;

BEMXJST.prototype.locals = Tree.methods
    .concat('local', 'applyCtx', 'applyNext', 'apply');

BEMXJST.prototype.compile = function(code) {
  var self = this;

  function applyCtx() {
    return self._run(self.context.ctx);
  }

  function applyCtxWrap(ctx, changes) {
    // Fast case
    if (!changes)
      return self.local({ ctx: ctx }, applyCtx);

    return self.local(changes, function() {
      return self.local({ ctx: ctx }, applyCtx);
    });
  }

  function apply(mode, changes) {
    return self.applyMode(mode, changes);
  }

  function localWrap(changes) {
    return function localBody(body) {
      return self.local(changes, body);
    };
  }

  var tree = new Tree({
    refs: {
      applyCtx: applyCtxWrap,
      local: localWrap,
      apply: apply
    }
  });

  // Yeah, let people pass functions to us!
  var templates = this.recompileInput(code);

  var out = tree.build(templates, [
    localWrap,
    applyCtxWrap,
    function applyNextWrap(changes) {
      if (changes)
        return self.local(changes, applyNextWrap);
      return self.applyNext();
    },
    apply
  ]);

  // Concatenate templates with existing ones
  // TODO(indutny): it should be possible to incrementally add templates
  if (this.tree) {
    out = {
      templates: out.templates.concat(this.tree.templates),
      oninit: this.tree.oninit.concat(out.oninit)
    };
  }
  this.tree = out;

  // Group block+elem entities into a hashmap
  var ent = this.groupEntities(out.templates);

  // Transform entities from arrays to Entity instances
  ent = this.transformEntities(ent);

  this.entities = ent;
  this.oninit = out.oninit;
};

BEMXJST.prototype.recompileInput = function(code) {
  var args = BEMXJST.prototype.locals;
  // Reuse function if it already has right arguments
  if (typeof code === 'function' && code.length === args.length)
    return code;

  var out = code.toString();

  // Strip the function
  out = out.replace(/^function[^{]+{|}$/g, '');

  // And recompile it with right arguments
  out = new Function(args.join(', '), out);

  return out;
};

BEMXJST.prototype.groupEntities = function(tree) {
  var res = {};
  for (var i = 0; i < tree.length; i++) {
    // Make sure to change only the copy, the original is cached in `this.tree`
    var template = tree[i].clone();
    var block = null;
    var elem;

    elem = undefined;
    for (var j = 0; j < template.predicates.length; j++) {
      var pred = template.predicates[j];
      if (!(pred instanceof PropertyMatch) &&
        !(pred instanceof AddMatch))
        continue;

      if (pred.key === 'block')
        block = pred.value;
      else if (pred.key === 'elem')
        elem = pred.value;
      else
        continue;

      // Remove predicate, we won't much against it
      template.predicates.splice(j, 1);
      j--;
    }

    if (block === null) {
      var msg = 'block(…) subpredicate is not found.\n' +
      '    See template with subpredicates:\n     * ';

      for (var j = 0; j < template.predicates.length; j++) {
        var pred = template.predicates[j];

        if (j !== 0)
          msg += '\n     * ';

        if (pred.key === '_mode') {
          msg += pred.value + '()';
        } else {
          if (Array.isArray(pred.key)) {
            msg += pred.key[0].replace('mods', 'mod')
              .replace('elemMods', 'elemMod') +
              '(\'' + pred.key[1] + '\', \'' + pred.value + '\')';
          } else if (!pred.value || !pred.key) {
            msg += 'match(…)';
          } else {
            msg += pred.key + '(\'' + pred.value + '\')';
          }
        }
      }

      msg += '\n    And template body: \n    (' +
        (typeof template.body === 'function' ?
          template.body :
          JSON.stringify(template.body)) + ')';

      if (typeof BEMXJSTError === 'undefined') {
        BEMXJSTError = require('./error').BEMXJSTError;
      }

      throw new BEMXJSTError(msg);
    }

    var key = this.classBuilder.build(block, elem);

    if (!res[key])
      res[key] = [];
    res[key].push(template);
  }
  return res;
};

BEMXJST.prototype.transformEntities = function(entities) {
  var wildcardElems = [];

  var keys = Object.keys(entities);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];

    // TODO(indutny): pass this values over
    var parts = this.classBuilder.split(key);
    var block = parts[0];
    var elem = parts[1];

    if (elem === '*')
      wildcardElems.push(block);

    entities[key] = new this.Entity(
      this, block, elem, entities[key]);
  }

  // Merge wildcard block templates
  if (entities.hasOwnProperty('*')) {
    var wildcard = entities['*'];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key === '*')
        continue;

      entities[key].prepend(wildcard);
    }
    this.defaultEnt.prepend(wildcard);
    this.defaultElemEnt.prepend(wildcard);
  }

  // Merge wildcard elem templates
  for (var i = 0; i < wildcardElems.length; i++) {
    var block = wildcardElems[i];
    var wildcardKey = this.classBuilder.build(block, '*');
    var wildcard = entities[wildcardKey];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key === wildcardKey)
        continue;

      var entity = entities[key];
      if (entity.block !== block)
        continue;

      if (entity.elem === undefined)
        continue;

      entities[key].prepend(wildcard);
    }
    this.defaultElemEnt.prepend(wildcard);
  }

  // Set default templates after merging with wildcard
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    entities[key].setDefaults();
    this.defaultEnt.setDefaults();
    this.defaultElemEnt.setDefaults();
  }

  return entities;
};

BEMXJST.prototype._run = function(context) {
  if (context === undefined || context === '' || context === null)
    return this.runEmpty();
  else if (Array.isArray(context))
    return this.runMany(context);
  else if (
    typeof context.html === 'string' &&
    !context.tag &&
    typeof context.block === 'undefined' &&
    typeof context.elem === 'undefined' &&
    typeof context.cls === 'undefined' &&
    typeof context.attrs === 'undefined'
  )
    return this.runUnescaped(context);
  else if (utils.isSimple(context))
    return this.runSimple(context);

  return this.runOne(context);
};

BEMXJST.prototype.run = function(json) {
  var match = this.match;
  var context = this.context;

  this.match = null;
  this.context = new this.contextConstructor(this);
  this.canFlush = this.context._flush !== null;
  this.depth = 0;
  var res = this._run(json);

  if (this.canFlush)
    res = this.context._flush(res);

  this.match = match;
  this.context = context;

  return res;
};


BEMXJST.prototype.runEmpty = function() {
  this.context._listLength--;
  return '';
};

BEMXJST.prototype.runUnescaped = function(context) {
  this.context._listLength--;
  return '' + context.html;
};

BEMXJST.prototype.runSimple = function(simple) {
  this.context._listLength--;

  if (!simple && simple !== 0 || simple === true)
    return '';

  return typeof simple === 'string' && this.context.escapeContent ?
    utils.xmlEscape(simple) :
    simple;
};

BEMXJST.prototype.runOne = function(json) {
  var context = this.context;

  var oldCtx = context.ctx;
  var oldBlock = context.block;
  var oldCurrBlock = context._currBlock;
  var oldElem = context.elem;
  var oldMods = context.mods;
  var oldElemMods = context.elemMods;

  if (json.block || json.elem)
    context._currBlock = '';
  else
    context._currBlock = context.block;

  context.ctx = json;
  if (json.block) {
    context.block = json.block;

    if (json.mods)
      context.mods = json.mods;
    else if (json.block !== oldBlock || !json.elem)
      context.mods = {};
  } else {
    if (!json.elem)
      context.block = '';
    else if (oldCurrBlock)
      context.block = oldCurrBlock;
  }

  context.elem = json.elem;
  if (json.elemMods)
    context.elemMods = json.elemMods;
  else
    context.elemMods = {};

  var block = context.block || '';
  var elem = context.elem;

  // Control list position
  if (block || elem)
    context.position++;
  else
    context._listLength--;

  // To invalidate `applyNext` flags
  this.depth++;

  var restoreFlush = false;
  var ent = this.entities[this.classBuilder.build(block, elem)];
  if (ent) {
    if (this.canFlush && !ent.canFlush) {
      // Entity does not support flushing, do not flush anything nested
      restoreFlush = true;
      this.canFlush = false;
    }
  } else {
    // No entity - use default one
    ent = this.defaultEnt;
    if (elem !== undefined)
      ent = this.defaultElemEnt;
    ent.init(block, elem);
  }

  var res = this.options.production === true ?
    this.tryRun(context, ent) :
    ent.run(context);

  context.ctx = oldCtx;
  context.block = oldBlock;
  context.elem = oldElem;
  context.mods = oldMods;
  context.elemMods = oldElemMods;
  context._currBlock = oldCurrBlock;
  this.depth--;
  if (restoreFlush)
    this.canFlush = true;

  return res;
};

BEMXJST.prototype.tryRun = function(context, ent) {
  try {
    return ent.run(context);
  } catch (e) {
    console.error('BEMXJST ERROR: cannot render ' +
      [
        'block ' + context.block,
        'elem ' + context.elem,
        'mods ' + JSON.stringify(context.mods),
        'elemMods ' + JSON.stringify(context.elemMods)
      ].join(', '), e);
    return '';
  }
};

BEMXJST.prototype.renderContent = function(content, isBEM) {
  var context = this.context;
  var oldPos = context.position;
  var oldListLength = context._listLength;
  var oldNotNewList = context._notNewList;

  context._notNewList = false;
  if (isBEM) {
    context.position = 0;
    context._listLength = 1;
  }

  var res = this._run(content);

  context.position = oldPos;
  context._listLength = oldListLength;
  context._notNewList = oldNotNewList;

  return res;
};

BEMXJST.prototype.local = function(changes, body) {
  var keys = Object.keys(changes);
  var restore = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var parts = key.split('.');

    var value = this.context;
    for (var j = 0; j < parts.length - 1; j++)
      value = value[parts[j]];

    restore.push({
      parts: parts,
      value: value[parts[j]]
    });
    value[parts[j]] = changes[key];
  }

  var res = body.call(this.context);

  for (var i = 0; i < restore.length; i++) {
    var parts = restore[i].parts;
    var value = this.context;
    for (var j = 0; j < parts.length - 1; j++)
      value = value[parts[j]];

    value[parts[j]] = restore[i].value;
  }

  return res;
};

BEMXJST.prototype.applyNext = function() {
  return this.match.exec(this.context);
};

BEMXJST.prototype.applyMode = function(mode, changes) {
  var match = this.match.entity.rest[mode];
  if (!match)
    return this.context.ctx[mode];

  if (!changes)
    return match.exec(this.context);

  var self = this;

  // Allocate function this way, to prevent allocation at the top of the
  // `applyMode`
  var fn = function() {
    return match.exec(self.context);
  };
  return this.local(changes, fn);
};

BEMXJST.prototype.exportApply = function(exports) {
  var self = this;
  exports.apply = function(context) {
    return self.run(context);
  };

  // Add templates at run time
  exports.compile = function(templates) {
    return self.compile(templates);
  };

  exports.BEMContext = self.contextConstructor;

  for (var i = 0; i < self.oninit.length; i++) {
    // NOTE: oninit has global context instead of BEMXJST
    var oninit = self.oninit[i];
    oninit(exports, { BEMContext: exports.BEMContext });
  }
};

},{"./class-builder":3,"./context":4,"./error":6,"./tree":9,"./utils":10,"inherits":11}],8:[function(require,module,exports){
var tree = require('./tree');
var PropertyMatch = tree.PropertyMatch;
var AddMatch = tree.AddMatch;
var WrapMatch = tree.WrapMatch;
var ExtendMatch = tree.ExtendMatch;
var CustomMatch = tree.CustomMatch;

function MatchNested(template, pred) {
  this.template = template;
  this.keys = pred.key;
  this.value = pred.value;
}

MatchNested.prototype.exec = function(context) {
  var val = context;

  for (var i = 0; i < this.keys.length - 1; i++) {
    val = val[this.keys[i]];
    if (!val)
      return false;
  }

  val = val[this.keys[i]];

  if (this.value === true)
    return val !== undefined && val !== '' && val !== false && val !== null;

  return String(val) === this.value;
};

function MatchCustom(template, pred) {
  this.template = template;
  this.body = pred.body;
}

MatchCustom.prototype.exec = function(context) {
  return this.body.call(context, context, context.ctx);
};

function MatchWrap(template) {
  this.template = template;
  this.wrap = null;
}

MatchWrap.prototype.exec = function(context) {
  var res = this.wrap !== context.ctx;
  this.wrap = context.ctx;
  return res;
};

function MatchExtend(template) {
  this.template = template;
  this.wrap = null;
}

MatchExtend.prototype.exec = function(context) {
  var res = this.ext !== context.ctx;
  this.ext = context.ctx;
  return res;
};

function AddWrap(template, pred) {
  this.template = template;
  this.key = pred.key;
  this.value = pred.value;
}

AddWrap.prototype.exec = function(context) {
  return context[this.key] === this.value;
};

function MatchTemplate(mode, template) {
  this.mode = mode;
  this.predicates = new Array(template.predicates.length);
  this.body = template.body;

  var postpone = [];

  for (var i = 0, j = 0; i < this.predicates.length; i++, j++) {
    var pred = template.predicates[i];
    if (pred instanceof PropertyMatch) {
      this.predicates[j] = new MatchNested(this, pred);
    } else if (pred instanceof ExtendMatch) {
      j--;
      postpone.push(new MatchExtend(this));
    } else if (pred instanceof AddMatch) {
      this.predicates[i] = new AddWrap(this, pred);
    } else if (pred instanceof CustomMatch) {
      this.predicates[j] = new MatchCustom(this, pred);

      // Push MatchWrap later, they should not be executed first.
      // Otherwise they will set flag too early, and body might not be executed
    } else if (pred instanceof WrapMatch) {
      j--;
      postpone.push(new MatchWrap(this));
    } else {
      // Skip
      j--;
    }
  }

  // Insert late predicates
  for (var i = 0; i < postpone.length; i++, j++)
    this.predicates[j] = postpone[i];

  if (this.predicates.length !== j)
    this.predicates.length = j;
}
exports.MatchTemplate = MatchTemplate;

function Match(entity, modeName) {
  this.entity = entity;
  this.modeName = modeName;
  this.bemxjst = this.entity.bemxjst;
  this.templates = [];

  // applyNext mask
  this.mask = [ 0 ];

  // We are going to create copies of mask for nested `applyNext()`
  this.maskSize = 0;
  this.maskOffset = 0;

  this.count = 0;
  this.depth = -1;

  this.thrownError = null;
}
exports.Match = Match;

Match.prototype.prepend = function(other) {
  this.templates = other.templates.concat(this.templates);
  this.count += other.count;

  while (Math.ceil(this.count / 31) > this.mask.length)
    this.mask.push(0);

  this.maskSize = this.mask.length;
};

Match.prototype.push = function(template) {
  this.templates.push(new MatchTemplate(this, template));
  this.count++;

  if (Math.ceil(this.count / 31) > this.mask.length)
    this.mask.push(0);

  this.maskSize = this.mask.length;
};

Match.prototype.tryCatch = function(fn, ctx) {
  try {
    return fn.call(ctx, ctx, ctx.ctx);
  } catch (e) {
    this.thrownError = e;
  }
};

Match.prototype.exec = function(context) {
  var save = this.checkDepth();

  var template;
  var bitIndex = this.maskOffset;
  var mask = this.mask[bitIndex];
  var bit = 1;
  for (var i = 0; i < this.count; i++) {
    if ((mask & bit) === 0) {
      template = this.templates[i];
      for (var j = 0; j < template.predicates.length; j++) {
        var pred = template.predicates[j];

        /* jshint maxdepth : false */
        if (!pred.exec(context))
          break;
      }

      // All predicates matched!
      if (j === template.predicates.length)
        break;
    }

    if (bit === 0x40000000) {
      bitIndex++;
      mask = this.mask[bitIndex];
      bit = 1;
    } else {
      bit <<= 1;
    }
  }

  if (i === this.count)
    return context.ctx[this.modeName];

  var oldMask = mask;
  var oldMatch = this.bemxjst.match;
  this.mask[bitIndex] |= bit;
  this.bemxjst.match = this;

  this.thrownError = null;

  var out;
  if (typeof template.body === 'function')
    out = this.tryCatch(template.body, context);
  else
    out = template.body;

  this.mask[bitIndex] = oldMask;
  this.bemxjst.match = oldMatch;
  this.restoreDepth(save);

  var e = this.thrownError;
  if (e !== null) {
    this.thrownError = null;
    throw e;
  }

  return out;
};

Match.prototype.checkDepth = function() {
  if (this.depth === -1) {
    this.depth = this.bemxjst.depth;
    return -1;
  }

  if (this.bemxjst.depth === this.depth)
    return this.depth;

  var depth = this.depth;
  this.depth = this.bemxjst.depth;

  this.maskOffset += this.maskSize;

  while (this.mask.length < this.maskOffset + this.maskSize)
    this.mask.push(0);

  return depth;
};

Match.prototype.restoreDepth = function(depth) {
  if (depth !== -1 && depth !== this.depth)
    this.maskOffset -= this.maskSize;
  this.depth = depth;
};

},{"./tree":9}],9:[function(require,module,exports){
var assert = require('minimalistic-assert');
var inherits = require('inherits');

function Template(predicates, body) {
  this.predicates = predicates;

  this.body = body;
}
exports.Template = Template;

Template.prototype.wrap = function() {
  var body = this.body;
  for (var i = 0; i < this.predicates.length; i++) {
    var pred = this.predicates[i];
    body = pred.wrapBody(body);
  }
  this.body = body;
};

Template.prototype.clone = function() {
  return new Template(this.predicates.slice(), this.body);
};

function MatchBase() {
}
exports.MatchBase = MatchBase;

MatchBase.prototype.wrapBody = function(body) {
  return body;
};

function Item(tree, children) {
  this.conditions = [];
  this.children = [];

  for (var i = children.length - 1; i >= 0; i--) {
    var arg = children[i];
    if (arg instanceof MatchBase)
      this.conditions.push(arg);
    else if (arg === tree.boundBody)
      this.children[i] = tree.queue.pop();
    else
      this.children[i] = arg;
  }
}

function WrapMatch(refs) {
  MatchBase.call(this);

  this.refs = refs;
}
inherits(WrapMatch, MatchBase);
exports.WrapMatch = WrapMatch;

WrapMatch.prototype.wrapBody = function(body) {
  var applyCtx = this.refs.applyCtx;

  if (typeof body !== 'function') {
    return function() {
      return applyCtx(body);
    };
  }

  return function() {
    return applyCtx(body.call(this, this, this.ctx));
  };
};

function ReplaceMatch(refs) {
  MatchBase.call(this);

  this.refs = refs;
}
inherits(ReplaceMatch, MatchBase);
exports.ReplaceMatch = ReplaceMatch;

ReplaceMatch.prototype.wrapBody = function(body) {
  var applyCtx = this.refs.applyCtx;

  if (typeof body !== 'function') {
    return function() {
      return applyCtx(body);
    };
  }

  return function() {
    return applyCtx(body.call(this, this, this.ctx));
  };
};

function ExtendMatch(refs) {
  MatchBase.call(this);

  this.refs = refs;
}
inherits(ExtendMatch, MatchBase);
exports.ExtendMatch = ExtendMatch;

ExtendMatch.prototype.wrapBody = function(body) {
  var applyCtx = this.refs.applyCtx;
  var local = this.refs.local;

  if (typeof body !== 'function') {
    return function() {
      var changes = {};

      var keys = Object.keys(body);
      for (var i = 0; i < keys.length; i++)
        changes[keys[i]] = body[keys[i]];

      return local(changes)(function() {
        return applyCtx(this.ctx);
      });
    };
  }

  return function() {
    var changes = {};

    var obj = body.call(this, this, this.ctx);
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++)
      changes[keys[i]] = obj[keys[i]];

    return local(changes)(function() {
      return applyCtx(this.ctx);
    });
  };
};

function AddMatch(mode, refs) {
  MatchBase.call(this);

  this.mode = mode;
  this.refs = refs;
}
inherits(AddMatch, MatchBase);
exports.AddMatch = AddMatch;

AddMatch.prototype.wrapBody = function(body) {
  return this[this.mode + 'WrapBody'](body);
};

AddMatch.prototype.appendContentWrapBody = function(body) {
  var refs = this.refs;
  var applyCtx = refs.applyCtx;
  var apply = refs.apply;

  if (typeof body !== 'function') {
    return function() {
      return [ apply('content') , body ];
    };
  }

  return function() {
    return [ apply('content'), applyCtx(body.call(this, this, this.ctx)) ];
  };
};

AddMatch.prototype.prependContentWrapBody = function(body) {
  var refs = this.refs;
  var applyCtx = refs.applyCtx;
  var apply = refs.apply;

  if (typeof body !== 'function') {
    return function() {
      return [ body, apply('content') ];
    };
  }

  return function() {
    return [ applyCtx(body.call(this, this, this.ctx)), apply('content') ];
  };
};

function CompilerOptions(options) {
  MatchBase.call(this);
  this.options = options;
}
inherits(CompilerOptions, MatchBase);
exports.CompilerOptions = CompilerOptions;

function PropertyMatch(key, value) {
  MatchBase.call(this);

  this.key = key;
  this.value = value;
}
inherits(PropertyMatch, MatchBase);
exports.PropertyMatch = PropertyMatch;

function CustomMatch(body) {
  MatchBase.call(this);

  this.body = body;
}
inherits(CustomMatch, MatchBase);
exports.CustomMatch = CustomMatch;

function Tree(options) {
  this.options = options;
  this.refs = this.options.refs;

  this.boundBody = this.body.bind(this);

  var methods = this.methods('body');
  for (var i = 0; i < methods.length; i++) {
    var method = methods[i];
    // NOTE: method.name is empty because of .bind()
    this.boundBody[Tree.methods[i]] = method;
  }

  this.queue = [];
  this.templates = [];
  this.initializers = [];
}
exports.Tree = Tree;

Tree.methods = [
  'match', 'wrap', 'block', 'elem', 'mode', 'mod',
  'elemMod', 'def', 'tag', 'attrs', 'cls', 'js',
  'bem', 'mix', 'content', 'replace', 'extend', 'oninit',
  'xjstOptions', 'appendContent', 'prependContent'
];

Tree.prototype.build = function(templates, apply) {
  var methods = this.methods('global').concat(apply);
  methods[0] = this.match.bind(this);

  templates.apply({}, methods);

  return {
    templates: this.templates.slice().reverse(),
    oninit: this.initializers
  };
};

function methodFactory(self, kind, name) {
  var method = self[name];
  var boundBody = self.boundBody;

  if (kind !== 'body') {
    if (name === 'replace' || name === 'extend' || name === 'wrap') {
      return function() {
        return method.apply(self, arguments);
      };
    }

    return function() {
      method.apply(self, arguments);
      return boundBody;
    };
  }

  return function() {
    var res = method.apply(self, arguments);

    // Insert body into last item
    var child = self.queue.pop();
    var last = self.queue[self.queue.length - 1];
    last.conditions = last.conditions.concat(child.conditions);
    last.children = last.children.concat(child.children);

    if (name === 'replace' || name === 'extend' || name === 'wrap')
      return res;
    return boundBody;
  };
}

Tree.prototype.methods = function(kind) {
  var out = new Array(Tree.methods.length);

  for (var i = 0; i < out.length; i++) {
    var name = Tree.methods[i];
    out[i] = methodFactory(this, kind, name);
  }

  return out;
};

// Called after all matches
Tree.prototype.flush = function(conditions, item) {
  var subcond;

  if (item.conditions)
    subcond = conditions.concat(item.conditions);
  else
    subcond = item.conditions;

  for (var i = 0; i < item.children.length; i++) {
    var arg = item.children[i];

    // Go deeper
    if (arg instanceof Item) {
      this.flush(subcond, item.children[i]);

    // Body
    } else {
      var template = new Template(conditions, arg);
      template.wrap();
      this.templates.push(template);
    }
  }
};

Tree.prototype.body = function() {
  var children = new Array(arguments.length);
  for (var i = 0; i < arguments.length; i++)
    children[i] = arguments[i];

  var child = new Item(this, children);
  this.queue[this.queue.length - 1].children.push(child);

  if (this.queue.length === 1)
    this.flush([], this.queue.shift());

  return this.boundBody;
};

Tree.prototype.match = function() {
  var children = new Array(arguments.length);
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (typeof arg === 'function')
      arg = new CustomMatch(arg);
    assert(arg instanceof MatchBase, 'Wrong .match() argument');
    children[i] = arg;
  }

  this.queue.push(new Item(this, children));

  return this.boundBody;
};

Tree.prototype.applyMode = function(args, mode) {
  if (args.length) {
    throw new Error('Predicate should not have arguments but ' +
      JSON.stringify(args) + ' passed');
  }

  return this.mode(mode);
};

Tree.prototype.xjstOptions = function(options) {
  this.queue.push(new Item(this, [
    new CompilerOptions(options)
  ]));
  return this.boundBody;
};

Tree.prototype.block = function(name) {
  return this.match(new PropertyMatch('block', name));
};

Tree.prototype.elem = function(name) {
  return this.match(new PropertyMatch('elem', name));
};

Tree.prototype.mode = function(name) {
  return this.match(new PropertyMatch('_mode', name));
};

Tree.prototype.mod = function(name, value) {
  return this.match(new PropertyMatch([ 'mods', name ],
                                  value === undefined ? true : String(value)));
};

Tree.prototype.elemMod = function(name, value) {
  return this.match(new PropertyMatch([ 'elemMods', name ],
                                  value === undefined ?  true : String(value)));
};

Tree.prototype.def = function() {
  return this.applyMode(arguments, 'default');
};

[ 'tag', 'attrs', 'cls', 'js', 'bem', 'mix', 'content' ]
  .forEach(function(method) {
    Tree.prototype[method] = function() {
      return this.applyMode(arguments, method);
    };
  });

[ 'appendContent', 'prependContent' ].forEach(function(method) {
  Tree.prototype[method] = function() {
    return this.content.apply(this, arguments)
      .match(new AddMatch(method, this.refs));
  };
});

Tree.prototype.wrap = function() {
  return this.def.apply(this, arguments).match(new WrapMatch(this.refs));
};

Tree.prototype.replace = function() {
  return this.def.apply(this, arguments).match(new ReplaceMatch(this.refs));
};

Tree.prototype.extend = function() {
  return this.def.apply(this, arguments).match(new ExtendMatch(this.refs));
};

Tree.prototype.oninit = function(fn) {
  this.initializers.push(fn);
};

},{"inherits":11,"minimalistic-assert":12}],10:[function(require,module,exports){
var amp = '&amp;';
var lt = '&lt;';
var gt = '&gt;';
var quot = '&quot;';
var singleQuot = '&#39;';

var matchXmlRegExp = /[&<>]/;

exports.xmlEscape = function(string) {
  var str = '' + string;
  var match = matchXmlRegExp.exec(str);

  if (!match)
    return str;

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 38: // &
        escape = amp;
        break;
      case 60: // <
        escape = lt;
        break;
      case 62: // >
        escape = gt;
        break;
      default:
        continue;
    }

    if (lastIndex !== index)
      html += str.substring(lastIndex, index);

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index ?
    html + str.substring(lastIndex, index) :
    html;
};

var matchAttrRegExp = /["&]/;

exports.attrEscape = function(string) {
  var str = '' + string;
  var match = matchAttrRegExp.exec(str);

  if (!match)
    return str;

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = quot;
        break;
      case 38: // &
        escape = amp;
        break;
      default:
        continue;
    }

    if (lastIndex !== index)
      html += str.substring(lastIndex, index);

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index ?
    html + str.substring(lastIndex, index) :
    html;
};

var matchJsAttrRegExp = /['&]/;

exports.jsAttrEscape = function(string) {
  var str = '' + string;
  var match = matchJsAttrRegExp.exec(str);

  if (!match)
    return str;

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 38: // &
        escape = amp;
        break;
      case 39: // '
        escape = singleQuot;
        break;
      default:
        continue;
    }

    if (lastIndex !== index)
      html += str.substring(lastIndex, index);

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index ?
    html + str.substring(lastIndex, index) :
    html;
};

exports.extend = function(o1, o2) {
  if (!o1 || !o2)
    return o1 || o2;

  var res = {};
  var n;

  for (n in o1)
    if (o1.hasOwnProperty(n))
      res[n] = o1[n];
  for (n in o2)
    if (o2.hasOwnProperty(n))
      res[n] = o2[n];
  return res;
};

var SHORT_TAGS = { // hash for quick check if tag short
  area: 1, base: 1, br: 1, col: 1, command: 1, embed: 1, hr: 1, img: 1,
  input: 1, keygen: 1, link: 1, meta: 1, param: 1, source: 1, wbr: 1
};

exports.isShortTag = function(t) {
  return SHORT_TAGS.hasOwnProperty(t);
};

exports.isSimple = function isSimple(obj) {
  if (!obj || obj === true) return true;
  if (!obj.block &&
      !obj.elem &&
      !obj.tag &&
      !obj.cls &&
      !obj.attrs &&
      obj.hasOwnProperty('html') &&
      isSimple(obj.html))
    return true;
  return typeof obj === 'string' || typeof obj === 'number';
};

exports.isObj = function(val) {
  return val && typeof val === 'object' && !Array.isArray(val) &&
    val !== null;
};

var uniqCount = 0;
var uniqId = +new Date();
var uniqExpando = '__' + uniqId;
var uniqPrefix = 'uniq' + uniqId;

function getUniq() {
  return uniqPrefix + (++uniqCount);
}
exports.getUniq = getUniq;

exports.identify = function(obj, onlyGet) {
  if (!obj)
    return getUniq();
  if (onlyGet || obj[uniqExpando])
    return obj[uniqExpando];

  var u = getUniq();
  obj[uniqExpando] = u;
  return u;
};

exports.fnToString = function(code) {
  // It is fine to compile without templates at first
  if (!code)
    return '';

  if (typeof code === 'function') {
    // Examples:
    //   function () { … }
    //   function name() { … }
    //   function (a, b) { … }
    //   function name(a, b) { … }
    var regularFunction = /^function\s*[^{]+{|}$/g;

    // Examples:
    //   () => { … }
    //   (a, b) => { … }
    //   _ => { … }
    var arrowFunction = /^(_|\(\w|[^=>]+\))\s=>\s{|}$/g;

    code = code.toString();
    code = code.replace(
      code.indexOf('function') === 0 ? regularFunction : arrowFunction,
    '');
  }

  return code;
};

/**
 * regexp for check may attribute be unquoted
 *
 * https://www.w3.org/TR/html4/intro/sgmltut.html#h-3.2.2
 * https://www.w3.org/TR/html5/syntax.html#attributes
 */
var UNQUOTED_ATTR_REGEXP = /^[:\w.-]+$/;

exports.isUnquotedAttr = function(str) {
  return str && UNQUOTED_ATTR_REGEXP.exec(str);
};

},{}],11:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],12:[function(require,module,exports){
module.exports = assert;

function assert(val, msg) {
  if (!val)
    throw new Error(msg || 'Assertion failed');
}

assert.equal = function assertEqual(l, r, msg) {
  if (l != r)
    throw new Error(msg || ('Assertion failed: ' + l + ' != ' + r));
};

},{}]},{},[2])(2)
});;
  return module.exports ||
      exports.BEMHTML;
}({}, {});
/// -------------------------------------
/// --------- BEM-XJST Runtime End ------
/// -------------------------------------

var api = new BEMHTML({"elemJsInstances":true});
/// -------------------------------------
/// ------ BEM-XJST User-code Start -----
/// -------------------------------------
api.compile(function(match, wrap, block, elem, mode, mod, elemMod, def, tag, attrs, cls, js, bem, mix, content, replace, extend, oninit, xjstOptions, appendContent, prependContent, local, applyCtx, applyNext, apply) {
/* begin: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/ua/ua.bemhtml.js */
block('ua')(
    tag()('script'),
    bem()(false),
    content()([
        '(function(e,c){',
            'e[c]=e[c].replace(/(ua_js_)no/g,"$1yes");',
        '})(document.documentElement,"className");'
    ])
);

/* end: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/ua/ua.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/page/page.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/page/page.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/page/__css/page__css.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/page/__css/page__css.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/page/__js/page__js.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/page/__js/page__js.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/ua/__svg/ua__svg.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/common.blocks/ua/__svg/ua__svg.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/desktop.blocks/page/__conditional-comment/page__conditional-comment.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/libs/bem-core/desktop.blocks/page/__conditional-comment/page__conditional-comment.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/attach.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/attach.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/button.bemhtml.js */
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
    mix()({ elem : 'control' }),

    attrs()(
        // Common attributes
        function() {
            var ctx = this.ctx,
                attrs = {
                    role : 'button',
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

            return this.extend(applyNext(), attrs);
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/button.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/__text/button__text.bemhtml.js */
block('button').elem('text').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/__text/button__text.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_focused/button_focused.bemhtml.js */
block('button').mod('focused', true).js()(function() {
    return this.extend(applyNext(), { lazyInit : false });
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_focused/button_focused.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/icon/icon.bemhtml.js */
block('icon')(
    tag()('span'),
    attrs()(function() {
        var attrs = {},
            url = this.ctx.url;
        if(url) attrs.style = 'background-image:url(' + url + ')';
        return attrs;
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/icon/icon.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__button/attach__button.bemhtml.js */
block('button').match(function() { return this._attach; })(
    tag()('span'),
    content()(function() {
        return [
            { block : 'attach', elem : 'control' },
            applyNext()
        ];
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__button/attach__button.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__control/attach__control.bemhtml.js */
block('attach').elem('control')(

    tag()('input'),

    attrs()(function() {
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__control/attach__control.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__no-file/attach__no-file.bemhtml.js */
block('attach').elem('no-file').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__no-file/attach__no-file.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__file/attach__file.bemhtml.js */
block('attach').elem('file').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__file/attach__file.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__text/attach__text.bemhtml.js */
block('attach').elem('text').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__text/attach__text.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__clear/attach__clear.bemhtml.js */
block('attach').elem('clear').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/attach/__clear/attach__clear.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_togglable/button_togglable_check.bemhtml.js */
block('button').mod('togglable', 'check').attrs()(function() {
    return this.extend(applyNext(), { 'aria-pressed' : String(!!this.mods.checked) });
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_togglable/button_togglable_check.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_togglable/button_togglable_radio.bemhtml.js */
block('button').mod('togglable', 'radio').attrs()(function() {
    return this.extend(applyNext(), { 'aria-pressed' : String(!!this.mods.checked) });
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_togglable/button_togglable_radio.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_type/button_type_link.bemhtml.js */
block('button').mod('type', 'link')(
    tag()('a'),

    attrs()(function() {
        var ctx = this.ctx,
            attrs = { role : 'link' };

        ctx.target && (attrs.target = ctx.target);
        this.mods.disabled?
            attrs['aria-disabled'] = 'true' :
            attrs.href = ctx.url;

        return this.extend(applyNext(), attrs);
    }),

    mod('disabled', true)
        .js()(function() {
            return this.extend(applyNext(), { url : this.ctx.url });
        })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/button/_type/button_type_link.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/checkbox.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/checkbox.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/__box/checkbox__box.bemhtml.js */
block('checkbox').elem('box').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/__box/checkbox__box.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/__control/checkbox__control.bemhtml.js */
block('checkbox').elem('control')(
    tag()('input'),

    attrs()(function() {
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/__control/checkbox__control.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/__text/checkbox__text.bemhtml.js */
block('checkbox').elem('text')(
    tag()('span'),
    attrs()({ role : 'presentation' })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/__text/checkbox__text.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/_type/checkbox_type_button.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox/_type/checkbox_type_button.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox-group/checkbox-group.bemhtml.js */
block('checkbox-group')(
    tag()('span'),

    attrs()({ role : 'group' }),

    js()(true),

    mix()([{ block : 'control-group' }]),

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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/checkbox-group/checkbox-group.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/control-group/control-group.bemhtml.js */
block('control-group').attrs()({ role : 'group' });

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/control-group/control-group.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/dropdown/dropdown.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/dropdown/dropdown.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/popup/popup.bemhtml.js */
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
    attrs()({ 'aria-hidden' : 'true' })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/popup/popup.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/dropdown/_switcher/dropdown_switcher_button.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/dropdown/_switcher/dropdown_switcher_button.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/dropdown/_switcher/dropdown_switcher_link.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/dropdown/_switcher/dropdown_switcher_link.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/link/link.bemhtml.js */
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
    mix()([{ elem : 'control' }]),

    attrs()(function() {
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/link/link.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/link/_pseudo/link_pseudo.bemhtml.js */
block('link').mod('pseudo', true).match(function() { return !this.ctx.url; })(
    tag()('span'),
    attrs()(function() {
        return this.extend(applyNext(), { role : 'button' });
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/link/_pseudo/link_pseudo.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/image/image.bemhtml.js */
block('image')(
    attrs()({ role : 'img' }),

    tag()('span'),

    match(function() { return typeof this.ctx.content === 'undefined'; })(
        tag()('img'),
        attrs()(function() {
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/image/image.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/input.bemhtml.js */
block('input')(
    tag()('span'),
    js()(true),
    def()(function() {
        return applyNext({ _input : this.ctx });
    }),
    content()({ elem : 'box', content : { elem : 'control' } })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/input.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/__box/input__box.bemhtml.js */
block('input').elem('box').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/__box/input__box.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/__control/input__control.bemhtml.js */
block('input').elem('control')(
    tag()('input'),

    attrs()(function() {
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/__control/input__control.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/_has-clear/input_has-clear.bemhtml.js */
block('input').mod('has-clear', true).elem('box')
    .content()(function() {
        return [this.ctx.content, { elem : 'clear' }];
    });

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/_has-clear/input_has-clear.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/__clear/input__clear.bemhtml.js */
block('input').elem('clear').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/__clear/input__clear.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/_type/input_type_password.bemhtml.js */
block('input').mod('type', 'password').elem('control').attrs()(function() {
    return this.extend(applyNext(), { type : 'password' });
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/_type/input_type_password.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/_type/input_type_search.bemhtml.js */
block('input').mod('type', 'search').elem('control').attrs()(function() {
    return this.extend(applyNext(), { type : 'search' });
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/input/_type/input_type_search.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/menu.bemhtml.js */
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

        return attrs;
    }),
    js()(true),
    mix()({ elem : 'control' }),
    mod('disabled', true)
        .js()(function() {
            return this.extend(applyNext(), { tabIndex : 0 });
        })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/menu.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/_focused/menu_focused.bemhtml.js */
block('menu').mod('focused', true).js()(function() {
    return this.extend(applyNext(), { lazyInit : false });
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/_focused/menu_focused.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/__item/menu__item.bemhtml.js */
block('menu').elem('item')(
    def().match(function() { return this._menuMods; })(function() {
        var elemMods = this.elemMods;
        elemMods.theme = elemMods.theme || this._menuMods.theme;
        elemMods.disabled = elemMods.disabled || this._menuMods.disabled;
        return applyNext();
    }),
    js()(function() {
        return { val : this.ctx.val };
    }),
    attrs()(function(){
        var elemMods = this.elemMods,
            menuMode = this._menuMods && this._menuMods.mode,
            role = menuMode?
                        (menuMode === 'check'? 'menuitemcheckbox' : 'menuitemradio') :
                        'menuitem',
            attrs = {
                role : role,
                id : this.ctx.id || this.generateId(),
                'aria-disabled' : elemMods.disabled && 'true',
                'aria-checked' : menuMode && String(!!elemMods.checked)
            };

        return attrs;
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/__item/menu__item.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/__group/menu__group.bemhtml.js */
block('menu').elem('group')(
    attrs()({ role : 'group' }),
    match(function() { return typeof this.ctx.title !== 'undefined'; })(
        attrs()(function() {
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/__group/menu__group.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/_mode/menu_mode_radio.bemhtml.js */
block('menu')
    .mod('mode', 'radio')
    .match(function() {
        return this._firstItem && this._checkedItems && !this._checkedItems.length;
    })
    .def()(function() {
        (this._firstItem.elemMods || (this._firstItem.elemMods = {})).checked = true;
        return applyNext();
    });

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/_mode/menu_mode_radio.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/__item/_type/menu__item_type_link.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/menu/__item/_type/menu__item_type_link.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/modal/modal.bemhtml.js */
block('modal')(
    js()(true),

    mix()(function() {
        return {
            block : 'popup',
            js : { zIndexGroupLevel : this.ctx.zIndexGroupLevel || 20 },
            mods : { autoclosable : this.mods.autoclosable }
        };
    }),

    attrs()({
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/modal/modal.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/progressbar/progressbar.bemhtml.js */
block('progressbar')(
    def()(function() {
        return applyNext({ _val : this.ctx.val || 0 });
    }),

    js()(function(){
        return { val : this._val };
    }),

    attrs()(function() {
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/progressbar/progressbar.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/radio.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/radio.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/__box/radio__box.bemhtml.js */
block('radio').elem('box').tag()('span');

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/__box/radio__box.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/__control/radio__control.bemhtml.js */
block('radio').elem('control')(
    tag()('input'),

    attrs()(function() {
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/__control/radio__control.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/__text/radio__text.bemhtml.js */
block('radio').elem('text')(
    tag()('span'),
    attrs()(function() {
        return { role : 'presentation' };
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/__text/radio__text.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/_type/radio_type_button.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio/_type/radio_type_button.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio-group/radio-group.bemhtml.js */
block('radio-group')(
    tag()('span'),

    attrs()({ role : 'radiogroup' }),

    js()(true),

    mix()([{ block : 'control-group' }]),

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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio-group/radio-group.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio-group/_mode/radio-group_mode_radio-check.bemhtml.js */
block('radio-group').mod('mode', 'radio-check')(
    def()(function() {
        if(this.mods.type !== 'button')
            throw Error('Modifier mode=radio-check can be only with modifier type=button');

        return applyNext();
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/radio-group/_mode/radio-group_mode_radio-check.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/select.bemhtml.js */
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

    js()(function() {
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/select.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_focused/select_focused.bemhtml.js */
block('select').mod('focused', true).js()(function() {
    return this.extend(applyNext(), { lazyInit : false });
});

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_focused/select_focused.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/__control/select__control.bemhtml.js */
block('select').elem('control')(
    tag()('input'),
    attrs()(function() {
        return {
            type : 'hidden',
            name : this._select.name,
            value : this.ctx.val,
            disabled : this.mods.disabled? 'disabled' : undefined,
            autocomplete : 'off'
        };
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/__control/select__control.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/__button/select__button.bemhtml.js */
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
    attrs()(function() {
        return { id : this._selectTextId };
    })
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/__button/select__button.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/__menu/select__menu.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/__menu/select__menu.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_mode/select_mode_check.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_mode/select_mode_check.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_mode/select_mode_radio-check.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_mode/select_mode_radio-check.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_mode/select_mode_radio.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/select/_mode/select_mode_radio.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/spin/spin.bemhtml.js */
block('spin')(
    tag()('span')
);

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/spin/spin.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/common.blocks/textarea/textarea.bemhtml.js */
block('textarea')(
    js()(true),
    tag()('textarea'),

    // NOTE: mix below is to satisfy interface of `control`
    mix()({ elem : 'control' }),

    attrs()(function() {
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

/* end: /Users/tadatuta/projects/bem/bem-components/common.blocks/textarea/textarea.bemhtml.js */
/* begin: /Users/tadatuta/projects/bem/bem-components/design/common.blocks/progressbar/_theme/progressbar_theme_simple.bemhtml.js */
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

/* end: /Users/tadatuta/projects/bem/bem-components/design/common.blocks/progressbar/_theme/progressbar_theme_simple.bemhtml.js */
oninit(function(exports, context) {
    var BEMContext = exports.BEMContext || context.BEMContext;
    // Provides third-party libraries from different modular systems
    BEMContext.prototype.require = function(lib) {
       return __bem_xjst_libs__[lib];
    };
});;
});
api.exportApply(exports);
/// -------------------------------------
/// ------ BEM-XJST User-code End -------
/// -------------------------------------


        return exports;
    };

    

    var defineAsGlobal = true;

    // Provide with CommonJS
    if (typeof module === 'object' && typeof module.exports === 'object') {
        exports['BEMHTML'] = buildBemXjst({
    
}
);
        defineAsGlobal = false;
    }

    // Provide to YModules
    if (typeof modules === 'object') {
        modules.define(
            'BEMHTML',
            [],
            function(
                provide
                
                ) {
                    provide(buildBemXjst({
    
}
));
                }
            );

        defineAsGlobal = false;
    }

    // Provide to global scope
    if (defineAsGlobal) {
        BEMHTML = buildBemXjst({
    
}
);
        global['BEMHTML'] = BEMHTML;
    }
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
