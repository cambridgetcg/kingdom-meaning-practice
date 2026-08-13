# Cloudflare deployment observation

Observed and published with Wrangler 4.103.0 on 2026-08-13.

Project: `kingdom-folding-feedback`

| Role | Production deployment | Source commit | Local bundle |
|---|---|---|---|
| current field lab | `186d993b-fa57-4c67-94e2-036dd178ac60` | `24d7ee1c983cbbe2548085fb8478a785e8ff8eda` | `doors/cloudflare-field-lab/` |
| first field-lab release | `738f0274-291b-4bc6-8ea9-bd75a3db3ed7` | `14a4f8074bacd477b2bb1f8b38a0a8de60467d09` | historical release |
| previous link-only door | `a63bad18-bb46-429d-8e7c-d2275aec000a` | `a75415f` | `doors/cloudflare/` |
| claim-free resting rollback | `38ec586a-14f9-42c2-85a1-bbfd14160a6a` | `a75415f` | `doors/cloudflare-resting-baseline/` |
| first link-only door | `3f46372e-ad8e-4668-94b3-eef71991e9c0` | `176bfc7` | historical source |

The field lab is live at `https://kingdom-folding-feedback.pages.dev/` and its
immutable deployment URL is
`https://186d993b.kingdom-folding-feedback.pages.dev/`. Every served payload
byte, the custom 404, and the security headers were checked against the local
release. The release-lock SHA-256 is
`90ccbb19c35c1295863f630fdf66d80c919ee577195b63ba592c194ed8f31954`.
The reviewed GitHub lineage remains the factual home.

Cloudflare rollback is an external production action, not a local `HALT`.
Before relying on either ID, list current production deployments again and
compare the exact served bytes. A successful past deployment is a candidate
rollback target; this file does not prove that it remains available or that a
rollback occurred.

The deployment above was created through the existing project with its current
OAuth credential. No credential, route, project, domain, or brake was created,
removed, or changed.
