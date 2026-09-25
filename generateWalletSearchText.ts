/** @walnut_method
 * name: Generate Wallet Search Text
 * description: Generate a random lowercase text string on every run and store it in $[walletSearchText]
 * actionType: custom_generate_wallet_search_text
 * context: shared
 * needsLocator: false
 * category: Custom
 */
export async function generateWalletSearchText(ctx: any) {
  const letters = 'abcdefghijklmnopqrstuvwxyz';

  // Generate a random 5–8 character lowercase word
  const length = 5 + Math.floor(Math.random() * 4);
  let text = '';
  for (let i = 0; i < length; i++) {
    text += letters[Math.floor(Math.random() * letters.length)];
  }

  // Append a 3-digit numeric suffix so consecutive runs never collide (e.g. "mrqtz491")
  const suffix = String(Math.floor(100 + Math.random() * 900));
  const walletSearchText = `${text}${suffix}`;

  ctx.log(`Generated wallet search text: ${walletSearchText}`);

  ctx.setVariable('walletSearchText', walletSearchText);

  const stored = ctx.getVariable('walletSearchText');
  if (stored !== walletSearchText) {
    throw new Error(
      `walletSearchText verification failed: expected "${walletSearchText}" but got "${stored}"`
    );
  }

  ctx.log(`Verification passed — walletSearchText: "${stored}"`);
}
