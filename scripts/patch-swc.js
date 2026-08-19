const fs = require("fs");
const swcIndexPath = require.resolve("next/dist/build/swc/index.js");
let content = fs.readFileSync(swcIndexPath, "utf8");

content = content.replace(
  "function loadNative(importPath) {",
  "function loadNative(importPath) {\n    return require('@next/swc-wasm-nodejs');"
);

fs.writeFileSync(swcIndexPath, content, "utf8");
console.log("loadNative successfully patched to return @next/swc-wasm-nodejs directly!");
