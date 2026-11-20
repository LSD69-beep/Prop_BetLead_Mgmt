/**
 * Security Rule Verification Suite — GlassWindow Unified Database
 * Verifies all "Dirty Dozen" adversarial payloads are rejected (PERMISSION_DENIED).
 */
export interface DirtyDozenScenario {
  id: string;
  collection: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expected: 'PERMISSION_DENIED';
  payload: Record<string, unknown>;
}

export const DIRTY_DOZEN_SCENARIOS: DirtyDozenScenario[] = [
  {
    id: '1-unauthenticated-customer-create',
    collection: 'customers/cust-unauth',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { auth: null, data: { id: 'cust-unauth', name: 'Test' } },
  },
  {
    id: '2-unverified-email-write',
    collection: 'customers/cust-unverified',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { auth: { uid: 'u1', token: { email_verified: false } }, data: { uid: 'u1' } },
  },
  {
    id: '3-identity-spoofing-create',
    collection: 'customers/cust-spoof',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { auth: { uid: 'attacker', token: { email_verified: true } }, data: { uid: 'victim' } },
  },
  {
    id: '4-ghost-field-injection',
    collection: 'customers/cust-ghost',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { auth: { uid: 'u1', token: { email_verified: true } }, data: { uid: 'u1', isAdmin: true } },
  },
  {
    id: '5-id-poisoning-oversized',
    collection: `customers/${'x'.repeat(160)}`,
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { auth: { uid: 'u1', token: { email_verified: true } }, data: { uid: 'u1' } },
  },
  {
    id: '6-client-forged-timestamp',
    collection: 'parameterChanges/chg-forged',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { data: { createdAt: '1999-01-01T00:00:00Z' } },
  },
  {
    id: '7-unbounded-array-exhaustion',
    collection: 'customers/cust-arr',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { data: { savedFlatIds: Array.from({ length: 55 }, (_, i) => `flat-${i}`) } },
  },
  {
    id: '8-cross-tenant-pii-read',
    collection: 'customers/cust-user-a',
    operation: 'get',
    expected: 'PERMISSION_DENIED',
    payload: { auth: { uid: 'user-b', token: { email_verified: true } } },
  },
  {
    id: '9-blanket-list-scraping',
    collection: 'customers',
    operation: 'list',
    expected: 'PERMISSION_DENIED',
    payload: { auth: { uid: 'user-b', token: { email_verified: true } }, query: 'ALL' },
  },
  {
    id: '10-immutable-field-tampering',
    collection: 'customers/cust-u1',
    operation: 'update',
    expected: 'PERMISSION_DENIED',
    payload: { auth: { uid: 'u1', token: { email_verified: true } }, data: { uid: 'u2' } },
  },
  {
    id: '11-audit-log-tampering',
    collection: 'parameterChanges/chg-1',
    operation: 'delete',
    expected: 'PERMISSION_DENIED',
    payload: { auth: { uid: 'u1', token: { email_verified: true } } },
  },
  {
    id: '12-self-assigned-admin-escalation',
    collection: 'admins/u1',
    operation: 'create',
    expected: 'PERMISSION_DENIED',
    payload: { auth: { uid: 'u1', token: { email_verified: true } }, data: { uid: 'u1', role: 'admin' } },
  },
];
