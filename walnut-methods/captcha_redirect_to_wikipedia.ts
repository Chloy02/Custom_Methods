import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Redirect to Wikipedia if CAPTCHA Detected
 * description: Checks if the current page contains a CAPTCHA or human verification challenge and navigates to Wikipedia if detected
 * actionType: custom_captcha_redirect_to_wikipedia
 * context: web
 * needsLocator: false
 * category: Navigation
 */
export async function captchaRedirectToWikipedia(ctx: WalnutContext) {
  // Selectors and text patterns that indicate a CAPTCHA / human-verification challenge
  const captchaSelectors = [
    'iframe[src*="recaptcha"]',
    'iframe[src*="hcaptcha"]',
    '.g-recaptcha',
    '.h-captcha',
    '#challenge-form',           // Cloudflare challenge page
    '#cf-challenge-running',     // Cloudflare
    '[data-sitekey]',            // Generic reCAPTCHA / hCaptcha attribute
  ];

  const captchaTextPatterns = [
    'i am not a robot',
    'i\'m not a robot',
    'verify you are human',
    'verify you\'re human',
    'human verification',
    'please verify',
    'prove you\'re not a robot',
    'checking your browser',     // Cloudflare interstitial
    'enable cookies',            // Cloudflare cookie check
    'just a moment',             // Cloudflare "Just a moment..." title
  ];

  // Check for CAPTCHA selectors — use count() instead of isVisible() to avoid
  // strict mode violations when a selector matches multiple elements (e.g. reCAPTCHA
  // injects two iframes: the checkbox widget and the challenge popup).
  let captchaFound = false;

  for (const selector of captchaSelectors) {
    const matched = await ctx.count(selector);
    if (matched > 0) {
      ctx.log(`CAPTCHA detected via selector: ${selector} (${matched} element(s))`);
      captchaFound = true;
      break;
    }
  }

  // Check page title / URL if no selector match yet
  if (!captchaFound) {
    const pageTitle = (await ctx.getTitle()).toLowerCase();
    const pageUrl = ctx.getUrl().toLowerCase();

    for (const pattern of captchaTextPatterns) {
      if (pageTitle.includes(pattern) || pageUrl.includes('challenge')) {
        ctx.log(`CAPTCHA detected via page title/URL: "${pageTitle}"`);
        captchaFound = true;
        break;
      }
    }
  }

  if (!captchaFound) {
    // Last resort: count visible text nodes on the page body
    for (const pattern of captchaTextPatterns) {
      const matched = await ctx.count(`text=${pattern}`);
      if (matched > 0) {
        ctx.log(`CAPTCHA detected via visible text: "${pattern}"`);
        captchaFound = true;
        break;
      }
    }
  }

  if (captchaFound) {
    ctx.log('CAPTCHA/human verification challenge detected — navigating to Wikipedia.');
    await ctx.navigate('https://www.wikipedia.org');
    await ctx.verifyTextVisible('Wikipedia');
  } else {
    ctx.log('No CAPTCHA detected on current page. No action taken.');
  }
}
