/** @walnut_method
 * name: Enable Flutter Accessibility
 * description: Enable Flutter web accessibility semantics so page elements become locatable
 * actionType: custom_enable_flutter_accessibility
 * context: web
 * needsLocator: false
 * category: Custom
 */
export async function enableFlutterAccessibility(ctx: any) {
  ctx.log('Enabling Flutter web accessibility semantics...');

  // Click the hidden flt-semantics-placeholder via JavaScript to trigger Flutter's accessibility mode
  await ctx.evaluate(`
    (function() {
      const placeholder = document.querySelector('flt-semantics-placeholder');
      if (!placeholder) {
        throw new Error('flt-semantics-placeholder element not found on the page');
      }
      placeholder.click();
      return 'clicked';
    })()
  `);

  ctx.log('Clicked flt-semantics-placeholder, waiting for semantics tree to populate...');

  // Wait for Flutter to build the accessibility/semantics tree
  await ctx.wait(1500);

  // Verify that real labelled elements are now present in the DOM
  // Flutter semantics elements appear as flt-semantics nodes with aria attributes
  const semanticsCount = await ctx.evaluate(`
    (function() {
      const semanticsNodes = document.querySelectorAll('flt-semantics[aria-label], flt-semantics[role], flt-semantics-container, input, [aria-label]');
      return semanticsNodes.length;
    })()
  `);

  ctx.log(`Found ${semanticsCount} accessible/labelled elements in the DOM after enabling Flutter accessibility.`);

  if (semanticsCount === 0) {
    ctx.warn('No labelled elements found after enabling Flutter accessibility. The semantics tree may not have populated yet.');
  } else {
    ctx.log('Flutter accessibility semantics successfully enabled. Real labelled elements are now present in the DOM.');
  }
}