/**
 * @oddsmith/prospect-contract — the PURE `oddsmith:prospect` op contract.
 *
 * The single source of truth for the registered op name, the bet-analysis kinds, and
 * the blueprint-arg coercion — shared by BOTH `@oddsmith/prospector` (the engine-side
 * sweep) AND the papercusp framework op (`operator-core/.../oddsmith-prospect.ts`),
 * which previously hand-duplicated this logic. Zero deps, plain types (no
 * `@oddsmith/contracts`), so the papercusp operator-core can import it across the repo
 * boundary exactly like any `libs/generic/*` submodule.
 */

/** The registered op name (the `<domain>:<verb>` blueprint-op namespace). */
export const PROSPECT_SWEEP_OP_NAME = 'oddsmith:prospect';

/** The domain kind the analyst pipeline consumes. */
export const BET_ANALYSIS_KIND = 'bet-analysis';

/** The live work_items kind accepted by the queue substrate for bet-analysis jobs. */
export const BET_ANALYSIS_WORK_ITEM_KIND = 'task';

/**
 * Raw args as the blueprint spine delivers them (post-interpolation). An unfilled
 * `{{ payload.x }}` template arrives as the literal template string or `""`; the
 * coercers treat those (+ empty / null / NaN / negative) as "unset".
 */
export interface ProspectSweepArgs {
  /** `listMarkets` page size per venue. */
  limit?: number | string;
  /** Single liquidity floor → seeds the volume + open-interest candidate floors. */
  minLiquidity?: number | string;
  /** Hard cap on items enqueued per tick. */
  maxEnqueue?: number | string;
  /** Prefer thin/niche markets when ranking under the cap (BRIEF-A11 (e)). */
  preferNiche?: boolean | string;
}

/** The coerced sweep knobs — the "set" subset of the args (absent ⇒ the sweep default). */
export interface ParsedProspectOptions {
  limit?: number;
  minLiquidity?: number;
  maxEnqueue?: number;
  preferNiche?: boolean;
}

/**
 * A finite, non-negative number, or `undefined` for anything that should mean "unset"
 * (empty string, an un-substituted `{{ … }}` template, null/undefined, NaN, < 0).
 */
export function coerceNumber(v: unknown): number | undefined {
  if (v == null) return undefined;
  if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? v : undefined;
  if (typeof v === 'string') {
    const s = v.trim();
    if (s === '' || s.includes('{{')) return undefined;
    const n = Number(s);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  }
  return undefined;
}

/**
 * A boolean, or `undefined` for "unset" (an un-substituted `{{ … }}` template, empty
 * string, null/undefined). Accepts the string forms `"true"`/`"false"`/`"yes"`/… the
 * blueprint interpolation produces, plus a real boolean.
 */
export function coerceBoolean(v: unknown): boolean | undefined {
  if (v == null) return undefined;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === '' || s.includes('{{')) return undefined;
    if (s === 'true' || s === '1' || s === 'yes') return true;
    if (s === 'false' || s === '0' || s === 'no') return false;
  }
  return undefined;
}

/**
 * Coerce blueprint-interpolated args → `ParsedProspectOptions`. An unfilled template
 * is treated as "unset" so the sweep falls back to its defaults — the blueprint can
 * pass overrides without every tick having to supply them.
 */
export function parseProspectSweepArgs(
  raw: ProspectSweepArgs | Record<string, unknown> | null | undefined,
): ParsedProspectOptions {
  const r = (raw ?? {}) as Record<string, unknown>;
  const options: ParsedProspectOptions = {};
  const limit = coerceNumber(r.limit);
  if (limit != null) options.limit = limit;
  const minLiquidity = coerceNumber(r.minLiquidity);
  if (minLiquidity != null) options.minLiquidity = minLiquidity;
  const maxEnqueue = coerceNumber(r.maxEnqueue);
  if (maxEnqueue != null) options.maxEnqueue = maxEnqueue;
  const preferNiche = coerceBoolean(r.preferNiche);
  if (preferNiche != null) options.preferNiche = preferNiche;
  return options;
}
