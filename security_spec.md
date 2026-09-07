# Security Specification: beecarbonat Firebase Security

## 1. Data Invariants
- User profile at `/users/{userId}` can only be read/written by the matching authenticated user or administrators.
- `userId` in user document must match `request.auth.uid`.
- `email` must be a valid string format.
- `audit_logs` entries can be written by authenticated users with their own `userId` and read by admins or the creator.

## 2. Dirty Dozen Test Cases
1. Unauthenticated read to `/users/{userId}` -> PERMISSION_DENIED
2. Unauthenticated write to `/users/{userId}` -> PERMISSION_DENIED
3. User A attempting to modify User B's `/users/{userId}` -> PERMISSION_DENIED
4. Malicious client attempting to write 10MB payload to `/users/{userId}` -> PERMISSION_DENIED (Size limits enforced)
5. User attempting to assign themselves 'admin' role without privileges -> PERMISSION_DENIED
6. Non-owner attempting to read private audit logs of another user -> PERMISSION_DENIED
7. Injecting non-alphanumeric characters into `{userId}` path -> PERMISSION_DENIED
8. Unauthenticated write to `/audit_logs/{logId}` -> PERMISSION_DENIED
9. User writing audit log with mismatched `userId` != `request.auth.uid` -> PERMISSION_DENIED
10. Attempting to delete system audit logs -> PERMISSION_DENIED
11. Arbitrary collection write to unlisted path `/{document=**}` -> PERMISSION_DENIED (Default Deny)
12. Unverified email writing to sensitive enterprise collections -> PERMISSION_DENIED
