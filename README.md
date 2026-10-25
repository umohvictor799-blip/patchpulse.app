# PatchPulse

Automated AppSec scanner and 1-click auto-remediation for modern web apps and AI-generated codebases.

PatchPulse scans for exposed secrets, missing Row-Level Security, broken object-level authorization, wildcard CORS, debug endpoints, and LLM prompt-injection vectors. For each finding it shows an exploit explanation, a side-by-side auto-patch diff, and a one-click pull request.

The app ships with a pre-loaded vulnerable sample project, so it works with no API keys or external accounts.

## Quick start

Requires Node.js 18 or newer.

```bash
npm install
npm run dev          # API on :8787 and UI on :5173
```

Open http://localhost:5173. Production build:

```bash
npm run build        # outputs dist/
npm start            # serves dist/ and the API on :8787 (set PORT to change it)
npm run test:engine  # rule engine regression checks
```

## Architecture

| Layer | Path | Notes |
| --- | --- | --- |
| Detection engine | `server/rules.js` | Pure JS rules with detection, exploit text, and before/after patches. No dependencies. |
| API | `server/index.js` | `node:http` server: `GET /api/demo`, `GET /api/rules`, `POST /api/scan`, `POST /api/pr`, plus static hosting of `dist/`. |
| Sample project | `server/demo.js` | Vulnerable demo files and paste presets. |
| UI state | `src/context/ScanContext.jsx` | Current scan, live score, applied patches, and PR history. |
| Diff engine | `src/lib/diff.js` | LCS line diff with aligned change rows for the split viewer. |
| Pages | `src/pages/` | Landing, Scanner, Findings (with auto-patch modal), Audit Report. |

Routes: `/` landing, `/scan` scanner, `/findings` findings and auto-patch, `/report` printable certificate.

## Adding a rule

Append an object to `RULES` in `server/rules.js`:

```js
{
  id: "my-rule", title: "...", severity: "high", category: "Access Control",
  exploit: "How an attacker abuses this.",
  fix: "What the patch changes.",
  detect(path, content) { return lines(content, (l) => /pattern/.test(l)).slice(0, 1); },
  before: "vulnerable code",
  after: "patched code",
}
```

Add a matching test in `server/test-engine.js`. Severity weights are in `SCORE_WEIGHTS`. The client mirrors them in `src/lib/score.js`.

## What is real and what is simulated

Real:
- **Public GitHub repositories.** Enter owner/repo or a github.com URL, with an optional branch. The server reads the file tree and file contents through the GitHub REST API and scans them. Private repos return a clear "public repositories only" message.
- **Pasted and uploaded files.** Scanned exactly as entered. Nothing leaves your machine except the request to your own PatchPulse server.
- **Scoring, diffs, findings, and the audit report** are all computed from the scan results.

Simulated:
- **Pull requests.** `POST /api/pr` returns a PR-shaped response and does not contact GitHub. Creating real PRs needs a GitHub token with write access, which this public-only build does not use.
- **Findings and patches** are held in browser memory for the session. Refreshing the page starts a new session.

Limits and notes:
- Detection is pattern-based. It is fast and transparent, but it complements rather than replaces a full SAST/DAST review. It will miss issues and may report false positives.
- Up to 300 files and 200 KB per file are scanned, with priority given to API, auth, config, and env paths. Results are cached for 5 minutes per repo and branch.
- Unauthenticated GitHub requests are limited to 60 per hour. Set `GITHUB_TOKEN` on the server (read-only scope is enough) to raise the limit to 5,000 per hour.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8787` | API port |
| `HOST` | `127.0.0.1` | Bind address (use `0.0.0.0` to reach it from other devices) |
| `GITHUB_TOKEN` | unset | Optional read-only token for higher GitHub rate limits |
| `GITHUB_API_BASE` / `GITHUB_RAW_BASE` | GitHub | Override endpoints (used by tests) |

## Tests

```bash
npm test   # rule engine checks, then GitHub scanning checks against a local fake GitHub
```

## Taking it to production

1. Add a GitHub App (or a token with repo write access) and open real branches and PRs through the Git Data API. Today PRs are simulated.
2. Persist scans, findings, and PRs in Postgres. Add auth (for example, Supabase Auth or Clerk) and per-team tenancy.
3. Gate CI/CD (Agency tier) by running the scan as a required check and failing on critical findings.
4. Add rate limiting, request size limits (already enforced at 1 MB and 50 files), and structured logging.
5. Deploy: `npm run build && npm start` behind a reverse proxy, or split the static UI to a CDN and point `/api` at the server.
