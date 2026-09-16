/** @walnut_method
 * name: Enable Flutter Accessibility
 * description: Enable Flutter web accessibility semantics so the page elements become locatable
 * actionType: custom_enable_flutter_accessibility
 * context: web
 * needsLocator: false
 * category: Custom
 */
export async function enableFlutterAccessibility(ctx: any) {
  ctx.log('Enabling Flutter web accessibility semantics...');

  // Use page.evaluate to find and click the flt-semantics-placeholder element via JavaScript
  // This element may be outside the viewport or hidden, so we use JS click
  const clicked = await ctx.page.evaluate(() => {
    // Try to find by tag name first
    const byTag = document.querySelector('flt-semantics-placeholder');
    if (byTag) {
      (byTag as HTMLElement).click();
      return 'clicked flt-semantics-placeholder by tag';
    }

    // Try by aria-label
    const byAriaLabel = document.querySelector('[aria-label="Enable accessibility"]');
    if (byAriaLabel) {
      (byAriaLabel as HTMLElement).click();
      return 'clicked element by aria-label="Enable accessibility"';
    }

    // Try searching in shadow DOM or nested structures
    const allElements = document.querySelectorAll('*');
    for (const el of Array.from(allElements)) {
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.toLowerCase().includes('enable accessibility')) {
        (el as HTMLElement).click();
        return `clicked element: ${el.tagName} with aria-label="${ariaLabel}"`;
      }
    }

    return null;
  });

  if (clicked) {
    ctx.log(`Flutter accessibility activation result: ${clicked}`);
  } else {
    ctx.warn('Could not find flt-semantics-placeholder or Enable accessibility element. Flutter may already be in accessibility mode, or the element is not present.');
  }

  // Wait 2 seconds for the accessibility tree to populate
  ctx.log('Waiting 2 seconds for Flutter accessibility tree to populate...');
  await ctx.wait(2000);

  // Verify that real labelled form elements are now visible in the DOM
  const semanticsFound = await ctx.page.evaluate(() => {
    // Check for flt-semantics elements which Flutter creates in accessibility mode
    const semanticsElements = document.querySelectorAll('flt-semantics, [flt-semantics], [role="button"], [role="textbox"], input, button');
    const count = semanticsElements.length;

    // Also check for any elements with meaningful aria labels that Flutter exposes
    const labelledElements = document.querySelectorAll('[aria-label]:not([aria-label="Enable accessibility"]), [aria-labelledby], [role]');

    return {
      semanticsCount: count,
      labelledCount: labelledElements.length,
      hasFltSemantics: document.querySelectorAll('flt-semantics').length > 0,
    };
  });

  ctx.log(`Accessibility tree status: flt-semantics elements: ${semanticsFound.hasFltSemantics}, semantics/form elements found: ${semanticsFound.semanticsCount}, labelled elements: ${semanticsFound.labelledCount}`);

  if (semanticsFound.hasFltSemantics || semanticsFound.labelledCount > 1) {
    ctx.log('Flutter accessibility mode successfully enabled. UI elements are now accessible.');
  } else {
    ctx.warn('Flutter accessibility elements may not be fully populated yet. Consider adding additional wait time if subsequent steps fail.');
  }
}