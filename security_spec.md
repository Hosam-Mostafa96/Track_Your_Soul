# Security Specification — 24-Hour Flash Challenges

## 1. Data Invariants
1. A `FlashChallenge` document (`/flashChallenges/{challengeId}`) can only be created by a verified signed-in user (`request.auth.token.email_verified == true`), with `participantsCount == 1`, `topUserId == request.auth.uid`, server timestamps (`request.time`), and an atomic creation of the caller's `/flashChallenges/{challengeId}/entries/{uid}` document whose `count` matches `topCount`.
2. A `FlashChallenge` document's immutable fields (`id`, `title`, `dhikrKey`, `targetGoal`, `createdAt`) can never be changed after creation.
3. A `FlashChallenge` document's `topCount` can ONLY increase monotonically (`incoming().topCount > existing().topCount`), and `topUserId` must equal `request.auth.uid`, and `getAfter(.../entries/{uid}).data.count` must equal `incoming().topCount` atomically.
4. `participantsCount` can ONLY increment by `+1` when a user joins for the first time (`!exists(.../entries/{uid}) && existsAfter(.../entries/{uid})`).
5. A `FlashChallengeEntry` document (`/flashChallenges/{challengeId}/entries/{userId}`) can ONLY be read, created, or updated by the owning verified user (`request.auth.uid == userId`), cannot decrease in `count` (`incoming().count >= existing().count`), and cannot exist without its parent challenge (`exists` / `existsAfter`).
6. No PII (`email`, `phone`, `address`) is stored in either collection, and `allow list` is disabled (`if false`) on both collections because clients read deterministic document paths directly.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated read/write**: `request.auth == null` reading `/flashChallenges/2026-11-27_salawat`.
2. **Unverified email write**: `request.auth.token.email_verified == false` creating or updating a challenge or entry.
3. **Ghost / Shadow Field Injection**: Creating `FlashChallenge` with extra field `{ ..., isAdminVerified: true }`.
4. **Path ID Poisoning**: Creating `/flashChallenges/invalid id!@#` or >64-char `challengeId`.
5. **Orphaned Parent Creation**: Creating `/flashChallenges/{id}` without atomically creating `/flashChallenges/{id}/entries/{uid}`.
6. **Orphaned Entry Creation**: Creating `/flashChallenges/{id}/entries/{uid}` when `/flashChallenges/{id}` neither exists nor is created atomically.
7. **Spoofed Leader Identity**: Updating `topUserId` to another user's UID (`topUserId: "victim_uid"`).
8. **Fake Record Inflation**: Updating `topCount` on `/flashChallenges/{id}` to `999999` without atomically matching `entries/{uid}.count == 999999`.
9. **Record Sabotage / Rollback**: Updating `topCount` to a lower value than `existing().topCount`.
10. **Participants Count Tampering**: Updating `participantsCount` by `+10` or resetting it, or incrementing it without a newly created `entries/{uid}`.
11. **Cross-User Entry Access**: Reading or updating `/flashChallenges/{id}/entries/otherUserUid` as `attackerUid`.
12. **Client Timestamp Forgery**: Sending `createdAt` or `updatedAt` with a past/future client `Timestamp` instead of `serverTimestamp()` (`request.time`).
