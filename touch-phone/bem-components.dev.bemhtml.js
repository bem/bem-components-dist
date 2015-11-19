(function(global) {
var buildBemXjst = function(exports, __bem_xjst_libs__){
/// -------------------------------------
/// --------- BEM-XJST Runtime Start ----
/// -------------------------------------
var BEMHTML = function(module, exports) {
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.BEMHTML = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function ClassBuilder(options) {
  this.modDelim = options.mod || '_';
  this.elemDelim = options.elem || '__';
}
exports.ClassBuilder = ClassBuilder;

ClassBuilder.prototype.build = function build(block, elem) {
  if (elem === undefined)
    return block;
  else
    return block + this.elemDelim + elem;
};

ClassBuilder.prototype.buildModPostfix = function buildModPostfix(modName,
                                                                  modVal) {
  var res = this.modDelim + modName;
  if (modVal !== true) res += this.modDelim + modVal;
  return res;
};

ClassBuilder.prototype.buildBlockClass = function buildBlockClass(name,
                                                                  modName,
                                                                  modVal) {
  var res = name;
  if (modVal) res += this.buildModPostfix(modName, modVal);
  return res;
};

ClassBuilder.prototype.buildElemClass = function buildElemClass(block,
                                                                name,
                                                                modName,
                                                                modVal) {
  var res = this.buildBlockClass(block) + this.elemDelim + name;
  if (modVal) res += this.buildModPostfix(modName, modVal);
  return res;
};

ClassBuilder.prototype.split = function split(key) {
  return key.split(this.elemDelim, 2);
};

},{}],2:[function(require,module,exports){
var utils = require('./utils');

function Context(bemhtml) {
  this._bemhtml = bemhtml;

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

  // Used in `OnceMatch` check to detect context change
  this._onceRef = {};
}
exports.Context = Context;

Context.prototype._flush = null;
Context.prototype.isArray = utils.isArray;

Context.prototype.isSimple = utils.isSimple;

Context.prototype.isShortTag = utils.isShortTag;
Context.prototype.extend = utils.extend;
Context.prototype.identify = utils.identify;

Context.prototype.xmlEscape = utils.xmlEscape;
Context.prototype.attrEscape = utils.attrEscape;
Context.prototype.jsAttrEscape = utils.jsAttrEscape;

Context.prototype.BEM = {};

Context.prototype.isFirst = function isFirst() {
  return this.position === 1;
};

Context.prototype.isLast = function isLast() {
  return this.position === this._listLength;
};

Context.prototype.generateId = function generateId() {
  return utils.identify(this.ctx);
};

Context.prototype.reapply = function reapply(ctx) {
  return this._bemhtml.run(ctx);
};

},{"./utils":7}],3:[function(require,module,exports){
var utils = require('./utils');
var Template = require('./tree').Template;
var PropertyMatch = require('./tree').PropertyMatch;
var CompilerOptions = require('./tree').CompilerOptions;
var Match = require('./match').Match;

function Entity(bemhtml, block, elem, templates) {
  this.bemhtml = bemhtml;

  this.block = null;
  this.elem = null;
  this.jsClass = null;

  // `true` if entity has just a default renderer for `def()` mode
  this.canFlush = true;

  // Compiler options via `xjstOptions()`
  this.options = {};

  // "Fast modes"
  this.def = new Match(this);
  this.tag = new Match(this);
  this.attrs = new Match(this);
  this.mod = new Match(this);
  this.js = new Match(this);
  this.mix = new Match(this);
  this.bem = new Match(this);
  this.cls = new Match(this);
  this.content = new Match(this);

  // "Slow modes"
  this.rest = {};

  // Initialize
  this.init(block, elem);
  this.initModes(templates);
}
exports.Entity = Entity;

Entity.prototype.init = function init(block, elem) {
  this.block = block;
  this.elem = elem;

  // Class for jsParams
  this.jsClass = this.bemhtml.classBuilder.build(this.block, this.elem);
};

function contentMode() {
  return this.ctx.content;
}

Entity.prototype.initModes = function initModes(templates) {
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

Entity.prototype._initRest = function _initRest(key) {
  if (key === 'tag' ||
      key === 'attrs' ||
      key === 'js' ||
      key === 'mix' ||
      key === 'bem' ||
      key === 'cls' ||
      key === 'content' ||
      key === 'default') {
    if (key === 'default')
      this.rest[key] = this.def;
    else
      this.rest[key] = this[key];
  } else {
    if (!this.rest.hasOwnProperty(key))
      this.rest[key] = new Match(this);
  }
};

Entity.prototype.setDefaults = function setDefaults() {
  // Default .content() template for applyNext()
  if (this.content.count !== 0)
    this.content.push(new Template([], contentMode));

  // .def() default
  if (this.def.count !== 0) {
    // `.xjstOptions({ flush: true })` will override this
    this.canFlush = this.options.flush || false;
    var self = this;
    this.def.push(new Template([], function defaultBodyProxy() {
      return self.defaultBody(this);
    }));
  }
};

Entity.prototype.prepend = function prepend(other) {
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
Entity.prototype.run = function run(context) {
  if (this.def.count !== 0)
    return this.def.exec(context);

  return this.defaultBody(context);
};

Entity.prototype.defaultBody = function defaultBody(context) {
  var tag = context.ctx.tag;
  if (tag === undefined)
    tag = this.tag.exec(context);

  var js;
  if (context.ctx.js !== false)
    js = this.js.exec(context);

  var bem = this.bem.exec(context);
  var cls = this.cls.exec(context);
  var mix = this.mix.exec(context);
  var attrs = this.attrs.exec(context);
  var content = this.content.exec(context);

  // Default content
  if (this.content.count === 0 && content === undefined)
    content = context.ctx.content;

  return this.bemhtml.render(context,
                             this,
                             tag,
                             js,
                             bem,
                             cls,
                             mix,
                             attrs,
                             content);
};

},{"./match":5,"./tree":6,"./utils":7}],4:[function(require,module,exports){
var inherits = require('inherits');

var Tree = require('./tree').Tree;
var PropertyMatch = require('./tree').PropertyMatch;
var Entity = require('./entity').Entity;
var Context = require('./context').Context;
var ClassBuilder = require('./class-builder').ClassBuilder;
var utils = require('./utils');

function BEMHTML(options) {
  this.options = options || {};

  this.entities = null;
  this.defaultEnt = null;

  // Current tree
  this.tree = null;

  // Current match
  this.match = null;

  // Create new Context constructor for overriding prototype
  this.contextConstructor = function ContextChild(bemhtml) {
    Context.call(this, bemhtml);
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
  this.defaultEnt = new Entity(this, '', '', []);
  this.defaultElemEnt = new Entity(this, '', '', []);
}
module.exports = BEMHTML;

BEMHTML.locals = Tree.methods.concat('local', 'applyCtx', 'applyNext', 'apply');

BEMHTML.prototype.compile = function compile(code) {
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
      local: localWrap
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

BEMHTML.prototype.recompileInput = function recompileInput(code) {
  var out = code.toString();

  var args = BEMHTML.locals;

  // Reuse function if it already has right arguments
  if (typeof code === 'function' && code.length === args.length)
    return code;

  // Strip the function
  out = out.replace(/^function[^{]+{|}$/g, '');

  // And recompile it with right arguments
  out = new Function(args.join(', '), out);

  return out;
};

BEMHTML.prototype.groupEntities = function groupEntities(tree) {
  var res = {};
  for (var i = 0; i < tree.length; i++) {
    // Make sure to change only the copy, the original is cached in `this.tree`
    var template = tree[i].clone();
    var block = null;
    var elem;

    elem = undefined;
    for (var j = 0; j < template.predicates.length; j++) {
      var pred = template.predicates[j];
      if (!(pred instanceof PropertyMatch))
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

    // TODO(indutny): print out the template itself
    if (block === null)
      throw new Error('block("...") not found in one of the templates');

    var key = this.classBuilder.build(block, elem);

    if (!res[key])
      res[key] = [];
    res[key].push(template);
  }
  return res;
};

BEMHTML.prototype.transformEntities = function transformEntities(entities) {
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

    entities[key] = new Entity(this, block, elem, entities[key]);
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

BEMHTML.prototype._run = function _run(context) {
  var res;
  if (context === undefined || context === '' || context === null)
    res = this.runEmpty();
  else if (utils.isArray(context))
    res = this.runMany(context);
  else if (utils.isSimple(context))
    res = this.runSimple(context);
  else
    res = this.runOne(context);
  return res;
};

BEMHTML.prototype.run = function run(json) {
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


BEMHTML.prototype.runEmpty = function runEmpty() {
  this.context._listLength--;
  return '';
};

BEMHTML.prototype.runMany = function runMany(arr) {
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

BEMHTML.prototype.runSimple = function runSimple(context) {
  this.context._listLength--;
  var res = '';
  if (context && context !== true || context === 0)
    res += context;
  return res;
};

BEMHTML.prototype.runOne = function runOne(json) {
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
    else
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

  var key = this.classBuilder.build(block, elem);

  var restoreFlush = false;
  var ent = this.entities[key];
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

  var res = ent.run(context);
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

BEMHTML.prototype.render = function render(context,
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

  if (!tag)
    return this.renderNoTag(context, js, bem, cls, mix, attrs, content);

  var out = '<' + tag;

  var ctxJS = ctx.js;
  if (ctxJS !== false) {
    if (js === true)
      js = {};

    if (js) {
      if (ctxJS !== true)
        js = utils.extend(ctxJS, js);
    }  else if (ctxJS === true) {
      js = {};
    } else {
      js = ctxJS;
    }
  }

  var jsParams;
  if (js) {
    jsParams = {};
    jsParams[entity.jsClass] = js;
  }

  var isBEM = bem;
  if (isBEM === undefined) {
    if (ctx.bem === undefined)
      isBEM = entity.block || entity.elem;
    else
      isBEM = ctx.bem;
  }
  isBEM = !!isBEM;

  if (cls === undefined)
    cls = ctx.cls;

  var addJSInitClass = entity.block && jsParams && !entity.elem;
  if (!isBEM && !cls) {
    return this.renderClose(out, context, tag, attrs, isBEM, ctx, content);
  }

  out += ' class="';
  if (isBEM) {
    var mods = ctx.elemMods || ctx.mods;
    if (!mods && ctx.block)
      mods = context.mods;

    out += entity.jsClass;
    out += this.buildModsClasses(entity.block, entity.elem, mods);

    var totalMix = mix;
    if (ctx.mix) {
      if (totalMix)
        totalMix = [].concat(totalMix, ctx.mix);
      else
        totalMix = ctx.mix;
    }

    if (totalMix) {
      var m = this.renderMix(entity, totalMix, jsParams, addJSInitClass);
      out += m.out;
      jsParams = m.jsParams;
      addJSInitClass = m.addJSInitClass;
    }

    if (cls)
      out += ' ' + cls;
  } else {
    if (cls)
      out += cls;
  }

  if (addJSInitClass)
    out += ' i-bem"';
  else
    out += '"';

  if (isBEM && jsParams)
    out += ' data-bem=\'' + utils.jsAttrEscape(JSON.stringify(jsParams)) + '\'';

  return this.renderClose(out, context, tag, attrs, isBEM, ctx, content);
};

BEMHTML.prototype.renderClose = function renderClose(prefix,
                                                     context,
                                                     tag,
                                                     attrs,
                                                     isBEM,
                                                     ctx,
                                                     content) {
  var out = prefix;

  // NOTE: maybe we need to make an array for quicker serialization
  attrs = utils.extend(attrs, ctx.attrs);
  if (attrs) {
    var name; // TODO: do something with OmetaJS and YUI Compressor
    /* jshint forin : false */
    for (name in attrs) {
      var attr = attrs[name];
      if (attr === undefined)
        continue;

      // TODO(indutny): support `this.reapply()`
      out += ' ' + name + '="' +
        utils.attrEscape(utils.isSimple(attr) ?
                         attr :
                         this.reapply(attr)) +
                         '"';
    }
  }

  if (utils.isShortTag(tag)) {
    out += '/>';
    if (this.canFlush)
      out = context._flush(out);
  } else {
    out += '>';
    if (this.canFlush)
      out = context._flush(out);

    // TODO(indutny): skip apply next flags
    if (content || content === 0)
      out += this.renderContent(content, isBEM);

    out += '</' + tag + '>';
  }

  if (this.canFlush)
    out = context._flush(out);
  return out;
};

BEMHTML.prototype.renderMix = function renderMix(entity,
                                                 mix,
                                                 jsParams,
                                                 addJSInitClass) {
  var visited = {};
  var context = this.context;
  var js = jsParams;
  var addInit = addJSInitClass;

  visited[entity.jsClass] = true;

  // Transform mix to the single-item array if it's not array
  if (!utils.isArray(mix))
    mix = [ mix ];

  var classBuilder = this.classBuilder;

  var out = '';
  for (var i = 0; i < mix.length; i++) {
    var item = mix[i];
    if (item === undefined)
      continue;
    if (typeof item === 'string')
      item = { block: item, elem: undefined };

    var hasItem = item.block || item.elem;
    var block = item.block || item._block || context.block;
    var elem = item.elem || item._elem || context.elem;
    var key = classBuilder.build(block, elem);

    var classElem = item.elem ||
                    item._elem ||
                    (item.block ? undefined : context.elem);
    if (hasItem)
      out += ' ' + classBuilder.build(block, classElem);

    out += this.buildModsClasses(block, classElem, item.elemMods || item.mods);

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
      if (!nestedItem.block &&
          !nestedItem.elem ||
          !visited[classBuilder.build(nestedItem.block, nestedItem.elem)]) {
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

BEMHTML.prototype.buildModsClasses = function buildModsClasses(block,
                                                               elem,
                                                               mods) {
  if (!mods)
    return '';

  var res = '';

  var modName;
  for (modName in mods) {
    if (!mods.hasOwnProperty(modName))
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

BEMHTML.prototype.renderContent = function renderContent(content, isBEM) {
  var context = this.context;
  var oldPos = context.position;
  var oldListLength = context._listLength;
  var oldNotNewList = context._notNewList;

  context._notNewList = false;
  if (isBEM) {
    context.position = 1;
    context._listLength = 1;
  }

  var res = this._run(content);

  context.position = oldPos;
  context._listLength = oldListLength;
  context._notNewList = oldNotNewList;

  return res;
};

BEMHTML.prototype.renderNoTag = function renderNoTag(context,
                                                     js,
                                                     bem,
                                                     cls,
                                                     mix,
                                                     attrs,
                                                     content) {

  // TODO(indutny): skip apply next flags
  if (content || content === 0)
    return this._run(content);
  return '';
};

BEMHTML.prototype.local = function local(changes, body) {
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

BEMHTML.prototype.applyNext = function applyNext() {
  return this.match.exec(this.context);
};

BEMHTML.prototype.applyMode = function applyMode(mode, changes) {
  var match = this.match.entity.rest[mode];
  if (!match)
    return;

  if (!changes)
    return match.exec(this.context);

  var self = this;

  // Allocate function this way, to prevent allocation at the top of the
  // `applyMode`
  var fn = function localBody() {
    return match.exec(self.context);
  };
  return this.local(changes, fn);
};

BEMHTML.prototype.exportApply = function exportApply(exports) {
  var self = this;
  exports.apply = function apply(context) {
    return self.run(context);
  };

  // Add templates at run time
  exports.compile = function compile(templates) {
    return self.compile(templates);
  };

  var sharedContext = {};

  exports.BEMContext = this.contextConstructor;
  sharedContext.BEMContext = exports.BEMContext;

  for (var i = 0; i < this.oninit.length; i++) {
    var oninit = this.oninit[i];

    oninit(exports, sharedContext);
  }
};

},{"./class-builder":1,"./context":2,"./entity":3,"./tree":6,"./utils":7,"inherits":8}],5:[function(require,module,exports){
var utils = require('./utils');

var PropertyMatch = require('./tree').PropertyMatch;
var OnceMatch = require('./tree').OnceMatch;
var WrapMatch = require('./tree').WrapMatch;
var PropertyAbsent = require('./tree').PropertyAbsent;
var CustomMatch = require('./tree').CustomMatch;

function MatchProperty(template, pred) {
  this.template = template;
  this.key = pred.key;
  this.value = pred.value;
}

MatchProperty.prototype.exec = function exec(context) {
  return context[this.key] === this.value;
};

function MatchNested(template, pred) {
  this.template = template;
  this.keys = pred.key;
  this.value = pred.value;
}

MatchNested.prototype.exec = function exec(context) {
  var val = context;
  for (var i = 0; i < this.keys.length - 1; i++) {
    val = val[this.keys[i]];
    if (!val)
      return false;
  }

  return val[this.keys[i]] === this.value;
};

function MatchAbsent(template, pred) {
  this.template = template;
  this.key = pred.key;
}

MatchAbsent.prototype.exec = function exec(context) {
  return !context[this.key];
};

function MatchCustom(template, pred) {
  this.template = template;
  this.body = pred.body;
}

MatchCustom.prototype.exec = function exec(context) {
  return this.body.call(context);
};

function MatchOnce(template) {
  this.template = template;
  this.once = null;
}

MatchOnce.prototype.exec = function exec(context) {
  var res = this.once !== context._onceRef;
  this.once = context._onceRef;
  return res;
};

function MatchWrap(template) {
  this.template = template;
  this.wrap = null;
}

MatchWrap.prototype.exec = function exec(context) {
  var res = this.wrap !== context.ctx;
  this.wrap = context.ctx;
  return res;
};

function MatchTemplate(mode, template) {
  this.mode = mode;
  this.predicates = new Array(template.predicates.length);
  this.body = template.body;

  var postpone = [];

  for (var i = 0, j = 0; i < this.predicates.length; i++, j++) {
    var pred = template.predicates[i];
    if (pred instanceof PropertyMatch) {
      if (utils.isArray(pred.key))
        this.predicates[j] = new MatchNested(this, pred);
      else
        this.predicates[j] = new MatchProperty(this, pred);
    } else if (pred instanceof PropertyAbsent) {
      this.predicates[j] = new MatchAbsent(this, pred);
    } else if (pred instanceof CustomMatch) {
      this.predicates[j] = new MatchCustom(this, pred);

    // Push OnceMatch and MatchWrap later, they should not be executed first.
    // Otherwise they will set flag too early, and body might not be executed
    } else if (pred instanceof OnceMatch) {
      j--;
      postpone.push(new MatchOnce(this));
    } else if (pred instanceof WrapMatch) {
      j--;
      postpone.push(new MatchWrap(this));
    } else {
      // Skip
      j--;
    }
  }

  // Insert late predicates
  for (var i = postpone.length - 1; i >= 0; i--)
    this.predicates[i + j] = this.predicates[i];
  for (var i = 0; i < postpone.length; i++)
    this.predicates[i] = postpone[i];
  j += postpone.length;

  if (this.predicates.length !== j)
    this.predicates.length = j;
}
exports.MatchTemplate = MatchTemplate;

function Match(entity) {
  this.entity = entity;
  this.bemhtml = this.entity.bemhtml;
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

Match.prototype.clone = function clone(entity) {
  var res = new Match(entity);

  res.templates = this.templates.slice();
  res.mask = this.mask.slice();
  res.maskSize = this.maskSize;
  res.count = this.count;

  return res;
};

Match.prototype.prepend = function prepend(other) {
  this.templates = other.templates.concat(this.templates);
  this.count += other.count;

  while (Math.ceil(this.count / 31) > this.mask.length)
    this.mask.push(0);

  this.maskSize = this.mask.length;
};

Match.prototype.push = function push(template) {
  this.templates.push(new MatchTemplate(this, template));
  this.count++;

  if (Math.ceil(this.count / 31) > this.mask.length)
    this.mask.push(0);

  this.maskSize = this.mask.length;
};

Match.prototype.tryCatch = function tryCatch(fn, ctx) {
  try {
    return fn.call(ctx);
  } catch (e) {
    this.thrownError = e;
  }
};

Match.prototype.exec = function exec(context) {
  var save = this.checkDepth();

  var template;
  var bitIndex = this.maskOffset;
  var mask = this.mask[bitIndex];
  var bit = 1;
  for (var i = 0; i < this.count; i++) {
    if ((mask & bit) === 0) {
      template = this.templates[i];
      for (var j = template.predicates.length - 1; j >= 0; j--) {
        var pred = template.predicates[j];

        /* jshint maxdepth : false */
        if (!pred.exec(context))
          break;
      }

      // All predicates matched!
      if (j === -1)
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
    return undefined;

  var oldMask = mask;
  var oldMatch = this.bemhtml.match;
  this.mask[bitIndex] |= bit;
  this.bemhtml.match = this;

  this.thrownError = null;

  var out;
  if (typeof template.body === 'function')
    out = this.tryCatch(template.body, context);
  else
    out = template.body;

  this.mask[bitIndex] = oldMask;
  this.bemhtml.match = oldMatch;
  this.restoreDepth(save);

  var e = this.thrownError;
  if (e !== null) {
    this.thrownError = null;
    throw e;
  }

  return out;
};

Match.prototype.checkDepth = function checkDepth() {
  if (this.depth === -1) {
    this.depth = this.bemhtml.depth;
    return -1;
  }

  if (this.bemhtml.depth === this.depth)
    return this.depth;

  var depth = this.depth;
  this.depth = this.bemhtml.depth;

  this.maskOffset += this.maskSize;

  while (this.mask.length < this.maskOffset + this.maskSize)
    this.mask.push(0);

  return depth;
};

Match.prototype.restoreDepth = function restoreDepth(depth) {
  if (depth !== -1 && depth !== this.depth)
    this.maskOffset -= this.maskSize;
  this.depth = depth;
};

},{"./tree":6,"./utils":7}],6:[function(require,module,exports){
var assert = require('minimalistic-assert');
var inherits = require('inherits');

function Template(predicates, body) {
  this.predicates = predicates;

  this.body = body;
}
exports.Template = Template;

Template.prototype.wrap = function wrap() {
  var body = this.body;
  for (var i = 0; i < this.predicates.length; i++) {
    var pred = this.predicates[i];
    body = pred.wrapBody(body);
  }
  this.body = body;
};

Template.prototype.clone = function clone() {
  return new Template(this.predicates.slice(), this.body);
};

function MatchBase() {
}
exports.MatchBase = MatchBase;

MatchBase.prototype.wrapBody = function wrapBody(body) {
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

function OnceMatch() {
  MatchBase.call(this);
}
inherits(OnceMatch, MatchBase);
exports.OnceMatch = OnceMatch;

function WrapMatch(refs) {
  MatchBase.call(this);

  this.refs = refs;
}
inherits(WrapMatch, MatchBase);
exports.WrapMatch = WrapMatch;

WrapMatch.prototype.wrapBody = function wrapBody(body) {
  var applyCtx = this.refs.applyCtx;

  if (typeof body !== 'function') {
    return function inlineAdaptor() {
      return applyCtx(body);
    };
  }

  return function wrapAdaptor() {
    return applyCtx(body.call(this));
  };
};

function ReplaceMatch(refs) {
  MatchBase.call(this);

  this.refs = refs;
}
inherits(ReplaceMatch, MatchBase);
exports.ReplaceMatch = ReplaceMatch;

ReplaceMatch.prototype.wrapBody = function wrapBody(body) {
  var applyCtx = this.refs.applyCtx;

  if (typeof body !== 'function') {
    return function inlineAdaptor() {
      return applyCtx(body);
    };
  }

  return function replaceAdaptor() {
    return applyCtx(body.call(this));
  };
};

function ExtendMatch(refs) {
  MatchBase.call(this);

  this.refs = refs;
}
inherits(ExtendMatch, MatchBase);
exports.ExtendMatch = ExtendMatch;

ExtendMatch.prototype.wrapBody = function wrapBody(body) {
  var applyCtx = this.refs.applyCtx;
  var local = this.refs.local;

  if (typeof body !== 'function') {
    return function inlineAdaptor() {
      var changes = {};

      var keys = Object.keys(body);
      for (var i = 0; i < keys.length; i++)
        changes['ctx.' + keys[i]] = body[keys[i]];

      return local(changes)(function preApplyCtx() {
        return applyCtx(this.ctx);
      });
    };
  }

  return function localAdaptor() {
    var changes = {};

    var obj = body.call(this);
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++)
      changes['ctx.' + keys[i]] = obj[keys[i]];

    return local(changes)(function preApplyCtx() {
      return applyCtx(this.ctx);
    });
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

function PropertyAbsent(key) {
  MatchBase.call(this);

  this.key = key;
}
inherits(PropertyAbsent, MatchBase);
exports.PropertyAbsent = PropertyAbsent;

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
  'match', 'once', 'wrap', 'elemMatch', 'block', 'elem', 'mode', 'mod',
  'elemMod', 'def', 'tag', 'attrs', 'cls', 'js', 'jsAttr',
  'bem', 'mix', 'content', 'replace', 'extend', 'oninit',
  'xjstOptions'
];

Tree.prototype.build = function build(templates, apply) {
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
      return function wrapExtended() {
        return method.apply(self, arguments);
      };
    }

    return function wrapNotBody() {
      method.apply(self, arguments);
      return boundBody;
    };
  }

  return function wrapBody() {
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

Tree.prototype.methods = function methods(kind) {
  var out = new Array(Tree.methods.length);

  for (var i = 0; i < out.length; i++) {
    var name = Tree.methods[i];
    out[i] = methodFactory(this, kind, name);
  }

  return out;
};

// Called after all matches
Tree.prototype.flush = function flush(conditions, item) {
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

Tree.prototype.body = function body() {
  var children = new Array(arguments.length);
  for (var i = 0; i < arguments.length; i++)
    children[i] = arguments[i];

  var child = new Item(this, children);
  this.queue[this.queue.length - 1].children.push(child);

  if (this.queue.length === 1)
    this.flush([], this.queue.shift());

  return this.boundBody;
};

Tree.prototype.match = function match() {
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

Tree.prototype.once = function once() {
  return this.match(new OnceMatch());
};

Tree.prototype.wrap = function wrap() {
  return this.def().match(new WrapMatch(this.refs));
};

Tree.prototype.xjstOptions = function xjstOptions(options) {
  this.queue.push(new Item(this, [
    new CompilerOptions(options)
  ]));
  return this.boundBody;
};

Tree.prototype.block = function block(name) {
  return this.match(new PropertyMatch('block', name));
};

Tree.prototype.elemMatch = function elemMatch() {
  return this.match.apply(this, arguments);
};

Tree.prototype.elem = function elem(name) {
  return this.match(new PropertyMatch('elem', name));
};

Tree.prototype.mode = function mode(name) {
  return this.match(new PropertyMatch('_mode', name));
};

Tree.prototype.mod = function mod(name, value) {
  return this.match(new PropertyMatch([ 'mods', name ], value));
};

Tree.prototype.elemMod = function elemMod(name, value) {
  return this.match(new PropertyMatch([ 'elemMods', name ], value));
};

Tree.prototype.def = function def() { return this.mode('default'); };
Tree.prototype.tag = function tag() { return this.mode('tag'); };
Tree.prototype.attrs = function attrs() { return this.mode('attrs'); };
Tree.prototype.cls = function cls() { return this.mode('cls'); };
Tree.prototype.js = function js() { return this.mode('js'); };
Tree.prototype.jsAttr = function jsAttr() { return this.mode('jsAttr'); };
Tree.prototype.bem = function bem() { return this.mode('bem'); };
Tree.prototype.mix = function mix() { return this.mode('mix'); };
Tree.prototype.content = function content() { return this.mode('content'); };

Tree.prototype.replace = function replace() {
  return this.def().match(new ReplaceMatch(this.refs));
};

Tree.prototype.extend = function extend() {
  return this.def().match(new ExtendMatch(this.refs));
};

Tree.prototype.oninit = function oninit(fn) {
  this.initializers.push(fn);
};

},{"inherits":8,"minimalistic-assert":9}],7:[function(require,module,exports){
/**
 * Pattern for acceptable names of elements and modifiers
 * @const
 * @type String
 */
/* jshint unused : false */
var NAME_PATTERN = '[a-zA-Z0-9-]+';

var toString = Object.prototype.toString;

exports.isArray = Array.isArray;
if (!exports.isArray) {
  exports.isArray = function isArrayPolyfill(obj) {
    return toString.call(obj) === '[object Array]';
  };
}

exports.xmlEscape = function(str) {
  return (str + '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};
exports.attrEscape = function(str) {
  return (str + '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
};
exports.jsAttrEscape = function(str) {
  return (str + '')
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&#39;');
};

exports.extend = function extend(o1, o2) {
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

var SHORT_TAGS = { // хэш для быстрого определения, является ли тэг коротким
  area: 1, base: 1, br: 1, col: 1, command: 1, embed: 1, hr: 1, img: 1,
  input: 1, keygen: 1, link: 1, meta: 1, param: 1, source: 1, wbr: 1
};

exports.isShortTag = function isShortTag(t) {
  return SHORT_TAGS.hasOwnProperty(t);
};

exports.isSimple = function isSimple(obj) {
  if (!obj || obj === true) return true;
  return typeof obj === 'string' || typeof obj === 'number';
};

var uniqCount = 0;
var uniqId = +new Date();
var uniqExpando = '__' + uniqId;
var uniqPrefix = 'uniq' + uniqId;

function getUniq() {
  return uniqPrefix + (++uniqCount);
}
exports.getUniq = getUniq;

exports.identify = function identify(obj, onlyGet) {
  if (!obj)
    return getUniq();
  if (onlyGet || obj[uniqExpando])
    return obj[uniqExpando];

  var u = getUniq();
  obj[uniqExpando] = u;
  return u;
};

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
module.exports = assert;

function assert(val, msg) {
  if (!val)
    throw new Error(msg || 'Assertion failed');
}

assert.equal = function assertEqual(l, r, msg) {
  if (l != r)
    throw new Error(msg || ('Assertion failed: ' + l + ' != ' + r));
};

},{}]},{},[4])(4)
});;
  return module.exports ||
      exports.BEMHTML;
}({}, {});
/// -------------------------------------
/// --------- BEM-XJST Runtime End ------
/// -------------------------------------

var api = new BEMHTML({"wrap":false});
/// -------------------------------------
/// ------ BEM-XJST User-code Start -----
/// -------------------------------------
api.compile(function(match, once, wrap, elemMatch, block, elem, mode, mod, elemMod, def, tag, attrs, cls, js, jsAttr, bem, mix, content, replace, extend, oninit, xjstOptions, local, applyCtx, applyNext, apply) {
/* begin: /Users/tadatuta/Sites/bem-components/libs/bem-core/common.blocks/i-bem/__i18n/_dummy/i-bem__i18n_dummy_yes.bemhtml */
/*global oninit, BEM, exports */

oninit(function() {
    (function(global, bem_) {

        if(bem_.I18N) {
            return;
        }

        /** @global points to global context */
        global.BEM = bem_;

        /**
        * `BEM.I18N` API stub
        */
        var i18n = global.BEM.I18N = function(keyset, key) {
            return key;
        };

        i18n.keyset = function() { return i18n; };
        i18n.key = function(key) { return key; };
        i18n.lang = function() { return; };

    })(this, typeof BEM === 'undefined'? {} : BEM);
});

/* end: /Users/tadatuta/Sites/bem-components/libs/bem-core/common.blocks/i-bem/__i18n/_dummy/i-bem__i18n_dummy_yes.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/libs/bem-core/common.blocks/i-bem/__i18n/i-bem__i18n.bemhtml */
/* global exports, BEM */

block('i-bem').elem('i18n').def()(function() {
    if(!this.ctx) return '';

    var ctx = this.ctx,
        keyset = ctx.keyset,
        key = ctx.key,
        params = ctx.params || {};

    if(!(keyset || key))
        return '';

    /**
     * Consider `content` is a reserved param that contains
     * valid bemjson data
     */
    if(typeof ctx.content === 'undefined' || ctx.content !== null) {
        params.content = exports.apply(ctx.content);
    }

    this._buf.push(BEM.I18N(keyset, key, params));
});

/* end: /Users/tadatuta/Sites/bem-components/libs/bem-core/common.blocks/i-bem/__i18n/i-bem__i18n.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/libs/bem-core/common.blocks/page/page.bemhtml */
block('page')(

    def().match(function() { return !this._pageInit; })(function() {
        var ctx = this.ctx;
        this._nonceCsp = ctx.nonce;

        // TODO(indunty): remove local after bem/bem-xjst#50
        return local({ _pageInit : true })(function() {
            return applyCtx([
                ctx.doctype || '<!DOCTYPE html>',
                {
                    tag : 'html',
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
            ]);
        });
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
        attrs()(function() { return { rel : 'shortcut icon', href : this.ctx.url }; })
    )

);

/* end: /Users/tadatuta/Sites/bem-components/libs/bem-core/common.blocks/page/page.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/libs/bem-core/touch.blocks/page/page.bemhtml */
block('page')(

    def()(function() {
        return applyNext({ _zoom : this.ctx.zoom });
    }),

    elem('head').content()(function() {
        return [
            applyNext(),
            {
                elem : 'meta',
                attrs : {
                    name : 'viewport',
                    content : 'width=device-width,' +
                        (this._zoom?
                            'initial-scale=1' :
                            'maximum-scale=1,initial-scale=1,user-scalable=0')
                }
            },
            { elem : 'meta', attrs : { name : 'format-detection', content : 'telephone=no' } },
            { elem : 'link', attrs : { name : 'apple-mobile-web-app-capable', content : 'yes' } }
        ];
    }),

    mix()(function() {
        var mix = applyNext(),
            uaMix = [{ block : 'ua', attrs : { nonce : this._nonceCsp }, js : true }];

        return mix? uaMix.concat(mix) : uaMix;
    })
);

/* end: /Users/tadatuta/Sites/bem-components/libs/bem-core/touch.blocks/page/page.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/libs/bem-core/common.blocks/ua/ua.bemhtml */
block('ua')(
    tag()('script'),
    bem()(false),
    content()([
        '(function(e,c){',
            'e[c]=e[c].replace(/(ua_js_)no/g,"$1yes");',
        '})(document.documentElement,"className");'
    ])
);

/* end: /Users/tadatuta/Sites/bem-components/libs/bem-core/common.blocks/ua/ua.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/libs/bem-core/touch.blocks/ua/ua.bemhtml */
block('ua').js()(true);

/* end: /Users/tadatuta/Sites/bem-components/libs/bem-core/touch.blocks/ua/ua.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/libs/bem-core/common.blocks/page/__css/page__css.bemhtml */
block('page').elem('css')(
    bem()(false),
    tag()('style'),
    match(function() { return this.ctx.url; })(
        tag()('link'),
        attrs()(function() { return { rel : 'stylesheet', href : this.ctx.url }; })
    )
);

/* end: /Users/tadatuta/Sites/bem-components/libs/bem-core/common.blocks/page/__css/page__css.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/libs/bem-core/common.blocks/page/__js/page__js.bemhtml */
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

        return attrs;
    })
);

/* end: /Users/tadatuta/Sites/bem-components/libs/bem-core/common.blocks/page/__js/page__js.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/libs/bem-core/common.blocks/ua/__svg/ua__svg.bemhtml */
block('ua').content()(function() {
    return [
        applyNext(),
        '(function(d,n){',
            'd.documentElement.className+=',
            '" ua_svg_"+(d[n]&&d[n]("http://www.w3.org/2000/svg","svg").createSVGRect?"yes":"no");',
        '})(document,"createElementNS");'
    ];
});

/* end: /Users/tadatuta/Sites/bem-components/libs/bem-core/common.blocks/ua/__svg/ua__svg.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/libs/bem-core/touch.blocks/page/__icon/page__icon.bemhtml */
block('page').elem('icon').def()(function() {
    var ctx = this.ctx;
    return applyCtx([
        ctx.src16 && {
            elem : 'link',
            attrs : { rel : 'shortcut icon', href : ctx.src16 }
        },
        ctx.src114 && {
            elem : 'link',
            attrs : {
                rel : 'apple-touch-icon-precomposed',
                sizes : '114x114',
                href : ctx.src114
            }
        },
        ctx.src72 && {
            elem : 'link',
            attrs : {
                rel : 'apple-touch-icon-precomposed',
                sizes : '72x72',
                href : ctx.src72
            }
        },
        ctx.src57 && {
            elem : 'link',
            attrs : { rel : 'apple-touch-icon-precomposed', href : ctx.src57 }
        }
    ]);
});

/* end: /Users/tadatuta/Sites/bem-components/libs/bem-core/touch.blocks/page/__icon/page__icon.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/attach/attach.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/attach/attach.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/button/button.bemhtml */
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
                !this._isRealButton && (attrs['aria-disabled'] = true);

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
            'text' in ctx && content.push({ elem : 'text', content : ctx.text });
            return content;
        },
        match(function() { return typeof this.ctx.content !== 'undefined'; })(function() {
            return this.ctx.content;
        })
    )
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/button/button.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/button/__text/button__text.bemhtml */
block('button').elem('text').tag()('span');

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/button/__text/button__text.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/button/_focused/button_focused.bemhtml */
block('button').mod('focused', true).js()(function() {
    return this.extend(applyNext(), { live : false });
});

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/button/_focused/button_focused.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/icon/icon.bemhtml */
block('icon')(
    tag()('span'),
    attrs()(function() {
        var attrs = {},
            url = this.ctx.url;
        if(url) attrs.style = 'background-image:url(' + url + ')';
        return attrs;
    })
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/icon/icon.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/attach/__button/attach__button.bemhtml */
block('button').match(function() { return this._attach; })(
    tag()('span'),
    content()(function() {
        return [
            { block : 'attach', elem : 'control' },
            applyNext()
        ];
    })
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/attach/__button/attach__button.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/attach/__control/attach__control.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/attach/__control/attach__control.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/attach/__no-file/attach__no-file.bemhtml */
block('attach').elem('no-file').tag()('span');

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/attach/__no-file/attach__no-file.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/attach/__file/attach__file.bemhtml */
block('attach').elem('file').tag()('span');

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/attach/__file/attach__file.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/attach/__text/attach__text.bemhtml */
block('attach').elem('text').tag()('span');

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/attach/__text/attach__text.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/attach/__clear/attach__clear.bemhtml */
block('attach').elem('clear').tag()('span');

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/attach/__clear/attach__clear.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/button/_togglable/button_togglable_check.bemhtml */
block('button').mod('togglable', 'check').attrs()(function() {
    return this.extend(applyNext(), { 'aria-pressed' : !!this.mods.checked });
});

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/button/_togglable/button_togglable_check.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/button/_togglable/button_togglable_radio.bemhtml */
block('button').mod('togglable', 'radio').attrs()(function() {
    return this.extend(applyNext(), { 'aria-pressed' : !!this.mods.checked });
});

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/button/_togglable/button_togglable_radio.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/button/_type/button_type_link.bemhtml */
block('button').mod('type', 'link')(
    tag()('a'),

    attrs()(function() {
        var ctx = this.ctx,
            attrs = { role : 'link' };

        ctx.target && (attrs.target = ctx.target);
        this.mods.disabled?
            attrs['aria-disabled'] = true :
            attrs.href = ctx.url;

        return this.extend(applyNext(), attrs);
    }),

    mod('disabled', true)
        .js()(function() {
            return this.extend(applyNext(), { url : this.ctx.url });
        })
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/button/_type/button_type_link.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/checkbox/checkbox.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/checkbox/checkbox.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/checkbox/__box/checkbox__box.bemhtml */
block('checkbox').elem('box').tag()('span');

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/checkbox/__box/checkbox__box.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/checkbox/__control/checkbox__control.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/checkbox/__control/checkbox__control.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/checkbox/__text/checkbox__text.bemhtml */
block('checkbox').elem('text')(
    tag()('span'),
    attrs()({ role : 'presentation' })
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/checkbox/__text/checkbox__text.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/checkbox/_type/checkbox_type_button.bemhtml */
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
                'aria-checked' : !!mods.checked
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/checkbox/_type/checkbox_type_button.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/checkbox-group/checkbox-group.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/checkbox-group/checkbox-group.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/control-group/control-group.bemhtml */
block('control-group').attrs()({ role : 'group' });

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/control-group/control-group.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/dropdown/dropdown.bemhtml */
block('dropdown')(
    def()(function() {
        return applyCtx([{ elem : 'switcher' }, { elem : 'popup' }]);
    }),
    def()(function() {
        var ctx = this.ctx;

        ctx.js = this.extend(apply('js'), ctx.js);
        return applyNext({ _dropdown : ctx, _popupId : this.generateId() });
    }),
    js()(function() {
        return { id : this.generateId() };
    }),
    elem('switcher').def()(function() {
        var dropdown = this._dropdown,
            switcher = dropdown.switcher;

        switcher.block && (switcher.mix = apply('mix'));

        return applyCtx(switcher);
    }),
    elem('switcher').mix()(function() {
        var dropdown = this._dropdown;

        return [dropdown].concat(dropdown.switcher.mix || [], dropdown.mix || []);
    }),
    elem('popup').def()(function() {
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

        return applyCtx(popup);
    })
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/dropdown/dropdown.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/popup/popup.bemhtml */
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
    attrs()({ 'aria-hidden' : true })
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/popup/popup.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/dropdown/_switcher/dropdown_switcher_button.bemhtml */
block('dropdown').mod('switcher', 'button').elem('switcher').def()(function() {
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

        resAttrs['aria-haspopup'] = true;
        resAttrs['aria-controls'] = this._popupId;
        resAttrs['aria-expanded'] = false;

        res.mix = apply('mix');
    }

    return applyCtx(res);
});

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/dropdown/_switcher/dropdown_switcher_button.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/dropdown/_switcher/dropdown_switcher_link.bemhtml */
block('dropdown').mod('switcher', 'link').elem('switcher').def()(function() {
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

        resAttrs['aria-haspopup'] = true;
        resAttrs['aria-controls'] = this._popupId;
        resAttrs['aria-expanded'] = false;

        res.mix = apply('mix');
    }

    return applyCtx(res);
});

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/dropdown/_switcher/dropdown_switcher_link.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/link/link.bemhtml */
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
            attrs['aria-disabled'] = true;
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/link/link.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/link/_pseudo/link_pseudo.bemhtml */
block('link').mod('pseudo', true).match(function() { return !this.ctx.url; })(
    tag()('span'),
    attrs()(function() {
        return this.extend(applyNext(), { role : 'button' });
    })
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/link/_pseudo/link_pseudo.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/image/image.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/image/image.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/input/input.bemhtml */
block('input')(
    tag()('span'),
    js()(true),
    def()(function() {
        return applyNext({ _input : this.ctx });
    }),
    content()({ elem : 'box', content : { elem : 'control' } })
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/input/input.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/input/__box/input__box.bemhtml */
block('input').elem('box').tag()('span');

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/input/__box/input__box.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/input/__control/input__control.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/input/__control/input__control.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/touch.blocks/input/__control/input__control.bemhtml */
block('input').elem('control')(

    attrs()(function() {
        return this.extend({
            autocomplete : 'off',
            autocorrect : 'off',
            autocapitalize : 'off',
            spellcheck : 'false'
        }, applyNext());
    })

);

/* end: /Users/tadatuta/Sites/bem-components/touch.blocks/input/__control/input__control.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/input/_has-clear/input_has-clear.bemhtml */
block('input').mod('has-clear', true).elem('box')
    .content()(function() {
        return [this.ctx.content, { elem : 'clear' }];
    });

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/input/_has-clear/input_has-clear.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/input/__clear/input__clear.bemhtml */
block('input').elem('clear').tag()('span');

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/input/__clear/input__clear.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/input/_type/input_type_password.bemhtml */
block('input').mod('type', 'password').elem('control').attrs()(function() {
    return this.extend(applyNext(), { type : 'password' });
});

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/input/_type/input_type_password.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/input/_type/input_type_search.bemhtml */
block('input').mod('type', 'search').elem('control').attrs()(function() {
    return this.extend(applyNext(), { type : 'search' });
});

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/input/_type/input_type_search.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/menu/menu.bemhtml */
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
                        if(itemOrGroup.block === 'menu-item') {
                            firstItem || (firstItem = itemOrGroup);
                            if(containsVal(itemOrGroup.val)) {
                                (itemOrGroup.mods = itemOrGroup.mods || {}).checked = true;
                                checkedItems.push(itemOrGroup);
                            }
                        } else if(itemOrGroup.content) { // menu__group
                            iterateItems(itemOrGroup.content);
                        }
                    }
                };

            if(!this.isArray(ctx.content)) throw Error('menu: content must be an array of the menu items');

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
            attrs['aria-disabled'] = true :
            attrs.tabindex = 0;

        return attrs;
    }),
    js()(true),
    mix()([{ elem : 'control' }])
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/menu/menu.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/menu-item/menu-item.bemhtml */
block('menu-item')(
    def().match(function() { return this._menuMods; })(function() {
        var mods = this.mods;
        mods.theme = mods.theme || this._menuMods.theme;
        mods.disabled = mods.disabled || this._menuMods.disabled;
        return applyNext();
    }),
    js()(function() {
        return { val : this.ctx.val };
    }),
    attrs()(function(){
        var mods = this.mods,
            menuMode = this._menuMods && this._menuMods.mode,
            role = menuMode?
                        (menuMode === 'check'? 'menuitemcheckbox' : 'menuitemradio') :
                        'menuitem',
            attrs = {
                role : role,
                id : this.generateId(),
                'aria-disabled' : mods.disabled,
                'aria-checked' : menuMode && !!mods.checked
            };

        return attrs;
    })
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/menu-item/menu-item.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/menu/_focused/menu_focused.bemhtml */
block('menu').mod('focused', true).js()(function() {
    return this.extend(applyNext(), { live : false });
});

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/menu/_focused/menu_focused.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/menu/__group/menu__group.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/menu/__group/menu__group.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/menu/_mode/menu_mode_radio.bemhtml */
block('menu')
    .mod('mode', 'radio')
    .match(function() {
        return this._firstItem && this._checkedItems && !this._checkedItems.length;
    })
    .def()(function() {
        (this._firstItem.mods || (this._firstItem.mods = {})).checked = true;
        return applyNext();
    });

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/menu/_mode/menu_mode_radio.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/menu-item/_type/menu-item_type_link.bemhtml */
block('menu-item').mod('type', 'link').mod('disabled', true).match(function() {
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/menu-item/_type/menu-item_type_link.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/modal/modal.bemhtml */
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
        'aria-hidden' : true
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/modal/modal.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/progressbar/progressbar.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/progressbar/progressbar.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/radio/radio.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/radio/radio.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/radio/__box/radio__box.bemhtml */
block('radio').elem('box').tag()('span');

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/radio/__box/radio__box.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/radio/__control/radio__control.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/radio/__control/radio__control.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/radio/__text/radio__text.bemhtml */
block('radio').elem('text')(
    tag()('span'),
    attrs()(function() {
        return { role : 'presentation' };
    })
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/radio/__text/radio__text.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/radio/_type/radio_type_button.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/radio/_type/radio_type_button.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/radio-group/radio-group.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/radio-group/radio-group.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/radio-group/_mode/radio-group_mode_radio-check.bemhtml */
block('radio-group').mod('mode', 'radio-check')(
    def()(function() {
        if(this.mods.type !== 'button')
            throw Error('Modifier mode=radio-check can be only with modifier type=button');

        return applyNext();
    })
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/radio-group/_mode/radio-group_mode_radio-check.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/select/select.bemhtml */
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
                        optionIds.push(option.id = _this.generateId());
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
            _optionsIds : optionIds
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/select/select.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/select/_focused/select_focused.bemhtml */
block('select').mod('focused', true).js()(function() {
    return this.extend(applyNext(), { live : false });
});

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/select/_focused/select_focused.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/select/__control/select__control.bemhtml */
block('select').elem('control')(
    tag()('input'),
    attrs()(function() {
        return {
            type : 'hidden',
            name : this._select.name,
            value : this.ctx.val,
            disabled : this.mods.disabled? 'disabled' : undefined
        };
    })
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/select/__control/select__control.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/select/__button/select__button.bemhtml */
block('select').elem('button')(
    def()(function() {
        var select = this._select,
            mods = this.mods;

        return applyCtx({
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
                'aria-owns' : this._optionsIds.join(' '),
                'aria-multiselectable' : mods.mode === 'check'? 'true' : undefined,
                'aria-labelledby' : this._selectTextId
            },
            id : select.id,
            tabIndex : select.tabIndex,
            content : [
                apply('content'),
                { block : 'icon', mix : { block : 'select', elem : 'tick' } }
            ]
        });
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/select/__button/select__button.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/select/__menu/select__menu.bemhtml */
block('select').elem('menu')(
    def()(function() {
        var mods = this.mods,
            optionToMenuItem = function(option) {
                var res = {
                        block : 'menu-item',
                        mods : { disabled : mods.disabled || option.disabled },
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

        return applyCtx({
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
        });
    })
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/select/__menu/select__menu.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/select/_mode/select_mode_check.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/select/_mode/select_mode_check.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/select/_mode/select_mode_radio-check.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/select/_mode/select_mode_radio-check.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/select/_mode/select_mode_radio.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/select/_mode/select_mode_radio.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/spin/spin.bemhtml */
block('spin')(
    tag()('span')
);

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/spin/spin.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/common.blocks/textarea/textarea.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/common.blocks/textarea/textarea.bemhtml */
/* begin: /Users/tadatuta/Sites/bem-components/design/common.blocks/progressbar/_theme/progressbar_theme_simple.bemhtml */
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

/* end: /Users/tadatuta/Sites/bem-components/design/common.blocks/progressbar/_theme/progressbar_theme_simple.bemhtml */
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
if(typeof module === "object" && typeof module.exports === "object") {
    exports["BEMHTML"] = buildBemXjst({}, {});
    defineAsGlobal = false;
}
if(typeof modules === "object") {
    modules.define("BEMHTML", [], function(provide) {
        provide(buildBemXjst({}, {}));
    });
    defineAsGlobal = false;
}
if(defineAsGlobal) {
    global["BEMHTML"] = buildBemXjst({}, {});
}
})(this);