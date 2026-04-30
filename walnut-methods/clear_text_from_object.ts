import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Clear Text From Object
 * description: Clear the text from ${object}
 * actionType: custom_clear_text_from_object
 * context: web
 * needsLocator: true
 * category: Forms
 */
export async function clearTextFromObject(ctx: WalnutContext) {
  // ctx.args[0] is the XPath locator resolved from the attached object's default locator
  const locator = ctx.args[0];
  await ctx.clear(locator);
}
