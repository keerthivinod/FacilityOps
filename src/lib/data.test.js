import { test } from 'node:test';
import assert from 'node:assert';

import { autoRoute, statusColor, priorityColor, ESCALATION_RULES, TAT_BENCHMARKS } from './data-utils.js';

test('autoRoute - matches keywords for different roles', () => {
  // Plumber
  assert.strictEqual(autoRoute('leak').role, 'Plumber');
  assert.strictEqual(autoRoute('water').role, 'Plumber');

  // Carpenter
  assert.strictEqual(autoRoute('broken door').role, 'Carpenter');
  assert.strictEqual(autoRoute('chair').role, 'Carpenter');

  // Electrician
  assert.strictEqual(autoRoute('no power').role, 'Electrician');
  assert.strictEqual(autoRoute('light switch').role, 'Electrician');

  // IT Support
  assert.strictEqual(autoRoute('wifi is down').role, 'IT Support');
  assert.strictEqual(autoRoute('printer').role, 'IT Support');

  // Helper
  assert.strictEqual(autoRoute('need cleaning').role, 'Helper');
  assert.strictEqual(autoRoute('garbage').role, 'Helper');
});

test('autoRoute - matches specific people/specialties', () => {
  // AC issues (Suresh P)
  const acIssue = autoRoute('ac not cooling');
  assert.strictEqual(acIssue.role, 'Electrician');
  assert.strictEqual(acIssue.person, 'Suresh P');

  // Elevator issues (Suresh P)
  const elevatorIssue = autoRoute('lift stuck');
  assert.strictEqual(elevatorIssue.role, 'Electrician');
  assert.strictEqual(elevatorIssue.person, 'Suresh P');
});

test('autoRoute - case insensitive', () => {
  assert.strictEqual(autoRoute('LEAK').role, 'Plumber');
  assert.strictEqual(autoRoute('wifi').role, 'IT Support');
});

test('autoRoute - default case', () => {
  const result = autoRoute('something completely unrelated');
  assert.strictEqual(result.role, 'General');
  assert.strictEqual(result.person, 'Vinod R');
});

test('statusColor - returns correct hex codes', () => {
  assert.strictEqual(statusColor('overdue'), '#dc2626');
  assert.strictEqual(statusColor('healthy'), '#16a34a');
  assert.strictEqual(statusColor('due-soon'), '#d97706');
});

test('statusColor - default color', () => {
  assert.strictEqual(statusColor('unknown-status'), '#6b7280');
});

test('priorityColor - returns correct hex codes', () => {
  assert.strictEqual(priorityColor('critical'), '#dc2626');
  assert.strictEqual(priorityColor('low'), '#2563eb');
});

test('priorityColor - default color', () => {
  assert.strictEqual(priorityColor('unknown-priority'), '#6b7280');
});

test('ESCALATION_RULES - check structure', () => {
  assert.ok(Array.isArray(ESCALATION_RULES));
  assert.strictEqual(ESCALATION_RULES.length, 4);
  assert.strictEqual(ESCALATION_RULES[0].level, 1);
  assert.strictEqual(ESCALATION_RULES[3].level, 4);
});

test('TAT_BENCHMARKS - check values', () => {
  assert.strictEqual(TAT_BENCHMARKS.plumber, 30);
  assert.strictEqual(TAT_BENCHMARKS.it, 20);
});
