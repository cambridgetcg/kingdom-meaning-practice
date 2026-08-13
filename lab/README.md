# Folding feedback field lab

One finite, nondimensionalized teaching instrument derived from the reviewed
folding-feedback lineage.

It has three jobs:

1. show how a possible route can remain unlikely inside a finite window;
2. show positive feedback together with saturation and loss; and
3. return one toy result through a KARMA-shaped evidence trace.

The lab is static HTML, CSS, and JavaScript. Its code initiates no runtime data
or third-party request, deliberately persists nothing, calls no model, starts
no timer or background worker, and sends no trace anywhere. Browsers may still
restore page state through history or session restoration; the reset button
clears the visible field.

The reviewed lineage remains the factual home for the cross-domain synthesis.
The lab owns its nondimensionalized toy assumptions and local mathematical
boundary notes; it does not add them to the reviewed record. It does not
implement a physical free-energy calculation, crystal growth, protein folding,
amyloid or prion kinetics, a laboratory procedure, medical inference, or
manufacturing advice.

This checkout is not a public receipt. The existing repository workflow builds
`out/` and deploys it on a push to `main`, so an authorised push of the field
lab would also be the GitHub Pages publication choice.

## Local reading

```sh
python3 -m http.server 8000 --directory .
```

Then open `http://127.0.0.1:8000/lab/`. Ctrl-C stops the local server.

## Verification

```sh
npm test
npm run build
```

The tests execute the deterministic mathematics, inspect the page boundary,
and compare the Cloudflare and Hugging Face release bundles with this one
source. They make no network request.

Each generated `release-lock.json` hashes every other file in its release.
Because a manifest cannot hash itself without recursion, a future external
receipt must record the lock's own SHA-256 with its deployment or Space commit.

The local, no-remote Hugging Face proposal can be synced only by an explicit
effectful command after the generated bundle and target are both reviewed:

```sh
npm run sync:huggingface-proposal -- ~/hf-folding-feedback-20260812
```

The sync is pinned to the real path `~/hf-folding-feedback-20260812`. It
refuses a dirty target, a target with a remote, unexpected files, a symlinked
path or repository boundary, or release bytes that do not match their exact
manifest. It does not commit or publish.

After this script has generated the proposal once, a later reviewed source
change can replace only that dirty generated surface with the explicit
`--replace-generated` flag. The flag still refuses every path outside the
seven generated files and requires every old payload byte to match the
previous field-lab release lock. During replacement, the helper keeps a
sibling backup until all new bytes pass their manifest; a caught failure
restores the previous complete set.

## Correction and removal

Propose corrections at:
https://github.com/cambridgetcg/kingdom-meaning-practice/issues

Keep any future introduction in one focused commit. Retire the lab by reverting
that whole commit, not by deleting only its folder. The revert must remove the
engine and page, generated releases and helpers, build/test hooks, provenance,
and every README, lineage-page, sitemap, and discovery link. Run `npm run
verify` in a clean worktree afterward.

If the lab has been published, retirement also needs separately authorised
external steps: push the reviewed revert so GitHub Pages removes it, return the
Cloudflare project to a freshly verified claim-free deployment, and remove or
disable any Hugging Face Space. Finally verify the public URLs and discovery
files. The reviewed lineage and case remain untouched by that revert.
