import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Solve Image CAPTCHA
 * description: Reads the image CAPTCHA at ${captchaImageSelector}, types the result into ${inputSelector}, and retries using ${refreshSelector} if an error occurs
 * actionType: custom_solve_image_captcha
 * context: web
 * needsLocator: false
 * category: Authentication
 */
export async function solveImageCaptcha(ctx: WalnutContext) {
  const captchaImageSelector = ctx.args[0]; // from ${captchaImageSelector}
  const inputSelector        = ctx.args[1]; // from ${inputSelector}
  const refreshSelector      = ctx.args[2]; // from ${refreshSelector}

  const MAX_ATTEMPTS = 3;

  // Error text patterns that indicate a failed/expired CAPTCHA entry
  const errorPatterns = [
    'timed out',
    'expired',
    'incorrect',
    'invalid',
    'wrong',
    'try again',
    'captcha error',
    'verification failed',
  ];

  /**
   * Inject Tesseract.js from CDN into the page (once) and run OCR entirely
   * inside the browser context — avoids any Node.js / __dirname issues.
   */
  async function ocrViaBrowser(dataUrl: string): Promise<string> {
    const result: string = await ctx.evaluate(`
      (async function() {
        // Inject Tesseract.js CDN script if not already loaded
        if (!window.__tesseractLoaded) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
          });
          window.__tesseractLoaded = true;
        }

        // Run OCR
        const { data } = await Tesseract.recognize(
          ${JSON.stringify(dataUrl)},
          'eng',
          { tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' }
        );
        return data.text.replace(/\\s+/g, '').trim();
      })()
    `);
    return result ?? '';
  }

  /**
   * Resolve a selector that may be CSS or XPath into a DOM element.
   * XPath expressions start with '/' or '('.
   * Returns the element via a JS snippet safe to embed in evaluate().
   */
  function resolveElementSnippet(selector: string): string {
    const isXPath = selector.startsWith('/') || selector.startsWith('(');
    if (isXPath) {
      return `document.evaluate(${JSON.stringify(selector)}, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue`;
    }
    return `document.querySelector(${JSON.stringify(selector)})`;
  }

  /**
   * Grab the CAPTCHA image and convert it to a base64 data-URL.
   * Handles both <img> and <canvas> elements, and both CSS and XPath selectors.
   */
  async function getCaptchaDataUrl(): Promise<string> {
    const elSnippet = resolveElementSnippet(captchaImageSelector);
    const dataUrl: string = await ctx.evaluate(`
      (function() {
        const el = ${elSnippet};
        if (!el) return '';
        if (el.tagName === 'CANVAS') return el.toDataURL('image/png');
        if (el.tagName === 'IMG') {
          if (el.src.startsWith('data:')) return el.src;
          // Draw onto a canvas to get base64 (works for same-origin images)
          const canvas = document.createElement('canvas');
          canvas.width  = el.naturalWidth  || el.width  || 200;
          canvas.height = el.naturalHeight || el.height || 60;
          const c = canvas.getContext('2d');
          c.drawImage(el, 0, 0);
          return canvas.toDataURL('image/png');
        }
        return '';
      })()
    `);
    return dataUrl ?? '';
  }

  /**
   * Check the page for any visible CAPTCHA error message.
   */
  async function hasVisibleError(): Promise<boolean> {
    for (const pattern of errorPatterns) {
      const found = await ctx.count(`text=${pattern}`);
      if (found > 0) return true;
    }
    return false;
  }

  // ── Main retry loop ──────────────────────────────────────────────────────────
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    ctx.log(`Attempt ${attempt} of ${MAX_ATTEMPTS}: reading CAPTCHA image…`);

    // 1. Wait for the image to fully render (especially after a refresh)
    await ctx.wait(800);

    // 2. Grab the image as a data-URL
    const dataUrl = await getCaptchaDataUrl();
    if (!dataUrl) {
      ctx.warn(`Could not read CAPTCHA image (selector: "${captchaImageSelector}"). Clicking refresh…`);
      await ctx.click(refreshSelector);
      continue;
    }

    // 3. OCR the image inside the browser (no Node.js dependency)
    let captchaText = '';
    try {
      captchaText = await ocrViaBrowser(dataUrl);
    } catch (err: any) {
      ctx.warn(`OCR failed on attempt ${attempt}: ${err?.message ?? err}`);
    }

    if (!captchaText) {
      ctx.warn(`OCR returned empty text on attempt ${attempt}. Clicking refresh…`);
      await ctx.click(refreshSelector);
      continue;
    }

    ctx.log(`OCR result: "${captchaText}"`);

    // 4. Clear the input and type the recognised text
    await ctx.clear(inputSelector);
    await ctx.type(inputSelector, captchaText);

    // 5. Short pause so the page can react before we check for errors
    await ctx.wait(500);

    // 6. Check for a visible error message
    const errorVisible = await hasVisibleError();
    if (errorVisible) {
      ctx.warn(`Error detected after entering CAPTCHA on attempt ${attempt}. Clicking refresh…`);
      await ctx.click(refreshSelector);
      continue;
    }

    // No error — done
    ctx.log(`CAPTCHA solved successfully on attempt ${attempt}.`);
    return;
  }

  ctx.warn(`Failed to solve CAPTCHA after ${MAX_ATTEMPTS} attempts.`);
}
