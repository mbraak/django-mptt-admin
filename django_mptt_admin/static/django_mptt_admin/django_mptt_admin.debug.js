/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 706:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
var __webpack_unused_export__;
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module exports.
 * @public
 */

exports.Q = parse;
__webpack_unused_export__ = serialize;

/**
 * Module variables.
 * @private
 */

var __toString = Object.prototype.toString

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

function parse(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {}
  var opt = options || {};
  var dec = opt.decode || decode;

  var index = 0
  while (index < str.length) {
    var eqIdx = str.indexOf('=', index)

    // no more cookie pairs
    if (eqIdx === -1) {
      break
    }

    var endIdx = str.indexOf(';', index)

    if (endIdx === -1) {
      endIdx = str.length
    } else if (endIdx < eqIdx) {
      // backtrack on prior semicolon
      index = str.lastIndexOf(';', eqIdx - 1) + 1
      continue
    }

    var key = str.slice(index, eqIdx).trim()

    // only assign once
    if (undefined === obj[key]) {
      var val = str.slice(eqIdx + 1, endIdx).trim()

      // quoted values
      if (val.charCodeAt(0) === 0x22) {
        val = val.slice(1, -1)
      }

      obj[key] = tryDecode(val, dec);
    }

    index = endIdx + 1
  }

  return obj;
}

/**
 * Serialize data into a cookie header.
 *
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [options]
 * @return {string}
 * @public
 */

function serialize(name, val, options) {
  var opt = options || {};
  var enc = opt.encode || encode;

  if (typeof enc !== 'function') {
    throw new TypeError('option encode is invalid');
  }

  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('argument name is invalid');
  }

  var value = enc(val);

  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError('argument val is invalid');
  }

  var str = name + '=' + value;

  if (null != opt.maxAge) {
    var maxAge = opt.maxAge - 0;

    if (isNaN(maxAge) || !isFinite(maxAge)) {
      throw new TypeError('option maxAge is invalid')
    }

    str += '; Max-Age=' + Math.floor(maxAge);
  }

  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError('option domain is invalid');
    }

    str += '; Domain=' + opt.domain;
  }

  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError('option path is invalid');
    }

    str += '; Path=' + opt.path;
  }

  if (opt.expires) {
    var expires = opt.expires

    if (!isDate(expires) || isNaN(expires.valueOf())) {
      throw new TypeError('option expires is invalid');
    }

    str += '; Expires=' + expires.toUTCString()
  }

  if (opt.httpOnly) {
    str += '; HttpOnly';
  }

  if (opt.secure) {
    str += '; Secure';
  }

  if (opt.partitioned) {
    str += '; Partitioned'
  }

  if (opt.priority) {
    var priority = typeof opt.priority === 'string'
      ? opt.priority.toLowerCase()
      : opt.priority

    switch (priority) {
      case 'low':
        str += '; Priority=Low'
        break
      case 'medium':
        str += '; Priority=Medium'
        break
      case 'high':
        str += '; Priority=High'
        break
      default:
        throw new TypeError('option priority is invalid')
    }
  }

  if (opt.sameSite) {
    var sameSite = typeof opt.sameSite === 'string'
      ? opt.sameSite.toLowerCase() : opt.sameSite;

    switch (sameSite) {
      case true:
        str += '; SameSite=Strict';
        break;
      case 'lax':
        str += '; SameSite=Lax';
        break;
      case 'strict':
        str += '; SameSite=Strict';
        break;
      case 'none':
        str += '; SameSite=None';
        break;
      default:
        throw new TypeError('option sameSite is invalid');
    }
  }

  return str;
}

/**
 * URL-decode string value. Optimized to skip native call when no %.
 *
 * @param {string} str
 * @returns {string}
 */

function decode (str) {
  return str.indexOf('%') !== -1
    ? decodeURIComponent(str)
    : str
}

/**
 * URL-encode value.
 *
 * @param {string} val
 * @returns {string}
 */

function encode (val) {
  return encodeURIComponent(val)
}

/**
 * Determine if value is a Date.
 *
 * @param {*} val
 * @private
 */

function isDate (val) {
  return __toString.call(val) === '[object Date]' ||
    val instanceof Date
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}


/***/ }),

/***/ 521:
/***/ (() => {

/*
JqTree 1.8.0

Copyright 2023 Marco Braak

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
@license

*/
var jqtree=function(e){"use strict";const t=e=>"object"==typeof e&&"children"in e&&e.children instanceof Array;let o=function(e){return e[e.Before=1]="Before",e[e.After=2]="After",e[e.Inside=3]="Inside",e[e.None=4]="None",e}({});const n={before:o.Before,after:o.After,inside:o.Inside,none:o.None},s=e=>{for(const t in n)if(Object.prototype.hasOwnProperty.call(n,t)&&n[t]===e)return t;return""};class r{constructor(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,o=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:r;this.name="",this.load_on_demand=!1,this.isEmptyFolder=null!=e&&t(e)&&0===e.children.length,this.setData(e),this.children=[],this.parent=null,o&&(this.idMapping=new Map,this.tree=this,this.nodeClass=n)}setData(e){if(e)if("string"==typeof e)this.name=e;else if("object"==typeof e)for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t)){const o=e[t];"label"===t||"name"===t?"string"==typeof o&&(this.name=o):"children"!==t&&"parent"!==t&&(this[t]=o)}}loadFromData(e){this.removeChildren();for(const o of e){const e=this.createNode(o);this.addChild(e),t(o)&&e.loadFromData(o.children)}return this}addChild(e){this.children.push(e),e.setParent(this)}addChildAtPosition(e,t){this.children.splice(t,0,e),e.setParent(this)}removeChild(e){e.removeChildren(),this.doRemoveChild(e)}getChildIndex(e){return this.children.indexOf(e)}hasChildren(){return 0!==this.children.length}isFolder(){return this.hasChildren()||this.load_on_demand}iterate(e){const t=(o,n)=>{if(o.children)for(const s of o.children){e(s,n)&&s.hasChildren()&&t(s,n+1)}};t(this,0)}moveNode(e,t,n){if(!e.parent||e.isParentOf(t))return!1;switch(e.parent.doRemoveChild(e),n){case o.After:return!!t.parent&&(t.parent.addChildAtPosition(e,t.parent.getChildIndex(t)+1),!0);case o.Before:return!!t.parent&&(t.parent.addChildAtPosition(e,t.parent.getChildIndex(t)),!0);case o.Inside:return t.addChildAtPosition(e,0),!0;default:return!1}}getData(){const e=t=>t.map((t=>{const o={};for(const e in t)if(-1===["parent","children","element","idMapping","load_on_demand","nodeClass","tree","isEmptyFolder"].indexOf(e)&&Object.prototype.hasOwnProperty.call(t,e)){const n=t[e];o[e]=n}return t.hasChildren()&&(o.children=e(t.children)),o}));return e(arguments.length>0&&void 0!==arguments[0]&&arguments[0]?[this]:this.children)}getNodeByName(e){return this.getNodeByCallback((t=>t.name===e))}getNodeByNameMustExist(e){const t=this.getNodeByCallback((t=>t.name===e));if(!t)throw`Node with name ${e} not found`;return t}getNodeByCallback(e){let t=null;return this.iterate((o=>!t&&(!e(o)||(t=o,!1)))),t}addAfter(e){if(this.parent){const t=this.createNode(e),o=this.parent.getChildIndex(this);return this.parent.addChildAtPosition(t,o+1),t.loadChildrenFromData(e),t}return null}addBefore(e){if(this.parent){const t=this.createNode(e),o=this.parent.getChildIndex(this);return this.parent.addChildAtPosition(t,o),t.loadChildrenFromData(e),t}return null}addParent(e){if(this.parent){const t=this.createNode(e);this.tree&&t.setParent(this.tree);const o=this.parent;for(const e of o.children)t.addChild(e);return o.children=[],o.addChild(t),t}return null}remove(){this.parent&&(this.parent.removeChild(this),this.parent=null)}append(e){const t=this.createNode(e);return this.addChild(t),t.loadChildrenFromData(e),t}prepend(e){const t=this.createNode(e);return this.addChildAtPosition(t,0),t.loadChildrenFromData(e),t}isParentOf(e){let t=e.parent;for(;t;){if(t===this)return!0;t=t.parent}return!1}getLevel(){let e=0,t=this;for(;t.parent;)e+=1,t=t.parent;return e}getNodeById(e){return this.idMapping.get(e)||null}addNodeToIndex(e){null!=e.id&&this.idMapping.set(e.id,e)}removeNodeFromIndex(e){null!=e.id&&this.idMapping.delete(e.id)}removeChildren(){this.iterate((e=>(this.tree?.removeNodeFromIndex(e),!0))),this.children=[]}getPreviousSibling(){if(this.parent){const e=this.parent.getChildIndex(this)-1;return e>=0&&this.parent.children[e]||null}return null}getNextSibling(){if(this.parent){const e=this.parent.getChildIndex(this)+1;return e<this.parent.children.length&&this.parent.children[e]||null}return null}getNodesByProperty(e,t){return this.filter((o=>o[e]===t))}filter(e){const t=[];return this.iterate((o=>(e(o)&&t.push(o),!0))),t}getNextNode(){if((!(arguments.length>0&&void 0!==arguments[0])||arguments[0])&&this.hasChildren())return this.children[0]||null;if(this.parent){const e=this.getNextSibling();return e||this.parent.getNextNode(!1)}return null}getNextVisibleNode(){if(this.hasChildren()&&this.is_open)return this.children[0]||null;if(this.parent){const e=this.getNextSibling();return e||this.parent.getNextNode(!1)}return null}getPreviousNode(){if(this.parent){const e=this.getPreviousSibling();return e?e.hasChildren()?e.getLastChild():e:this.getParent()}return null}getPreviousVisibleNode(){if(this.parent){const e=this.getPreviousSibling();return e?e.hasChildren()&&e.is_open?e.getLastChild():e:this.getParent()}return null}getParent(){return this.parent&&this.parent.parent?this.parent:null}getLastChild(){if(this.hasChildren()){const e=this.children[this.children.length-1];return e?e.hasChildren()&&e.is_open?e?.getLastChild():e:null}return null}initFromData(e){const o=e=>{for(const t of e){const e=this.createNode();e.initFromData(t),this.addChild(e)}};(e=>{this.setData(e),t(e)&&e.children.length&&o(e.children)})(e)}setParent(e){this.parent=e,this.tree=e.tree,this.tree?.addNodeToIndex(this)}doRemoveChild(e){this.children.splice(this.getChildIndex(e),1),this.tree?.removeNodeFromIndex(e)}getNodeClass(){return this.nodeClass||this?.tree?.nodeClass||r}createNode(e){return new(this.getNodeClass())(e)}loadChildrenFromData(e){t(e)&&e.children.length&&this.loadFromData(e.children)}}class i{constructor(e,t,o,n,s){this.offsetX=t,this.offsetY=o,this.$element=jQuery("<span>").addClass("jqtree-title jqtree-dragging"),s?this.$element.text(e):this.$element.html(e),this.$element.css("position","absolute"),n.append(this.$element)}move(e,t){this.$element.offset({left:e-this.offsetX,top:t-this.offsetY})}remove(){this.$element.remove()}}const l=e=>e?"true":"false",d=e=>e.getBoundingClientRect().y+window.scrollY;class a{constructor(e){this.tree=e}iterate(){let e=!0;const t=(o,n)=>{let s=(o.is_open||!o.element)&&o.hasChildren(),r=null;if(o.element?.offsetParent&&(r=o.element,e&&(this.handleFirstNode(o),e=!1),o.hasChildren()?o.is_open?this.handleOpenFolder(o,o.element)||(s=!1):this.handleClosedFolder(o,n,r):this.handleNode(o,n,o.element)),s){const e=o.children.length;o.children.forEach(((n,s)=>{const r=o.children[s];if(r)if(s===e-1)t(r,null);else{const e=o.children[s+1];e&&t(r,e)}})),o.is_open&&r&&this.handleAfterOpenFolder(o,n)}};t(this.tree,null)}}class h extends a{constructor(e,t,o){super(e),this.currentNode=t,this.treeBottom=o}generate(){return this.positions=[],this.lastTop=0,this.iterate(),this.generateHitAreas(this.positions)}generateHitAreas(e){let t=e[0]?.top??0,o=[];const n=[];for(const s of e)s.top!==t&&o.length&&(this.generateHitAreasForGroup(n,o,t,s.top),t=s.top,o=[]),o.push(s);return this.generateHitAreasForGroup(n,o,t,this.treeBottom),n}handleOpenFolder(e,t){return e!==this.currentNode&&(e.children[0]!==this.currentNode&&this.addPosition(e,o.Inside,d(t)),!0)}handleClosedFolder(e,t,n){const s=d(n);e===this.currentNode?this.addPosition(e,o.None,s):(this.addPosition(e,o.Inside,s),t!==this.currentNode&&this.addPosition(e,o.After,s))}handleFirstNode(e){e!==this.currentNode&&this.addPosition(e,o.Before,d(e.element))}handleAfterOpenFolder(e,t){e===this.currentNode||t===this.currentNode?this.addPosition(e,o.None,this.lastTop):this.addPosition(e,o.After,this.lastTop)}handleNode(e,t,n){const s=d(n);e===this.currentNode?this.addPosition(e,o.None,s):this.addPosition(e,o.Inside,s),t===this.currentNode||e===this.currentNode?this.addPosition(e,o.None,s):this.addPosition(e,o.After,s)}addPosition(e,t,o){const n={top:o,bottom:0,node:e,position:t};this.positions.push(n),this.lastTop=o}generateHitAreasForGroup(e,t,o,n){const s=Math.min(t.length,4),r=Math.round((n-o)/s);let i=o,l=0;for(;l<s;){const o=t[l];o&&e.push({top:i,bottom:i+r,node:o.node,position:o.position}),i+=r,l+=1}}}class c{constructor(e){let{autoEscape:t,getNodeElement:o,getNodeElementForNode:n,getScrollLeft:s,getTree:r,onCanMove:i,onCanMoveTo:l,onDragMove:d,onDragStop:a,onIsMoveHandle:h,openNode:c,refreshElements:u,slide:m,$treeElement:g,triggerEvent:p}=e;this.autoEscape=t,this.getNodeElement=o,this.getNodeElementForNode=n,this.getScrollLeft=s,this.getTree=r,this.onCanMove=i,this.onCanMoveTo=l,this.onDragMove=d,this.onDragStop=a,this.onIsMoveHandle=h,this.openNode=c,this.refreshElements=u,this.slide=m,this.$treeElement=g,this.triggerEvent=p,this.hoveredArea=null,this.hitAreas=[],this.isDragging=!1,this.currentItem=null}mouseCapture(e){const t=e.target;if(!this.mustCaptureElement(t))return null;if(this.onIsMoveHandle&&!this.onIsMoveHandle(jQuery(t)))return null;let o=this.getNodeElement(t);return o&&this.onCanMove&&(this.onCanMove(o.node)||(o=null)),this.currentItem=o,null!=this.currentItem}mouseStart(e){if(!this.currentItem||void 0===e.pageX||void 0===e.pageY)return!1;this.refresh();const t=jQuery(e.target).offset(),o=t?t.left:0,n=t?t.top:0,s=this.currentItem.node;return this.dragElement=new i(s.name,e.pageX-o,e.pageY-n,this.$treeElement,this.autoEscape??!0),this.isDragging=!0,this.currentItem.element.classList.add("jqtree-moving"),!0}mouseDrag(e){if(!this.currentItem||!this.dragElement||void 0===e.pageX||void 0===e.pageY)return!1;this.dragElement.move(e.pageX,e.pageY);const t=this.findHoveredArea(e.pageX,e.pageY);return t&&this.canMoveToArea(t)?(t.node.isFolder()||this.stopOpenFolderTimer(),this.hoveredArea!==t&&(this.hoveredArea=t,this.mustOpenFolderTimer(t)?this.startOpenFolderTimer(t.node):this.stopOpenFolderTimer(),this.updateDropHint())):(this.removeDropHint(),this.stopOpenFolderTimer(),this.hoveredArea=t),t||this.onDragMove&&this.onDragMove(this.currentItem.node,e.originalEvent),!0}mouseStop(e){this.moveItem(e),this.clear(),this.removeHover(),this.removeDropHint(),this.removeHitAreas();const t=this.currentItem;return this.currentItem&&(this.currentItem.element.classList.remove("jqtree-moving"),this.currentItem=null),this.isDragging=!1,!this.hoveredArea&&t&&this.onDragStop&&this.onDragStop(t.node,e.originalEvent),!1}refresh(){this.removeHitAreas(),this.currentItem&&(this.generateHitAreas(),this.currentItem=this.getNodeElementForNode(this.currentItem.node),this.isDragging&&this.currentItem.element.classList.add("jqtree-moving"))}generateHitAreas(){const e=this.getTree();if(this.currentItem&&e){const t=new h(e,this.currentItem.node,this.getTreeDimensions().bottom);this.hitAreas=t.generate()}else this.hitAreas=[]}mustCaptureElement(e){const t=e.nodeName;return"INPUT"!==t&&"SELECT"!==t&&"TEXTAREA"!==t}canMoveToArea(e){if(!this.onCanMoveTo)return!0;if(!this.currentItem)return!1;const t=s(e.position);return this.onCanMoveTo(this.currentItem.node,e.node,t)}removeHitAreas(){this.hitAreas=[]}clear(){this.dragElement&&(this.dragElement.remove(),this.dragElement=null)}removeDropHint(){this.previousGhost&&this.previousGhost.remove()}removeHover(){this.hoveredArea=null}findHoveredArea(e,t){const o=this.getTreeDimensions();if(e<o.left||t<o.top||e>o.right||t>o.bottom)return null;let n=0,s=this.hitAreas.length;for(;n<s;){const e=n+s>>1,o=this.hitAreas[e];if(!o)return null;if(t<o.top)s=e;else{if(!(t>o.bottom))return o;n=e+1}}return null}mustOpenFolderTimer(e){const t=e.node;return t.isFolder()&&!t.is_open&&e.position===o.Inside}updateDropHint(){if(!this.hoveredArea)return;this.removeDropHint();const e=this.getNodeElementForNode(this.hoveredArea.node);this.previousGhost=e.addDropHint(this.hoveredArea.position)}startOpenFolderTimer(e){const t=()=>{this.openNode(e,this.slide,(()=>{this.refresh(),this.updateDropHint()}))};this.stopOpenFolderTimer();const o=this.openFolderDelay;!1!==o&&(this.openFolderTimer=window.setTimeout(t,o))}stopOpenFolderTimer(){this.openFolderTimer&&(clearTimeout(this.openFolderTimer),this.openFolderTimer=null)}moveItem(e){if(this.currentItem&&this.hoveredArea&&this.hoveredArea.position!==o.None&&this.canMoveToArea(this.hoveredArea)){const t=this.currentItem.node,n=this.hoveredArea.node,r=this.hoveredArea.position,i=t.parent;r===o.Inside&&(this.hoveredArea.node.is_open=!0);const l=()=>{const e=this.getTree();e&&(e.moveNode(t,n,r),this.$treeElement.empty(),this.refreshElements(null))};this.triggerEvent("tree.move",{move_info:{moved_node:t,target_node:n,position:s(r),previous_parent:i,do_move:l,original_event:e.originalEvent}}).isDefaultPrevented()||l()}}getTreeDimensions(){const e=this.$treeElement.offset();if(e){const t=this.$treeElement,o=t.width()||0,n=t.height()||0,s=e.left+this.getScrollLeft();return{left:s,top:e.top,right:s+o,bottom:e.top+n+16}}return{left:0,top:0,right:0,bottom:0}}}class u{constructor(e){let{autoEscape:t,buttonLeft:o,closedIcon:n,onCreateLi:s,dragAndDrop:r,$element:i,getTree:l,isNodeSelected:d,openedIcon:a,rtl:h,showEmptyFolder:c,tabIndex:u}=e;this.autoEscape=t,this.buttonLeft=o,this.dragAndDrop=r,this.$element=i,this.getTree=l,this.isNodeSelected=d,this.onCreateLi=s,this.rtl=h,this.showEmptyFolder=c,this.tabIndex=u,this.openedIconElement=this.createButtonElement(a||"+"),this.closedIconElement=this.createButtonElement(n||"-")}render(e){e&&e.parent?this.renderFromNode(e):this.renderFromRoot()}renderFromRoot(){this.$element.empty();const e=this.getTree();this.$element[0]&&e&&this.createDomElements(this.$element[0],e.children,!0,1)}renderFromNode(e){const t=jQuery(e.element),o=this.createLi(e,e.getLevel());this.attachNodeData(e,o),t.after(o),t.remove(),e.children&&this.createDomElements(o,e.children,!1,e.getLevel()+1)}createDomElements(e,t,o,n){const s=this.createUl(o);e.appendChild(s);for(const e of t){const t=this.createLi(e,n);s.appendChild(t),this.attachNodeData(e,t),e.hasChildren()&&this.createDomElements(t,e.children,!1,n+1)}}attachNodeData(e,t){e.element=t,jQuery(t).data("node",e)}createUl(e){let t,o;e?(t="jqtree-tree",o="tree",this.rtl&&(t+=" jqtree-rtl")):(t="",o="group"),this.dragAndDrop&&(t+=" jqtree-dnd");const n=document.createElement("ul");return n.className=`jqtree_common ${t}`,n.setAttribute("role",o),n}createLi(e,t){const o=Boolean(this.isNodeSelected(e)),n=e.isFolder()||e.isEmptyFolder&&this.showEmptyFolder?this.createFolderLi(e,t,o):this.createNodeLi(e,t,o);return this.onCreateLi&&this.onCreateLi(e,jQuery(n),o),n}setTreeItemAriaAttributes(e,t,o,n){e.setAttribute("aria-label",t),e.setAttribute("aria-level",`${o}`),e.setAttribute("aria-selected",l(n)),e.setAttribute("role","treeitem")}createFolderLi(e,t,o){const n=this.getButtonClasses(e),s=this.getFolderClasses(e,o),r=e.is_open?this.openedIconElement:this.closedIconElement,i=document.createElement("li");i.className=`jqtree_common ${s}`,i.setAttribute("role","none");const d=document.createElement("div");d.className="jqtree-element jqtree_common",d.setAttribute("role","none"),i.appendChild(d);const a=document.createElement("a");a.className=n,r&&a.appendChild(r.cloneNode(!0)),this.buttonLeft&&d.appendChild(a);const h=this.createTitleSpan(e.name,o,!0,t);return h.setAttribute("aria-expanded",l(e.is_open)),d.appendChild(h),this.buttonLeft||d.appendChild(a),i}createNodeLi(e,t,o){const n=["jqtree_common"];o&&n.push("jqtree-selected");const s=n.join(" "),r=document.createElement("li");r.className=s,r.setAttribute("role","none");const i=document.createElement("div");i.className="jqtree-element jqtree_common",i.setAttribute("role","none"),r.appendChild(i);const l=this.createTitleSpan(e.name,o,!1,t);return i.appendChild(l),r}createTitleSpan(e,t,o,n){const s=document.createElement("span");let r="jqtree-title jqtree_common";if(o&&(r+=" jqtree-title-folder"),r+=" jqtree-title-button-"+(this.buttonLeft?"left":"right"),s.className=r,t){const e=this.tabIndex;void 0!==e&&s.setAttribute("tabindex",`${e}`)}return this.setTreeItemAriaAttributes(s,e,n,t),this.autoEscape?s.textContent=e:s.innerHTML=e,s}getButtonClasses(e){const t=["jqtree-toggler","jqtree_common"];return e.is_open||t.push("jqtree-closed"),this.buttonLeft?t.push("jqtree-toggler-left"):t.push("jqtree-toggler-right"),t.join(" ")}getFolderClasses(e,t){const o=["jqtree-folder"];return e.is_open||o.push("jqtree-closed"),t&&o.push("jqtree-selected"),e.is_loading&&o.push("jqtree-loading"),o.join(" ")}createButtonElement(e){if("string"==typeof e){const t=document.createElement("div");return t.innerHTML=e,document.createTextNode(t.innerHTML)}return null==e?void 0:e.nodeType?e:jQuery(e)[0]}}class m{constructor(e){let{dataFilter:t,loadData:o,onLoadFailed:n,onLoading:s,$treeElement:r,triggerEvent:i}=e;this.dataFilter=t,this.loadData=o,this.onLoadFailed=n,this.onLoading=s,this.$treeElement=r,this.triggerEvent=i}loadFromUrl(e,t,o){if(!e)return;const n=this.getDomElement(t);this.addLoadingClass(n),this.notifyLoading(!0,t,n);const s=()=>{this.removeLoadingClass(n),this.notifyLoading(!1,t,n)};this.submitRequest(e,(e=>{s(),this.loadData(this.parseData(e),t),o&&"function"==typeof o&&o()}),(e=>{s(),this.onLoadFailed&&this.onLoadFailed(e)}))}addLoadingClass(e){e&&e.addClass("jqtree-loading")}removeLoadingClass(e){e&&e.removeClass("jqtree-loading")}getDomElement(e){return e?jQuery(e.element):this.$treeElement}notifyLoading(e,t,o){this.onLoading&&this.onLoading(e,t,o),this.triggerEvent("tree.loading_data",{isLoading:e,node:t,$el:o})}submitRequest(e,t,o){const n={method:"GET",cache:!1,dataType:"json",success:t,error:o,..."string"==typeof e?{url:e}:e};n.method=n.method?.toUpperCase()||"GET",jQuery.ajax(n)}parseData(e){const t="string"==typeof e?JSON.parse(e):e;return this.dataFilter?this.dataFilter(t):t}}class g{constructor(e){let{closeNode:t,getSelectedNode:o,isFocusOnTree:n,keyboardSupport:s,openNode:r,selectNode:i}=e;this.closeNode=t,this.getSelectedNode=o,this.isFocusOnTree=n,this.keyboardSupport=s,this.openNode=r,this.originalSelectNode=i,s&&(this.handleKeyDownHandler=this.handleKeyDown.bind(this),document.addEventListener("keydown",this.handleKeyDownHandler))}deinit(){this.handleKeyDownHandler&&document.removeEventListener("keydown",this.handleKeyDownHandler)}moveDown(e){return this.selectNode(e.getNextVisibleNode())}moveUp(e){return this.selectNode(e.getPreviousVisibleNode())}moveRight(e){return!e.isFolder()||(e.is_open?this.selectNode(e.getNextVisibleNode()):(this.openNode(e),!1))}moveLeft(e){return e.isFolder()&&e.is_open?(this.closeNode(e),!1):this.selectNode(e.getParent())}selectNode(e){return!e||(this.originalSelectNode(e),!1)}handleKeyDown=e=>{if(!this.canHandleKeyboard())return!0;const t=this.getSelectedNode();if(!t)return!0;switch(e.key){case"ArrowDown":return this.moveDown(t);case"ArrowUp":return this.moveUp(t);case"ArrowRight":return this.moveRight(t);case"ArrowLeft":return this.moveLeft(t);default:return!0}};canHandleKeyboard(){return this.keyboardSupport&&this.isFocusOnTree()}}const p=(e,t)=>{const o=()=>`simple_widget_${t}`,n=(e,t)=>{const o=jQuery.data(e,t);return o&&o instanceof f?o:null},s=(t,s)=>{const r=o();for(const o of t.get()){if(!n(o,r)){const t=new e(o,s);jQuery.data(o,r)||jQuery.data(o,r,t),t.init()}}return t};jQuery.fn[t]=function(t){if(!t)return s(this,null);if("object"==typeof t){return s(this,t)}if("string"==typeof t&&"_"!==t[0]){const s=t;if("destroy"===s)return(e=>{const t=o();for(const o of e.get()){const e=n(o,t);e&&e.destroy(),jQuery.removeData(o,t)}})(this);if("get_widget_class"===s)return e;for(var r=arguments.length,i=new Array(r>1?r-1:0),l=1;l<r;l++)i[l-1]=arguments[l];return((e,t,n)=>{let s=null;for(const r of e.get()){const e=jQuery.data(r,o());if(e&&e instanceof f){const o=e[t];o&&"function"==typeof o&&(s=o.apply(e,n))}}return s})(this,s,i)}}};class f{static register(e,t){p(e,t)}static defaults={};constructor(e,t){this.$el=jQuery(e);const o=this.constructor.defaults;this.options={...o,...t}}destroy(){this.deinit()}init(){}deinit(){}}const v=e=>({pageX:e.pageX,pageY:e.pageY,target:e.target,originalEvent:e}),S=(e,t)=>({pageX:e.pageX,pageY:e.pageY,target:e.target,originalEvent:t});class N extends f{init(){const e=this.$el.get(0);e&&(e.addEventListener("mousedown",this.mouseDown,{passive:!1}),e.addEventListener("touchstart",this.touchStart,{passive:!1})),this.isMouseStarted=!1,this.mouseDelayTimer=null,this.isMouseDelayMet=!1,this.mouseDownInfo=null}deinit(){const e=this.$el.get(0);e&&(e.removeEventListener("mousedown",this.mouseDown,{passive:!1}),e.removeEventListener("touchstart",this.touchStart,{passive:!1})),this.removeMouseMoveEventListeners()}mouseDown=e=>{if(0!==e.button)return;this.handleMouseDown(v(e))&&e.cancelable&&e.preventDefault()};handleMouseDown(e){return this.isMouseStarted&&this.handleMouseUp(e),this.mouseDownInfo=e,!!this.mouseCapture(e)&&(this.handleStartMouse(),!0)}handleStartMouse(){document.addEventListener("mousemove",this.mouseMove,{passive:!1}),document.addEventListener("touchmove",this.touchMove,{passive:!1}),document.addEventListener("mouseup",this.mouseUp,{passive:!1}),document.addEventListener("touchend",this.touchEnd,{passive:!1});const e=this.getMouseDelay();e?this.startMouseDelayTimer(e):this.isMouseDelayMet=!0}startMouseDelayTimer(e){this.mouseDelayTimer&&clearTimeout(this.mouseDelayTimer),this.mouseDelayTimer=window.setTimeout((()=>{this.mouseDownInfo&&(this.isMouseDelayMet=!0)}),e),this.isMouseDelayMet=!1}mouseMove=e=>{this.handleMouseMove(e,v(e))};handleMouseMove(e,t){if(this.isMouseStarted)return this.mouseDrag(t),void(e.cancelable&&e.preventDefault());this.isMouseDelayMet&&(this.mouseDownInfo&&(this.isMouseStarted=!1!==this.mouseStart(this.mouseDownInfo)),this.isMouseStarted?(this.mouseDrag(t),e.cancelable&&e.preventDefault()):this.handleMouseUp(t))}mouseUp=e=>{this.handleMouseUp(v(e))};handleMouseUp(e){this.removeMouseMoveEventListeners(),this.isMouseDelayMet=!1,this.mouseDownInfo=null,this.isMouseStarted&&(this.isMouseStarted=!1,this.mouseStop(e))}removeMouseMoveEventListeners(){document.removeEventListener("mousemove",this.mouseMove,{passive:!1}),document.removeEventListener("touchmove",this.touchMove,{passive:!1}),document.removeEventListener("mouseup",this.mouseUp,{passive:!1}),document.removeEventListener("touchend",this.touchEnd,{passive:!1})}touchStart=e=>{if(!e)return;if(e.touches.length>1)return;const t=e.changedTouches[0];t&&this.handleMouseDown(S(t,e))};touchMove=e=>{if(!e)return;if(e.touches.length>1)return;const t=e.changedTouches[0];t&&this.handleMouseMove(e,S(t,e))};touchEnd=e=>{if(!e)return;if(e.touches.length>1)return;const t=e.changedTouches[0];t&&this.handleMouseUp(S(t,e))}}class E{constructor(e){let{addToSelection:t,getNodeById:o,getSelectedNodes:n,getTree:s,onGetStateFromStorage:r,onSetStateFromStorage:i,openNode:l,refreshElements:d,removeFromSelection:a,saveState:h}=e;this.addToSelection=t,this.getNodeById=o,this.getSelectedNodes=n,this.getTree=s,this.onGetStateFromStorage=r,this.onSetStateFromStorage=i,this.openNode=l,this.refreshElements=d,this.removeFromSelection=a,this.saveStateOption=h}saveState(){const e=JSON.stringify(this.getState());this.onSetStateFromStorage?this.onSetStateFromStorage(e):this.supportsLocalStorage()&&localStorage.setItem(this.getKeyName(),e)}getStateFromStorage(){const e=this.loadFromStorage();return e?this.parseState(e):null}getState(){return{open_nodes:(()=>{const e=[];return this.getTree()?.iterate((t=>(t.is_open&&t.id&&t.hasChildren()&&e.push(t.id),!0))),e})(),selected_node:(()=>{const e=[];return this.getSelectedNodes().forEach((t=>{null!=t.id&&e.push(t.id)})),e})()}}setInitialState(e){if(e){let t=!1;return e.open_nodes&&(t=this.openInitialNodes(e.open_nodes)),e.selected_node&&(this.resetSelection(),this.selectInitialNodes(e.selected_node)),t}return!1}setInitialStateOnDemand(e,t){e?this.doSetInitialStateOnDemand(e.open_nodes,e.selected_node,t):t()}getNodeIdToBeSelected(){const e=this.getStateFromStorage();return e&&e.selected_node&&e.selected_node[0]||null}parseState(e){const t=JSON.parse(e);var o;return t&&t.selected_node&&("number"==typeof(o=t.selected_node)&&o%1==0)&&(t.selected_node=[t.selected_node]),t}loadFromStorage(){return this.onGetStateFromStorage?this.onGetStateFromStorage():this.supportsLocalStorage()?localStorage.getItem(this.getKeyName()):null}openInitialNodes(e){let t=!1;for(const o of e){const e=this.getNodeById(o);e&&(e.load_on_demand?t=!0:e.is_open=!0)}return t}selectInitialNodes(e){let t=0;for(const o of e){const e=this.getNodeById(o);e&&(t+=1,this.addToSelection(e))}return 0!==t}resetSelection(){this.getSelectedNodes().forEach((e=>{this.removeFromSelection(e)}))}doSetInitialStateOnDemand(e,t,o){let n=0,s=e;const r=()=>{const e=[];for(const t of s){const o=this.getNodeById(t);o?o.is_loading||(o.load_on_demand?i(o):this.openNode(o,!1)):e.push(t)}s=e,this.selectInitialNodes(t)&&this.refreshElements(null),0===n&&o()},i=e=>{n+=1,this.openNode(e,!1,(()=>{n-=1,r()}))};r()}getKeyName(){return"string"==typeof this.saveStateOption?this.saveStateOption:"tree"}supportsLocalStorage(){return null==this._supportsLocalStorage&&(this._supportsLocalStorage=(()=>{if(null==localStorage)return!1;try{const e="_storage_test";sessionStorage.setItem(e,"value"),sessionStorage.removeItem(e)}catch(e){return!1}return!0})()),this._supportsLocalStorage}}class D{constructor(e){let{$container:t,refreshHitAreas:o}=e;this.$container=t,this.refreshHitAreas=o}checkHorizontalScrolling(e){const t=this.getNewHorizontalScrollDirection(e);this.horizontalScrollDirection!==t&&(this.horizontalScrollDirection=t,null!=this.horizontalScrollTimeout&&window.clearTimeout(this.verticalScrollTimeout),t&&(this.horizontalScrollTimeout=window.setTimeout(this.scrollHorizontally.bind(this),40)))}checkVerticalScrolling(e){const t=this.getNewVerticalScrollDirection(e);this.verticalScrollDirection!==t&&(this.verticalScrollDirection=t,null!=this.verticalScrollTimeout&&(window.clearTimeout(this.verticalScrollTimeout),this.verticalScrollTimeout=void 0),t&&(this.verticalScrollTimeout=window.setTimeout(this.scrollVertically.bind(this),40)))}getScrollLeft(){return this.$container.scrollLeft()||0}scrollToY(e){this.$container.get(0).scrollTop=e}stopScrolling(){this.horizontalScrollDirection=void 0,this.verticalScrollDirection=void 0,this.scrollParentTop=void 0,this.scrollParentBottom=void 0}getNewHorizontalScrollDirection(e){const t=this.$container.offset();if(!t)return;const o=this.$container.get(0),n=t.left+o.clientWidth,s=t.left;return e>n-20?"right":e<s+20?"left":void 0}getNewVerticalScrollDirection(e){return e<this.getScrollParentTop()?"top":e>this.getScrollParentBottom()?"bottom":void 0}scrollHorizontally(){if(!this.horizontalScrollDirection)return;const e="left"===this.horizontalScrollDirection?-20:20;this.$container.get(0).scrollBy({left:e,top:0,behavior:"instant"}),this.refreshHitAreas(),setTimeout(this.scrollHorizontally.bind(this),40)}scrollVertically(){if(!this.verticalScrollDirection)return;const e="top"===this.verticalScrollDirection?-20:20;this.$container.get(0).scrollBy({left:0,top:e,behavior:"instant"}),this.refreshHitAreas(),setTimeout(this.scrollVertically.bind(this),40)}getScrollParentTop(){return null==this.scrollParentTop&&(this.scrollParentTop=this.$container.offset()?.top||0),this.scrollParentTop}getScrollParentBottom(){return null==this.scrollParentBottom&&(this.scrollParentBottom=this.getScrollParentTop()+(this.$container.innerHeight()??0)),this.scrollParentBottom}}class y{constructor(e,t){this.$element=e,this.refreshHitAreas=t}checkHorizontalScrolling(e){const t=this.getNewHorizontalScrollDirection(e);this.horizontalScrollDirection!==t&&(this.horizontalScrollDirection=t,null!=this.horizontalScrollTimeout&&window.clearTimeout(this.horizontalScrollTimeout),t&&(this.horizontalScrollTimeout=window.setTimeout(this.scrollHorizontally.bind(this),40)))}checkVerticalScrolling(e){const t=this.getNewVerticalScrollDirection(e);this.verticalScrollDirection!==t&&(this.verticalScrollDirection=t,null!=this.verticalScrollTimeout&&(window.clearTimeout(this.verticalScrollTimeout),this.verticalScrollTimeout=void 0),t&&(this.verticalScrollTimeout=window.setTimeout(this.scrollVertically.bind(this),40)))}getScrollLeft(){return document.documentElement.scrollLeft}scrollToY(e){const t=this.$element.offset(),o=t?t.top:0;jQuery(document).scrollTop(e+o)}stopScrolling(){this.horizontalScrollDirection=void 0,this.verticalScrollDirection=void 0,this.documentScrollHeight=void 0,this.documentScrollWidth=void 0}getNewHorizontalScrollDirection(e){const t=e-(jQuery(document).scrollLeft()||0)<20;return e>(jQuery(window).width()||0)-20&&this.canScrollRight()?"right":t?"left":void 0}canScrollRight(){const e=document.documentElement;return e.scrollLeft+e.clientWidth<this.getDocumentScrollWidth()}canScrollDown(){const e=document.documentElement;return e.scrollTop+e.clientHeight<this.getDocumentScrollHeight()}getDocumentScrollHeight(){return null==this.documentScrollHeight&&(this.documentScrollHeight=document.documentElement.scrollHeight),this.documentScrollHeight}getDocumentScrollWidth(){return null==this.documentScrollWidth&&(this.documentScrollWidth=document.documentElement.scrollWidth),this.documentScrollWidth}getNewVerticalScrollDirection(e){const t=jQuery(document).scrollTop()||0;if(e-t<20)return"top";return(jQuery(window).height()||0)-(e-t)<20&&this.canScrollDown()?"bottom":void 0}scrollHorizontally(){if(!this.horizontalScrollDirection)return;const e="left"===this.horizontalScrollDirection?-20:20;window.scrollBy({left:e,top:0,behavior:"instant"}),this.refreshHitAreas(),setTimeout(this.scrollHorizontally.bind(this),40)}scrollVertically(){if(!this.verticalScrollDirection)return;const e="top"===this.verticalScrollDirection?-20:20;window.scrollBy({left:0,top:e,behavior:"instant"}),this.refreshHitAreas(),setTimeout(this.scrollVertically.bind(this),40)}}const I=e=>{for(const t of["overflow","overflow-y"]){const o=e.css(t);if("auto"===o||"scroll"===o)return!0}return!1},b=(e,t)=>{const o=(e=>{if(I(e))return e;for(const t of e.parents().get()){const e=jQuery(t);if(I(e))return e}return null})(e);return o?.length&&"HTML"!==o[0]?.tagName?new D({$container:o,refreshHitAreas:t,$treeElement:e}):new y(e,t)};class F{constructor(e){let{refreshHitAreas:t,$treeElement:o}=e;this.refreshHitAreas=t,this.scrollParent=void 0,this.$treeElement=o}checkScrolling(e){this.checkVerticalScrolling(e),this.checkHorizontalScrolling(e)}stopScrolling(){this.getScrollParent().stopScrolling()}scrollToY(e){this.getScrollParent().scrollToY(e)}getScrollLeft(){return this.getScrollParent().getScrollLeft()}checkVerticalScrolling(e){null!=e.pageY&&this.getScrollParent().checkVerticalScrolling(e.pageY)}checkHorizontalScrolling(e){null!=e.pageX&&this.getScrollParent().checkHorizontalScrolling(e.pageX)}getScrollParent(){return this.scrollParent||(this.scrollParent=b(this.$treeElement,this.refreshHitAreas)),this.scrollParent}}class T{constructor(e){let{getNodeById:t}=e;this.getNodeById=t,this.selectedNodes=new Set,this.clear()}getSelectedNode(){const e=this.getSelectedNodes();return e.length&&e[0]||!1}getSelectedNodes(){if(this.selectedSingleNode)return[this.selectedSingleNode];{const e=[];return this.selectedNodes.forEach((t=>{const o=this.getNodeById(t);o&&e.push(o)})),e}}getSelectedNodesUnder(e){if(this.selectedSingleNode)return e.isParentOf(this.selectedSingleNode)?[this.selectedSingleNode]:[];{const t=[];for(const o in this.selectedNodes)if(Object.prototype.hasOwnProperty.call(this.selectedNodes,o)){const n=this.getNodeById(o);n&&e.isParentOf(n)&&t.push(n)}return t}}isNodeSelected(e){return null!=e.id?this.selectedNodes.has(e.id):!!this.selectedSingleNode&&this.selectedSingleNode.element===e.element}clear(){this.selectedNodes.clear(),this.selectedSingleNode=null}removeFromSelection(e){let t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];null==e.id?this.selectedSingleNode&&e.element===this.selectedSingleNode.element&&(this.selectedSingleNode=null):(this.selectedNodes.delete(e.id),t&&e.iterate((()=>(null!=e.id&&this.selectedNodes.delete(e.id),!0))))}addToSelection(e){null!=e.id?this.selectedNodes.add(e.id):this.selectedSingleNode=e}}class C{constructor(e,t){const o=e.querySelector(":scope > .jqtree-element");if(!o)return void(this.hint=void 0);const n=Math.max(e.offsetWidth+t-4,0),s=Math.max(e.clientHeight-4,0),r=document.createElement("span");r.className="jqtree-border",r.style.width=`${n}px`,r.style.height=`${s}px`,this.hint=r,o.append(this.hint)}remove(){this.hint?.remove()}}class _{constructor(e,t,n){this.element=t,this.node=e,this.ghost=this.createGhostElement(),n===o.After?this.moveAfter():n===o.Before?this.moveBefore():n===o.Inside&&(e.isFolder()&&e.is_open?this.moveInsideOpenFolder():this.moveInside())}remove(){this.ghost.remove()}moveAfter(){this.element.after(this.ghost)}moveBefore(){this.element.before(this.ghost)}moveInsideOpenFolder(){const e=this.node.children[0]?.element;e&&e.before(this.ghost)}moveInside(){this.element.after(this.ghost),this.ghost.classList.add("jqtree-inside")}createGhostElement(){const e=document.createElement("li");e.className="jqtree_common jqtree-ghost";const t=document.createElement("span");t.className="jqtree_common jqtree-circle",e.append(t);const o=document.createElement("span");return o.className="jqtree_common jqtree-line",e.append(o),e}}class L{constructor(e){let{getScrollLeft:t,node:o,tabIndex:n,$treeElement:s}=e;this.getScrollLeft=t,this.tabIndex=n,this.$treeElement=s,this.init(o)}init(e){if(this.node=e,!e.element){const t=this.$treeElement.get(0);t&&(e.element=t)}e.element&&(this.element=e.element)}addDropHint(e){return this.mustShowBorderDropHint(e)?new C(this.element,this.getScrollLeft()):new _(this.node,this.element,e)}select(e){this.element.classList.add("jqtree-selected");const t=this.getTitleSpan(),o=this.tabIndex;null!=o&&t.setAttribute("tabindex",o.toString()),t.setAttribute("aria-selected","true"),e&&t.focus()}deselect(){this.element.classList.remove("jqtree-selected");const e=this.getTitleSpan();e.removeAttribute("tabindex"),e.setAttribute("aria-selected","false"),e.blur()}getUl(){return this.element.querySelector(":scope > ul")}getTitleSpan(){return this.element.querySelector(":scope > .jqtree-element > span.jqtree-title")}mustShowBorderDropHint(e){return e===o.Inside}}class w extends L{constructor(e){let{closedIconElement:t,getScrollLeft:o,node:n,openedIconElement:s,tabIndex:r,$treeElement:i,triggerEvent:l}=e;super({getScrollLeft:o,node:n,tabIndex:r,$treeElement:i}),this.closedIconElement=t,this.openedIconElement=s,this.triggerEvent=l}open(e){let t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"fast";if(this.node.is_open)return;this.node.is_open=!0;const n=this.getButton();n.classList.remove("jqtree-closed"),n.innerHTML="";const s=this.openedIconElement;if(s){const e=s.cloneNode(!0);n.appendChild(e)}const r=()=>{this.element.classList.remove("jqtree-closed");this.getTitleSpan().setAttribute("aria-expanded","true"),e&&e(this.node),this.triggerEvent("tree.open",{node:this.node})};t?jQuery(this.getUl()).slideDown(o,r):(jQuery(this.getUl()).show(),r())}close(){let e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0],t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"fast";if(!this.node.is_open)return;this.node.is_open=!1;const o=this.getButton();o.classList.add("jqtree-closed"),o.innerHTML="";const n=this.closedIconElement;if(n){const e=n.cloneNode(!0);o.appendChild(e)}const s=()=>{this.element.classList.add("jqtree-closed");this.getTitleSpan().setAttribute("aria-expanded","false"),this.triggerEvent("tree.close",{node:this.node})};e?jQuery(this.getUl()).slideUp(t,s):(jQuery(this.getUl()).hide(),s())}mustShowBorderDropHint(e){return!this.node.is_open&&e===o.Inside}getButton(){return this.element.querySelector(":scope > .jqtree-element > a.jqtree-toggler")}}const H="Node parameter is empty",A="Parameter is empty: ";class M extends N{static defaults={animationSpeed:"fast",autoEscape:!0,autoOpen:!1,buttonLeft:!0,closedIcon:void 0,data:void 0,dataFilter:void 0,dataUrl:void 0,dragAndDrop:!1,keyboardSupport:!0,nodeClass:r,onCanMove:void 0,onCanMoveTo:void 0,onCanSelectNode:void 0,onCreateLi:void 0,onDragMove:void 0,onDragStop:void 0,onGetStateFromStorage:void 0,onIsMoveHandle:void 0,onLoadFailed:void 0,onLoading:void 0,onSetStateFromStorage:void 0,openedIcon:"&#x25bc;",openFolderDelay:500,rtl:void 0,saveState:!1,selectable:!0,showEmptyFolder:!1,slide:!0,startDndDelay:300,tabIndex:0,useContextMenu:!0};toggle(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(!e)throw Error(H);const o=t??this.options.slide;return e.is_open?this.closeNode(e,o):this.openNode(e,o),this.element}getTree(){return this.tree}selectNode(e,t){return this.doSelectNode(e,t),this.element}getSelectedNode(){return this.selectNodeHandler.getSelectedNode()}toJson(){return JSON.stringify(this.tree.getData())}loadData(e,t){return this.doLoadData(e,t),this.element}loadDataFromUrl(e,t,o){return"string"==typeof e?this.doLoadDataFromUrl(e,t,o??null):this.doLoadDataFromUrl(null,e,t),this.element}reload(e){return this.doLoadDataFromUrl(null,null,e),this.element}refresh(){return this._refreshElements(null),this.element}getNodeById(e){return this.tree.getNodeById(e)}getNodeByName(e){return this.tree.getNodeByName(e)}getNodeByNameMustExist(e){return this.tree.getNodeByNameMustExist(e)}getNodesByProperty(e,t){return this.tree.getNodesByProperty(e,t)}getNodeByHtmlElement(e){const t=e instanceof HTMLElement?e:e[0];return t?this.getNode(t):null}getNodeByCallback(e){return this.tree.getNodeByCallback(e)}openNode(e,t,o){if(!e)throw Error(H);const[n,s]=(()=>{let e,n;return"function"==typeof t?(e=t,n=null):(n=t,e=o),null==n&&(n=this.options.slide??!1),[n,e]})();return this._openNode(e,n,s),this.element}closeNode(e,t){if(!e)throw Error(H);const o=t??this.options.slide;return(e.isFolder()||e.isEmptyFolder)&&(this.createFolderElement(e).close(o,this.options.animationSpeed),this.saveState()),this.element}isDragging(){return this.dndHandler.isDragging}refreshHitAreas(){return this.dndHandler.refresh(),this.element}addNodeAfter(e,t){const o=t.addAfter(e);return o&&this._refreshElements(t.parent),o}addNodeBefore(e,t){if(!t)throw Error(A+"existingNode");const o=t.addBefore(e);return o&&this._refreshElements(t.parent),o}addParentNode(e,t){if(!t)throw Error(A+"existingNode");const o=t.addParent(e);return o&&this._refreshElements(o.parent),o}removeNode(e){if(!e)throw Error(H);if(!e.parent)throw Error("Node has no parent");this.selectNodeHandler.removeFromSelection(e,!0);const t=e.parent;return e.remove(),this._refreshElements(t),this.element}appendNode(e,t){const o=t||this.tree,n=o.append(e);return this._refreshElements(o),n}prependNode(e,t){const o=t??this.tree,n=o.prepend(e);return this._refreshElements(o),n}updateNode(e,t){if(!e)throw Error(H);const o="object"==typeof t&&t.id&&t.id!==e.id;return o&&this.tree.removeNodeFromIndex(e),e.setData(t),o&&this.tree.addNodeToIndex(e),"object"==typeof t&&t.children&&t.children instanceof Array&&(e.removeChildren(),t.children.length&&e.loadFromData(t.children)),this._refreshElements(e),this.element}isSelectedNodeInSubtree(e){const t=this.getSelectedNode();return!!t&&(e===t||e.isParentOf(t))}moveNode(e,t,o){if(!e)throw Error(H);if(!t)throw Error(A+"targetNode");const s=n[o];return void 0!==s&&(this.tree.moveNode(e,t,s),this._refreshElements(null)),this.element}getStateFromStorage(){return this.saveStateHandler.getStateFromStorage()}addToSelection(e,t){if(!e)throw Error(H);return this.selectNodeHandler.addToSelection(e),this.openParents(e),this._getNodeElementForNode(e).select(void 0===t||t),this.saveState(),this.element}getSelectedNodes(){return this.selectNodeHandler.getSelectedNodes()}isNodeSelected(e){if(!e)throw Error(H);return this.selectNodeHandler.isNodeSelected(e)}removeFromSelection(e){if(!e)throw Error(H);return this.selectNodeHandler.removeFromSelection(e),this._getNodeElementForNode(e).deselect(),this.saveState(),this.element}scrollToNode(e){if(!e)throw Error(H);const t=(jQuery(e.element).offset()?.top??0)-(this.$el.offset()?.top??0);return this.scrollHandler.scrollToY(t),this.element}getState(){return this.saveStateHandler.getState()}setState(e){return this.saveStateHandler.setInitialState(e),this._refreshElements(null),this.element}setOption(e,t){return this.options[e]=t,this.element}moveDown(){const e=this.getSelectedNode();return e&&this.keyHandler.moveDown(e),this.element}moveUp(){const e=this.getSelectedNode();return e&&this.keyHandler.moveUp(e),this.element}getVersion(){return"1.8.0"}_triggerEvent(e,t){const o=jQuery.Event(e,t);return this.element.trigger(o),o}_openNode(e){let t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],o=arguments.length>2?arguments[2]:void 0;const n=(e,t,o)=>{this.createFolderElement(e).open(o,t,this.options.animationSpeed)};if(e.isFolder()||e.isEmptyFolder)if(e.load_on_demand)this.loadFolderOnDemand(e,t,o);else{let s=e.parent;for(;s;)s.parent&&n(s,!1),s=s.parent;n(e,t,o),this.saveState()}}_refreshElements(e){const t=this.isFocusOnTree(),o=!!e&&this.isSelectedNodeInSubtree(e);this.renderer.render(e),o&&this.selectCurrentNode(t),this._triggerEvent("tree.refresh")}_getNodeElementForNode(e){return e.isFolder()?this.createFolderElement(e):this.createNodeElement(e)}_getNodeElement(e){const t=this.getNode(e);return t?this._getNodeElementForNode(t):null}_getScrollLeft(){return this.scrollHandler.getScrollLeft()}init(){super.init(),this.element=this.$el,this.isInitialized=!1,this.options.rtl=this.getRtlOption(),null==this.options.closedIcon&&(this.options.closedIcon=this.getDefaultClosedIcon()),this.connectHandlers(),this.initData(),this.element.on("click",this.handleClick),this.element.on("dblclick",this.handleDblclick),this.options.useContextMenu&&this.element.on("contextmenu",this.handleContextmenu)}deinit(){this.element.empty(),this.element.off(),this.keyHandler.deinit(),this.tree=new r({},!0),super.deinit()}mouseCapture(e){return!!this.options.dragAndDrop&&this.dndHandler.mouseCapture(e)}mouseStart(e){return!!this.options.dragAndDrop&&this.dndHandler.mouseStart(e)}mouseDrag(e){if(this.options.dragAndDrop){const t=this.dndHandler.mouseDrag(e);return this.scrollHandler.checkScrolling(e),t}return!1}mouseStop(e){return!!this.options.dragAndDrop&&(this.scrollHandler.stopScrolling(),this.dndHandler.mouseStop(e))}getMouseDelay(){return this.options.startDndDelay??0}initData(){if(this.options.data)this.doLoadData(this.options.data,null);else{this.getDataUrlInfo(null)?this.doLoadDataFromUrl(null,null,null):this.doLoadData([],null)}}getDataUrlInfo(e){const t=this.options.dataUrl||this.element.data("url"),o=t=>{if(e?.id){const o={node:e.id};t.data=o}else{const e=this.getNodeIdToBeSelected();if(e){const o={selected_node:e};t.data=o}}};return"function"==typeof t?t(e):"string"==typeof t?(e=>{const t={url:e};return o(t),t})(t):t&&"object"==typeof t?(o(t),t):null}getNodeIdToBeSelected(){return this.options.saveState?this.saveStateHandler.getNodeIdToBeSelected():null}initTree(e){const t=()=>{this.isInitialized||(this.isInitialized=!0,this._triggerEvent("tree.init"))};if(!this.options.nodeClass)return;this.tree=new this.options.nodeClass(null,!0,this.options.nodeClass),this.selectNodeHandler.clear(),this.tree.loadFromData(e);const o=this.setInitialState();this._refreshElements(null),o?this.setInitialStateOnDemand(t):t()}setInitialState(){const e=()=>{if(!1===this.options.autoOpen)return!1;const e=this.getAutoOpenMaxLevel();let t=!1;return this.tree.iterate(((o,n)=>o.load_on_demand?(t=!0,!1):!!o.hasChildren()&&(o.is_open=!0,n!==e))),t};let[t,o]=(()=>{if(this.options.saveState){const e=this.saveStateHandler.getStateFromStorage();if(e){return[!0,this.saveStateHandler.setInitialState(e)]}return[!1,!1]}return[!1,!1]})();return t||(o=e()),o}setInitialStateOnDemand(e){const t=()=>{const t=this.getAutoOpenMaxLevel();let o=0;const n=e=>{o+=1,this._openNode(e,!1,(()=>{o-=1,s()}))},s=()=>{this.tree.iterate(((e,o)=>e.load_on_demand?(e.is_loading||n(e),!1):(this._openNode(e,!1),o!==t))),0===o&&e()};s()};(()=>{if(this.options.saveState){const t=this.saveStateHandler.getStateFromStorage();return!!t&&(this.saveStateHandler.setInitialStateOnDemand(t,e),!0)}return!1})()||t()}getAutoOpenMaxLevel(){return!0===this.options.autoOpen?-1:"number"==typeof this.options.autoOpen?this.options.autoOpen:"string"==typeof this.options.autoOpen?parseInt(this.options.autoOpen,10):0}handleClick=e=>{const t=this.getClickTarget(e.target);if(t)if("button"===t.type)this.toggle(t.node,this.options.slide),e.preventDefault(),e.stopPropagation();else if("label"===t.type){const o=t.node;this._triggerEvent("tree.click",{node:o,click_event:e}).isDefaultPrevented()||this.doSelectNode(o)}};handleDblclick=e=>{const t=this.getClickTarget(e.target);"label"===t?.type&&this._triggerEvent("tree.dblclick",{node:t.node,click_event:e})};getClickTarget(e){const t=e.closest(".jqtree-toggler");if(t){const e=this.getNode(t);if(e)return{type:"button",node:e}}else{const t=e.closest(".jqtree-element");if(t){const e=this.getNode(t);if(e)return{type:"label",node:e}}}return null}getNode(e){const t=e.closest("li.jqtree_common");return t?jQuery(t).data("node"):null}handleContextmenu=e=>{const t=e.target.closest("ul.jqtree-tree .jqtree-element");if(t){const o=this.getNode(t);if(o)return e.preventDefault(),e.stopPropagation(),this._triggerEvent("tree.contextmenu",{node:o,click_event:e}),!1}return null};saveState(){this.options.saveState&&this.saveStateHandler.saveState()}selectCurrentNode(e){const t=this.getSelectedNode();if(t){const o=this._getNodeElementForNode(t);o&&o.select(e)}}deselectCurrentNode(){const e=this.getSelectedNode();e&&this.removeFromSelection(e)}getDefaultClosedIcon(){return this.options.rtl?"&#x25c0;":"&#x25ba;"}getRtlOption(){if(null!=this.options.rtl)return this.options.rtl;{const e=this.element.data("rtl");return null!==e&&!1!==e&&void 0!==e}}doSelectNode(e,t){const o=()=>{this.options.saveState&&this.saveStateHandler.saveState()};if(!e)return this.deselectCurrentNode(),void o();const n={mustSetFocus:!0,mustToggle:!0,...t||{}};if((()=>this.options.onCanSelectNode?!0===this.options.selectable&&this.options.onCanSelectNode(e):!0===this.options.selectable)()){if(this.selectNodeHandler.isNodeSelected(e))n.mustToggle&&(this.deselectCurrentNode(),this._triggerEvent("tree.select",{node:null,previous_node:e}));else{const t=this.getSelectedNode()||null;this.deselectCurrentNode(),this.addToSelection(e,n.mustSetFocus),this._triggerEvent("tree.select",{node:e,deselected_node:t}),this.openParents(e)}o()}}doLoadData(e,t){e&&(t?(this.deselectNodes(t),this.loadSubtree(e,t)):this.initTree(e),this.isDragging()&&this.dndHandler.refresh()),this._triggerEvent("tree.load_data",{tree_data:e,parent_node:t})}deselectNodes(e){const t=this.selectNodeHandler.getSelectedNodesUnder(e);for(const e of t)this.selectNodeHandler.removeFromSelection(e)}loadSubtree(e,t){t.loadFromData(e),t.load_on_demand=!1,t.is_loading=!1,this._refreshElements(t)}doLoadDataFromUrl(e,t,o){const n=e||this.getDataUrlInfo(t);this.dataLoader.loadFromUrl(n,t,o)}loadFolderOnDemand(e){let t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],o=arguments.length>2?arguments[2]:void 0;e.is_loading=!0,this.doLoadDataFromUrl(null,e,(()=>{this._openNode(e,t,o)}))}containsElement(e){const t=this.getNode(e);return null!=t&&t.tree===this.tree}isFocusOnTree(){const e=document.activeElement;return Boolean(e&&"SPAN"===e.tagName&&this.containsElement(e))}connectHandlers(){const{autoEscape:e,buttonLeft:t,closedIcon:o,dataFilter:n,dragAndDrop:s,keyboardSupport:r,onCanMove:i,onCreateLi:l,onDragMove:d,onDragStop:a,onGetStateFromStorage:h,onIsMoveHandle:p,onLoadFailed:f,onLoading:v,onSetStateFromStorage:S,openedIcon:N,openFolderDelay:D,rtl:y,saveState:I,showEmptyFolder:b,slide:C,tabIndex:_}=this.options,L=this.closeNode.bind(this),w=this._getNodeElement.bind(this),H=this._getNodeElementForNode.bind(this),A=this.getNodeById.bind(this),M=this._getScrollLeft.bind(this),j=this.getSelectedNode.bind(this),P=this.getTree.bind(this),x=this.isFocusOnTree.bind(this),B=this.loadData.bind(this),O=this._openNode.bind(this),q=this._refreshElements.bind(this),$=this.refreshHitAreas.bind(this),k=this.selectNode.bind(this),U=this.element,z=this._triggerEvent.bind(this),Q=new T({getNodeById:A}),V=Q.addToSelection.bind(Q),Y=Q.getSelectedNodes.bind(Q),G=Q.isNodeSelected.bind(Q),R=Q.removeFromSelection.bind(Q),X=new m({dataFilter:n,loadData:B,onLoadFailed:f,onLoading:v,$treeElement:U,triggerEvent:z}),K=new E({addToSelection:V,getNodeById:A,getSelectedNodes:Y,getTree:P,onGetStateFromStorage:h,onSetStateFromStorage:S,openNode:O,refreshElements:q,removeFromSelection:R,saveState:I}),W=new c({autoEscape:e,getNodeElement:w,getNodeElementForNode:H,getScrollLeft:M,getTree:P,onCanMove:i,onDragMove:d,onDragStop:a,onIsMoveHandle:p,openFolderDelay:D,openNode:O,refreshElements:q,slide:C,$treeElement:U,triggerEvent:z}),J=new F({refreshHitAreas:$,$treeElement:U}),Z=new g({closeNode:L,getSelectedNode:j,isFocusOnTree:x,keyboardSupport:r,openNode:O,selectNode:k}),ee=new u({autoEscape:e,buttonLeft:t,closedIcon:o,dragAndDrop:s,$element:U,getTree:P,isNodeSelected:G,onCreateLi:l,openedIcon:N,rtl:y,showEmptyFolder:b,tabIndex:_});this.dataLoader=X,this.dndHandler=W,this.keyHandler=Z,this.renderer=ee,this.saveStateHandler=K,this.scrollHandler=J,this.selectNodeHandler=Q}createFolderElement(e){const t=this.renderer.closedIconElement,o=this._getScrollLeft.bind(this),n=this.renderer.openedIconElement,s=this.options.tabIndex,r=this.element,i=this._triggerEvent.bind(this);return new w({closedIconElement:t,getScrollLeft:o,node:e,openedIconElement:n,tabIndex:s,$treeElement:r,triggerEvent:i})}createNodeElement(e){const t=this._getScrollLeft.bind(this),o=this.options.tabIndex,n=this.element;return new L({getScrollLeft:t,node:e,tabIndex:o,$treeElement:n})}openParents(e){const t=e.parent;t&&t.parent&&!t.is_open&&this.openNode(t,!1)}}return f.register(M,"tree"),e.JqTreeWidget=M,e}({});
//# sourceMappingURL=tree.jquery.js.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";

// EXTERNAL MODULE: ./node_modules/.pnpm/jqtree@1.8.0_jquery@3.7.1/node_modules/jqtree/tree.jquery.js
var tree_jquery = __webpack_require__(521);
;// CONCATENATED MODULE: ./node_modules/.pnpm/spin.js@4.1.1/node_modules/spin.js/spin.js
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var defaults = {
    lines: 12,
    length: 7,
    width: 5,
    radius: 10,
    scale: 1.0,
    corners: 1,
    color: '#000',
    fadeColor: 'transparent',
    animation: 'spinner-line-fade-default',
    rotate: 0,
    direction: 1,
    speed: 1,
    zIndex: 2e9,
    className: 'spinner',
    top: '50%',
    left: '50%',
    shadow: '0 0 1px transparent',
    position: 'absolute',
};
var Spinner = /** @class */ (function () {
    function Spinner(opts) {
        if (opts === void 0) { opts = {}; }
        this.opts = __assign(__assign({}, defaults), opts);
    }
    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target by calling
     * stop() internally.
     */
    Spinner.prototype.spin = function (target) {
        this.stop();
        this.el = document.createElement('div');
        this.el.className = this.opts.className;
        this.el.setAttribute('role', 'progressbar');
        css(this.el, {
            position: this.opts.position,
            width: 0,
            zIndex: this.opts.zIndex,
            left: this.opts.left,
            top: this.opts.top,
            transform: "scale(" + this.opts.scale + ")",
        });
        if (target) {
            target.insertBefore(this.el, target.firstChild || null);
        }
        drawLines(this.el, this.opts);
        return this;
    };
    /**
     * Stops and removes the Spinner.
     * Stopped spinners may be reused by calling spin() again.
     */
    Spinner.prototype.stop = function () {
        if (this.el) {
            if (typeof requestAnimationFrame !== 'undefined') {
                cancelAnimationFrame(this.animateId);
            }
            else {
                clearTimeout(this.animateId);
            }
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
            this.el = undefined;
        }
        return this;
    };
    return Spinner;
}());

/**
 * Sets multiple style properties at once.
 */
function css(el, props) {
    for (var prop in props) {
        el.style[prop] = props[prop];
    }
    return el;
}
/**
 * Returns the line color from the given string or array.
 */
function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length];
}
/**
 * Internal method that draws the individual lines.
 */
function drawLines(el, opts) {
    var borderRadius = (Math.round(opts.corners * opts.width * 500) / 1000) + 'px';
    var shadow = 'none';
    if (opts.shadow === true) {
        shadow = '0 2px 4px #000'; // default shadow
    }
    else if (typeof opts.shadow === 'string') {
        shadow = opts.shadow;
    }
    var shadows = parseBoxShadow(shadow);
    for (var i = 0; i < opts.lines; i++) {
        var degrees = ~~(360 / opts.lines * i + opts.rotate);
        var backgroundLine = css(document.createElement('div'), {
            position: 'absolute',
            top: -opts.width / 2 + "px",
            width: (opts.length + opts.width) + 'px',
            height: opts.width + 'px',
            background: getColor(opts.fadeColor, i),
            borderRadius: borderRadius,
            transformOrigin: 'left',
            transform: "rotate(" + degrees + "deg) translateX(" + opts.radius + "px)",
        });
        var delay = i * opts.direction / opts.lines / opts.speed;
        delay -= 1 / opts.speed; // so initial animation state will include trail
        var line = css(document.createElement('div'), {
            width: '100%',
            height: '100%',
            background: getColor(opts.color, i),
            borderRadius: borderRadius,
            boxShadow: normalizeShadow(shadows, degrees),
            animation: 1 / opts.speed + "s linear " + delay + "s infinite " + opts.animation,
        });
        backgroundLine.appendChild(line);
        el.appendChild(backgroundLine);
    }
}
function parseBoxShadow(boxShadow) {
    var regex = /^\s*([a-zA-Z]+\s+)?(-?\d+(\.\d+)?)([a-zA-Z]*)\s+(-?\d+(\.\d+)?)([a-zA-Z]*)(.*)$/;
    var shadows = [];
    for (var _i = 0, _a = boxShadow.split(','); _i < _a.length; _i++) {
        var shadow = _a[_i];
        var matches = shadow.match(regex);
        if (matches === null) {
            continue; // invalid syntax
        }
        var x = +matches[2];
        var y = +matches[5];
        var xUnits = matches[4];
        var yUnits = matches[7];
        if (x === 0 && !xUnits) {
            xUnits = yUnits;
        }
        if (y === 0 && !yUnits) {
            yUnits = xUnits;
        }
        if (xUnits !== yUnits) {
            continue; // units must match to use as coordinates
        }
        shadows.push({
            prefix: matches[1] || '',
            x: x,
            y: y,
            xUnits: xUnits,
            yUnits: yUnits,
            end: matches[8],
        });
    }
    return shadows;
}
/**
 * Modify box-shadow x/y offsets to counteract rotation
 */
function normalizeShadow(shadows, degrees) {
    var normalized = [];
    for (var _i = 0, shadows_1 = shadows; _i < shadows_1.length; _i++) {
        var shadow = shadows_1[_i];
        var xy = convertOffset(shadow.x, shadow.y, degrees);
        normalized.push(shadow.prefix + xy[0] + shadow.xUnits + ' ' + xy[1] + shadow.yUnits + shadow.end);
    }
    return normalized.join(', ');
}
function convertOffset(x, y, degrees) {
    var radians = degrees * Math.PI / 180;
    var sin = Math.sin(radians);
    var cos = Math.cos(radians);
    return [
        Math.round((x * cos + y * sin) * 1000) / 1000,
        Math.round((-x * sin + y * cos) * 1000) / 1000,
    ];
}

// EXTERNAL MODULE: ./node_modules/.pnpm/cookie@0.6.0/node_modules/cookie/index.js
var cookie = __webpack_require__(706);
;// CONCATENATED MODULE: ./django_mptt_admin.ts




// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access

function initTree($tree, _ref) {
  let {
    animationSpeed,
    autoOpen,
    autoEscape,
    csrfCookieName,
    dragAndDrop,
    hasAddPermission,
    hasChangePermission,
    mouseDelay,
    rtl
  } = _ref;
  let errorNode = null;
  const baseUrl = "http://example.com";
  const insertAtUrl = new URL($tree.data("insert_at_url"), baseUrl);
  function createLi(node, $li, isSelected) {
    // Create edit link
    const $title = $li.find(".jqtree-title");
    insertAtUrl.searchParams.set("insert_at", `${node.id}`);
    const insertUrlString = insertAtUrl.toString().substring(baseUrl.length);
    const tabindex = isSelected ? "0" : "-1";
    const editCaption = hasChangePermission ? gettext("edit") : gettext("view");
    $title.after(`<a href="${node.url}" class="edit" tabindex="${tabindex}">(${editCaption})</a>`, hasAddPermission ? `<a href="${insertUrlString}" class="edit" tabindex="${tabindex}">(${gettext("add")})</a>` : "");
  }
  function getCsrfToken() {
    function getFromMiddleware() {
      return document.querySelector('[name="csrfmiddlewaretoken"]').value;
    }
    function getFromCookie() {
      if (!csrfCookieName) {
        return null;
      } else {
        return cookie/* parse */.Q(document.cookie)[csrfCookieName];
      }
    }
    return getFromCookie() || getFromMiddleware();
  }
  function handleMove(eventParam) {
    const e = eventParam;
    const info = e.move_info;
    const data = {
      target_id: info.target_node.id,
      position: info.position
    };
    const $el = jQuery(info.moved_node.element);
    handleLoading(true, null, $el);
    removeErrorMessage();
    e.preventDefault();
    void jQuery.ajax({
      type: "POST",
      url: info.moved_node.move_url,
      data,
      beforeSend: xhr => {
        // Set Django csrf token
        xhr.setRequestHeader("X-CSRFToken", getCsrfToken());
      },
      success: () => {
        info.do_move();
        handleLoading(false, null, $el);
      },
      error: () => {
        handleLoading(false, null, $el);
        const $node = $el.find(".jqtree-element");
        $node.append(`<span class="mptt-admin-error">${gettext("move failed")}</span>`);
        errorNode = info.moved_node;
      }
    });
    function removeErrorMessage() {
      if (errorNode) {
        jQuery(errorNode.element).find(".mptt-admin-error").remove();
        errorNode = null;
      }
    }
  }
  function handleLoadFailed() {
    $tree.html(gettext("Error while loading the data from the server"));
  }
  const spinners = {};
  function handleLoading(isLoading, node, $el) {
    function getNodeId() {
      if (!node) {
        return "__root__";
      } else {
        return node.id;
      }
    }
    function getContainer() {
      if (node) {
        return $el.find(".jqtree-element")[0];
      } else {
        return $el[0];
      }
    }
    const nodeId = getNodeId();
    if (isLoading) {
      spinners[nodeId] = new Spinner().spin(getContainer());
    } else {
      const spinner = spinners[nodeId];
      if (spinner) {
        spinner.stop();
        spinners[nodeId] = null;
      }
    }
  }
  function handleSelect(eventParam) {
    const e = eventParam;
    const {
      node,
      deselected_node
    } = e;
    if (deselected_node) {
      // deselected node: remove tabindex
      jQuery(deselected_node.element).find(".edit").attr("tabindex", -1);
    }
    if (node) {
      // selected: add tabindex
      jQuery(node.element).find(".edit").attr("tabindex", 0);
    }
  }
  const treeOptions = {
    autoOpen,
    autoEscape,
    buttonLeft: rtl,
    closedIcon: rtl ? "&#x25c0;" : "&#x25ba;",
    dragAndDrop: dragAndDrop && hasChangePermission,
    onCreateLi: createLi,
    onLoadFailed: handleLoadFailed,
    onLoading: handleLoading,
    saveState: $tree.data("save_state"),
    useContextMenu: Boolean($tree.data("use_context_menu"))
  };
  if (animationSpeed !== null) {
    treeOptions["animationSpeed"] = animationSpeed;
  }
  if (mouseDelay != null) {
    treeOptions["startDndDelay"] = mouseDelay;
  }
  $tree.tree(treeOptions);
  $tree.on("tree.move", handleMove);
  $tree.on("tree.select", handleSelect);
}
jQuery(() => {
  const $tree = jQuery("#tree");
  if ($tree.length) {
    const animationSpeed = $tree.data("tree-animation-speed");
    const autoOpen = $tree.data("auto_open");
    const autoEscape = Boolean($tree.data("autoescape"));
    const hasAddPermission = Boolean($tree.data("has-add-permission"));
    const hasChangePermission = Boolean($tree.data("has-change-permission"));
    const mouseDelay = $tree.data("tree-mouse-delay");
    const dragAndDrop = $tree.data("drag-and-drop");
    const rtl = $tree.data("rtl") === "1";
    const csrfCookieName = $tree.data("csrf-cookie-name");
    initTree($tree, {
      animationSpeed,
      autoOpen,
      autoEscape,
      csrfCookieName,
      dragAndDrop,
      hasAddPermission,
      hasChangePermission,
      mouseDelay,
      rtl
    });
  }
});
})();

/******/ })()
;
//# sourceMappingURL=django_mptt_admin.debug.js.map