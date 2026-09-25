/** @walnut_method
 * name: Generate Random Search Input
 * description: Generate a random lowercase alphabetic string (5–8 chars) and store it in $[randomSearchInput]
 * actionType: custom_generate_random_search_input
 * context: shared
 * needsLocator: false
 * category: Custom
 */
export async function generateRandomSearchInput(ctx: any) {
  const letters = 'abcdefghijklmnopqrstuvwxyz';

  // Random length between 5 and 8 characters
  const length = 5 + Math.floor(Math.random() * 4);

  let randomText = '';
  for (let i = 0; i < length; i++) {
    randomText += letters[Math.floor(Math.random() * letters.length)];
  }

  ctx.log(`Generated random search input: ${randomText}`);

  ctx.setVariable('randomSearchInput', randomText);

  const stored = ctx.getVariable('randomSearchInput');
  if (stored !== randomText) {
    throw new Error(
      `randomSearchInput verification failed: expected "${randomText}" but got "${stored}"`
    );
  }

  ctx.log(`Verification passed — randomSearchInput: "${stored}"`);
}
