/** @walnut_method
 * name: Go Back To Wallet Home
 * description: Dismiss any open search or sub-screen and return to the Wallet home screen
 * actionType: custom_go_back_to_wallet_home
 * context: ios
 * needsLocator: false
 * category: Navigation
 */
export async function goBackToWalletHome(ctx: any) {
  ctx.log('Attempting to return to Wallet home screen...');

  // Step 1: Dismiss the search screen if a Cancel button is visible
  const cancelVisible = await ctx.isVisible("//XCUIElementTypeButton[@name='close']");

  if (cancelVisible) {
    ctx.log('Search screen is open — tapping close button to dismiss it');
    await ctx.tap("//XCUIElementTypeButton[@name='close']");
    await ctx.wait(500);
  } else {
    ctx.log('No Cancel button found — checking for a Back button');

    // Step 2: Try a generic Back navigation button
    const backVisible = await ctx.isVisible("//XCUIElementTypeButton[@name='Back']");
    if (backVisible) {
      ctx.log('Back button found — tapping it');
      await ctx.tap("//XCUIElementTypeButton[@name='Back']");
      await ctx.wait(500);
    } else {
      ctx.log('No Back button found — assuming already on home screen');
    }
  }

  // Step 3: Verify the Wallet home screen navigation bar is visible
  const homeVisible = await ctx.isVisible(
    "//XCUIElementTypeNavigationBar[@name='PKPassGroupsView']"
  );

  if (!homeVisible) {
    throw new Error(
      'Go Back To Wallet Home failed: the Wallet home screen navigation bar ' +
      '(PKPassGroupsView) is not visible after navigation. ' +
      'The app may be on an unexpected screen.'
    );
  }

  ctx.log('Verification passed — Wallet home screen is visible');
}
