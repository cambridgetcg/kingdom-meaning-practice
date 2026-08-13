# Cloudflare deployment observation

Observed and published with Wrangler 4.103.0 on 2026-08-13.

Project: `kingdom-folding-feedback`

| Role | Production deployment | Source commit | Local bundle |
|---|---|---|---|
| current field lab | `738f0274-291b-4bc6-8ea9-bd75a3db3ed7` | `14a4f8074bacd477b2bb1f8b38a0a8de60467d09` | `doors/cloudflare-field-lab/` |
| previous link-only door | `a63bad18-bb46-429d-8e7c-d2275aec000a` | `a75415f` | `doors/cloudflare/` |
| claim-free resting rollback | `38ec586a-14f9-42c2-85a1-bbfd14160a6a` | `a75415f` | `doors/cloudflare-resting-baseline/` |
| first link-only door | `3f46372e-ad8e-4668-94b3-eef71991e9c0` | `176bfc7` | historical source |

The field lab is live at `https://kingdom-folding-feedback.pages.dev/` and its
immutable deployment URL is
`https://738f0274.kingdom-folding-feedback.pages.dev/`. Every served payload
byte, the custom 404, and the security headers were checked against the local
release. The release-lock SHA-256 is
`b1d939cc9d9bdc0dccbe1811360a2c7b6d864b60f46086a45cc2c4212c359ccc`.
The reviewed GitHub lineage remains the factual home.

Cloudflare rollback is an external production action, not a local `HALT`.
Before relying on either ID, list current production deployments again and
compare the exact served bytes. A successful past deployment is a candidate
rollback target; this file does not prove that it remains available or that a
rollback occurred.

No credential, dashboard setting, route, project, deployment, or domain was
created or changed while recording this observation.
