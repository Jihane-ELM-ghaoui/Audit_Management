from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from backend.config.keycloak_config import get_current_active_user_with_roles
from database import get_db
from backend.schemas.demande_audit import DemandeAuditResponse
from backend.models.demande_audit import Demande_Audit

from log_config import setup_logger

logger = setup_logger()

router = APIRouter()


@router.get("/mes-demandes", response_model=List[DemandeAuditResponse])
def get_demandes_du_project_manager(
    db: Session = Depends(get_db),
    user=Depends(get_current_active_user_with_roles(["project_manager"]))
):
    email = user.get("email")
    demandes = db.query(Demande_Audit).filter(Demande_Audit.demandeur_email == email).all()
    return demandes
