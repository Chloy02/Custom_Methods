/** @walnut_method
 * name: Generate Random Name For Search
 * description: Generate a random first name and store in $[searchName]
 * actionType: custom_generate_random_name_for_search
 * context: shared
 * needsLocator: false
 * category: Custom
 */
export async function generateRandomNameForSearch(ctx: any) {
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
  const searchName = `${randomFirst}${suffix}`;

  ctx.log(`Generated random name for search: ${searchName}`);

  ctx.setVariable('searchName', searchName);

  const stored = ctx.getVariable('searchName');

  if (stored !== searchName) {
    throw new Error(
      `searchName verification failed: expected "${searchName}" but got "${stored}"`
    );
  }

  ctx.log(`Verification passed — searchName: "${stored}"`);
}
