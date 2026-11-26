---
name: push-it
description: Glimmer's ship flow. Before proposing any commit, update README.md and CHANGELOG.md. Once the user approves (or says "push it" / runs /push-it), commit, open a PR to main, review it with a subagent, fix findings, check SonarQube Cloud, fix or accept by severity, then merge to main so Vercel deploys glimmer-ui.com. Use whenever work in this repo is ready to commit.
---

# Push it

Every change is a small, shippable increment. The user's approval of the commit is approval of this whole flow, merge included. Stop and ask only at the stop points below.

## 0. Before asking for approval

- **README.md**: update every part the change touches: feature list, usage snippets, SwiftUI notes, badges. If the change is visible on the docs site, retake the affected shots in `.github/screenshots/` (hero-dark, hero-light, components, chart) from the local site (`preview_start` name `site`) at the same framing, JPEG.
- **CHANGELOG.md**: one line under `## Unreleased` (prefix `Swift:` or `Docs:` when it is not the web kit).
- **Swift parity**: a web component change has its SwiftUI side in the same change.
- Show the user what will ship (files and one-line summary) and ask for approval. Nothing below runs until they say yes.

## 1. Branch

- Never commit to `main`. If the current branch is `main`, or its PR is already merged (`gh pr list --head <branch> --state merged`), make a new branch from `origin/main` named for the change (`git fetch && git switch -c <name> origin/main`) and bring the work over (rebase or cherry-pick the unpushed commits).

## 2. Verify locally

Run all of these; all must pass:

```bash
npm run build && git diff --exit-code css/prefixed.css css/tailwind.css css/tokens.css
```
(Any diff here means generated files were stale: commit them, don't fail.)

```bash
npm test
```

```bash
npm --prefix site run check
```

```bash
swift build && swift test
```

## 3. Commit, push, open the PR

- Commit with an imperative subject naming the change (match `git log` style) and a short body on why. End with the attribution line the session gives.
- `git push -u origin <branch>`, then `gh pr create --base main` with a summary, a test-plan checklist, and the session's PR attribution line.
- Bind the PR with the app's PR tools if they are available.

## 4. Review with a subagent

- Spawn one `general-purpose` agent. Give it only the PR number and repo (`huntercash/glimmer-ui`), not your opinion of the code. Ask it to read `gh pr diff <n>` plus the files around each change and report correctness bugs, broken cross-platform parity (CSS vs SwiftUI), accessibility regressions (focus, forced colours, reduced motion, contrast) and stale docs. Each finding gets file:line, severity (high / medium / low) and a concrete failure scenario.
- Verify each finding yourself. Fix the real ones and push. List what you declined, and why, in a PR comment.

## 5. SonarQube Cloud

Project key `huntercash_glimmer-ui` uses automatic analysis (`.sonarcloud.properties`). The project is public, so the API needs no token.

- Wait for the PR analysis in the background (up to ~10 min), not by polling in the foreground:
  `https://sonarcloud.io/api/qualitygates/project_status?projectKey=huntercash_glimmer-ui&pullRequest=<n>`
- Then read the issues and hotspots:
  `https://sonarcloud.io/api/issues/search?componentKeys=huntercash_glimmer-ui&pullRequest=<n>&resolved=false&ps=100`
  `https://sonarcloud.io/api/hotspots/search?projectKey=huntercash_glimmer-ui&pullRequest=<n>`
- **Fix**: anything BLOCKER, CRITICAL or MAJOR (HIGH or MEDIUM impact), every vulnerability, every hotspot that is a real risk, and anything that fails the quality gate.
- **Accept**: MINOR or INFO (LOW impact) findings when the fix would make the code worse or contradicts a deliberate choice. List each one with its reason in a PR comment so the user can mark it in SonarCloud.
- If no PR analysis appears in time, check the branch (`&branch=<name>`). If that is missing too, note it in the PR and carry on: Sonar is advisory when it doesn't report.

## 6. Merge

All of these must be true first:
- Local checks are green after the last fix.
- The Vercel preview check on the PR head passed (`gh pr checks <n>`).
- The Sonar quality gate is not `ERROR`.

Then run `gh pr merge <n> --merge` (merge commit, as PR #1 was).

## 7. Confirm it is live

- Vercel deploys `main` to production on its own. Watch the Vercel check on the merge commit (`gh api repos/huntercash/glimmer-ui/commits/<sha>/check-runs`) until it finishes, then open https://glimmer-ui.com and confirm the change shows.
- Sync locally: `git switch main && git pull`.
- Report to the user: PR link, what the review and Sonar found and what was fixed or accepted, and the deploy result.

## Stop and ask the user when

- A merge conflict is not mechanical.
- A review or Sonar finding needs a product or design decision, not just a code fix.
- The quality gate fails on something you chose to accept.
- A check fails and the cause is outside the change (CI, Vercel, credentials).
- The deploy fails or the live site does not show the change.
