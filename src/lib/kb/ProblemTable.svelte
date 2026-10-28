<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import tickets from '#lib/data/tickets-4471.json';
  import { mergedCount, splitProblems } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';
  import type { Report } from '#lib/kb/causes';

  let { ticket }: { ticket: number } = $props();

  const problems = $derived(splitProblems(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const total = $derived(mergedCount(reports as Report[], ticket));
  const moved = $derived(problems.find((p) => p.key === 'one-day-move')?.reports.length ?? 0);
  const tags = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
  const issue = (key: keyof typeof tickets.issues) => tickets.issues[key].number;
  const ticket_ = (key: keyof typeof tickets.issues) => tickets.issues[key];
  const url = (key: keyof typeof tickets.issues) => `https://github.com/${tickets.repo}/issues/${issue(key)}`;
</script>

<p class="sum">
  <strong>{total}</strong> reports merged into #{ticket} · <strong>{problems.length}</strong> problems · <strong>{problems.length}</strong> tickets
</p>
<p class="tags">Desk: {tickets.deskUpdate}.</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>came in by</th><th>intake tagged it</th><th>seen</th><th>ticket</th><th>desk says</th></tr>
  </thead>
  <tbody>
    {#each problems as p (p.key)}
      <tr>
        <td><code>{p.key}</code></td>
        <td><strong>{p.reports.length}</strong></td>
        <td>{p.tenants.length}</td>
        <td class="tags">{tags(p.channels)}</td>
        <td class="tags">{tags(p.taggedAs)}</td>
        <td>{p.firstSeen} → {p.lastSeen}</td>
        <td>{#if issue(p.key)}<a href={url(p.key)}>#{issue(p.key)}</a> <span class="tags">{ticket_(p.key).state}{ticket_(p.key).reason ? `, ${ticket_(p.key).reason}` : ''}</span>{:else}<span class="pending">not filed yet</span>{/if}</td>
        <td class="tags"><strong>{ticket_(p.key).desk}</strong> · {ticket_(p.key).deskNote}</td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="tags">Counted the desk's way, as exported: each report under its cause by tenant, so the {moved} one-day-move reports are also inside the cause they were filed under.</p>

{#each problems as p (p.key)}
  <h3 id={p.key}><code>{p.key}</code> · {p.title}</h3>
  <p>{p.what}</p>
  <p class="tags">
    {p.reports.length} reports from {p.tenants.join(', ')}.
    {#if issue(p.key)}Ticket <a href={url(p.key)}>#{issue(p.key)}</a>.{/if}
  </p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .pending { color: var(--warn); }
  h3 { margin-top: 1.5rem; font-size: 1.05rem; }
</style>
