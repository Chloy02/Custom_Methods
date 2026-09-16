/** @walnut_method
 * name: Fill Create Account Form
 * description: Fill the FlutterFlow create account form with name ${name}, email ${email}, password ${password}, and confirm password ${confirm_password}
 * actionType: custom_fill_create_account_form
 * context: web
 * needsLocator: false
 * category: Custom
 */
export async function fillCreateAccountForm(ctx: any) {
  const name = ctx.args[0];
  const email = ctx.args[1];
  const password = ctx.args[2];
  const confirmPassword = ctx.args[3];

  ctx.log(`Filling create account form with name=${name}, email=${email}`);

  // Step 1: Click the "Your Name" field
  const nameField = ctx.page.getByRole('textbox', { name: 'Your Name' });
  await nameField.click();

  // Step 2: Wait 400ms for Flutter to bind focus
  await ctx.wait(400);

  // Step 3: Select all and type the name
  await ctx.page.keyboard.press('Control+A');
  await ctx.page.keyboard.type(name);

  // Step 4: Wait 300ms
  await ctx.wait(300);

  // Step 5: Click the "Email Address" field
  const emailField = ctx.page.getByRole('textbox', { name: 'Email Address' });
  await emailField.click();

  // Step 6: Wait 400ms
  await ctx.wait(400);

  // Step 7: Select all and type the email
  await ctx.page.keyboard.press('Control+A');
  await ctx.page.keyboard.type(email);

  // Step 8: Wait 300ms
  await ctx.wait(300);

  // Step 9: Click the "Password" field (exact match to avoid Confirm Password)
  const passwordField = ctx.page.getByRole('textbox', { name: 'Password', exact: true });
  await passwordField.click();

  // Step 10: Wait 400ms
  await ctx.wait(400);

  // Step 11: Select all and type the password
  await ctx.page.keyboard.press('Control+A');
  await ctx.page.keyboard.type(password);

  // Step 12: Wait 300ms
  await ctx.wait(300);

  // Step 13: Click the "Confirm Password" field
  const confirmPasswordField = ctx.page.getByRole('textbox', { name: 'Confirm Password' });
  await confirmPasswordField.click();

  // Step 14: Wait 400ms
  await ctx.wait(400);

  // Step 15: Select all and type the confirm password
  await ctx.page.keyboard.press('Control+A');
  await ctx.page.keyboard.type(confirmPassword);

  // Step 16: Wait 300ms
  await ctx.wait(300);

  ctx.log('All fields filled, verifying page is still on create-account');

  // Verify we are still on the create-account page
  await ctx.verifyUrlContains('create-account');

  ctx.log('Create account form filled successfully');
}