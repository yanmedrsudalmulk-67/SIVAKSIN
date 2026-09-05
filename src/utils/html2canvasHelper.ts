import html2canvas, { Options } from 'html2canvas';

/**
 * Sanitizes CSS text and element styles to convert any unsupported "oklch" color functions
 * into standard hex or rgba colors before html2canvas parses them.
 */
export const renderHtmlToCanvas = async (
  element: HTMLElement,
  options: Partial<Options> = {}
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const convertOklch = (str: string): string => {
    if (!str || typeof str !== 'string' || !str.includes('oklch')) return str;
    return str.replace(/oklch\([^)]+\)/gi, (match) => {
      if (!ctx) return 'rgb(128, 128, 128)';
      try {
        ctx.fillStyle = '#000000'; // reset
        ctx.fillStyle = match;
        const res = ctx.fillStyle;
        if (res && res !== '#000000' && !res.includes('oklch')) {
          return res;
        }
        return 'rgb(128, 128, 128)';
      } catch {
        return 'rgb(128, 128, 128)';
      }
    });
  };

  const customOnClone = (clonedDoc: Document, clonedElement: HTMLElement) => {
    // 1. Process all <style> elements
    try {
      const styleEls = Array.from(clonedDoc.querySelectorAll('style'));
      styleEls.forEach((styleEl) => {
        if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
          styleEl.textContent = convertOklch(styleEl.textContent);
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
              if (styleRule.style && styleRule.style.cssText && styleRule.style.cssText.includes('oklch')) {
                styleRule.style.cssText = convertOklch(styleRule.style.cssText);
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
        if (htmlEl.style && htmlEl.style.cssText && htmlEl.style.cssText.includes('oklch')) {
          htmlEl.style.cssText = convertOklch(htmlEl.style.cssText);
        }

        // Check computed styles and set inline RGB values for any oklch color properties
        try {
          const computed = clonedDoc.defaultView?.getComputedStyle(htmlEl);
          if (computed) {
            const props = [
              'color',
              'backgroundColor',
              'borderColor',
              'fill',
              'stroke',
              'borderTopColor',
              'borderBottomColor',
              'borderLeftColor',
              'borderRightColor',
              'outlineColor',
              'boxShadow'
            ];
            props.forEach((prop) => {
              const val = computed.getPropertyValue(prop);
              if (val && val.includes('oklch')) {
                const converted = convertOklch(val);
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
