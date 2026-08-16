/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/dataLoader.js
class DataLoader {
  _dataFilter;
  _loadData;
  _onLoadFailed;
  _onLoading;
  _treeElement;
  _triggerEvent;
  constructor({
    dataFilter,
    loadData,
    onLoadFailed,
    onLoading,
    treeElement,
    triggerEvent
  }) {
    this._dataFilter = dataFilter;
    this._loadData = loadData;
    this._onLoadFailed = onLoadFailed;
    this._onLoading = onLoading;
    this._treeElement = treeElement;
    this._triggerEvent = triggerEvent;
  }
  loadFromUrl(url, parentNode, onFinished) {
    const element = this._getDomElement(parentNode);
    this._addLoadingClass(element);
    this._notifyLoading(true, element, parentNode);
    const stopLoading = () => {
      this._removeLoadingClass(element);
      this._notifyLoading(false, element, parentNode);
    };
    const handleSuccess = data => {
      stopLoading();
      this._loadData(this._parseData(data), parentNode);
      if (onFinished && typeof onFinished === "function") {
        onFinished();
      }
    };
    const handleError = response => {
      stopLoading();
      if (this._onLoadFailed) {
        this._onLoadFailed(response);
      }
    };
    void this._submitRequest(url, handleSuccess, handleError);
  }
  _addLoadingClass(element) {
    element.classList.add("html-tree-loading");
  }
  _getDomElement(parentNode) {
    if (parentNode?.element) {
      return parentNode.element;
    } else {
      return this._treeElement;
    }
  }
  _notifyLoading(isLoading, element, node) {
    if (this._onLoading) {
      this._onLoading(isLoading, node, element);
    }
    this._triggerEvent("tree.loading_data", {
      element,
      isLoading,
      node: node ?? null
    });
  }
  _parseData(data) {
    if (this._dataFilter) {
      return this._dataFilter(data);
    } else {
      return data;
    }
  }
  _removeLoadingClass(element) {
    element.classList.remove("html-tree-loading");
  }
  async _submitRequest(url, handleSuccess, handleError) {
    const headers = {
      "Content-Type": "application/json"
    };
    url.setSearchParam("_", Date.now().toString());
    const response = await fetch(url.toString(), {
      headers
    });
    if (response.ok) {
      const data = await response.json();
      handleSuccess(data);
    } else {
      handleError(response);
    }
  }
}


//# sourceMappingURL=dataLoader.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/positionUtils.js
// Get the top position of the HTML element.
const getOffsetTop = element => getElementPosition(element).top;

// Get the top left position of the HTML element.
const getElementPosition = element => {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.x + window.scrollX,
    top: rect.y + window.scrollY
  };
};


//# sourceMappingURL=positionUtils.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/dragAndDropHandler/binarySearch.js
function binarySearch(items, compareFn) {
  let low = 0;
  let high = items.length;
  while (low < high) {
    const mid = low + high >> 1;
    const item = items[mid];
    if (item === undefined) {
      return null;
    }
    const compareResult = compareFn(item);
    if (compareResult > 0) {
      high = mid;
    } else if (compareResult < 0) {
      low = mid + 1;
    } else {
      return item;
    }
  }
  return null;
}


//# sourceMappingURL=binarySearch.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/dragAndDropHandler/dragElement.js
class DragElement {
  _element;
  _offsetX;
  _offsetY;
  constructor({
    autoEscape,
    nodeName,
    offsetX,
    offsetY,
    treeElement
  }) {
    this._offsetX = offsetX;
    this._offsetY = offsetY;
    this._element = this._createElement(nodeName, autoEscape);
    treeElement.appendChild(this._element);
  }
  move(pageX, pageY) {
    this._element.style.left = `${pageX - this._offsetX}px`;
    this._element.style.top = `${pageY - this._offsetY}px`;
  }
  remove() {
    this._element.remove();
  }
  _createElement(nodeName, autoEscape) {
    const element = document.createElement("span");
    element.classList.add("html-tree-title", "html-tree-dragging");
    if (autoEscape) {
      element.textContent = nodeName;
    } else {
      element.innerHTML = nodeName;
    }
    element.style.position = "absolute";
    return element;
  }
}


//# sourceMappingURL=dragElement.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/dragAndDropHandler/iterateVisibleNodes.js
const iterateVisibleNodes = (tree, {
  handleAfterOpenFolder,
  handleClosedFolder,
  handleFirstNode,
  handleNode,
  handleOpenFolder
}) => {
  let isFirstNode = true;
  const iterate = (node, nextNode) => {
    let mustIterateInside = (node.is_open === true || !node.element) && node.hasChildren();
    let element = null;

    // Is the element visible?
    if (node.element?.offsetParent) {
      element = node.element;
      if (isFirstNode) {
        handleFirstNode(node);
        isFirstNode = false;
      }
      if (!node.hasChildren()) {
        handleNode(node, nextNode, node.element);
      } else if (node.is_open) {
        if (!handleOpenFolder(node, node.element)) {
          mustIterateInside = false;
        }
      } else {
        handleClosedFolder(node, nextNode, element);
      }
    }
    if (mustIterateInside) {
      const childrenLength = node.children.length;
      node.children.forEach((_, i) => {
        const child = node.children[i];
        if (child) {
          if (i === childrenLength - 1) {
            iterate(child, null);
          } else {
            const nextChild = node.children[i + 1];
            if (nextChild) {
              iterate(child, nextChild);
            }
          }
        }
      });
      if (node.is_open && element) {
        handleAfterOpenFolder(node, nextNode);
      }
    }
  };
  iterate(tree, null);
};


//# sourceMappingURL=iterateVisibleNodes.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/dragAndDropHandler/generateHitAreas.js



const generateHitPositions = (tree, currentNode) => {
  const hitPositions = [];
  let lastTop = 0;
  const addHitPosition = (node, position, top) => {
    hitPositions.push({
      node,
      position,
      top
    });
    lastTop = top;
  };
  const handleAfterOpenFolder = (node, nextNode) => {
    if (node === currentNode || nextNode === currentNode) {
      // Cannot move before or after current item
      addHitPosition(node, null, lastTop);
    } else {
      addHitPosition(node, "after", lastTop);
    }
  };
  const handleClosedFolder = (node, nextNode, element) => {
    const top = getOffsetTop(element);
    if (node === currentNode) {
      // Cannot move after current item
      addHitPosition(node, null, top);
    } else {
      addHitPosition(node, "inside", top);

      // Cannot move before current item
      if (nextNode !== currentNode) {
        addHitPosition(node, "after", top);
      }
    }
  };
  const handleFirstNode = node => {
    if (node !== currentNode && node.element) {
      addHitPosition(node, "before", getOffsetTop(node.element));
    }
  };
  const handleNode = (node, nextNode, element) => {
    const top = getOffsetTop(element);
    if (node === currentNode) {
      // Cannot move inside current item
      addHitPosition(node, null, top);
    } else {
      addHitPosition(node, "inside", top);
    }
    if (nextNode === currentNode || node === currentNode) {
      // Cannot move before or after current item
      addHitPosition(node, null, top);
    } else {
      addHitPosition(node, "after", top);
    }
  };
  const handleOpenFolder = (node, element) => {
    if (node === currentNode) {
      // Cannot move inside current item

      // Dnd over the current element is not possible: add a position with type None for the top and the bottom.
      const top = getOffsetTop(element);
      const height = element.clientHeight;
      addHitPosition(node, null, top);
      if (height > 5) {
        // Subtract 5 pixels to allow more space for the next element.
        addHitPosition(node, null, top + height - 5);
      }

      // Stop iterating
      return false;
    }

    // Cannot move before current item
    if (node.children[0] !== currentNode) {
      addHitPosition(node, "inside", getOffsetTop(element));
    }

    // Continue iterating
    return true;
  };
  iterateVisibleNodes(tree, {
    handleAfterOpenFolder,
    handleClosedFolder,
    handleFirstNode,
    handleNode,
    handleOpenFolder
  });
  return hitPositions;
};
const generateHitAreasForGroup = (hitAreas, positionsInGroup, top, bottom) => {
  // limit positions in group
  const positionCount = Math.min(positionsInGroup.length, 4);
  const areaHeight = Math.round((bottom - top) / positionCount);
  let areaTop = top;
  for (let i = 0; i < positionCount; i++) {
    const position = positionsInGroup[i];
    if (position.position) {
      hitAreas.push({
        bottom: areaTop + areaHeight,
        node: position.node,
        position: position.position,
        top: areaTop
      });
    }
    areaTop += areaHeight;
  }
};
const generateHitAreasFromPositions = (hitPositions, treeBottom) => {
  if (!hitPositions.length) {
    return [];
  }
  let previousTop = hitPositions[0].top;
  let group = [];
  const hitAreas = [];
  for (const position of hitPositions) {
    if (position.top !== previousTop && group.length) {
      generateHitAreasForGroup(hitAreas, group, previousTop, position.top);
      previousTop = position.top;
      group = [];
    }
    group.push(position);
  }
  generateHitAreasForGroup(hitAreas, group, previousTop, treeBottom);
  return hitAreas;
};
const generateHitAreas = (tree, currentNode, treeBottom) => generateHitAreasFromPositions(generateHitPositions(tree, currentNode), treeBottom);


//# sourceMappingURL=generateHitAreas.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/dragAndDropHandler/index.js





class DragAndDropHandler {
  currentItem;
  hitAreas;
  hoveredArea;
  isDragging;
  _autoEscape;
  _dragElement;
  _getNodeElement;
  _getNodeElementForNode;
  _getScrollLeft;
  _getTree;
  _onCanMove;
  _onCanMoveTo;
  _onDragMove;
  _onDragStop;
  _onIsMoveHandle;
  _openFolderDelay;
  _openFolderTimer;
  _openNode;
  _previousGhost;
  _refreshElements;
  _slide;
  _treeElement;
  _triggerEvent;
  constructor({
    autoEscape,
    getNodeElement,
    getNodeElementForNode,
    getScrollLeft,
    getTree,
    onCanMove,
    onCanMoveTo,
    onDragMove,
    onDragStop,
    onIsMoveHandle,
    openFolderDelay,
    openNode,
    refreshElements,
    slide,
    treeElement,
    triggerEvent
  }) {
    this._autoEscape = autoEscape;
    this._getNodeElement = getNodeElement;
    this._getNodeElementForNode = getNodeElementForNode;
    this._getScrollLeft = getScrollLeft;
    this._getTree = getTree;
    this._onCanMove = onCanMove;
    this._onCanMoveTo = onCanMoveTo;
    this._onDragMove = onDragMove;
    this._onDragStop = onDragStop;
    this._onIsMoveHandle = onIsMoveHandle;
    this._openFolderDelay = openFolderDelay;
    this._openNode = openNode;
    this._refreshElements = refreshElements;
    this._slide = slide;
    this._treeElement = treeElement;
    this._triggerEvent = triggerEvent;
    this.hoveredArea = null;
    this.hitAreas = [];
    this.isDragging = false;
    this.currentItem = null;
    this._dragElement = null;
    this._openFolderTimer = null;
    this._previousGhost = null;
  }
  mouseCapture(positionInfo) {
    const element = positionInfo.target;
    if (!this._mustCaptureElement(element)) {
      return null;
    }
    if (this._onIsMoveHandle && !this._onIsMoveHandle(element)) {
      return null;
    }
    let nodeElement = this._getNodeElement(element);
    if (nodeElement && this._onCanMove) {
      if (!this._onCanMove(nodeElement.node)) {
        nodeElement = null;
      }
    }
    this.currentItem = nodeElement;
    return this.currentItem != null;
  }
  mouseDrag(positionInfo) {
    if (!this.currentItem || !this._dragElement) {
      return false;
    }
    this._dragElement.move(positionInfo.pageX, positionInfo.pageY);
    const area = this._findHoveredArea(positionInfo.pageX, positionInfo.pageY);
    if (area && this._canMoveToArea(area, this.currentItem)) {
      if (!area.node.isFolder()) {
        this._stopOpenFolderTimer();
      }
      if (this.hoveredArea !== area) {
        this.hoveredArea = area;

        // If this is a closed folder, start timer to open it
        if (this._mustOpenFolderTimer(area)) {
          this._startOpenFolderTimer(area.node);
        } else {
          this._stopOpenFolderTimer();
        }
        this._updateDropHint();
      }
    } else {
      this._removeDropHint();
      this._stopOpenFolderTimer();
      this.hoveredArea = area;
    }
    if (!area) {
      if (this._onDragMove) {
        this._onDragMove(this.currentItem.node, positionInfo.originalEvent);
      }
    }
    return true;
  }
  mouseStart(positionInfo) {
    if (!this.currentItem) {
      return false;
    }
    this.refresh();
    const {
      left,
      top
    } = getElementPosition(positionInfo.target);
    const node = this.currentItem.node;
    this._dragElement = new DragElement({
      autoEscape: this._autoEscape ?? true,
      nodeName: node.name,
      offsetX: positionInfo.pageX - left,
      offsetY: positionInfo.pageY - top,
      treeElement: this._treeElement
    });
    this.isDragging = true;
    this.currentItem.element.classList.add("html-tree-moving");
    return true;
  }
  mouseStop(positionInfo) {
    this._moveItem(positionInfo);
    this._clear();
    this._removeHover();
    this._removeDropHint();
    this._removeHitAreas();
    const currentItem = this.currentItem;
    if (this.currentItem) {
      this.currentItem.element.classList.remove("html-tree-moving");
      this.currentItem = null;
    }
    this.isDragging = false;
    if (!this.hoveredArea && currentItem) {
      if (this._onDragStop) {
        this._onDragStop(currentItem.node, positionInfo.originalEvent);
      }
    }
    return false;
  }
  refresh() {
    this._removeHitAreas();
    if (this.currentItem) {
      const currentNode = this.currentItem.node;
      this._generateHitAreas(currentNode);
      this.currentItem = this._getNodeElementForNode(currentNode);
      if (this.isDragging) {
        this.currentItem.element.classList.add("html-tree-moving");
      }
    }
  }
  _canMoveToArea(area, currentItem) {
    if (!this._onCanMoveTo) {
      return true;
    }
    return this._onCanMoveTo(currentItem.node, area.node, area.position);
  }
  _clear() {
    if (this._dragElement) {
      this._dragElement.remove();
      this._dragElement = null;
    }
  }
  _findHoveredArea(x, y) {
    const dimensions = this._getTreeDimensions();
    if (x < dimensions.left || y < dimensions.top || x > dimensions.right || y > dimensions.bottom) {
      return null;
    }
    return binarySearch(this.hitAreas, area => {
      if (y < area.top) {
        return 1;
      } else if (y > area.bottom) {
        return -1;
      } else {
        return 0;
      }
    });
  }
  _generateHitAreas(currentNode) {
    const tree = this._getTree();
    if (!tree) {
      this.hitAreas = [];
    } else {
      this.hitAreas = generateHitAreas(tree, currentNode, this._getTreeDimensions().bottom);
    }
  }
  _getTreeDimensions() {
    // Return the dimensions of the tree. Add a margin to the bottom to allow
    // to drag-and-drop after the last element.
    const treePosition = getElementPosition(this._treeElement);
    const left = treePosition.left + this._getScrollLeft();
    const top = treePosition.top;
    return {
      bottom: top + this._treeElement.clientHeight + 16,
      left,
      right: left + this._treeElement.clientWidth,
      top
    };
  }

  /* Move the dragged node to the selected position in the tree. */
  _moveItem(positionInfo) {
    if (this.currentItem && this.hoveredArea?.position && this._canMoveToArea(this.hoveredArea, this.currentItem)) {
      const movedNode = this.currentItem.node;
      const targetNode = this.hoveredArea.node;
      const position = this.hoveredArea.position;
      const previousParent = movedNode.parent;
      if (position === "inside") {
        this.hoveredArea.node.is_open = true;
      }
      const doMove = () => {
        const tree = this._getTree();
        if (tree) {
          tree.moveNode(movedNode, targetNode, position);
          this._treeElement.textContent = "";
          this._refreshElements(null);
        }
      };
      if (this._triggerEvent("tree.move", {
        move_info: {
          do_move: doMove,
          moved_node: movedNode,
          original_event: positionInfo.originalEvent,
          position,
          previous_parent: previousParent,
          target_node: targetNode
        }
      })) {
        doMove();
      }
    }
  }
  _mustCaptureElement(element) {
    const nodeName = element.nodeName;
    return nodeName !== "INPUT" && nodeName !== "SELECT" && nodeName !== "TEXTAREA";
  }
  _mustOpenFolderTimer(area) {
    const node = area.node;
    return node.isFolder() && !node.is_open && area.position === "inside";
  }
  _removeDropHint() {
    if (this._previousGhost) {
      this._previousGhost.remove();
    }
  }
  _removeHitAreas() {
    this.hitAreas = [];
  }
  _removeHover() {
    this.hoveredArea = null;
  }
  _startOpenFolderTimer(folder) {
    const openFolder = () => {
      this._openNode(folder, this._slide, () => {
        this.refresh();
        this._updateDropHint();
      });
    };
    this._stopOpenFolderTimer();
    const openFolderDelay = this._openFolderDelay;
    if (openFolderDelay !== false) {
      this._openFolderTimer = window.setTimeout(openFolder, openFolderDelay);
    }
  }
  _stopOpenFolderTimer() {
    if (this._openFolderTimer) {
      clearTimeout(this._openFolderTimer);
      this._openFolderTimer = null;
    }
  }
  _updateDropHint() {
    if (!this.hoveredArea) {
      return;
    }

    // remove previous drop hint
    this._removeDropHint();

    // add new drop hint
    const nodeElement = this._getNodeElementForNode(this.hoveredArea.node);
    this._previousGhost = nodeElement.addDropHint(this.hoveredArea.position);
  }
}


//# sourceMappingURL=index.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/util.js
const isInt = n => typeof n === "number" && n % 1 === 0;
const getBoolString = value => value ? "true" : "false";


//# sourceMappingURL=util.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/elementsRenderer.js


class ElementsRenderer {
  closedIconElement;
  openedIconElement;
  _autoEscape;
  _buttonLeft;
  _dragAndDrop;
  _getTree;
  _htmlElement;
  _isNodeSelected;
  _onCreateLi;
  _rtl;
  _setNodeElement;
  _showEmptyFolder;
  _tabIndex;
  constructor({
    autoEscape,
    buttonLeft,
    closedIcon,
    dragAndDrop,
    getTree,
    htmlElement,
    isNodeSelected,
    onCreateLi,
    openedIcon,
    rtl,
    setNodeElement,
    showEmptyFolder,
    tabIndex
  }) {
    this._autoEscape = autoEscape;
    this._buttonLeft = buttonLeft;
    this._dragAndDrop = dragAndDrop;
    this._getTree = getTree;
    this._htmlElement = htmlElement;
    this._isNodeSelected = isNodeSelected;
    this._onCreateLi = onCreateLi;
    this._rtl = rtl;
    this._setNodeElement = setNodeElement;
    this._showEmptyFolder = showEmptyFolder;
    this._tabIndex = tabIndex;
    this.openedIconElement = this._createButtonElement(openedIcon ?? "+");
    this.closedIconElement = this._createButtonElement(closedIcon ?? "-");
  }
  render(fromNode) {
    if (fromNode?.parent) {
      this.renderFromNode(fromNode);
    } else {
      this.renderFromRoot();
    }
  }
  renderFromNode(node) {
    if (!node.element) {
      return;
    }
    const currentLi = node.element;
    const newLi = this._createLi(node, node.getLevel());
    currentLi.replaceWith(newLi);

    // create children
    this._createDomElements(newLi, node.children, false, node.getLevel() + 1);
  }
  renderFromRoot() {
    this._htmlElement.textContent = '';
    const tree = this._getTree();
    if (tree) {
      this._createDomElements(this._htmlElement, tree.children, true, 1);
    }
  }
  _attachNodeData(node, li) {
    node.element = li;
    this._setNodeElement(li, node);
  }
  _createButtonElement(value) {
    if (typeof value === "string") {
      // convert value to html
      const div = document.createElement("div");
      div.innerHTML = value;
      return document.createTextNode(div.innerHTML);
    } else if (value.nodeType) {
      return value;
    } else {
      return undefined;
    }
  }
  _createDomElements(element, children, isRootNode, level) {
    const ul = this._createUl(isRootNode);
    element.appendChild(ul);
    for (const child of children) {
      const li = this._createLi(child, level);
      ul.appendChild(li);
      if (child.hasChildren()) {
        this._createDomElements(li, child.children, false, level + 1);
      }
    }
  }
  _createFolderLi(node, level, isSelected) {
    const buttonClasses = this._getButtonClasses(node);
    const folderClasses = this._getFolderClasses(node, isSelected);
    const iconElement = node.is_open ? this.openedIconElement : this.closedIconElement;

    // li
    const li = document.createElement("li");
    li.className = `html-tree-common ${folderClasses}`;
    li.setAttribute("role", "none");

    // div
    const div = document.createElement("div");
    div.className = "html-tree-element html-tree-common";
    div.setAttribute("role", "none");
    li.appendChild(div);

    // button link
    const buttonLink = document.createElement("a");
    buttonLink.className = buttonClasses;
    if (iconElement) {
      buttonLink.appendChild(iconElement.cloneNode(true));
    }
    if (this._buttonLeft) {
      div.appendChild(buttonLink);
    }

    // title span
    const titleSpan = this._createTitleSpan(node.name, isSelected, true, level);
    titleSpan.setAttribute("aria-expanded", getBoolString(node.is_open));
    div.appendChild(titleSpan);
    if (!this._buttonLeft) {
      div.appendChild(buttonLink);
    }
    return li;
  }

  /* Create the <li> element
   * Attach it to node.element.
   * Call onCreateLi
   */
  _createLi(node, level) {
    const isSelected = this._isNodeSelected(node);
    const mustShowFolder = node.isFolder() || node.isEmptyFolder && this._showEmptyFolder;
    const li = mustShowFolder ? this._createFolderLi(node, level, isSelected) : this._createNodeLi(node, level, isSelected);
    this._attachNodeData(node, li);
    if (this._onCreateLi) {
      this._onCreateLi(node, li, isSelected);
    }
    return li;
  }
  _createNodeLi(node, level, isSelected) {
    const liClasses = ["html-tree-common"];
    if (isSelected) {
      liClasses.push("html-tree-selected");
    }
    const classString = liClasses.join(" ");

    // li
    const li = document.createElement("li");
    li.className = classString;
    li.setAttribute("role", "none");

    // div
    const div = document.createElement("div");
    div.className = "html-tree-element html-tree-common";
    div.setAttribute("role", "none");
    li.appendChild(div);

    // title span
    const titleSpan = this._createTitleSpan(node.name, isSelected, false, level);
    div.appendChild(titleSpan);
    return li;
  }
  _createTitleSpan(nodeName, isSelected, isFolder, level) {
    const titleSpan = document.createElement("span");
    let classes = "html-tree-title html-tree-common";
    if (isFolder) {
      classes += " html-tree-title-folder";
    }
    classes += ` html-tree-title-button-${this._buttonLeft ? "left" : "right"}`;
    titleSpan.className = classes;
    if (isSelected) {
      const tabIndex = this._tabIndex;
      if (tabIndex !== undefined) {
        titleSpan.setAttribute("tabindex", `${tabIndex}`);
      }
    }
    this._setTreeItemAriaAttributes(titleSpan, nodeName, level, isSelected);
    if (this._autoEscape) {
      titleSpan.textContent = nodeName;
    } else {
      titleSpan.innerHTML = nodeName;
    }
    return titleSpan;
  }
  _createUl(isRootNode) {
    let classString;
    let role;
    if (!isRootNode) {
      classString = "";
      role = "group";
    } else {
      classString = "html-tree";
      role = "tree";
      if (this._rtl) {
        classString += " html-tree-rtl";
      }
    }
    if (this._dragAndDrop) {
      classString += " html-tree-dnd";
    }
    const ul = document.createElement("ul");
    ul.className = `html-tree-common ${classString}`;
    ul.setAttribute("role", role);
    return ul;
  }
  _getButtonClasses(node) {
    const classes = ["html-tree-toggler", "html-tree-common"];
    if (!node.is_open) {
      classes.push("html-tree-closed");
    }
    if (this._buttonLeft) {
      classes.push("html-tree-toggler-left");
    } else {
      classes.push("html-tree-toggler-right");
    }
    return classes.join(" ");
  }
  _getFolderClasses(node, isSelected) {
    const classes = ["html-tree-folder"];
    if (!node.is_open) {
      classes.push("html-tree-closed");
    }
    if (isSelected) {
      classes.push("html-tree-selected");
    }
    if (node.is_loading) {
      classes.push("html-tree-loading");
    }
    return classes.join(" ");
  }
  _setTreeItemAriaAttributes(element, name, level, isSelected) {
    element.setAttribute("aria-label", name);
    element.setAttribute("aria-level", `${level}`);
    element.setAttribute("aria-selected", getBoolString(isSelected));
    element.setAttribute("role", "treeitem");
  }
}


//# sourceMappingURL=elementsRenderer.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/keyHandler.js
class KeyHandler {
  _closeNode;
  _getSelectedNode;
  _isFocusOnTree;
  _keyboardSupport;
  _openNode;
  _originalSelectNode;
  constructor({
    closeNode,
    getSelectedNode,
    isFocusOnTree,
    keyboardSupport,
    openNode,
    selectNode
  }) {
    this._closeNode = closeNode;
    this._getSelectedNode = getSelectedNode;
    this._isFocusOnTree = isFocusOnTree;
    this._keyboardSupport = keyboardSupport;
    this._openNode = openNode;
    this._originalSelectNode = selectNode;
    if (keyboardSupport) {
      document.addEventListener("keydown", this._handleKeyDown);
    }
  }
  deinit() {
    if (this._keyboardSupport) {
      document.removeEventListener("keydown", this._handleKeyDown);
    }
  }
  moveDown(selectedNode) {
    return this._selectNode(selectedNode.getNextVisibleNode());
  }
  moveUp(selectedNode) {
    return this._selectNode(selectedNode.getPreviousVisibleNode());
  }
  _canHandleKeyboard() {
    return this._keyboardSupport && this._isFocusOnTree();
  }
  _handleKeyDown = e => {
    if (!this._canHandleKeyboard()) {
      return;
    }
    let isKeyHandled = false;
    const selectedNode = this._getSelectedNode();
    if (selectedNode) {
      switch (e.key) {
        case "ArrowDown":
          isKeyHandled = this.moveDown(selectedNode);
          break;
        case "ArrowLeft":
          isKeyHandled = this._moveLeft(selectedNode);
          break;
        case "ArrowRight":
          isKeyHandled = this._moveRight(selectedNode);
          break;
        case "ArrowUp":
          isKeyHandled = this.moveUp(selectedNode);
          break;
      }
    }
    if (isKeyHandled) {
      e.preventDefault();
    }
  };
  _moveLeft(selectedNode) {
    if (selectedNode.isFolder() && selectedNode.is_open) {
      // Left on an open node closes the node
      this._closeNode(selectedNode);
      return true;
    } else {
      // Left on a closed or end node moves focus to the node's parent
      return this._selectNode(selectedNode.getParent());
    }
  }
  _moveRight(selectedNode) {
    if (!selectedNode.isFolder()) {
      return false;
    } else {
      // folder node
      if (selectedNode.is_open) {
        // Right moves to the first child of an open node
        return this._selectNode(selectedNode.getNextVisibleNode());
      } else {
        // Right expands a closed node
        this._openNode(selectedNode);
        return true;
      }
    }
  }

  /* Select the node.
   * Don't do anything if the node is null.
   * Result: a different node was selected.
   */
  _selectNode(node) {
    if (!node) {
      return false;
    } else {
      this._originalSelectNode(node);
      return true;
    }
  }
}


//# sourceMappingURL=keyHandler.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/mouseUtils.js
const getPositionInfoFromMouseEvent = e => ({
  originalEvent: e,
  pageX: e.pageX,
  pageY: e.pageY,
  target: e.target
});
const getPositionInfoFromTouch = (touch, e) => ({
  originalEvent: e,
  pageX: touch.pageX,
  pageY: touch.pageY,
  target: touch.target
});


//# sourceMappingURL=mouseUtils.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/mouseHandler.js


class MouseHandler {
  _element;
  _getMouseDelay;
  _getNode;
  _isMouseDelayMet;
  _isMouseStarted;
  _mouseDelayTimer;
  _mouseDownInfo;
  _onClickButton;
  _onClickTitle;
  _onMouseCapture;
  _onMouseDrag;
  _onMouseStart;
  _onMouseStop;
  _triggerEvent;
  _useContextMenu;
  constructor({
    element,
    getMouseDelay,
    getNode,
    onClickButton,
    onClickTitle,
    onMouseCapture,
    onMouseDrag,
    onMouseStart,
    onMouseStop,
    triggerEvent,
    useContextMenu
  }) {
    this._element = element;
    this._getMouseDelay = getMouseDelay;
    this._getNode = getNode;
    this._onClickButton = onClickButton;
    this._onClickTitle = onClickTitle;
    this._onMouseCapture = onMouseCapture;
    this._onMouseDrag = onMouseDrag;
    this._onMouseStart = onMouseStart;
    this._onMouseStop = onMouseStop;
    this._triggerEvent = triggerEvent;
    this._useContextMenu = useContextMenu;
    element.addEventListener("click", this._handleClick);
    element.addEventListener("dblclick", this._handleDblclick);
    element.addEventListener("mousedown", this._mouseDown, {
      passive: false
    });
    element.addEventListener("touchstart", this._touchStart, {
      passive: false
    });
    if (useContextMenu) {
      element.addEventListener("contextmenu", this._handleContextmenu);
    }
    this._isMouseStarted = false;
    this._mouseDelayTimer = null;
    this._isMouseDelayMet = false;
    this._mouseDownInfo = null;
  }
  deinit() {
    this._element.removeEventListener("click", this._handleClick);
    this._element.removeEventListener("dblclick", this._handleDblclick);
    if (this._useContextMenu) {
      this._element.removeEventListener("contextmenu", this._handleContextmenu);
    }
    this._element.removeEventListener("mousedown", this._mouseDown);
    this._element.removeEventListener("touchstart", this._touchStart);
    this._removeMouseMoveEventListeners();
  }
  _getClickTarget(element) {
    const button = element.closest(".html-tree-toggler");
    if (button) {
      const node = this._getNode(button);
      if (node) {
        return {
          node,
          type: "button"
        };
      }
    } else {
      const treeElement = element.closest(".html-tree-element");
      if (treeElement) {
        const node = this._getNode(treeElement);
        if (node) {
          return {
            node,
            type: "label"
          };
        }
      }
    }
    return null;
  }
  _handleClick = e => {
    if (!e.target) {
      return;
    }
    const clickTarget = this._getClickTarget(e.target);
    if (!clickTarget) {
      return;
    }
    switch (clickTarget.type) {
      case "button":
        this._onClickButton(clickTarget.node);
        e.preventDefault();
        e.stopPropagation();
        break;
      case "label":
        {
          if (this._triggerEvent("tree.click", {
            click_event: e,
            node: clickTarget.node
          })) {
            this._onClickTitle(clickTarget.node);
          }
          break;
        }
    }
  };
  _handleContextmenu = e => {
    if (!e.target) {
      return;
    }
    const div = e.target.closest("ul.html-tree .html-tree-element");
    if (div) {
      const node = this._getNode(div);
      if (node) {
        e.preventDefault();
        e.stopPropagation();
        this._triggerEvent("tree.contextmenu", {
          click_event: e,
          node
        });
        return false;
      }
    }
    return null;
  };
  _handleDblclick = e => {
    if (!e.target) {
      return;
    }
    const clickTarget = this._getClickTarget(e.target);
    if (clickTarget?.type === "label") {
      this._triggerEvent("tree.dblclick", {
        click_event: e,
        node: clickTarget.node
      });
    }
  };
  _handleMouseDown(positionInfo) {
    // We may have missed mouseup (out of window)
    if (this._isMouseStarted) {
      this._handleMouseUp(positionInfo);
    }
    this._mouseDownInfo = positionInfo;
    if (!this._onMouseCapture(positionInfo)) {
      return false;
    }
    this._handleStartMouse();
    return true;
  }
  _handleMouseMove(e, positionInfo) {
    if (this._isMouseStarted) {
      this._onMouseDrag(positionInfo);
      if (e.cancelable) {
        e.preventDefault();
      }
      return;
    }
    if (!this._isMouseDelayMet) {
      return;
    }
    if (this._mouseDownInfo) {
      this._isMouseStarted = this._onMouseStart(this._mouseDownInfo);
    }
    if (this._isMouseStarted) {
      this._onMouseDrag(positionInfo);
      if (e.cancelable) {
        e.preventDefault();
      }
    } else {
      this._handleMouseUp(positionInfo);
    }
  }
  _handleMouseUp(positionInfo) {
    this._removeMouseMoveEventListeners();
    this._isMouseDelayMet = false;
    this._mouseDownInfo = null;
    if (this._isMouseStarted) {
      this._isMouseStarted = false;
      this._onMouseStop(positionInfo);
    }
  }
  _handleStartMouse() {
    document.addEventListener("mousemove", this._mouseMove, {
      passive: false
    });
    document.addEventListener("touchmove", this._touchMove, {
      passive: false
    });
    document.addEventListener("mouseup", this._mouseUp, {
      passive: false
    });
    document.addEventListener("touchend", this._touchEnd, {
      passive: false
    });
    const mouseDelay = this._getMouseDelay();
    if (mouseDelay) {
      this._startMouseDelayTimer(mouseDelay);
    } else {
      this._isMouseDelayMet = true;
    }
  }
  _mouseDown = e => {
    // Left mouse button?
    if (e.button !== 0) {
      return;
    }
    const result = this._handleMouseDown(getPositionInfoFromMouseEvent(e));
    if (result && e.cancelable) {
      e.preventDefault();
    }
  };
  _mouseMove = e => {
    this._handleMouseMove(e, getPositionInfoFromMouseEvent(e));
  };
  _mouseUp = e => {
    this._handleMouseUp(getPositionInfoFromMouseEvent(e));
  };
  _removeMouseMoveEventListeners() {
    document.removeEventListener("mousemove", this._mouseMove);
    document.removeEventListener("touchmove", this._touchMove);
    document.removeEventListener("mouseup", this._mouseUp);
    document.removeEventListener("touchend", this._touchEnd);
  }
  _startMouseDelayTimer(mouseDelay) {
    if (this._mouseDelayTimer) {
      clearTimeout(this._mouseDelayTimer);
    }
    this._mouseDelayTimer = window.setTimeout(() => {
      if (this._mouseDownInfo) {
        this._isMouseDelayMet = true;
      }
    }, mouseDelay);
    this._isMouseDelayMet = false;
  }
  _touchEnd = e => {
    if (e.touches.length > 1) {
      return;
    }
    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    this._handleMouseUp(getPositionInfoFromTouch(touch, e));
  };
  _touchMove = e => {
    if (e.touches.length > 1) {
      return;
    }
    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    this._handleMouseMove(e, getPositionInfoFromTouch(touch, e));
  };
  _touchStart = e => {
    if (e.touches.length > 1) {
      return;
    }
    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    this._handleMouseDown(getPositionInfoFromTouch(touch, e));
  };
}


//# sourceMappingURL=mouseHandler.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/nodeUtils.js
const isNodeRecordWithChildren = data => typeof data === "object" && "children" in data && data.children instanceof Array;


//# sourceMappingURL=nodeUtils.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/node.js


/*
A node reads and writes the private members of other nodes (node.setParent),
so the `_` prefix that the build adds cannot be limited to `this.`:

prefix-private-members: all
*/

class Node {
  children;
  element;
  id;
  idMapping;
  is_loading;
  is_open;
  isEmptyFolder;
  load_on_demand;
  name;
  nodeClass;
  parent;
  tree;
  constructor(nodeData = null, isRoot = false, nodeClass = Node) {
    this.name = "";
    this.load_on_demand = false;
    this.isEmptyFolder = nodeData != null && isNodeRecordWithChildren(nodeData) && nodeData.children.length === 0;
    this.setData(nodeData);
    this.children = [];
    this.parent = null;
    this.is_loading = undefined;
    this.is_open ??= undefined;
    if (isRoot) {
      this.idMapping = new Map();
      this.tree = this;
      this.nodeClass = nodeClass;
    } else {
      this.idMapping = undefined;
    }
  }
  addAfter(nodeInfo) {
    if (!this.parent) {
      return null;
    } else {
      const node = this._createNode(nodeInfo);
      const childIndex = this.parent.getChildIndex(this);
      this.parent.addChildAtPosition(node, childIndex + 1);
      node._loadChildrenFromData(nodeInfo);
      return node;
    }
  }
  addBefore(nodeInfo) {
    if (!this.parent) {
      return null;
    } else {
      const node = this._createNode(nodeInfo);
      const childIndex = this.parent.getChildIndex(this);
      this.parent.addChildAtPosition(node, childIndex);
      node._loadChildrenFromData(nodeInfo);
      return node;
    }
  }

  /*
  Add child.
   tree.addChild(
      new Node('child1')
  );
  */
  addChild(node) {
    this.children.push(node);
    node._setParent(this);
  }

  /*
  Add child at position. Index starts at 0.
   tree.addChildAtPosition(
      new Node('abc'),
      1
  );
  */
  addChildAtPosition(node, index) {
    this.children.splice(index, 0, node);
    node._setParent(this);
  }
  addNodeToIndex(node) {
    if (node.id != null) {
      this.idMapping?.set(node.id, node);
    }
  }
  addParent(nodeInfo) {
    if (!this.parent) {
      return null;
    } else {
      const newParent = this._createNode(nodeInfo);
      if (this.tree) {
        newParent._setParent(this.tree);
      }
      const originalParent = this.parent;
      for (const child of originalParent.children) {
        newParent.addChild(child);
      }
      originalParent.children = [];
      originalParent.addChild(newParent);
      return newParent;
    }
  }
  append(nodeInfo) {
    const node = this._createNode(nodeInfo);
    this.addChild(node);
    node._loadChildrenFromData(nodeInfo);
    return node;
  }
  filter(f) {
    const result = [];
    this.iterate(node => {
      if (f(node)) {
        result.push(node);
      }
      return true;
    });
    return result;
  }

  /*
  Get child index.
   var index = getChildIndex(node);
  */
  getChildIndex(node) {
    return this.children.indexOf(node);
  }

  /*
  Get the tree as data.
  */
  getData(includeParent = false) {
    const getDataFromNodes = nodes => {
      return nodes.map(node => {
        const tmpNode = {};
        for (const k in node) {
          if (["parent", "children", "element", "idMapping", "load_on_demand", "nodeClass", "tree", "isEmptyFolder"].indexOf(k) === -1 && Object.prototype.hasOwnProperty.call(node, k)) {
            const v = node[k];
            tmpNode[k] = v;
          }
        }
        if (node.hasChildren()) {
          tmpNode.children = getDataFromNodes(node.children);
        }
        return tmpNode;
      });
    };
    if (includeParent) {
      return getDataFromNodes([this]);
    } else {
      return getDataFromNodes(this.children);
    }
  }
  getLastChild() {
    if (!this.hasChildren()) {
      return null;
    } else {
      const lastChild = this.children[this.children.length - 1];
      if (!(lastChild.hasChildren() && lastChild.is_open)) {
        return lastChild;
      } else {
        return lastChild.getLastChild();
      }
    }
  }
  getLevel() {
    let level = 0;
    let node = this; // eslint-disable-line @typescript-eslint/no-this-alias

    while (node.parent) {
      level += 1;
      node = node.parent;
    }
    return level;
  }
  getNextNode(includeChildren = true) {
    if (includeChildren && this.hasChildren()) {
      return this.children[0] ?? null;
    } else if (!this.parent) {
      return null;
    } else {
      const nextSibling = this.getNextSibling();
      if (nextSibling) {
        return nextSibling;
      } else {
        return this.parent.getNextNode(false);
      }
    }
  }
  getNextSibling() {
    if (!this.parent) {
      return null;
    } else {
      const nextIndex = this.parent.getChildIndex(this) + 1;
      if (nextIndex < this.parent.children.length) {
        return this.parent.children[nextIndex] ?? null;
      } else {
        return null;
      }
    }
  }
  getNextVisibleNode() {
    if (this.hasChildren() && this.is_open) {
      // First child
      return this.children[0] ?? null;
    } else {
      if (!this.parent) {
        return null;
      } else {
        const nextSibling = this.getNextSibling();
        if (nextSibling) {
          // Next sibling
          return nextSibling;
        } else {
          // Next node of parent
          return this.parent.getNextNode(false);
        }
      }
    }
  }
  getNodeByCallback(callback) {
    let result = null;
    this.iterate(node => {
      if (result) {
        return false;
      } else if (callback(node)) {
        result = node;
        return false;
      } else {
        return true;
      }
    });
    return result;
  }
  getNodeById(nodeId) {
    return this.idMapping?.get(nodeId) ?? null;
  }
  getNodeByName(name) {
    return this.getNodeByCallback(node => node.name === name);
  }
  getNodeByNameMustExist(name) {
    const node = this.getNodeByCallback(n => n.name === name);
    if (!node) {
      throw new Error(`Node with name ${name} not found`);
    }
    return node;
  }
  getNodesByProperty(key, value) {
    return this.filter(node => node[key] === value);
  }
  getParent() {
    // Return parent except if it is the root node
    if (!this.parent) {
      return null;
    } else if (!this.parent.parent) {
      // Root node -> null
      return null;
    } else {
      return this.parent;
    }
  }
  getPreviousNode() {
    if (!this.parent) {
      return null;
    } else {
      const previousSibling = this.getPreviousSibling();
      if (!previousSibling) {
        return this.getParent();
      } else if (previousSibling.hasChildren()) {
        return previousSibling.getLastChild();
      } else {
        return previousSibling;
      }
    }
  }
  getPreviousSibling() {
    if (!this.parent) {
      return null;
    } else {
      const previousIndex = this.parent.getChildIndex(this) - 1;
      if (previousIndex >= 0) {
        return this.parent.children[previousIndex] ?? null;
      } else {
        return null;
      }
    }
  }
  getPreviousVisibleNode() {
    if (!this.parent) {
      return null;
    } else {
      const previousSibling = this.getPreviousSibling();
      if (!previousSibling) {
        return this.getParent();
      } else if (!previousSibling.hasChildren() || !previousSibling.is_open) {
        // Previous sibling
        return previousSibling;
      } else {
        // Last child of previous sibling
        return previousSibling.getLastChild();
      }
    }
  }

  /*
  Does the tree have children?
   if (tree.hasChildren()) {
      //
  }
  */
  hasChildren() {
    return this.children.length !== 0;
  }

  // Init Node from data without making it the root of the tree
  initFromData(data) {
    const addNode = nodeData => {
      this.setData(nodeData);
      if (isNodeRecordWithChildren(nodeData) && nodeData.children.length) {
        addChildren(nodeData.children);
      }
    };
    const addChildren = childrenData => {
      for (const child of childrenData) {
        const node = this._createNode();
        node.initFromData(child);
        this.addChild(node);
      }
    };
    addNode(data);
  }
  isFolder() {
    return this.hasChildren() || this.load_on_demand;
  }
  isParentOf(node) {
    let parent = node.parent;
    while (parent) {
      if (parent === this) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }

  /*
  Iterate over all the nodes in the tree.
   Calls callback with (node, level).
   The callback must return true to continue the iteration on current node.
   tree.iterate(
      function(node, level) {
         console.log(node.name);
          // stop iteration after level 2
         return (level <= 2);
      }
  );
   */
  iterate(callback) {
    const _iterate = (node, level) => {
      for (const child of node.children) {
        const result = callback(child, level);
        if (result && child.hasChildren()) {
          _iterate(child, level + 1);
        }
      }
    };
    _iterate(this, 0);
  }

  /*
  Create tree from data.
   Structure of data is:
  [
      {
          name: 'node1',
          children: [
              { name: 'child1' },
              { name: 'child2' }
          ]
      },
      {
          name: 'node2'
      }
  ]
  */
  loadFromData(data) {
    this.removeChildren();
    for (const childData of data) {
      const node = this._createNode(childData);
      this.addChild(node);
      if (isNodeRecordWithChildren(childData)) {
        node.loadFromData(childData.children);
      }
    }
    return this;
  }

  /*
  Move node relative to another node.
   Argument position: Position.BEFORE, Position.AFTER or Position.Inside
   // move node1 after node2
  tree.moveNode(node1, node2, Position.AFTER);
  */
  moveNode(movedNode, targetNode, position) {
    if (!movedNode.parent || movedNode.isParentOf(targetNode)) {
      // - Node is parent of target node
      // - Or, parent is empty
      return false;
    } else {
      movedNode.parent._doRemoveChild(movedNode);
      switch (position) {
        case "after":
          {
            if (targetNode.parent) {
              targetNode.parent.addChildAtPosition(movedNode, targetNode.parent.getChildIndex(targetNode) + 1);
              return true;
            }
            return false;
          }
        case "before":
          {
            if (targetNode.parent) {
              targetNode.parent.addChildAtPosition(movedNode, targetNode.parent.getChildIndex(targetNode));
              return true;
            }
            return false;
          }
        case "inside":
          {
            // move inside as first child
            targetNode.addChildAtPosition(movedNode, 0);
            return true;
          }
      }
    }
  }
  prepend(nodeInfo) {
    const node = this._createNode(nodeInfo);
    this.addChildAtPosition(node, 0);
    node._loadChildrenFromData(nodeInfo);
    return node;
  }
  remove() {
    if (this.parent) {
      this.parent.removeChild(this);
      this.parent = null;
    }
  }

  /*
  Remove child. This also removes the children of the node.
   tree.removeChild(tree.children[0]);
  */
  removeChild(node) {
    // remove children from the index
    node.removeChildren();
    this._doRemoveChild(node);
  }
  removeChildren() {
    this.iterate(child => {
      this.tree?.removeNodeFromIndex(child);
      return true;
    });
    this.children = [];
  }
  removeNodeFromIndex(node) {
    if (node.id != null) {
      this.idMapping?.delete(node.id);
    }
  }

  /*
  Set the data of this node.
   setData(string): set the name of the node
  setData(object): set attributes of the node
   Examples:
      setData('node1')
       setData({ name: 'node1', id: 1});
       setData({ name: 'node2', id: 2, color: 'green'});
   * This is an internal function; it is not in the docs
  * Does not remove existing node values
  */
  setData(o) {
    if (!o) {
      return;
    } else if (typeof o === "string") {
      this.name = o;
    } else if (typeof o === "object") {
      for (const key in o) {
        if (Object.prototype.hasOwnProperty.call(o, key)) {
          const value = o[key];
          if (key === "label" || key === "name") {
            // You can use the 'label' key instead of 'name'; this is a legacy feature
            if (typeof value === "string") {
              this.name = value;
            }
          } else if (key !== "children" && key !== "parent") {
            // You can't update the children or the parent using this function
            this[key] = value;
          }
        }
      }
    }
  }
  _createNode(nodeData) {
    const nodeClass = this._getNodeClass();
    return new nodeClass(nodeData);
  }
  _doRemoveChild(node) {
    this.children.splice(this.getChildIndex(node), 1);
    this.tree?.removeNodeFromIndex(node);
  }
  _getNodeClass() {
    return this.nodeClass ?? this.tree?.nodeClass ?? Node;
  }

  // Load children data from nodeInfo if it has children
  _loadChildrenFromData(nodeInfo) {
    if (isNodeRecordWithChildren(nodeInfo) && nodeInfo.children.length) {
      this.loadFromData(nodeInfo.children);
    }
  }
  _setParent(parent) {
    this.parent = parent;
    this.tree = parent.tree;
    this.tree?.addNodeToIndex(this);
  }
}


//# sourceMappingURL=node.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/nodeElement/borderDropHint.js
class BorderDropHint {
  _hint;
  constructor(element, scrollLeft) {
    const div = element.querySelector(":scope > .html-tree-element");
    if (!div) {
      this._hint = undefined;
      return;
    }
    const width = Math.max(element.offsetWidth + scrollLeft - 4, 0);
    const height = Math.max(element.clientHeight - 4, 0);
    const hint = document.createElement("span");
    hint.className = "html-tree-border";
    hint.style.width = `${width}px`;
    hint.style.height = `${height}px`;
    this._hint = hint;
    div.append(this._hint);
  }
  remove() {
    this._hint?.remove();
  }
}


//# sourceMappingURL=borderDropHint.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/nodeElement/ghostDropHint.js
class GhostDropHint {
  _element;
  _ghost;
  _node;
  constructor(node, element, position) {
    this._element = element;
    this._node = node;
    this._ghost = this._createGhostElement();
    switch (position) {
      case "after":
        this._moveAfter();
        break;
      case "before":
        this._moveBefore();
        break;
      case "inside":
        {
          if (node.isFolder() && node.is_open) {
            this._moveInsideOpenFolder();
          } else {
            this._moveInside();
          }
        }
    }
  }
  remove() {
    this._ghost.remove();
  }
  _createGhostElement() {
    const ghost = document.createElement("li");
    ghost.className = "html-tree-common html-tree-ghost";
    const circleSpan = document.createElement("span");
    circleSpan.className = "html-tree-common html-tree-circle";
    ghost.append(circleSpan);
    const lineSpan = document.createElement("span");
    lineSpan.className = "html-tree-common html-tree-line";
    ghost.append(lineSpan);
    return ghost;
  }
  _moveAfter() {
    this._element.after(this._ghost);
  }
  _moveBefore() {
    this._element.before(this._ghost);
  }
  _moveInside() {
    this._element.after(this._ghost);
    this._ghost.classList.add("html-tree-inside");
  }
  _moveInsideOpenFolder() {
    const childElement = this._node.children[0]?.element;
    if (childElement) {
      childElement.before(this._ghost);
    }
  }
}


//# sourceMappingURL=ghostDropHint.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/nodeElement/index.js



class NodeElement {
  element;
  node;
  _getScrollLeft;
  _tabIndex;
  _treeElement;
  constructor({
    getScrollLeft,
    node,
    tabIndex,
    treeElement
  }) {
    this._getScrollLeft = getScrollLeft;
    this.node = node;
    this._tabIndex = tabIndex;
    this._treeElement = treeElement;
    node.element ??= this._treeElement;
    this.element = node.element;
  }
  addDropHint(position) {
    if (this._mustShowBorderDropHint(position)) {
      return new BorderDropHint(this.element, this._getScrollLeft());
    } else {
      return new GhostDropHint(this.node, this.element, position);
    }
  }
  deselect() {
    this.element.classList.remove("html-tree-selected");
    const titleSpan = this._getTitleSpan();
    titleSpan.removeAttribute("tabindex");
    titleSpan.setAttribute("aria-selected", "false");
    titleSpan.blur();
  }
  select(mustSetFocus) {
    this.element.classList.add("html-tree-selected");
    const titleSpan = this._getTitleSpan();
    const tabIndex = this._tabIndex;

    // Check for null or undefined
    if (tabIndex != null) {
      titleSpan.setAttribute("tabindex", tabIndex.toString());
    }
    titleSpan.setAttribute("aria-selected", "true");
    if (mustSetFocus) {
      titleSpan.focus();
    }
  }
  _getTitleSpan() {
    return this.element.querySelector(":scope > .html-tree-element > span.html-tree-title");
  }
  _getUl() {
    return this.element.querySelector(":scope > ul");
  }
  _mustShowBorderDropHint(position) {
    return position === "inside";
  }
}


//# sourceMappingURL=index.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/animation.js
const getAnimationDuration = duration => {
  if (typeof duration === "number") {
    return duration;
  }
  return duration === "slow" ? 600 : 200;
};
const slideDown = (element, animationSpeed, onFinished) => {
  element.style.display = "block";
  const animation = element.animate([{
    height: "0",
    overflow: "hidden"
  }, {
    height: `${element.scrollHeight}px`,
    overflow: "hidden"
  }], {
    duration: getAnimationDuration(animationSpeed)
  });
  animation.onfinish = () => {
    onFinished();
  };
};
const slideUp = (element, animationSpeed, onFinished) => {
  const animation = element.animate([{
    height: `${element.scrollHeight}px`,
    overflow: "hidden"
  }, {
    height: "0",
    overflow: "hidden"
  }], {
    duration: getAnimationDuration(animationSpeed)
  });
  animation.onfinish = () => {
    element.style.display = "none";
    onFinished();
  };
};


//# sourceMappingURL=animation.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/nodeElement/folderElement.js



class FolderElement extends NodeElement {
  _closedIconElement;
  _openedIconElement;
  _triggerEvent;
  constructor({
    closedIconElement,
    getScrollLeft,
    node,
    openedIconElement,
    tabIndex,
    treeElement,
    triggerEvent
  }) {
    super({
      getScrollLeft,
      node,
      tabIndex,
      treeElement
    });
    this._closedIconElement = closedIconElement;
    this._openedIconElement = openedIconElement;
    this._triggerEvent = triggerEvent;
  }
  close(slide, animationSpeed) {
    if (!this.node.is_open) {
      return;
    }
    this.node.is_open = false;
    const button = this._getButton();
    button.classList.add("html-tree-closed");
    button.innerHTML = "";
    const closedIconElement = this._closedIconElement;
    if (closedIconElement) {
      const icon = closedIconElement.cloneNode(true);
      button.appendChild(icon);
    }
    const doClose = () => {
      this.element.classList.add("html-tree-closed");
      const titleSpan = this._getTitleSpan();
      titleSpan.setAttribute("aria-expanded", "false");
      this._triggerEvent("tree.close", {
        node: this.node
      });
    };
    const ul = this._getUl();
    if (slide) {
      slideUp(ul, animationSpeed, doClose);
    } else {
      ul.style.display = "none";
      doClose();
    }
  }
  open(onFinished, slide, animationSpeed) {
    if (this.node.is_open) {
      return;
    }
    this.node.is_open = true;
    const button = this._getButton();
    button.classList.remove("html-tree-closed");
    button.innerHTML = "";
    const openedIconElement = this._openedIconElement;
    if (openedIconElement) {
      const icon = openedIconElement.cloneNode(true);
      button.appendChild(icon);
    }
    const doOpen = () => {
      this.element.classList.remove("html-tree-closed");
      const titleSpan = this._getTitleSpan();
      titleSpan.setAttribute("aria-expanded", "true");
      if (onFinished) {
        onFinished(this.node);
      }
      this._triggerEvent("tree.open", {
        node: this.node
      });
    };
    const ul = this._getUl();
    if (slide) {
      slideDown(ul, animationSpeed, doOpen);
    } else {
      ul.style.display = "block";
      doOpen();
    }
  }
  _mustShowBorderDropHint(position) {
    return !this.node.is_open && position === "inside";
  }
  _getButton() {
    return this.element.querySelector(":scope > .html-tree-element > a.html-tree-toggler");
  }
}


//# sourceMappingURL=folderElement.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/requestUrl.js
// Url class for absolute and relative urls.

const isAbsoluteUrl = inputUrl => {
  try {
    new URL(inputUrl);
    return true;
  } catch {
    return false;
  }
};
const LOCALHOST = "http://localhost";
class RequestUrl {
  _isAbsolute;
  _url;
  constructor(inputUrl) {
    if (isAbsoluteUrl(inputUrl)) {
      this._url = new URL(inputUrl);
      this._isAbsolute = true;
    } else {
      this._url = new URL(inputUrl, LOCALHOST);
      this._isAbsolute = false;
    }
  }
  setSearchParam(key, value) {
    this._url.searchParams.set(key, value);
  }
  toString() {
    if (this._isAbsolute) {
      return this._url.href;
    } else {
      return this._url.href.slice(LOCALHOST.length);
    }
  }
}


//# sourceMappingURL=requestUrl.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/saveStateHandler.js


class SaveStateHandler {
  _addToSelection;
  _getNodeById;
  _getSelectedNodes;
  _getTree;
  _onGetStateFromStorage;
  _onSetStateFromStorage;
  _openNode;
  _refreshElements;
  _removeFromSelection;
  _saveStateOption;
  constructor({
    addToSelection,
    getNodeById,
    getSelectedNodes,
    getTree,
    onGetStateFromStorage,
    onSetStateFromStorage,
    openNode,
    refreshElements,
    removeFromSelection,
    saveState
  }) {
    this._addToSelection = addToSelection;
    this._getNodeById = getNodeById;
    this._getSelectedNodes = getSelectedNodes;
    this._getTree = getTree;
    this._onGetStateFromStorage = onGetStateFromStorage;
    this._onSetStateFromStorage = onSetStateFromStorage;
    this._openNode = openNode;
    this._refreshElements = refreshElements;
    this._removeFromSelection = removeFromSelection;
    this._saveStateOption = saveState;
  }
  getNodeIdToBeSelected() {
    const state = this.getStateFromStorage();
    if (state?.selected_node) {
      return state.selected_node[0] ?? null;
    } else {
      return null;
    }
  }
  getState() {
    const getOpenNodeIds = () => {
      const openNodes = [];
      this._getTree()?.iterate(node => {
        if (node.is_open && node.id && node.hasChildren()) {
          openNodes.push(node.id);
        }
        return true;
      });
      return openNodes;
    };
    const getSelectedNodeIds = () => {
      const selectedNodeIds = [];
      this._getSelectedNodes().forEach(node => {
        if (node.id != null) {
          selectedNodeIds.push(node.id);
        }
      });
      return selectedNodeIds;
    };
    return {
      open_nodes: getOpenNodeIds(),
      selected_node: getSelectedNodeIds()
    };
  }
  getStateFromStorage() {
    const jsonData = this._loadFromStorage();
    if (jsonData) {
      return this._parseState(jsonData);
    } else {
      return null;
    }
  }
  saveState() {
    const state = JSON.stringify(this.getState());
    if (this._onSetStateFromStorage) {
      this._onSetStateFromStorage(state);
    } else {
      localStorage.setItem(this._getKeyName(), state);
    }
  }

  /*
  Set initial state
  Don't handle nodes that are loaded on demand
   result: must load on demand (boolean)
  */
  setInitialState(state) {
    let mustLoadOnDemand = false;
    if (state.open_nodes) {
      mustLoadOnDemand = this._openInitialNodes(state.open_nodes);
    }
    this._resetSelection();
    if (state.selected_node) {
      this._selectInitialNodes(state.selected_node);
    }
    return mustLoadOnDemand;
  }
  setInitialStateOnDemand(state, cbFinished) {
    let loadingCount = 0;
    let nodeIds = state.open_nodes;
    const openNodes = () => {
      if (!nodeIds) {
        return;
      }
      const newNodesIds = [];
      for (const nodeId of nodeIds) {
        const node = this._getNodeById(nodeId);
        if (!node) {
          newNodesIds.push(nodeId);
        } else {
          if (!node.is_loading) {
            if (node.load_on_demand) {
              loadAndOpenNode(node);
            } else {
              this._openNode(node, false);
            }
          }
        }
      }
      nodeIds = newNodesIds;
      if (state.selected_node) {
        if (this._selectInitialNodes(state.selected_node)) {
          this._refreshElements(null);
        }
      }
      if (loadingCount === 0) {
        cbFinished();
      }
    };
    const loadAndOpenNode = node => {
      loadingCount += 1;
      this._openNode(node, false, () => {
        loadingCount -= 1;
        openNodes();
      });
    };
    openNodes();
  }
  _getKeyName() {
    if (typeof this._saveStateOption === "string") {
      return this._saveStateOption;
    } else {
      return "tree";
    }
  }
  _loadFromStorage() {
    if (this._onGetStateFromStorage) {
      return this._onGetStateFromStorage();
    } else {
      return localStorage.getItem(this._getKeyName());
    }
  }
  _openInitialNodes(nodeIds) {
    let mustLoadOnDemand = false;
    for (const nodeId of nodeIds) {
      const node = this._getNodeById(nodeId);
      if (node) {
        if (!node.load_on_demand) {
          node.is_open = true;
        } else {
          mustLoadOnDemand = true;
        }
      }
    }
    return mustLoadOnDemand;
  }
  _parseState(jsonData) {
    const state = JSON.parse(jsonData);

    // Check if selected_node is an int (instead of an array)
    if (state.selected_node && isInt(state.selected_node)) {
      // Convert to array
      state.selected_node = [state.selected_node];
    }
    return state;
  }
  _resetSelection() {
    const selectedNodes = this._getSelectedNodes();
    selectedNodes.forEach(node => {
      this._removeFromSelection(node);
    });
  }
  _selectInitialNodes(nodeIds) {
    let selectCount = 0;
    for (const nodeId of nodeIds) {
      const node = this._getNodeById(nodeId);
      if (node) {
        selectCount += 1;
        this._addToSelection(node);
      }
    }
    return selectCount !== 0;
  }
}


//# sourceMappingURL=saveStateHandler.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/scrollHandler/scrollParent.js
class ScrollParent {
  _container;
  _horizontalScrollDirection;
  _horizontalScrollTimeout;
  _refreshHitAreas;
  _verticalScrollDirection;
  _verticalScrollTimeout;
  constructor({
    container,
    refreshHitAreas
  }) {
    this._container = container;
    this._refreshHitAreas = refreshHitAreas;
  }
  checkHorizontalScrolling(pageX) {
    const newHorizontalScrollDirection = this._getNewHorizontalScrollDirection(pageX);
    if (this._horizontalScrollDirection !== newHorizontalScrollDirection) {
      this._horizontalScrollDirection = newHorizontalScrollDirection;
      if (this._horizontalScrollTimeout != null) {
        window.clearTimeout(this._horizontalScrollTimeout);
      }
      if (newHorizontalScrollDirection) {
        this._horizontalScrollTimeout = window.setTimeout(this._scrollHorizontally.bind(this), 40);
      }
    }
  }
  checkVerticalScrolling(pageY) {
    const newVerticalScrollDirection = this._getNewVerticalScrollDirection(pageY);
    if (this._verticalScrollDirection !== newVerticalScrollDirection) {
      this._verticalScrollDirection = newVerticalScrollDirection;
      if (this._verticalScrollTimeout != null) {
        window.clearTimeout(this._verticalScrollTimeout);
        this._verticalScrollTimeout = undefined;
      }
      if (newVerticalScrollDirection) {
        this._verticalScrollTimeout = window.setTimeout(this._scrollVertically.bind(this), 40);
      }
    }
  }
  getScrollLeft() {
    return this._container.scrollLeft;
  }
  scrollToY(top) {
    this._container.scrollTop = top;
  }
  stopScrolling() {
    this._horizontalScrollDirection = undefined;
    this._verticalScrollDirection = undefined;
  }
  _scrollHorizontally() {
    if (!this._horizontalScrollDirection) {
      return;
    }
    const distance = this._horizontalScrollDirection === "left" ? -20 : 20;
    this._container.scrollBy({
      behavior: "instant",
      left: distance,
      top: 0
    });
    this._refreshHitAreas();
    setTimeout(this._scrollHorizontally.bind(this), 40);
  }
  _scrollVertically() {
    if (!this._verticalScrollDirection) {
      return;
    }
    const distance = this._verticalScrollDirection === "top" ? -20 : 20;
    this._container.scrollBy({
      behavior: "instant",
      left: 0,
      top: distance
    });
    this._refreshHitAreas();
    setTimeout(this._scrollVertically.bind(this), 40);
  }
}


//# sourceMappingURL=scrollParent.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/scrollHandler/containerScrollParent.js



class ContainerScrollParent extends ScrollParent {
  _scrollParentBottom;
  _scrollParentTop;
  stopScrolling() {
    super.stopScrolling();
    this._horizontalScrollDirection = undefined;
    this._verticalScrollDirection = undefined;
  }
  _getNewHorizontalScrollDirection(pageX) {
    const scrollParentOffset = getElementPosition(this._container);
    const containerWidth = this._container.getBoundingClientRect().width;
    const rightEdge = scrollParentOffset.left + containerWidth;
    const leftEdge = scrollParentOffset.left;
    const isNearRightEdge = pageX > rightEdge - 20;
    const isNearLeftEdge = pageX < leftEdge + 20;
    if (isNearRightEdge) {
      return "right";
    } else if (isNearLeftEdge) {
      return "left";
    }
    return undefined;
  }
  _getNewVerticalScrollDirection(pageY) {
    if (pageY < this._getScrollParentTop()) {
      return "top";
    }
    if (pageY > this._getScrollParentBottom()) {
      return "bottom";
    }
    return undefined;
  }
  _getScrollParentBottom() {
    if (this._scrollParentBottom == null) {
      const containerHeight = this._container.getBoundingClientRect().height;
      this._scrollParentBottom = this._getScrollParentTop() + containerHeight;
    }
    return this._scrollParentBottom;
  }
  _getScrollParentTop() {
    this._scrollParentTop ??= getOffsetTop(this._container);
    return this._scrollParentTop;
  }
}


//# sourceMappingURL=containerScrollParent.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/scrollHandler/documentScrollParent.js



class DocumentScrollParent extends ScrollParent {
  _documentScrollHeight;
  _documentScrollWidth;
  _treeElement;
  constructor({
    refreshHitAreas,
    treeElement
  }) {
    super({
      container: document.documentElement,
      refreshHitAreas
    });
    this._treeElement = treeElement;
  }
  scrollToY(top) {
    const treeTop = getOffsetTop(this._treeElement);
    super.scrollToY(top + treeTop);
  }
  stopScrolling() {
    super.stopScrolling();
    this._documentScrollHeight = undefined;
    this._documentScrollWidth = undefined;
  }
  _getNewHorizontalScrollDirection(pageX) {
    const scrollLeft = this._container.scrollLeft;
    const windowWidth = window.innerWidth;
    const isNearRightEdge = pageX > windowWidth - 20;
    const isNearLeftEdge = pageX - scrollLeft < 20;
    if (isNearRightEdge && this._canScrollRight()) {
      return "right";
    }
    if (isNearLeftEdge) {
      return "left";
    }
    return undefined;
  }
  _getNewVerticalScrollDirection(pageY) {
    const scrollTop = this._container.scrollTop;
    const distanceTop = pageY - scrollTop;
    if (distanceTop < 20) {
      return "top";
    }
    const windowHeight = window.innerHeight;
    if (windowHeight - (pageY - scrollTop) < 20 && this._canScrollDown()) {
      return "bottom";
    }
    return undefined;
  }
  _canScrollDown() {
    return this._container.scrollTop + this._container.clientHeight < this._getDocumentScrollHeight();
  }
  _canScrollRight() {
    return this._container.scrollLeft + this._container.clientWidth < this._getDocumentScrollWidth();
  }
  _getDocumentScrollHeight() {
    // Store the original scroll height because the scroll height can increase when the drag element is moved beyond the scroll height.
    this._documentScrollHeight ??= this._container.scrollHeight;
    return this._documentScrollHeight;
  }
  _getDocumentScrollWidth() {
    // Store the original scroll width because the scroll width can increase when the drag element is moved beyond the scroll width.
    this._documentScrollWidth ??= this._container.scrollWidth;
    return this._documentScrollWidth;
  }
}


//# sourceMappingURL=documentScrollParent.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/scrollHandler/createScrollParent.js



const isOverflow = overflowValue => overflowValue === "auto" || overflowValue === "scroll";
const hasOverFlow = element => {
  const style = getComputedStyle(element);
  return isOverflow(style.overflowX) || isOverflow(style.overflowY);
};
const getParentWithOverflow = treeElement => {
  if (hasOverFlow(treeElement)) {
    return treeElement;
  }
  let parent = treeElement.parentElement;
  while (parent) {
    if (hasOverFlow(parent)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
};
const createScrollParent = (treeElement, refreshHitAreas) => {
  const container = getParentWithOverflow(treeElement);
  if (container && container.tagName !== "HTML") {
    return new ContainerScrollParent({
      container,
      refreshHitAreas
    });
  } else {
    return new DocumentScrollParent({
      refreshHitAreas,
      treeElement
    });
  }
};


//# sourceMappingURL=createScrollParent.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/scrollHandler.js


class ScrollHandler {
  _refreshHitAreas;
  _scrollParent;
  _treeElement;
  constructor({
    refreshHitAreas,
    treeElement
  }) {
    this._refreshHitAreas = refreshHitAreas;
    this._scrollParent = undefined;
    this._treeElement = treeElement;
  }
  checkScrolling(positionInfo) {
    this._checkVerticalScrolling(positionInfo);
    this._checkHorizontalScrolling(positionInfo);
  }
  getScrollLeft() {
    return this._getScrollParent().getScrollLeft();
  }
  scrollToY(top) {
    this._getScrollParent().scrollToY(top);
  }
  stopScrolling() {
    this._getScrollParent().stopScrolling();
  }
  _checkHorizontalScrolling(positionInfo) {
    this._getScrollParent().checkHorizontalScrolling(positionInfo.pageX);
  }
  _checkVerticalScrolling(positionInfo) {
    this._getScrollParent().checkVerticalScrolling(positionInfo.pageY);
  }
  _getScrollParent() {
    this._scrollParent ??= createScrollParent(this._treeElement, this._refreshHitAreas);
    return this._scrollParent;
  }
}


//# sourceMappingURL=scrollHandler.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/selectNodeHandler.js
class SelectNodeHandler {
  _getNodeById;
  _selectedNodes;
  _selectedSingleNode;
  constructor({
    getNodeById
  }) {
    this._getNodeById = getNodeById;
    this._selectedNodes = new Set();
    this._selectedSingleNode = null;
  }
  addToSelection(node) {
    if (node.id != null) {
      this._selectedNodes.add(node.id);
    } else {
      this._selectedSingleNode = node;
    }
  }
  clear() {
    this._selectedNodes.clear();
    this._selectedSingleNode = null;
  }
  getSelectedNode() {
    const selectedNodes = this.getSelectedNodes();
    if (selectedNodes.length) {
      return selectedNodes[0] ?? false;
    } else {
      return false;
    }
  }
  getSelectedNodes() {
    if (this._selectedSingleNode) {
      return [this._selectedSingleNode];
    } else {
      const selectedNodes = [];
      this._selectedNodes.forEach(id => {
        const node = this._getNodeById(id);
        if (node) {
          selectedNodes.push(node);
        }
      });
      return selectedNodes;
    }
  }
  getSelectedNodesUnder(parent) {
    if (this._selectedSingleNode) {
      if (parent.isParentOf(this._selectedSingleNode)) {
        return [this._selectedSingleNode];
      } else {
        return [];
      }
    } else {
      const selectedNodes = [];
      this._selectedNodes.forEach(id => {
        const node = this._getNodeById(id);
        if (node && parent.isParentOf(node)) {
          selectedNodes.push(node);
        }
      });
      return selectedNodes;
    }
  }
  isNodeSelected(node) {
    if (node.id != null) {
      return this._selectedNodes.has(node.id);
    } else if (this._selectedSingleNode) {
      return this._selectedSingleNode.element === node.element;
    } else {
      return false;
    }
  }
  removeFromSelection(node, includeChildren = false) {
    if (node.id == null) {
      if (this._selectedSingleNode && node.element === this._selectedSingleNode.element) {
        this._selectedSingleNode = null;
      }
    } else {
      this._selectedNodes.delete(node.id);
      if (includeChildren) {
        node.iterate(() => {
          if (node.id != null) {
            this._selectedNodes.delete(node.id);
          }
          return true;
        });
      }
    }
  }
}


//# sourceMappingURL=selectNodeHandler.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/setDefaultOptions.js


const defaults = {
  animationSpeed: "fast",
  autoEscape: true,
  autoOpen: false,
  // true / false / int (open n levels starting at 0)
  buttonLeft: true,
  // The symbol to use for a closed node - ► BLACK RIGHT-POINTING POINTER
  // http://www.fileformat.info/info/unicode/char/25ba/index.htm
  closedIcon: undefined,
  data: undefined,
  dataFilter: undefined,
  dataUrl: undefined,
  dragAndDrop: false,
  keyboardSupport: true,
  nodeClass: Node,
  onCanMove: undefined,
  // Can this node be moved?
  onCanMoveTo: undefined,
  // Can this node be moved to this position? function(moved_node, target_node, position)
  onCanSelectNode: undefined,
  onCreateLi: undefined,
  onDragMove: undefined,
  onDragStop: undefined,
  onGetStateFromStorage: undefined,
  onIsMoveHandle: undefined,
  onLoadFailed: undefined,
  onLoading: undefined,
  onSetStateFromStorage: undefined,
  openedIcon: undefined,
  openFolderDelay: 500,
  // The delay for opening a folder during drag and drop; the value is in milliseconds
  // The symbol to use for an open node - ▼ BLACK DOWN-POINTING TRIANGLE
  // http://www.fileformat.info/info/unicode/char/25bc/index.htm
  rtl: undefined,
  // right-to-left support; true / false (default)
  saveState: false,
  // true / false / string (local storage key; the default key is "tree")
  selectable: true,
  showEmptyFolder: false,
  slide: true,
  // must display slide animation?
  startDndDelay: 300,
  // The delay for starting dnd (in milliseconds)
  tabIndex: 0,
  useContextMenu: true
};
const setDefaultOptions = (htmlElement, inputOptions) => {
  const options = {
    ...defaults,
    ...inputOptions
  };
  options.dataUrl ??= htmlElement.dataset.url;
  options.rtl ??= getRtlOptionFromHTMLElement(htmlElement);
  options.closedIcon ??= getDefaultClosedIcon(options);
  options.openedIcon ??= "&#x25bc;";
  return options;
};
const getDefaultClosedIcon = options => {
  if (options.rtl) {
    // triangle to the left
    return "&#x25c0;";
  } else {
    // triangle to the right
    return "&#x25ba;";
  }
};
const getRtlOptionFromHTMLElement = htmlElement => {
  const dataRtl = htmlElement.dataset.rtl;
  if (dataRtl == "") {
    return true;
  } else if (dataRtl === "false") {
    return false;
  } else {
    return Boolean(dataRtl);
  }
};


//# sourceMappingURL=setDefaultOptions.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/triggerCustomEvent.js
// Trigger a CustomEvent. Return if the event is processed (true) or cancelled (false).
const triggerCustomEvent = (element, eventName, values) => {
  const event = new CustomEvent(eventName, {
    bubbles: true,
    cancelable: true,
    detail: values
  });
  element.dispatchEvent(event);
  return !event.defaultPrevented;
};


//# sourceMappingURL=triggerCustomEvent.js.map

;// ./node_modules/.pnpm/html-tree@file+..+..+upload+html-tree+package/node_modules/html-tree/lib/index.js
/*
Html-tree 0.1.0

Copyright 2026 Marco Braak

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

















// The types that appear in the public api. Consumers cannot import them from
// the submodules directly, because those are not exposed in package.json.
// Type only, so that the iife build keeps exposing the HtmlTree class itself
// as its global, instead of an object of named exports.

class HtmlTree {
  tree;
  _dataLoader;
  _dndHandler;
  _htmlElement;
  _isInitialized;
  _keyHandler;
  _mouseHandler;
  _nodeMap;
  _options;
  _renderer;
  _saveStateHandler;
  _scrollHandler;
  _selectNodeHandler;
  _triggerEventProvider;
  constructor({
    htmlElement,
    overrideTriggerEventProvider,
    ...options
  }) {
    this._htmlElement = htmlElement;
    this._options = setDefaultOptions(htmlElement, options);
    this._triggerEventProvider = overrideTriggerEventProvider ?? triggerCustomEvent;
    this._isInitialized = false;
    this.tree = new Node({}, true);
    this._nodeMap = new WeakMap();
    const {
      autoEscape,
      buttonLeft,
      closedIcon,
      dataFilter,
      dragAndDrop,
      keyboardSupport,
      onCanMove,
      onCanMoveTo,
      onCreateLi,
      onDragMove,
      onDragStop,
      onGetStateFromStorage,
      onIsMoveHandle,
      onLoadFailed,
      onLoading,
      onSetStateFromStorage,
      openedIcon,
      openFolderDelay,
      rtl,
      saveState,
      showEmptyFolder,
      slide,
      tabIndex
    } = this._options;
    const closeNode = this.closeNode.bind(this);
    const getNodeElement = this._getNodeElement.bind(this);
    const getNodeElementForNode = this._getNodeElementForNode.bind(this);
    const getNodeById = this.getNodeById.bind(this);
    const getSelectedNode = this.getSelectedNode.bind(this);
    const getTree = this.getTree.bind(this);
    const isFocusOnTree = this._isFocusOnTree.bind(this);
    const loadData = this.loadData.bind(this);
    const openNode = this._openNodeInternal.bind(this);
    const refreshElements = this._refreshElements.bind(this);
    const refreshHitAreas = this.refreshHitAreas.bind(this);
    const selectNode = this.selectNode.bind(this);
    const setNodeElement = this._setNodeElement.bind(this);
    const treeElement = this._htmlElement;
    const triggerEvent = this._triggerEvent.bind(this);
    const selectNodeHandler = new SelectNodeHandler({
      getNodeById
    });
    const addToSelection = selectNodeHandler.addToSelection.bind(selectNodeHandler);
    const getSelectedNodes = selectNodeHandler.getSelectedNodes.bind(selectNodeHandler);
    const isNodeSelected = selectNodeHandler.isNodeSelected.bind(selectNodeHandler);
    const removeFromSelection = selectNodeHandler.removeFromSelection.bind(selectNodeHandler);
    const getMouseDelay = () => this._options.startDndDelay ?? 0;
    const dataLoader = new DataLoader({
      dataFilter,
      loadData,
      onLoadFailed,
      onLoading,
      treeElement,
      triggerEvent
    });
    const saveStateHandler = new SaveStateHandler({
      addToSelection,
      getNodeById,
      getSelectedNodes,
      getTree,
      onGetStateFromStorage,
      onSetStateFromStorage,
      openNode,
      refreshElements,
      removeFromSelection,
      saveState
    });
    const scrollHandler = new ScrollHandler({
      refreshHitAreas,
      treeElement
    });
    const getScrollLeft = scrollHandler.getScrollLeft.bind(scrollHandler);
    const dndHandler = new DragAndDropHandler({
      autoEscape,
      getNodeElement,
      getNodeElementForNode,
      getScrollLeft,
      getTree,
      onCanMove,
      onCanMoveTo,
      onDragMove,
      onDragStop,
      onIsMoveHandle,
      openFolderDelay,
      openNode,
      refreshElements,
      slide,
      treeElement,
      triggerEvent
    });
    const keyHandler = new KeyHandler({
      closeNode,
      getSelectedNode,
      isFocusOnTree,
      keyboardSupport,
      openNode,
      selectNode
    });
    const renderer = new ElementsRenderer({
      autoEscape,
      buttonLeft,
      closedIcon,
      dragAndDrop,
      getTree,
      htmlElement: treeElement,
      isNodeSelected,
      onCreateLi,
      openedIcon,
      rtl,
      setNodeElement,
      showEmptyFolder,
      tabIndex
    });
    const getNode = this.getNode.bind(this);
    const onMouseCapture = this._mouseCapture.bind(this);
    const onMouseDrag = this._mouseDrag.bind(this);
    const onMouseStart = this._mouseStart.bind(this);
    const onMouseStop = this._mouseStop.bind(this);
    const mouseHandler = new MouseHandler({
      element: treeElement,
      getMouseDelay,
      getNode,
      onClickButton: this.toggle.bind(this),
      onClickTitle: this.selectNode.bind(this),
      onMouseCapture,
      onMouseDrag,
      onMouseStart,
      onMouseStop,
      triggerEvent,
      useContextMenu: this._options.useContextMenu
    });
    this._dataLoader = dataLoader;
    this._dndHandler = dndHandler;
    this._keyHandler = keyHandler;
    this._mouseHandler = mouseHandler;
    this._renderer = renderer;
    this._saveStateHandler = saveStateHandler;
    this._scrollHandler = scrollHandler;
    this._selectNodeHandler = selectNodeHandler;
    this._initData();
  }

  // Add a node after an existing node.
  addNodeAfter(newNodeInfo, existingNode) {
    const newNode = existingNode.addAfter(newNodeInfo);
    if (newNode) {
      this._refreshElements(existingNode.parent);
    }
    return newNode;
  }

  // Add a node before another node.
  addNodeBefore(newNodeInfo, existingNode) {
    const newNode = existingNode.addBefore(newNodeInfo);
    if (newNode) {
      this._refreshElements(existingNode.parent);
    }
    return newNode;
  }

  // Add a node as parent node of an existing node.
  addParentNode(newNodeInfo, existingNode) {
    const newNode = existingNode.addParent(newNodeInfo);
    if (newNode) {
      this._refreshElements(newNode.parent);
    }
    return newNode;
  }
  addToSelection(node, mustSetFocus) {
    this._selectNodeHandler.addToSelection(node);
    this._openParents(node);
    this._getNodeElementForNode(node).select(mustSetFocus ?? true);
    this._saveState();
  }

  // Add a node as child of another node.
  appendNode(newNodeInfo, parentNode) {
    const node = parentNode.append(newNodeInfo);
    this._refreshElements(parentNode);
    return node;
  }
  closeNode(node, slideParam) {
    const slide = slideParam ?? this._options.slide;
    if (node.isFolder() || node.isEmptyFolder) {
      this._createFolderElement(node).close(slide, this._options.animationSpeed);
      this._saveState();
    }
  }
  deinit() {
    this._htmlElement.textContent = '';
    this._keyHandler.deinit();
    this._mouseHandler.deinit();
    this.tree = new Node({}, true);
  }

  // Return the tree node for an HTMl element.
  getNode(element) {
    const liElement = element.closest("li.html-tree-common");
    if (liElement) {
      return this._nodeMap.get(liElement) ?? null;
    } else {
      return null;
    }
  }
  getNodeByCallback(callback) {
    return this.tree.getNodeByCallback(callback);
  }
  getNodeById(nodeId) {
    return this.tree.getNodeById(nodeId);
  }
  getNodeByName(name) {
    return this.tree.getNodeByName(name);
  }
  getNodeByNameMustExist(name) {
    return this.tree.getNodeByNameMustExist(name);
  }
  getNodesByProperty(key, value) {
    return this.tree.getNodesByProperty(key, value);
  }

  // Return the node that is selected.
  getSelectedNode() {
    return this._selectNodeHandler.getSelectedNode();
  }
  getSelectedNodes() {
    return this._selectNodeHandler.getSelectedNodes();
  }
  getState() {
    return this._saveStateHandler.getState();
  }
  getStateFromStorage() {
    return this._saveStateHandler.getStateFromStorage();
  }
  getTree() {
    return this.tree;
  }
  getVersion() {
    return (/* inlined export ["default"] */"0.1.0");
  }
  isDragging() {
    return this._dndHandler.isDragging;
  }
  isNodeSelected(node) {
    return this._selectNodeHandler.isNodeSelected(node);
  }
  loadData(data, parentNode) {
    if (data) {
      if (parentNode) {
        this._deselectNodes(parentNode);
        this._loadSubtree(data, parentNode);
      } else {
        this._initTree(data);
      }
      if (this.isDragging()) {
        this._dndHandler.refresh();
      }
    }
    this._triggerEvent("tree.load_data", {
      parent_node: parentNode,
      tree_data: data
    });
  }
  loadDataFromUrl(inputUrl, parentNode, onFinished) {
    const url = inputUrl ? new RequestUrl(inputUrl) : this._createRequestUrl(parentNode);
    if (url) {
      this._dataLoader.loadFromUrl(url, parentNode, onFinished);
    }
  }
  moveDown() {
    const selectedNode = this.getSelectedNode();
    if (selectedNode) {
      this._keyHandler.moveDown(selectedNode);
    }
  }

  // Move a node inside the tree.
  moveNode(node, targetNode, position) {
    this.tree.moveNode(node, targetNode, position);
    this._refreshElements(null);
  }
  moveUp() {
    const selectedNode = this.getSelectedNode();
    if (selectedNode) {
      this._keyHandler.moveUp(selectedNode);
    }
  }
  openNode(node, param1, param2) {
    const parseParams = () => {
      let onFinished;
      let slide;
      if (typeof param1 === "function") {
        onFinished = param1;
        slide = null;
      } else {
        slide = param1;
        onFinished = param2;
      }
      slide ??= this._options.slide;
      return [slide, onFinished];
    };
    const [slide, onFinished] = parseParams();
    this._openNodeInternal(node, slide, onFinished);
  }

  // Add a node before another node.
  prependNode(newNodeInfo, parentNode) {
    const node = parentNode.prepend(newNodeInfo);
    this._refreshElements(parentNode);
    return node;
  }
  refresh() {
    this._refreshElements(null);
  }
  refreshHitAreas() {
    this._dndHandler.refresh();
  }
  removeFromSelection(node) {
    this._selectNodeHandler.removeFromSelection(node);
    this._getNodeElementForNode(node).deselect();
    this._saveState();
  }

  // Remove the node from the tree.
  removeNode(node) {
    this._selectNodeHandler.removeFromSelection(node, true); // including children

    const parent = node.parent;
    node.remove();
    this._refreshElements(parent);
  }
  scrollToNode(node) {
    if (!node.element) {
      return;
    }
    const top = getOffsetTop(node.element) - getOffsetTop(this._htmlElement);
    this._scrollHandler.scrollToY(top);
  }
  selectNode(node, optionsParam) {
    const saveState = () => {
      if (this._options.saveState) {
        this._saveStateHandler.saveState();
      }
    };
    if (!node) {
      // Called with empty node -> deselect current node
      this._deselectCurrentNode();
      saveState();
      return;
    }
    const defaultOptions = {
      mustSetFocus: true,
      mustToggle: true
    };
    const selectOptions = {
      ...defaultOptions,
      ...(optionsParam ?? {})
    };
    const canSelect = () => {
      if (this._options.onCanSelectNode) {
        return this._options.selectable && this._options.onCanSelectNode(node);
      } else {
        return this._options.selectable;
      }
    };
    if (!canSelect()) {
      return;
    }
    if (this._selectNodeHandler.isNodeSelected(node)) {
      if (selectOptions.mustToggle) {
        this._deselectCurrentNode();
        this._triggerEvent("tree.select", {
          node: null,
          previous_node: node
        });
      }
    } else {
      const deselectedNode = this.getSelectedNode() || null;
      this._deselectCurrentNode();
      this.addToSelection(node, selectOptions.mustSetFocus);
      this._triggerEvent("tree.select", {
        deselected_node: deselectedNode,
        node
      });
      this._openParents(node);
    }
    saveState();
  }
  setOption(option, value) {
    this._options[option] = value;
  }
  setState(state) {
    this._saveStateHandler.setInitialState(state);
    this._refreshElements(null);
  }
  toggle(node, slideParam = null) {
    const slide = slideParam ?? this._options.slide;
    if (node.is_open) {
      this.closeNode(node, slide);
    } else {
      this.openNode(node, slide);
    }
  }

  // Return tree as json string.
  toJson() {
    return JSON.stringify(this.tree.getData());
  }

  // Update the data of a node in the tree.
  updateNode(node, data) {
    const idIsChanged = typeof data === "object" && data.id && data.id !== node.id;
    if (idIsChanged) {
      this.tree.removeNodeFromIndex(node);
    }
    node.setData(data);
    if (idIsChanged) {
      this.tree.addNodeToIndex(node);
    }
    if (typeof data === "object" && data.children && data.children instanceof Array) {
      node.removeChildren();
      if (data.children.length) {
        node.loadFromData(data.children);
      }
    }
    this._refreshElements(node);
  }
  _createFolderElement(node) {
    const closedIconElement = this._renderer.closedIconElement;
    const getScrollLeft = this._scrollHandler.getScrollLeft.bind(this._scrollHandler);
    const openedIconElement = this._renderer.openedIconElement;
    const tabIndex = this._options.tabIndex;
    const treeElement = this._htmlElement;
    const triggerEvent = this._triggerEvent.bind(this);
    return new FolderElement({
      closedIconElement,
      getScrollLeft,
      node,
      openedIconElement,
      tabIndex,
      treeElement,
      triggerEvent
    });
  }
  _createNodeElement(node) {
    const getScrollLeft = this._scrollHandler.getScrollLeft.bind(this._scrollHandler);
    const tabIndex = this._options.tabIndex;
    const treeElement = this._htmlElement;
    return new NodeElement({
      getScrollLeft,
      node,
      tabIndex,
      treeElement
    });
  }

  /* Create a RequestUrl based on the url in the options.
    * Add a 'node' query parameter for loading on demand
    * Add a 'selected_node' query parameter if a node is selected.
  */
  _createRequestUrl(node) {
    const dataUrl = this._options.dataUrl;
    let url;
    if (typeof dataUrl === "function") {
      url = dataUrl(node);
    } else {
      url = dataUrl;
    }
    if (!url) {
      return null;
    }
    const requestUrl = new RequestUrl(url);
    if (node?.id) {
      // Load on demand of a subtree; add node parameter
      requestUrl.setSearchParam('node', node.id.toString());
    } else {
      // Add selected_node parameter
      const selectedNodeId = this._getNodeIdToBeSelected();
      if (selectedNodeId) {
        requestUrl.setSearchParam('selected_node', selectedNodeId.toString());
      }
    }
    return requestUrl;
  }
  _deselectCurrentNode() {
    const node = this.getSelectedNode();
    if (node) {
      this.removeFromSelection(node);
    }
  }

  // Deselect the children of the node.
  _deselectNodes(parentNode) {
    const selectedNodesUnderParent = this._selectNodeHandler.getSelectedNodesUnder(parentNode);
    for (const n of selectedNodesUnderParent) {
      this._selectNodeHandler.removeFromSelection(n);
    }
  }

  // Get the maximum level for auto open
  _getAutoOpenMaxLevel() {
    if (this._options.autoOpen === true) {
      return -1;
    } else if (typeof this._options.autoOpen === "number") {
      return this._options.autoOpen;
    } else if (typeof this._options.autoOpen === "string") {
      return parseInt(this._options.autoOpen, 10);
    }

    /* istanbul ignore next @preserve */
    return 0;
  }
  _getNodeElement(element) {
    const node = this.getNode(element);
    if (node) {
      return this._getNodeElementForNode(node);
    } else {
      return null;
    }
  }
  _getNodeElementForNode(node) {
    if (node.isFolder()) {
      return this._createFolderElement(node);
    } else {
      return this._createNodeElement(node);
    }
  }
  _getNodeIdToBeSelected() {
    if (this._options.saveState) {
      return this._saveStateHandler.getNodeIdToBeSelected();
    } else {
      return null;
    }
  }
  _initData() {
    if (this._options.data) {
      this.loadData(this._options.data);
    } else {
      const dataUrl = this._createRequestUrl();
      if (dataUrl) {
        this.loadDataFromUrl();
      } else {
        this.loadData([]);
      }
    }
  }
  _initTree(data) {
    const doInit = () => {
      if (!this._isInitialized) {
        this._isInitialized = true;
        this._triggerEvent("tree.init");
      }
    };
    this.tree = new this._options.nodeClass(null, true, this._options.nodeClass);
    this._selectNodeHandler.clear();
    this.tree.loadFromData(data);
    const mustLoadOnDemand = this._setInitialState();
    this._refreshElements(null);
    if (mustLoadOnDemand) {
      // Load data on demand and then init the tree
      this._setInitialStateOnDemand(doInit);
    } else {
      doInit();
    }
  }

  // Does an HTML element of the tree have the focus?
  _isFocusOnTree() {
    const activeElement = document.activeElement;

    /* istanbul ignore if */
    if (!activeElement) {
      return false;
    }

    // The keyboard must still work for input elements.
    const tagName = activeElement.tagName;
    if (tagName !== "A" && tagName !== "SPAN") {
      return false;
    }
    const node = this.getNode(activeElement);
    return node?.tree === this.tree;
  }
  _isSelectedNodeInSubtree(subtree) {
    const selectedNode = this.getSelectedNode();
    if (!selectedNode) {
      return false;
    } else {
      return subtree === selectedNode || subtree.isParentOf(selectedNode);
    }
  }
  _loadFolderOnDemand(node, slide, onFinished) {
    node.is_loading = true;
    this.loadDataFromUrl(undefined, node, () => {
      this._openNodeInternal(node, slide, onFinished);
    });
  }
  _loadSubtree(data, parentNode) {
    parentNode.loadFromData(data);
    parentNode.load_on_demand = false;
    parentNode.is_loading = false;
    this._refreshElements(parentNode);
  }
  _mouseCapture(positionInfo) {
    if (!this._options.dragAndDrop) {
      return false;
    }
    return this._dndHandler.mouseCapture(positionInfo);
  }
  _mouseDrag(positionInfo) {
    /* istanbul ignore if */
    if (!this._options.dragAndDrop) {
      return false;
    }
    const result = this._dndHandler.mouseDrag(positionInfo);
    this._scrollHandler.checkScrolling(positionInfo);
    return result;
  }
  _mouseStart(positionInfo) {
    /* istanbul ignore if */
    if (!this._options.dragAndDrop) {
      return false;
    }
    return this._dndHandler.mouseStart(positionInfo);
  }
  _mouseStop(positionInfo) {
    /* istanbul ignore if */
    if (!this._options.dragAndDrop) {
      return false;
    }
    this._scrollHandler.stopScrolling();
    return this._dndHandler.mouseStop(positionInfo);
  }
  _openNodeInternal(node, slide = true, onFinished) {
    const doOpenNode = (_node, _slide, _onFinished) => {
      if (!node.children.length) {
        return;
      }
      const folderElement = this._createFolderElement(_node);
      folderElement.open(_onFinished, _slide, this._options.animationSpeed);
    };
    if (node.isFolder() || node.isEmptyFolder) {
      if (node.load_on_demand) {
        this._loadFolderOnDemand(node, slide, onFinished);
      } else {
        let parent = node.parent;
        while (parent) {
          // nb: do not open root element
          if (parent.parent) {
            doOpenNode(parent, false);
          }
          parent = parent.parent;
        }
        doOpenNode(node, slide, onFinished);
        this._saveState();
      }
    }
  }
  _openParents(node) {
    const parent = node.parent;
    if (parent?.parent && !parent.is_open) {
      this.openNode(parent, false);
    }
  }

  /*
  Redraw the tree or part of the tree.
    from_node: redraw this subtree
  */
  _refreshElements(fromNode) {
    const mustSetFocus = this._isFocusOnTree();
    const mustSelect = fromNode ? this._isSelectedNodeInSubtree(fromNode) : false;
    this._renderer.render(fromNode);
    if (mustSelect) {
      this._selectCurrentNode(mustSetFocus);
    }
    this._triggerEvent("tree.refresh");
  }
  _saveState() {
    if (this._options.saveState) {
      this._saveStateHandler.saveState();
    }
  }
  _selectCurrentNode(mustSetFocus) {
    const node = this.getSelectedNode();
    if (node) {
      const nodeElement = this._getNodeElementForNode(node);
      nodeElement.select(mustSetFocus);
    }
  }

  // Set initial state, either by restoring the state or auto-opening nodes
  // result: must load nodes on demand?
  _setInitialState() {
    const restoreState = () => {
      // result: is state restored, must load on demand?
      if (!this._options.saveState) {
        return [false, false];
      } else {
        const state = this._saveStateHandler.getStateFromStorage();
        if (!state) {
          return [false, false];
        } else {
          const mustLoadOnDemand = this._saveStateHandler.setInitialState(state);

          // return true: the state is restored
          return [true, mustLoadOnDemand];
        }
      }
    };
    const autoOpenNodes = () => {
      // result: must load on demand?
      if (this._options.autoOpen === false) {
        return false;
      }
      const maxLevel = this._getAutoOpenMaxLevel();
      let mustLoadOnDemand = false;
      this.tree.iterate((node, level) => {
        if (node.load_on_demand) {
          mustLoadOnDemand = true;
          return false;
        } else if (!node.hasChildren()) {
          return false;
        } else {
          node.is_open = true;
          return level !== maxLevel;
        }
      });
      return mustLoadOnDemand;
    };
    let [isRestored, mustLoadOnDemand] = restoreState(); // eslint-disable-line prefer-const

    if (!isRestored) {
      mustLoadOnDemand = autoOpenNodes();
    }
    return mustLoadOnDemand;
  }

  // Set the initial state for nodes that are loaded on demand
  // Call cb_finished when done
  _setInitialStateOnDemand(cbFinished) {
    const restoreState = () => {
      const state = this._saveStateHandler.getStateFromStorage();
      if (!state) {
        return false;
      } else {
        this._saveStateHandler.setInitialStateOnDemand(state, cbFinished);
        return true;
      }
    };
    const autoOpenNodes = () => {
      const maxLevel = this._getAutoOpenMaxLevel();
      let loadingCount = 0;
      const loadAndOpenNode = node => {
        loadingCount += 1;
        this._openNodeInternal(node, false, () => {
          loadingCount -= 1;
          openNodes();
        });
      };
      const openNodes = () => {
        this.tree.iterate((node, level) => {
          if (node.load_on_demand) {
            if (!node.is_loading) {
              loadAndOpenNode(node);
            }
            return false;
          } else {
            this._openNodeInternal(node, false);
            return level !== maxLevel;
          }
        });
        if (loadingCount === 0) {
          cbFinished();
        }
      };
      openNodes();
    };
    if (!restoreState()) {
      autoOpenNodes();
    }
  }

  // Set this HTML element to this node in the node map.
  _setNodeElement(element, node) {
    this._nodeMap.set(element, node);
  }
  _triggerEvent(eventName, values) {
    return this._triggerEventProvider(this._htmlElement, eventName, values);
  }
}


//# sourceMappingURL=index.js.map

;// ./node_modules/.pnpm/js-cookie@3.0.8/node_modules/js-cookie/dist/js.cookie.mjs
/*! js-cookie v3.0.8 | MIT */
function js_cookie_assign (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (key === '__proto__') continue
      target[key] = source[key];
    }
  }
  return target
}

var defaultConverter = {
  read: function (value) {
    if (value[0] === '"') {
      value = value.slice(1, -1);
    }
    return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
  },
  write: function (value) {
    return encodeURIComponent(value).replace(
      /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
      decodeURIComponent
    )
  }
};

function init(converter, defaultAttributes) {
  function set(name, value, attributes) {
    if (typeof document === 'undefined') {
      return
    }

    attributes = js_cookie_assign({}, defaultAttributes, attributes);

    if (typeof attributes.expires === 'number') {
      attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
    }
    if (attributes.expires) {
      attributes.expires = attributes.expires.toUTCString();
    }

    name = encodeURIComponent(name)
      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape);

    var stringifiedAttributes = '';
    for (var attributeName in attributes) {
      if (!attributes[attributeName]) {
        continue
      }

      stringifiedAttributes += '; ' + attributeName;

      if (attributes[attributeName] === true) {
        continue
      }

      // Considers RFC 6265 section 5.2:
      // ...
      // 3.  If the remaining unparsed-attributes contains a %x3B (";")
      //     character:
      // Consume the characters of the unparsed-attributes up to,
      // not including, the first %x3B (";") character.
      // ...
      stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
    }

    return (document.cookie =
      name + '=' + converter.write(value, name) + stringifiedAttributes)
  }

  function get(name) {
    if (typeof document === 'undefined' || (arguments.length && !name)) {
      return
    }

    // To prevent the for loop in the first place assign an empty array
    // in case there are no cookies at all.
    var cookies = document.cookie ? document.cookie.split('; ') : [];
    var jar = {};
    for (var i = 0; i < cookies.length; i++) {
      var parts = cookies[i].split('=');
      var value = parts.slice(1).join('=');

      try {
        var found = decodeURIComponent(parts[0]);
        if (!(found in jar)) jar[found] = converter.read(value, found);
        if (name === found) {
          break
        }
      } catch (_e) {
        // Do nothing...
      }
    }

    return name ? jar[name] : jar
  }

  return Object.create(
    {
      set: set,
      get: get,
      remove: function (name, attributes) {
        set(
          name,
          '',
          js_cookie_assign({}, attributes, {
            expires: -1
          })
        );
      },
      withAttributes: function (attributes) {
        return init(this.converter, js_cookie_assign({}, this.attributes, attributes))
      },
      withConverter: function (converter) {
        return init(js_cookie_assign({}, this.converter, converter), this.attributes)
      }
    },
    {
      attributes: { value: Object.freeze(defaultAttributes) },
      converter: { value: Object.freeze(converter) }
    }
  )
}

var api = init(defaultConverter, { path: '/' });



;// ./src/initTree.ts


function initTree(treeElement, {
  animationSpeed,
  autoEscape,
  autoOpen,
  csrfCookieName,
  dragAndDrop,
  hasAddPermission,
  hasChangePermission,
  insertAtUrl,
  mouseDelay,
  rtl,
  saveState,
  useContextMenu
}) {
  let errorNode = null;
  const baseUrl = "http://example.com";
  const insertAtUrlObject = insertAtUrl ? new URL(insertAtUrl, baseUrl) : undefined;
  function createLi(node, liElement, isSelected) {
    if (node.id == null) {
      return;
    }
    const titleElement = liElement.querySelector(":scope > .html-tree-element > .html-tree-title");

    /* istanbul ignore if */
    if (!titleElement) {
      return;
    }

    // Create edit link
    const tabindex = isSelected ? 0 : -1;
    const editCaption = hasChangePermission ? gettext("edit") : gettext("view");
    const editElement = document.createElement("a");
    editElement.className = "edit";
    editElement.href = node.url;
    editElement.tabIndex = tabindex;
    editElement.text = `(${editCaption})`;
    titleElement.after(editElement);
    if (hasAddPermission && insertAtUrlObject) {
      insertAtUrlObject.searchParams.set("insert_at", node.id.toString());
      const insertUrlString = insertAtUrlObject.toString().substring(baseUrl.length);
      const addElement = document.createElement("a");
      addElement.className = "edit";
      addElement.href = insertUrlString;
      addElement.tabIndex = tabindex;
      const addCaption = gettext("add");
      addElement.text = `(${addCaption})`;
      titleElement.after(addElement);
    }
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
        return api.get(csrfCookieName);
      }
    }
    return getFromCookie() ?? getFromMiddleware() ?? "";
  }
  function handleMove(eventParam) {
    const e = eventParam;
    const info = e.detail.move_info;
    if (!info.moved_node.element) {
      return;
    }
    const htmlElement = info.moved_node.element;
    const body = new URLSearchParams({
      position: info.position,
      target_id: String(info.target_node.id)
    });
    handleLoading(null);
    removeErrorMessage();
    e.preventDefault();
    function handleError() {
      handleLoaded(null);
      const errorElement = document.createElement("span");
      errorElement.className = "mptt-admin-error";
      errorElement.textContent = gettext("move failed");
      const nodeElement = htmlElement.querySelector(":scope > .html-tree-element");
      nodeElement?.append(errorElement);
      errorNode = info.moved_node;
    }
    void fetch(info.moved_node.move_url, {
      body,
      headers: {
        // Set Django csrf token
        "X-CSRFToken": getCsrfToken()
      },
      method: "POST"
    }).then(response => {
      if (response.ok) {
        info.do_move();
        handleLoaded(null);
      } else {
        handleError();
      }
    }, () => {
      handleError();
    });
    function removeErrorMessage() {
      if (errorNode?.element) {
        const errorElement = errorNode.element.querySelector(":scope > .html-tree-element > .mptt-admin-error");
        errorElement?.remove();
        errorNode = null;
      }
    }
  }
  function handleLoadFailed() {
    treeElement.textContent = gettext("Error while loading the data from the server");
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
        return treeElement;
      }
    }
    const container = getContainer();
    const spinnerId = getSpinnerId(node);
    if (!container || spinnerId == null) {
      return;
    }
    const spinner = document.createElement("span");
    spinner.className = "html-tree-spin";
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
      node,
      previous_node
    } = e.detail;
    const deselectedElement = deselected_node?.element ?? previous_node?.element;
    if (deselectedElement) {
      // deselected node: remove tabindex
      const editElements = deselectedElement.querySelectorAll(":scope > .html-tree-element > .edit");
      for (const editElement of editElements) {
        editElement.tabIndex = -1;
      }
    }

    // selected: add tabindex
    if (node?.element) {
      const editElements = node.element.querySelectorAll(":scope > .html-tree-element > .edit");
      for (const editElement of editElements) {
        editElement.tabIndex = 0;
      }
    }
  }
  function handleLoadingEvent(e) {
    const {
      isLoading,
      node
    } = e.detail;
    if (isLoading) {
      handleLoading(node);
    }
  }
  function handleLoadDataEvent(e) {
    const {
      parent_node
    } = e.detail;
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
    saveState,
    useContextMenu
  };
  if (animationSpeed !== undefined) {
    treeOptions.animationSpeed = animationSpeed;
  }
  if (mouseDelay != null) {
    treeOptions.startDndDelay = mouseDelay;
  }
  treeElement.addEventListener("tree.loading_data", handleLoadingEvent);
  treeElement.addEventListener("tree.load_data", handleLoadDataEvent);
  treeElement.addEventListener("tree.move", handleMove);
  treeElement.addEventListener("tree.select", handleSelect);
  new HtmlTree({
    ...treeOptions,
    htmlElement: treeElement
  });
}
/* harmony default export */ const src_initTree = (initTree);
;// ./src/parseTreeOptions.ts
const parseAnimationSpeed = value => {
  if (!value) {
    return undefined;
  }
  const numberValue = parseNumber(value);
  if (numberValue === undefined) {
    return value;
  } else {
    return numberValue;
  }
};
const parseAutoOpen = value => {
  return parseNumber(value) ?? parseBoolean(value);
};
const parseBoolean = value => {
  switch (value) {
    case "false":
      return false;
    case "true":
      return true;
    default:
      return undefined;
  }
};
const parseNumber = value => {
  if (!value) {
    return undefined;
  }
  const numberValue = parseInt(value);
  if (isNaN(numberValue)) {
    return undefined;
  } else {
    return numberValue;
  }
};
const parseTreeOptions = treeElement => {
  const animationSpeed = parseAnimationSpeed(treeElement.dataset.treeAnimationSpeed);
  const autoOpen = parseAutoOpen(treeElement.dataset.auto_open) ?? false;
  const autoEscape = parseBoolean(treeElement.dataset.autoescape) ?? true;
  const csrfCookieName = treeElement.dataset.csrfCookieName ?? "csrf";
  const dragAndDrop = parseBoolean(treeElement.dataset.dragAndDrop) ?? false;
  const hasAddPermission = parseBoolean(treeElement.dataset.hasAddPermission) ?? false;
  const hasChangePermission = parseBoolean(treeElement.dataset.hasChangePermission) ?? false;
  const insertAtUrl = treeElement.dataset.insert_at_url;
  const mouseDelay = parseNumber(treeElement.dataset.treeMouseDelay);
  const rtl = treeElement.dataset.rtl !== undefined;
  const saveState = treeElement.dataset.save_state;
  const useContextMenu = parseBoolean(treeElement.dataset.use_context_menu);
  return {
    animationSpeed,
    autoEscape,
    autoOpen,
    csrfCookieName,
    dragAndDrop,
    hasAddPermission,
    hasChangePermission,
    insertAtUrl,
    mouseDelay,
    rtl,
    saveState,
    useContextMenu
  };
};
/* harmony default export */ const src_parseTreeOptions = (parseTreeOptions);
;// ./src/djangoMpttAdmin.ts


addEventListener("DOMContentLoaded", () => {
  const treeElement = document.getElementById("tree");
  if (treeElement) {
    src_initTree(treeElement, src_parseTreeOptions(treeElement));
  }
});
/******/ })()
;
//# sourceMappingURL=django_mptt_admin.debug.js.map