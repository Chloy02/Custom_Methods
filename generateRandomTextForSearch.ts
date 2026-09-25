/** @walnut_method
 * name: Generate Random Text For Search
 * description: Generate a random alphanumeric text string and store it in $[randomSearchText]
 * actionType: custom_generate_random_text_for_search
 * context: shared
 * needsLocator: false
 * category: Custom
 */
export async function generateRandomTextForSearch(ctx: any) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6 + Math.floor(Math.random() * 5); // 6–10 characters

  let randomText = '';
  for (let i = 0; i < length; i++) {
    randomText += chars[Math.floor(Math.random() * chars.length)];
  }

  ctx.log(`Generated random search text: ${randomText}`);

  ctx.setVariable('randomSearchText', randomText);

  const stored = ctx.getVariable('randomSearchText');

  if (stored !== randomText) {
    throw new Error(
      `randomSearchText verification failed: expected "${randomText}" but got "${stored}"`
    );
  }

  ctx.log(`Verification passed — randomSearchText: "${stored}"`);
}
