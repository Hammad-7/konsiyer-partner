# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn
from firebase_functions.options import set_global_options
from firebase_admin import initialize_app, auth as admin_auth, firestore, credentials
import firebase_admin

import os
import hmac
import hashlib
import secrets
import urllib.parse
import re
import logging
import json
import requests

# Load environment variables from .env file if dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # dotenv not available, environment variables should be set externally
    pass

# For cost control, you can set the maximum number of containers that can be
# running at the same time. This helps mitigate the impact of unexpected
# traffic spikes by instead downgrading performance. This limit is a per-function
# limit. You can override the limit for each function using the max_instances
# parameter in the decorator, e.g. @https_fn.on_request(max_instances=5).
set_global_options(max_instances=10)

# Initialize Firebase Admin SDK (idempotent)
if not firebase_admin._apps:
	initialize_app()

# Load environment variables
SHOPIFY_API_KEY = os.environ.get("SHOPIFY_API_KEY")
SHOPIFY_API_SECRET = os.environ.get("SHOPIFY_API_SECRET")
SHOPIFY_SCOPES = os.environ.get("SHOPIFY_SCOPES", "read_products")
SHOPIFY_REDIRECT_URI = os.environ.get("SHOPIFY_REDIRECT_URI")
FRONTEND_URL = os.environ.get("FRONTEND_URL")  # optional: full frontend origin

# External Firebase Configuration (for affiliate stats)
EXTERNAL_FIREBASE_PROJECT_ID = os.environ.get("EXTERNAL_FIREBASE_PROJECT_ID")
EXTERNAL_FIREBASE_PRIVATE_KEY_ID = os.environ.get("EXTERNAL_FIREBASE_PRIVATE_KEY_ID")
EXTERNAL_FIREBASE_PRIVATE_KEY = os.environ.get("EXTERNAL_FIREBASE_PRIVATE_KEY")
EXTERNAL_FIREBASE_CLIENT_EMAIL = os.environ.get("EXTERNAL_FIREBASE_CLIENT_EMAIL")
EXTERNAL_FIREBASE_CLIENT_ID = os.environ.get("EXTERNAL_FIREBASE_CLIENT_ID")

logger = logging.getLogger("shopify_verify")
logger.setLevel(logging.INFO)

# Debug log environment variables (redacted)
logger.info(f"Environment variables loaded - API_KEY: {'✓' if SHOPIFY_API_KEY else '✗'}, SECRET: {'✓' if SHOPIFY_API_SECRET else '✗'}, REDIRECT_URI: {SHOPIFY_REDIRECT_URI}, FRONTEND_URL: {FRONTEND_URL}")


def _get_external_firebase_client():
	"""Get a Firestore client for the external Firebase project using Admin SDK."""
	try:
		# Define a unique name for this Firebase app instance
		app_name = 'external_firebase_app'
		
		# Check if app already exists (to avoid re-initializing)
		try:
			app = firebase_admin.get_app(app_name)
			logger.info(f"Using existing Firebase app: {app_name}")
			return firestore.client(app)
		except ValueError:
			# App doesn't exist, create it
			logger.info(f"Initializing new Firebase app: {app_name}")
		
		# Try to load from JSON file first (most reliable)
		key_file_path = os.path.join(os.path.dirname(__file__), 'firebase-key.json')
		
		if os.path.exists(key_file_path):
			logger.info("Loading external Firebase credentials from firebase-key.json")
			
			# Use Firebase Admin SDK credentials
			cred = credentials.Certificate(key_file_path)
			
			# Get project ID from the key file
			with open(key_file_path, 'r') as f:
				key_data = json.load(f)
				project_id = key_data.get('project_id')
			
			# Initialize the Firebase app with a unique name
			app = firebase_admin.initialize_app(cred, {
				'projectId': project_id
			}, name=app_name)
			
			logger.info(f"Initialized external Firebase app for project: {project_id}")
			
			# Return Firestore client for this app
			return firestore.client(app)
		
		# Fallback to environment variables if file doesn't exist
		if not all([EXTERNAL_FIREBASE_PROJECT_ID, EXTERNAL_FIREBASE_PRIVATE_KEY, EXTERNAL_FIREBASE_CLIENT_EMAIL]):
			raise ValueError("External Firebase configuration is incomplete - missing firebase-key.json file and/or environment variables")
		
		logger.info("Loading external Firebase credentials from environment variables")
		
		# Create credentials from environment variables (with proper key formatting)
		private_key = EXTERNAL_FIREBASE_PRIVATE_KEY
		# Ensure the private key has proper line breaks
		if "\\n" in private_key:
			private_key = private_key.replace("\\n", "\n")
		
		credentials_dict = {
			"type": "service_account",
			"project_id": EXTERNAL_FIREBASE_PROJECT_ID,
			"private_key_id": EXTERNAL_FIREBASE_PRIVATE_KEY_ID,
			"private_key": private_key,
			"client_email": EXTERNAL_FIREBASE_CLIENT_EMAIL,
			"client_id": EXTERNAL_FIREBASE_CLIENT_ID,
			"auth_uri": "https://accounts.google.com/o/oauth2/auth",
			"token_uri": "https://oauth2.googleapis.com/token",
			"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
			"universe_domain": "googleapis.com"
		}
		
		# Use Firebase Admin SDK credentials
		cred = credentials.Certificate(credentials_dict)
		
		# Initialize the Firebase app with a unique name
		app = firebase_admin.initialize_app(cred, {
			'projectId': EXTERNAL_FIREBASE_PROJECT_ID
		}, name=app_name)
		
		logger.info(f"Initialized external Firebase app for project: {EXTERNAL_FIREBASE_PROJECT_ID}")
		
		# Return Firestore client for this app
		return firestore.client(app)
		
	except Exception as e:
		logger.error(f"Failed to initialize external Firebase client: {str(e)}")
		raise


def _add_cors_headers(response_headers):
	"""Add CORS headers to allow cross-origin requests from frontend."""
	response_headers.update({
		"Access-Control-Allow-Origin": "*",  # In production, replace with your specific domain
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Expose-Headers": "Location",  # Allow frontend to access Location header
		"Access-Control-Max-Age": "3600"
	})
	return response_headers


def _handle_preflight(req):
	"""Handle CORS preflight requests."""
	if req.method == 'OPTIONS':
		headers = _add_cors_headers({})
		return https_fn.Response("", status=200, headers=headers)
	return None


def _get_request_query(req):
	"""Robustly extract query parameters as a dict from the incoming request."""
	try:
		qp = req.query
		if qp:
			return {k: v for k, v in qp.items()}
	except Exception:
		pass
	try:
		qp = req.args
		if qp:
			return {k: v for k, v in qp.items()}
	except Exception:
		pass
	try:
		raw_url = req.url
		parsed = urllib.parse.urlparse(raw_url)
		return dict(urllib.parse.parse_qsl(parsed.query))
	except Exception:
		pass
	return {}


def _is_valid_shop_domain(shop: str) -> bool:
	if not shop:
		return False
	shop = shop.lower()
	return re.match(r"^[a-z0-9][a-z0-9\-]*\.myshopify\.com$", shop) is not None


@https_fn.on_request()
def shopify_auth(req: https_fn.Request) -> https_fn.Response:
	"""Start Shopify OAuth to verify shop ownership.

	Expects: JSON or form body or query param with 'shop' (shop domain).
	Returns: 302 redirect to Shopify authorize URL with state equal to a Firestore-backed nonce.
	"""
	# Handle CORS preflight requests
	preflight_response = _handle_preflight(req)
	if preflight_response:
		return preflight_response

	try:
		body = {}
		if req.method == "POST":
			try:
				body = req.get_json(silent=True) or {}
			except Exception:
				body = {}
			try:
				form = req.form
				if form:
					body.update({k: v for k, v in form.items()})
			except Exception:
				pass
		else:
			body = _get_request_query(req)

		shop = (body.get("shop") or body.get("shop_domain") or "").strip()

		if not _is_valid_shop_domain(shop):
			headers = _add_cors_headers({})
			return https_fn.Response("Invalid shop domain", status=400, headers=headers)

		db = firestore.client()
		
		# Check if shop already exists and is verified in shopify_states
		existing_states = db.collection("shopify_states").where("shop", "==", shop).where("verified", "==", True).limit(1).stream()
		existing_verified = list(existing_states)
		
		if existing_verified:
			headers = _add_cors_headers({"Content-Type": "application/json"})
			return https_fn.Response(
				json.dumps({"success": True, "message": "This shop is already verified", "already_verified": True}),
				status=200,
				headers=headers
			)
		
		# Create a Firestore state document that will be referenced by Shopify's redirect
		state_id = secrets.token_urlsafe(24)
		state_ref = db.collection("shopify_states").document(state_id)
		state_ref.set({
			"shop": shop,
			"verified": False,
			"created_at": firestore.SERVER_TIMESTAMP,
		})

		params = {
			"client_id": SHOPIFY_API_KEY,
			"scope": SHOPIFY_SCOPES,
			"redirect_uri": SHOPIFY_REDIRECT_URI,
			"state": state_id,
		}
		logger.info(f"Initiating Shopify OAuth for shop {shop} with state {state_id} and redirect URI {SHOPIFY_REDIRECT_URI}")
		logger.info(f"OAuth URL params: {params}")
		query = urllib.parse.urlencode(params)
		redirect_url = f"https://{shop}/admin/oauth/authorize?{query}"
		logger.info(f"Returning Shopify OAuth URL: {redirect_url}")

		# Return the redirect URL in JSON format instead of using 302 redirect
		headers = _add_cors_headers({"Content-Type": "application/json"})
		return https_fn.Response(
			json.dumps({"redirect_url": redirect_url, "success": True}), 
			status=200, 
			headers=headers
		)
	except Exception:
		logger.exception("Unexpected error in shopify_auth")
		headers = _add_cors_headers({})
		return https_fn.Response("Internal Server Error", status=500, headers=headers)

@https_fn.on_request()
def shopify_callback(req: https_fn.Request) -> https_fn.Response:
	"""Handle Shopify OAuth redirect: verify HMAC and mark the state doc as verified.

	Does NOT exchange code for an access token. After verifying HMAC the state doc is
	updated and the user is redirected back to the frontend with the state id and shop.
	"""
	try:
		qp = _get_request_query(req)
		shop = qp.get("shop")
		provided_hmac = qp.get("hmac")
		state_id = qp.get("state")

		if not shop or not provided_hmac or not state_id:
			return https_fn.Response("Missing required params", status=400)

		if not _is_valid_shop_domain(shop):
			return https_fn.Response("Invalid shop domain", status=400)

		# Verify HMAC using the SHOPIFY_API_SECRET
		params = {k: v for k, v in qp.items() if k not in ("hmac", "signature")}
		message = urllib.parse.urlencode(sorted(params.items()))
		calculated_hmac = hmac.new(SHOPIFY_API_SECRET.encode(), message.encode(), hashlib.sha256).hexdigest()
		if not hmac.compare_digest(calculated_hmac, provided_hmac):
			logger.warning("HMAC verification failed. calculated=%s provided=%s", calculated_hmac, provided_hmac)
			return https_fn.Response("HMAC verification failed", status=400)

		db = firestore.client()
		state_ref = db.collection("shopify_states").document(state_id)
		state = state_ref.get()
		if state.exists:
			data = state.to_dict()
			# update verified flag and timestamp
			state_ref.update({"verified": True, "verified_at": firestore.SERVER_TIMESTAMP})
		else:
			# If the state doc doesn't exist, create it as verified (robustness)
			state_ref.set({"shop": shop, "verified": True, "verified_at": firestore.SERVER_TIMESTAMP})

		# Redirect the user back to the frontend with state and shop
		dashboard_path = f"/dashboard?shop={urllib.parse.quote_plus(shop)}&state={urllib.parse.quote_plus(state_id)}"
		if FRONTEND_URL:
			location = FRONTEND_URL.rstrip("/") + dashboard_path
		else:
			location = dashboard_path

		return https_fn.Response("", status=302, headers={"Location": location})
	except Exception:
		logger.exception("Unexpected error in shopify_callback")
		return https_fn.Response("Internal Server Error", status=500)


@https_fn.on_request()
def shopify_finalize(req: https_fn.Request) -> https_fn.Response:
	"""Finalize verification: frontend posts idToken and state (state id).

	This verifies the Firebase ID token, ensures the state doc is marked verified, then
	writes the shop under users/{uid}/shops/{shop} with verified:true.
	"""
	# Handle CORS preflight requests
	preflight_response = _handle_preflight(req)
	if preflight_response:
		return preflight_response

	try:
		if req.method != "POST":
			headers = _add_cors_headers({})
			return https_fn.Response("Method Not Allowed", status=405, headers=headers)

		try:
			body = req.get_json(silent=True) or {}
		except Exception:
			headers = _add_cors_headers({})
			return https_fn.Response("Bad Request", status=400, headers=headers)

		id_token = body.get("idToken") or body.get("id_token")
		state_id = body.get("state")

		if not id_token or not state_id:
			headers = _add_cors_headers({})
			return https_fn.Response("Missing idToken or state", status=400, headers=headers)

		# Verify Firebase ID token
		try:
			decoded = admin_auth.verify_id_token(id_token)
			uid = decoded.get("uid")
		except Exception:
			logger.exception("Failed to verify id token in finalize")
			headers = _add_cors_headers({})
			return https_fn.Response("Invalid ID token", status=401, headers=headers)

		db = firestore.client()
		state_ref = db.collection("shopify_states").document(state_id)
		state = state_ref.get()
		if not state.exists:
			headers = _add_cors_headers({})
			return https_fn.Response("Invalid or expired state", status=400, headers=headers)
		data = state.to_dict()
		if not data.get("verified"):
			headers = _add_cors_headers({})
			return https_fn.Response("Shop not verified by Shopify", status=400, headers=headers)

		shop = data.get("shop")
		if not shop:
			headers = _add_cors_headers({})
			return https_fn.Response("State missing shop", status=400, headers=headers)

		# Write to user's shops subcollection
		user_shop_ref = db.collection("users").document(uid).collection("shops").document(shop)
		user_shop_ref.set({"verified": True, "verified_at": firestore.SERVER_TIMESTAMP})

		# Also create/update the main user document with shop information
		user_doc_ref = db.collection("users").document(uid)
		user_doc_ref.set({
			"userId": uid,
			"shop": shop,
			"verified": True,
			"lastUpdated": firestore.SERVER_TIMESTAMP
		}, merge=True)

		# Optionally delete the state doc
		try:
			state_ref.delete()
		except Exception:
			logger.warning("Failed to delete state doc %s", state_id)

		headers = _add_cors_headers({})
		return https_fn.Response("OK", status=200, headers=headers)
	except Exception:
		logger.exception("Unexpected error in shopify_finalize")
		headers = _add_cors_headers({})
		return https_fn.Response("Internal Server Error", status=500, headers=headers)


@https_fn.on_request()
def check_user_status(req: https_fn.Request) -> https_fn.Response:
	"""Check if user has verified shops for conditional routing.
	
	Expects: POST request with idToken in body
	Returns: JSON with verification status and shop info
	"""
	# Handle CORS preflight requests
	preflight_response = _handle_preflight(req)
	if preflight_response:
		return preflight_response

	try:
		if req.method != "POST":
			headers = _add_cors_headers({})
			return https_fn.Response("Method Not Allowed", status=405, headers=headers)

		try:
			body = req.get_json(silent=True) or {}
		except Exception:
			headers = _add_cors_headers({})
			return https_fn.Response("Bad Request", status=400, headers=headers)

		id_token = body.get("idToken") or body.get("id_token")

		if not id_token:
			headers = _add_cors_headers({})
			return https_fn.Response("Missing idToken", status=400, headers=headers)

		# Verify Firebase ID token
		try:
			decoded = admin_auth.verify_id_token(id_token)
			uid = decoded.get("uid")
		except Exception:
			logger.exception("Failed to verify id token in check_user_status")
			headers = _add_cors_headers({})
			return https_fn.Response("Invalid ID token", status=401, headers=headers)

		db = firestore.client()
		
		# Check main user document
		user_doc_ref = db.collection("users").document(uid)
		user_doc = user_doc_ref.get()
		
		# Check for verified shops in subcollection
		shops_ref = db.collection("users").document(uid).collection("shops")
		verified_shops_query = shops_ref.where("verified", "==", True).limit(1)
		verified_shops = list(verified_shops_query.stream())
		
		has_verified_shop = len(verified_shops) > 0
		user_data = user_doc.to_dict() if user_doc.exists else {}
		
		response_data = {
			"verified": has_verified_shop,
			"hasShop": has_verified_shop,
			"shop": user_data.get("shop") if has_verified_shop else None,
			"userId": uid
		}

		headers = _add_cors_headers({"Content-Type": "application/json"})
		return https_fn.Response(
			json.dumps(response_data), 
			status=200, 
			headers=headers
		)
	except Exception:
		logger.exception("Unexpected error in check_user_status")
		headers = _add_cors_headers({})
		return https_fn.Response("Internal Server Error", status=500, headers=headers)


@https_fn.on_request()
def ikas_connect(req: https_fn.Request) -> https_fn.Response:
	"""Connect to Ikas shop using client credentials.
	
	Expects: JSON body with shop_name, client_id, and client_secret.
	Returns: Success response with shop connection data.
	"""
	# Handle CORS preflight requests
	preflight_response = _handle_preflight(req)
	if preflight_response:
		return preflight_response

	headers = _add_cors_headers({"Content-Type": "application/json"})

	try:
		if req.method != "POST":
			return https_fn.Response(json.dumps({"error": "Method Not Allowed"}), status=405, headers=headers)

		# Get request body
		try:
			body = req.get_json(silent=True) or {}
		except Exception:
			return https_fn.Response(json.dumps({"error": "Invalid JSON"}), status=400, headers=headers)

		# Extract parameters
		shop_name = body.get("shop_name", "").strip()
		client_id = body.get("client_id", "").strip()
		client_secret = body.get("client_secret", "").strip()
		id_token = body.get("idToken") or body.get("id_token")

		# Validate required fields
		if not shop_name or not client_id or not client_secret:
			return https_fn.Response(
				json.dumps({"error": "Missing required fields: shop_name, client_id, client_secret"}),
				status=400,
				headers=headers
			)

		if not id_token:
			return https_fn.Response(json.dumps({"error": "Missing idToken"}), status=400, headers=headers)

		# Verify Firebase ID token
		try:
			decoded = admin_auth.verify_id_token(id_token)
			uid = decoded.get("uid")
			user_email = decoded.get("email")
		except Exception as e:
			logger.exception("Failed to verify id token in ikas_connect")
			return https_fn.Response(json.dumps({"error": "Invalid ID token"}), status=401, headers=headers)

		logger.info(f"Ikas connection request for shop: {shop_name}, user: {uid}")

		# Fetch access token from Ikas API
		# The Ikas API endpoint is on the store's subdomain
		try:
			# Construct the Ikas OAuth2 token endpoint for this specific store
			# Format: https://<store_name>.myikas.com/api/admin/oauth/token
			token_url = f"https://{shop_name}.myikas.com/api/admin/oauth/token"
			
			token_data = {
				"grant_type": "client_credentials",
				"client_id": client_id,
				"client_secret": client_secret
			}
			
			logger.info(f"Requesting access token from Ikas API: {token_url}")
			
			token_response = requests.post(
				token_url,
				data=token_data,
				headers={"Content-Type": "application/x-www-form-urlencoded"},
				timeout=10
			)
			
			if token_response.status_code != 200:
				error_message = token_response.text or "Failed to fetch access token from Ikas"
				logger.error(f"Ikas API error: {token_response.status_code} - {error_message}")
				return https_fn.Response(
					json.dumps({"error": f"Failed to authenticate with Ikas: {error_message}"}),
					status=400,
					headers=headers
				)
			
			token_json = token_response.json()
			access_token = token_json.get("access_token")
			
			if not access_token:
				logger.error("No access token in Ikas response")
				return https_fn.Response(
					json.dumps({"error": "Failed to retrieve access token from Ikas"}),
					status=400,
					headers=headers
				)
			
			logger.info(f"Successfully fetched access token from Ikas for shop: {shop_name}")
			
		except requests.exceptions.RequestException as e:
			logger.exception(f"Error connecting to Ikas API: {str(e)}")
			return https_fn.Response(
				json.dumps({"error": f"Failed to connect to Ikas API: {str(e)}"}),
				status=500,
				headers=headers
			)
		except Exception as e:
			logger.exception(f"Unexpected error fetching Ikas token: {str(e)}")
			return https_fn.Response(
				json.dumps({"error": f"Unexpected error: {str(e)}"}),
				status=500,
				headers=headers
			)

		# Save connection to Firestore
		db = firestore.client()
		
		# Create shop document in user's shops subcollection
		shop_doc_id = shop_name.lower().replace(" ", "-")
		user_shop_ref = db.collection("users").document(uid).collection("shops").document(shop_doc_id)
		
		shop_data = {
			"shopType": "ikas",
			"shopName": shop_name,
			"clientId": client_id,
			"clientSecret": client_secret,
			"accessToken": access_token,
			"userEmail": user_email,
			"verified": True,
			"connectedAt": firestore.SERVER_TIMESTAMP,
			"fetchedAt": firestore.SERVER_TIMESTAMP
		}
		
		user_shop_ref.set(shop_data)
		logger.info(f"Saved Ikas shop connection for user {uid}, shop: {shop_name}")
		
		# Also update the main user document
		user_doc_ref = db.collection("users").document(uid)
		user_doc_ref.set({
			"userId": uid,
			"shop": shop_doc_id,
			"shopType": "ikas",
			"verified": True,
			"lastUpdated": firestore.SERVER_TIMESTAMP
		}, merge=True)

		return https_fn.Response(
			json.dumps({
				"success": True,
				"message": "Ikas shop connected successfully",
				"shop_name": shop_name
			}),
			status=200,
			headers=headers
		)

	except Exception as e:
		logger.exception("Unexpected error in ikas_connect")
		return https_fn.Response(
			json.dumps({"error": f"Internal Server Error: {str(e)}"}),
			status=500,
			headers=headers
		)


@https_fn.on_request()
def fetch_affiliate_stats(req: https_fn.Request) -> https_fn.Response:
	"""Fetch affiliate stats from external Firebase project for the authenticated user's shop.
	
	Expects:
		POST request with idToken in body.
	Returns:
		JSON with affiliate stats data for the user's verified shop only.
	"""
	# Handle CORS preflight
	preflight_response = _handle_preflight(req)
	if preflight_response:
		return preflight_response

	headers = _add_cors_headers({"Content-Type": "application/json"})

	try:
		# Only POST requests allowed
		if req.method != "POST":
			return https_fn.Response("Method Not Allowed", status=405, headers=headers)

		body = req.get_json(silent=True) or {}
		id_token = body.get("idToken") or body.get("id_token")
		if not id_token:
			return https_fn.Response(json.dumps({"error": "Missing idToken"}), status=400, headers=headers)

		# Verify ID token
		try:
			decoded = admin_auth.verify_id_token(id_token)
			uid = decoded.get("uid")
		except Exception:
			return https_fn.Response(json.dumps({"error": "Invalid ID token"}), status=401, headers=headers)

		# Get user's shop info
		db = firestore.client()
		user_doc = db.collection("users").document(uid).get()
		if not user_doc.exists:
			return https_fn.Response(json.dumps({"error": "User not found"}), status=404, headers=headers)

		user_data = user_doc.to_dict()
		user_shop = user_data.get("shop")

		# Fallback: find verified shop in subcollection
		if not user_shop:
			shops_ref = db.collection("users").document(uid).collection("shops")
			verified_shops = list(shops_ref.where("verified", "==", True).limit(1).stream())
			if verified_shops:
				user_shop = verified_shops[0].id
			else:
				return https_fn.Response(json.dumps({"error": "No verified shop found for user"}), status=403, headers=headers)

		if not user_data.get("verified", False):
			return https_fn.Response(json.dumps({"error": "Shop not verified for user"}), status=403, headers=headers)

		# Extract shop name
		shop_name = user_shop.replace(".myshopify.com", "") if user_shop else None
		if not shop_name:
			return https_fn.Response(json.dumps({"error": "Invalid shop name"}), status=400, headers=headers)

		# Connect to external Firebase project
		external_db = _get_external_firebase_client()
		events_ref = external_db.collection("pixel_events").document(shop_name).collection("events")

		try:
			all_events = list(events_ref.stream())
		except Exception as e:
			return https_fn.Response(json.dumps({"error": f"Failed to access events: {str(e)}"}), status=500, headers=headers)

		# Filter checkout_completed events
		checkout_events = [
			e.to_dict() | {"event_id": e.id}
			for e in all_events
			if e.to_dict().get("eventType") == "checkout_completed"
		]

		# Prepare response
		shop_stats = {
			"shop_name": shop_name,
			"shop_full_name": f"{shop_name}.myshopify.com",
			"total_checkout_events": len(checkout_events),
			"events": sorted(
				checkout_events,
				key=lambda x: x.get("timestamp", x.get("created_at", 0)),
				reverse=True
			)
		}

		return https_fn.Response(json.dumps(shop_stats), status=200, headers=headers)

	except Exception as e:
		logger.exception("Unexpected error in fetch_affiliate_stats")
		return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers)
