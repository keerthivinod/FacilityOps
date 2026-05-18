import { test } from 'node:test';
import assert from 'node:assert';
import { autoRoute } from './data-utils.js';

test('autoRoute - correctly routes plumbing issues', () => {
  const result = autoRoute('There is a water leak in the bathroom');
  assert.strictEqual(result.role, 'Plumber');
  assert.strictEqual(result.person, 'Rajesh M');
  assert.strictEqual(result.id, 'S01');
});

test('autoRoute - correctly routes carpenter issues', () => {
  const result = autoRoute('The wooden door hinge is broken');
  assert.strictEqual(result.role, 'Carpenter');
  assert.strictEqual(result.person, 'Murugan K');
  assert.strictEqual(result.id, 'S02');
});

test('autoRoute - correctly routes electrician issues', () => {
  const result = autoRoute('The light switch is not working');
  assert.strictEqual(result.role, 'Electrician');
  assert.strictEqual(result.person, 'Rajan Kumar');
  assert.strictEqual(result.id, 'S03');
});

test('autoRoute - correctly routes AC issues', () => {
  const result = autoRoute('The AC is not cooling properly');
  assert.strictEqual(result.role, 'Electrician');
  assert.strictEqual(result.person, 'Suresh P');
  assert.strictEqual(result.id, 'S04');
});

test('autoRoute - correctly routes IT issues', () => {
  const result = autoRoute('The wifi is down and the printer is not connecting');
  assert.strictEqual(result.role, 'IT Support');
  assert.strictEqual(result.person, 'Arun M');
  assert.strictEqual(result.id, 'S05');
});

test('autoRoute - correctly routes helper/cleaning issues', () => {
  const result = autoRoute('Please mop the floor and clean the garden');
  assert.strictEqual(result.role, 'Helper');
  assert.strictEqual(result.person, 'Vinod R');
  assert.strictEqual(result.id, 'S06');
});

test('autoRoute - correctly routes elevator issues', () => {
  const result = autoRoute('The lift is stuck on the 3rd floor');
  assert.strictEqual(result.role, 'Electrician');
  assert.strictEqual(result.person, 'Suresh P');
  assert.strictEqual(result.id, 'S04');
});

test('autoRoute - case insensitivity', () => {
  const result = autoRoute('WATER LEAK IN BATHROOM');
  assert.strictEqual(result.role, 'Plumber');
});

test('autoRoute - default/fallback route', () => {
  const result = autoRoute('Need assistance with some random task');
  assert.strictEqual(result.role, 'General');
  assert.strictEqual(result.person, 'Vinod R');
  assert.strictEqual(result.id, 'S06');
});

test('autoRoute - first match wins with multiple keywords', () => {
  // "water" (Plumber) comes first in the routes list than "switch" (Electrician)
  const result = autoRoute('Water is leaking near the light switch');
  assert.strictEqual(result.role, 'Plumber');
});
