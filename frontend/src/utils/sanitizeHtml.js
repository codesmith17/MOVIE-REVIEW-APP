import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} html - Raw HTML content from rich text editor
 * @param {object} options - DOMPurify configuration options
 * @returns {string} - Sanitized HTML safe for rendering
 */
export const sanitizeHtml = (html, options = {}) => {
  if (!html) return "";

  const defaultConfig = {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "img",
      "video",
      "iframe",
      "span",
      "div",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "class",
      "src",
      "alt",
      "width",
      "height",
      "controls",
      "frameborder",
      "allowfullscreen",
      "style",
    ],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    // Remove dangerous event handlers
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onloadstart",
      "onclick",
      "onmouseover",
      "onfocus",
      "onblur",
    ],
    ...options,
  };

  return DOMPurify.sanitize(html, defaultConfig);
};

/**
 * Create a sanitized HTML object for dangerouslySetInnerHTML
 * @param {string} html - Raw HTML content
 * @returns {object} - Object with __html property for React
 */
export const createSanitizedHtml = (html) => {
  return {
    __html: sanitizeHtml(html),
  };
};

export default sanitizeHtml;
