const babel = require("@babel/core");

const code = `
import { NextResponse } from "next/server";
import { semanticRegistry } from "@/lib/semantic/registry";

export async function GET(req: any) {
  const metrics = semanticRegistry.listMetrics();
  return NextResponse.json({ metrics });
}
`;

try {
  const res = babel.transformSync(code, {
    filename: "app/api/semantic/route.ts",
    presets: [
      [require("@babel/preset-env"), { targets: { node: "current" } }],
      [require("@babel/preset-react"), { runtime: "automatic" }],
      [require("@babel/preset-typescript"), { isTSX: true, allExtensions: true }],
    ],
  });
  console.log("Babel transformed successfully:\n", res.code.slice(0, 150));
} catch (e) {
  console.error("Babel error:", e);
}
