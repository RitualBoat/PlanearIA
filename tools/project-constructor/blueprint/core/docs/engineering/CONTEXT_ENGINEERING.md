# Context engineering

## Entry strategy

Start with:

1. `AGENTS.md`;
2. this engineering index;
3. the active issue and plan;
4. the active OpenSpec change and its bounded context files;
5. only the source needed for the current question.

Critical operating documents are linked directly from `README.md`, `AGENTS.md`, or this index. Do not
create hidden parallel guides.

## Efficient investigation

- Read Markdown, JSON, YAML, TOML, assets and generated files directly.
- For code architecture, dependencies, flows and impact, use a healthy structural index first.
- Use line-level source intelligence when the structural tool is stale, ambiguous, misses a file, or exact
  edit context is needed.
- Do not call both intelligence layers by habit.
- Verify changing tool or library APIs with current official documentation.
- Summarize evidence as paths, status, decision and risk rather than pasting whole files.

## Bounded context

Every change should name the smallest relevant context and its owner. Product discovery may introduce a
lightweight glossary, bounded contexts, entity owners, invariants and contracts. That work does not select
deployment topology or implementation patterns by itself.

Keep a change's brownfield baseline bounded to the touched surface. It is not an inventory of the entire
repository.
