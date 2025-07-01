from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.config.keycloak_config import get_current_user
from backend.config.logger import log_user_action
from backend.models.affectation import Affectation
from database import get_db
from typing import List

from backend.models.ip import IP
from backend.schemas.affectation import AffectSchema, AffectResponse
from backend.schemas.auditeur import AuditeurSchema, AuditeurResponse
from backend.schemas.ip import IPResponse
from backend.services.affectation import create_affect, get_affect, list_affects, create_auditeur, list_auditeurs, \
    delete_auditeur, update_auditeur

from log_config import setup_logger

logger = setup_logger()

router = APIRouter()

@router.post("/affects/", response_model=AffectResponse, summary="Creer une affectation", description="Permet de creer une affectation")
def create_affectation(affect_data: AffectSchema, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    log_user_action(username, "Création d’une affectation")
    logger.debug(f"Création d'une nouvelle affectation pour demande_audit_id {affect_data.demande_audit_id}")
    logger.info(f"Création d'une nouvelle affectation")
    return create_affect(db, affect_data)

@router.get("/affects/{affectation_id}", response_model=AffectResponse, summary="Lister les affectations par ID", description="Récupère une affectation par son ID avec les informations associées (auditeurs, prestataires, audit, etc.)")
def read_affect(affectation_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    log_user_action(username, "Lecture d'une affectation", f"ID : {affectation_id}")
    logger.info(f"Lecture de l'affectation ID {affectation_id}")
    affect = get_affect(db, affectation_id)
    if not affect:
        logger.warning(f"Affectation ID {affectation_id} non trouvée")
        raise HTTPException(status_code=404, detail="Affectation non trouvée")
    return affect

@router.get("/affects/", response_model=List[AffectResponse], summary="Lister les affectations", description="Récupère la liste de toutes les affectations avec les informations associées (auditeurs, prestataires, audit...)")
def read_affects(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    log_user_action(username, "Lecture de toutes les affectations")
    logger.info("Lecture de toutes les affectations")
    return list_affects(db)

# Endpoints pour la gestion des auditeurs
@router.post("/auditeurs/", response_model=AuditeurResponse, summary="Creer les auditeurs", description="Permet de creer les auditeurs")
def create_auditor(auditeur_data: AuditeurSchema, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    log_user_action(username, "Création d’un nouveau auditeur")
    logger.info(f"Création d’un auditeur: {auditeur_data.nom} {auditeur_data.prenom}")
    return create_auditeur(db, auditeur_data)


@router.get("/auditeurs/", response_model=List[AuditeurResponse], summary="Lister les auditeurs", description="Récupère la liste de toutes les auditeurs avec les informations associées (nom, prenom, email...)")
def read_auditors(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    log_user_action(username, "Lecture de tout les auditeurs")
    logger.info("Lecture de la liste des auditeurs")
    return list_auditeurs(db)

# Endpoints pour la gestion des IPs
@router.get("/ips/", response_model=List[IPResponse], summary="Lister les IPs", description="Récupère la liste de toutes les IPs et leurs ports")
def read_ips(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    log_user_action(username, "Lecture de la liste IPs")
    logger.info("Lecture de la liste des IPs")
    return db.query(IP).all()

@router.delete("/auditeurs/{auditeur_id}", response_model=AuditeurResponse, summary="Supprimer un auditeur par ID", description="Permet de supprimer un auditeur par son ID de la liste de auditeurs")
def remove_auditeur(auditeur_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    log_user_action(username, "Supprimer un auditeur", f"ID : {auditeur_id}")
    logger.info(f"Suppression de l’auditeur ID {auditeur_id}")
    auditeur = delete_auditeur(db, auditeur_id)
    if not auditeur:
        logger.warning(f"Auditeur ID {auditeur_id} non trouvé pour suppression")
        raise HTTPException(status_code=404, detail="Auditeur not found")
    return auditeur

@router.put("/auditeurs/{auditeur_id}", response_model=AuditeurResponse, summary="Modifier un auditeur", description="Permet de modifier les informations d'un auditeur deja existant")
def update_auditeur_endpoint(auditeur_id: int, auditeur_data: AuditeurSchema, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    logger.info(f"Mise à jour de l’auditeur ID {auditeur_id}")
    auditeur = update_auditeur(db, auditeur_id, auditeur_data)
    log_user_action(username, "Modification d'un auditeur", f"ID : {auditeur_id}")
    if not auditeur:
        logger.warning(f"Auditeur ID {auditeur_id} non trouvé pour mise à jour")
        raise HTTPException(status_code=404, detail="Auditeur non trouvé")
    return auditeur

@router.get("/ips/open")
def get_open_ips(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    open_ips = db.query(IP.adresse_ip).filter(IP.status == "open").all()
    log_user_action(username, "Lecture de la liste des IPs Open")
    return [ip.adresse_ip for ip in open_ips]

@router.put("/ips/{ip_id}/close")
def close_ip(ip_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    ip = db.query(IP).filter(IP.id == ip_id).first()
    if not ip:
        raise HTTPException(status_code=404, detail="IP non trouvée")
    ip.status = "close"
    db.commit()
    log_user_action(username, "Fermer une IP", f"ID : {ip_id}")
    return {"message": "Statut mis à jour à 'close'"}

@router.delete("/ips/{ip_id}")
def delete_ip(ip_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    ip = db.query(IP).filter(IP.id == ip_id).first()
    if not ip:
        raise HTTPException(status_code=404, detail="IP non trouvée")
    db.delete(ip)
    db.commit()
    log_user_action(username, "Supprimer une IP", f"ID : {ip_id}")
    return {"message": "IP supprimée avec succès"}

@router.patch("/affects/{affectation_id}/etat")
def update_etat_affectation(affectation_id: int, etat: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    affect = db.query(Affectation).filter_by(id=affectation_id).first()
    if not affect:
        raise HTTPException(status_code=404, detail="Affectation non trouvée")
    affect.etat = etat
    db.commit()
    log_user_action(username, "Changement d'etat d'une affectation", f"ID : {affectation_id} | Etat : {etat}")
    return {"message": f"État de l'affectation mis à jour en {etat}"}
