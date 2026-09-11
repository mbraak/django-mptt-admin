const parseAnimationSpeed = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const numberValue = parseNumber(value);

  if (numberValue === undefined) {
    return value;
  } else {
    return numberValue;
  }
}

const parseAutoOpen = (value?: string) => {
  return parseNumber(value) ?? parseBoolean(value);
}

const parseBoolean = (value?: string) => {
  switch (value) {
    case "false":
      return false;
    case "true":
      return true;
    default:
      return undefined;
  }
}

const parseNumber = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const numberValue = parseInt(value);

  if (isNaN(numberValue)) {
    return undefined;
  } else {
    return numberValue;
  }
}


const parseTreeOptions = (treeElement: HTMLElement) => {
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
  }
}

export default parseTreeOptions;