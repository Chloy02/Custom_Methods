/** @walnut_method
 * name: Generate Random Text For Search
 * description: Generate a random alphabetic text string (5–8 chars) and store it in $[randomSearchText]
 * actionType: custom_generate_random_text_for_search
 * context: shared
 * needsLocator: false
 * category: Custom
 */
export async function generateRandomTextForSearch(ctx: any) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const length = 5 + Math.floor(Math.random() * 4); // 5–8 characters

  let randomText = '';
  for (let i = 0; i < length; i++) {
    randomText += chars[Math.floor(Math.random() * chars.length)];
  }

  ctx.log(`Generated random search text: ${randomText}`);
  ctx.setVariable('randomSearchText', randomText);
  ctx.log(`Stored randomSearchText = "${randomText}"`);
}
