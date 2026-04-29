import type { WalnutContext } from './walnut';
import Tesseract from 'tesseract.js';

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
   * Grab the CAPTCHA image src from the DOM and convert it to a base64
   * data-URL that Tesseract can consume (handles both <img> and <canvas>).
   */
  async function getCaptchaDataUrl(): Promise<string> {
    const dataUrl: string = await ctx.evaluate(`
      (function() {
        const el = document.querySelector(${JSON.stringify(captchaImageSelector)});
        if (!el) return '';
        if (el.tagName === 'CANVAS') return el.toDataURL('image/png');
        if (el.tagName === 'IMG') {
          if (el.src.startsWith('data:')) return el.src;
          // Draw cross-origin img onto a canvas to get base64
          const canvas = document.createElement('canvas');
          canvas.width  = el.naturalWidth  || el.width  || 200;
          canvas.height = el.naturalHeight || el.height || 60;
          const ctx2d = canvas.getContext('2d');
          ctx2d.drawImage(el, 0, 0);
          return canvas.toDataURL('image/png');
        }
        return '';
      })()
    `);
    return dataUrl;
  }

  /**
   * Run Tesseract OCR on a base64 data-URL and return cleaned text.
   * Strips whitespace and characters that are unlikely in simple CAPTCHAs.
   */
  async function ocr(dataUrl: string): Promise<string> {
    const { data } = await Tesseract.recognize(dataUrl, 'eng', {
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    } as any);
    return data.text.replace(/\s+/g, '').trim();
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

  // ── Main retry loop ────────────────────────────────────────────────────────
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    ctx.log(`Attempt ${attempt} of ${MAX_ATTEMPTS}: reading CAPTCHA image…`);

    // 1. Give the image a moment to fully render (especially after a refresh)
    await ctx.wait(800);

    // 2. Grab the image as a data-URL
    const dataUrl = await getCaptchaDataUrl();
    if (!dataUrl) {
      ctx.warn(`Could not read CAPTCHA image (selector: "${captchaImageSelector}"). Retrying…`);
      await ctx.click(refreshSelector);
      continue;
    }

    // 3. OCR the image
    let captchaText = '';
    try {
      captchaText = await ocr(dataUrl);
    } catch (err: any) {
      ctx.warn(`OCR failed on attempt ${attempt}: ${err?.message ?? err}`);
    }

    if (!captchaText) {
      ctx.warn(`OCR returned empty text on attempt ${attempt}. Clicking refresh and retrying…`);
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
      ctx.warn(`Error detected after entering CAPTCHA on attempt ${attempt}. Clicking refresh and retrying…`);
      await ctx.click(refreshSelector);
      continue;
    }

    // No error — we're done
    ctx.log(`CAPTCHA solved successfully on attempt ${attempt}.`);
    return;
  }

  ctx.warn(`Failed to solve CAPTCHA after ${MAX_ATTEMPTS} attempts.`);
}
