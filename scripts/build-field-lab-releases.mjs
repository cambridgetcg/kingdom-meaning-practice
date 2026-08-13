import { createHash } from "node:crypto";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";

const root = new URL("../", import.meta.url);
const source = new URL("lab/", root);
const cloudflare = new URL("doors/cloudflare-field-lab/", root);
const huggingFace = new URL("doors/huggingface-field-lab/", root);
const sourceNames = ["index.html", "lab.css", "app.mjs", "engine.mjs"];
const lineageSha256 =
  "c07c2c9d02c2a3163ac595c339c770450900ad9397a8e42b578f269c65599f4b";
const lineageReceipt =
  "6d7c2e2c66bbfe67351f12355131c877c15f1362";
const publicLineage =
  "https://cambridgetcg.github.io/kingdom-meaning-practice/lineage/folding-feedback/";

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function clean(directory) {
  rmSync(directory, { recursive: true, force: true });
  mkdirSync(directory, { recursive: true });
}

function write(directory, name, value) {
  writeFileSync(new URL(name, directory), value);
}

function platformIndex() {
  return readFileSync(new URL("index.html", source), "utf8")
    .replaceAll("../lineage/folding-feedback/lineage.json", `${publicLineage}lineage.json`)
    .replaceAll("../lineage/folding-feedback/", publicLineage);
}

function copyApp(directory) {
  for (const name of sourceNames.slice(1)) {
    cpSync(new URL(name, source), new URL(name, directory));
  }
  write(directory, "index.html", platformIndex());
}

function lock(platform, directory) {
  const releaseNames = readdirSync(directory)
    .filter((name) => name !== "release-lock.json")
    .sort();
  return `${JSON.stringify({
    schema: "kingdom.field-lab-release/0.1",
    artifact: "folding-feedback-field-lab",
    platform,
    relationship: "derived-teaching-instrument",
    mechanismTransferred: false,
    sourceLineage: {
      sha256: lineageSha256,
      immutableReceipt: lineageReceipt,
      publicHome: publicLineage,
    },
    sourceFiles: Object.fromEntries(sourceNames.map((name) => [
      name,
      sha256(readFileSync(new URL(name, source))),
    ])),
    releaseManifestRule:
      "releaseFiles hashes every release payload file except this self-describing release-lock.json",
    releaseFiles: Object.fromEntries(releaseNames.map((name) => [
      name,
      sha256(readFileSync(new URL(name, directory))),
    ])),
    effects: {
      modelCalls: false,
      appInitiatedDataRequests: false,
      thirdPartyRequests: false,
      persistentWrites: false,
      storageReads: false,
      timers: false,
      workers: false,
      submissions: false,
      analytics: false,
    },
    claimsNotMade: [
      "scientific-fact-home",
      "physical-free-energy-calculation",
      "crystal-growth-model",
      "protein-folding-simulation",
      "amyloid-or-prion-kinetic-model",
      "medical-laboratory-or-manufacturing-inference",
      "kingdom-action-authority",
    ],
  }, null, 2)}\n`;
}

clean(cloudflare);
copyApp(cloudflare);
write(cloudflare, "404.html", `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Field at rest</title></head>
<body><main><h1>No instrument here.</h1><p>This static release has one public entrance.</p><p><a href="/">Return to the field lab</a></p></main></body></html>\n`);
write(cloudflare, "robots.txt", "User-agent: *\nDisallow: /\n");
write(cloudflare, "_headers", `/*
  X-Robots-Tag: noindex, nofollow
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'none'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'
  Cache-Control: public, max-age=300
`);
write(cloudflare, "README.md", `# Cloudflare field lab release

This generated folder gives the existing Cloudflare Pages project an
independent job: run the finite client-side field lab close to its reader.
The canonical lineage and correction path stay on GitHub Pages.

Nothing in this folder calls a model, runtime data or third-party endpoint,
storage API, timer, worker, analytics service, or submission route. The app
accepts only local range, select, button, and short note input. It deliberately
persists nothing; browser history or session restoration may retain page
state, and the reset button clears the visible field.

\`release-lock.json\` hashes every other payload file. Each deployment receipt
must record that lock's own SHA-256 together with the deployment ID.

The first verified field-lab production deployment is
\`738f0274-291b-4bc6-8ea9-bd75a3db3ed7\`, sourced from commit
\`14a4f8074bacd477b2bb1f8b38a0a8de60467d09\`. The project is
\`kingdom-folding-feedback\`. Before any replacement, confirm the known
claim-free production rollback \`38ec586a-14f9-42c2-85a1-bbfd14160a6a\`
still exists. See \`CLOUDFLARE.md\` and \`PUBLICATION.md\` at the repository
root for the bounded receipts.

After a fresh review of one exact clean commit, a future deployment command is:

\`\`\`sh
wrangler pages deploy doors/cloudflare-field-lab --project-name kingdom-folding-feedback --branch main --commit-hash "$(git rev-parse HEAD)" --commit-dirty=false
\`\`\`

That example is not authority to run it. Rollback is a separate explicit
Cloudflare action.
`);
write(cloudflare, "release-lock.json", lock("cloudflare-pages-static", cloudflare));

clean(huggingFace);
copyApp(huggingFace);
write(huggingFace, "robots.txt", "User-agent: *\nDisallow: /\n");
write(huggingFace, "README.md", `---
title: Folding Feedback Field Lab
emoji: "🌀"
colorFrom: blue
colorTo: yellow
sdk: static
app_file: index.html
fullWidth: true
pinned: false
short_description: A finite bench for reachability, feedback, and evidence.
---

# Folding feedback field lab

This public Static Space is a deterministic teaching instrument derived
from one reviewed KINGDOM folding-feedback lineage. It is not another
scientific fact home, dataset, model, training run, benchmark score,
laboratory tool, or submission endpoint.

The authoritative public lineage, sources, unknowns, rights, and correction
path remain at:
${publicLineage}

Reviewed lineage SHA-256: \`${lineageSha256}\`

Immutable public receipt: \`${lineageReceipt}\`

The app runs only client-side mathematics in nondimensionalized teaching
units. It calls no model, runtime data endpoint, or third-party endpoint;
deliberately reads or writes no browser storage; starts no timer or worker;
accepts no upload; and sends no trace anywhere. Browser history or session
restoration may retain page state, and the reset button clears the visible
field.

\`release-lock.json\` hashes every other payload file. The publication receipt
records that lock's own SHA-256 together with the Space commit.

Public Space source is visible and clonable. No reuse licence is granted unless
a file says otherwise, so this Space intentionally declares no licence
metadata. Owner, visibility, and any future licence remain separate choices.
This release was published after a fresh review and a current owner choice
using an owner-authorised credential; prefer a target-scoped token for later
writes.
`);
write(huggingFace, "release-lock.json", lock("huggingface-static-space", huggingFace));
