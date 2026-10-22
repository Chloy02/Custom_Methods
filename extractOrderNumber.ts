/** @walnut_method
 * name: Extract Order Number
 * description: Read the order confirmation text from $[order_number] (e.g. "Order 91 completed") and store the bare numeric order number in $[order_id] for the SEARCH ORDER lookup field, which accepts digits only.
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
  ctx.setVariable('order_id', orderId);
  ctx.log(`Extracted order number: "${orderId}"`);
}
