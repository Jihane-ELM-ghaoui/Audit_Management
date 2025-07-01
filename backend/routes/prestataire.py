from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import date

from backend.config.keycloak_config import get_current_user
from backend.config.logger import log_user_action
from backend.schemas.prestataire import PrestataireCreate, PrestataireResponse, PrestataireUpdate
from backend.services import prestataire as service
from backend.services.prestataire import delete_prestataire
from database import get_db

router = APIRouter()

@router.post("/", response_model=PrestataireResponse)
async def create_prestataire(
    nom: str = Form(...),
    numero_marche: str = Form(None),
    objet_marche: str = Form(None),
    budget_total: float = Form(None),
    date_debut: date = Form(None),
    date_fin: date = Form(None),
    realisation: float = Form(0.0),
    classes: str = Form(None),
    budget_jour_homme: float = Form(None),
    lettre_commande: UploadFile = File(None),
    pv_reception: UploadFile = File(None),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    username = user.get("preferred_username")
    log_user_action(username, "Création d’un nouveau prestataire")
    lettre_path = service.save_file(lettre_commande, nom) if lettre_commande else None
    pv_path = service.save_file(pv_reception, nom) if pv_reception else None

    data = {
        "nom": nom,
        "numero_marche": numero_marche,
        "objet_marche": objet_marche,
        "budget_total": budget_total,
        "date_debut": date_debut,
        "date_fin": date_fin,
        "realisation": realisation,
        "classes": classes,
        "budget_jour_homme": budget_jour_homme,
        "lettre_commande": lettre_path,
        "pv_reception": pv_path,
    }

    return service.create_prestataire(db, PrestataireCreate(**data))

@router.get("/", response_model=list[PrestataireResponse])
def list_prestataires(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    log_user_action(username, "Lecture de la liste des prestataires")
    return service.get_prestataires(db)

@router.get("/{prestataire_id}", response_model=PrestataireResponse)
def get_prestataire(prestataire_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    log_user_action(username, "Lecture d'un prestataire", f"ID : {prestataire_id}")
    prestataire = service.get_prestataire_obj(db, prestataire_id)
    if not prestataire:
        raise HTTPException(status_code=404, detail="Prestataire introuvable")
    return prestataire

@router.put("/{prestataire_id}", response_model=PrestataireResponse)
async def update_prestataire(
    prestataire_id: int,
    nom: str = Form(...),
    numero_marche: str = Form(None),
    objet_marche: str = Form(None),
    budget_total: float = Form(None),
    date_debut: date = Form(None),
    date_fin: date = Form(None),
    realisation: float = Form(0.0),
    classes: str = Form(None),
    budget_jour_homme: float = Form(None),
    pieces_jointes: List[UploadFile] = File(None),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    username = user.get("preferred_username")
    log_user_action(username, "Modification d'un prestataire", f"ID : {prestataire_id}")
    # Construction de l'objet Pydantic
    prestataire_data = PrestataireUpdate(
        nom=nom,
        numero_marche=numero_marche,
        objet_marche=objet_marche,
        budget_total=budget_total,
        date_debut=date_debut,
        date_fin=date_fin,
        realisation=realisation,
        classes=classes,
        budget_jour_homme=budget_jour_homme,
    )

    updated = service.update_prestataire_with_files(
        db, prestataire_id, prestataire_data, pieces_jointes
    )

    if not updated:
        raise HTTPException(status_code=404, detail="Prestataire introuvable")

    return updated

@router.delete("/{id}", status_code=204)
def delete_prestataire_route(id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    username = user.get("preferred_username")
    log_user_action(username, "Suppression d'un prestataire", f"ID : {id}")
    obj = delete_prestataire(db, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Prestataire non trouvé")
    return