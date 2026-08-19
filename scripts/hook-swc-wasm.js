const fs = require("fs");
const p = require.resolve("next/dist/build/swc/index.js");

const code = `
const wasmBindings = require("@next/swc-wasm-nodejs");

async function loadBindings() {
  return wasmBindings;
}

function loadBindingsSync() {
  return wasmBindings;
}

module.exports = {
  ...wasmBindings,
  loadBindings,
  loadBindingsSync,
  initWasm: async () => {},
  isWasm: () => true,
  transform: wasmBindings.transform,
  transformSync: wasmBindings.transformSync,
  parse: wasmBindings.parse,
  parseSync: wasmBindings.parseSync,
};
`;

fs.writeFileSync(p, code, "utf8");
console.log("Next SWC cleanly linked to @next/swc-wasm-nodejs 14.2.15!");
