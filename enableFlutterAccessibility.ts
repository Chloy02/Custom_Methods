/** @walnut_method
 * name: Enable Flutter Accessibility
 * description: Enable Flutter accessibility on the page and verify all create account fields are exposed
 * actionType: custom_enable_flutter_accessibility
 * context: web
 * needsLocator: false
 * category: Custom
 */
export async function enableFlutterAccessibility(ctx: any) {
  ctx.log('Starting Flutter accessibility enablement...');

  // Click the flt-semantics-placeholder button via JavaScript
  const clicked = await ctx.evaluate(`
    (function() {
      const placeholder = document.querySelector('flt-semantics-placeholder');
      if (!placeholder) {
        return { found: false, error: 'flt-semantics-placeholder not found' };
      }
      placeholder.click();
      return { found: true };
    })()
  `);

  if (!clicked || !clicked.found) {
    // Try alternative: look for any element with "Enable accessibility" text
    const altClicked = await ctx.evaluate(`
      (function() {
        // Try flt-semantics-placeholder
        const els = document.querySelectorAll('flt-semantics-placeholder');
        if (els.length > 0) {
          els[0].click();
          return { found: true, method: 'flt-semantics-placeholder querySelectorAll' };
        }
        // Try button with accessibility text
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
          if (btn.textContent && btn.textContent.toLowerCase().includes('accessibility')) {
            btn.click();
            return { found: true, method: 'button text match' };
          }
        }
        // Try any element with role button and accessibility label
        const roleButtons = document.querySelectorAll('[role="button"]');
        for (const rb of roleButtons) {
          const label = rb.getAttribute('aria-label') || '';
          if (label.toLowerCase().includes('accessibility')) {
            (rb as HTMLElement).click();
            return { found: true, method: 'role button aria-label' };
          }
        }
        return { found: false, error: 'No accessibility button found by any method' };
      })()
    `);

    if (!altClicked || !altClicked.found) {
      throw new Error(`Could not find or click the Flutter accessibility button. Details: ${JSON.stringify(altClicked)}`);
    }
    ctx.log(`Clicked accessibility button via: ${altClicked.method}`);
  } else {
    ctx.log('Clicked flt-semantics-placeholder successfully');
  }

  // Wait 2 seconds for Flutter to re-render the semantic accessibility layer
  await ctx.wait(2000);

  ctx.log('Waited 2 seconds for DOM re-render. Now verifying input fields...');

  // Count input fields now exposed in the accessibility tree
  const inputCount = await ctx.evaluate(`
    (function() {
      // Count various types of input elements that Flutter accessibility exposes
      const inputs = document.querySelectorAll('input');
      const textareas = document.querySelectorAll('textarea');
      // Flutter semantic inputs often appear as input elements after accessibility is enabled
      const fltInputs = document.querySelectorAll('flt-semantics input');
      const ariaInputs = document.querySelectorAll('[role="textbox"]');
      
      return {
        inputs: inputs.length,
        textareas: textareas.length,
        fltInputs: fltInputs.length,
        ariaInputs: ariaInputs.length,
        total: inputs.length + textareas.length
      };
    })()
  `);

  ctx.log(`Input field counts after accessibility enabled: ${JSON.stringify(inputCount)}`);

  // Determine the best count to use
  let effectiveCount = inputCount.total;
  
  // If standard inputs are low, check aria textboxes
  if (effectiveCount < 4 && inputCount.ariaInputs >= 4) {
    effectiveCount = inputCount.ariaInputs;
  }

  // Also check flt-semantics inputs specifically
  if (effectiveCount < 4) {
    const fltCount = await ctx.evaluate(`
      (function() {
        const allInputs = new Set();
        
        // All input elements
        document.querySelectorAll('input').forEach(el => allInputs.add(el));
        
        // All role=textbox
        document.querySelectorAll('[role="textbox"]').forEach(el => allInputs.add(el));
        
        // flt-semantics with input-like attributes
        document.querySelectorAll('flt-semantics[aria-label]').forEach(el => {
          const label = el.getAttribute('aria-label') || '';
          const role = el.getAttribute('role') || '';
          if (role === 'textbox' || label.toLowerCase().includes('name') || 
              label.toLowerCase().includes('email') || label.toLowerCase().includes('password')) {
            allInputs.add(el);
          }
        });
        
        return allInputs.size;
      })()
    `);
    
    ctx.log(`Extended flt-semantics input count: ${fltCount}`);
    if (fltCount > effectiveCount) {
      effectiveCount = fltCount;
    }
  }

  if (effectiveCount < 4) {
    // One more attempt: count all flt-semantics elements that look like form fields
    const semanticsCount = await ctx.evaluate(`
      (function() {
        const candidates = document.querySelectorAll('flt-semantics');
        let count = 0;
        const labels = [];
        candidates.forEach(el => {
          const role = el.getAttribute('role') || '';
          const label = el.getAttribute('aria-label') || '';
          if (role === 'textbox' || role === 'input') {
            count++;
            labels.push(label);
          }
        });
        return { count, labels };
      })()
    `);
    
    ctx.log(`flt-semantics textbox count: ${JSON.stringify(semanticsCount)}`);
    if (semanticsCount.count > effectiveCount) {
      effectiveCount = semanticsCount.count;
    }
  }

  if (effectiveCount < 4) {
    throw new Error(
      `Flutter accessibility was enabled but only ${effectiveCount} input field(s) were found. ` +
      `Expected at least 4 (name, email, password, confirm password). ` +
      `Raw counts: inputs=${inputCount.inputs}, textareas=${inputCount.textareas}, ` +
      `ariaInputs=${inputCount.ariaInputs}, fltInputs=${inputCount.fltInputs}. ` +
      `The accessibility layer may not have fully initialized.`
    );
  }

  ctx.log(`Verification passed: ${effectiveCount} input fields are accessible after enabling Flutter accessibility.`);
}