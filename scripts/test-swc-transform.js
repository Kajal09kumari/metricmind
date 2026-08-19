const swc = require("@next/swc-wasm-nodejs");

const code = `
export default function Page() {
  return <div>Hello Semantic BI</div>;
}
`;

try {
  const out = swc.transformSync(code, {
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: true,
      },
      transform: {
        react: {
          runtime: "automatic",
        },
      },
    },
    module: {
      type: "es6",
    },
  });
  console.log("Transformed successfully:", out.code.slice(0, 80));
} catch (e) {
  console.error("Transform error:", e);
}
