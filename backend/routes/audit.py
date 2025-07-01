from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from backend.config.keycloak_config import get_current_user
from backend.config.logger import log_user_action
from backend.models.PieceJointe import PieceJointe
from backend.models.audit import Audit
from backend.models.commentaire import Commentaire
from backend.schemas.audit import AuditResponse, AuditBase, EtatUpdate, CommentaireCreate, CommentaireResponse, \
    PieceJointeResponse
from backend.services.audit import (
    create_audit,
    get_audit,
    list_audits,
    change_audit_etat,
    compute_current_duration, add_commentaire, upload_piece_jointe,
)
from database import get_db
from log_config import setup_logger

logger = setup_logger()

router = APIRouter()

@router.post("/", response_model=AuditResponse)
def create_audit_route(audit_data: AuditBase, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    log_user_action(username, "Création d’audit")
    return create_audit(db, audit_data)

@router.get("/{audit_id}", response_model=AuditResponse)
def read_audit(audit_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    audit = get_audit(db, audit_id)
    log_user_action(username, "Lecture d’un audit", f"ID : {audit_id}")
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")
    return audit

@router.get("/", response_model=List[AuditResponse])
def read_audits(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    log_user_action(username, "Lecture de la liste des audits")
    return list_audits(db)

@router.patch("/{audit_id}/etat", response_model=AuditResponse)
def update_etat_audit(audit_id: int, etat_update: EtatUpdate, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    log_user_action(username, "Changement d'etat d'un audit", f"ID : {audit_id} | Etat : {etat_update.new_etat}")
    return change_audit_etat(db, audit_id, etat_update.new_etat)

@router.get("/{audit_id}/duration")
def get_audit_duration(audit_id: int, db: Session = Depends(get_db)):
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")
    return {"duration": compute_current_duration(audit)}

@router.post("/{audit_id}/commentaires")
def ajouter_commentaire(
    audit_id: int,
    data: CommentaireCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    auteur = user.get("preferred_username", "Inconnu")
    comm = add_commentaire(db, audit_id, data.contenu, auteur)
    log_user_action(auteur, "Ajouter un commentaire a un audit", f"ID : {audit_id}")
    return comm

@router.post("/{audit_id}/pieces-jointes", response_model=PieceJointeResponse)
def ajouter_piece_jointe(audit_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    auteur = user.get("preferred_username")
    piece = upload_piece_jointe(db, audit_id, file, auteur)
    log_user_action(auteur, "Ajout d'une piece jointe a un audit", f"ID: {audit_id}")
    return piece

@router.get("/{audit_id}/commentaires", response_model=list[CommentaireResponse])
def get_commentaires(audit_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    commentaires = db.query(Commentaire).filter(Commentaire.audit_id == audit_id).order_by(Commentaire.timestamp.desc()).all()
    log_user_action(username, "Ajout d'un commentaire a un audit", f"ID : {audit_id}")
    return commentaires

@router.get("/{audit_id}/pieces-jointes", response_model=list[PieceJointeResponse])
def get_piece_jointe(audit_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    piece_jointes = db.query(PieceJointe).filter(PieceJointe.audit_id == audit_id).order_by(PieceJointe.upload_date.desc()).all()
    log_user_action(username, "Lecture d'une piece jointe d'un audit", f"ID : {audit_id}")
    return piece_jointes