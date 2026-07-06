import type { WalnutContext } from './walnut';
 
/** @walnut_method
 * name: Split Text and Store
 * description: Split $[input] by ${delimiter} at index ${index} and store in $[output]
 * actionType: custom_split_by_delimiter
 * context: shared
 * needsLocator: false
 * category: Data Processing
 */
export async function splitByDelimiter(ctx: WalnutContext) {
  // ctx.args[0] = "input"     (from $[input]     — runtime variable name holding the value to split)
  // ctx.args[1] = delimiter   (from ${delimiter} — character or substring to split by)
  // ctx.args[2] = index       (from ${index}     — zero-based position of the part to retrieve)
  // ctx.args[3] = "output"    (from $[output]    — runtime variable name to store the result)
 
  const inputVarName: string = ctx.args[0];
  const delimiter: string = ctx.args[1];
  const outputVarName: string = ctx.args[3];
 
  // --- Resolve the runtime variable value ---
  const rawValue: string = ctx.getVariable(inputVarName);
 
  if (rawValue === null || rawValue === undefined) {
    throw new Error(`Runtime variable $[${inputVarName}] is not set or has no value.`);
  }
 
  // Convert to string to handle both number and string inputs
  const input: string = String(rawValue);
 
  if (input.trim() === '') {
    ctx.warn(`Runtime variable $[${inputVarName}] is an empty string — result will also be empty.`);
  }
 
  // --- Validate delimiter ---
  if (!delimiter) {
    throw new Error('Delimiter is empty — provide a character or substring to split by.');
  }
 
  // --- Validate index ---
  const index: number = parseInt(ctx.args[2], 10);
  if (isNaN(index)) {
    throw new Error(`Invalid index "${ctx.args[2]}" — must be a whole number (e.g. 0, 1, 2).`);
  }
 
  // --- Validate outputVarName ---
  if (!outputVarName || outputVarName.trim() === '') {
    throw new Error('Output variable name is empty — provide a runtime variable name via $[output].');
  }
 
  // --- Perform the split ---
  const parts: string[] = input.split(delimiter);
 
  ctx.log(`Input     : "${input}"`);
  ctx.log(`Delimiter : "${delimiter}"`);
  ctx.log(`Parts     : [${parts.map(p => `"${p}"`).join(', ')}]`);
  ctx.log(`Index     : ${index}`);
 
  if (index < 0 || index >= parts.length) {
    throw new Error(
      `Index ${index} is out of range — split produced ${parts.length} part(s) ` +
      `(valid indices: 0–${parts.length - 1}).`
    );
  }
 
  const result: string = parts[index].trim();
 
  ctx.log(`Result    : "${result}"`);
 
  // --- Store result into runtime variable ---
  ctx.setVariable(outputVarName, result);
 
  ctx.log(`Stored "${result}" into runtime variable $[${outputVarName}].`);
}