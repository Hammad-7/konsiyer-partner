# Quick Start Guide - Konsiyer Enterprise Dashboard

## 🚀 Getting Started

### 1. Install Dependencies (if not already done)

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Open in Browser

Visit: `http://localhost:5173` (or the URL shown in terminal)

---

## 🧭 Navigation Guide

### Login Flow

1. **Login** at `/` with your credentials
2. **Connect Shop** (if first time) at `/connect`
3. **Redirected to Dashboard** at `/dashboard`

### Main Routes

- **Dashboard**: `/dashboard` - Overview with KPIs and charts
- **Invoices**: `/invoices` - Manage all invoices
- **Invoice Detail**: `/invoices/inv_001` - View specific invoice
- **Payments**: `/payments` - Same as invoices (customizable)
- **Shops**: `/shops` - Manage connected shops
- **Settings**: `/settings` - Configure preferences

---

## 🎮 Testing Features

### Test Dashboard

1. Go to `/dashboard`
2. **Verify:**
   - ✅ 4 KPI cards display with animations
   - ✅ Revenue chart shows with Day/Week/Month tabs
   - ✅ Recent invoices section shows 3 invoices
   - ✅ Quick actions sidebar on right
   - ✅ Recent activity feed
   - ✅ Payment methods display

### Test Invoices Page

1. Go to `/invoices`
2. **Try:**
   - ✅ Switch between All/Pending/Paid tabs
   - ✅ Search for invoice (e.g., "2025-001")
   - ✅ Select multiple invoices
   - ✅ Click "Download" bulk action
   - ✅ Click "Pay All" bulk action
   - ✅ Click ⋮ menu on any invoice
   - ✅ Select "View Details"

### Test Invoice Detail

1. Go to `/invoices/inv_001`
2. **Verify:**
   - ✅ Invoice preview displays correctly
   - ✅ Line items table shows
   - ✅ Payment widget appears (for pending)
   - ✅ Click "Download" button
   - ✅ Click "Print" button
   - ✅ Click "Pay €1,250.50" button
   - ✅ Watch loading animation
   - ✅ See success toast
   - ✅ Status updates to "Paid"

### Test Payment Simulation

1. Go to pending invoice: `/invoices/inv_001?pay=true`
2. **Test:**
   - ✅ Select payment method
   - ✅ Switch tabs (Bank/Card/PayPal)
   - ✅ Click "Pay" button
   - ✅ See 2-second loading state
   - ✅ See success toast
   - ✅ Payment widget updates

### Test Settings

1. Go to `/settings`
2. **Try Each Tab:**
   - **Company:**
     - ✅ Edit company name
     - ✅ Update address
     - ✅ Change bank details
     - ✅ Click "Save Changes"
     - ✅ See success toast
   - **Payment:**
     - ✅ Change preferred method
     - ✅ Update minimum payout
     - ✅ Toggle auto-withdraw
     - ✅ Save and see toast
   - **Notifications:**
     - ✅ Toggle email notifications
     - ✅ Toggle push notifications
     - ✅ Save preferences

### Test Shops Page

1. Go to `/shops`
2. **Verify:**
   - ✅ Shop cards display
   - ✅ Stats show correctly
   - ✅ "Connect New Shop" button visible

---

## 📱 Mobile Testing

### Resize Browser to Mobile Width (<768px)

1. **Check:**
   - ✅ Sidebar disappears
   - ✅ Bottom navigation bar appears
   - ✅ Hamburger menu in top bar
   - ✅ All layouts single column
   - ✅ Tables scroll horizontally
   - ✅ Cards stack vertically

### Test Mobile Navigation

1. **Bottom Nav:**

   - ✅ Tap Dashboard icon
   - ✅ Tap Invoices icon
   - ✅ Tap Payments icon
   - ✅ Tap Shops icon
   - ✅ Tap Settings icon
   - ✅ Active tab highlighted

2. **Hamburger Menu:**
   - ✅ Tap menu icon (top left)
   - ✅ Sidebar slides in
   - ✅ Tap outside to close
   - ✅ Tap X to close

---

## 🎨 Animation Testing

### Page Transitions

- ✅ Navigate between pages - smooth fade in
- ✅ Dashboard cards - staggered animation
- ✅ KPI numbers - count-up effect
- ✅ Hover over cards - subtle lift

### Interactive Elements

- ✅ Sidebar collapse/expand - smooth width transition
- ✅ Tab switching - content fade in/out
- ✅ Button clicks - ripple effect
- ✅ Toast notifications - slide in from top

---

## 🧪 Mock Data Tests

### Invoice IDs to Test:

- `inv_001` - Pending invoice (€1,250.50)
- `inv_002` - Paid invoice (€980.00)
- `inv_003` - Pending invoice (€2,150.75)
- `inv_004` - Paid invoice (€1,450.00)
- `inv_005` - Paid invoice (€875.25)
- `inv_006` - Pending invoice (€3,200.00)

### Search Queries to Try:
x
- "2025-001" - Find by invoice number
- "September" - Find by description
- "TechNova" - Find by shop name
- "Bonus" - Find specific type

---

## 🔍 Browser DevTools Testing

### Check Console

```javascript
// Should see these log messages:
"📊 Loading affiliate stats..."
"📊 Affiliate Stats Result: {...}"
"✅ Finalization completed successfully" (after shop connection)
```

### Check Network Tab

- Affiliate stats API call to Firebase function
- Should see successful responses

### Check Responsive Design

- Toggle device toolbar (Cmd/Ctrl + Shift + M)
- Test: iPhone SE, iPad, Desktop
- Verify layouts adapt correctly

---

## 🎯 User Flow Tests

### Complete Invoice Payment Flow

1. Login → Dashboard
2. See pending invoice in recent list
3. Click "Pay Now"
4. Redirect to invoice detail
5. Review invoice items
6. Select payment method
7. Click "Pay €XXX"
8. See loading state
9. Success toast appears
10. Status updates to "Paid"
11. Navigate back to invoices
12. Verify status changed in list

### Complete Settings Update Flow

1. Login → Dashboard
2. Click user avatar menu
3. Select "Account Settings"
4. Redirect to settings
5. Switch to "Company" tab
6. Edit company name
7. Click "Save Changes"
8. See success toast
9. Refresh page
10. Verify form shows saved values (in mock)

---

## 🐛 Known Behaviors (Not Bugs)

1. **Mock Data Resets:** All mock data resets on page refresh (this is intentional)
2. **PDF Download:** Shows toast but doesn't actually download (placeholder)
3. **Email Button:** Shows "coming soon" toast (placeholder)
4. **Filter Button:** No filter dialog yet (placeholder)
5. **Connect New Shop:** No implementation yet (placeholder)

---

## ✅ Success Criteria Checklist

### Dashboard

- [ ] Loads without errors
- [ ] Shows 4 KPI cards
- [ ] Chart renders with data
- [ ] Tabs switch correctly
- [ ] Recent invoices display
- [ ] Quick actions work

### Invoices

- [ ] Table renders all invoices
- [ ] Tabs filter correctly
- [ ] Search works
- [ ] Bulk selection works
- [ ] Actions menu opens
- [ ] Navigation to detail works

### Invoice Detail

- [ ] Invoice preview shows
- [ ] Line items display
- [ ] Payment widget works
- [ ] Buttons trigger toasts
- [ ] Payment simulation works

### Settings

- [ ] All three tabs load
- [ ] Forms are populated
- [ ] Toggles work
- [ ] Save triggers toasts
- [ ] Validation works

### Mobile

- [ ] Bottom nav appears
- [ ] Sidebar slides in/out
- [ ] All pages responsive
- [ ] Touch targets large enough

---

## 🎉 Ready to Ship!

If all tests pass, your dashboard is fully functional and ready for:

1. Real API integration
2. Production deployment
3. User testing
4. Feature additions

**Need help?** Check `IMPLEMENTATION_GUIDE.md` for detailed documentation.
