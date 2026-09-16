/** @walnut_method
 * name: Enable Flutter Accessibility
 * description: Enable Flutter web accessibility to expose semantic elements
 * actionType: custom_enable_flutter_accessibility
 * context: web
 * needsLocator: false
 * category: Custom
 */
export async function enableFlutterAccessibility(ctx: any) {
  ctx.log('Enabling Flutter web accessibility by clicking flt-semantics-placeholder...');

  await ctx.evaluate(`
    (function() {
      const placeholder = document.querySelector('flt-semantics-placeholder');
      if (!placeholder) {
        throw new Error('flt-semantics-placeholder element not found on the page');
      }
      placeholder.click();
    })();
  `);

  ctx.log('Clicked flt-semantics-placeholder, waiting 2000ms for semantic tree to render...');
  await ctx.wait(2000);

  const semanticsCount = await ctx.evaluate(`
    (function() {
      return document.querySelectorAll('flt-semantics[aria-label]').length;
    })();
  `);

  ctx.log(`Found ${semanticsCount} flt-semantics elements with aria-label attributes.`);

  if (!semanticsCount || semanticsCount === 0) {
    throw new Error(
      'Flutter accessibility was not enabled successfully: no flt-semantics[aria-label] elements found after clicking the placeholder.'
    );
  }

  ctx.log(`Flutter accessibility enabled successfully. ${semanticsCount} labelled semantic elements are now accessible.`);
}