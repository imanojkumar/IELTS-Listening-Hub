/**
 * generate-registry.mjs — builds src/data/registry.json from every test JSON.
 *
 * Runs automatically before `dev` and `build`. Drop a new testNN.json into
 * src/data/tests and the homepage picks it up on the next build — no code
 * changes required. (The admin ZIP importer produces files in this shape.)
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TESTS_DIR = join(__dirname, "..", "src", "data", "tests");
const OUT = join(__dirname, "..", "src", "data", "registry.json");

const files = readdirSync(TESTS_DIR)
  .filter((f) => /^test\d+\.json$/i.test(f))
  .sort();

const summaries = [];
for (const f of files) {
  try {
    const t = JSON.parse(readFileSync(join(TESTS_DIR, f), "utf8"));
    summaries.push({
      id: t.id,
      slug: t.slug,
      title: t.title,
      type: t.type,
      totalQuestions: t.totalQuestions,
      durationSeconds: t.durationSeconds,
      sectionCount: Array.isArray(t.sections) ? t.sections.length : 0,
    });
  } catch (err) {
    console.warn(`  ! skipped ${f}: ${err.message}`);
  }
}

summaries.sort((a, b) => a.id - b.id);
writeFileSync(OUT, JSON.stringify(summaries, null, 2) + "\n");
console.log(`registry.json → ${summaries.length} test(s)`);
