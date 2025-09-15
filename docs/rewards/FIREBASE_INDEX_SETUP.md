# Firebase Index Creation Links

## Required Indexes for BBM Bucks

Based on the error in your logs, you need to create these indexes in Firebase Console:

### Index 1: Transaction History Query

**Collection:** `bbm_bucks_transactions`
**Fields:**

- `userId` (Ascending)
- `createdAt` (Descending)

**Direct Link:** https://console.firebase.google.com/v1/r/project/bbm-nativeapp/firestore/indexes?create_composite=Clxwcm9qZWN0cy9iYm0tbmF0aXZlYXBwL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9iYm1fYnVja3NfdHJhbnNhY3Rpb25zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI

### Index 2: Complex Query for Expiring BBM Bucks

**Collection:** `bbm_bucks_transactions`
**Fields:**

- `status` (Ascending)
- `type` (Ascending)
- `userId` (Ascending)
- `expiryDate` (Ascending)

**Direct Link:** https://console.firebase.google.com/v1/r/project/bbm-nativeapp/firestore/indexes?create_composite=Clxwcm9qZWN0cy9iYm0tbmF0aXZlYXBwL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9iYm1fYnVja3NfdHJhbnNhY3Rpb25zL2luZGV4ZXMvXxABGgoKBnN0YXR1cxABGggKBHR5cGUQARoKCgZ1c2VySWQQARoOCgpleHBpcnlEYXRlEAEaDAoIX19uYW1lX18QAQ

## How to Create:

1. Click on the direct links above OR
2. Go to Firebase Console → Your Project → Firestore Database → Indexes
3. Click "Create Index"
4. Add the fields as specified above

## Notes:

- Index creation can take several minutes
- The app will show warnings until indexes are active
- Both indexes are required for full BBM Bucks functionality
