import os

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Form
from fastapi.staticfiles import StaticFiles
from backend.config.cors import configure_cors
from backend.config.keycloak_config import get_current_user, keycloak_openid, get_current_active_user_with_roles

from backend.routes.demande_audit import (router as demande_audit_router)
from backend.routes.affectation import (router as affectation_router)
from backend.routes.audit import (router as audit_router)
from backend.routes.plan import (router as plan_router)
from backend.routes.admin_dashboard import (router as admin_router)
from backend.routes.prestataire import (router as prestataire_router)
from backend.routes.logs import (router as logs_router)
from backend.routes.project_manager_dashboard import (router as manager_router)

from database import Base, engine

load_dotenv()

Base.metadata.create_all(bind=engine)

docs_url = "/docs"
redoc_url = "/redoc"
openapi_url = "/openapi.json"

if os.getenv("ENV") == "production":
    docs_url = None
    redoc_url = None
    openapi_url = None

app = FastAPI(
    docs_url=docs_url,
    redoc_url=redoc_url,
    openapi_url=openapi_url
)

configure_cors(app)
#app.add_middleware(LoggingMiddleware)

app.include_router(demande_audit_router, prefix="/audits", tags=["Demandes Audits"])
app.include_router(affectation_router, prefix="/affectation", tags=["Affectations"], dependencies=[Depends(get_current_active_user_with_roles(["admin", "gacam_team"]))])
app.include_router(audit_router, prefix="/audit", tags=["Audits"], dependencies=[Depends(get_current_active_user_with_roles(["admin", "gacam_team"]))])
app.include_router(plan_router, prefix="/plan", tags=["Plans"], dependencies=[Depends(get_current_active_user_with_roles(["admin", "gacam_team"]))])
app.include_router(admin_router, prefix="/admin", tags=["Admin Dashboard"], dependencies=[Depends(get_current_active_user_with_roles(["admin"]))])
app.include_router(prestataire_router, prefix="/prestataire", tags=["Prestataire"], dependencies=[Depends(get_current_active_user_with_roles(["admin", "gacam_team"]))])
app.include_router(logs_router, prefix="/logs", tags=["Logs"], dependencies=[Depends(get_current_active_user_with_roles(["admin"]))])
app.include_router(manager_router, prefix="/manager", tags=["Manager"], dependencies=[Depends(get_current_active_user_with_roles(["project_manager"]))])


app.mount("/fichiers_attaches_audit", StaticFiles(directory="fichiers_attaches_audit"), name="fichiers_attaches_audit")
app.mount("/fiches_demandes_audit", StaticFiles(directory="fiches_demandes_audit"), name="fiches_demandes_audit")
app.mount("/fichiers_affectations", StaticFiles(directory="fichiers_affectations"), name="fichiers_affectations")
app.mount("/commentaires_audit", StaticFiles(directory="commentaires_audit"), name="commentaires_audit")
app.mount("/prestataire", StaticFiles(directory="prestataire"), name="prestataire")

@app.get("/")
def root():
    return {"message": "Bienvenue sur l'APP de gestion des audits"}

"""@app.get("/protected")
def protected(user=Depends(get_current_user)):
    return {"user": user}"""

@app.post("/refresh")
def refresh_token(refresh_token: str = Form(...)):
    try:
        new_token = keycloak_openid.refresh_token(refresh_token)
        return new_token
    except Exception:
        raise HTTPException(status_code=401, detail="Refresh token invalid or expired")

@app.post("/token")
def login(username: str = Form(...), password: str = Form(...)):
    try:
        token = keycloak_openid.token(username, password)
        return token
    except Exception:
        raise HTTPException(status_code=401, detail="Login failed")

@app.post("/logout")
def logout(refresh_token: str = Form(...)):
    try:
        keycloak_openid.logout(refresh_token)
        return {"detail": "Successfully logged out"}
    except Exception:
        raise HTTPException(status_code=400, detail="Logout failed")

@app.get("/me")
def read_users_me(user: dict = Depends(get_current_user)):
    return user



"""@app.get("/admin-data")
def admin_data(user=Depends(get_current_active_user_with_roles(["admin"]))):
    return {"message": "Welcome admin!"}"""

@app.get("/team")
def team_data(user=Depends(get_current_active_user_with_roles(["gacam_team"]))):
    return {"message": "Hello GACAM team!"}

@app.get("/project")
def project_data(user=Depends(get_current_active_user_with_roles(["project_manager"]))):
    return {"message": "Hello project manager!"}

@app.get("/protected")
def protected(user=Depends(get_current_user)):
    return {"user": user}

@app.get("/admin-data")
def admin_data(user=Depends(get_current_active_user_with_roles(["admin"]))):
    return {"message": "Welcome admin!"}

@app.get("/debug-roles")
def debug_roles(user=Depends(get_current_user)):
    return user.get("realm_access", {}).get("roles", [])
