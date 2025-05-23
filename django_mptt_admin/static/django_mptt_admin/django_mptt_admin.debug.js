/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 505:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.qg = parse;
__webpack_unused_export__ = serialize;
/**
 * RegExp to match cookie-name in RFC 6265 sec 4.1.1
 * This refers out to the obsoleted definition of token in RFC 2616 sec 2.2
 * which has been replaced by the token definition in RFC 7230 appendix B.
 *
 * cookie-name       = token
 * token             = 1*tchar
 * tchar             = "!" / "#" / "$" / "%" / "&" / "'" /
 *                     "*" / "+" / "-" / "." / "^" / "_" /
 *                     "`" / "|" / "~" / DIGIT / ALPHA
 *
 * Note: Allowing more characters - https://github.com/jshttp/cookie/issues/191
 * Allow same range as cookie value, except `=`, which delimits end of name.
 */
const cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
/**
 * RegExp to match cookie-value in RFC 6265 sec 4.1.1
 *
 * cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
 * cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
 *                     ; US-ASCII characters excluding CTLs,
 *                     ; whitespace DQUOTE, comma, semicolon,
 *                     ; and backslash
 *
 * Allowing more characters: https://github.com/jshttp/cookie/issues/191
 * Comma, backslash, and DQUOTE are not part of the parsing algorithm.
 */
const cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
/**
 * RegExp to match domain-value in RFC 6265 sec 4.1.1
 *
 * domain-value      = <subdomain>
 *                     ; defined in [RFC1034], Section 3.5, as
 *                     ; enhanced by [RFC1123], Section 2.1
 * <subdomain>       = <label> | <subdomain> "." <label>
 * <label>           = <let-dig> [ [ <ldh-str> ] <let-dig> ]
 *                     Labels must be 63 characters or less.
 *                     'let-dig' not 'letter' in the first char, per RFC1123
 * <ldh-str>         = <let-dig-hyp> | <let-dig-hyp> <ldh-str>
 * <let-dig-hyp>     = <let-dig> | "-"
 * <let-dig>         = <letter> | <digit>
 * <letter>          = any one of the 52 alphabetic characters A through Z in
 *                     upper case and a through z in lower case
 * <digit>           = any one of the ten digits 0 through 9
 *
 * Keep support for leading dot: https://github.com/jshttp/cookie/issues/173
 *
 * > (Note that a leading %x2E ("."), if present, is ignored even though that
 * character is not permitted, but a trailing %x2E ("."), if present, will
 * cause the user agent to ignore the attribute.)
 */
const domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
/**
 * RegExp to match path-value in RFC 6265 sec 4.1.1
 *
 * path-value        = <any CHAR except CTLs or ";">
 * CHAR              = %x01-7F
 *                     ; defined in RFC 5234 appendix B.1
 */
const pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
const __toString = Object.prototype.toString;
const NullObject = /* @__PURE__ */ (() => {
    const C = function () { };
    C.prototype = Object.create(null);
    return C;
})();
/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 */
function parse(str, options) {
    const obj = new NullObject();
    const len = str.length;
    // RFC 6265 sec 4.1.1, RFC 2616 2.2 defines a cookie name consists of one char minimum, plus '='.
    if (len < 2)
        return obj;
    const dec = options?.decode || decode;
    let index = 0;
    do {
        const eqIdx = str.indexOf("=", index);
        if (eqIdx === -1)
            break; // No more cookie pairs.
        const colonIdx = str.indexOf(";", index);
        const endIdx = colonIdx === -1 ? len : colonIdx;
        if (eqIdx > endIdx) {
            // backtrack on prior semicolon
            index = str.lastIndexOf(";", eqIdx - 1) + 1;
            continue;
        }
        const keyStartIdx = startIndex(str, index, eqIdx);
        const keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        const key = str.slice(keyStartIdx, keyEndIdx);
        // only assign once
        if (obj[key] === undefined) {
            let valStartIdx = startIndex(str, eqIdx + 1, endIdx);
            let valEndIdx = endIndex(str, endIdx, valStartIdx);
            const value = dec(str.slice(valStartIdx, valEndIdx));
            obj[key] = value;
        }
        index = endIdx + 1;
    } while (index < len);
    return obj;
}
function startIndex(str, index, max) {
    do {
        const code = str.charCodeAt(index);
        if (code !== 0x20 /*   */ && code !== 0x09 /* \t */)
            return index;
    } while (++index < max);
    return max;
}
function endIndex(str, index, min) {
    while (index > min) {
        const code = str.charCodeAt(--index);
        if (code !== 0x20 /*   */ && code !== 0x09 /* \t */)
            return index + 1;
    }
    return min;
}
/**
 * Serialize data into a cookie header.
 *
 * Serialize a name value pair into a cookie string suitable for
 * http headers. An optional options object specifies cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 */
function serialize(name, val, options) {
    const enc = options?.encode || encodeURIComponent;
    if (!cookieNameRegExp.test(name)) {
        throw new TypeError(`argument name is invalid: ${name}`);
    }
    const value = enc(val);
    if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${val}`);
    }
    let str = name + "=" + value;
    if (!options)
        return str;
    if (options.maxAge !== undefined) {
        if (!Number.isInteger(options.maxAge)) {
            throw new TypeError(`option maxAge is invalid: ${options.maxAge}`);
        }
        str += "; Max-Age=" + options.maxAge;
    }
    if (options.domain) {
        if (!domainValueRegExp.test(options.domain)) {
            throw new TypeError(`option domain is invalid: ${options.domain}`);
        }
        str += "; Domain=" + options.domain;
    }
    if (options.path) {
        if (!pathValueRegExp.test(options.path)) {
            throw new TypeError(`option path is invalid: ${options.path}`);
        }
        str += "; Path=" + options.path;
    }
    if (options.expires) {
        if (!isDate(options.expires) ||
            !Number.isFinite(options.expires.valueOf())) {
            throw new TypeError(`option expires is invalid: ${options.expires}`);
        }
        str += "; Expires=" + options.expires.toUTCString();
    }
    if (options.httpOnly) {
        str += "; HttpOnly";
    }
    if (options.secure) {
        str += "; Secure";
    }
    if (options.partitioned) {
        str += "; Partitioned";
    }
    if (options.priority) {
        const priority = typeof options.priority === "string"
            ? options.priority.toLowerCase()
            : undefined;
        switch (priority) {
            case "low":
                str += "; Priority=Low";
                break;
            case "medium":
                str += "; Priority=Medium";
                break;
            case "high":
                str += "; Priority=High";
                break;
            default:
                throw new TypeError(`option priority is invalid: ${options.priority}`);
        }
    }
    if (options.sameSite) {
        const sameSite = typeof options.sameSite === "string"
            ? options.sameSite.toLowerCase()
            : options.sameSite;
        switch (sameSite) {
            case true:
            case "strict":
                str += "; SameSite=Strict";
                break;
            case "lax":
                str += "; SameSite=Lax";
                break;
            case "none":
                str += "; SameSite=None";
                break;
            default:
                throw new TypeError(`option sameSite is invalid: ${options.sameSite}`);
        }
    }
    return str;
}
/**
 * URL-decode string value. Optimized to skip native call when no %.
 */
function decode(str) {
    if (str.indexOf("%") === -1)
        return str;
    try {
        return decodeURIComponent(str);
    }
    catch (e) {
        return str;
    }
}
/**
 * Determine if value is a Date.
 */
function isDate(val) {
    return __toString.call(val) === "[object Date]";
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 985:
/***/ (() => {

/*
JqTree 1.8.10

Copyright 2025 Marco Braak

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
var jqtree=function(e){"use strict";class t{constructor(e){let{dataFilter:t,loadData:o,onLoadFailed:n,onLoading:r,treeElement:s,triggerEvent:i}=e;this.dataFilter=t,this.loadData=o,this.onLoadFailed=n,this.onLoading=r,this.treeElement=s,this.triggerEvent=i}loadFromUrl(e,t,o){if(!e)return;const n=this.getDomElement(t);this.addLoadingClass(n),this.notifyLoading(!0,t,n);const r=()=>{this.removeLoadingClass(n),this.notifyLoading(!1,t,n)};this.submitRequest(e,(e=>{r(),this.loadData(this.parseData(e),t),o&&"function"==typeof o&&o()}),(e=>{r(),this.onLoadFailed&&this.onLoadFailed(e)}))}addLoadingClass(e){e.classList.add("jqtree-loading")}getDomElement(e){return e?.element?e.element:this.treeElement}notifyLoading(e,t,o){const n=jQuery(o);this.onLoading&&this.onLoading(e,t,n),this.triggerEvent("tree.loading_data",{$el:n,isLoading:e,node:t})}parseData(e){const t="string"==typeof e?JSON.parse(e):e;return this.dataFilter?this.dataFilter(t):t}removeLoadingClass(e){e.classList.remove("jqtree-loading")}submitRequest(e,t,o){const n={cache:!1,dataType:"json",error:o,method:"GET",success:t,..."string"==typeof e?{url:e}:e};n.method=n.method?.toUpperCase()??"GET",jQuery.ajax(n)}}const o=e=>e?"true":"false",n=e=>r(e).top,r=e=>{const t=e.getBoundingClientRect();return{left:t.x+window.scrollX,top:t.y+window.scrollY}};class s{constructor(e){let{autoEscape:t,nodeName:o,offsetX:n,offsetY:r,treeElement:s}=e;this.offsetX=n,this.offsetY=r,this.element=this.createElement(o,t),s.appendChild(this.element)}move(e,t){this.element.style.left=e-this.offsetX+"px",this.element.style.top=t-this.offsetY+"px"}remove(){this.element.remove()}createElement(e,t){const o=document.createElement("span");return o.classList.add("jqtree-title","jqtree-dragging"),t?o.textContent=e:o.innerHTML=e,o.style.position="absolute",o}}const i=(e,t,o,n)=>{const r=Math.min(t.length,4),s=Math.round((n-o)/r);let i=o;for(let o=0;o<r;o++){const n=t[o];n.position&&e.push({bottom:i+s,node:n.node,position:n.position,top:i}),i+=s}},l=(e,t,o)=>((e,t)=>{if(!e.length)return[];let o=e[0].top,n=[];const r=[];for(const t of e)t.top!==o&&n.length&&(i(r,n,o,t.top),o=t.top,n=[]),n.push(t);return i(r,n,o,t),r})(((e,t)=>{const o=[];let r=0;const s=(e,t,n)=>{o.push({node:e,position:t,top:n}),r=n};return((e,t)=>{let{handleAfterOpenFolder:o,handleClosedFolder:n,handleFirstNode:r,handleNode:s,handleOpenFolder:i}=t,l=!0;const d=(e,t)=>{let a=(e.is_open||!e.element)&&e.hasChildren(),h=null;if(e.element?.offsetParent&&(h=e.element,l&&(r(e),l=!1),e.hasChildren()?e.is_open?i(e,e.element)||(a=!1):n(e,t,h):s(e,t,e.element)),a){const n=e.children.length;e.children.forEach(((t,o)=>{const r=e.children[o];if(r)if(o===n-1)d(r,null);else{const t=e.children[o+1];t&&d(r,t)}})),e.is_open&&h&&o(e,t)}};d(e,null)})(e,{handleAfterOpenFolder:(e,o)=>{s(e,e===t||o===t?null:"after",r)},handleClosedFolder:(e,o,r)=>{const i=n(r);e===t?s(e,null,i):(s(e,"inside",i),o!==t&&s(e,"after",i))},handleFirstNode:e=>{e!==t&&e.element&&s(e,"before",n(e.element))},handleNode:(e,o,r)=>{const i=n(r);s(e,e===t?null:"inside",i),s(e,o===t||e===t?null:"after",i)},handleOpenFolder:(e,o)=>{if(e===t){const t=n(o),r=o.clientHeight;return s(e,null,t),r>5&&s(e,null,t+r-5),!1}return e.children[0]!==t&&s(e,"inside",n(o)),!0}}),o})(e,t),o);class d{constructor(e){let{autoEscape:t,getNodeElement:o,getNodeElementForNode:n,getScrollLeft:r,getTree:s,onCanMove:i,onCanMoveTo:l,onDragMove:d,onDragStop:a,onIsMoveHandle:h,openFolderDelay:c,openNode:u,refreshElements:m,slide:g,treeElement:p,triggerEvent:f}=e;this.autoEscape=t,this.getNodeElement=o,this.getNodeElementForNode=n,this.getScrollLeft=r,this.getTree=s,this.onCanMove=i,this.onCanMoveTo=l,this.onDragMove=d,this.onDragStop=a,this.onIsMoveHandle=h,this.openFolderDelay=c,this.openNode=u,this.refreshElements=m,this.slide=g,this.treeElement=p,this.triggerEvent=f,this.hoveredArea=null,this.hitAreas=[],this.isDragging=!1,this.currentItem=null}mouseCapture(e){const t=e.target;if(!this.mustCaptureElement(t))return null;if(this.onIsMoveHandle&&!this.onIsMoveHandle(jQuery(t)))return null;let o=this.getNodeElement(t);return o&&this.onCanMove&&(this.onCanMove(o.node)||(o=null)),this.currentItem=o,null!=this.currentItem}mouseDrag(e){if(!this.currentItem||!this.dragElement)return!1;this.dragElement.move(e.pageX,e.pageY);const t=this.findHoveredArea(e.pageX,e.pageY);return t&&this.canMoveToArea(t,this.currentItem)?(t.node.isFolder()||this.stopOpenFolderTimer(),this.hoveredArea!==t&&(this.hoveredArea=t,this.mustOpenFolderTimer(t)?this.startOpenFolderTimer(t.node):this.stopOpenFolderTimer(),this.updateDropHint())):(this.removeDropHint(),this.stopOpenFolderTimer(),this.hoveredArea=t),t||this.onDragMove&&this.onDragMove(this.currentItem.node,e.originalEvent),!0}mouseStart(e){if(!this.currentItem)return!1;this.refresh();const{left:t,top:o}=r(e.target),n=this.currentItem.node;return this.dragElement=new s({autoEscape:this.autoEscape??!0,nodeName:n.name,offsetX:e.pageX-t,offsetY:e.pageY-o,treeElement:this.treeElement}),this.isDragging=!0,this.currentItem.element.classList.add("jqtree-moving"),!0}mouseStop(e){this.moveItem(e),this.clear(),this.removeHover(),this.removeDropHint(),this.removeHitAreas();const t=this.currentItem;return this.currentItem&&(this.currentItem.element.classList.remove("jqtree-moving"),this.currentItem=null),this.isDragging=!1,!this.hoveredArea&&t&&this.onDragStop&&this.onDragStop(t.node,e.originalEvent),!1}refresh(){if(this.removeHitAreas(),this.currentItem){const e=this.currentItem.node;this.generateHitAreas(e),this.currentItem=this.getNodeElementForNode(e),this.isDragging&&this.currentItem.element.classList.add("jqtree-moving")}}canMoveToArea(e,t){return!this.onCanMoveTo||this.onCanMoveTo(t.node,e.node,e.position)}clear(){this.dragElement&&(this.dragElement.remove(),this.dragElement=null)}findHoveredArea(e,t){const o=this.getTreeDimensions();return e<o.left||t<o.top||e>o.right||t>o.bottom?null:function(e,t){let o=0,n=e.length;for(;o<n;){const r=o+n>>1,s=e[r];if(void 0===s)return null;const i=t(s);if(i>0)n=r;else{if(!(i<0))return s;o=r+1}}return null}(this.hitAreas,(e=>t<e.top?1:t>e.bottom?-1:0))}generateHitAreas(e){const t=this.getTree();this.hitAreas=t?l(t,e,this.getTreeDimensions().bottom):[]}getTreeDimensions(){const e=r(this.treeElement),t=e.left+this.getScrollLeft(),o=e.top;return{bottom:o+this.treeElement.clientHeight+16,left:t,right:t+this.treeElement.clientWidth,top:o}}moveItem(e){if(this.currentItem&&this.hoveredArea?.position&&this.canMoveToArea(this.hoveredArea,this.currentItem)){const t=this.currentItem.node,o=this.hoveredArea.node,n=this.hoveredArea.position,r=t.parent;"inside"===n&&(this.hoveredArea.node.is_open=!0);const s=()=>{const e=this.getTree();e&&(e.moveNode(t,o,n),this.treeElement.textContent="",this.refreshElements(null))};this.triggerEvent("tree.move",{move_info:{do_move:s,moved_node:t,original_event:e.originalEvent,position:n,previous_parent:r,target_node:o}}).isDefaultPrevented()||s()}}mustCaptureElement(e){const t=e.nodeName;return"INPUT"!==t&&"SELECT"!==t&&"TEXTAREA"!==t}mustOpenFolderTimer(e){const t=e.node;return t.isFolder()&&!t.is_open&&"inside"===e.position}removeDropHint(){this.previousGhost&&this.previousGhost.remove()}removeHitAreas(){this.hitAreas=[]}removeHover(){this.hoveredArea=null}startOpenFolderTimer(e){const t=()=>{this.openNode(e,this.slide,(()=>{this.refresh(),this.updateDropHint()}))};this.stopOpenFolderTimer();const o=this.openFolderDelay;!1!==o&&(this.openFolderTimer=window.setTimeout(t,o))}stopOpenFolderTimer(){this.openFolderTimer&&(clearTimeout(this.openFolderTimer),this.openFolderTimer=null)}updateDropHint(){if(!this.hoveredArea)return;this.removeDropHint();const e=this.getNodeElementForNode(this.hoveredArea.node);this.previousGhost=e.addDropHint(this.hoveredArea.position)}}class a{constructor(e){let{$element:t,autoEscape:o,buttonLeft:n,closedIcon:r,dragAndDrop:s,getTree:i,isNodeSelected:l,onCreateLi:d,openedIcon:a,rtl:h,showEmptyFolder:c,tabIndex:u}=e;this.autoEscape=o,this.buttonLeft=n,this.dragAndDrop=s,this.$element=t,this.getTree=i,this.isNodeSelected=l,this.onCreateLi=d,this.rtl=h,this.showEmptyFolder=c,this.tabIndex=u,this.openedIconElement=this.createButtonElement(a??"+"),this.closedIconElement=this.createButtonElement(r??"-")}render(e){e?.parent?this.renderFromNode(e):this.renderFromRoot()}renderFromNode(e){if(!e.element)return;const t=jQuery(e.element),o=this.createLi(e,e.getLevel());t.after(o),t.remove(),this.createDomElements(o,e.children,!1,e.getLevel()+1)}renderFromRoot(){this.$element.empty();const e=this.getTree();this.$element[0]&&e&&this.createDomElements(this.$element[0],e.children,!0,1)}attachNodeData(e,t){e.element=t,jQuery(t).data("node",e)}createButtonElement(e){if("string"==typeof e){const t=document.createElement("div");return t.innerHTML=e,document.createTextNode(t.innerHTML)}return e.nodeType?e:jQuery(e)[0]}createDomElements(e,t,o,n){const r=this.createUl(o);e.appendChild(r);for(const e of t){const t=this.createLi(e,n);r.appendChild(t),e.hasChildren()&&this.createDomElements(t,e.children,!1,n+1)}}createFolderLi(e,t,n){const r=this.getButtonClasses(e),s=this.getFolderClasses(e,n),i=e.is_open?this.openedIconElement:this.closedIconElement,l=document.createElement("li");l.className=`jqtree_common ${s}`,l.setAttribute("role","none");const d=document.createElement("div");d.className="jqtree-element jqtree_common",d.setAttribute("role","none"),l.appendChild(d);const a=document.createElement("a");a.className=r,i&&a.appendChild(i.cloneNode(!0)),this.buttonLeft&&d.appendChild(a);const h=this.createTitleSpan(e.name,n,!0,t);return h.setAttribute("aria-expanded",o(e.is_open)),d.appendChild(h),this.buttonLeft||d.appendChild(a),l}createLi(e,t){const o=Boolean(this.isNodeSelected(e)),n=e.isFolder()||e.isEmptyFolder&&this.showEmptyFolder?this.createFolderLi(e,t,o):this.createNodeLi(e,t,o);return this.attachNodeData(e,n),this.onCreateLi&&this.onCreateLi(e,jQuery(n),o),n}createNodeLi(e,t,o){const n=["jqtree_common"];o&&n.push("jqtree-selected");const r=n.join(" "),s=document.createElement("li");s.className=r,s.setAttribute("role","none");const i=document.createElement("div");i.className="jqtree-element jqtree_common",i.setAttribute("role","none"),s.appendChild(i);const l=this.createTitleSpan(e.name,o,!1,t);return i.appendChild(l),s}createTitleSpan(e,t,o,n){const r=document.createElement("span");let s="jqtree-title jqtree_common";if(o&&(s+=" jqtree-title-folder"),s+=" jqtree-title-button-"+(this.buttonLeft?"left":"right"),r.className=s,t){const e=this.tabIndex;void 0!==e&&r.setAttribute("tabindex",`${e}`)}return this.setTreeItemAriaAttributes(r,e,n,t),this.autoEscape?r.textContent=e:r.innerHTML=e,r}createUl(e){let t,o;e?(t="jqtree-tree",o="tree",this.rtl&&(t+=" jqtree-rtl")):(t="",o="group"),this.dragAndDrop&&(t+=" jqtree-dnd");const n=document.createElement("ul");return n.className=`jqtree_common ${t}`,n.setAttribute("role",o),n}getButtonClasses(e){const t=["jqtree-toggler","jqtree_common"];return e.is_open||t.push("jqtree-closed"),this.buttonLeft?t.push("jqtree-toggler-left"):t.push("jqtree-toggler-right"),t.join(" ")}getFolderClasses(e,t){const o=["jqtree-folder"];return e.is_open||o.push("jqtree-closed"),t&&o.push("jqtree-selected"),e.is_loading&&o.push("jqtree-loading"),o.join(" ")}setTreeItemAriaAttributes(e,t,n,r){e.setAttribute("aria-label",t),e.setAttribute("aria-level",`${n}`),e.setAttribute("aria-selected",o(r)),e.setAttribute("role","treeitem")}}class h{constructor(e){let{closeNode:t,getSelectedNode:o,isFocusOnTree:n,keyboardSupport:r,openNode:s,selectNode:i}=e;this.closeNode=t,this.getSelectedNode=o,this.isFocusOnTree=n,this.keyboardSupport=r,this.openNode=s,this.originalSelectNode=i,r&&document.addEventListener("keydown",this.handleKeyDown)}deinit(){this.keyboardSupport&&document.removeEventListener("keydown",this.handleKeyDown)}moveDown(e){return this.selectNode(e.getNextVisibleNode())}moveUp(e){return this.selectNode(e.getPreviousVisibleNode())}canHandleKeyboard(){return this.keyboardSupport&&this.isFocusOnTree()}handleKeyDown=e=>{if(!this.canHandleKeyboard())return;let t=!1;const o=this.getSelectedNode();if(o)switch(e.key){case"ArrowDown":t=this.moveDown(o);break;case"ArrowLeft":t=this.moveLeft(o);break;case"ArrowRight":t=this.moveRight(o);break;case"ArrowUp":t=this.moveUp(o)}t&&e.preventDefault()};moveLeft(e){return e.isFolder()&&e.is_open?(this.closeNode(e),!0):this.selectNode(e.getParent())}moveRight(e){return!!e.isFolder()&&(e.is_open?this.selectNode(e.getNextVisibleNode()):(this.openNode(e),!0))}selectNode(e){return!!e&&(this.originalSelectNode(e),!0)}}const c=e=>({originalEvent:e,pageX:e.pageX,pageY:e.pageY,target:e.target}),u=(e,t)=>({originalEvent:t,pageX:e.pageX,pageY:e.pageY,target:e.target});class m{constructor(e){let{element:t,getMouseDelay:o,getNode:n,onClickButton:r,onClickTitle:s,onMouseCapture:i,onMouseDrag:l,onMouseStart:d,onMouseStop:a,triggerEvent:h,useContextMenu:c}=e;this.element=t,this.getMouseDelay=o,this.getNode=n,this.onClickButton=r,this.onClickTitle=s,this.onMouseCapture=i,this.onMouseDrag=l,this.onMouseStart=d,this.onMouseStop=a,this.triggerEvent=h,this.useContextMenu=c,t.addEventListener("click",this.handleClick),t.addEventListener("dblclick",this.handleDblclick),t.addEventListener("mousedown",this.mouseDown,{passive:!1}),t.addEventListener("touchstart",this.touchStart,{passive:!1}),c&&t.addEventListener("contextmenu",this.handleContextmenu),this.isMouseStarted=!1,this.mouseDelayTimer=null,this.isMouseDelayMet=!1,this.mouseDownInfo=null}deinit(){this.element.removeEventListener("click",this.handleClick),this.element.removeEventListener("dblclick",this.handleDblclick),this.useContextMenu&&this.element.removeEventListener("contextmenu",this.handleContextmenu),this.element.removeEventListener("mousedown",this.mouseDown),this.element.removeEventListener("touchstart",this.touchStart),this.removeMouseMoveEventListeners()}getClickTarget(e){const t=e.closest(".jqtree-toggler");if(t){const e=this.getNode(t);if(e)return{node:e,type:"button"}}else{const t=e.closest(".jqtree-element");if(t){const e=this.getNode(t);if(e)return{node:e,type:"label"}}}return null}handleClick=e=>{if(!e.target)return;const t=this.getClickTarget(e.target);if(t)switch(t.type){case"button":this.onClickButton(t.node),e.preventDefault(),e.stopPropagation();break;case"label":this.triggerEvent("tree.click",{click_event:e,node:t.node}).isDefaultPrevented()||this.onClickTitle(t.node);break}};handleContextmenu=e=>{if(!e.target)return;const t=e.target.closest("ul.jqtree-tree .jqtree-element");if(t){const o=this.getNode(t);if(o)return e.preventDefault(),e.stopPropagation(),this.triggerEvent("tree.contextmenu",{click_event:e,node:o}),!1}return null};handleDblclick=e=>{if(!e.target)return;const t=this.getClickTarget(e.target);"label"===t?.type&&this.triggerEvent("tree.dblclick",{click_event:e,node:t.node})};handleMouseDown(e){return this.isMouseStarted&&this.handleMouseUp(e),this.mouseDownInfo=e,!!this.onMouseCapture(e)&&(this.handleStartMouse(),!0)}handleMouseMove(e,t){if(this.isMouseStarted)return this.onMouseDrag(t),void(e.cancelable&&e.preventDefault());this.isMouseDelayMet&&(this.mouseDownInfo&&(this.isMouseStarted=this.onMouseStart(this.mouseDownInfo)),this.isMouseStarted?(this.onMouseDrag(t),e.cancelable&&e.preventDefault()):this.handleMouseUp(t))}handleMouseUp(e){this.removeMouseMoveEventListeners(),this.isMouseDelayMet=!1,this.mouseDownInfo=null,this.isMouseStarted&&(this.isMouseStarted=!1,this.onMouseStop(e))}handleStartMouse(){document.addEventListener("mousemove",this.mouseMove,{passive:!1}),document.addEventListener("touchmove",this.touchMove,{passive:!1}),document.addEventListener("mouseup",this.mouseUp,{passive:!1}),document.addEventListener("touchend",this.touchEnd,{passive:!1});const e=this.getMouseDelay();e?this.startMouseDelayTimer(e):this.isMouseDelayMet=!0}mouseDown=e=>{if(0!==e.button)return;this.handleMouseDown(c(e))&&e.cancelable&&e.preventDefault()};mouseMove=e=>{this.handleMouseMove(e,c(e))};mouseUp=e=>{this.handleMouseUp(c(e))};removeMouseMoveEventListeners(){document.removeEventListener("mousemove",this.mouseMove),document.removeEventListener("touchmove",this.touchMove),document.removeEventListener("mouseup",this.mouseUp),document.removeEventListener("touchend",this.touchEnd)}startMouseDelayTimer(e){this.mouseDelayTimer&&clearTimeout(this.mouseDelayTimer),this.mouseDelayTimer=window.setTimeout((()=>{this.mouseDownInfo&&(this.isMouseDelayMet=!0)}),e),this.isMouseDelayMet=!1}touchEnd=e=>{if(e.touches.length>1)return;const t=e.touches[0];t&&this.handleMouseUp(u(t,e))};touchMove=e=>{if(e.touches.length>1)return;const t=e.touches[0];t&&this.handleMouseMove(e,u(t,e))};touchStart=e=>{if(e.touches.length>1)return;const t=e.touches[0];t&&this.handleMouseDown(u(t,e))}}const g=e=>"object"==typeof e&&"children"in e&&e.children instanceof Array;class p{constructor(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:p;this.name="",this.load_on_demand=!1,this.isEmptyFolder=null!=e&&g(e)&&0===e.children.length,this.setData(e),this.children=[],this.parent=null,t&&(this.idMapping=new Map,this.tree=this,this.nodeClass=o)}addAfter(e){if(this.parent){const t=this.createNode(e),o=this.parent.getChildIndex(this);return this.parent.addChildAtPosition(t,o+1),t.loadChildrenFromData(e),t}return null}addBefore(e){if(this.parent){const t=this.createNode(e),o=this.parent.getChildIndex(this);return this.parent.addChildAtPosition(t,o),t.loadChildrenFromData(e),t}return null}addChild(e){this.children.push(e),e.setParent(this)}addChildAtPosition(e,t){this.children.splice(t,0,e),e.setParent(this)}addNodeToIndex(e){null!=e.id&&this.idMapping.set(e.id,e)}addParent(e){if(this.parent){const t=this.createNode(e);this.tree&&t.setParent(this.tree);const o=this.parent;for(const e of o.children)t.addChild(e);return o.children=[],o.addChild(t),t}return null}append(e){const t=this.createNode(e);return this.addChild(t),t.loadChildrenFromData(e),t}filter(e){const t=[];return this.iterate((o=>(e(o)&&t.push(o),!0))),t}getChildIndex(e){return this.children.indexOf(e)}getData(){const e=t=>t.map((t=>{const o={};for(const e in t)if(-1===["parent","children","element","idMapping","load_on_demand","nodeClass","tree","isEmptyFolder"].indexOf(e)&&Object.prototype.hasOwnProperty.call(t,e)){const n=t[e];o[e]=n}return t.hasChildren()&&(o.children=e(t.children)),o}));return e(arguments.length>0&&void 0!==arguments[0]&&arguments[0]?[this]:this.children)}getLastChild(){if(this.hasChildren()){const e=this.children[this.children.length-1];return e?e.hasChildren()&&e.is_open?e.getLastChild():e:null}return null}getLevel(){let e=0,t=this;for(;t.parent;)e+=1,t=t.parent;return e}getNextNode(){if((!(arguments.length>0&&void 0!==arguments[0])||arguments[0])&&this.hasChildren())return this.children[0]??null;if(this.parent){const e=this.getNextSibling();return e||this.parent.getNextNode(!1)}return null}getNextSibling(){if(this.parent){const e=this.parent.getChildIndex(this)+1;return e<this.parent.children.length?this.parent.children[e]??null:null}return null}getNextVisibleNode(){if(this.hasChildren()&&this.is_open)return this.children[0]??null;if(this.parent){const e=this.getNextSibling();return e||this.parent.getNextNode(!1)}return null}getNodeByCallback(e){let t=null;return this.iterate((o=>!t&&(!e(o)||(t=o,!1)))),t}getNodeById(e){return this.idMapping.get(e)??null}getNodeByName(e){return this.getNodeByCallback((t=>t.name===e))}getNodeByNameMustExist(e){const t=this.getNodeByCallback((t=>t.name===e));if(!t)throw new Error(`Node with name ${e} not found`);return t}getNodesByProperty(e,t){return this.filter((o=>o[e]===t))}getParent(){return this.parent&&this.parent.parent?this.parent:null}getPreviousNode(){if(this.parent){const e=this.getPreviousSibling();return e?e.hasChildren()?e.getLastChild():e:this.getParent()}return null}getPreviousSibling(){if(this.parent){const e=this.parent.getChildIndex(this)-1;return e>=0?this.parent.children[e]??null:null}return null}getPreviousVisibleNode(){if(this.parent){const e=this.getPreviousSibling();return e?e.hasChildren()&&e.is_open?e.getLastChild():e:this.getParent()}return null}hasChildren(){return 0!==this.children.length}initFromData(e){const t=e=>{for(const t of e){const e=this.createNode();e.initFromData(t),this.addChild(e)}};(e=>{this.setData(e),g(e)&&e.children.length&&t(e.children)})(e)}isFolder(){return this.hasChildren()||this.load_on_demand}isParentOf(e){let t=e.parent;for(;t;){if(t===this)return!0;t=t.parent}return!1}iterate(e){const t=(o,n)=>{for(const r of o.children){e(r,n)&&r.hasChildren()&&t(r,n+1)}};t(this,0)}loadFromData(e){this.removeChildren();for(const t of e){const e=this.createNode(t);this.addChild(e),g(t)&&e.loadFromData(t.children)}return this}moveNode(e,t,o){if(!e.parent||e.isParentOf(t))return!1;switch(e.parent.doRemoveChild(e),o){case"after":return!!t.parent&&(t.parent.addChildAtPosition(e,t.parent.getChildIndex(t)+1),!0);case"before":return!!t.parent&&(t.parent.addChildAtPosition(e,t.parent.getChildIndex(t)),!0);case"inside":return t.addChildAtPosition(e,0),!0}}prepend(e){const t=this.createNode(e);return this.addChildAtPosition(t,0),t.loadChildrenFromData(e),t}remove(){this.parent&&(this.parent.removeChild(this),this.parent=null)}removeChild(e){e.removeChildren(),this.doRemoveChild(e)}removeChildren(){this.iterate((e=>(this.tree?.removeNodeFromIndex(e),!0))),this.children=[]}removeNodeFromIndex(e){null!=e.id&&this.idMapping.delete(e.id)}setData(e){if(e)if("string"==typeof e)this.name=e;else if("object"==typeof e)for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t)){const o=e[t];"label"===t||"name"===t?"string"==typeof o&&(this.name=o):"children"!==t&&"parent"!==t&&(this[t]=o)}}createNode(e){return new(this.getNodeClass())(e)}doRemoveChild(e){this.children.splice(this.getChildIndex(e),1),this.tree?.removeNodeFromIndex(e)}getNodeClass(){return this.nodeClass??this.tree?.nodeClass??p}loadChildrenFromData(e){g(e)&&e.children.length&&this.loadFromData(e.children)}setParent(e){this.parent=e,this.tree=e.tree,this.tree?.addNodeToIndex(this)}}class f{constructor(e,t){const o=e.querySelector(":scope > .jqtree-element");if(!o)return void(this.hint=void 0);const n=Math.max(e.offsetWidth+t-4,0),r=Math.max(e.clientHeight-4,0),s=document.createElement("span");s.className="jqtree-border",s.style.width=`${n}px`,s.style.height=`${r}px`,this.hint=s,o.append(this.hint)}remove(){this.hint?.remove()}}class v{constructor(e,t,o){switch(this.element=t,this.node=e,this.ghost=this.createGhostElement(),o){case"after":this.moveAfter();break;case"before":this.moveBefore();break;case"inside":e.isFolder()&&e.is_open?this.moveInsideOpenFolder():this.moveInside()}}remove(){this.ghost.remove()}createGhostElement(){const e=document.createElement("li");e.className="jqtree_common jqtree-ghost";const t=document.createElement("span");t.className="jqtree_common jqtree-circle",e.append(t);const o=document.createElement("span");return o.className="jqtree_common jqtree-line",e.append(o),e}moveAfter(){this.element.after(this.ghost)}moveBefore(){this.element.before(this.ghost)}moveInside(){this.element.after(this.ghost),this.ghost.classList.add("jqtree-inside")}moveInsideOpenFolder(){const e=this.node.children[0]?.element;e&&e.before(this.ghost)}}class S{constructor(e){let{getScrollLeft:t,node:o,tabIndex:n,treeElement:r}=e;this.getScrollLeft=t,this.tabIndex=n,this.treeElement=r,this.init(o)}addDropHint(e){return this.mustShowBorderDropHint(e)?new f(this.element,this.getScrollLeft()):new v(this.node,this.element,e)}deselect(){this.element.classList.remove("jqtree-selected");const e=this.getTitleSpan();e.removeAttribute("tabindex"),e.setAttribute("aria-selected","false"),e.blur()}init(e){this.node=e,e.element||(e.element=this.treeElement),this.element=e.element}select(e){this.element.classList.add("jqtree-selected");const t=this.getTitleSpan(),o=this.tabIndex;null!=o&&t.setAttribute("tabindex",o.toString()),t.setAttribute("aria-selected","true"),e&&t.focus()}getTitleSpan(){return this.element.querySelector(":scope > .jqtree-element > span.jqtree-title")}getUl(){return this.element.querySelector(":scope > ul")}mustShowBorderDropHint(e){return"inside"===e}}class N extends S{constructor(e){let{closedIconElement:t,getScrollLeft:o,node:n,openedIconElement:r,tabIndex:s,treeElement:i,triggerEvent:l}=e;super({getScrollLeft:o,node:n,tabIndex:s,treeElement:i}),this.closedIconElement=t,this.openedIconElement=r,this.triggerEvent=l}close(e,t){if(!this.node.is_open)return;this.node.is_open=!1;const o=this.getButton();o.classList.add("jqtree-closed"),o.innerHTML="";const n=this.closedIconElement;if(n){const e=n.cloneNode(!0);o.appendChild(e)}const r=()=>{this.element.classList.add("jqtree-closed");this.getTitleSpan().setAttribute("aria-expanded","false"),this.triggerEvent("tree.close",{node:this.node})};e?jQuery(this.getUl()).slideUp(t,r):(jQuery(this.getUl()).hide(),r())}open(e,t,o){if(this.node.is_open)return;this.node.is_open=!0;const n=this.getButton();n.classList.remove("jqtree-closed"),n.innerHTML="";const r=this.openedIconElement;if(r){const e=r.cloneNode(!0);n.appendChild(e)}const s=()=>{this.element.classList.remove("jqtree-closed");this.getTitleSpan().setAttribute("aria-expanded","true"),e&&e(this.node),this.triggerEvent("tree.open",{node:this.node})};t?jQuery(this.getUl()).slideDown(o,s):(jQuery(this.getUl()).show(),s())}mustShowBorderDropHint(e){return!this.node.is_open&&"inside"===e}getButton(){return this.element.querySelector(":scope > .jqtree-element > a.jqtree-toggler")}}class E{constructor(e){let{addToSelection:t,getNodeById:o,getSelectedNodes:n,getTree:r,onGetStateFromStorage:s,onSetStateFromStorage:i,openNode:l,refreshElements:d,removeFromSelection:a,saveState:h}=e;this.addToSelection=t,this.getNodeById=o,this.getSelectedNodes=n,this.getTree=r,this.onGetStateFromStorage=s,this.onSetStateFromStorage=i,this.openNode=l,this.refreshElements=d,this.removeFromSelection=a,this.saveStateOption=h}getNodeIdToBeSelected(){const e=this.getStateFromStorage();return e?.selected_node?e.selected_node[0]??null:null}getState(){return{open_nodes:(()=>{const e=[];return this.getTree()?.iterate((t=>(t.is_open&&t.id&&t.hasChildren()&&e.push(t.id),!0))),e})(),selected_node:(()=>{const e=[];return this.getSelectedNodes().forEach((t=>{null!=t.id&&e.push(t.id)})),e})()}}getStateFromStorage(){const e=this.loadFromStorage();return e?this.parseState(e):null}saveState(){const e=JSON.stringify(this.getState());this.onSetStateFromStorage?this.onSetStateFromStorage(e):localStorage.setItem(this.getKeyName(),e)}setInitialState(e){let t=!1;return e.open_nodes&&(t=this.openInitialNodes(e.open_nodes)),this.resetSelection(),e.selected_node&&this.selectInitialNodes(e.selected_node),t}setInitialStateOnDemand(e,t){let o=0,n=e.open_nodes;const r=()=>{if(!n)return;const r=[];for(const e of n){const t=this.getNodeById(e);t?t.is_loading||(t.load_on_demand?s(t):this.openNode(t,!1)):r.push(e)}n=r,e.selected_node&&this.selectInitialNodes(e.selected_node)&&this.refreshElements(null),0===o&&t()},s=e=>{o+=1,this.openNode(e,!1,(()=>{o-=1,r()}))};r()}getKeyName(){return"string"==typeof this.saveStateOption?this.saveStateOption:"tree"}loadFromStorage(){return this.onGetStateFromStorage?this.onGetStateFromStorage():localStorage.getItem(this.getKeyName())}openInitialNodes(e){let t=!1;for(const o of e){const e=this.getNodeById(o);e&&(e.load_on_demand?t=!0:e.is_open=!0)}return t}parseState(e){const t=JSON.parse(e);var o;return t.selected_node&&("number"==typeof(o=t.selected_node)&&o%1==0)&&(t.selected_node=[t.selected_node]),t}resetSelection(){this.getSelectedNodes().forEach((e=>{this.removeFromSelection(e)}))}selectInitialNodes(e){let t=0;for(const o of e){const e=this.getNodeById(o);e&&(t+=1,this.addToSelection(e))}return 0!==t}}class D{constructor(e){let{container:t,refreshHitAreas:o}=e;this.container=t,this.refreshHitAreas=o}checkHorizontalScrolling(e){const t=this.getNewHorizontalScrollDirection(e);this.horizontalScrollDirection!==t&&(this.horizontalScrollDirection=t,null!=this.horizontalScrollTimeout&&window.clearTimeout(this.verticalScrollTimeout),t&&(this.horizontalScrollTimeout=window.setTimeout(this.scrollHorizontally.bind(this),40)))}checkVerticalScrolling(e){const t=this.getNewVerticalScrollDirection(e);this.verticalScrollDirection!==t&&(this.verticalScrollDirection=t,null!=this.verticalScrollTimeout&&(window.clearTimeout(this.verticalScrollTimeout),this.verticalScrollTimeout=void 0),t&&(this.verticalScrollTimeout=window.setTimeout(this.scrollVertically.bind(this),40)))}getScrollLeft(){return this.container.scrollLeft}scrollToY(e){this.container.scrollTop=e}stopScrolling(){this.horizontalScrollDirection=void 0,this.verticalScrollDirection=void 0,this.scrollParentTop=void 0,this.scrollParentBottom=void 0}getNewHorizontalScrollDirection(e){const t=r(this.container),o=t.left+this.container.clientWidth,n=t.left;return e>o-20?"right":e<n+20?"left":void 0}getNewVerticalScrollDirection(e){return e<this.getScrollParentTop()?"top":e>this.getScrollParentBottom()?"bottom":void 0}getScrollParentBottom(){return null==this.scrollParentBottom&&(this.scrollParentBottom=this.getScrollParentTop()+this.container.clientHeight),this.scrollParentBottom}getScrollParentTop(){return null==this.scrollParentTop&&(this.scrollParentTop=n(this.container)),this.scrollParentTop}scrollHorizontally(){if(!this.horizontalScrollDirection)return;const e="left"===this.horizontalScrollDirection?-20:20;this.container.scrollBy({behavior:"instant",left:e,top:0}),this.refreshHitAreas(),setTimeout(this.scrollHorizontally.bind(this),40)}scrollVertically(){if(!this.verticalScrollDirection)return;const e="top"===this.verticalScrollDirection?-20:20;this.container.scrollBy({behavior:"instant",left:0,top:e}),this.refreshHitAreas(),setTimeout(this.scrollVertically.bind(this),40)}}class y{constructor(e){let{refreshHitAreas:t,treeElement:o}=e;this.refreshHitAreas=t,this.treeElement=o}checkHorizontalScrolling(e){const t=this.getNewHorizontalScrollDirection(e);this.horizontalScrollDirection!==t&&(this.horizontalScrollDirection=t,null!=this.horizontalScrollTimeout&&window.clearTimeout(this.horizontalScrollTimeout),t&&(this.horizontalScrollTimeout=window.setTimeout(this.scrollHorizontally.bind(this),40)))}checkVerticalScrolling(e){const t=this.getNewVerticalScrollDirection(e);this.verticalScrollDirection!==t&&(this.verticalScrollDirection=t,null!=this.verticalScrollTimeout&&(window.clearTimeout(this.verticalScrollTimeout),this.verticalScrollTimeout=void 0),t&&(this.verticalScrollTimeout=window.setTimeout(this.scrollVertically.bind(this),40)))}getScrollLeft(){return document.documentElement.scrollLeft}scrollToY(e){const t=n(this.treeElement);document.documentElement.scrollTop=e+t}stopScrolling(){this.horizontalScrollDirection=void 0,this.verticalScrollDirection=void 0,this.documentScrollHeight=void 0,this.documentScrollWidth=void 0}canScrollDown(){const e=document.documentElement;return e.scrollTop+e.clientHeight<this.getDocumentScrollHeight()}canScrollRight(){const e=document.documentElement;return e.scrollLeft+e.clientWidth<this.getDocumentScrollWidth()}getDocumentScrollHeight(){return null==this.documentScrollHeight&&(this.documentScrollHeight=document.documentElement.scrollHeight),this.documentScrollHeight}getDocumentScrollWidth(){return null==this.documentScrollWidth&&(this.documentScrollWidth=document.documentElement.scrollWidth),this.documentScrollWidth}getNewHorizontalScrollDirection(e){const t=e-document.documentElement.scrollLeft<20;return e>window.innerWidth-20&&this.canScrollRight()?"right":t?"left":void 0}getNewVerticalScrollDirection(e){const t=jQuery(document).scrollTop()??0;if(e-t<20)return"top";return window.innerHeight-(e-t)<20&&this.canScrollDown()?"bottom":void 0}scrollHorizontally(){if(!this.horizontalScrollDirection)return;const e="left"===this.horizontalScrollDirection?-20:20;window.scrollBy({behavior:"instant",left:e,top:0}),this.refreshHitAreas(),setTimeout(this.scrollHorizontally.bind(this),40)}scrollVertically(){if(!this.verticalScrollDirection)return;const e="top"===this.verticalScrollDirection?-20:20;window.scrollBy({behavior:"instant",left:0,top:e}),this.refreshHitAreas(),setTimeout(this.scrollVertically.bind(this),40)}}const b=e=>"auto"===e||"scroll"===e,C=e=>{const t=getComputedStyle(e);return b(t.overflowX)||b(t.overflowY)},F=(e,t)=>{const o=(e=>{if(C(e))return e;let t=e.parentElement;for(;t;){if(C(t))return t;t=t.parentElement}return null})(e);return o&&"HTML"!==o.tagName?new D({container:o,refreshHitAreas:t}):new y({refreshHitAreas:t,treeElement:e})};class T{constructor(e){let{refreshHitAreas:t,treeElement:o}=e;this.refreshHitAreas=t,this.scrollParent=void 0,this.treeElement=o}checkScrolling(e){this.checkVerticalScrolling(e),this.checkHorizontalScrolling(e)}getScrollLeft(){return this.getScrollParent().getScrollLeft()}scrollToY(e){this.getScrollParent().scrollToY(e)}stopScrolling(){this.getScrollParent().stopScrolling()}checkHorizontalScrolling(e){this.getScrollParent().checkHorizontalScrolling(e.pageX)}checkVerticalScrolling(e){this.getScrollParent().checkVerticalScrolling(e.pageY)}getScrollParent(){return this.scrollParent||(this.scrollParent=F(this.treeElement,this.refreshHitAreas)),this.scrollParent}}class I{constructor(e){let{getNodeById:t}=e;this.getNodeById=t,this.selectedNodes=new Set,this.clear()}addToSelection(e){null!=e.id?this.selectedNodes.add(e.id):this.selectedSingleNode=e}clear(){this.selectedNodes.clear(),this.selectedSingleNode=null}getSelectedNode(){const e=this.getSelectedNodes();return!!e.length&&(e[0]??!1)}getSelectedNodes(){if(this.selectedSingleNode)return[this.selectedSingleNode];{const e=[];return this.selectedNodes.forEach((t=>{const o=this.getNodeById(t);o&&e.push(o)})),e}}getSelectedNodesUnder(e){if(this.selectedSingleNode)return e.isParentOf(this.selectedSingleNode)?[this.selectedSingleNode]:[];{const t=[];return this.selectedNodes.forEach((o=>{const n=this.getNodeById(o);n&&e.isParentOf(n)&&t.push(n)})),t}}isNodeSelected(e){return null!=e.id?this.selectedNodes.has(e.id):!!this.selectedSingleNode&&this.selectedSingleNode.element===e.element}removeFromSelection(e){let t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];null==e.id?this.selectedSingleNode&&e.element===this.selectedSingleNode.element&&(this.selectedSingleNode=null):(this.selectedNodes.delete(e.id),t&&e.iterate((()=>(null!=e.id&&this.selectedNodes.delete(e.id),!0))))}}const L=(e,t)=>{const o=()=>`simple_widget_${t}`,n=(e,t)=>{const o=jQuery.data(e,t);return o&&o instanceof w?o:null},r=(t,r)=>{const s=o();for(const o of t.get()){if(!n(o,s)){const t=new e(o,r);jQuery.data(o,s)||jQuery.data(o,s,t),t.init()}}return t};jQuery.fn[t]=function(t){if(!t)return r(this,null);if("object"==typeof t){return r(this,t)}if("string"==typeof t&&"_"!==t[0]){const r=t;if("destroy"===r)return void(e=>{const t=o();for(const o of e.get()){const e=n(o,t);e&&e.destroy(),jQuery.removeData(o,t)}})(this);if("get_widget_class"===r)return e;for(var s=arguments.length,i=new Array(s>1?s-1:0),l=1;l<s;l++)i[l-1]=arguments[l];return((e,t,n)=>{let r=null;for(const s of e.get()){const e=jQuery.data(s,o());if(e&&e instanceof w){const o=e[t];o&&"function"==typeof o&&(r=o.apply(e,n))}}return r})(this,r,i)}}};class w{static defaults={};constructor(e,t){this.$el=jQuery(e);const o=this.constructor.defaults;this.options={...o,...t}}static register(e,t){L(e,t)}deinit(){}destroy(){this.deinit()}init(){}}const M="Node parameter is empty",H="Parameter is empty: ";class A extends w{static defaults=(()=>({animationSpeed:"fast",autoEscape:!0,autoOpen:!1,buttonLeft:!0,closedIcon:void 0,data:void 0,dataFilter:void 0,dataUrl:void 0,dragAndDrop:!1,keyboardSupport:!0,nodeClass:p,onCanMove:void 0,onCanMoveTo:void 0,onCanSelectNode:void 0,onCreateLi:void 0,onDragMove:void 0,onDragStop:void 0,onGetStateFromStorage:void 0,onIsMoveHandle:void 0,onLoadFailed:void 0,onLoading:void 0,onSetStateFromStorage:void 0,openedIcon:"&#x25bc;",openFolderDelay:500,rtl:void 0,saveState:!1,selectable:!0,showEmptyFolder:!1,slide:!0,startDndDelay:300,tabIndex:0,useContextMenu:!0}))();addNodeAfter(e,t){const o=t.addAfter(e);return o&&this.refreshElements(t.parent),o}addNodeBefore(e,t){if(!t)throw Error(H+"existingNode");const o=t.addBefore(e);return o&&this.refreshElements(t.parent),o}addParentNode(e,t){if(!t)throw Error(H+"existingNode");const o=t.addParent(e);return o&&this.refreshElements(o.parent),o}addToSelection(e,t){if(!e)throw Error(M);return this.selectNodeHandler.addToSelection(e),this.openParents(e),this.getNodeElementForNode(e).select(t??!0),this.saveState(),this.element}appendNode(e,t){const o=t??this.tree,n=o.append(e);return this.refreshElements(o),n}closeNode(e,t){if(!e)throw Error(M);const o=t??this.options.slide;return(e.isFolder()||e.isEmptyFolder)&&(this.createFolderElement(e).close(o,this.options.animationSpeed),this.saveState()),this.element}deinit(){this.element.empty(),this.element.off(),this.keyHandler.deinit(),this.mouseHandler.deinit(),this.tree=new p({},!0),super.deinit()}getNodeByCallback(e){return this.tree.getNodeByCallback(e)}getNodeByHtmlElement(e){const t=e instanceof HTMLElement?e:e[0];return t?this.getNode(t):null}getNodeById(e){return this.tree.getNodeById(e)}getNodeByName(e){return this.tree.getNodeByName(e)}getNodeByNameMustExist(e){return this.tree.getNodeByNameMustExist(e)}getNodesByProperty(e,t){return this.tree.getNodesByProperty(e,t)}getSelectedNode(){return this.selectNodeHandler.getSelectedNode()}getSelectedNodes(){return this.selectNodeHandler.getSelectedNodes()}getState(){return this.saveStateHandler.getState()}getStateFromStorage(){return this.saveStateHandler.getStateFromStorage()}getTree(){return this.tree}getVersion(){return"1.8.10"}init(){super.init(),this.element=this.$el,this.isInitialized=!1,this.options.rtl=this.getRtlOption(),null==this.options.closedIcon&&(this.options.closedIcon=this.getDefaultClosedIcon()),this.connectHandlers(),this.initData()}isDragging(){return this.dndHandler.isDragging}isNodeSelected(e){if(!e)throw Error(M);return this.selectNodeHandler.isNodeSelected(e)}loadData(e,t){return this.doLoadData(e,t),this.element}loadDataFromUrl(e,t,o){return"string"==typeof e?this.doLoadDataFromUrl(e,t,o??null):this.doLoadDataFromUrl(null,e,t),this.element}moveDown(){const e=this.getSelectedNode();return e&&this.keyHandler.moveDown(e),this.element}moveNode(e,t,o){if(!e)throw Error(M);if(!t)throw Error(H+"targetNode");if(!o)throw Error(H+"position");return this.tree.moveNode(e,t,o),this.refreshElements(null),this.element}moveUp(){const e=this.getSelectedNode();return e&&this.keyHandler.moveUp(e),this.element}openNode(e,t,o){if(!e)throw Error(M);const[n,r]=(()=>{let e,n;return"function"==typeof t?(e=t,n=null):(n=t,e=o),null==n&&(n=this.options.slide),[n,e]})();return this.openNodeInternal(e,n,r),this.element}prependNode(e,t){const o=t??this.tree,n=o.prepend(e);return this.refreshElements(o),n}refresh(){return this.refreshElements(null),this.element}refreshHitAreas(){return this.dndHandler.refresh(),this.element}reload(e){return this.doLoadDataFromUrl(null,null,e),this.element}removeFromSelection(e){if(!e)throw Error(M);return this.selectNodeHandler.removeFromSelection(e),this.getNodeElementForNode(e).deselect(),this.saveState(),this.element}removeNode(e){if(!e)throw Error(M);if(!e.parent)throw Error("Node has no parent");this.selectNodeHandler.removeFromSelection(e,!0);const t=e.parent;return e.remove(),this.refreshElements(t),this.element}scrollToNode(e){if(!e)throw Error(M);if(!e.element)return this.element;const t=n(e.element)-n(this.$el.get(0));return this.scrollHandler.scrollToY(t),this.element}selectNode(e,t){return this.doSelectNode(e,t),this.element}setOption(e,t){return this.options[e]=t,this.element}setState(e){return e&&(this.saveStateHandler.setInitialState(e),this.refreshElements(null)),this.element}toggle(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(!e)throw Error(M);const o=t??this.options.slide;return e.is_open?this.closeNode(e,o):this.openNode(e,o),this.element}toJson(){return JSON.stringify(this.tree.getData())}updateNode(e,t){if(!e)throw Error(M);if(!t)return this.element;const o="object"==typeof t&&t.id&&t.id!==e.id;return o&&this.tree.removeNodeFromIndex(e),e.setData(t),o&&this.tree.addNodeToIndex(e),"object"==typeof t&&t.children&&t.children instanceof Array&&(e.removeChildren(),t.children.length&&e.loadFromData(t.children)),this.refreshElements(e),this.element}connectHandlers(){const{autoEscape:e,buttonLeft:o,closedIcon:n,dataFilter:r,dragAndDrop:s,keyboardSupport:i,onCanMove:l,onCanMoveTo:c,onCreateLi:u,onDragMove:g,onDragStop:p,onGetStateFromStorage:f,onIsMoveHandle:v,onLoadFailed:S,onLoading:N,onSetStateFromStorage:D,openedIcon:y,openFolderDelay:b,rtl:C,saveState:F,showEmptyFolder:L,slide:w,tabIndex:M}=this.options,H=this.closeNode.bind(this),A=this.getNodeElement.bind(this),_=this.getNodeElementForNode.bind(this),j=this.getNodeById.bind(this),x=this.getSelectedNode.bind(this),P=this.getTree.bind(this),B=this.isFocusOnTree.bind(this),k=this.loadData.bind(this),q=this.openNodeInternal.bind(this),O=this.refreshElements.bind(this),U=this.refreshHitAreas.bind(this),z=this.selectNode.bind(this),Q=this.element,V=this.element.get(0),Y=this.triggerEvent.bind(this),$=new I({getNodeById:j}),R=$.addToSelection.bind($),X=$.getSelectedNodes.bind($),G=$.isNodeSelected.bind($),W=$.removeFromSelection.bind($),K=new t({dataFilter:r,loadData:k,onLoadFailed:S,onLoading:N,treeElement:V,triggerEvent:Y}),J=new E({addToSelection:R,getNodeById:j,getSelectedNodes:X,getTree:P,onGetStateFromStorage:f,onSetStateFromStorage:D,openNode:q,refreshElements:O,removeFromSelection:W,saveState:F}),Z=new T({refreshHitAreas:U,treeElement:V}),ee=Z.getScrollLeft.bind(Z),te=new d({autoEscape:e,getNodeElement:A,getNodeElementForNode:_,getScrollLeft:ee,getTree:P,onCanMove:l,onCanMoveTo:c,onDragMove:g,onDragStop:p,onIsMoveHandle:v,openFolderDelay:b,openNode:q,refreshElements:O,slide:w,treeElement:V,triggerEvent:Y}),oe=new h({closeNode:H,getSelectedNode:x,isFocusOnTree:B,keyboardSupport:i,openNode:q,selectNode:z}),ne=new a({$element:Q,autoEscape:e,buttonLeft:o,closedIcon:n,dragAndDrop:s,getTree:P,isNodeSelected:G,onCreateLi:u,openedIcon:y,rtl:C,showEmptyFolder:L,tabIndex:M}),re=this.getNode.bind(this),se=this.mouseCapture.bind(this),ie=this.mouseDrag.bind(this),le=this.mouseStart.bind(this),de=this.mouseStop.bind(this),ae=new m({element:V,getMouseDelay:()=>this.options.startDndDelay??0,getNode:re,onClickButton:this.toggle.bind(this),onClickTitle:this.doSelectNode.bind(this),onMouseCapture:se,onMouseDrag:ie,onMouseStart:le,onMouseStop:de,triggerEvent:Y,useContextMenu:this.options.useContextMenu});this.dataLoader=K,this.dndHandler=te,this.keyHandler=oe,this.mouseHandler=ae,this.renderer=ne,this.saveStateHandler=J,this.scrollHandler=Z,this.selectNodeHandler=$}containsElement(e){const t=this.getNode(e);return null!=t&&t.tree===this.tree}createFolderElement(e){const t=this.renderer.closedIconElement,o=this.scrollHandler.getScrollLeft.bind(this.scrollHandler),n=this.renderer.openedIconElement,r=this.options.tabIndex,s=this.element.get(0),i=this.triggerEvent.bind(this);return new N({closedIconElement:t,getScrollLeft:o,node:e,openedIconElement:n,tabIndex:r,treeElement:s,triggerEvent:i})}createNodeElement(e){const t=this.scrollHandler.getScrollLeft.bind(this.scrollHandler),o=this.options.tabIndex,n=this.element.get(0);return new S({getScrollLeft:t,node:e,tabIndex:o,treeElement:n})}deselectCurrentNode(){const e=this.getSelectedNode();e&&this.removeFromSelection(e)}deselectNodes(e){const t=this.selectNodeHandler.getSelectedNodesUnder(e);for(const e of t)this.selectNodeHandler.removeFromSelection(e)}doLoadData(e,t){e&&(t?(this.deselectNodes(t),this.loadSubtree(e,t)):this.initTree(e),this.isDragging()&&this.dndHandler.refresh()),this.triggerEvent("tree.load_data",{parent_node:t,tree_data:e})}doLoadDataFromUrl(e,t,o){const n=e??this.getDataUrlInfo(t);this.dataLoader.loadFromUrl(n,t,o)}doSelectNode(e,t){const o=()=>{this.options.saveState&&this.saveStateHandler.saveState()};if(!e)return this.deselectCurrentNode(),void o();const n={mustSetFocus:!0,mustToggle:!0,...t??{}};if((()=>this.options.onCanSelectNode?this.options.selectable&&this.options.onCanSelectNode(e):this.options.selectable)()){if(this.selectNodeHandler.isNodeSelected(e))n.mustToggle&&(this.deselectCurrentNode(),this.triggerEvent("tree.select",{node:null,previous_node:e}));else{const t=this.getSelectedNode()||null;this.deselectCurrentNode(),this.addToSelection(e,n.mustSetFocus),this.triggerEvent("tree.select",{deselected_node:t,node:e}),this.openParents(e)}o()}}getAutoOpenMaxLevel(){return!0===this.options.autoOpen?-1:"number"==typeof this.options.autoOpen?this.options.autoOpen:"string"==typeof this.options.autoOpen?parseInt(this.options.autoOpen,10):0}getDataUrlInfo(e){const t=this.options.dataUrl??this.element.data("url"),o=t=>{if(e?.id){const o={node:e.id};t.data=o}else{const e=this.getNodeIdToBeSelected();if(e){const o={selected_node:e};t.data=o}}};return"function"==typeof t?t(e):"string"==typeof t?(e=>{const t={url:e};return o(t),t})(t):t&&"object"==typeof t?(o(t),t):null}getDefaultClosedIcon(){return this.options.rtl?"&#x25c0;":"&#x25ba;"}getNode(e){const t=e.closest("li.jqtree_common");return t?jQuery(t).data("node"):null}getNodeElement(e){const t=this.getNode(e);return t?this.getNodeElementForNode(t):null}getNodeElementForNode(e){return e.isFolder()?this.createFolderElement(e):this.createNodeElement(e)}getNodeIdToBeSelected(){return this.options.saveState?this.saveStateHandler.getNodeIdToBeSelected():null}getRtlOption(){if(null!=this.options.rtl)return this.options.rtl;{const e=this.element.data("rtl");return null!==e&&!1!==e&&void 0!==e}}initData(){if(this.options.data)this.doLoadData(this.options.data,null);else{this.getDataUrlInfo(null)?this.doLoadDataFromUrl(null,null,null):this.doLoadData([],null)}}initTree(e){const t=()=>{this.isInitialized||(this.isInitialized=!0,this.triggerEvent("tree.init"))};this.tree=new this.options.nodeClass(null,!0,this.options.nodeClass),this.selectNodeHandler.clear(),this.tree.loadFromData(e);const o=this.setInitialState();this.refreshElements(null),o?this.setInitialStateOnDemand(t):t()}isFocusOnTree(){const e=document.activeElement;return Boolean(e&&"SPAN"===e.tagName&&this.containsElement(e))}isSelectedNodeInSubtree(e){const t=this.getSelectedNode();return!!t&&(e===t||e.isParentOf(t))}loadFolderOnDemand(e){let t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],o=arguments.length>2?arguments[2]:void 0;e.is_loading=!0,this.doLoadDataFromUrl(null,e,(()=>{this.openNodeInternal(e,t,o)}))}loadSubtree(e,t){t.loadFromData(e),t.load_on_demand=!1,t.is_loading=!1,this.refreshElements(t)}mouseCapture(e){return!!this.options.dragAndDrop&&this.dndHandler.mouseCapture(e)}mouseDrag(e){if(this.options.dragAndDrop){const t=this.dndHandler.mouseDrag(e);return this.scrollHandler.checkScrolling(e),t}return!1}mouseStart(e){return!!this.options.dragAndDrop&&this.dndHandler.mouseStart(e)}mouseStop(e){return!!this.options.dragAndDrop&&(this.scrollHandler.stopScrolling(),this.dndHandler.mouseStop(e))}openNodeInternal(e){let t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],o=arguments.length>2?arguments[2]:void 0;const n=(t,o,n)=>{if(!e.children.length)return;this.createFolderElement(t).open(n,o,this.options.animationSpeed)};if(e.isFolder()||e.isEmptyFolder)if(e.load_on_demand)this.loadFolderOnDemand(e,t,o);else{let r=e.parent;for(;r;)r.parent&&n(r,!1),r=r.parent;n(e,t,o),this.saveState()}}openParents(e){const t=e.parent;t?.parent&&!t.is_open&&this.openNode(t,!1)}refreshElements(e){const t=this.isFocusOnTree(),o=!!e&&this.isSelectedNodeInSubtree(e);this.renderer.render(e),o&&this.selectCurrentNode(t),this.triggerEvent("tree.refresh")}saveState(){this.options.saveState&&this.saveStateHandler.saveState()}selectCurrentNode(e){const t=this.getSelectedNode();if(t){this.getNodeElementForNode(t).select(e)}}setInitialState(){const e=()=>{if(!1===this.options.autoOpen)return!1;const e=this.getAutoOpenMaxLevel();let t=!1;return this.tree.iterate(((o,n)=>o.load_on_demand?(t=!0,!1):!!o.hasChildren()&&(o.is_open=!0,n!==e))),t};let[t,o]=(()=>{if(this.options.saveState){const e=this.saveStateHandler.getStateFromStorage();if(e){return[!0,this.saveStateHandler.setInitialState(e)]}return[!1,!1]}return[!1,!1]})();return t||(o=e()),o}setInitialStateOnDemand(e){const t=()=>{const t=this.getAutoOpenMaxLevel();let o=0;const n=e=>{o+=1,this.openNodeInternal(e,!1,(()=>{o-=1,r()}))},r=()=>{this.tree.iterate(((e,o)=>e.load_on_demand?(e.is_loading||n(e),!1):(this.openNodeInternal(e,!1),o!==t))),0===o&&e()};r()};(()=>{if(this.options.saveState){const t=this.saveStateHandler.getStateFromStorage();return!!t&&(this.saveStateHandler.setInitialStateOnDemand(t,e),!0)}return!1})()||t()}triggerEvent(e,t){const o=jQuery.Event(e,t);return this.element.trigger(o),o}}return w.register(A,"tree"),e.JqTreeWidget=A,e}({});
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
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";

// EXTERNAL MODULE: ./node_modules/.pnpm/cookie@1.0.2/node_modules/cookie/dist/index.js
var dist = __webpack_require__(505);
// EXTERNAL MODULE: ./node_modules/.pnpm/jqtree@1.8.10_jquery@3.7.1/node_modules/jqtree/tree.jquery.js
var tree_jquery = __webpack_require__(985);
;// ./src/initTree.ts


function initTree($tree, {
  animationSpeed,
  autoEscape,
  autoOpen,
  csrfCookieName,
  dragAndDrop,
  hasAddPermission,
  hasChangePermission,
  mouseDelay,
  rtl
}) {
  let errorNode = null;
  const baseUrl = "http://example.com";
  const insertAtUrl = new URL($tree.data("insert_at_url"), baseUrl);
  function createLi(node, $li, isSelected) {
    if (node.id == null) {
      return;
    }

    // Create edit link
    const $title = $li.find(".jqtree-title");
    insertAtUrl.searchParams.set("insert_at", node.id.toString());
    const insertUrlString = insertAtUrl.toString().substring(baseUrl.length);
    const tabindex = isSelected ? "0" : "-1";
    const editCaption = hasChangePermission ? gettext("edit") : gettext("view");
    $title.after(`<a href="${node.url}" class="edit" tabindex="${tabindex}">(${editCaption})</a>`, hasAddPermission ? `<a href="${insertUrlString}" class="edit" tabindex="${tabindex}">(${gettext("add")})</a>` : "");
  }
  function getCsrfToken() {
    function getFromMiddleware() {
      const inputElement = document.querySelector('[name="csrfmiddlewaretoken"]');
      return inputElement?.value;
    }
    function getFromCookie() {
      if (!csrfCookieName) {
        return null;
      } else {
        return dist/* parse */.qg(document.cookie)[csrfCookieName];
      }
    }
    return getFromCookie() ?? getFromMiddleware() ?? "";
  }
  function handleMove(eventParam) {
    const e = eventParam;
    const info = e.move_info;
    if (!info.moved_node.element) {
      return;
    }
    const $el = jQuery(info.moved_node.element);
    const data = {
      position: info.position,
      target_id: info.target_node.id
    };
    handleLoading(null);
    removeErrorMessage();
    e.preventDefault();
    void jQuery.ajax({
      beforeSend: xhr => {
        // Set Django csrf token
        xhr.setRequestHeader("X-CSRFToken", getCsrfToken());
      },
      data,
      error: () => {
        handleLoaded(null);
        const $node = $el.find(".jqtree-element");
        $node.append(`<span class="mptt-admin-error">${gettext("move failed")}</span>`);
        errorNode = info.moved_node;
      },
      success: () => {
        info.do_move();
        handleLoaded(null);
      },
      type: "POST",
      url: info.moved_node.move_url
    });
    function removeErrorMessage() {
      if (errorNode?.element) {
        jQuery(errorNode.element).find(".mptt-admin-error").remove();
        errorNode = null;
      }
    }
  }
  function handleLoadFailed() {
    $tree.html(gettext("Error while loading the data from the server"));
  }
  const spinners = {};
  function getSpinnerId(node) {
    if (!node) {
      return "__root__";
    } else {
      if (node.id == null) {
        return null;
      } else {
        return node.id;
      }
    }
  }
  function handleLoading(node) {
    function getContainer() {
      if (node) {
        return node.element;
      } else {
        return $tree.get(0);
      }
    }
    const container = getContainer();
    const spinnerId = getSpinnerId(node);
    if (!container || spinnerId == null) {
      return;
    }
    const spinner = document.createElement("span");
    spinner.className = "jqtree-spin";
    container.append(spinner);
    spinners[spinnerId] = spinner;
  }
  function handleLoaded(node) {
    const spinnerId = getSpinnerId(node);
    if (spinnerId == null) {
      return;
    }
    const spinner = spinners[spinnerId];
    if (spinner) {
      spinner.remove();
    }
  }
  function handleSelect(eventParam) {
    const e = eventParam;
    const {
      deselected_node,
      node
    } = e;
    if (deselected_node?.element) {
      // deselected node: remove tabindex
      jQuery(deselected_node.element).find(".edit").attr("tabindex", -1);
    }

    // selected: add tabindex
    if (node.element) {
      jQuery(node.element).find(".edit").attr("tabindex", 0);
    }
  }
  function handleLoadingEvent(e) {
    const {
      isLoading,
      node
    } = e;
    if (isLoading) {
      handleLoading(node);
    }
  }
  function handleLoadDataEvent(e) {
    const {
      parent_node
    } = e;
    handleLoaded(parent_node);
  }
  const treeOptions = {
    autoEscape,
    autoOpen,
    buttonLeft: rtl,
    closedIcon: rtl ? "&#x25c0;" : "&#x25ba;",
    dragAndDrop: dragAndDrop && hasChangePermission,
    onCreateLi: createLi,
    onLoadFailed: handleLoadFailed,
    saveState: $tree.data("save_state"),
    useContextMenu: Boolean($tree.data("use_context_menu"))
  };
  if (animationSpeed !== null) {
    treeOptions.animationSpeed = animationSpeed;
  }
  if (mouseDelay != null) {
    treeOptions.startDndDelay = mouseDelay;
  }
  $tree.on("tree.loading_data", handleLoadingEvent);
  $tree.on("tree.load_data", handleLoadDataEvent);
  $tree.on("tree.move", handleMove);
  $tree.on("tree.select", handleSelect);
  $tree.tree(treeOptions);
}
/* harmony default export */ const src_initTree = (initTree);
;// ./src/djangoMpttAdmin.ts

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
    src_initTree($tree, {
      animationSpeed,
      autoEscape,
      autoOpen,
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