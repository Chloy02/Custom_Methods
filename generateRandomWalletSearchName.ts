/** @walnut_method
 * name: Generate Random Wallet Search Name
 * description: Generate a random first name and store in $[walletSearchName] — use it as the search term in Wallet
 * actionType: custom_generate_random_wallet_search_name
 * context: shared
 * needsLocator: false
 * category: Custom
 */
export async function generateRandomWalletSearchName(ctx: any) {
  const firstNames = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Ethan',
    'Fiona', 'George', 'Hannah', 'Ivan', 'Julia',
    'Kevin', 'Laura', 'Michael', 'Nina', 'Oscar',
    'Paula', 'Quinn', 'Rachel', 'Samuel', 'Tina',
    'Uma', 'Victor', 'Wendy', 'Xander', 'Yara', 'Zoe'
  ];

  const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];

  // Append a 4-digit suffix so every run produces a unique value (e.g. "Nina4821")
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  const walletSearchName = `${randomFirst}${suffix}`;

  ctx.log(`Generated random Wallet search name: ${walletSearchName}`);

  ctx.setVariable('walletSearchName', walletSearchName);

  const stored = ctx.getVariable('walletSearchName');

  if (stored !== walletSearchName) {
    throw new Error(
      `walletSearchName verification failed: expected "${walletSearchName}" but got "${stored}"`
    );
  }

  ctx.log(`Verification passed — walletSearchName: "${stored}"`);
}
