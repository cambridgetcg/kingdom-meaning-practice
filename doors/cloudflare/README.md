# Cloudflare edge door

This is a non-authoritative, no-index doorway to the folding-feedback lineage.
It copies no scientific JSON, source text, or visual and accepts no input.

`../cloudflare-resting-baseline/` is the deliberately committed, claim-free
rollback state. Deploy that directory first whenever a new project has no
known-good rollback, record its deployment ID, then deploy this active door.

Project: `kingdom-folding-feedback`

Deploy the committed directory with:

```sh
wrangler pages deploy doors/cloudflare --project-name kingdom-folding-feedback --branch main --commit-hash "$(git rev-parse HEAD)" --commit-dirty=false
```

The factual and correction home remains:
https://cambridgetcg.github.io/kingdom-meaning-practice/lineage/folding-feedback/
