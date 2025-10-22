# 🚀 Quick Start: Secure Admin System

## 1️⃣ Deploy Backend (5 minutes)

```bash
# Set secret for super admin initialization
firebase functions:config:set admin.init_secret="YOUR-SECRET-KEY-HERE"

# Deploy Cloud Functions
firebase deploy --only functions:check_admin_status,functions:set_admin_role,functions:init_super_admin

# Deploy Security Rules
firebase deploy --only firestore:rules
```

## 2️⃣ Initialize Super Admin (1 minute)

**Option A: Using cURL (Recommended)**

```bash
curl -X POST https://us-central1-sharp-footing-314502.cloudfunctions.net/init_super_admin \
  -H "Content-Type: application/json" \
  -d '{"secret":"konsiyer-super-admin-2025"}'
```

**Option B: Using Browser Console**

```javascript
// In browser console
await fetch(
  "https://us-central1-sharp-footing-314502.cloudfunctions.net/init_super_admin",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: "konsiyer-super-admin-2025" }),
  }
)
  .then((r) => r.json())
  .then(console.log);
```

**Note:** The default secret is `konsiyer-super-admin-2025`. To change it:

```bash
firebase functions:config:set admin.init_secret="your-custom-secret"
firebase deploy --only functions:init_super_admin
```

## 3️⃣ Verify Setup (2 minutes)

```javascript
// Sign in as super admin
await firebase.auth().signInWithEmailAndPassword(email, password);

// Check custom claims
const user = firebase.auth().currentUser;
const token = await user.getIdTokenResult(true);

console.log("✅ Setup verification:");
console.log("User ID:", user.uid);
console.log("Is Admin:", token.claims.admin); // Should be true
console.log("Is Super Admin:", token.claims.superAdmin); // Should be true
console.log("Role:", token.claims.role); // Should be "super_admin"
```

## 4️⃣ Use in Your App (Ready to go!)

### In Components

```javascript
import { useAuth } from "./contexts/AuthContext";

function MyComponent() {
  const { user, isAdmin, isSuperAdmin } = useAuth();

  return (
    <div>
      {isSuperAdmin && <AdminManagementPanel />}
      {isAdmin && <AdminTools />}
    </div>
  );
}
```

### Promote/Demote Users

```javascript
import { promoteToAdmin, demoteAdmin } from "./services/adminService";

// Promote user to admin
await promoteToAdmin("user_id_here");

// Demote admin to user
await demoteAdmin("admin_id_here");
```

### Protected Routes

```javascript
<Route
  path="/admin"
  element={
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  }
/>
```

---

## 📋 Common Commands

### Check User's Custom Claims

```javascript
// In browser console (user must be signed in)
const token = await firebase.auth().currentUser.getIdTokenResult(true);
console.log("Custom Claims:", token.claims);
```

### Promote User to Admin

```javascript
// Use the frontend service
import { promoteToAdmin } from "./services/adminService";
await promoteToAdmin("USER_ID");
```

### Remove Admin Access

```javascript
// Use the frontend service
import { demoteAdmin } from "./services/adminService";
await demoteAdmin("USER_ID");
```

### View Function Logs

```bash
firebase functions:log --only check_admin_status,set_admin_role
```

---

## 🔒 Security Checklist

- [x] Custom claims used (not Firestore)
- [x] Backend verifies all requests
- [x] Security rules block role field writes
- [x] Super admin UID hardcoded in backend only
- [x] Token refresh every 55 minutes
- [x] All operations logged
- [x] Cannot demote super admin

---

## 📚 Key Files

| File                           | Purpose                                             |
| ------------------------------ | --------------------------------------------------- |
| `functions/main.py`            | Backend Cloud Functions (includes init_super_admin) |
| `src/services/adminService.js` | Frontend service for admin operations               |
| `src/contexts/AuthContext.jsx` | React context with custom claims                    |
| `firestore.rules`              | Security rules using custom claims                  |
| `SECURE_ADMIN_GUIDE.md`        | Complete implementation guide                       |
| `QUICK_START.md`               | This file                                           |

---

## ⚡ API Reference

### Backend Endpoints

| Endpoint              | Method | Auth              | Purpose                       |
| --------------------- | ------ | ----------------- | ----------------------------- |
| `/check_admin_status` | POST   | User Token        | Check user's admin status     |
| `/set_admin_role`     | POST   | Super Admin Token | Promote/demote users          |
| `/init_super_admin`   | POST   | Secret Key        | Initialize super admin (once) |

### Frontend Functions

| Function              | Returns                         | Purpose                     |
| --------------------- | ------------------------------- | --------------------------- |
| `checkAdminStatus()`  | `{isAdmin, isSuperAdmin, role}` | Check current user's status |
| `promoteToAdmin(uid)` | `{success, message}`            | Make user an admin          |
| `demoteAdmin(uid)`    | `{success, message}`            | Remove admin privileges     |

---

## 🐛 Troubleshooting

### Problem: Custom claims not showing

**Solution:**

```javascript
// Force token refresh
await firebase.auth().currentUser.getIdTokenResult(true);
```

### Problem: Permission denied errors

**Solution:**

```bash
# Re-deploy security rules
firebase deploy --only firestore:rules

# Verify custom claims
firebase auth:users:get YOUR_USER_ID
```

### Problem: Function not found

**Solution:**

```bash
# Re-deploy functions
firebase deploy --only functions
```

---

## 💡 Pro Tips

1. **Always force refresh after role changes:**

   ```javascript
   await user.getIdTokenResult(true);
   ```

2. **Check logs for security issues:**

   ```bash
   firebase functions:log --limit 100
   ```

3. **Test security rules before deploying:**

   - Use Firebase Console's Rules Playground
   - Test with different user roles

4. **Monitor admin operations:**
   - Check Cloud Functions logs
   - Set up alerts for unauthorized access

---

## 📞 Support

- **Complete Guide:** See `SECURE_ADMIN_GUIDE.md`
- **Backend Code:** See `functions/main.py`
- **Frontend Service:** See `src/services/adminService.js`
- **Auth Context:** See `src/contexts/AuthContext.jsx`

---

**🎉 Your admin system is production-ready and secure!**
