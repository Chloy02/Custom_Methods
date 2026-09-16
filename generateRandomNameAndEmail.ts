/** @walnut_method
 * name: Generate Random Name and Email
 * description: Generate a random full name and email address, store in $[generatedName] and $[generatedEmail]
 * actionType: custom_generate_name_and_email
 * context: web
 * needsLocator: false
 * category: Custom
 */
export async function generateRandomNameAndEmail(ctx: any) {
  const firstNames = [
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey',
    'Riley', 'Quinn', 'Avery', 'Skylar', 'Dakota',
    'Jamie', 'Reese', 'Peyton', 'Hayden', 'Cameron'
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
    'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore',
    'Anderson', 'Taylor', 'Thomas', 'Jackson', 'White'
  ];

  const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
  const fullName = `${randomFirst} ${randomLast}`;

  const fourDigit = String(Math.floor(1000 + Math.random() * 9000));
  const email = `${randomFirst.toLowerCase()}.${randomLast.toLowerCase()}${fourDigit}@testmail.com`;

  ctx.log(`Generated name: ${fullName}`);
  ctx.log(`Generated email: ${email}`);

  ctx.setVariable('generatedName', fullName);
  ctx.setVariable('generatedEmail', email);

  // Verify the variables were stored correctly
  const storedName = ctx.getVariable('generatedName');
  const storedEmail = ctx.getVariable('generatedEmail');

  if (storedName !== fullName) {
    throw new Error(`generatedName verification failed: expected "${fullName}" but got "${storedName}"`);
  }

  if (storedEmail !== email) {
    throw new Error(`generatedEmail verification failed: expected "${email}" but got "${storedEmail}"`);
  }

  // Verify name format: "FirstName LastName"
  const nameParts = storedName.split(' ');
  if (nameParts.length !== 2) {
    throw new Error(`generatedName format invalid: expected "FirstName LastName" but got "${storedName}"`);
  }
  if (nameParts[0] !== randomFirst) {
    throw new Error(`generatedName first name mismatch: expected "${randomFirst}" but got "${nameParts[0]}"`);
  }
  if (nameParts[1] !== randomLast) {
    throw new Error(`generatedName last name mismatch: expected "${randomLast}" but got "${nameParts[1]}"`);
  }

  // Verify email format
  const expectedEmailPattern = /^[a-z]+\.[a-z]+\d{4}@testmail\.com$/;
  if (!expectedEmailPattern.test(storedEmail)) {
    throw new Error(`generatedEmail format invalid: "${storedEmail}" does not match expected pattern "firstname.lastname####@testmail.com"`);
  }

  // Verify email contains the correct name parts
  const expectedEmailPrefix = `${randomFirst.toLowerCase()}.${randomLast.toLowerCase()}${fourDigit}`;
  if (!storedEmail.startsWith(expectedEmailPrefix)) {
    throw new Error(`generatedEmail prefix mismatch: expected to start with "${expectedEmailPrefix}" but got "${storedEmail}"`);
  }

  if (!storedEmail.endsWith('@testmail.com')) {
    throw new Error(`generatedEmail domain mismatch: expected to end with "@testmail.com" but got "${storedEmail}"`);
  }

  ctx.log(`Verification passed — name: "${storedName}", email: "${storedEmail}"`);
}