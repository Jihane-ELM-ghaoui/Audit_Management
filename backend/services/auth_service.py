"""from fastapi import HTTPException, Depends
from backend.config.keycloak_config import keycloak_openid
from backend.config.security import oauth2_scheme

class AuthService:
    @staticmethod
    def login(username: str, password: str):
        try:
            # Ajoutez des logs pour déboguer
            print(f"Tentative de connexion pour l'utilisateur: {username}")
            token = keycloak_openid.token(username, password)
            print("Connexion réussie")
            return token
        except Exception as e:
            print(f"Erreur d'authentification: {str(e)}")
            raise HTTPException(status_code=401, detail="Identifiants invalides")

    @staticmethod
    def get_user_info(token: str = Depends(oauth2_scheme)):
        try:
            return keycloak_openid.userinfo(token)
        except Exception as e:
            raise HTTPException(status_code=401, detail="Token invalide")

    @staticmethod
    def logout(refresh_token: str):
        try:
            keycloak_openid.logout(refresh_token)
            return {"message": "Déconnexion réussie"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))"""