/**
 * Security Rules Specification Verification Matrix for Flash Challenges.
 * Documents the 12 adversarial payloads tested against firestore.rules.
 */
export interface DirtyDozenScenario {
  id: number;
  name: string;
  targetPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expectedResult: 'PERMISSION_DENIED';
  reason: string;
}

export const DIRTY_DOZEN_SCENARIOS: DirtyDozenScenario[] = [
  {
    id: 1,
    name: 'Unauthenticated Read',
    targetPath: '/flashChallenges/2026-11-27_salawat',
    operation: 'get',
    expectedResult: 'PERMISSION_DENIED',
    reason: 'isVerifiedSignedIn() requires non-null verified auth.',
  },
  {
    id: 2,
    name: 'Unverified Email Write',
    targetPath: '/flashChallenges/2026-11-27_salawat',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    reason: 'request.auth.token.email_verified must be true.',
  },
  {
    id: 3,
    name: 'Shadow Field Injection',
    targetPath: '/flashChallenges/2026-11-27_salawat',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    reason: 'data.keys().hasOnly(...) rejects unknown properties.',
  },
  {
    id: 4,
    name: 'Path ID Poisoning',
    targetPath: '/flashChallenges/bad id$%',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    reason: 'isValidChallengeId() enforces regex ^[a-zA-Z0-9_\\-]+$ and <= 64 chars.',
  },
  {
    id: 5,
    name: 'Orphaned Challenge Without Entry',
    targetPath: '/flashChallenges/2026-11-27_salawat',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    reason: 'existsAfter(.../entries/{uid}) enforces atomic entry creation.',
  },
  {
    id: 6,
    name: 'Orphaned Entry Without Challenge',
    targetPath: '/flashChallenges/2026-11-27_salawat/entries/user1',
    operation: 'create',
    expectedResult: 'PERMISSION_DENIED',
    reason: 'existsAfter(/flashChallenges/{id}) enforces parent challenge existence.',
  },
  {
    id: 7,
    name: 'Spoofed topUserId',
    targetPath: '/flashChallenges/2026-11-27_salawat',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    reason: 'incoming().topUserId == request.auth.uid blocks identity spoofing.',
  },
  {
    id: 8,
    name: 'Fake topCount Without Matching Entry',
    targetPath: '/flashChallenges/2026-11-27_salawat',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    reason: 'getAfter(.../entries/{uid}).data.count == incoming().topCount enforces parity.',
  },
  {
    id: 9,
    name: 'topCount Rollback Attack',
    targetPath: '/flashChallenges/2026-11-27_salawat',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    reason: 'incoming().topCount > existing().topCount prevents lowering record.',
  },
  {
    id: 10,
    name: 'Participants Count Inflation',
    targetPath: '/flashChallenges/2026-11-27_salawat',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    reason: 'participantsCount == existing().participantsCount + 1 and !exists(entry) required.',
  },
  {
    id: 11,
    name: 'Cross-User Entry Read/Write',
    targetPath: '/flashChallenges/2026-11-27_salawat/entries/victim_uid',
    operation: 'update',
    expectedResult: 'PERMISSION_DENIED',
    reason: 'request.auth.uid == userId isolates user entries.',
  },
  {
    id: 12,
    name: 'Timestamp Forgery & List Scraping',
    targetPath: '/flashChallenges',
    operation: 'list',
    expectedResult: 'PERMISSION_DENIED',
    reason: 'allow list: if false and incoming().updatedAt == request.time prevent scraping and clock forgery.',
  },
];
