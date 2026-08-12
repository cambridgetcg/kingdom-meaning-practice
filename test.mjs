import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const CASE_SHA256 = "652a04699aadc6143d9136dc8d515fd3b4fa8774d963d885e79968156b1cb8ad";
const SVG_SHA256 = "a2a0ae7d599d733dffc5b89502a10983c483a9ac174a952581fbea372179f1d1";
const FIRST_COMMIT = "805543deb5725e4cc2cc5e7d18c0e30c2360184e";
const CASTLE_ROOM_COMMIT = "10d243bb9d30506c893530f03977e8c733f8b42c";
const LINEAGE_SHA256 = "467ed92c8fd340bd6337dc75c14d85f44e13d2de935dc9671a17a422d8866da0";
const LINEAGE_SVG_SHA256 = "648721f04417cfc2903cb1901442294151798c3da977eb7a0a6ae9718e6e5325";
const LINEAGE_FIRST_COMMIT = "35773a6d19ebf263c3ed85ba1c33c359615e4273";

function bytes(path) {
  return readFileSync(new URL(path, import.meta.url));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

test("reviewed case and visual bytes stay exact", () => {
  assert.equal(sha256(bytes("./public/case.json")), CASE_SHA256);
  assert.equal(sha256(bytes("./public/ritonavir-polymorph.svg")), SVG_SHA256);
  assert.doesNotThrow(() => JSON.parse(bytes("./public/case.json")));
});

test("reviewed folding-feedback lineage and visual bytes stay exact", () => {
  assert.equal(
    sha256(bytes("./public/lineage/folding-feedback/lineage.json")),
    LINEAGE_SHA256,
  );
  assert.equal(
    sha256(bytes("./public/lineage/folding-feedback/folding-feedback.svg")),
    LINEAGE_SVG_SHA256,
  );
  const lineage = JSON.parse(bytes("./public/lineage/folding-feedback/lineage.json"));
  assert.equal(lineage.scope.relationship, "analogy");
  assert.equal(lineage.scope.mechanismTransferred, false);
  assert.equal(lineage.sourceBindings.ritonavirCase.sha256, `sha256:${CASE_SHA256}`);
  assert.equal(lineage.sourceBindings.ritonavirCase.bytesCheckedAtRuntime, true);
  assert.ok(lineage.comparisonEdges.every((edge) => (
    edge.relationship === "analogy" && edge.mechanismTransferred === false
  )));
  assert.ok(Object.values(lineage.effects).every((effect) => effect === false));
});

test("human page is inert, bounded, and points to the immutable record", () => {
  const html = bytes("./index.html").toString("utf8");
  assert.match(html, new RegExp(FIRST_COMMIT));
  assert.match(html, new RegExp(CASTLE_ROOM_COMMIT));
  assert.match(html, new RegExp(CASE_SHA256));
  assert.match(html, /not medical advice/i);
  assert.match(html, /rel="canonical" href="https:\/\/cambridgetcg\.github\.io\/kingdom-meaning-practice\/"/);
  assert.match(html, /manufacturing recipe/i);
  assert.match(html, /No crystal mechanism is transferred/i);
  assert.match(html, /first historical nucleus remains unsettled/i);
  assert.match(html, /Form I again/i);
  assert.doesNotMatch(html, /<script\b|<form\b|fetch\s*\(|setInterval\s*\(|setTimeout\s*\(/i);
});

test("case preserves evidence and action boundaries", () => {
  const value = JSON.parse(bytes("./public/case.json"));
  assert.equal(value.practiceBoundary.relationship, "analogy");
  assert.equal(value.practiceBoundary.mechanismTransferred, false);
  assert.equal(value.effects.networkRequests, false);
  assert.equal(value.effects.persistentWritesRequested, false);
  assert.equal(value.effects.medicalAction, false);
  assert.equal(value.effects.manufacturingAction, false);
  assert.ok(value.claimsNotMade.includes("medical-advice"));
  assert.ok(value.claimsNotMade.includes("manufacturing-recipe"));
  assert.equal(value.unknowns.find((item) => item.id === "historical-first-nucleus").resolution, "unknown");
});

test("folding-feedback page is inert, bounded, and points to its immutable record", () => {
  const html = bytes("./public/lineage/folding-feedback/index.html").toString("utf8");
  assert.match(html, new RegExp(LINEAGE_FIRST_COMMIT));
  assert.match(html, new RegExp(LINEAGE_SHA256));
  assert.match(html, /rel="canonical" href="https:\/\/cambridgetcg\.github\.io\/kingdom-meaning-practice\/lineage\/folding-feedback\/"/);
  assert.match(html, /rel="stylesheet" href="\.\.\/\.\.\/style\.css"/);
  assert.match(html, /Same shape, different mechanism/);
  assert.match(html, /No home or do-it-yourself prion work/);
  assert.match(html, /not medical advice/i);
  assert.match(html, /A seeded fibril is not automatically a prion/);
  assert.match(html, /Model compatibility is not mechanism identification/);
  assert.match(html, /KARMA is not thermodynamics/);
  assert.match(html, /no being is a basin/i);
  assert.doesNotMatch(html, /<script\b|<form\b|fetch\s*\(|setInterval\s*\(|setTimeout\s*\(/i);
});

test("folding-feedback record keeps domains, inference, unknown, and safety separate", () => {
  const value = JSON.parse(bytes("./public/lineage/folding-feedback/lineage.json"));
  assert.deepEqual(value.domains.map((domain) => domain.id), [
    "crystal-polymorphism",
    "protein-folding",
    "amyloid-polymorphism",
    "prion-propagation",
    "kingdom-return",
  ]);
  assert.match(value.summary, /Ordinary folding does not require nucleation or positive feedback/);
  assert.equal(
    value.equations.find((item) => item.id === "primary-nucleation").domain,
    "amyloid-assembly-model",
  );
  assert.match(
    value.claims.find((item) => item.id === "curve-shape-does-not-identify-mechanism").plain,
    /more than one microscopic reaction network/,
  );
  assert.ok(value.unknowns.every((item) => (
    ["checked", "not-checked", "out-of-scope"].includes(item.coverage)
    && ["shown", "withheld"].includes(item.disclosure)
  )));
  assert.equal(
    value.unknowns.find((item) => item.id === "design-intention").resolution,
    null,
  );
  assert.ok(value.claimsNotMade.includes("prion-amplification-protocol"));
  assert.ok(value.claimsNotMade.includes("karma-is-molecular-force"));
  assert.match(value.scope.biosafety, /institutional risk assessment/);
});

test("rights and discovery stay explicit", () => {
  const rights = bytes("./RIGHTS.md").toString("utf8");
  const provenance = bytes("./PROVENANCE.md").toString("utf8");
  const corrections = bytes("./CORRECTIONS.md").toString("utf8");
  const robots = bytes("./public/robots.txt").toString("utf8");
  const sitemap = bytes("./public/sitemap.xml").toString("utf8");
  const llms = bytes("./public/llms.txt").toString("utf8");
  assert.match(rights, /No reuse licence is granted/);
  assert.match(rights, /full texts are not copied/);
  assert.match(rights, /PROVENANCE\.md/);
  assert.match(provenance, /Prepared by: Codex at Yu's direction/);
  assert.match(provenance, new RegExp(CASE_SHA256));
  assert.match(provenance, new RegExp(SVG_SHA256));
  assert.match(provenance, /no third-party article text, figure, or dataset is bundled/i);
  assert.match(provenance, /CORRECTIONS\.md/);
  assert.match(corrections, /public-full-text-reuse-rights-not-asserted/);
  assert.match(corrections, /CC-BY-4\.0/);
  assert.match(corrections, new RegExp(CASE_SHA256));
  assert.match(corrections, /Metadata only/);
  assert.match(corrections, /does not\s+license or relicense the Ritonavir case/i);
  assert.match(robots, /Sitemap:/);
  assert.match(sitemap, /case\.json/);
  assert.match(sitemap, /corrections\.txt/);
  assert.match(sitemap, /lineage\/folding-feedback/);
  assert.match(llms, /no automatic action/i);
  assert.match(llms, /corrections\.txt/);
  assert.match(llms, new RegExp(LINEAGE_FIRST_COMMIT));
  assert.match(llms, /mechanism transferred/i);
});
