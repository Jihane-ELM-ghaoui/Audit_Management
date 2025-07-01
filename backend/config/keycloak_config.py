import os
from functools import lru_cache

from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, OAuth2PasswordBearer
from jose import JWTError, jwt, jwk
from keycloak import KeycloakOpenID
import requests

load_dotenv()

server_url = os.getenv("KEYCLOAK_SERVER_URL")
client_id = os.getenv("KEYCLOAK_CLIENT_ID")
realm_name = os.getenv("KEYCLOAK_REALM_NAME")
client_secret = os.getenv("KEYCLOAK_CLIENT_SECRET")

keycloak_openid = KeycloakOpenID(
    server_url=server_url,
    client_id=client_id,
    realm_name=realm_name,
    client_secret_key=client_secret
)

auth_scheme = HTTPBearer()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

KEYCLOAK_URL = f"{server_url}/realms/{realm_name}"
CLIENT_ID = client_id


@lru_cache()
def get_keycloak_public_key():
    jwks_url = f"{KEYCLOAK_URL}/protocol/openid-connect/certs"
    try:
        response = requests.get(jwks_url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Error fetching JWKS: {str(e)}")


def decode_jwt(token: str):
    public_key = get_keycloak_public_key()
    headers = jwt.get_unverified_header(token)
    if not headers or 'kid' not in headers:
        raise HTTPException(status_code=403, detail="Invalid token: no kid header")

    for key in public_key['keys']:
        if key['kid'] == headers['kid']:
            try:
                public_key_pem = jwk.construct(key).public_key()
            except Exception as e:
                raise HTTPException(
                    status_code=403,
                    detail="Error converting JWK to public key: " + str(e)
                )
            try:
                # 👇 Return full payload with all claims
                payload = jwt.decode(token, public_key_pem, algorithms=["RS256"], audience="account")
                return payload
            except JWTError as e:
                raise HTTPException(status_code=403, detail="Invalid token: " + str(e))

    raise HTTPException(status_code=403, detail="Invalid key")

def get_current_user(token: str = Depends(oauth2_scheme)):
    return decode_jwt(token)

def get_current_active_user_with_roles(required_roles: list[str]):
    def role_checker(user: dict = Depends(get_current_user)):
        user_roles = user.get("realm_access", {}).get("roles", [])
        print("User roles:", user_roles)
        print("Required roles:", required_roles)
        if not any(r.lower() in [ur.lower() for ur in user_roles] for r in required_roles):
            raise HTTPException(status_code=403, detail="Insufficient role privileges")
        return user
    return role_checker
