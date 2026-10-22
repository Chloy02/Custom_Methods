/** @walnut_method
 * name: Generate MMEX Account Name
 * description: Generate a fresh Money Manager EX bank-account name (the fixed text "WT Live " plus today's month/day and a unique time-based suffix) and store it in $[account_name], so every run creates a new account instead of colliding with the one an earlier run left behind.
 * actionType: custom_generate_mmex_account_name
 * context: shared
 * needsLocator: false
 * category: Custom
 */
export async function generateMmexAccountName(ctx: any) {
  const now = new Date();
  const pad = (n: number, width = 2) => String(n).padStart(width, '0');

  const monthDay = `${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const randomPart = pad(Math.floor(Math.random() * 1000), 3);

  // e.g. "WT Live 1022b143052317" — keeps the name the user asked for, unique per run
  const accountName = `WT Live ${monthDay}b${timePart}${randomPart}`;

  ctx.log(`Generated MMEX account name: "${accountName}"`);
  ctx.setVariable('account_name', accountName);

  const stored = ctx.getVariable('account_name');
  if (stored !== accountName) {
    throw new Error(
      `account_name verification failed: expected "${accountName}" but got "${stored}"`
    );
  }

  ctx.log(`Verification passed — account_name: "${stored}"`);
}
