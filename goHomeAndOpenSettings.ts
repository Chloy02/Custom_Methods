/** @walnut_method
 * name: Go Home And Open Settings
 * description: Press the iOS home button to return to the home screen, then launch the Settings app
 * actionType: custom_go_home_and_open_settings
 * context: ios
 * needsLocator: false
 * category: Navigation
 */
import { WalnutIosContext } from './walnut-methods/walnut.d';

export async function goHomeAndOpenSettings(ctx: WalnutIosContext) {
  // Step 1: Go to the device home screen
  ctx.log('Pressing home button to navigate back to the device home screen...');
  await ctx.home();
  ctx.log('Home screen reached');

  // Step 2: Launch Settings app
  ctx.log('Launching Settings app (com.apple.Preferences)...');
  await ctx.launchApp('com.apple.Preferences');

  // Step 3: Wait for the Settings root table to confirm the app is open
  const SETTINGS_ROOT = "//XCUIElementTypeTable[@name='Settings']";
  await ctx.waitFor(SETTINGS_ROOT, 8000).catch(() => {});

  const settingsVisible = await ctx.isVisible(SETTINGS_ROOT);
  if (!settingsVisible) {
    throw new Error(
      'Go Home And Open Settings failed: Settings app root table is not visible after launch. ' +
      'The app may not have opened correctly.'
    );
  }

  ctx.log('Settings app is open and verified');
}
