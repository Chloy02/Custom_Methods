import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Solve Image CAPTCHA
 * description: Reads the image CAPTCHA at ${captchaImageSelector}, types the result into ${inputSelector}, clicks ${loginSelector}, and retries using ${refreshSelector} if an error or popup occurs
 * actionType: custom_solve_image_captcha
 * context: web
 * needsLocator: false
 * category: Authentication
 */
export async function solveImageCaptcha(ctx: WalnutContext) {
  const captchaImageSelector = ctx.args[0]; // from ${captchaImageSelector}
  const inputSelector        = ctx.args[1]; // from ${inputSelector}
  const loginSelector        = ctx.args[2]; // from ${loginSelector}
  const refreshSelector      = ctx.args[3]; // from ${refreshSelector}

  const MAX_ATTEMPTS = 3;

  // Error text patterns that indicate a failed/expired CAPTCHA entry
  const errorPatterns = [
    'timed out',
    'expired',
    'incorrect',
    'invalid captcha',
    'invalid',
    'wrong',
    'try again',
    'captcha error',
    'verification failed',
  ];

  // Selectors for the "Invalid Captcha" popup Ok/Cancel dialog
  // Matches a button whose visible text is exactly "Ok" (case-insensitive)
  const popupOkSelectors = [
    'button:has-text("Ok")',
    'button:has-text("OK")',
    'input[value="Ok"]',
    'input[value="OK"]',
    'a:has-text("Ok")',
  ];

  /**
   * Inject Tesseract.js from CDN into the page (once) and run OCR entirely
   * inside the browser context — avoids any Node.js / __dirname issues.
   *
   * Accuracy improvements vs default:
   *  - PSM 8  → treat image as a single word (ideal for short CAPTCHAs)
   *  - OEM 1  → LSTM neural network engine only
   *  - char whitelist → alphanumeric only, no punctuation noise
   *  - preserve_interword_spaces 0 → collapse spaces between chars
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

        // Run OCR with accuracy-tuned parameters
        const { data } = await Tesseract.recognize(
          ${JSON.stringify(dataUrl)},
          'eng',
          {
            tessedit_pageseg_mode: '8',   // PSM 8 — single word
            tessedit_ocr_engine_mode: '1', // OEM 1 — LSTM only
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
            preserve_interword_spaces: '0',
          }
        );
        // Strip ALL whitespace and non-alphanumeric noise
        return data.text.replace(/[^A-Za-z0-9]/g, '').trim();
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
   * Grab the CAPTCHA image and preprocess it for OCR:
   *  1. Use Playwright screenshot of the element (pixel-perfect, no CORS issues)
   *     falling back to canvas draw if screenshot is unavailable.
   *  2. Upscale 4×.
   *  3. Saturation-aware pixel classification:
   *     — Colorful pixels (high saturation) → black  (catches colored letters)
   *     — Dark pixels (low brightness)      → black  (catches dark letters)
   *     — Everything else                   → white  (background)
   *  This preserves ALL character colors (green, orange, blue, dark) and
   *  removes the light/white background cleanly.
   */
  async function getCaptchaDataUrl(): Promise<string> {
    // Try Playwright native element screenshot first — best quality
    let rawDataUrl = '';
    try {
      const isXPath = captchaImageSelector.startsWith('/') || captchaImageSelector.startsWith('(');
      const pwSelector = isXPath ? `xpath=${captchaImageSelector}` : captchaImageSelector;
      const screenshotBuf: Buffer = await (ctx as any).page.locator(pwSelector).screenshot();
      rawDataUrl = 'data:image/png;base64,' + screenshotBuf.toString('base64');
    } catch (_) {
      // Fallback: canvas draw inside browser
    }

    // If Playwright screenshot failed, fall back to in-browser canvas draw
    if (!rawDataUrl) {
      const elSnippet = resolveElementSnippet(captchaImageSelector);
      rawDataUrl = await ctx.evaluate(`
        (function() {
          const el = ${elSnippet};
          if (!el) return '';
          const srcW = el.naturalWidth  || el.width  || 200;
          const srcH = el.naturalHeight || el.height || 60;
          const c = document.createElement('canvas');
          c.width = srcW; c.height = srcH;
          c.getContext('2d').drawImage(el, 0, 0);
          return c.toDataURL('image/png');
        })()
      `);
    }

    if (!rawDataUrl) return '';

    // Preprocess in-browser: upscale + saturation-aware binarisation
    const processed: string = await ctx.evaluate(`
      (async function() {
        const SCALE = 4;

        // Load the raw data-URL into an Image element
        const img = await new Promise((resolve, reject) => {
          const i = new Image();
          i.onload = () => resolve(i);
          i.onerror = reject;
          i.src = ${JSON.stringify(rawDataUrl)};
        });

        // Draw upscaled
        const canvas = document.createElement('canvas');
        canvas.width  = img.width  * SCALE;
        canvas.height = img.height * SCALE;
        const ctx2d = canvas.getContext('2d');
        ctx2d.imageSmoothingEnabled = false;
        ctx2d.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Pixel-level saturation-aware binarisation
        const id = ctx2d.getImageData(0, 0, canvas.width, canvas.height);
        const d  = id.data;

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i+1], b = d[i+2];

          // HSV saturation — how "colorful" is this pixel?
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max; // 0..1
          const brightness = max / 255;                          // 0..1

          // Classify as foreground (black) if:
          //   • highly saturated  (coloured letter: green, orange, red, blue…)
          //   • OR dark enough    (dark/black letter on light background)
          const isForeground = saturation > 0.25 || brightness < 0.55;

          const bw = isForeground ? 0 : 255;
          d[i] = d[i+1] = d[i+2] = bw;
          // alpha unchanged
        }

        ctx2d.putImageData(id, 0, 0);
        return canvas.toDataURL('image/png');
      })()
    `);

    return processed ?? '';
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

  /**
   * Check whether the "Invalid Captcha" popup is visible and, if so,
   * click its Ok button to dismiss it. Returns true if popup was found.
   */
  async function dismissPopupIfPresent(): Promise<boolean> {
    for (const sel of popupOkSelectors) {
      const found = await ctx.count(sel);
      if (found > 0) {
        ctx.log(`Popup detected — clicking Ok button ("${sel}")`);
        await ctx.click(sel);
        await ctx.wait(400);
        return true;
      }
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

    // 5. Click the login button to submit
    ctx.log(`Clicking login button ("${loginSelector}")…`);
    await ctx.click(loginSelector);

    // 6. Wait briefly for the page/popup to react
    await ctx.wait(600);

    // 7. Check for the "Invalid Captcha" popup and dismiss it if present
    const popupDismissed = await dismissPopupIfPresent();
    if (popupDismissed) {
      ctx.warn(`Invalid Captcha popup dismissed on attempt ${attempt}. Clicking refresh and retrying…`);
      await ctx.click(refreshSelector);
      continue;
    }

    // 8. Also check for inline error text as a fallback
    const errorVisible = await hasVisibleError();
    if (errorVisible) {
      ctx.warn(`Error text detected after attempt ${attempt}. Clicking refresh and retrying…`);
      await ctx.click(refreshSelector);
      continue;
    }

    // No popup, no error — login succeeded
    ctx.log(`CAPTCHA solved and login submitted successfully on attempt ${attempt}.`);
    return;
  }

  ctx.warn(`Failed to solve CAPTCHA after ${MAX_ATTEMPTS} attempts.`);
}
