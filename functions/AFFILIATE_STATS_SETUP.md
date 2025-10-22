# Firebase Functions - Affiliate Stats Setup

## Security Configuration

To use the `fetch_affiliate_stats` function securely, you need to set up environment variables instead of using the firebase-key.json file directly.

### Setting Up Environment Variables

1. **For local development**, create a `.env` file in the `functions` directory:

   ```bash
   cp .env.example .env
   ```

2. **Fill in the values** from your `firebase-key.json` file:

   ```env
   EXTERNAL_FIREBASE_PROJECT_ID=colab-369516
   EXTERNAL_FIREBASE_PRIVATE_KEY_ID=1c866ecb6a0f3b185776a69c6eab8603b9e6fb76
   EXTERNAL_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDdPgDo8LE0YbYQ\n...\n-----END PRIVATE KEY-----"
   EXTERNAL_FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@colab-369516.iam.gserviceaccount.com
   EXTERNAL_FIREBASE_CLIENT_ID=113454506616323627221
   ```

3. **For production deployment**, use Firebase Functions environment configuration:
   ```bash
   firebase functions:config:set \
     external_firebase.project_id="colab-369516" \
     external_firebase.private_key_id="1c866ecb6a0f3b185776a69c6eab8603b9e6fb76" \
     external_firebase.private_key="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----" \
     external_firebase.client_email="firebase-adminsdk-fbsvc@colab-369516.iam.gserviceaccount.com" \
     external_firebase.client_id="113454506616323627221"
   ```

### Security Benefits

- **No sensitive data in source code**: Service account keys are stored as environment variables
- **Access control**: Only authenticated users with verified shops can access affiliate stats
- **Shop isolation**: Users can only access data for their own verified shops
- **Audit trail**: All access attempts are logged

### API Usage

The `fetch_affiliate_stats` function can be called with:

```javascript
const response = await fetch("YOUR_CLOUD_FUNCTION_URL/fetch_affiliate_stats", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    idToken: await firebaseUser.getIdToken(), // Firebase ID token
  }),
});

const affiliateStats = await response.json();
```

**Note**: The function automatically determines which shop's data to return based on the authenticated user. No shop parameter is needed or accepted for security reasons.

### Response Format

```json
{
  "shop_name": "example-shop",
  "shop_full_name": "example-shop.myshopify.com",
  "total_checkout_events": 5,
  "events": [
    {
      "event_id": "checkout_completed_12345",
      "timestamp": 1696800000,
      "order_id": "12345",
      "value": 99.99,
      "currency": "USD"
    }
  ]
}
```

If no affiliate data is found for the user's shop:

```json
{
  "shop_name": "example-shop",
  "shop_full_name": "example-shop.myshopify.com",
  "total_checkout_events": 0,
  "events": [],
  "message": "No affiliate data found for this shop"
}
```

### Removing firebase-key.json

After setting up environment variables, you should:

1. **Remove the firebase-key.json file** from your repository:

   ```bash
   git rm functions/firebase-key.json
   ```

2. **Add it to .gitignore**:

   ```
   functions/firebase-key.json
   functions/.env
   ```

3. **Store the key securely** in your password manager or secure vault for backup purposes.

## Deployment

1. Install dependencies:

   ```bash
   cd functions
   pip install -r requirements.txt
   ```

2. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

## Testing

To test the function locally, ensure your `.env` file is properly configured and run:

```bash
firebase functions:shell
```

Then call the function with a valid Firebase ID token:

```javascript
fetch_affiliate_stats({
  data: {
    idToken: "YOUR_VALID_FIREBASE_ID_TOKEN",
  },
});
```

**Note**: You need a valid Firebase ID token from an authenticated user who has a verified shop connection.
