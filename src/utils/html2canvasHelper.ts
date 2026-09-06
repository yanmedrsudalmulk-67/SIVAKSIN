import html2canvas, { Options } from 'html2canvas';

// Reuse canvas/ctx for performance
let sharedCanvas: HTMLCanvasElement | null = null;
let sharedCtx: CanvasRenderingContext2D | null = null;

/**
 * Converts modern CSS colors (oklch, oklab, lab, lch, color) into standard hex/rgb/rgba colors.
 */
export const convertModernColors = (str: string): string => {
  if (!str || typeof str !== 'string') return str;
  if (!/oklch|oklab|lab\(|lch\(|color\(/i.test(str)) return str;

  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
    sharedCanvas.width = 1;
    sharedCanvas.height = 1;
    sharedCtx = sharedCanvas.getContext('2d', { willReadFrequently: true });
  }

  const fallbackParseColor = (colorStr: string): string => {
    if (colorStr.includes('0%') || colorStr.includes(' 0 /') || colorStr.includes(', 0)')) {
      return 'rgba(0, 0, 0, 0)';
    }
    return 'rgb(100, 116, 139)'; // safe slate-500
  };

  return str.replace(/(?:oklch|oklab|lab|lch|color)\([^)]+\)/gi, (match) => {
    if (!sharedCtx) return fallbackParseColor(match);
    try {
      sharedCtx.fillStyle = '#123456'; // reset marker
      sharedCtx.fillStyle = match;
      const res = sharedCtx.fillStyle;
      // If fillStyle is still the marker or still contains the modern function name, it failed
      if (res && res !== '#123456' && !/oklch|oklab|lab|lch|color/i.test(res)) {
        return res;
      }
      return fallbackParseColor(match);
    } catch {
      return fallbackParseColor(match);
    }
  });
};

/**
 * Sanitizes CSS text and element styles in a cloned document to convert any unsupported modern color functions
 * (like "oklch", "oklab", "lab", "lch", "color") into standard hex/rgb/rgba colors before html2canvas parses them.
 */
export const sanitizeDocumentForCanvas = (
  clonedDoc: Document,
  clonedElement?: HTMLElement,
  optionsOnclone?: (doc: Document, element?: HTMLElement) => void
) => {
  // 1. Process all <style> elements in cloned document
  try {
    const styleEls = Array.from(clonedDoc.querySelectorAll('style'));
    styleEls.forEach((styleEl) => {
      if (styleEl.textContent && /oklch|oklab|lab\(|lch\(|color\(/i.test(styleEl.textContent)) {
        styleEl.textContent = convertModernColors(styleEl.textContent);
      }
    });
  } catch (e) {
    console.warn('Error sanitizing style tags for canvas render:', e);
  }

  // 2. Process all CSS rules in styleSheets
  try {
    const processRules = (rules: CSSRuleList | CSSRule[]) => {
      Array.from(rules).forEach((rule) => {
        if (rule instanceof CSSStyleRule) {
          if (rule.style) {
            // Iterate through all defined properties in this rule
            for (let i = 0; i < rule.style.length; i++) {
              const prop = rule.style[i];
              const val = rule.style.getPropertyValue(prop);
              if (val && /oklch|oklab|lab\(|lch\(|color\(/i.test(val)) {
                try {
                  rule.style.setProperty(prop, convertModernColors(val));
                } catch (e) {
                  // ignore read-only
                }
              }
            }
            // Also check cssText just in case some things aren't enumerable
            if (rule.style.cssText && /oklch|oklab|lab\(|lch\(|color\(/i.test(rule.style.cssText)) {
              try {
                rule.style.cssText = convertModernColors(rule.style.cssText);
              } catch (e) {
                // ignore
              }
            }
          }
        } else if (rule instanceof CSSGroupingRule || (rule as any).cssRules) {
          processRules((rule as CSSGroupingRule).cssRules || (rule as any).rules);
        }
      });
    };

    Array.from(clonedDoc.styleSheets).forEach((sheet) => {
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (rules) {
          processRules(rules);
        }
      } catch (e) {
        // ignore CORS stylesheet error
      }
    });
  } catch (e) {
    // ignore
  }

  // 3. Process all elements in clonedDoc
  try {
    const allEls = Array.from(clonedDoc.querySelectorAll('*'));
    allEls.forEach((el) => {
      const htmlEl = el as HTMLElement;
      
      // Sanitize inline styles
      if (htmlEl.style && htmlEl.style.cssText && /oklch|oklab|lab\(|lch\(|color\(/i.test(htmlEl.style.cssText)) {
        htmlEl.style.cssText = convertModernColors(htmlEl.style.cssText);
      }

      // Check computed styles and set inline RGB values for any unsupported color properties
      try {
        const computed = clonedDoc.defaultView?.getComputedStyle(htmlEl);
        if (computed) {
          // Iterate through all properties to find any with modern colors
          // This catches variables too if they are resolved in some properties
          for (let i = 0; i < computed.length; i++) {
            const prop = computed[i];
            const val = computed.getPropertyValue(prop);
            if (val && /oklch|oklab|lab\(|lch\(|color\(/i.test(val)) {
              const converted = convertModernColors(val);
              htmlEl.style.setProperty(prop, converted, 'important');
            }
          }
          
          // Also explicitly check common color properties that might not be in the enumeration if they are variables
          const commonProps = [
            'color', 'background-color', 'border-color', 'fill', 'stroke', 'box-shadow', 'text-shadow'
          ];
          commonProps.forEach(prop => {
            const val = computed.getPropertyValue(prop);
            if (val && /oklch|oklab|lab\(|lch\(|color\(/i.test(val)) {
              htmlEl.style.setProperty(prop, convertModernColors(val), 'important');
            }
          });
        }
      } catch (e) {
        // ignore
      }
    });
  } catch (e) {
    console.warn('Error sanitizing elements for canvas render:', e);
  }

  // Call user-provided onclone if exists
  if (optionsOnclone) {
    optionsOnclone(clonedDoc, clonedElement);
  }
};

export const renderHtmlToCanvas = async (
  element: HTMLElement,
  options: Partial<Options> = {}
): Promise<HTMLCanvasElement> => {
  return html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1024,
    ...options,
    onclone: (clonedDoc, clonedElement) => {
      sanitizeDocumentForCanvas(clonedDoc, clonedElement, options.onclone);
    }
  });
};

