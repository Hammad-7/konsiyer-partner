# SECURE ADMIN SYSTEM - Complete Implementation Guide

## Overview

This guide shows you how to use the secure admin system with Firebase Custom Claims.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Setup Instructions](#setup-instructions)
3. [Usage Examples](#usage-examples)
4. [Migration Guide](#migration-guide)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│  1. Firebase Authentication (JWT Token)                      │
│     ↓                                                         │
│  2. Custom Claims (in JWT, server-controlled)                │
│     ↓                                                         │
│  3. Backend Verification (Cloud Functions)                   │
│     ↓                                                         │
│  4. Firestore Security Rules (defense-in-depth)             │
└─────────────────────────────────────────────────────────────┘
```

### Authorization Flow

```
Frontend Component
       ↓
   AuthContext (displays UI based on custom claims)
       ↓
   Makes API Request (sends ID token)
       ↓
   Cloud Function (verifies token + custom claims)
       ↓
   Performs Operation (if authorized)
       ↓
   Returns Result
```

### What are Custom Claims?

Custom claims are **key-value pairs** stored in a user's JWT token:

```json
{
  "iss": "https://securetoken.google.com/your-project",
  "aud": "your-project",
  "auth_time": 1234567890,
  "user_id": "abc123",
  "sub": "abc123",
  "iat": 1234567890,
  "exp": 1234571490,
  "email": "user@example.com",

  // 👇 CUSTOM CLAIMS - These are what we use
  "admin": true,
  "superAdmin": false,
  "role": "admin"
}
```

**Why Custom Claims are Secure:**

1. ✅ Stored in JWT token (cryptographically signed by Firebase)
2. ✅ Cannot be modified by client
3. ✅ Set only by Admin SDK (server-side)
4. ✅ Automatically included in every authenticated request
5. ✅ No extra Firestore reads needed

---

## Setup Instructions

### Step 1: Deploy Backend Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies (if not already done)
pip install -r requirements.txt

# Deploy the new secure functions
cd ..
firebase deploy --only functions:check_admin_status,functions:set_admin_role,functions:init_super_admin
```

### Step 2: Set Environment Secret

```bash
# Set super admin initialization secret
firebase functions:config:set admin.init_secret="your-super-secret-key-here"

# Deploy again to apply config
firebase deploy --only functions:init_super_admin
```

### Step 3: Initialize Super Admin

**Option A: Using the Cloud Function (Recommended)**

```javascript
// Run this ONCE from browser console or a setup script
import { initializeSuperAdmin } from "./services/adminService.secure";

await initializeSuperAdmin("your-super-secret-key-here");
```

**Option B: Using Firebase CLI**

```bash
# Set custom claims directly
firebase auth:users:update GoWdiwdj6zUtlH6cZo2wla9GpYB2 \
  --custom-claims '{"superAdmin":true,"admin":true,"role":"super_admin"}'
```

**Option C: Using Python Script**

```python
# Run init_super_admin.py (already exists)
python3 functions/init_super_admin.py
```

### Step 4: Deploy Firestore Rules

```bash
# Deploy the updated security rules
firebase deploy --only firestore:rules
```

### Step 5: Update Frontend

Replace the old admin service import:

```javascript
// OLD ❌
import { isSuperAdmin, addAdmin } from "./services/adminService";

// NEW ✅
import {
  checkAdminStatus,
  promoteToAdmin,
} from "./services/adminService.secure";
```

### Step 6: Verify Setup

```javascript
// In browser console
const user = firebase.auth().currentUser;
const token = await user.getIdTokenResult();
console.log("Custom Claims:", token.claims);
// Should show: { admin: true, superAdmin: true, role: "super_admin" }
```

---

## Usage Examples

### Example 1: Check User Role in Component

```javascript
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

function AdminDashboard() {
  const { user, isSuperAdmin } = useAuth();

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* Show admin management only to super admin */}
      {isSuperAdmin && (
        <div>
          <h2>Admin Management</h2>
          <AdminManagement />
        </div>
      )}
    </div>
  );
}
```

### Example 2: Promote User to Admin

```javascript
import { promoteToAdmin } from "../services/adminService.secure";

async function handlePromoteUser(userId) {
  try {
    const result = await promoteToAdmin(userId);
    console.log(result.message); // "User promoted to admin"

    // Refresh user list
    loadUsers();
  } catch (error) {
    console.error("Failed to promote user:", error);
    alert("Error: " + error.message);
  }
}
```

### Example 3: Demote Admin to User

```javascript
import { demoteAdmin } from "../services/adminService.secure";

async function handleDemoteAdmin(userId) {
  try {
    const result = await demoteAdmin(userId);
    console.log(result.message); // "User demoted to regular user"

    // Refresh admin list
    loadAdmins();
  } catch (error) {
    console.error("Failed to demote admin:", error);
    alert("Error: " + error.message);
  }
}
```

### Example 4: Protected Route

```javascript
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function SuperAdminRoute({ children }) {
  const { user, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

// Usage in App.jsx
<Route
  path="/admin/manage"
  element={
    <SuperAdminRoute>
      <AdminManagement />
    </SuperAdminRoute>
  }
/>;
```

### Example 5: Call Custom Protected Endpoint

```javascript
import { callProtectedEndpoint } from "../services/adminService.secure";

async function fetchAdminAnalytics() {
  try {
    const data = await callProtectedEndpoint("get_admin_analytics", {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });

    console.log("Analytics:", data);
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
  }
}
```

### Example 6: Conditional UI Based on Role

```javascript
function UserProfile({ userId }) {
  const { user, isAdmin, isSuperAdmin } = useAuth();

  return (
    <div>
      <h2>User Profile</h2>

      {/* Regular users see basic info */}
      <UserBasicInfo userId={userId} />

      {/* Admins see additional info */}
      {isAdmin && <UserAdminInfo userId={userId} />}

      {/* Super admins see management options */}
      {isSuperAdmin && <UserManagementActions userId={userId} />}
    </div>
  );
}
```

### Example 7: Backend Function with Custom Claims Check

```python
from firebase_functions import https_fn
from firebase_admin import auth as admin_auth

@https_fn.on_request()
def get_sensitive_data(req: https_fn.Request):
    """Example protected endpoint"""

    # Get ID token from request
    body = req.get_json()
    id_token = body.get('idToken')

    # Verify token
    try:
        decoded_token = admin_auth.verify_id_token(id_token)
        uid = decoded_token['uid']

        # Check custom claims
        custom_claims = decoded_token.get('claims', {})
        is_admin = custom_claims.get('admin') or custom_claims.get('superAdmin')

        if not is_admin:
            return {'error': 'Insufficient permissions'}, 403

        # Perform admin operation
        data = fetch_sensitive_data(uid)

        return {'success': True, 'data': data}, 200

    except Exception as e:
        return {'error': str(e)}, 401
```

---

## Migration Guide

### Migrating from Firestore-based Roles

If you're currently using Firestore to store roles, follow these steps:

#### Step 1: Identify Current Admins

```javascript
// Get all current admins from Firestore
const db = firebase.firestore();
const adminsSnapshot = await db
  .collection("users")
  .where("role", "==", "admin")
  .get();

const adminIds = adminsSnapshot.docs.map((doc) => doc.id);
console.log("Current admins:", adminIds);
```

#### Step 2: Set Custom Claims for Existing Admins

```python
# Python script to migrate admins
from firebase_admin import auth, firestore
import firebase_admin

firebase_admin.initialize_app()
db = firestore.client()

# Get all admins from Firestore
admins = db.collection('users').where('role', '==', 'admin').get()

for admin in admins:
    uid = admin.id
    data = admin.to_dict()

    # Set custom claims
    is_super_admin = data.get('isSuperAdmin', False)

    claims = {
        'admin': True,
        'role': 'super_admin' if is_super_admin else 'admin'
    }

    if is_super_admin:
        claims['superAdmin'] = True

    auth.set_custom_claims(uid, claims)
    print(f'Set custom claims for {uid}: {claims}')

print('Migration complete!')
```

#### Step 3: Verify Migration

```javascript
// Check that custom claims are set
const user = firebase.auth().currentUser;
const tokenResult = await user.getIdTokenResult(true); // Force refresh

console.log("Custom Claims:", tokenResult.claims);
// Should show admin/superAdmin claims
```

#### Step 4: Update Frontend Code

Replace all Firestore role checks with custom claims:

```javascript
// BEFORE ❌
const userDoc = await db.collection("users").doc(uid).get();
const isAdmin = userDoc.data()?.isAdmin;

// AFTER ✅
const { isAdmin } = useAuth(); // From AuthContext
```

#### Step 5: Clean Up Firestore (Optional)

```javascript
// Remove role fields from Firestore (optional)
// Keep them for historical/logging purposes if needed
const db = firebase.firestore();
const batch = db.batch();

const usersSnapshot = await db.collection("users").get();
usersSnapshot.docs.forEach((doc) => {
  batch.update(doc.ref, {
    role: firestore.FieldValue.delete(),
    isAdmin: firestore.FieldValue.delete(),
    isSuperAdmin: firestore.FieldValue.delete(),
  });
});

await batch.commit();
console.log("Cleaned up Firestore role fields");
```

---

## Testing

### Test 1: Verify Token Contains Custom Claims

```javascript
// In browser console
const user = firebase.auth().currentUser;
const token = await user.getIdTokenResult(true);

console.log("User ID:", user.uid);
console.log("Custom Claims:", token.claims);
console.log("Is Admin:", token.claims.admin);
console.log("Is Super Admin:", token.claims.superAdmin);
console.log("Role:", token.claims.role);
```

### Test 2: Test Promotion/Demotion

```javascript
import {
  promoteToAdmin,
  demoteAdmin,
  checkAdminStatus,
} from "./services/adminService.secure";

// Test promoting a user
const testUserId = "test_user_123";

// Promote
await promoteToAdmin(testUserId);

// Check status
const status = await checkAdminStatus();
console.log("After promotion:", status);

// Demote
await demoteAdmin(testUserId);

// Check status again
const status2 = await checkAdminStatus();
console.log("After demotion:", status2);
```

### Test 3: Test Security Rules

```javascript
// Test 1: Regular user cannot read role fields
// Should fail with permission denied
const db = firebase.firestore();
try {
  const adminDoc = await db.collection("users").doc("other_user_id").get();
  console.log("❌ SECURITY FAIL: User could read other user data");
} catch (error) {
  console.log("✅ SECURITY PASS: Permission denied as expected");
}

// Test 2: Regular user cannot set role fields
// Should fail with permission denied
try {
  await db.collection("users").doc(currentUser.uid).update({
    role: "admin",
  });
  console.log("❌ SECURITY FAIL: User could set admin role");
} catch (error) {
  console.log("✅ SECURITY PASS: Permission denied as expected");
}

// Test 3: Admin can read other users
// Should succeed
try {
  const userDoc = await db.collection("users").doc("other_user_id").get();
  console.log("✅ ADMIN ACCESS: Can read other users");
} catch (error) {
  console.log("❌ ADMIN FAIL: Could not read user data");
}
```

### Test 4: Test Token Refresh

```javascript
// Custom claims are cached in the token
// Test that refresh updates them

// Before promotion
let token = await user.getIdTokenResult();
console.log("Before:", token.claims.admin); // false

// Promote user
await promoteToAdmin(user.uid);

// Token still cached
token = await user.getIdTokenResult();
console.log("Still cached:", token.claims.admin); // false (cached)

// Force refresh
token = await user.getIdTokenResult(true);
console.log("After refresh:", token.claims.admin); // true
```

---

## Troubleshooting

### Issue 1: Custom Claims Not Showing Up

**Problem:** After setting custom claims, they don't appear in the token.

**Solution:**

```javascript
// Force token refresh
const token = await firebase.auth().currentUser.getIdTokenResult(true);
console.log(token.claims);

// Or sign out and sign back in
await firebase.auth().signOut();
await firebase.auth().signInWithEmailAndPassword(email, password);
```

### Issue 2: "Insufficient Permissions" Error

**Problem:** User gets 403 error even though they're admin.

**Solution:**

1. Verify custom claims are set:

   ```javascript
   const token = await user.getIdTokenResult(true);
   console.log("Admin claim:", token.claims.admin);
   ```

2. Check backend verification:

   ```python
   # In Cloud Function
   print(f"Decoded token: {decoded_token}")
   print(f"Custom claims: {decoded_token.get('claims')}")
   ```

3. Ensure token is sent correctly:
   ```javascript
   // Make sure you're getting FRESH token
   const idToken = await user.getIdToken(true);
   ```

### Issue 3: Security Rules Denying Access

**Problem:** Firestore operations fail with permission denied.

**Solution:**

1. Check if custom claims are in token:

   ```javascript
   const token = await user.getIdTokenResult(true);
   console.log("Token claims:", token.claims);
   ```

2. Test security rules in Firebase Console:

   - Go to Firestore Database
   - Click "Rules" tab
   - Click "Rules Playground"
   - Test with your user's UID

3. Verify rules are deployed:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Issue 4: Super Admin Cannot Perform Actions

**Problem:** Super admin gets permission denied.

**Solution:**

1. Verify super admin claims:

   ```javascript
   const token = await user.getIdTokenResult(true);
   console.log("Super admin:", token.claims.superAdmin); // Should be true
   ```

2. Re-initialize if needed:
   ```bash
   firebase auth:users:update GoWdiwdj6zUtlH6cZo2wla9GpYB2 \
     --custom-claims '{"superAdmin":true,"admin":true,"role":"super_admin"}'
   ```

### Issue 5: Token Refresh Not Working

**Problem:** Custom claims don't update after role change.

**Solution:**

1. Token refresh is automatic every 55 minutes
2. Force refresh immediately:

   ```javascript
   const token = await user.getIdTokenResult(true);
   ```

3. Or sign out and back in:
   ```javascript
   await firebase.auth().signOut();
   await firebase.auth().signInWithEmailAndPassword(email, password);
   ```

---

## Security Best Practices

### ✅ DO

1. **Always verify tokens on the backend**

   ```python
   decoded_token = admin_auth.verify_id_token(id_token)
   ```

2. **Use custom claims for authorization**

   ```javascript
   const isAdmin = token.claims.admin;
   ```

3. **Force token refresh after role changes**

   ```javascript
   await user.getIdTokenResult(true);
   ```

4. **Log all admin operations**

   ```python
   logger.info(f"Admin {uid} performed action X")
   ```

5. **Use Firestore rules as defense-in-depth**
   ```javascript
   function isAdmin() {
     return request.auth.token.admin == true;
   }
   ```

### ❌ DON'T

1. **Don't check roles in Firestore for authorization**

   ```javascript
   // WRONG ❌
   const userDoc = await db.collection('users').doc(uid).get();
   if (userDoc.data().isAdmin) { ... }
   ```

2. **Don't trust client-sent role information**

   ```javascript
   // WRONG ❌
   const { role } = req.body; // Client can lie!
   ```

3. **Don't store sensitive data in custom claims**

   ```javascript
   // WRONG ❌
   {
     apiKey: "secret123";
   } // Custom claims are in JWT, visible to client
   ```

4. **Don't forget to refresh tokens**
   ```javascript
   // WRONG ❌
   const token = await user.getIdTokenResult(); // Uses cached token
   // RIGHT ✅
   const token = await user.getIdTokenResult(true); // Forces refresh
   ```

---

## Summary

✅ **You now have:**

- Secure backend with custom claims
- Protected frontend with AuthContext
- Firestore rules using custom claims
- Migration path from old system
- Complete testing guide

✅ **Security guarantees:**

- Roles stored in tamper-proof JWT
- All authorization on backend
- No way for clients to escalate privileges
- Audit trail of all operations

✅ **Next steps:**

1. Deploy backend functions
2. Initialize super admin
3. Deploy security rules
4. Update frontend components
5. Test thoroughly
6. Monitor logs

🎉 **Your admin system is now production-ready!**
