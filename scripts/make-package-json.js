const pkg = require("../package.json");
const fs = require("fs");

/**
 * @type {Array<keyof typeof pkg['dependencies']>}
 */
const dependencieNames = [
  "@baranwang/pinyin",
  "electron-log",
  "electron-updater",
];

const dependencies = Object.fromEntries(
  Object.entries(pkg.dependencies).filter(([name]) =>
    dependencieNames.includes(name)
  )
);

(() => {
  /**
   * @type {typeof pkg}
   */
  const json = {
    ...pkg,
    main: "main/dist/index.cjs",
    scripts: {},
    devDependencies: {},
    dependencies,
  };
  fs.writeFileSync("./app/package.json", JSON.stringify(json), "utf-8");
})();
