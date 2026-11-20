# Security Specification — GlassWindow Unified Database

## 1. Data Invariants
1. **Identity Integrity**: Every write to `/customers/{customerId}`, `/parameterChanges/{changeId}`, `/buyerLeads/{leadId}`, and `/siteVisits/{visitId}` must come from a verified Firebase Auth user (`request.auth != null && request.auth.token.email_verified == true`), and `incoming().uid == request.auth.uid` (unless performed by a verified admin).
2. **Temporal Integrity**: `createdAt == request.time` on creation; `createdAt` and `uid` are immutable on update (`incoming().createdAt == existing().createdAt && incoming().uid == existing().uid`); `updatedAt == request.time` on update.
3. **Append-Only Telemetry**: `/parameterChanges/{changeId}` documents are immutable once created (`allow update, delete: if false;` except admin cleanup). Every parameter or metric mutation creates a new verified change event.
4. **Terminal State Locking**: In `/buyerLeads/{leadId}` and `/siteVisits/{visitId}`, terminal statuses (`Closed / Dropped`, `Cancelled`) cannot transition further unless overridden by `isAdmin()`.
5. **PII Isolation & Query Enforcement**: Collections holding `email` and `phone` (`customers`, `buyerLeads`, `siteVisits`, `parameterChanges`) restrict `get` and `list` exclusively to `resource.data.uid == request.auth.uid || isAdmin()`.
6. **Bounded Arrays & String Lengths**: `savedFlatIds.size() <= 50`, `followedStocks.size() <= 20`, all IDs match `^[a-zA-Z0-9_\-]+$` (`size() <= 128`), and every string field enforces a strict upper size bound.
7. **Admin Privilege Protection**: `/admins/{adminUid}` is read-only for the owning user and non-writable by non-admin clients to prevent self-assigned escalation.

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Customer Create**: `POST /customers/cust-1` with `request.auth == null`.
2. **Unverified Email Write**: `POST /customers/cust-1` with `email_verified: false`.
3. **Identity Spoofing on Customer Create**: `POST /customers/cust-1` where `uid: "victim_uid"` differs from `request.auth.uid`.
4. **Shadow / Ghost Field Injection**: `POST /customers/cust-1` containing extra field `isAdmin: true`.
5. **Oversized Document ID Poisoning**: `POST /customers/${'a'.repeat(200)}` violating `isValidId()`.
6. **Client-Forged Timestamp**: `POST /parameterChanges/chg-1` with `createdAt` != `request.time`.
7. **Unbounded Array Exhaustion**: `POST /customers/cust-1` with 60 items in `savedFlatIds` (exceeds `size() <= 50`).
8. **Cross-Tenant PII Read**: Authenticated user B attempting `get /customers/cust-of-user-A`.
9. **Blanket List Query Scraping**: Authenticated user querying `list /customers` without `uid == request.auth.uid`.
10. **Immutable Field Tampering**: Updating `/customers/cust-1` and changing `uid` or `createdAt`.
11. **Audit Log Tampering**: Attempting `update` or `delete` on `/parameterChanges/chg-1` as non-admin.
12. **Self-Assigned Admin Escalation**: Non-admin user attempting `set /admins/${request.auth.uid}` with `{ role: "admin" }`.
