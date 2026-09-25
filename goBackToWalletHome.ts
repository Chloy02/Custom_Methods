/** @walnut_method
 * name: Go Back To Wallet Home
 * description: Dismiss any open search or sub-screen and return to the Wallet home screen
 * actionType: custom_go_back_to_wallet_home
 * context: ios
 * needsLocator: false
 * category: Navigation
 */
// The screen this method exists to reach. Declared once so the wait below and the verification at
// the end can never drift apart.
const HOME_NAV_BAR = "//XCUIElementTypeNavigationBar[@name='PKPassGroupsView']";

export async function goBackToWalletHome(ctx: any) {
  ctx.log('Attempting to return to Wallet home screen...');

  // Step 1: Dismiss the search screen if the close button is visible.
  // Check both @label and @name to stay resilient against minor iOS/Wallet version drift.
  const CLOSE_BTN = "//XCUIElementTypeButton[@label='close' or @name='close']";
  const cancelVisible = await ctx.isVisible(CLOSE_BTN);

  if (cancelVisible) {
    ctx.log('Search screen is open — tapping close button to dismiss it');
    await ctx.tap(CLOSE_BTN);
    // `ctx.wait` is not a walnut API — there is no sleep on any context, only
    // `ctx.waitFor(xpath, timeoutMs?)`. Waiting for the DESTINATION is better than a fixed pause
    // anyway: it returns as soon as the screen is there and never races on a slow device. A timeout
    // is swallowed so the explicit check at the end reports it with the clearer message.
    await ctx.waitFor(HOME_NAV_BAR, 5000).catch(() => {});
  } else {
    ctx.log('No Cancel button found — checking for a Back button');

    // Step 2: Try a generic Back navigation button
    const backVisible = await ctx.isVisible("//XCUIElementTypeButton[@name='Back']");
    if (backVisible) {
      ctx.log('Back button found — tapping it');
      await ctx.tap("//XCUIElementTypeButton[@name='Back']");
      await ctx.waitFor(HOME_NAV_BAR, 5000).catch(() => {});
    } else {
      ctx.log('No Back button found — assuming already on home screen');
    }
  }

  // Step 3: Verify the Wallet home screen navigation bar is visible
  const homeVisible = await ctx.isVisible(HOME_NAV_BAR);

  if (!homeVisible) {
    throw new Error(
      'Go Back To Wallet Home failed: the Wallet home screen navigation bar ' +
      '(PKPassGroupsView) is not visible after navigation. ' +
      'The app may be on an unexpected screen.'
    );
  }

  ctx.log('Verification passed — Wallet home screen is visible');
}
