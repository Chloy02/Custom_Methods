import type { WalnutContext } from './walnut';
 
/** @walnut_method
* name: Concatenate Values
* description: Concatenate ${values} and store in $[result]
* actionType: custom_concatenate_values
* context: shared
* needsLocator: false
* category: Data Processing
*/
export async function concatenateValues(ctx: WalnutContext) {
  // Agent passes ctx.args left-to-right from step_description placeholders:
  //   ${name}  → resolved test-data VALUE (e.g. "CUSTOMER S ")
  //   $[name]  → runtime variable NAME only (e.g. "Customer_id")
  //
  // TWO step styles:
  //
  // A) Legacy comma-list (2 args):
  //    "Concatenate ${values} and store in $[Cmd_Search_Cus]"
  //    values = "CUSTOMER S ,Customer_id"
  //
  // B) Multi-placeholder (3+ args):
  //    "Concatenate ${value1} $[Customer_id] and store in $[Cmd_Search_Cus]"
  //    args = ["CUSTOMER S ", "Customer_id", "Cmd_Search_Cus"]
  //    Last arg = output; earlier args = parts to join.
  //
  // Variable lookup rule: only call getVariable() when the token looks like a
  // variable name (identifier: letters/numbers/underscore, no spaces).
  // This prevents "CUSTOMER S " (literal from ${value1}) from matching a stale
  // runtime variable also named "CUSTOMER S".
 
  const allArgs: string[] = ((ctx as any).args ?? []).map((a: unknown) => String(a ?? ''));
 
  if (allArgs.length < 2) {
    throw new Error(
      'concatenateValues needs at least 2 arguments — one or more values plus $[outputVar] in the step description.'
    );
  }
 
  const resolvePart = (arg: string, label: string): string => {
    if (arg === null || arg === undefined) return '';
 
    const trimmed = arg.trim();
    const looksLikeVarName = /^[A-Za-z_][A-Za-z0-9_]*$/.test(trimmed);
 
    if (looksLikeVarName) {
      const fromVariable = ctx.getVariable(trimmed);
      if (fromVariable !== null && fromVariable !== undefined && String(fromVariable).trim() !== '') {
        const resolved = String(fromVariable);
        ctx.log(`  ${label} "${trimmed}" → resolved from variable = "${resolved}"`);
        return resolved;
      }
    }
 
    ctx.log(`  ${label} "${arg}" → used as literal`);
    return arg;
  };
 
  let outputVarName: string;
  let resolvedParts: string[];
 
  if (allArgs.length >= 3) {
    // Multi-placeholder: last arg = output, all before = parts
    outputVarName = allArgs[allArgs.length - 1]!.trim();
    const valueArgs = allArgs.slice(0, -1);
 
    if (!outputVarName) {
      throw new Error(
        'Output variable name is missing — the last placeholder must be $[result] (e.g. $[Cmd_Search_Cus]).'
      );
    }
 
    ctx.log(`Mode: multi-arg (${valueArgs.length} part(s) → $[${outputVarName}])`);
    resolvedParts = valueArgs.map((arg, i) => resolvePart(arg, `[${i + 1}]`));
  } else {
    // Legacy: Concatenate ${values} and store in $[result]
    const valuesRaw = allArgs[0]!;
    outputVarName = allArgs[1]!.trim();
 
    if (!outputVarName) {
      throw new Error(
        'Output variable name is missing — the second placeholder must be $[result].'
      );
    }
 
    if (!valuesRaw.trim()) {
      throw new Error(
        'No values provided — pass a comma-separated list via ${values} (e.g. "CUSTOMER S ,Customer_id").'
      );
    }
 
    ctx.log(`Mode: comma-list → $[${outputVarName}]`);
    ctx.log(`Raw input: "${valuesRaw}"`);
 
    const tokens = valuesRaw.split(',');
    ctx.log(`Token count: ${tokens.length}`);
 
    resolvedParts = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]!;
      if (token === null || token === undefined) continue;
      resolvedParts.push(resolvePart(token, `[${i + 1}]`));
    }
  }
 
  if (resolvedParts.length === 0) {
    ctx.warn(`All parts were empty — storing "" in $[${outputVarName}].`);
  }
 
  const concatenated = resolvedParts.join('');
 
  ctx.log(`Concatenated result: "${concatenated}"`);
  ctx.setVariable(outputVarName, concatenated);
  ctx.log(`Stored into runtime variable $[${outputVarName}].`);
}