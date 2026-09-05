import html2canvas, { Options } from 'html2canvas';

/**
 * Sanitizes CSS text and element styles to convert any unsupported modern color functions
 * (like "oklch", "oklab", "lab", "lch", "color") into standard hex/rgb/rgba colors before html2canvas parses them.
 */
export const renderHtmlToCanvas = async (
  element: HTMLElement,
  options: Partial<Options> = {}
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const fallbackParseColor = (colorStr: string): string => {
    // If we cannot convert, return a safe solid/transparent color so html2canvas doesn't throw
    if (colorStr.includes('0%') || colorStr.includes(' 0 /') || colorStr.includes(', 0)')) {
      return 'rgba(0, 0, 0, 0)';
    }
    return 'rgb(100, 116, 139)'; // safe slate-500
  };

  const convertModernColors = (str: string): string => {
    if (!str || typeof str !== 'string') return str;
    if (!/oklch|oklab|lab\(|lch\(|color\(/i.test(str)) return str;

    return str.replace(/(?:oklch|oklab|lab|lch|color)\([^)]+\)/gi, (match) => {
      if (!ctx) return fallbackParseColor(match);
      try {
        ctx.fillStyle = '#000000'; // reset
        ctx.fillStyle = match;
        const res = ctx.fillStyle;
        if (res && res !== '#000000' && !/oklch|oklab|lab|lch|color/i.test(res)) {
          return res;
        }
        return fallbackParseColor(match);
      } catch {
        return fallbackParseColor(match);
      }
    });
  };

  const customOnClone = (clonedDoc: Document, clonedElement: HTMLElement) => {
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
      Array.from(clonedDoc.styleSheets).forEach((sheet) => {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (rules) {
            Array.from(rules).forEach((rule) => {
              const styleRule = rule as CSSStyleRule;
              if (styleRule.style && styleRule.style.cssText && /oklch|oklab|lab\(|lch\(|color\(/i.test(styleRule.style.cssText)) {
                styleRule.style.cssText = convertModernColors(styleRule.style.cssText);
              }
            });
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
        if (htmlEl.style && htmlEl.style.cssText && /oklch|oklab|lab\(|lch\(|color\(/i.test(htmlEl.style.cssText)) {
          htmlEl.style.cssText = convertModernColors(htmlEl.style.cssText);
        }

        // Check computed styles and set inline RGB values for any unsupported color properties
        try {
          const computed = clonedDoc.defaultView?.getComputedStyle(htmlEl);
          if (computed) {
            const props = [
              'color',
              'background',
              'backgroundColor',
              'backgroundImage',
              'borderColor',
              'borderTopColor',
              'borderBottomColor',
              'borderLeftColor',
              'borderRightColor',
              'fill',
              'stroke',
              'outlineColor',
              'boxShadow',
              'textShadow'
            ];
            props.forEach((prop) => {
              const val = computed.getPropertyValue(prop);
              if (val && /oklch|oklab|lab\(|lch\(|color\(/i.test(val)) {
                const converted = convertModernColors(val);
                htmlEl.style.setProperty(prop, converted, 'important');
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
    if (options.onclone) {
      options.onclone(clonedDoc, clonedElement);
    }
  };

  return html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1024,
    ...options,
    onclone: customOnClone
  });
};
