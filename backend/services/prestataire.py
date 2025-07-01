import os
import shutil
from typing import List

from fastapi import UploadFile
from sqlalchemy.orm import Session
from datetime import datetime

from backend.models.prestataire import Prestataire
from backend.schemas.prestataire import PrestataireCreate, PrestataireUpdate
from log_config import setup_logger

logger = setup_logger()

def save_file(file: UploadFile, prestataire_name: str, upload_folder: str = "prestataire") -> str:
    try:
        folder = os.path.join(upload_folder, prestataire_name.replace(" ", "_"))
        os.makedirs(folder, exist_ok=True)
        file_path = os.path.join(folder, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        logger.info(f"Fichier sauvegardé : {file_path}")
        return file_path
    except Exception as e:
        logger.error(f"Erreur sauvegarde : {str(e)}")
        return None

def compute_budget_fields(data: dict):
    start = data.get("date_debut")
    end = data.get("date_fin")
    budget = data.get("budget_total")
    real = data.get("realisation", 0.0)

    if start and end and budget:
        duree = (end - start).days / 365.0
        montant_annuel = budget / duree if duree > 0 else 0
        solde = budget - real

        data["duree"] = round(duree, 2)
        data["montant_annuel"] = round(montant_annuel, 2)
        data["solde"] = round(solde, 2)

    return data

def create_prestataire(db: Session, prestataire: PrestataireCreate):
    data = prestataire.dict()
    data = compute_budget_fields(data)
    db_obj = Prestataire(**data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_prestataire_with_files(
    db: Session,
    prestataire_id: int,
    prestataire_data: PrestataireUpdate,
    files: List[UploadFile] = None
):
    db_obj = get_prestataire_obj(db, prestataire_id)
    if not db_obj:
        return None

    data = prestataire_data.dict(exclude_unset=True)
    data = compute_budget_fields(data)

    # Gérer les pièces jointes
    if files:
        existing_files = db_obj.pieces_jointes or []
        new_files = []
        for file in files:
            path = save_file(file, db_obj.nom)
            if path:
                new_files.append(path)
        data["pieces_jointes"] = existing_files + new_files

    # Mise à jour des champs
    for key, value in data.items():
        setattr(db_obj, key, value)

    db.commit()
    db.refresh(db_obj)
    return db_obj

def prestataire_to_dict(prestataire: Prestataire) -> dict:
    return {
        "id": prestataire.id,
        "nom": prestataire.nom,
        "numero_marche": prestataire.numero_marche,
        "objet_marche": prestataire.objet_marche,
        "budget_total": prestataire.budget_total,
        "date_debut": prestataire.date_debut,
        "date_fin": prestataire.date_fin,
        "realisation": prestataire.realisation,
        "solde": prestataire.solde,
        "montant_annuel": prestataire.montant_annuel,
        "duree": prestataire.duree,
        "classes": prestataire.classes,
        "lettre_commande": prestataire.lettre_commande,
        "pv_reception": prestataire.pv_reception,
        "budget_jour_homme": prestataire.budget_jour_homme,
        "pieces_jointes": prestataire.pieces_jointes or [],
    }

def get_prestataires(db: Session):
    return [prestataire_to_dict(p) for p in db.query(Prestataire).all()]

def get_prestataire_obj(db: Session, id: int):
    return db.query(Prestataire).filter(Prestataire.id == id).first()

def delete_prestataire(db: Session, id: int):
    obj = get_prestataire_obj(db, id)
    if obj:
        db.delete(obj)
        db.commit()
    return obj

def add_pieces_jointes(db: Session, prestataire_id: int, files: List[UploadFile]):
    prestataire = get_prestataire_obj(db, prestataire_id)
    if not prestataire:
        return None

    if not prestataire.pieces_jointes:
        prestataire.pieces_jointes = []

    paths = []
    for file in files:
        path = save_file(file, prestataire.nom)
        if path:
            paths.append(path)

    prestataire.pieces_jointes.extend(paths)
    db.commit()
    db.refresh(prestataire)
    return paths
