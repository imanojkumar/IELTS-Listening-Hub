import type { ListeningTest, TestSummary } from "@/lib/types";
import registry from "@/data/registry.json";

// Static imports so every test resolves at build time for static export.
// The homepage reads lightweight cards from registry.json; full payloads
// below are only pulled into the per-test route bundles.
import test01 from "@/data/tests/test01.json";
import test02 from "@/data/tests/test02.json";
import test03 from "@/data/tests/test03.json";
import test04 from "@/data/tests/test04.json";
import test05 from "@/data/tests/test05.json";
import test06 from "@/data/tests/test06.json";
import test07 from "@/data/tests/test07.json";
import test08 from "@/data/tests/test08.json";
import test09 from "@/data/tests/test09.json";
import test10 from "@/data/tests/test10.json";

const ALL = [
  test01, test02, test03, test04, test05,
  test06, test07, test08, test09, test10,
] as unknown as ListeningTest[];

const BY_ID = new Map<number, ListeningTest>(ALL.map((t) => [t.id, t]));

export function getTestSummaries(): TestSummary[] {
  return (registry as TestSummary[]).slice().sort((a, b) => a.id - b.id);
}

export function getAllTestIds(): number[] {
  return ALL.map((t) => t.id).sort((a, b) => a - b);
}

export function getTestById(id: number): ListeningTest | undefined {
  return BY_ID.get(id);
}
