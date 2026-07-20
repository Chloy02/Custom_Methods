import type { WalnutContext } from './walnut';
 
/** @walnut_method
 * name: Assert Equal
 * description: Assert ${param1} equals ${param2}
 * actionType: custom_assert_equal
 * context: shared
 * needsLocator: false
 * category: Data Processing
 */
export async function assertEqual(ctx: WalnutContext) {
  // ctx.args[0] = param1  (from ${param1} — auto-detects runtime variable or raw value)
  // ctx.args[1] = param2  (from ${param2} — auto-detects runtime variable or raw value)
 
  const param1Raw: string = ctx.args[0];
  const param2Raw: string = ctx.args[1];
 
  // --- Smart resolve: try runtime variable first, fall back to raw value ---
  function resolve(raw: string, label: string): string {
    if (raw === null || raw === undefined || raw.trim() === '') {
      throw new Error(`${label} is empty or not provided.`);
    }
    const fromRuntime = ctx.getVariable(raw);
    if (fromRuntime !== null && fromRuntime !== undefined && String(fromRuntime).trim() !== '') {
      ctx.log(`${label}: resolved from runtime variable $[${raw}] = "${fromRuntime}"`);
      return String(fromRuntime).trim();
    }
    ctx.log(`${label}: using raw value "${raw}"`);
    return String(raw).trim();
  }
 
  const param1: string = resolve(param1Raw, 'param1');
  const param2: string = resolve(param2Raw, 'param2');
 
  ctx.log(`param1 : "${param1}"`);
  ctx.log(`param2 : "${param2}"`);
 
  // --- Assert equality ---
  if (param1 === param2) {
    ctx.log(`PASS: "${param1}" equals "${param2}" — assertion passed.`);
  } else {
    const failMessage = `FAIL: Expected "${param1}" to equal "${param2}" — assertion failed.`;
    ctx.warn(failMessage);
    throw new Error(failMessage);
  }
}
 