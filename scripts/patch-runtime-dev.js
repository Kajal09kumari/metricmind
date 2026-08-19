const fs = require("fs");

const files = [
  "node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js",
  "node_modules/next/dist/compiled/next-server/app-route-experimental.runtime.dev.js",
  "node_modules/next/dist/server/future/route-modules/app-route/module.js",
];

for (const p of files) {
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, "utf8");
    c = c.replace(
      "this.hasNonStaticMethods = hasNonStaticMethods(userland);",
      `if (this.userland && this.userland.default && typeof this.userland.default === "object") {
        Object.assign(this.userland, this.userland.default);
      }
      this.hasNonStaticMethods = hasNonStaticMethods(this.userland);`
    );
    fs.writeFileSync(p, c, "utf8");
    console.log("Patched:", p);
  }
}
