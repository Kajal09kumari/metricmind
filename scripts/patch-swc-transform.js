const fs = require("fs");
const swcIndexPath = require.resolve("next/dist/build/swc/index.js");
let content = fs.readFileSync(swcIndexPath, "utf8");

const cleanTransformCode = `
const _swcWasm = require("@next/swc-wasm-nodejs");

function sanitizeSwcOptions(options) {
  if (!options) return undefined;
  try {
    const isTs = options.filename ? /\\.tsx?$/.test(options.filename) : true;
    const isJsx = options.filename ? /\\.[jt]sx$/.test(options.filename) : true;
    
    return {
      filename: options.filename,
      sourceMaps: options.sourceMaps,
      jsc: {
        parser: isTs
          ? { syntax: "typescript", tsx: isJsx, dynamicImport: true }
          : { syntax: "ecmascript", jsx: isJsx, dynamicImport: true },
        transform: {
          react: {
            runtime: "automatic",
            development: Boolean(options.development),
          },
        },
        target: "es2022",
      },
      module: {
        type: "es6",
      },
    };
  } catch (e) {
    return options;
  }
}

async function transform(src, options) {
  try {
    let bindings = await loadBindings();
    return await bindings.transform(src, options);
  } catch (err) {
    if (String(err).includes("untagged enum Config") || String(err).includes("SWC")) {
      const cleanOpts = sanitizeSwcOptions(options);
      return await _swcWasm.transform(src, cleanOpts);
    }
    throw err;
  }
}

function transformSync(src, options) {
  try {
    let bindings = loadBindingsSync();
    return bindings.transformSync(src, options);
  } catch (err) {
    if (String(err).includes("untagged enum Config") || String(err).includes("SWC")) {
      const cleanOpts = sanitizeSwcOptions(options);
      return _swcWasm.transformSync(src, cleanOpts);
    }
    throw err;
  }
}
`;

// Replace transform and transformSync functions in swc/index.js
content = content.replace(
  /async function transform\(src, options\) \{[\s\S]*?^function transformSync/m,
  `${cleanTransformCode}\nfunction _original_transformSync`
);

fs.writeFileSync(swcIndexPath, content, "utf8");
console.log("Next SWC transform/transformSync successfully patched with resilient fallback!");
