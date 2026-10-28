// Prints one GitHub issue per problem in #4471 as JSON: the same split the kb page renders.
// Usage: node --experimental-strip-types scripts/file-tickets.mts > /tmp/tickets.json
import { readFileSync, readdirSync } from 'node:fs';
import { splitProblems } from '../src/lib/kb/problems.ts';
import type { Report, Tenant } from '../src/lib/kb/causes.ts';

const base = new URL('../src/lib/data/', import.meta.url);
const read = (p: string) => JSON.parse(readFileSync(new URL(p, base), 'utf8'));
const reports = read('reports-4471.json') as Report[];
const notes = read('desk-notes.json') as { oneDayMove: string[] };
const tenants = readdirSync(new URL('tenants/', base)).map((f) => read('tenants/' + f) as Tenant);
const byHandle = new Map(tenants.map((t) => [t.handle, t]));

const problems = splitProblems(reports, 4471, (r) => byHandle.get(r.tenant), notes.oneDayMove);
const fmt = (n: Record<string, number>) => Object.entries(n).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ×${v}`).join(', ');

const issues = problems.map((p) => {
  const sample = p.reports.slice(0, 3).map((r) => `- ${r.id} (${r.tenant}, ${r.channel}, ${r.receivedAt.slice(0, 10)}): "${r.body}"`).join('\n');
  const body = [
    `**Problem:** ${p.title}.`,
    '',
    p.what,
    '',
    `**Reports covered: ${p.reports.length}** of the 412 merged into #4471 (427 export rows, 15 duplicate rows removed by id). Counted the desk's way, as exported: each report under its cause by tenant; the one-day-move reports also sit inside the cause they were filed under.`,
    '',
    `- tenants (${p.tenants.length}): ${p.tenants.join(', ')}`,
    `- came in by: ${fmt(p.channels)}`,
    `- intake tagged them: ${fmt(p.taggedAs)} (intake guesses from the browser; the cause depends on the tenant)`,
    `- first seen ${p.firstSeen}, last seen ${p.lastSeen}`,
    '',
    'Sample reports:',
    sample,
    '',
    `Split out of #4471 by the kb's own cause logic (\`src/lib/kb/causes.ts\`, \`desk-notes.json\`) via \`src/lib/kb/problems.ts\`. Page: \`src/routes/kb/incidents/4471-split/+page.svx\` in this repo.`,
  ].join('\n');
  return { key: p.key, title: `${p.key}: ${p.title} (${p.reports.length} reports)`, body, count: p.reports.length };
});
console.log(JSON.stringify(issues, null, 2));
