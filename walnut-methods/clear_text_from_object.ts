import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Clear Text From Object
 * description: Clear text from the linked object
 * actionType: custom_clear_text_from_object
 * context: web
 * needsLocator: true
 * category: Forms
 */
export async function clearTextFromObject(ctx: WalnutContext) {
  // needsLocator: true → runtime resolves step.object_id → fetches the object document
  // → picks the unique/default attribute value (XPath) → passes it as ctx.args[0]
  if (ctx.platform !== 'web') return;
  const locator = ctx.args[0];
  await ctx.clear(locator);
}
