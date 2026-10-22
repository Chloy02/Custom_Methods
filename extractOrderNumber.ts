/** @walnut_method
 * name: Extract Order Number
 * description: Read the order confirmation text stored in $[order_number] (e.g. "Order 91 completed") and replace it with the bare numeric order number (e.g. "91") for the SEARCH ORDER by-number lookup field, which accepts digits only.
 * actionType: custom_extract_order_number
 * context: shared
 * needsLocator: false
 * category: Custom
 */
export async function extractOrderNumber(ctx: any) {
  const raw = String(ctx.getVariable('order_number') ?? '');
  ctx.log(`Order confirmation text: "${raw}"`);

  const match = raw.match(/\d+/);
  if (!match) {
    throw new Error(`No numeric order number found in confirmation text "${raw}"`);
  }

  const orderId = match[0];
  ctx.setVariable('order_number', orderId);
  ctx.log(`Extracted order number: "${orderId}"`);
}
