/** @walnut_method
 * name: Generate Random Search Term
 * description: Generate a random search term and store it in $[randomSearchTerm]
 * actionType: custom_generate_random_search_term
 * context: web
 * needsLocator: false
 * category: Custom
 */
export async function generateRandomSearchTerm(ctx: any) {
  const searchTerms = [
    'apple', 'banana', 'coffee', 'travel', 'music',
    'fitness', 'gaming', 'fashion', 'sports', 'movies',
    'books', 'nature', 'cooking', 'health', 'tech',
    'art', 'science', 'finance', 'education', 'design',
    'yuvi', 'wallet', 'payment', 'card', 'loyalty',
    'ticket', 'boarding', 'rewards', 'coupon', 'pass'
  ];

  const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

  ctx.log(`Generated random search term: ${randomTerm}`);

  ctx.setVariable('randomSearchTerm', randomTerm);

  const stored = ctx.getVariable('randomSearchTerm');

  if (stored !== randomTerm) {
    throw new Error(
      `randomSearchTerm verification failed: expected "${randomTerm}" but got "${stored}"`
    );
  }

  ctx.log(`Verification passed — randomSearchTerm: "${stored}"`);
}
