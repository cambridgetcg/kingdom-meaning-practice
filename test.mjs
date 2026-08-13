import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const CASE_SHA256 = "652a04699aadc6143d9136dc8d515fd3b4fa8774d963d885e79968156b1cb8ad";
const SVG_SHA256 = "a2a0ae7d599d733dffc5b89502a10983c483a9ac174a952581fbea372179f1d1";
const FIRST_COMMIT = "805543deb5725e4cc2cc5e7d18c0e30c2360184e";
const CASTLE_ROOM_COMMIT = "10d243bb9d30506c893530f03977e8c733f8b42c";
const LINEAGE_SHA256 = "c07c2c9d02c2a3163ac595c339c770450900ad9397a8e42b578f269c65599f4b";
const LINEAGE_SVG_SHA256 = "4222f32d3791da5376d859f895762f21a336d79edec379f49a9f09bd80b66eee";
const LINEAGE_RECEIPT_COMMIT = "6d7c2e2c66bbfe67351f12355131c877c15f1362";
const LINEAGE_FIRST_COMMIT = "35773a6d19ebf263c3ed85ba1c33c359615e4273";
const SOCIAL_LINEAGE_SHA256 = "bb7201ee6fbad9e192f46932a632157f0d661387b5585b0540172c6ee00c7455";
const SOCIAL_SVG_SHA256 = "3c77b6ba41f7931c75b42122ee205c990a7533553d5ff306612d1f9dbfc9f13a";
const SOCIAL_RECEIPT_COMMIT = "48d1d046ea781db406c95a2b70c79df44466e5c0";

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
  assert.equal(lineage.practiceBoundary.activeMeaningJob, "check-meaning");
  assert.deepEqual(lineage.practiceBoundary.jobsNotOpened, [
    "record-choice",
    "do-one-bounded-action",
    "report-what-happened",
  ]);
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
  assert.match(html, new RegExp(LINEAGE_RECEIPT_COMMIT));
  assert.match(html, new RegExp(LINEAGE_SHA256));
  assert.match(html, /rel="canonical" href="https:\/\/cambridgetcg\.github\.io\/kingdom-meaning-practice\/lineage\/folding-feedback\/"/);
  assert.match(html, /rel="stylesheet" href="\.\.\/\.\.\/style\.css"/);
  assert.match(html, /Same shape, different mechanism/);
  assert.match(html, /No home or do-it-yourself prion work/);
  assert.match(html, /not medical advice/i);
  assert.match(html, /A seeded fibril is not automatically a prion/);
  assert.match(html, /Model compatibility is not mechanism identification/);
  assert.match(html, /KARMA is not thermodynamics/);
  assert.match(html, /observed, reported, or inferred effect/);
  assert.match(html, /opens only <code>check-meaning<\/code>/);
  assert.match(html, /records no current choice, performs no deed/);
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

test("memes and brainrot lineage bytes stay exact and the social path stays contingent", () => {
  assert.equal(
    sha256(bytes("./public/lineage/memes-brainrot-identity/lineage.json")),
    SOCIAL_LINEAGE_SHA256,
  );
  assert.equal(
    sha256(bytes("./public/lineage/memes-brainrot-identity/memes-brainrot-identity.svg")),
    SOCIAL_SVG_SHA256,
  );
  const value = JSON.parse(bytes("./public/lineage/memes-brainrot-identity/lineage.json"));
  assert.equal(value.schema, "kingdom.meaning-social-lineage/0.1");
  assert.equal(value.practiceBoundary.activeMeaningJob, "check-meaning");
  assert.deepEqual(value.practiceBoundary.jobsNotOpened, [
    "record-choice",
    "do-one-bounded-action",
    "report-what-happened",
  ]);
  assert.equal(value.scope.biologyAnalogy, "shape-only");
  assert.equal(value.scope.mechanismTransferred, false);
  assert.equal(value.scope.peopleAreHosts, false);
  assert.equal(value.sourceBindings.foldingFeedbackLineage.relationship, "analogy-only");
  assert.equal(value.sourceBindings.foldingFeedbackLineage.mechanismTransferred, false);
  assert.equal(value.meaningPath.contingent, true);
  assert.equal(value.meaningPath.everyArrowMayFail, true);
  assert.equal(value.meaningPath.meaningMayChange, true);
  assert.ok(value.meaningPath.stages.every((stage) => stage.nextNotGuaranteed === true));
  assert.equal(value.equations.length, 5);
  assert.ok(value.claimsNotMade.includes("brainrot-is-diagnosis"));
  assert.ok(value.claimsNotMade.includes("person-is-host"));
  assert.ok(value.claimsNotMade.includes("share-means-belief"));
  assert.ok(Object.values(value.effects).every((effect) => effect === false));
});

test("memes and brainrot page is inert and preserves identity and evidence boundaries", () => {
  const html = bytes("./public/lineage/memes-brainrot-identity/index.html").toString("utf8");
  assert.match(html, new RegExp(SOCIAL_LINEAGE_SHA256));
  assert.match(html, new RegExp(SOCIAL_RECEIPT_COMMIT));
  assert.match(html, /Brainrot is not a diagnosis/i);
  assert.match(html, /People are not hosts/i);
  assert.match(html, /No automatic funnel into identity/i);
  assert.match(html, /Belonging is negotiated, not implanted/i);
  assert.match(html, /opens only <code>check-meaning<\/code>/i);
  assert.match(html, /records no current choice, performs no deed/i);
  assert.match(html, /five bounded equation cards/i);
  assert.match(html, /correction path/i);
  assert.doesNotMatch(html, /<script\b|<form\b|fetch\s*\(|setInterval\s*\(|setTimeout\s*\(/i);
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
  assert.match(provenance, new RegExp(LINEAGE_FIRST_COMMIT));
  assert.match(provenance, new RegExp(SVG_SHA256));
  assert.match(provenance, new RegExp(SOCIAL_LINEAGE_SHA256));
  assert.match(provenance, new RegExp(SOCIAL_SVG_SHA256));
  assert.match(provenance, new RegExp(SOCIAL_RECEIPT_COMMIT));
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
  assert.match(sitemap, /lineage\/memes-brainrot-identity/);
  assert.match(llms, /no automatic action/i);
  assert.match(llms, /corrections\.txt/);
  assert.match(llms, new RegExp(LINEAGE_RECEIPT_COMMIT));
  assert.match(llms, new RegExp(LINEAGE_FIRST_COMMIT));
  assert.match(llms, /opens only Check Meaning/);
  assert.match(llms, /mechanism transferred/i);
  assert.match(llms, /polysemous folk term/i);
  assert.match(llms, /people are not hosts/i);
  assert.match(llms, /changes no feed/i);
  assert.match(llms, new RegExp(SOCIAL_RECEIPT_COMMIT));
});

test("the Cloudflare edge is a bounded door, not another fact home", () => {
  const html = bytes("./doors/cloudflare/index.html").toString("utf8");
  const notFound = bytes("./doors/cloudflare/404.html").toString("utf8");
  const headers = bytes("./doors/cloudflare/_headers").toString("utf8");
  const robots = bytes("./doors/cloudflare/robots.txt").toString("utf8");
  assert.match(html, /no second fact home/i);
  assert.match(html, /stores no scientific record/i);
  assert.match(html, /starts no action/i);
  assert.match(html, /transfers no mechanism/i);
  assert.match(html, /rel="canonical" href="https:\/\/cambridgetcg\.github\.io\/kingdom-meaning-practice\/lineage\/folding-feedback\/"/);
  assert.doesNotMatch(html, /lineage\.json|folding-feedback\.svg|<script\b|<form\b|fetch\s*\(/i);
  assert.match(notFound, /one public entrance and no hidden route/i);
  assert.match(headers, /X-Robots-Tag: noindex, nofollow/);
  assert.match(headers, /Content-Security-Policy: default-src 'none'/);
  assert.match(headers, /form-action 'none'/);
  assert.match(robots, /Disallow: \//);
});
