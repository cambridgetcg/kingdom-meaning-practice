# Cloudflare field lab release

This generated folder gives the existing Cloudflare Pages project an
independent job: run the finite client-side field lab close to its reader.
The canonical lineage and correction path stay on GitHub Pages.

Nothing in this folder calls a model, runtime data or third-party endpoint,
storage API, timer, worker, analytics service, or submission route. The app
accepts only local range, select, button, and short note input. It deliberately
persists nothing; browser history or session restoration may retain page
state, and the reset button clears the visible field.

`release-lock.json` hashes every other payload file. A future deployment
receipt must record that lock's own SHA-256 together with the deployment ID.

Publication remains a separate current choice. The project is
`kingdom-folding-feedback`. Before any active deployment, confirm the known
claim-free production rollback `38ec586a-14f9-42c2-85a1-bbfd14160a6a`
still exists. The current link-only deployment observed on 2026-08-13 is
`a63bad18-bb46-429d-8e7c-d2275aec000a`. See `CLOUDFLARE.md` at the
repository root for the bounded observation.

After a fresh review of one exact clean commit, a future deployment command is:

```sh
wrangler pages deploy doors/cloudflare-field-lab --project-name kingdom-folding-feedback --branch main --commit-hash "$(git rev-parse HEAD)" --commit-dirty=false
```

That example is not authority to run it. Rollback is a separate explicit
Cloudflare action.
