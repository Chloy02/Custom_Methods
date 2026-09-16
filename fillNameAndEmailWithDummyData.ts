/** @walnut_method
 * name: Fill Name and Email with Dummy Data
 * description: Generate a random full name and email, fill into the Name and Email fields, and store in $[generated_name] and $[generated_email]
 * actionType: custom_fill_name_and_email
 * context: web
 * needsLocator: false
 * category: Custom
 */
export async function fillNameAndEmailWithDummyData(ctx: any) {
  const firstNames = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Edward',
    'Fiona', 'George', 'Hannah', 'Ivan', 'Julia',
    'Kevin', 'Laura', 'Michael', 'Nina', 'Oscar'
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
    'Garcia', 'Miller', 'Davis', 'Martinez', 'Wilson',
    'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White'
  ];

  const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${randomFirst} ${randomLast}`;

  const timestamp = Date.now();
  const emailLocal = `${randomFirst.toLowerCase()}.${randomLast.toLowerCase()}.${timestamp}`;
  const email = `${emailLocal}@mailinator.com`;

  ctx.log(`Generated name: ${fullName}`);
  ctx.log(`Generated email: ${email}`);

  const nameSelector = '[aria-label*="Your Name"]';
  const emailSelector = '[aria-label="Email Address"]';

  await ctx.waitForVisible(nameSelector);
  await ctx.fill(nameSelector, fullName);

  await ctx.waitForVisible(emailSelector);
  await ctx.fill(emailSelector, email);

  ctx.setVariable('generated_name', fullName);
  ctx.setVariable('generated_email', email);

  if (!ctx.outputs) {
    ctx.outputs = {};
  }
  ctx.outputs['generated_name'] = fullName;
  ctx.outputs['generated_email'] = email;

  ctx.log(`Filled name field with: ${fullName}`);
  ctx.log(`Filled email field with: ${email}`);
}