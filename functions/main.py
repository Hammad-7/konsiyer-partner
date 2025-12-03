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
FRONTEND_URL = os.environ.get("FRONTEND_URL")  # optional fallback: only used if return_url not provided

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


def _add_cors_headers(response_headers, request=None):
	"""Add CORS headers to allow cross-origin requests from frontend.
	
	Args:
		response_headers: Dictionary of response headers to update
		request: Optional request object to get origin from
	"""
	# Get the origin from the request if available
	origin = None
	if request:
		origin = request.headers.get("Origin")
	
	# List of allowed origins
	allowed_origins = [
		"https://dev-konsiyer.ikas.shop",
		"http://localhost:5173",
		"http://localhost:3000",
		# Add more allowed origins here
	]
	
	# Check if origin is in allowed list or allow all .ikas.shop domains
	if origin:
		if origin in allowed_origins or origin.endswith(".ikas.shop") or origin.endswith(".myikas.com"):
			response_headers["Access-Control-Allow-Origin"] = origin
			response_headers["Access-Control-Allow-Credentials"] = "true"
		else:
			# Fallback to wildcard for unrecognized origins
			response_headers["Access-Control-Allow-Origin"] = "*"
	else:
		# If no origin header or request, use wildcard
		response_headers["Access-Control-Allow-Origin"] = "*"
	
	response_headers.update({
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Expose-Headers": "Location",
		"Access-Control-Max-Age": "3600"
	})
	return response_headers


def _handle_preflight(req):
	"""Handle CORS preflight requests."""
	if req.method == 'OPTIONS':
		headers = _add_cors_headers({})
		return https_fn.Response("", status=200, headers=headers)
	return None


def _add_cors_headers_with_credentials(response_headers, request):
	"""Add CORS headers for requests that need credentials support (like sendBeacon).
	
	This is specifically for endpoints that receive requests with credentials from Ikas shops.
	
	Args:
		response_headers: Dictionary of response headers to update
		request: Request object to get origin from
	"""
	# Get the origin from the request
	origin = request.headers.get("Origin")
	
	# List of allowed origins
	allowed_origins = [
		"https://dev-konsiyer.ikas.shop",
		"http://localhost:5173",
		"http://localhost:3000",
	]
	
	# Check if origin is in allowed list or allow all .ikas.shop / .myikas.com domains
	if origin:
		if origin in allowed_origins or origin.endswith(".ikas.shop") or origin.endswith(".myikas.com"):
			response_headers["Access-Control-Allow-Origin"] = origin
			response_headers["Access-Control-Allow-Credentials"] = "true"
		else:
			# For unrecognized origins, allow but without credentials
			response_headers["Access-Control-Allow-Origin"] = origin
	
	response_headers.update({
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Expose-Headers": "Location",
		"Access-Control-Max-Age": "3600"
	})
	return response_headers


def _handle_preflight_with_credentials(req):
	"""Handle CORS preflight requests for endpoints that need credentials support."""
	if req.method == 'OPTIONS':
		headers = _add_cors_headers_with_credentials({}, req)
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


def _is_valid_return_url(url: str) -> bool:
	"""Validate that the return URL is from a trusted origin to prevent open redirect vulnerabilities.
	
	Args:
		url: The return URL to validate
		
	Returns:
		True if the URL is valid and from a trusted origin, False otherwise
	"""
	if not url:
		return False
	
	try:
		parsed = urllib.parse.urlparse(url)
		
		# Must have a scheme (http/https)
		if parsed.scheme not in ('http', 'https'):
			logger.warning(f"Invalid scheme in return URL: {parsed.scheme}")
			return False
		
		# Must have a hostname
		if not parsed.hostname:
			logger.warning("No hostname in return URL")
			return False
		
		# List of trusted origins (patterns)
		# In production, you should configure this more strictly
		trusted_patterns = [
			r'^localhost$',
			r'^127\.0\.0\.1$',
			r'^.*\.vercel\.app$',
			r'^.*\.netlify\.app$',
			r'^.*\.web\.app$',
			r'^.*\.firebaseapp\.com$',
			r'^.*\.konsiyer\.com$',
			# Add your production domain patterns here
		]
		
		hostname = parsed.hostname.lower()
		
		# Check if hostname matches any trusted pattern
		for pattern in trusted_patterns:
			if re.match(pattern, hostname):
				logger.info(f"Return URL validated: {url}")
				return True
		
		logger.warning(f"Return URL hostname not in trusted list: {hostname}")
		return False
		
	except Exception as e:
		logger.error(f"Error validating return URL: {str(e)}")
		return False


@https_fn.on_request()
def shopify_auth(req: https_fn.Request) -> https_fn.Response:
	"""Start Shopify OAuth to verify shop ownership.

	Expects: JSON or form body or query param with 'shop' (shop domain) and 'return_url' (frontend URL to redirect back to).
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
		return_url = (body.get("return_url") or "").strip()

		if not _is_valid_shop_domain(shop):
			headers = _add_cors_headers({})
			return https_fn.Response("Invalid shop domain", status=400, headers=headers)

		# Validate the return URL for security (prevent open redirect attacks)
		if return_url and not _is_valid_return_url(return_url):
			logger.warning(f"Invalid or untrusted return URL provided: {return_url}")
			headers = _add_cors_headers({})
			return https_fn.Response("Invalid return URL - must be from a trusted origin", status=400, headers=headers)

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
		
		# Store the return URL in the state document for use in the callback
		state_data = {
			"shop": shop,
			"verified": False,
			"created_at": firestore.SERVER_TIMESTAMP,
		}
		
		# Only add return_url if it was provided and validated
		if return_url:
			state_data["return_url"] = return_url
			logger.info(f"Storing return URL in state: {return_url}")
		
		state_ref.set(state_data)

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
	updated and the user is redirected back to the frontend with the state id and shop
	using the return_url stored in the state document.
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
		
		# Get the return URL from the state document
		return_url = None
		if state.exists:
			data = state.to_dict()
			return_url = data.get("return_url")
			# update verified flag and timestamp
			state_ref.update({"verified": True, "verified_at": firestore.SERVER_TIMESTAMP})
			logger.info(f"Retrieved return URL from state: {return_url}")
		else:
			# If the state doc doesn't exist, create it as verified (robustness)
			state_ref.set({"shop": shop, "verified": True, "verified_at": firestore.SERVER_TIMESTAMP})
			logger.warning(f"State document {state_id} did not exist, created new verified state")

		# Build the redirect location
		dashboard_path = f"/dashboard?shop={urllib.parse.quote_plus(shop)}&state={urllib.parse.quote_plus(state_id)}"
		
		# Use the stored return_url if available and valid, otherwise fallback to FRONTEND_URL or relative path
		if return_url:
			# Parse the return URL to get the origin
			try:
				parsed = urllib.parse.urlparse(return_url)
				origin = f"{parsed.scheme}://{parsed.netloc}"
				location = origin + dashboard_path
				logger.info(f"Redirecting to stored return URL: {location}")
			except Exception as e:
				logger.error(f"Error parsing return URL: {str(e)}, falling back")
				# Fallback to FRONTEND_URL or relative path
				if FRONTEND_URL:
					location = FRONTEND_URL.rstrip("/") + dashboard_path
				else:
					location = dashboard_path
		elif FRONTEND_URL:
			location = FRONTEND_URL.rstrip("/") + dashboard_path
			logger.info(f"Using FRONTEND_URL fallback: {location}")
		else:
			location = dashboard_path
			logger.info(f"Using relative path fallback: {location}")

		logger.info(f"Final redirect location: {location}")
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


# ============================================================================
# ADMIN MANAGEMENT ENDPOINTS
# ============================================================================

# Super Admin UID - This user has exclusive privileges to manage admins
SUPER_ADMIN_UID = "GoWdiwdj6zUtlH6cZo2wla9GpYB2"


def _is_super_admin(uid: str) -> bool:
	"""Check if a user is the super admin.
	
	Args:
		uid: User ID to check
		
	Returns:
		True if user is the super admin, False otherwise
	"""
	if not uid or uid != SUPER_ADMIN_UID:
		return False
	
	try:
		db = firestore.client()
		user_ref = db.collection("users").document(uid)
		user_doc = user_ref.get()
		
		if user_doc.exists:
			user_data = user_doc.to_dict()
			return (user_data.get("role") == "super_admin" or 
					user_data.get("isSuperAdmin") == True)
		
		return False
	except Exception as e:
		logger.error(f"Error checking super admin status: {str(e)}")
		return False


def _is_admin(uid: str) -> bool:
	"""Check if a user has admin privileges (includes super admin).
	
	Args:
		uid: User ID to check
		
	Returns:
		True if user is an admin or super admin, False otherwise
	"""
	if not uid:
		return False
	
	try:
		db = firestore.client()
		user_ref = db.collection("users").document(uid)
		user_doc = user_ref.get()
		
		if user_doc.exists:
			user_data = user_doc.to_dict()
			return (user_data.get("role") in ["admin", "super_admin"] or
					user_data.get("isAdmin") == True or
					user_data.get("isSuperAdmin") == True)
		
		return False
	except Exception as e:
		logger.error(f"Error checking admin status: {str(e)}")
		return False


@https_fn.on_request()
def check_admin_status(req: https_fn.Request) -> https_fn.Response:
	"""Check if the authenticated user is an admin or super admin.
	
	Expects: POST request with idToken in body
	Returns: JSON with admin and super admin status
	"""
	# Handle CORS preflight
	preflight_response = _handle_preflight(req)
	if preflight_response:
		return preflight_response

	headers = _add_cors_headers({"Content-Type": "application/json"})

	try:
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
			logger.exception("Failed to verify id token in check_admin_status")
			return https_fn.Response(json.dumps({"error": "Invalid ID token"}), status=401, headers=headers)

		is_super = _is_super_admin(uid)
		is_regular_admin = _is_admin(uid)

		return https_fn.Response(
			json.dumps({
				"userId": uid,
				"isAdmin": is_regular_admin,
				"isSuperAdmin": is_super
			}),
			status=200,
			headers=headers
		)

	except Exception as e:
		logger.exception("Unexpected error in check_admin_status")
		return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers)


@https_fn.on_request()
def get_all_admins(req: https_fn.Request) -> https_fn.Response:
	"""Get list of all admin users (super admin only).
	
	Expects: POST request with idToken in body
	Returns: JSON array of admin users with data from Firebase Auth
	"""
	# Handle CORS preflight
	preflight_response = _handle_preflight(req)
	if preflight_response:
		return preflight_response

	headers = _add_cors_headers({"Content-Type": "application/json"})

	try:
		if req.method != "POST":
			return https_fn.Response("Method Not Allowed", status=405, headers=headers)

		body = req.get_json(silent=True) or {}
		id_token = body.get("idToken") or body.get("id_token")
		
		if not id_token:
			return https_fn.Response(json.dumps({"error": "Missing idToken"}), status=400, headers=headers)

		# Verify ID token and check super admin
		try:
			decoded = admin_auth.verify_id_token(id_token)
			uid = decoded.get("uid")
		except Exception:
			logger.exception("Failed to verify id token in get_all_admins")
			return https_fn.Response(json.dumps({"error": "Invalid ID token"}), status=401, headers=headers)

		if not _is_super_admin(uid):
			return https_fn.Response(
				json.dumps({"error": "Only super admin can view admin list"}),
				status=403,
				headers=headers
			)

		# Fetch all admin users
		db = firestore.client()
		users_ref = db.collection("users")
		users_snapshot = users_ref.stream()

		admins = []
		for user_doc in users_snapshot:
			user_data = user_doc.to_dict()
			user_id = user_doc.id
			
			is_admin_user = (user_data.get("role") in ["admin", "super_admin"] or
							user_data.get("isAdmin") == True or
							user_data.get("isSuperAdmin") == True)
			
			if is_admin_user:
				# Fetch user data from Firebase Auth to get the most accurate email and displayName
				auth_user_data = None
				try:
					auth_user = admin_auth.get_user(user_id)
					auth_user_data = {
						"email": auth_user.email,
						"displayName": auth_user.display_name,
						"createdAt": auth_user.user_metadata.creation_timestamp if auth_user.user_metadata else None
					}
				except Exception as e:
					logger.warning(f"Could not fetch Auth data for user {user_id}: {str(e)}")
				
				# Prioritize Firebase Auth data over Firestore data
				email = (auth_user_data.get("email") if auth_user_data else None) or user_data.get("email", "N/A")
				display_name = (auth_user_data.get("displayName") if auth_user_data else None) or user_data.get("displayName") or user_data.get("name", "N/A")
				
				# Handle timestamps - determine which field to use for "added" date
				is_super = user_id == SUPER_ADMIN_UID or user_data.get("isSuperAdmin") == True
				
				# For superusers: use createdAt from Auth or Firestore
				# For regular admins: use promotedAt if available, otherwise createdAt
				if is_super:
					added_timestamp = user_data.get("createdAt")
					# Fallback to Auth creation time if Firestore doesn't have it
					if not added_timestamp and auth_user_data and auth_user_data.get("createdAt"):
						added_timestamp = auth_user_data.get("createdAt")
				else:
					# For admins, prefer promotedAt over createdAt
					added_timestamp = user_data.get("promotedAt") or user_data.get("createdAt")
				
				last_updated = user_data.get("lastUpdated")
				promoted_at = user_data.get("promotedAt")
				
				# Convert timestamps to milliseconds for JSON serialization
				def convert_timestamp(ts):
					if not ts:
						return None
					if hasattr(ts, 'isoformat'):
						# Python datetime object
						return int(ts.timestamp() * 1000)
					elif hasattr(ts, 'timestamp'):
						# Firestore timestamp
						return int(ts.timestamp() * 1000)
					elif isinstance(ts, (int, float)):
						# Already a timestamp (possibly in seconds or milliseconds)
						# If it's a small number, assume seconds and convert to milliseconds
						if ts < 10000000000:  # Less than year 2286 in seconds
							return int(ts * 1000)
						return int(ts)
					return None
				
				added_at = convert_timestamp(added_timestamp)
				last_updated_ms = convert_timestamp(last_updated)
				promoted_at_ms = convert_timestamp(promoted_at)
				
				admin_entry = {
					"id": user_id,
					"email": email,
					"displayName": display_name,
					"role": user_data.get("role", "admin"),
					"isSuperAdmin": is_super,
					"createdAt": added_at,
					"lastUpdated": last_updated_ms
				}
				
				# Add promotedAt only for non-superusers
				if not is_super and promoted_at_ms:
					admin_entry["promotedAt"] = promoted_at_ms
				
				admins.append(admin_entry)

		# Sort: super admin first, then by creation/promotion date
		admins.sort(key=lambda x: (not x["isSuperAdmin"], -(x.get("createdAt") or 0)))

		return https_fn.Response(
			json.dumps({"admins": admins, "total": len(admins)}),
			status=200,
			headers=headers
		)

	except Exception as e:
		logger.exception("Unexpected error in get_all_admins")
		return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers)


@https_fn.on_request()
def add_admin(req: https_fn.Request) -> https_fn.Response:
	"""Add a user as admin (super admin only).
	
	Expects: POST request with idToken and targetUserId in body
	Returns: Success message
	"""
	# Handle CORS preflight
	preflight_response = _handle_preflight(req)
	if preflight_response:
		return preflight_response

	headers = _add_cors_headers({"Content-Type": "application/json"})

	try:
		if req.method != "POST":
			return https_fn.Response("Method Not Allowed", status=405, headers=headers)

		body = req.get_json(silent=True) or {}
		id_token = body.get("idToken") or body.get("id_token")
		target_user_id = body.get("targetUserId") or body.get("target_user_id")
		
		if not id_token:
			return https_fn.Response(json.dumps({"error": "Missing idToken"}), status=400, headers=headers)
		
		if not target_user_id:
			return https_fn.Response(json.dumps({"error": "Missing targetUserId"}), status=400, headers=headers)

		# Verify ID token and check super admin
		try:
			decoded = admin_auth.verify_id_token(id_token)
			uid = decoded.get("uid")
		except Exception:
			logger.exception("Failed to verify id token in add_admin")
			return https_fn.Response(json.dumps({"error": "Invalid ID token"}), status=401, headers=headers)

		if not _is_super_admin(uid):
			return https_fn.Response(
				json.dumps({"error": "Only super admin can add new admins"}),
				status=403,
				headers=headers
			)

		# Check if target user is super admin
		if target_user_id == SUPER_ADMIN_UID:
			return https_fn.Response(
				json.dumps({"error": "Cannot modify super admin privileges"}),
				status=400,
				headers=headers
			)

		# Fetch user data from Firebase Auth
		try:
			auth_user = admin_auth.get_user(target_user_id)
			user_email = auth_user.email
			user_display_name = auth_user.display_name
			user_created_at = auth_user.user_metadata.creation_timestamp if auth_user.user_metadata else None
		except Exception as e:
			logger.error(f"Failed to fetch user from Auth: {str(e)}")
			return https_fn.Response(
				json.dumps({"error": "Target user not found in Firebase Auth"}),
				status=404,
				headers=headers
			)

		# Check if target user exists in Firestore
		db = firestore.client()
		target_user_ref = db.collection("users").document(target_user_id)
		target_user_doc = target_user_ref.get()
		
		# Set custom claims for admin access (CRITICAL for Firestore rules)
		try:
			custom_claims = {
				"admin": True,
				"role": "admin"
			}
			admin_auth.set_custom_user_claims(target_user_id, custom_claims)
			logger.info(f"Custom claims set for user {target_user_id}: {custom_claims}")
		except Exception as e:
			logger.error(f"Failed to set custom claims for user {target_user_id}: {str(e)}")
			return https_fn.Response(
				json.dumps({"error": f"Failed to set admin privileges: {str(e)}"}),
				status=500,
				headers=headers
			)

		# Prepare user data with information from Firebase Auth
		user_update_data = {
			"role": "admin",
			"isAdmin": True,
			"customClaimsSet": True,
			"lastUpdated": firestore.SERVER_TIMESTAMP,
			"promotedBy": uid,
			"promotedAt": firestore.SERVER_TIMESTAMP,
			# Store email and displayName from Firebase Auth
			"email": user_email,
		}
		
		# Only add displayName if it exists
		if user_display_name:
			user_update_data["displayName"] = user_display_name
		
		# If user document doesn't exist, create it with additional fields
		if not target_user_doc.exists:
			logger.info(f"Creating new user document for {target_user_id}")
			user_update_data["userId"] = target_user_id
			user_update_data["createdAt"] = firestore.SERVER_TIMESTAMP
			target_user_ref.set(user_update_data)
		else:
			# Update existing user document
			target_user_ref.update(user_update_data)

		logger.info(f"User {target_user_id} promoted to admin by super admin {uid}")

		return https_fn.Response(
			json.dumps({
				"success": True,
				"message": "User successfully promoted to admin. User must sign out and sign back in for changes to take effect.",
				"userId": target_user_id,
				"email": user_email,
				"displayName": user_display_name,
				"note": "Custom claims have been set - user needs to refresh their session"
			}),
			status=200,
			headers=headers
		)

	except Exception as e:
		logger.exception("Unexpected error in add_admin")
		return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers)


@https_fn.on_request()
def remove_admin(req: https_fn.Request) -> https_fn.Response:
	"""Remove admin privileges from a user (super admin only).
	
	Expects: POST request with idToken and targetUserId in body
	Returns: Success message
	"""
	# Handle CORS preflight
	preflight_response = _handle_preflight(req)
	if preflight_response:
		return preflight_response

	headers = _add_cors_headers({"Content-Type": "application/json"})

	try:
		if req.method != "POST":
			return https_fn.Response("Method Not Allowed", status=405, headers=headers)

		body = req.get_json(silent=True) or {}
		id_token = body.get("idToken") or body.get("id_token")
		target_user_id = body.get("targetUserId") or body.get("target_user_id")
		
		if not id_token:
			return https_fn.Response(json.dumps({"error": "Missing idToken"}), status=400, headers=headers)
		
		if not target_user_id:
			return https_fn.Response(json.dumps({"error": "Missing targetUserId"}), status=400, headers=headers)

		# Verify ID token and check super admin
		try:
			decoded = admin_auth.verify_id_token(id_token)
			uid = decoded.get("uid")
		except Exception:
			logger.exception("Failed to verify id token in remove_admin")
			return https_fn.Response(json.dumps({"error": "Invalid ID token"}), status=401, headers=headers)

		if not _is_super_admin(uid):
			return https_fn.Response(
				json.dumps({"error": "Only super admin can remove admins"}),
				status=403,
				headers=headers
			)

		# Prevent removing super admin
		if target_user_id == SUPER_ADMIN_UID:
			return https_fn.Response(
				json.dumps({"error": "Cannot remove super admin privileges"}),
				status=400,
				headers=headers
			)

		# Prevent super admin from removing themselves (redundant but safe)
		if uid == target_user_id:
			return https_fn.Response(
				json.dumps({"error": "Super admin cannot remove their own admin privileges"}),
				status=400,
				headers=headers
			)

		# Check if target user exists
		db = firestore.client()
		target_user_ref = db.collection("users").document(target_user_id)
		target_user_doc = target_user_ref.get()
		
		if not target_user_doc.exists:
			return https_fn.Response(
				json.dumps({"error": "Target user not found"}),
				status=404,
				headers=headers
			)

		# Remove custom claims (CRITICAL for Firestore rules)
		try:
			custom_claims = {
				"admin": False,
				"role": "user"
			}
			admin_auth.set_custom_user_claims(target_user_id, custom_claims)
			logger.info(f"Custom claims removed for user {target_user_id}")
		except Exception as e:
			logger.error(f"Failed to remove custom claims for user {target_user_id}: {str(e)}")
			return https_fn.Response(
				json.dumps({"error": f"Failed to remove admin privileges: {str(e)}"}),
				status=500,
				headers=headers
			)

		# Remove admin privileges from Firestore
		target_user_ref.update({
			"role": "user",
			"isAdmin": False,
			"isSuperAdmin": False,
			"customClaimsSet": False,
			"lastUpdated": firestore.SERVER_TIMESTAMP,
			"demotedBy": uid,
			"demotedAt": firestore.SERVER_TIMESTAMP
		})

		logger.info(f"Admin privileges removed from user {target_user_id} by super admin {uid}")

		return https_fn.Response(
			json.dumps({
				"success": True,
				"message": "Admin privileges successfully removed. User must sign out and sign back in for changes to take effect.",
				"userId": target_user_id,
				"note": "Custom claims have been removed - user needs to refresh their session"
			}),
			status=200,
			headers=headers
		)

	except Exception as e:
		logger.exception("Unexpected error in remove_admin")
		return https_fn.Response(json.dumps({"error": str(e)}), status=500, headers=headers)


@https_fn.on_request()
def init_super_admin(req: https_fn.Request) -> https_fn.Response:
	"""
	Initialize super admin with custom claims.
	This should be called ONCE to set up the super admin.
	
	Request body: { "secret": "your-secret-key" }
	"""
	# Add CORS headers
	headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Content-Type": "application/json"
	}
	
	# Handle CORS preflight
	if req.method == "OPTIONS":
		return https_fn.Response("", status=200, headers=headers)
	
	if req.method != "POST":
		return https_fn.Response(
			json.dumps({"error": "Method not allowed"}),
			status=405,
			headers=headers
		)
	
	try:
		body = req.get_json(silent=True) or {}
		secret = body.get("secret")
		
		# Check secret - for security, this should match an environment variable
		# For now, we'll use a simple check
		expected_secret = os.environ.get("SUPER_ADMIN_INIT_SECRET", "konsiyer-super-admin-2025")
		
		if secret != expected_secret:
			logger.warning("Unauthorized super admin initialization attempt")
			return https_fn.Response(
				json.dumps({"error": "Invalid secret"}),
				status=401,
				headers=headers
			)
		
		# Fetch user data from Firebase Auth
		try:
			auth_user = admin_auth.get_user(SUPER_ADMIN_UID)
			user_email = auth_user.email
			user_display_name = auth_user.display_name
			logger.info(f"Fetched super admin data from Auth: {user_email}, {user_display_name}")
		except Exception as e:
			logger.error(f"Failed to fetch super admin from Auth: {str(e)}")
			return https_fn.Response(
				json.dumps({"error": f"Super admin user not found in Firebase Auth: {str(e)}"}),
				status=404,
				headers=headers
			)
		
		# Set custom claims for super admin
		logger.info(f"Setting custom claims for super admin: {SUPER_ADMIN_UID}")
		
		custom_claims = {
			"superAdmin": True,
			"admin": True,
			"role": "super_admin"
		}
		
		admin_auth.set_custom_user_claims(SUPER_ADMIN_UID, custom_claims)
		
		# Also update Firestore for record keeping with data from Firebase Auth
		db = firestore.client()
		user_ref = db.collection("users").document(SUPER_ADMIN_UID)
		
		user_data = {
			"role": "super_admin",
			"isSuperAdmin": True,
			"isAdmin": True,
			"customClaimsSet": True,
			"lastUpdated": firestore.SERVER_TIMESTAMP,
			"email": user_email,
		}
		
		# Only add displayName if it exists
		if user_display_name:
			user_data["displayName"] = user_display_name
		
		# Check if user doc exists to determine if we need createdAt
		user_doc = user_ref.get()
		if not user_doc.exists:
			user_data["createdAt"] = firestore.SERVER_TIMESTAMP
			user_data["userId"] = SUPER_ADMIN_UID
		
		user_ref.set(user_data, merge=True)
		
		logger.info(f"Super admin initialized successfully: {SUPER_ADMIN_UID}")
		
		return https_fn.Response(
			json.dumps({
				"success": True,
				"message": "Super admin initialized successfully",
				"userId": SUPER_ADMIN_UID,
				"email": user_email,
				"displayName": user_display_name,
				"customClaims": custom_claims,
				"note": "User must sign out and sign back in for changes to take effect"
			}),
			status=200,
			headers=headers
		)
		
	except Exception as e:
		logger.exception("Error initializing super admin")
		return https_fn.Response(
			json.dumps({"error": str(e)}),
			status=500,
			headers=headers
		)


# ============================================================================
# CHECKOUT TRACKING ENDPOINT (FOR IKAS PLATFORM)
# ============================================================================

@https_fn.on_request()
def track_checkout(req: https_fn.Request) -> https_fn.Response:
	"""Track successful checkout completions from Ikas stores.
	
	Receives checkout data including affiliate reference, ecommerce details, and customer info.
	Stores the event in Firestore under shops_events/{shop_affiliation}/events/{event_id}.
	
	Expected payload:
	{
		"kons_ref": "affiliate_reference_code",  # Can be null
		"timestamp": "2025-11-03T15:07:25.103Z",
		"page": "https://shop.ikas.shop/checkout?id=xxx&step=success",
		"ecommerce": {
			"transaction_id": "1011",
			"affiliation": "dev-konsiyer.ikas.shop",
			"value": "18",
			"tax": "3",
			"shipping": "0",
			"currency": "TRY",
			"coupon": null,
			"items": [...],
			"customer": {...}
		}
	}
	
	Returns: JSON success response
	"""
	# Handle CORS preflight with credentials support
	preflight_response = _handle_preflight_with_credentials(req)
	if preflight_response:
		return preflight_response

	headers = _add_cors_headers_with_credentials({"Content-Type": "application/json"}, req)

	try:
		if req.method != "POST":
			logger.warning("Invalid method for track_checkout")
			return https_fn.Response(
				json.dumps({"error": "Method Not Allowed"}),
				status=405,
				headers=headers
			)

		# Parse request body
		try:
			body = req.get_json(silent=True) or {}
		except Exception as e:
			logger.error(f"Failed to parse JSON body: {str(e)}")
			return https_fn.Response(
				json.dumps({"error": "Invalid JSON payload"}),
				status=400,
				headers=headers
			)

		# Extract required fields
		kons_ref = body.get("kons_ref")
		timestamp = body.get("timestamp")
		page = body.get("page")
		ecommerce = body.get("ecommerce")

		# Validate required fields
		if not ecommerce or not isinstance(ecommerce, dict):
			logger.warning("Missing or invalid ecommerce data")
			return https_fn.Response(
				json.dumps({"error": "Missing or invalid ecommerce data"}),
				status=400,
				headers=headers
			)

		# Extract shop affiliation (used as document name)
		affiliation = ecommerce.get("affiliation")
		if not affiliation:
			logger.warning("Missing affiliation in ecommerce data")
			return https_fn.Response(
				json.dumps({"error": "Missing shop affiliation"}),
				status=400,
				headers=headers
			)

		# Sanitize affiliation for use as document ID (remove special chars, lowercase)
		shop_doc_id = re.sub(r'[^a-z0-9\-.]', '', affiliation.lower())
		
		# Extract transaction details
		transaction_id = ecommerce.get("transaction_id")
		if not transaction_id:
			logger.warning("Missing transaction_id in ecommerce data")
			return https_fn.Response(
				json.dumps({"error": "Missing transaction_id"}),
				status=400,
				headers=headers
			)

		# Prepare event data
		event_data = {
			"kons_ref": kons_ref,
			"timestamp": timestamp,
			"page": page,
			"ecommerce": ecommerce,
			"transaction_id": transaction_id,
			"affiliation": affiliation,
			"value": ecommerce.get("value"),
			"currency": ecommerce.get("currency"),
			"items_count": len(ecommerce.get("items", [])),
			"customer_email": ecommerce.get("customer", {}).get("email"),
			"customer_id": ecommerce.get("customer", {}).get("id"),
			"received_at": firestore.SERVER_TIMESTAMP,
			"event_type": "checkout_completed"
		}

		# Store in Firestore
		db = firestore.client()
		
		# Structure: shops_events/{shop_affiliation}/events/{transaction_id}
		shop_events_ref = db.collection("shops_events").document(shop_doc_id)
		events_collection = shop_events_ref.collection("events")
		
		# Use transaction_id as the document ID to prevent duplicates
		event_doc_ref = events_collection.document(transaction_id)
		
		# Check if this transaction already exists
		existing_event = event_doc_ref.get()
		if existing_event.exists:
			logger.info(f"Transaction {transaction_id} already recorded for {shop_doc_id}")
			return https_fn.Response(
				json.dumps({
					"success": True,
					"message": "Transaction already recorded",
					"transaction_id": transaction_id,
					"shop": affiliation,
					"duplicate": True
				}),
				status=200,
				headers=headers
			)
		
		# Save the event
		event_doc_ref.set(event_data)
		
		# Update shop document with summary stats
		shop_events_ref.set({
			"shop_name": affiliation,
			"last_event_at": firestore.SERVER_TIMESTAMP,
			"total_events": firestore.Increment(1)
		}, merge=True)
		
		logger.info(f"Successfully tracked checkout for {shop_doc_id}, transaction: {transaction_id}, kons_ref: {kons_ref}")

		return https_fn.Response(
			json.dumps({
				"success": True,
				"message": "Checkout event tracked successfully",
				"transaction_id": transaction_id,
				"shop": affiliation,
				"kons_ref": kons_ref,
				"event_id": transaction_id
			}),
			status=200,
			headers=headers
		)

	except Exception as e:
		logger.exception("Unexpected error in track_checkout")
		return https_fn.Response(
			json.dumps({"error": f"Internal Server Error: {str(e)}"}),
			status=500,
			headers=headers
		)
