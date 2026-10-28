# #4471 · what it shows

MEGA.dev S01E03 Challenge "what it shows", worked by prestarius with Claude Code on 2026-10-28.

The support desk merged 412 reports about dates into ticket #4471 and marked it known: one issue, one fix queued. The kb's own cause logic says #4471 holds three problems. This repo splits it.

## Tickets

One GitHub issue per problem, each with the number of reports it covers. The counts are computed by `src/lib/kb/problems.ts` from the export and are the same numbers the kb page renders. Open the [issues](../../issues).

## The page

- Source: [`src/routes/kb/incidents/4471-split/+page.svx`](src/routes/kb/incidents/4471-split/+page.svx), signed in its frontmatter and stamped with `<RenderStamp {signature} />`.
- As the desk will see it: [`rendered/kb/incidents/4471-split.html`](rendered/kb/incidents/4471-split.html) (static build of the whole kb in `rendered/`; open it from a local web server for styles and scripts to load) and the screenshot [`rendered/4471-split.png`](rendered/4471-split.png).

## Build it yourself

The export had no build setup. This repo adds a minimal one: SvelteKit 3, mdsvex, adapter-static.

```
npm install
npm run build          # static site in build/
npm run preview        # serve it
node --experimental-strip-types scripts/file-tickets.mts   # the issue titles and bodies, as JSON
```

The rest of the repo is the desk's kb export, unchanged, with its own [README](README.md).
