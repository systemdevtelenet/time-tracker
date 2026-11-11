import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync('lib/punchLogs.ts', 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const exports = {};
vm.runInNewContext(code, {
  exports,
  require(name) {
    assert.equal(name, '@/lib/timeZone');
    return { WORKFORCE_TIME_ZONE: 'Asia/Manila' };
  },
});

test('shift totals deduct only the one-hour meal, including both paid breaks', () => {
  const start = '2026-11-12T00:00:00Z';
  const end = '2026-11-12T09:00:00Z';
  assert.equal(exports.formatCompletedShiftDuration(start, end), '8.0 hrs completed');

  const punches = [
    { id: '1', empId: 'TEST', type: 'Shift Start', timestamp: start, duration: '', status: '' },
    { id: '2', empId: 'TEST', type: 'Shift End', timestamp: end, duration: '', status: '' },
  ];
  const result = exports.computeShiftMilestonesAndAudit('TEST', punches);
  assert.equal(result.milestones.at(-1).duration, '8.0 hrs completed');
});

test('shift totals do not invent completed hours for missing punches', () => {
  assert.equal(exports.formatCompletedShiftDuration(), 'Awaiting shift end');
  assert.equal(exports.formatCompletedShiftDuration(null, '2026-11-12T09:00:00Z'), 'Duration unavailable');
  assert.equal(exports.formatCompletedShiftDuration('2026-11-12T09:00:00Z', '2026-11-12T00:00:00Z'), 'Duration unavailable');
});
