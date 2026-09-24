/** @walnut_method
 * name: Generate Random Search Term
 * description: Generate a random search term and store it in $[randomSearchTerm]
 * actionType: custom_generate_random_search_term
 * context: universal
 * needsLocator: false
 * category: Custom
 */
export async function generateRandomSearchTerm(ctx: any) {
  // Pool of meaningful Wallet-related seed words
  const seedWords = [
    'apple', 'banana', 'coffee', 'travel', 'music',
    'fitness', 'gaming', 'fashion', 'sports', 'movies',
    'books', 'nature', 'cooking', 'health', 'tech',
    'art', 'science', 'finance', 'education', 'design',
    'yuvi', 'wallet', 'payment', 'card', 'loyalty',
    'ticket', 'boarding', 'rewards', 'coupon', 'pass'
  ];

  // Pick a random seed word
  const seed = seedWords[Math.floor(Math.random() * seedWords.length)];

  // Append a random 4-digit suffix so every run is unique (e.g. "card7342")
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  const randomTerm = `${seed}${suffix}`;

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
