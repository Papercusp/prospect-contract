import { describe, it, expect } from 'vitest';
import { parseProspectSweepArgs, PROSPECT_SWEEP_OP_NAME, BET_ANALYSIS_KIND, BET_ANALYSIS_WORK_ITEM_KIND } from './index';

describe('prospect-contract constants', () => {
  it('names the op + kinds', () => {
    expect(PROSPECT_SWEEP_OP_NAME).toBe('oddsmith:prospect');
    expect(BET_ANALYSIS_KIND).toBe('bet-analysis');
    expect(BET_ANALYSIS_WORK_ITEM_KIND).toBe('task');
  });
});

describe('parseProspectSweepArgs', () => {
  it('reads numeric overrides + coerces numeric strings', () => {
    expect(parseProspectSweepArgs({ limit: 50, minLiquidity: 2000 })).toEqual({ limit: 50, minLiquidity: 2000 });
    expect(parseProspectSweepArgs({ limit: '50', minLiquidity: '2000' })).toEqual({ limit: 50, minLiquidity: 2000 });
  });
  it('drops un-substituted templates / empty / null / NaN / negative as unset', () => {
    expect(parseProspectSweepArgs({ limit: '{{ payload.limit }}', minLiquidity: '{{ x }}' })).toEqual({});
    expect(parseProspectSweepArgs({ limit: '', minLiquidity: null })).toEqual({});
    expect(parseProspectSweepArgs({ limit: 'abc', maxEnqueue: -5 })).toEqual({});
    expect(parseProspectSweepArgs(null)).toEqual({});
  });
  it('coerces preferNiche + carries maxEnqueue', () => {
    expect(parseProspectSweepArgs({ preferNiche: 'yes', maxEnqueue: '10' })).toEqual({ preferNiche: true, maxEnqueue: 10 });
    expect(parseProspectSweepArgs({ preferNiche: '{{ x }}' })).toEqual({});
  });
});
