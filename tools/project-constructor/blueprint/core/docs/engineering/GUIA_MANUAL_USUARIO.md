# GUIA_MANUAL_USUARIO

These steps require a person because they grant authority, accept terms, spend money, expose external
state, or make a product decision. The constructor and doctor never perform them automatically.

| Step | Why human | How to verify | Evidence to provide |
|---|---|---|---|
| Approve the constructor artifact | Installing an external tarball accepts its source, version and dependency licenses | Compare the approved source/version/license, calculate SHA-256 locally and require the observed hash to equal the expected hash before installation | Source URL or immutable ref, version, license decision, expected SHA-256 and observed SHA-256; never credentials |
| Confirm repository and owner | The target and ownership cannot be inferred safely | Show repository URL, default branch and owner | Redacted screenshot or CLI output without tokens |
| Approve branch strategy | Protection and merge rules affect all recovery paths | Confirm short-lived branches, pull-request merge and protected default branch | Written approval or Project decision |
| Authenticate GitHub | OAuth/scopes grant external authority | Run the chosen official authentication flow and inspect scopes | Authenticated identity and scope names, never token values |
| Select or create GitHub Project | This mutates shared planning state | Compare `constructor:github-plan` with the chosen Project | Project URL/ID and field mapping |
| Apply labels, fields and statuses | Existing resources may conflict | Review create/reuse/update/conflict decisions one by one | Applied-resource report |
| Configure branch protection | It can block or permit repository-wide merges | Verify required reviews/checks and direct-push policy | Protection settings report |
| Generate and review official OPSX integration | OpenSpec is the external owner and the bounded adapter changes generated content | Run pinned local `openspec init --tools codex,claude,cursor,github-copilot,opencode`, then `constructor:opsx:adapt`; for later upgrades run `openspec update` and adapt again; never use `--tools all` | Exact harness list, local version, adapter report and reviewed changed-file list |
| Approve secrets and variables | Values must remain outside Git and evidence | Add them through the approved secret store and test presence only | Variable names and scope; no values |
| Approve costs and licenses | Terms and payment require accountable consent | Review license, free tier, paid threshold, data terms and exit path | Dated approval with owner |
| Promote advisory CI to blocking | A noisy check can stop all delivery | Review stable baseline, false-positive rate and rollback | Versioned policy decision |
| Approve product discovery start | Bootstrap completion is not product readiness | Confirm exit criteria in the runbook | Issue or Project gate marked approved |
| Approve technical profile later | Stack follows discovery, not tool availability | Review alternatives, trade-offs and ADR | Approved ADR |
| Merge or release | Publication changes external state | Confirm required checks actually ran and passed | Pull request, checks and release approval |

## Evidence hygiene

- Redact tokens, keys, cookies, private URLs and personal data.
- Prefer IDs, variable names, timestamps, tool versions and immutable links.
- A screenshot must show the relevant setting and repository context without secrets.
- Record `not verified` when access is unavailable; do not convert it to `PASS`.

## Manual gate report

For each step provide:

```text
Gate:
Status: pending | approved | rejected | not-applicable
Owner:
Approver:
Reason:
Verified by:
Evidence reference:
Expiration or review date:
Recovery:
```

An exception also requires an allowed field, ISO expiration, and recovery action. It cannot waive
identity, artifact integrity, pending tasks, or required evidence.
