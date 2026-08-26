import type { WalnutContext, WalnutWebContext } from './walnut';

/** @walnut_method
 * name: Upload Files To Input
 * description: Upload ${filePaths} to the linked object (one path, or several comma-separated paths)
 * actionType: custom_upload_files
 * context: web
 * needsLocator: true
 * category: Interaction
 */
export async function uploadFilesToInput(ctx: WalnutContext) {
  if (ctx.platform !== 'web') return;

  const locator = (ctx as any).locator;
  if (!locator) {
    throw new Error('No object linked to this step — attach an object in the test case editor');
  }

  // ctx.args[0] = ${filePaths} — one path or several comma-separated paths
  const rawPaths = String(ctx.args[0] ?? '').trim();
  if (!rawPaths) {
    throw new Error("filePaths is empty — set the filePaths column in this test case's test data.");
  }

  const paths = rawPaths.split(',').map(p => p.trim()).filter(Boolean);
  if (paths.length === 0) throw new Error(`No usable file path in "${rawPaths}".`);
  ctx.log(`Uploading ${paths.length} file(s): ${paths.join(', ')}`);

  const target = locator.first();

  await waitForTarget(ctx, target);

  const handle = await target.elementHandle();
  if (!handle) throw new Error('Could not get element handle from the linked object.');

  // Resolve the actual <input type="file"> — either the element itself, its label target, or a descendant.
  // Built with new Function so the bundler cannot inject helpers that would ReferenceError in the browser.
  const inputHandle = await handle.evaluateHandle(
    new Function('el', `
      var isFile = function (n) { return !!n && n.tagName === 'INPUT' && n.type === 'file'; };
      if (isFile(el)) return el;
      if (el.tagName === 'LABEL' && el.htmlFor) {
        var t = document.getElementById(el.htmlFor);
        if (isFile(t)) return t;
      }
      var inside = el.querySelector && el.querySelector('input[type="file"]');
      return inside || null;
    `) as any,
  );
  const input = inputHandle.asElement();

  if (input) {
    await uploadViaInput(ctx, input, handle, paths);
  } else {
    await handle.dispose();
    await uploadViaFileChooser(ctx, target, paths);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function waitForTarget(ctx: WalnutWebContext, target: any) {
  try {
    await target.waitFor({ state: 'attached', timeout: 15000 });
  } catch {
    const total = await ctx.page.locator('input[type="file"]').count();
    throw new Error(
      `The linked object was not found after 15s. `
      + `This page has ${total} file input(s) — check the linked object, or that the uploader is on screen by now.`,
    );
  }
}

async function uploadViaInput(ctx: WalnutWebContext, input: any, handle: any, paths: string[]) {
  const isMultiple = await input.evaluate((el: any) => !!el.multiple);
  if (paths.length > 1 && !isMultiple) {
    throw new Error(`${paths.length} files given, but the linked object is a single-file input (no "multiple" attribute).`);
  }

  // Sets the input's FileList directly — no OS dialog opens.
  await input.setInputFiles(paths);

  const attached = await input.evaluate((el: any) => Array.from(el.files).map((f: any) => f.name));
  await input.dispose();
  await handle.dispose();

  if (attached.length === 0) {
    throw new Error('setInputFiles ran but the input holds no files — the page may have cleared it.');
  }
  ctx.log(`Attached to the input: ${attached.join(', ')}`);
}

async function uploadViaFileChooser(ctx: WalnutWebContext, target: any, paths: string[]) {
  // No file input in the DOM — arm the file chooser first, then click.
  // Playwright intercepts the dialog so the real OS picker never appears.
  ctx.warn('The linked object is not a file input and has none associated — clicking it and intercepting the file chooser instead.');

  const [chooser] = await Promise.all([
    ctx.page.waitForEvent('filechooser', { timeout: 15000 }),
    target.click(),
  ]);

  if (paths.length > 1 && !chooser.isMultiple()) {
    throw new Error(`${paths.length} files given, but the page's file chooser accepts only one.`);
  }

  await chooser.setFiles(paths);
  ctx.log(`Set ${paths.length} file(s) via the intercepted file chooser.`);
}
