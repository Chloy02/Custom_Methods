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

  // Click the hidden flt-semantics-placeholder to activate Flutter's accessibility/semantics mode
  await ctx.evaluate(`
    (function() {
      const placeholder = document.querySelector('flt-semantics-placeholder');
      if (!placeholder) {
        throw new Error('flt-semantics-placeholder element not found in DOM');
      }
      placeholder.click();
      return 'clicked';
    })()
  `);

  ctx.log('Clicked flt-semantics-placeholder, waiting for semantics tree to render...');

  // Wait for the semantics tree to fully render
  await ctx.wait(2000);

  // Verify that real labelled elements now appear in the DOM
  const semanticsCount = await ctx.evaluate(`
    (function() {
      const semanticsElements = document.querySelectorAll('flt-semantics[aria-label], flt-semantics[role], flt-semantics-container');
      return semanticsElements.length;
    })()
  `);

  ctx.log(`Found ${semanticsCount} Flutter semantics elements in the DOM after activation.`);

  if (semanticsCount === 0) {
    // Try a broader check for any accessible elements
    const anyAccessible = await ctx.evaluate(`
      (function() {
        const inputs = document.querySelectorAll('input, button, [role], [aria-label], [aria-labelledby]');
        return inputs.length;
      })()
    `);

    if (anyAccessible === 0) {
      ctx.warn('No accessible elements found after enabling Flutter accessibility. The semantics tree may not have rendered yet.');
    } else {
      ctx.log(`Found ${anyAccessible} accessible elements (inputs/buttons/ARIA) in the DOM.`);
    }
  } else {
    ctx.log('Flutter accessibility semantics successfully enabled and verified.');
  }
}