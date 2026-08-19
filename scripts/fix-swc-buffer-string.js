const fs = require("fs");
const p = require.resolve("next/dist/build/swc/index.js");

const code = `
const wasmBindings = require("@next/swc-wasm-nodejs");

function ensureString(src) {
  if (Buffer.isBuffer(src)) return src.toString("utf8");
  if (src instanceof Uint8Array) return Buffer.from(src).toString("utf8");
  if (typeof src === "string") return src;
  return String(src);
}

async function loadBindings() {
  return module.exports;
}

function loadBindingsSync() {
  return module.exports;
}

function transformSync(src, options) {
  return wasmBindings.transformSync(ensureString(src), options);
}

async function transform(src, options) {
  return wasmBindings.transform(ensureString(src), options);
}

function parseSync(src, options) {
  return wasmBindings.parseSync(ensureString(src), options);
}

async function parse(src, options) {
  return wasmBindings.parse(ensureString(src), options);
}

module.exports = {
  ...wasmBindings,
  loadBindings,
  loadBindingsSync,
  initWasm: async () => {},
  isWasm: () => true,
  transform,
  transformSync,
  parse,
  parseSync,
};
`;

fs.writeFileSync(p, code, "utf8");
console.log("Next SWC WASM successfully patched with Buffer-to-String normalization!");
