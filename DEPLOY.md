# GitHub Pages handoff — human-gated

This branch is prepared for GitHub Pages, **not deployed**. No push, hosting changes
or DNS edits were performed. Netlify and Vercel are not the intended providers;
their legacy configuration files remain historical artifacts and are not used by
the Pages workflow.

## Owner actions, in order

1. Review and merge the approved source to `main`.
2. In `Yacinewhatchandcode/Yace19ai.com` → Settings → Pages, select **GitHub Actions**
   as the build source. A push does not publish. Follow the immutable-artifact
   and approval procedure in the README's **Pages release and rollback** section;
   do not use a legacy workflow rerun as a release or rollback shortcut.
3. In GoDaddy DNS for `yace19ai.com`, replace the stale apex record `75.2.60.5`
   and the stale `www` Netlify CNAME with the records below. Keep existing mail,
   verification and other unrelated records. Remove conflicting apex/`www`
   A/AAAA/CNAME records only after checking their purpose.

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | yacinewhatchandcode.github.io |

4. In Settings → Pages, set custom domain **yace19ai.com** if not already set.
   `public/CNAME` is included in the published artifact, but the owner must verify
   the account-side setting. Follow GitHub's domain verification instructions,
   wait for DNS and certificate provisioning, then enable **Enforce HTTPS**.
5. Verify apex and `www`, all navigation routes, media byte ranges and the
   custom domain's certificate. This repository builds physical HTML entry points
   for `/fleet/`, `/games/`, `/philosophy/` and `/media/` because Pages has no SPA
   rewrite. Unknown paths use the application's 404 view.

## Current diagnosis

GoDaddy nameservers resolve the domain, so this is not an NXDOMAIN problem.
The existing records route traffic to a stale Netlify destination; that destination
returns `site-not-found`, and the custom domains currently have certificate
mismatches. This does **not** prove that a Netlify account deleted a site.
The owner's intended platform is GitHub Pages. The required repair is the
human-approved Pages publication and GoDaddy record replacement above, **not**
restoring or changing Netlify.

## Local-only preview

```sh
npm ci
npm run build
python3 qa/serve.py
```

Open `http://127.0.0.1:4181`. The preview binds only loopback on that port.
The archive includes unavailable children's games and defective original recordings;
see `qa-evidence/REPORT.md` before approving publication. No payment,
microphone capture, live fleet telemetry or remote execution is provided.
