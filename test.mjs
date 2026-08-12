import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const CASE_SHA256 = "652a04699aadc6143d9136dc8d515fd3b4fa8774d963d885e79968156b1cb8ad";
const SVG_SHA256 = "a2a0ae7d599d733dffc5b89502a10983c483a9ac174a952581fbea372179f1d1";
const FIRST_COMMIT = "805543deb5725e4cc2cc5e7d18c0e30c2360184e";

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

test("human page is inert, bounded, and points to the immutable record", () => {
  const html = bytes("./index.html").toString("utf8");
  assert.match(html, new RegExp(FIRST_COMMIT));
  assert.match(html, new RegExp(CASE_SHA256));
  assert.match(html, /not medical advice/i);
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

test("rights and discovery stay explicit", () => {
  const rights = bytes("./RIGHTS.md").toString("utf8");
  const robots = bytes("./public/robots.txt").toString("utf8");
  const sitemap = bytes("./public/sitemap.xml").toString("utf8");
  const llms = bytes("./public/llms.txt").toString("utf8");
  assert.match(rights, /No reuse licence is granted/);
  assert.match(rights, /full texts are not copied/);
  assert.match(robots, /Sitemap:/);
  assert.match(sitemap, /case\.json/);
  assert.match(llms, /no automatic action/i);
});
