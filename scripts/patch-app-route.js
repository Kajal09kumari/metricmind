const fs = require("fs");
const p = require.resolve("next/dist/server/future/route-modules/app-route/module.js");
let c = fs.readFileSync(p, "utf8");

c = c.replace(
  "this.hasNonStaticMethods = hasNonStaticMethods(userland);",
  `if (this.userland && this.userland.default && typeof this.userland.default === "object") {
    Object.assign(this.userland, this.userland.default);
  }
  this.hasNonStaticMethods = hasNonStaticMethods(this.userland);`
);

fs.writeFileSync(p, c, "utf8");
console.log("AppRoute module patched to unpack default exports if wrapped!");
