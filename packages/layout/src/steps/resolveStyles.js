import * as P from '@react-pdf/primitives';
import stylesheet from '@react-pdf/stylesheet';

const isLink = (node) => node.type === P.Link;

const DEFAULT_LINK_STYLES = {
  color: 'blue',
  textDecoration: 'underline',
};

/**
 * Computes styles using stylesheet
 *
 * @param {Object} container
 * @param {Object} node document node
 * @returns {Object} computed styles
 */
const computeStyle = (container, node) => {
  let baseStyle = node.style;

  if (isLink(node)) {
    baseStyle = Array.isArray(node.style)
      ? [DEFAULT_LINK_STYLES, ...node.style]
      : [DEFAULT_LINK_STYLES, node.style];
  }

  return stylesheet(container, baseStyle);
};

/**
 * @typedef {Function} ResolveNodeStyles
 * @param {Object} node document node
 * @returns {Object} node (and subnodes) with resolved styles
 */

/**
 * Resolves node styles
 *
 * @param {Object} container
 * @returns {ResolveNodeStyles} resolve node styles
 */
const resolveNodeStyles = (container) => (node) => {
  const style = computeStyle(container, node);

  if (!node.children) return Object.assign({}, node, { style });

  const children = node.children.map(resolveNodeStyles(container));

  return Object.assign({}, node, { style, children });
};

/**
 * Resolves page styles
 *
 * @param {Object} page document page
 * @returns {Object} document page with resolved styles
 */
export const resolvePageStyles = (page) => {
  const dpi = page.props?.dpi || 72;
  const width = page.box?.width || page.style.width;
  const height = page.box?.height || page.style.height;
  const orientation = page.props?.orientation || 'portrait';
  const remBase = page.style?.fontSize || 18;
  const container = { width, height, orientation, dpi, remBase };

  return resolveNodeStyles(container)(page);
};

/**
 * Resolves document styles
 *
 * @param {Object} root document root
 * @returns {Object} document root with resolved styles
 */
const resolveStyles = (root) => {
  if (!root.children) return root;

  const children = root.children.map(resolvePageStyles);

  return Object.assign({}, root, { children });
};

export default resolveStyles;
