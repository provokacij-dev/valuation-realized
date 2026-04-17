# Migration to a new machine

Generated 2026-04-17. Follow this top-to-bottom on the new machine.

## 1. What lives where after migration

### Cloud (nothing to do, it's already there)

| What | Where |
|---|---|
| Webhook backend code (`vr-ads-platform`) | GitHub: `provokacij-dev/Valuation-Realized-G2M` |
| Valuation calculator (`valuation-calc`) | GitHub: `provokacij-dev/valuation-realized` under `/valuation-calc/` |
| Business markdown docs + this migration guide | GitHub: `provokacij-dev/valuation-realized` |
| Document-generation scripts (teaser generators, proposal builders) | GitHub: `provokacij-dev/valuation-realized` under `/scripts/` |
| Manus site source snapshot | GitHub: `provokacij-dev/valuationrealized-site` |
| Per-lead pre-call briefs | Google Drive: `My Drive, Valuation Realized business, VR Meeting Briefs` |
| Webhook automation | Vercel project `valuation-realized-g2-m` (env vars live there) |
| App data (engagements, leads, ads, queue) | Supabase |
| Live marketing site | Manus (hosts `valuationrealized.com`) |
| Calendly config | Calendly SaaS |

### To upload manually to Google Drive (section 4)

All the non-text assets in `Desktop/VR/` that aren't in git: design docs in Word/PowerPoint, ad creatives, client proposals, recordings, photos, etc. ~3.3 GB total.

### To manually carry over (section 5)

- Claude Code memory files (small, valuable session context)
- Browser-based auth state, just re-sign in on the new machine

## 2. New-machine software install

Install in this order, run each check after.

1. Git at https://git-scm.com/download/win, verify with `git --version`
2. Node.js LTS at https://nodejs.org, verify with `node --version`
3. Bun at https://bun.sh, verify with `bun --version`
4. Claude Code at https://claude.ai/download, sign in with the same Anthropic account
5. Google Drive for Desktop at https://www.google.com/drive/download, sign in as `provokacij@gmail.com`, choose "stream files" mode
6. VS Code at https://code.visualstudio.com/
7. GitHub Desktop (optional) at https://desktop.github.com/

## 3. Clone the repos

Pick a parent folder (e.g. `~/Desktop/VR/`) and from it:

```bash
git clone https://github.com/provokacij-dev/Valuation-Realized-G2M.git
git clone https://github.com/provokacij-dev/valuation-realized.git
git clone https://github.com/provokacij-dev/valuationrealized-site.git
```

Install deps where needed:

```bash
cd Valuation-Realized-G2M && bun install
cd ../valuation-realized/valuation-calc && bun install
```

## 4. Google Drive upload checklist

Create this structure under `My Drive, Valuation Realized business/`:

```
Valuation Realized business/
  VR Meeting Briefs/         (already exists, auto-populated by webhook)
  Design & strategy/
  Offer & VSL/
  Ad creatives/
  Branding/
  Client deliverables/
  Client proposals/
  Client transcripts/
  Sales call recordings/
  Archive - Host Elite/
```

Then upload from local `Desktop/VR/` as follows:

| Local source | Drive destination |
|---|---|
| `Valuation Realized/Valuation-Realized-Design-Doc.docx` | `Design & strategy/` |
| `Valuation Realized/VR - diagnostics deck.pptx` | `Design & strategy/` |
| `Valuation Realized/Valuation Realized - Intro and Diagnostics report.pdf` | `Design & strategy/` |
| `vr_automation_architecture.html`, `vr_value_chain.html`, `exit-readiness-audit-sample.html`, `Prepare graph.jpg`, `stat_05_infographic_timing.png` | `Design & strategy/` |
| `VSL-Presentation-Deck.pptx`, `VSL-Presentation-Deck.pdf`, `VSL-Script-v2.docx` | `Offer & VSL/` |
| `Valuation Realized/VR VSL/` (entire folder) | `Offer & VSL/VR VSL/` |
| `Valuation Realized/Ad creatives/` (entire folder) | `Ad creatives/` |
| `25pct_v1_final.png`, `25pct_v1_graphic.png` | `Ad creatives/` |
| `Valuation Realized/Branding/` (entire folder) | `Branding/` |
| `Valuation Realized/MACO delivery/` (entire folder) | `Client deliverables/MACO/` |
| `Valuation Realized/Proposals/` (entire folder) | `Client proposals/` |
| Root: `Freight-Forwarding-Investment-Teaser.docx`, `Ishwar - Teaser_VR.docx` | `Client deliverables/` |
| Root: `_juan_transcript.txt`, `_pramod_transcript.txt` | `Client transcripts/` |
| `Valuation Realized/Sales calls/` (entire folder) | `Sales call recordings/` |
| `Valuation Realized/report-template/` (entire folder) | `Design & strategy/report-template/` |
| `Vaiga photos/` | (outside VR) `Personal/Photos/` or Google Photos |
| `Host Elite/` | `Archive - Host Elite/` |

**Skip these** (recreated from code):

- `Valuation Realized/vr-ads-platform/`, in GitHub
- `Valuation Realized/valuation-calc/`, in GitHub
- `.vr-inspect/`, in GitHub (valuationrealized-site repo)
- `node_modules/`, `.next/`, `.git/` anywhere
- Files starting with `~$` (Word temp/lock files)
- Root scripts `create-*.js`, `generate-*.js`, `_build_*.py`, in GitHub under `/scripts/`

## 5. Claude Code state, what to copy manually

On this laptop, Claude Code stores state under `C:\Users\vrimsaite\.claude\`. Most is session history/caches you don't need. Valuable bits to copy to the new machine (same path, `~\.claude\`):

| Path | What it is | Copy? |
|---|---|---|
| `~\.claude\CLAUDE.md` | Global Claude Code preferences (who you are, communication style) | Yes |
| `~\.claude\settings.json` | Hook configs, marketplaces | Yes |
| `~\.claude\projects\C--Users-vrimsaite-Desktop-VR\memory\` | Memory files from working on VR (who you are, project context, past feedback) | Yes (see rename note) |
| `~\.claude\skills\` | Installed skills (teaser, reply-email, check-ads, etc.) | Yes, or reinstall via `/gstack-upgrade` |
| `~\.claude\plugins\` | gstack plugin cache | No, reinstall via plugin |
| `~\.claude\sessions\`, `session-env\`, `shell-snapshots\`, `file-history\`, `browser_profile\`, `cookies_copy.db`, `backups\`, `telemetry\` | Session history, browser state, caches | No |
| `~\.claude\ide\`, `mcp-needs-auth-cache.json` | IDE / MCP auth cache | No, re-auth on new machine |

**Memory folder rename note:** the folder name `C--Users-vrimsaite-Desktop-VR` encodes the old absolute path. If your new VR folder sits at a different absolute path, rename the folder to match (e.g. `C--Users--NEWUSER-Documents-VR`). If the path is identical, keep as is.

**How to move them:**
Zip `~\.claude\CLAUDE.md`, `settings.json`, and `projects\C--Users-vrimsaite-Desktop-VR\memory\`, upload to a temp Drive folder, download on new machine, unzip into `~\.claude\`.

## 6. Re-auth checklist on new machine

Sign in to each service:

- [ ] GitHub (via `git` CLI or GitHub Desktop, auths on first push)
- [ ] Vercel CLI if wanted, `vercel login`; otherwise dashboard works
- [ ] Google as `provokacij@gmail.com` (Drive, Docs, Gmail)
- [ ] Calendly (browser)
- [ ] Anthropic console (if you manage API keys)
- [ ] Supabase (browser)
- [ ] Brevo (browser)
- [ ] Meta Ads Manager (browser)

Nothing needs re-configuration. Vercel env vars, Supabase creds, Calendly webhook, Google OAuth refresh token, and Brevo API key all live on Vercel. The webhook keeps running regardless of your local machine.

## 7. Smoke test the webhook

After setup, verify end-to-end:

1. Open Calendly, schedule a test call with yourself or a trusted contact.
2. Within ~60 seconds, check `vaiga@valuationrealized.com` inbox for the "Sales brief" email.
3. Check Google Drive `VR Meeting Briefs` folder for a new doc.
4. If both arrived, migration is complete.

If either fails, see `Valuation-Realized-G2M` repo, recent commits document the known-working config.

## 8. Secrets inventory

Long-lived secrets behind the automation. They live on Vercel env vars today. If you ever lose Vercel access, you'd need these to recreate it:

- `CALENDLY_WEBHOOK_SECRET`, webhook signing secret
- Calendly PAT with webhook scopes, revoke and regenerate the one pasted in chat on 2026-04-17
- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`, Google Docs auth
- Supabase service role key
- Brevo API key
- Anthropic API key

Vercel, Settings, Environment Variables, eye icon to view values. Rotate anything you're unsure about.
