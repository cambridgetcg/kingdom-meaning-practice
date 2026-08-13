# Cloudflare deployment observation

Observed read-only with Wrangler 4.103.0 on 2026-08-13.

Project: `kingdom-folding-feedback`

| Role | Production deployment | Source commit | Local bundle |
|---|---|---|---|
| current link-only door | `a63bad18-bb46-429d-8e7c-d2275aec000a` | `a75415f` | `doors/cloudflare/` |
| claim-free resting rollback | `38ec586a-14f9-42c2-85a1-bbfd14160a6a` | `a75415f` | `doors/cloudflare-resting-baseline/` |
| first link-only door | `3f46372e-ad8e-4668-94b3-eef71991e9c0` | `176bfc7` | historical source |

The current public project remains a non-authoritative pointer. The field lab
under `doors/cloudflare-field-lab/` is prepared locally and is **not deployed**.

Cloudflare rollback is an external production action, not a local `HALT`.
Before relying on either ID, list current production deployments again and
compare the exact served bytes. A successful past deployment is a candidate
rollback target; this file does not prove that it remains available or that a
rollback occurred.

No credential, dashboard setting, route, project, deployment, or domain was
created or changed while recording this observation.
