import json
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import List, Optional

from sqlalchemy.testing import db
from sqlalchemy.testing.pickleable import User

from backend.config.keycloak_config import get_current_active_user_with_roles, get_current_user
from backend.config.logger import log_user_action
from database import get_db
from backend.schemas.demande_audit import DemandeAuditResponse, ContactDemandeurCreate
from backend.models.demande_audit import Demande_Audit
from backend.services.demande_audit import create_demande_audit, get_audit_by_id, get_all_audits, update_etat_audit

from log_config import setup_logger

logger = setup_logger()

router = APIRouter()

@router.post("/request", response_model=DemandeAuditResponse)
def create_audit_request(
    contacts: str = Form(...),
    nom_app: str = Form(...),
    description: str = Form(...),
    liste_fonctionalites: str = Form(...),
    type_app: str = Form(...),
    type_app_2: str = Form(...),
    architecture_projet: bool = Form(...),
    architecture_file_url: Optional[str] = Form(None),
    commentaires_archi: Optional[str] = Form(None),
    protection_waf: bool = Form(...),
    commentaires_waf: Optional[str] = Form(None),
    ports: bool = Form(...),
    liste_ports: str = Form(...),
    cert_ssl_domain_name: bool = Form(...),
    commentaires_cert_ssl_domain_name: Optional[str] = Form(None),
    logs_siem: bool = Form(...),
    commentaires_logs_siem: Optional[str] = Form(None),
    sys_exploitation: str = Form(...),
    logiciels_installes: Optional[str] = Form(None),
    env_tests: str = Form(...),
    donnees_prod: bool = Form(...),
    liste_si_actifs: str = Form(...),
    compte_admin: str = Form(...),
    nom_domaine: str = Form(...),
    url_app: str = Form(...),
    existance_swagger: bool = Form(...),
    commentaires_existance_swagger: Optional[str] = Form(None),
    comptes_test: str = Form(...),
    code_source: str = Form(...),
    date_previsionnelle: date = Form(...),
    fichiers_attaches: List[UploadFile] = File(...),
    fichiers_attaches_urls: Optional[str] = Form(None),
    architecture_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_active_user_with_roles(["project_manager", "admin"]))
):
    try:
        contacts_data_raw = json.loads(contacts)
        contacts_data = [ContactDemandeurCreate(**c) for c in contacts_data_raw]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Contacts JSON invalide: {str(e)}")

    contacts = [c.dict() for c in contacts_data]

    try:
        comptes_test_data = json.loads(comptes_test)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Comptes test JSON invalide: {str(e)}")

    email = user.get("email")

    fichiers_attaches_urls_list = []
    if fichiers_attaches_urls:
        try:
            fichiers_attaches_urls_list = json.loads(fichiers_attaches_urls)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"fichiers_attaches_urls JSON invalide: {str(e)}")


    # Appeler la fonction de création de la demande d'audit
    created_demande = create_demande_audit(
        contacts=contacts,
        demandeur_email=email,
        nom_app=nom_app,
        description=description,
        liste_fonctionalites=liste_fonctionalites,
        type_app=type_app,
        type_app_2=type_app_2,
        architecture_projet=architecture_projet,
        architecture_file_url=architecture_file_url,
        commentaires_archi=commentaires_archi,
        protection_waf=protection_waf,
        commentaires_waf=commentaires_waf,
        ports=ports,
        liste_ports=liste_ports,
        cert_ssl_domain_name=cert_ssl_domain_name,
        commentaires_cert_ssl_domain_name=commentaires_cert_ssl_domain_name,
        logs_siem=logs_siem,
        commentaires_logs_siem=commentaires_logs_siem,
        sys_exploitation=sys_exploitation,
        logiciels_installes=logiciels_installes,
        env_tests=env_tests,
        donnees_prod=donnees_prod,
        liste_si_actifs=liste_si_actifs,
        compte_admin=compte_admin,
        nom_domaine=nom_domaine,
        url_app=url_app,
        existance_swagger=existance_swagger,
        commentaires_existance_swagger=commentaires_existance_swagger,
        comptes_test=comptes_test_data,
        code_source=code_source,
        date_previsionnelle=date_previsionnelle,
        fichiers_attaches=fichiers_attaches,
        fichiers_attaches_urls=fichiers_attaches_urls_list,
        architecture_file=architecture_file,
        db=db,
    )

    username = user.get("preferred_username")
    log_user_action(username, "Création d'une demande d'audit")

    return created_demande

@router.get("/", response_model=List[DemandeAuditResponse])
def get_audits(db: Session = Depends(get_db), user=Depends(get_current_active_user_with_roles(["gacam_team", "admin"]))):
    logger.info("Récupération de la liste des audits")
    username = user.get("preferred_username")
    log_user_action(username, "Lecture de la liste des audits")
    demande_audits = get_all_audits(db)
    logger.info("Nombre d'audits récupérés: %d", len(demande_audits))
    return demande_audits


@router.get("/{audit_id}", response_model=DemandeAuditResponse)
def get_audit(audit_id: int, db: Session = Depends(get_db), user=Depends(get_current_active_user_with_roles(["gacam_team", "admin"]))):
    logger.debug("Recherche de l'audit avec l'ID: %d", audit_id)
    username = user.get("preferred_username")
    log_user_action(username, "Lecture d'une demande", f"ID : {audit_id}")
    demande_audit = get_audit_by_id(audit_id, db)
    if not demande_audit:
        logger.warning("Audit non trouvé pour l'ID: %d", audit_id)
        raise HTTPException(status_code=404, detail="Audit not found")
    logger.info("Audit trouvé: ID %d | Type: %s | État: %s", demande_audit.id, demande_audit.etat)
    return demande_audit

@router.patch("/{audit_id}/update-etat")
def update_audit_etat(
    audit_id: int,
    etat: str = Body(...),
    commentaire_rejet: str = Body(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_active_user_with_roles(["gacam_team", "admin"]))
):
    username = user.get("preferred_username")
    log_user_action(username, "Update Etat d'une demande", f"ID : {audit_id} | Etat : {etat}")
    try:
        updated_audit = update_etat_audit(
            audit_id=audit_id,
            new_etat=etat,
            db=db,
            commentaire_rejet=commentaire_rejet
        )
        return updated_audit
    except HTTPException as e:
        raise e
