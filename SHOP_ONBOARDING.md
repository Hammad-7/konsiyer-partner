# Shop Onboarding Implementation

This document outlines the implementation of the shop connection onboarding flow that was added to the Konsiyer Enterprise dashboard.

## Overview

The onboarding flow allows users to connect their shops to the platform through two methods:

1. **Shopify Store** - Automatic integration using OAuth
2. **Other Shops** - Manual upload using XML/CSV files

## Architecture

### Components Structure

```
src/
├── components/
│   └── onboarding/
│       ├── ConnectShopPage.jsx        # Main selection page
│       ├── ShopifyConnectPage.jsx     # Shopify connection flow
│       └── OtherShopConnectPage.jsx   # Other shops connection flow
├── contexts/
│   └── ShopContext.jsx                # Shop state management
└── services/
    └── shopService.js                 # Firestore utilities
```

### Data Flow

1. **User Authentication** → AuthContext (existing)
2. **Shop Connection State** → ShopContext (new)
3. **Firestore Operations** → shopService.js (new)
4. **Backend Integration** → Firebase Functions (existing)

## Features Implemented

### ✅ User Interface

- **Responsive design** with Tailwind CSS
- **Two connection options** with distinct styling
- **Form validation** with real-time feedback
- **File upload** with drag-and-drop support
- **Loading states** and error handling
- **Internationalization** support (English/Turkish)

### ✅ Shopify Integration

- **Domain validation** (myshopify.com format)
- **OAuth flow** integration with existing backend
- **State management** for connection process
- **Redirect handling** after successful OAuth

### ✅ Other Shops Support

- **File upload** for XML/CSV files
- **File validation** (type, size, format)
- **Basic shop information** storage
- **Future-ready** for file processing

### ✅ User Experience

- **Returning user logic** - skip onboarding if shop already connected
- **Dashboard integration** - show connected shops
- **Navigation flow** - seamless routing between pages
- **Success/error messaging** - clear feedback

## Implementation Details

### 1. Shop Connection Context

The `ShopContext` manages all shop-related state:

```javascript
const {
  connectedShops, // Array of user's connected shops
  hasConnectedShops, // Boolean flag
  loading, // Loading state
  connecting, // Connection in progress
  connectShopify, // Function to connect Shopify
  connectOtherShop, // Function to connect other shops
  fetchConnectedShops, // Refresh shop list
} = useShop();
```

### 2. Firestore Structure

Shop data is stored under each user:

```
users/{userId}/shops/{shopName}
├── verified: boolean
├── shopType: 'shopify' | 'other'
├── connectedAt: timestamp
├── userEmail: string
└── [additional shop-specific data]
```

### 3. Routes Added

- `/connect` - Main onboarding page
- `/connect/shopify` - Shopify connection flow
- `/connect/other` - Other shops connection flow

### 4. Backend Integration

The Shopify flow integrates with existing Firebase Functions:

- `shopify_auth` - Initiates OAuth flow
- `shopify_callback` - Handles OAuth callback
- `shopify_finalize` - Completes connection

## Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Backend Configuration
VITE_BACKEND_URL=https://your-project-region-your-project-id.cloudfunctions.net
```

### Firebase Functions Setup

The existing Python functions in `/functions/main.py` handle:

- Shopify OAuth initialization
- HMAC verification
- State management
- Connection finalization

## Usage Flow

### New User

1. Login → Dashboard
2. Dashboard detects no connected shops
3. Redirects to `/connect`
4. User selects connection method
5. Completes connection process
6. Returns to dashboard with connected shop

### Returning User

1. Login → Dashboard
2. Dashboard detects connected shops
3. Shows welcome message and shop list
4. Full dashboard functionality available

## Localization

All UI text is internationalized:

```javascript
// English
{
  "shop": {
    "connectTitle": "Connect your shop",
    "shopifyStore": "Shopify Store",
    "shopifyDescription": "Connect your Shopify store automatically.",
    // ... more translations
  }
}

// Turkish
{
  "shop": {
    "connectTitle": "Mağazanızı bağlayın",
    "shopifyStore": "Shopify Mağazası",
    "shopifyDescription": "Shopify mağazanızı otomatik olarak bağlayın.",
    // ... more translations
  }
}
```

## Security Considerations

- **Authentication required** for all shop operations
- **Input validation** for shop domains and file uploads
- **HMAC verification** for Shopify callbacks
- **File type/size limits** for uploads
- **User isolation** - users can only see their own shops

## Future Enhancements

1. **File Processing** - Parse XML/CSV and extract product data
2. **Shop Management** - Edit/remove connected shops
3. **Multiple Shopify Stores** - Support connecting multiple stores
4. **Data Synchronization** - Real-time sync with shop data
5. **Analytics** - Track connection success rates

## Testing

To test the implementation:

1. **Set up environment** variables for backend URL
2. **Deploy Firebase Functions** with Shopify credentials
3. **Create test Shopify store** or use development store
4. **Test both connection flows** (Shopify and Other)
5. **Verify Firestore** data storage
6. **Test returning user** behavior

## Troubleshooting

### Common Issues

1. **Backend URL not configured**

   - Set `VITE_BACKEND_URL` in `.env` file

2. **Shopify OAuth fails**

   - Verify `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET` in Functions
   - Check `SHOPIFY_REDIRECT_URI` matches deployed URL

3. **Firestore permissions**

   - Ensure user has read/write access to their shops subcollection

4. **File upload issues**
   - Check file size limits (10MB max)
   - Verify file types (.xml, .csv only)

## Code Quality

The implementation follows best practices:

- **Separation of concerns** - UI, logic, and data layers
- **Error handling** - Comprehensive error states
- **Loading states** - User feedback during async operations
- **Responsive design** - Works on all device sizes
- **Accessibility** - Proper ARIA labels and keyboard navigation
- **Performance** - Optimized re-renders and API calls

This implementation provides a solid foundation for shop connections that can be extended based on business requirements.
