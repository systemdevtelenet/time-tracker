import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { NextRequest, NextResponse } from 'next/server.js';

// Run real route handlers with an isolated database double; never mutate HR data.
function setup(access = { employeeCode: 'TEST1', name: 'Test Employee', isAdmin: false }) {
  const rows = [
    { name: 'Test Employee', ticket_number: 'shared', summary: 'Mine' },
    { name: 'Other Employee', ticket_number: 'shared', summary: 'Other' },
  ];
  const cache = new Map();
  let queries = 0;
  const supabase = { from() {
    queries++;
    let filters = [], deleting = false, inserted;
    const query = {
      select() { return query; }, order() { return query; }, limit() { return query; },
      eq(key, value) { filters.push(row => row[key] === value); return query; },
      ilike(key, value) { filters.push(row => row[key].includes(value.replaceAll('%', ''))); return query; },
      insert(values) { inserted = values; return query; },
      delete() { deleting = true; return query; },
      then(resolve) {
        const data = rows.filter(row => filters.every(filter => filter(row)));
        if (deleting) data.forEach(row => rows.splice(rows.indexOf(row), 1));
        if (inserted) rows.push(...inserted);
        return Promise.resolve({ data: inserted || data, error: null }).then(resolve);
      },
    };
    return query;
  }};
  const mocks = {
    'next/server': { NextRequest, NextResponse },
    '@/lib/employeeAccess': { getActiveEmployeeAccess: async () => access },
    '@/lib/supabase/server': { getSupabaseAdmin: () => supabase },
    '@/lib/serverCache': {
      getCachedData: key => cache.get(key), setCachedData: (key, value) => cache.set(key, value),
      invalidateCache: () => cache.clear(),
    },
  };
  const source = fs.readFileSync('app/api/time-entries/route.ts', 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, URL, require: name => {
    assert.ok(mocks[name], `Unexpected dependency ${name}`); return mocks[name];
  }, console });
  const request = (method, body, query = '') => new NextRequest(`http://localhost/api/time-entries${query}`, {
    method, ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  });
  return { route: exports, request, rows, queries: () => queries, setAccess(value) { access = value; } };
}

test('all handlers reject missing or inactive employee access before database work', async () => {
  const s = setup(null);
  for (const method of ['GET', 'POST', 'DELETE']) {
    assert.equal((await s.route[method](s.request(method))).status, 401);
  }
  assert.equal(s.queries(), 0);
});

test('employee reads remain scoped even with an arbitrary agent filter and admin cache', async () => {
  const s = setup({ employeeCode: 'ADMIN', name: 'Admin', isAdmin: true });
  assert.equal((await (await s.route.GET(s.request('GET'))).json()).data.length, 2);
  s.setAccess({ employeeCode: 'TEST1', name: 'Test Employee', isAdmin: false });
  for (const query of ['', '?agent=Other Employee']) {
    const response = await s.route.GET(s.request('GET', undefined, query));
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    const body = await response.json();
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].name, 'Test Employee');
  }
});

test('employee cannot impersonate another employee when submitting time', async () => {
  const s = setup();
  const result = await s.route.POST(s.request('POST', { name: 'Other Employee', summary: 'spoof' }));
  assert.equal(result.status, 403);
  assert.equal(s.queries(), 0);
});

test('invalid JSON and missing fields return 400 without an insert', async () => {
  const s = setup();
  const malformed = new NextRequest('http://localhost/api/time-entries', { method: 'POST', body: '{' });
  assert.equal((await s.route.POST(malformed)).status, 400);
  for (const body of [null, [], { name: 'Test Employee', summary: ' ' }, { name: 'Test Employee', summary: 'valid' }]) {
    assert.equal((await s.route.POST(s.request('POST', body))).status, 400);
  }
  assert.equal(s.rows.length, 2);
});

test('valid own entry saves and invalidates the read cache', async () => {
  const s = setup();
  await s.route.GET(s.request('GET'));
  const body = { name: 'Test Employee', summary: 'Task complete', date_of_shift: '2026-11-11', account: 'TEST', total_minutes: '1 minute', ticket_number: 'new', tagging: 'General' };
  assert.equal((await s.route.POST(s.request('POST', body))).status, 201);
  assert.equal((await (await s.route.GET(s.request('GET'))).json()).data.length, 2);
});

test('employee deletion cannot delete another employee sharing the ticket number', async () => {
  const s = setup();
  assert.equal((await s.route.DELETE(s.request('DELETE', undefined, '?ticket_number=shared'))).status, 200);
  assert.equal(s.rows.length, 1);
  assert.equal(s.rows[0].name, 'Other Employee');
});

test('admin retains organization read and delete access', async () => {
  const s = setup({ employeeCode: 'ADMIN', name: 'Admin', isAdmin: true });
  assert.equal((await (await s.route.GET(s.request('GET'))).json()).data.length, 2);
  await s.route.DELETE(s.request('DELETE', undefined, '?ticket_number=shared'));
  assert.equal(s.rows.length, 0);
});
