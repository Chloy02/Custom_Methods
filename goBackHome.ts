/** @walnut_method
 * name: Go Back Home
 * description: Press the iOS home button to return to the device home screen
 * actionType: custom_go_back_home
 * context: ios
 * needsLocator: false
 * category: Navigation
 */
import { WalnutIosContext } from './walnut-methods/walnut.d';

export async function goBackHome(ctx: WalnutIosContext) {
  ctx.log('Pressing home button to return to the device home screen...');
  await ctx.home();
  ctx.log('Home button pressed — device home screen should now be visible');
}
