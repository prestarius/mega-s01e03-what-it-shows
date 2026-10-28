// The problems #4471 really holds. One ticket per problem; the counts here are the counts on the tickets.
// Built on causes.ts (the desk's own cause logic) plus desk-notes.json (reports the desk read differently).
import { groupByCause, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type ProblemKey = 'parser' | 'hint' | 'one-day-move';

export type Problem = {
  key: ProblemKey;
  title: string;
  what: string;
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  taggedAs: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

const TITLE: Record<ProblemKey, string> = {
  parser: 'Shared parser reads every date month first; day-first tenants get the month and day swapped',
  hint: 'booking-v3 date hint says MM/DD/YYYY, so people type month first and the form reads it day first',
  'one-day-move': 'Dates land one day off, not a month flip: a timezone or day-boundary bug',
};

const WHAT: Record<ProblemKey, string> = {
  parser:
    'The parser behind every channel reads dates month first. All eleven tenants write the day first, so a date like 7 April comes out as 4 July. Fix: parse with the tenant locale.',
  hint:
    'Tenants on booking-v3 see a MM/DD/YYYY hint under the date field. People follow it and type month first; the form then reads the value the tenant way, day first. A different bug from the parser: the hint is wrong, and only reports through the form hit it. Fix: print the hint the tenant locale uses.',
  'one-day-move':
    'These reports describe a shift of exactly one day, or the same meeting on two different days in two cities, not a swapped month. The desk read them as a one-day move (desk-notes.json) and counts them under the parser by tenant, as its table shows. This ticket carries those same reports: a date-only value crossing a timezone or a DST change.',
};

function summarize(key: ProblemKey, reports: Report[]): Problem {
  const days = reports.map((r) => r.receivedAt.slice(0, 10)).sort();
  const count = (pick: (r: Report) => string) =>
    reports.reduce<Record<string, number>>((n, r) => ({ ...n, [pick(r)]: (n[pick(r)] ?? 0) + 1 }), {});
  return {
    key,
    title: TITLE[key],
    what: WHAT[key],
    reports,
    tenants: [...new Set(reports.map((r) => r.tenant))].sort(),
    channels: count((r) => r.channel),
    taggedAs: count((r) => r.meta.intakeTag),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

// Counts follow the desk's own view, as exported: a report is counted under its cause by tenant, and the
// reports the desk read as a one-day move (desk-notes.json) are carried by their own ticket as well.
export function splitProblems(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): Problem[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const byCause = new Map(groupByCause(merged, tenantOf).map((g) => [g.cause, g.reports]));
  const unplaced = byCause.get('unplaced') ?? [];
  if (unplaced.length) throw new Error(`${unplaced.length} reports have no cause: tenant not on file`);
  return [
    summarize('parser', byCause.get('parser') ?? []),
    summarize('hint', byCause.get('hint') ?? []),
    summarize('one-day-move', merged.filter((r) => oneDayMove.includes(r.id))),
  ].sort((a, b) => b.reports.length - a.reports.length);
}

// How many reports merged into `ticket`, counted once.
export function mergedCount(reports: Report[], ticket: number): number {
  return uniqueById(reports).filter((r) => r.mergedInto === ticket).length;
}
