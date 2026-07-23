# Sources of truth and drift

## Precedence

| Order | Source | Answers |
|---:|---|---|
| 1 | Current code, runtime and tests | What the system actually does now |
| 2 | Active OpenSpec specs | What observable behavior is expected |
| 3 | `AGENTS.md`, `.project-os/`, local OpenSpec config | How repository work must be performed |
| 4 | GitHub Project | What is active, blocked, ready or done today |
| 5 | GitHub Actions | Which automatic checks actually ran and their result |
| 6 | Issues, pull requests, approvals, captures and reports | Which manual evidence and decisions exist |
| 7 | Archived OpenSpec changes | Why earlier changes were made |

Archived changes are historical evidence. They do not override current runtime, active specs, or operating
rules merely because they exist.

## Drift protocol

When sources contradict:

1. name both sources and the exact conflicting claim;
2. classify whether the conflict affects real state, expected behavior, operating rules, daily status, or
   evidence;
3. identify the source currently authoritative under the table above;
4. record risk and impacted surfaces;
5. create a normalization decision or issue;
6. do not silently rewrite either source while evidence is incomplete.

Two active operating sources with conflicting ownership or sequence are a failure or pending manual gate,
not an invitation to choose the most convenient rule.

## Evidence limits

- A present configuration proves only presence.
- A process listing proves only observed startup.
- A tool listing proves only advertised tools.
- An authenticated smoke proves only the tested operation with the recorded identity and scopes.
- A green test proves its assertions, not product readiness.
- A missing, skipped or cancelled check proves nothing.
