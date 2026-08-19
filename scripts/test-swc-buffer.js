const swc = require("@next/swc-wasm-nodejs");

const buf = Buffer.from("export default function Page() { return 1; }");
try {
  // Pass buffer:
  console.log("Testing with Buffer...");
  try {
    swc.transformSync(buf, {});
  } catch (e) {
    console.log("Buffer failed as expected:", e.message);
  }

  // Pass string:
  console.log("Testing with string...");
  const res = swc.transformSync(buf.toString("utf8"), {
    jsc: {
      parser: { syntax: "ecmascript" },
    },
  });
  console.log("String succeeded! Output:", res.code.slice(0, 50));
} catch (e) {
  console.error("Error:", e);
}
