const fs = require("fs");
const swcIndexPath = require.resolve("next/dist/build/swc/index.js");

const code = `
const _babel = require("next/dist/compiled/babel/core");

async function parse(src, options) {
  try {
    const isJsx = options && options.filename ? /\\.[jt]sx$/.test(options.filename) : true;
    const isTs = options && options.filename ? /\\.tsx?$/.test(options.filename) : true;
    const _swcWasm = require("@next/swc-wasm-nodejs");
    const astStr = _swcWasm.parseSync(src, {
      syntax: isTs ? "typescript" : "ecmascript",
      tsx: isJsx,
      jsx: isJsx,
      dynamicImport: true,
    });
    return typeof astStr === "string" ? JSON.parse(astStr) : astStr;
  } catch (err) {
    console.error("SWC parse error:", err);
    throw err;
  }
}

async function transform(src, options) {
  return transformSync(src, options);
}

function transformSync(src, options) {
  try {
    const filename = options && options.filename ? options.filename : "file.tsx";
    const isApiRoute = filename.includes("api") || filename.endsWith("route.ts") || filename.endsWith("route.js");
    
    const res = _babel.transformSync(src, {
      filename,
      presets: [
        [require("next/dist/build/babel/preset.js"), {
          "preset-env": {
            targets: { node: "current" },
            modules: false,
            exclude: ["transform-async-to-generator", "transform-regenerator"]
          },
          "preset-react": {
            runtime: "automatic"
          }
        }]
      ],
      sourceMaps: options && options.sourceMaps ? options.sourceMaps : false,
      configFile: false,
      babelrc: false,
    });
    return {
      code: res.code,
      map: res.map ? JSON.stringify(res.map) : undefined,
    };
  } catch (err) {
    console.error("Babel transform error for", options && options.filename, err);
    throw err;
  }
}
`;

let content = fs.readFileSync(swcIndexPath, "utf8");
content = content.replace(
  /const _babel = require\("next\/dist\/compiled\/babel\/core"\);[\s\S]*?^function _original_transformSync/m,
  `${code}\nfunction _original_transformSync`
);

fs.writeFileSync(swcIndexPath, content, "utf8");
console.log("Updated Next SWC Babel hook with native async functions!");
