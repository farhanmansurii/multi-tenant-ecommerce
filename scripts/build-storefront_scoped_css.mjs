import fs from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";

const repoRoot = process.cwd();
const inputRoot = path.join(repoRoot, "src", "components", "storefront-ui");
const outputFile = path.join(
  repoRoot,
  "src",
  "app",
  "stores",
  "[slug]",
  "storefront.scoped.css"
);

const isCssFile = (p) => p.toLowerCase().endsWith(".css");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...(await walk(full)));
    else if (ent.isFile() && isCssFile(ent.name)) out.push(full);
  }
  return out;
}

function scopeSelector(sel) {
  const trimmed = sel.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith(".storefront-scope")) return trimmed;

  // Special cases that are otherwise truly global.
  if (trimmed === ":root") return ".storefront-scope";
  if (trimmed === "body") return ".storefront-scope";
  if (trimmed.startsWith("body ")) return `.storefront-scope ${trimmed.slice(5)}`;
  if (trimmed.startsWith("body.")) return `.storefront-scope${trimmed.slice(4)}`;

  return `.storefront-scope ${trimmed}`;
}

async function main() {
  const cssFiles = (await walk(inputRoot))
    .filter((p) => !p.endsWith("storefront.scoped.css"))
    .sort();

  const chunks = [];
  for (const file of cssFiles) {
    const rel = path.relative(repoRoot, file);
    const raw = await fs.readFile(file, "utf8");
    chunks.push(`/* ${rel} */\n${raw}\n`);
  }

  const combined = chunks.join("\n");
  const root = postcss.parse(combined);

  root.walkRules((rule) => {
    // Don't try to scope keyframe steps like `0% {}`.
    const parent = rule.parent;
    if (parent?.type === "atrule" && parent.name?.toLowerCase().includes("keyframes")) {
      return;
    }

    const selectors = (rule.selector || "")
      .split(",")
      .map(scopeSelector)
      .join(", ");

    rule.selector = selectors;
  });

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, root.toString(), "utf8");
  process.stdout.write(`Wrote ${path.relative(repoRoot, outputFile)}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
