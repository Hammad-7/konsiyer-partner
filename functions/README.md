Firebase Functions for Shopify store verification (simplified)

This folder contains Python Cloud Functions used to verify that a logged-in Firebase user has access to a specific Shopify shop. The functions do NOT exchange the temporary code for an access token — they only verify ownership via Shopify's HMAC and a Firestore-backed state.

Environment variables (set in Firebase Functions config or runtime env):

- SHOPIFY_API_KEY: Shopify App API key
- SHOPIFY_API_SECRET: Shopify App API secret (used for HMAC verification)
- SHOPIFY_SCOPES: Minimal scopes, e.g. "read_products"
- SHOPIFY_REDIRECT_URI: Full redirect URL for the callback function (must be whitelisted in Shopify App settings)
- FRONTEND_URL: Optional. If set, callback will redirect to this origin + /dashboard?shop=...

Endpoints implemented (HTTP Cloud Functions):

- /shopify_auth — Accepts POST with JSON { shop } or GET with query param. Creates a Firestore-backed state document and redirects the browser to Shopify OAuth authorize URL with the state id.

- /shopify_callback — Receives Shopify redirect. Verifies Shopify HMAC, marks the state doc at `shopify_states/{state}` as `verified: true`, and redirects the user back to the frontend dashboard with `?shop=...&state=...`.

- /shopify_finalize — Accepts POST with JSON { idToken, state }. The frontend should call this after redirecting back from Shopify. This verifies the Firebase ID token, ensures the state doc is verified, writes `users/{uid}/shops/{shopDomain} = { verified: true, verified_at: <timestamp> }`, and deletes the state doc.

Testing locally:

1. Deploy or use `firebase emulators:start --only functions`.
2. Ensure env vars are set for the functions emulator, or that Firebase project has them configured.
3. From the frontend, call your function endpoint `/shopify_auth` with the `shop`. The function will redirect the browser to Shopify. After approving in Shopify, Shopify will redirect back to `/shopify_callback` which will mark the state doc as verified in Firestore and redirect the browser to `/dashboard?shop=...&state=...`. The frontend should then call `/shopify_finalize` with the user's ID token and the state id to complete the association and write the shop under the authenticated user's Firestore document.

Notes:

- The code intentionally does not exchange the `code` parameter for an access token.
- The state is stored server-side in Firestore (collection `shopify_states`) rather than being signed.
- Firestore writes use a subcollection `users/{uid}/shops/{shopDomain}` with fields `{ verified: true, verified_at: <timestamp> }`.
