import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

import {
  BOUNDARIES,
  DEFAULT_STATE,
  LINEAGE_SHA256 as LAB_LINEAGE_SHA256,
  activatedRate,
  evaluate,
  firstArrivalProbability,
  karmaTrace,
  normalizeState,
} from "./lab/engine.mjs";

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

test("field lab reachability is finite, monotone, and nondimensionalized", () => {
  const defaultRun = evaluate(DEFAULT_STATE);
  assert.equal(defaultRun.reach.rateA, Math.exp(-4.8));
  assert.equal(defaultRun.reach.rateB, Math.exp(-7.2));
  assert.ok(defaultRun.reach.arrivalA > defaultRun.reach.arrivalB);
  assert.equal(defaultRun.reach.comparison, "A");

  const lowerBarrier = activatedRate(2, 1);
  const higherBarrier = activatedRate(5, 1);
  assert.ok(lowerBarrier > higherBarrier);
  assert.ok(firstArrivalProbability(lowerBarrier) > firstArrivalProbability(higherBarrier));
  assert.equal(firstArrivalProbability(0), 0);
  assert.equal(BOUNDARIES.units, "nondimensionalized teaching units");
  assert.equal(BOUNDARIES.relationship, "analogy");
  assert.equal(BOUNDARIES.mechanismTransferred, false);
  assert.equal(LAB_LINEAGE_SHA256, LINEAGE_SHA256);

  const bothRare = evaluate({
    ...DEFAULT_STATE,
    barrierA: 12,
    barrierB: 12,
  });
  assert.deepEqual(bothRare.reach.belowDisplayThreshold, ["A", "B"]);
  assert.equal(bothRare.reach.displayThreshold, 0.05);

  const tie = evaluate({
    ...DEFAULT_STATE,
    barrierB: DEFAULT_STATE.barrierA,
    prefactorB: DEFAULT_STATE.prefactorA,
  });
  assert.equal(tie.reach.comparison, "tie");
  assert.equal(tie.reach.arrivalA, tie.reach.arrivalB);
  assert.match(tie.reach.assumption, /constant-hazard/);

  const tiny = evaluate({
    ...DEFAULT_STATE,
    barrierA: 12,
    prefactorA: 0.05,
  });
  assert.ok(tiny.reach.rateA > 0);
  assert.ok(tiny.reach.arrivalA > 0);
});

test("field lab feedback keeps gain, loss, saturation, and state bounds visible", () => {
  const growing = evaluate(DEFAULT_STATE);
  assert.equal(growing.feedback.initialFluxComparison, "gain-above-loss");
  assert.ok(growing.feedback.final > growing.feedback.initial);
  assert.ok(growing.feedback.final <= growing.state.capacity);
  assert.ok(growing.feedback.initialGain > growing.feedback.initialLoss);

  const declining = evaluate({
    ...DEFAULT_STATE,
    growth: 0.1,
    loss: 0.8,
  });
  assert.equal(declining.feedback.initialFluxComparison, "loss-above-gain");
  assert.ok(declining.feedback.final < declining.feedback.initial);

  const noProduct = evaluate({ ...DEFAULT_STATE, initial: 0 });
  assert.equal(noProduct.feedback.final, 0);

  const tinyTail = evaluate({
    ...DEFAULT_STATE,
    growth: 0,
    loss: 1.2,
    initial: 0.01,
  });
  assert.ok(tinyTail.feedback.final > 0);
  assert.ok(tinyTail.feedback.final < 0.000001);

  const saturated = evaluate({
    ...DEFAULT_STATE,
    capacity: 0.2,
    initial: 0.5,
  });
  assert.equal(saturated.state.initial, 0.2);
  assert.equal(saturated.feedback.initialFluxComparison, "loss-above-gain");
  assert.ok(saturated.feedback.final < saturated.feedback.initial);
  assert.match(saturated.feedback.solution, /analytic/);

  const closeFluxes = evaluate({
    ...DEFAULT_STATE,
    growth: 0.01,
    loss: 0.01,
    capacity: 2,
    initial: 0.01,
  });
  assert.ok(closeFluxes.feedback.initialGain < closeFluxes.feedback.initialLoss);
  assert.notEqual(closeFluxes.feedback.initialGain, closeFluxes.feedback.initialLoss);
  assert.equal(closeFluxes.feedback.initialFluxComparison, "loss-above-gain");
  assert.ok(closeFluxes.feedback.final < closeFluxes.feedback.initial);

  const resting = evaluate({
    ...DEFAULT_STATE,
    growth: 0,
    loss: 0,
    initial: 0.2,
  });
  assert.equal(resting.feedback.equilibriumKind, "continuum");
  assert.equal(resting.feedback.equilibrium, null);
  assert.equal(resting.feedback.final, resting.feedback.initial);

  const exactEquilibrium = evaluate({
    ...DEFAULT_STATE,
    growth: 0.3,
    loss: 0.2,
    capacity: 0.3,
    initial: 0.1,
  });
  assert.equal(exactEquilibrium.feedback.initialFluxComparison, "balanced");
  assert.equal(exactEquilibrium.feedback.trajectoryChange, "unchanged");
  const equilibriumTrace = karmaTrace({
    expectationReport: "decline",
    changeReport: "No verified action.",
    state: exactEquilibrium.state,
    reach: exactEquilibrium.reach,
    feedback: exactEquilibrium.feedback,
  });
  assert.equal(equilibriumTrace.agreementWithCurrentComputation, false);
  assert.match(equilibriumTrace.computedOutput[1], /stayed unchanged/);

  const bounded = normalizeState({ capacity: 0.2, initial: 0.5 });
  assert.equal(bounded.initial, 0.2);
});

test("field lab KARMA trace returns evidence without opening another turn", () => {
  const run = evaluate(DEFAULT_STATE);
  const trace = karmaTrace({
    expectationReport: "a-more-reachable",
    changeReport: "Changed a visible toy barrier.",
    state: run.state,
    reach: run.reach,
    feedback: run.feedback,
  });
  assert.equal(trace.expectationReport.value, "a-more-reachable");
  assert.equal(trace.expectationReport.orderVerified, false);
  assert.equal(trace.changeReport.text, "Changed a visible toy barrier.");
  assert.equal(trace.changeReport.actionVerified, false);
  assert.equal(trace.changeReport.countVerified, false);
  assert.equal(trace.agreementWithCurrentComputation, true);
  assert.equal(trace.causalAttribution, "not-assessed");
  assert.equal(trace.evidence.kind, "computed-model-output");
  assert.deepEqual(trace.evidence.effectiveState, run.state);
  assert.match(trace.response, /does not validate a scientific mechanism/);
  assert.match(trace.freshTurnBoundary, /fresh turn/);

  const noProduct = evaluate({ ...DEFAULT_STATE, initial: 0 });
  const unchanged = karmaTrace({
    expectationReport: "growth",
    changeReport: "Started with no product state.",
    state: noProduct.state,
    reach: noProduct.reach,
    feedback: noProduct.feedback,
  });
  assert.equal(unchanged.agreementWithCurrentComputation, false);
  assert.match(unchanged.computedOutput[1], /stayed unchanged/);

  const unstated = karmaTrace({
    expectationReport: "unstated",
    changeReport: "Changed a visible toy loss.",
    state: run.state,
    reach: run.reach,
    feedback: run.feedback,
  });
  assert.equal(unstated.agreementWithCurrentComputation, null);
  assert.match(unstated.response, /without rewriting it as foresight/);

  const tieRun = evaluate({
    ...DEFAULT_STATE,
    barrierB: DEFAULT_STATE.barrierA,
    prefactorB: DEFAULT_STATE.prefactorA,
  });
  const tieTrace = karmaTrace({
    expectationReport: "a-more-reachable",
    changeReport: "Set the route controls equal.",
    state: tieRun.state,
    reach: tieRun.reach,
    feedback: tieRun.feedback,
  });
  assert.equal(tieTrace.agreementWithCurrentComputation, false);
  assert.match(tieTrace.computedOutput[0], /equal/);

  const unknownExpectation = karmaTrace({
    expectationReport: "invented-value",
    changeReport: "No verified action.",
    state: run.state,
    reach: run.reach,
    feedback: run.feedback,
  });
  assert.equal(unknownExpectation.expectationReport.value, "unstated");
  assert.equal(unknownExpectation.agreementWithCurrentComputation, null);
});

test("field lab page names its scientific, civic, and effect boundaries", () => {
  const html = bytes("./lab/index.html").toString("utf8");
  const app = bytes("./lab/app.mjs").toString("utf8");
  const engine = bytes("./lab/engine.mjs").toString("utf8");
  assert.match(html, /toy mathematics only/i);
  assert.match(html, /Nondimensionalized/);
  assert.match(html, /Not seen is not impossible/);
  assert.match(html, /Feedback is a contest, not destiny/);
  assert.match(html, /KARMA here is evidence return/);
  assert.match(html, /timing not verified/);
  assert.match(html, /does not verify chronology, action, or number of changes/);
  assert.match(html, /placeholder="Optional report; leave blank when none is supplied\."/);
  assert.doesNotMatch(html, /<textarea[^>]*>Changed visible toy parameters/);
  assert.match(html, /no being enters the state graph/i);
  assert.match(html, /Σpᵢ = 1/);
  assert.match(html, /dimensionless ratio/);
  assert.match(html, /kBT<\/span> for per-particle energy/);
  assert.match(html, /∂J<sub>gain<\/sub>\/∂x = r\(1 − 2x\/K\) &gt; 0/);
  assert.match(html, /constant hazard and exponential waiting time/);
  assert.match(html, /not a competing-first-arrival experiment/);
  assert.match(html, /does not calculate stability or long-run preference/);
  assert.match(html, /lab-local mathematical boundary notes/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, new RegExp(LINEAGE_SHA256));
  assert.match(html, /type="module" src="app\.mjs"/);
  assert.doesNotMatch(html, /<form\b|type="file"|contenteditable|autoplay/i);
  for (const source of [html, app, engine]) {
    assert.doesNotMatch(
      source,
      /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|localStorage|sessionStorage|indexedDB|setInterval\s*\(|setTimeout\s*\(|new\s+(?:Shared)?Worker\s*\(|serviceWorker/i,
    );
  }
  assert.doesNotMatch(app, /document\.cookie|location\s*=|window\.open/);
  assert.match(app, /stroke-dasharray/);
  assert.match(app, /"solid" : "dashed"/);
  assert.match(app, /toExponential\(2\)/);
  assert.match(app, /toExponential\(3\)/);
  assert.match(app, /percentage > 99\.99/);
  assert.match(app, /control\.value = String\(current\.state/);
  assert.match(app, /prediction\.addEventListener\("change", clearTrace\)/);
  assert.match(app, /change\.addEventListener\("input", clearTrace\)/);
  assert.match(app, /change\.value = ""/);
  assert.doesNotMatch(html, /makes no new scientific claim|Every value is dimensionless/);
});

test("field lab platform bundles derive from the same four source files", () => {
  const sourceNames = ["index.html", "lab.css", "app.mjs", "engine.mjs"];
  const sourceHashes = Object.fromEntries(sourceNames.map((name) => [
    name,
    sha256(bytes(`./lab/${name}`)),
  ]));

  for (const [directory, platform] of [
    ["cloudflare-field-lab", "cloudflare-pages-static"],
    ["huggingface-field-lab", "huggingface-static-space"],
  ]) {
    const lock = JSON.parse(bytes(`./doors/${directory}/release-lock.json`));
    assert.equal(lock.platform, platform);
    assert.equal(lock.relationship, "derived-teaching-instrument");
    assert.equal(lock.mechanismTransferred, false);
    assert.equal(lock.sourceLineage.sha256, LINEAGE_SHA256);
    assert.deepEqual(lock.sourceFiles, sourceHashes);
    assert.ok(Object.values(lock.effects).every((effect) => effect === false));
    const releaseNames = readdirSync(new URL(`./doors/${directory}/`, import.meta.url))
      .filter((name) => name !== "release-lock.json")
      .sort();
    const releaseHashes = Object.fromEntries(releaseNames.map((name) => [
      name,
      sha256(bytes(`./doors/${directory}/${name}`)),
    ]));
    assert.deepEqual(lock.releaseFiles, releaseHashes);
    assert.match(lock.releaseManifestRule, /except.*release-lock\.json/);
    for (const name of sourceNames.slice(1)) {
      assert.equal(bytes(`./doors/${directory}/${name}`).compare(bytes(`./lab/${name}`)), 0);
    }
    const index = bytes(`./doors/${directory}/index.html`).toString("utf8");
    assert.match(index, /https:\/\/cambridgetcg\.github\.io\/kingdom-meaning-practice\/lineage\/folding-feedback\//);
    assert.doesNotMatch(index, /href="\.\.\/lineage/);
  }
});

test("platform release instructions preserve brakes, rights, and publication truth", () => {
  const cloudflareReadme = bytes("./doors/cloudflare-field-lab/README.md").toString("utf8");
  const cloudflareHeaders = bytes("./doors/cloudflare-field-lab/_headers").toString("utf8");
  const cloudflareState = bytes("./CLOUDFLARE.md").toString("utf8");
  const huggingFaceReadme = bytes("./doors/huggingface-field-lab/README.md").toString("utf8");
  const syncHelper = bytes("./scripts/sync-huggingface-proposal.mjs").toString("utf8");
  assert.match(cloudflareReadme, /not authority to run it/);
  assert.match(cloudflareReadme, /38ec586a-14f9-42c2-85a1-bbfd14160a6a/);
  assert.match(cloudflareHeaders, /connect-src 'none'/);
  assert.match(cloudflareHeaders, /script-src 'self'/);
  assert.match(cloudflareHeaders, /X-Robots-Tag: noindex, nofollow/);
  assert.match(cloudflareState, /field lab.*production deployment/is);
  assert.match(cloudflareState, /external production action, not a local `HALT`/);
  assert.match(huggingFaceReadme, /sdk: static/);
  assert.doesNotMatch(huggingFaceReadme, /^license:/m);
  assert.match(huggingFaceReadme, /intentionally declares no licence\s+metadata/);
  assert.match(huggingFaceReadme, /Public Space source is visible and clonable/);
  assert.match(huggingFaceReadme, /published after a fresh review/i);
  assert.match(huggingFaceReadme, /owner-authorised credential/);
  assert.match(syncHelper, /reviewedTarget = join\(homedir\(\), "hf-folding-feedback-20260812"\)/);
  assert.match(syncHelper, /verifyRelease\(target, priorLock\)/);
  assert.match(syncHelper, /field-lab-sync-backup/);
  assert.match(syncHelper, /publishedRemote = "https:\/\/huggingface\.co\/spaces\/Yu-and-Ai\/folding-feedback-field-lab"/);
  assert.match(syncHelper, /remotes\.length > 1/);
});

test("GitHub Pages publication and full retirement remain explicit choices", () => {
  const workflow = bytes("./.github/workflows/deploy.yml").toString("utf8");
  const provenance = bytes("./PROVENANCE.md").toString("utf8");
  const rootReadme = bytes("./README.md").toString("utf8");
  const labReadme = bytes("./lab/README.md").toString("utf8");
  assert.match(workflow, /branches:\s*\[main\]/);
  assert.match(workflow, /npm run verify/);
  assert.match(workflow, /actions\/deploy-pages/);
  assert.match(provenance, /deploys `out\/` on each push to `main`/);
  assert.match(rootReadme, /field lab — GitHub Pages/i);
  assert.match(rootReadme, /Cloudflare Pages, and the Hugging Face\s+Static Space now publish projections/i);
  assert.match(labReadme, /This source is public/);
  assert.match(labReadme, /reverting\s+that whole commit/is);
  assert.match(labReadme, /build\/test hooks/);
  assert.match(labReadme, /Cloudflare project.*Hugging Face Space/is);
  assert.doesNotMatch(labReadme, /Remove `lab\/` and the two derived release bundles/);
});

test("live platform receipts bind source, deployments, and reversal boundaries", () => {
  const receipt = bytes("./PUBLICATION.md").toString("utf8");
  assert.match(receipt, /24d7ee1c983cbbe2548085fb8478a785e8ff8eda/);
  assert.match(receipt, /31717602996/);
  assert.match(receipt, /186d993b-fa57-4c67-94e2-036dd178ac60/);
  assert.match(receipt, /90ccbb19c35c1295863f630fdf66d80c919ee577195b63ba592c194ed8f31954/);
  assert.match(receipt, /38ec586a-14f9-42c2-85a1-bbfd14160a6a/);
  assert.match(receipt, /0850c007e3b615ca0b35ab27e505e2d1cef5605d/);
  assert.match(receipt, /8876d6b3c18cfead2c015365aebd35e6643d7c1875a33f66b6e83aef3cfa3034/);
  assert.match(receipt, /runtime stage at verification: `RUNNING`/);
  assert.match(receipt, /adds one small inline\s+platform marker/);
  assert.match(receipt, /revert the focused lab commits/);
  assert.match(receipt, /Pages rollback API/);
  assert.match(receipt, /make the Space private/);
  assert.doesNotMatch(receipt, /hf_[A-Za-z0-9]+|Bearer\s+[A-Za-z0-9._-]+/);
});

test("field lab is linked from the lineage and public discovery surfaces", () => {
  const lineagePage = bytes("./public/lineage/folding-feedback/index.html").toString("utf8");
  const sitemap = bytes("./public/sitemap.xml").toString("utf8");
  const llms = bytes("./public/llms.txt").toString("utf8");
  const readme = bytes("./README.md").toString("utf8");
  assert.match(lineagePage, /href="\.\.\/\.\.\/lab\/"/);
  assert.match(sitemap, /kingdom-meaning-practice\/lab\//);
  assert.match(llms, /Finite field lab/);
  assert.match(readme, /Finite folding-feedback field lab/);
});
