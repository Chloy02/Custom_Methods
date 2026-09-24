/** @walnut_method
 * name: Generate Random Name
 * description: Generate a random first name and store in $[randomName]
 * actionType: custom_generate_random_name
 * context: shared
 * needsLocator: false
 * category: Custom
 */
export async function generateRandomName(ctx: any) {
  const firstNames = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Ethan',
    'Fiona', 'George', 'Hannah', 'Ivan', 'Julia',
    'Kevin', 'Laura', 'Michael', 'Nina', 'Oscar',
    'Paula', 'Quinn', 'Rachel', 'Samuel', 'Tina',
    'Uma', 'Victor', 'Wendy', 'Xander', 'Yara', 'Zoe'
  ];

  const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];

  // Append a 4-digit suffix so every run produces a unique value (e.g. "Alice3847")
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  const randomName = `${randomFirst}${suffix}`;

  ctx.log(`Generated random name: ${randomName}`);

  ctx.setVariable('randomName', randomName);

  const stored = ctx.getVariable('randomName');

  if (stored !== randomName) {
    throw new Error(
      `randomName verification failed: expected "${randomName}" but got "${stored}"`
    );
  }

  ctx.log(`Verification passed — randomName: "${stored}"`);
}
