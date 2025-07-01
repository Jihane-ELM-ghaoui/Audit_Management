from datetime import datetime, timedelta, date
from pathlib import Path
from typing import Optional

from hijri_converter import convert
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session, joinedload

from backend.models.PieceJointe import PieceJointe
from backend.models.audit import Audit
from backend.models.auditeur import Auditeur
from backend.models.affectation import Affectation
from backend.models.commentaire import Commentaire
from backend.schemas.audit import AuditBase
from log_config import setup_logger
import os
from uuid import uuid4

logger = setup_logger()
VALID_ETATS = {"En cours", "Suspendu", "Terminé"}

def create_audit(db: Session, audit_data: AuditBase):
    logger.info("Création d'une nouvelle affectation d'audit")
    auditeurs = db.query(Auditeur).filter(Auditeur.id.in_(audit_data.auditeur_ids)).all()

    audit = Audit(
        demande_audit_id=audit_data.demande_audit_id,
        prestataire_id=audit_data.prestataire_id,
        affectation_id=audit_data.affectation_id,
        auditeurs=auditeurs
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)

    affectation = db.query(Affectation).get(audit_data.affectation_id)
    affectation.etat = "Commencé"
    db.commit()

    logger.info(f"Affectation créée avec succès : ID={audit.id}")
    return audit

def get_audit(db: Session, audit_id: int):
    audit = (
        db.query(Audit)
        .options(
            joinedload(Audit.prestataire),
            joinedload(Audit.demande_audit),
            joinedload(Audit.affectation),
            joinedload(Audit.auditeurs)
        )
        .filter(Audit.id == audit_id)
        .first()
    )

    if not audit:
        logger.warning(f"Aucune affectation trouvée avec ID: {audit_id}")
        return None

    logger.info(f"Affectation trouvée: {audit.id}")
    return audit

def list_audits(db: Session):
    audits = (
        db.query(Audit)
        .options(
            joinedload(Audit.prestataire),
            joinedload(Audit.demande_audit),
            joinedload(Audit.affectation).joinedload(Affectation.auditeurs)
        )
        .all()
    )

    for audit in audits:
        audit.current_duration = compute_current_duration(audit)  # attribut non stocké, juste pour réponse

    return audits


def get_maroc_holidays(year: int):
    # Jours fériés fixes (calendrier grégorien)
    fixed_holidays = [
        date(year, 1, 1),    # Jour de l'an
        date(year, 5, 1),    # Fête du Travail
        date(year, 7, 30),   # Fête du Trône
        date(year, 8, 14),   # Allégeance
        date(year, 8, 20),   # Révolution du Roi et du Peuple
        date(year, 8, 21),   # Fête de la Jeunesse
        date(year, 11, 6),   # Marche Verte
        date(year, 11, 18),  # Fête de l’Indépendance
    ]

    # Jours fériés religieux (convertis depuis Hijri vers Grégorien)
    hijri_holidays = [
        (10, 1),   # Aïd al-Fitr
        (10, 2),   # Aïd al-Fitr (2ème jour)
        (12, 10),  # Aïd al-Adha
        (12, 11),  # Aïd al-Adha (2ème jour)
        (1, 1),    # Ras el-Am (Nouvel an Hégirien)
        (3, 12),   # Mouloud (Anniversaire du Prophète)
        (1, 10),   # Achoura
    ]

    dynamic_holidays = []
    for hijri_month, hijri_day in hijri_holidays:
        # Tester la conversion sur 2 années hégiriennes qui peuvent chevaucher le même an grégorien
        for hijri_year in [year - 1, year]:
            try:
                g_date = convert.Hijri(hijri_year, hijri_month, hijri_day).to_gregorian()
                if g_date.year == year:
                    dynamic_holidays.append(date(g_date.year, g_date.month, g_date.day))
            except Exception:
                continue

    return fixed_holidays + dynamic_holidays

def calculate_working_days(start: date, end: date) -> float:
    if start > end:
        return 0.0

    total_days = 0
    current = start
    while current < end:
        holidays = get_maroc_holidays(current.year)
        if current.weekday() < 5 and current not in holidays:
            total_days += 1
        current += timedelta(days=1)

    return total_days

def update_audit_duration(audit: Audit):
    now = datetime.utcnow()

    if audit.etat == "En cours" and audit.start_time:
        # Ajouter uniquement les jours ouvrables
        added_days = calculate_working_days(audit.start_time.date(), now.date())
        audit.total_duration += added_days
        audit.start_time = now

    elif audit.etat in ["Suspendu", "Terminé"] and audit.start_time:
        added_days = calculate_working_days(audit.start_time.date(), now.date())
        audit.total_duration += added_days
        audit.start_time = None
        audit.last_pause_time = now

def compute_current_duration(audit: Audit):
    duration = audit.total_duration
    if audit.etat == "En cours" and audit.start_time:
        now = datetime.utcnow()
        duration += calculate_working_days(audit.start_time.date(), now.date())
    return round(duration, 2)

def change_audit_etat(db: Session, audit_id: int, new_etat: str):
    if new_etat not in VALID_ETATS:
        raise HTTPException(status_code=400, detail="État invalide")

    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")

    update_audit_duration(audit)

    # Redémarrage si "Suspendu" => "En cours"
    if audit.etat == "Suspendu" and new_etat == "En cours":
        audit.start_time = datetime.utcnow()

    audit.etat = new_etat

    # 🔁 Si terminé, mise à jour realisation & solde du prestataire
    if new_etat == "Terminé" and audit.prestataire and audit.total_duration > 0:
        prestataire = audit.prestataire
        if prestataire.budget_jour_homme and prestataire.budget_total:
            budget_consomé = audit.total_duration * prestataire.budget_jour_homme
            prestataire.realisation = (prestataire.realisation or 0) + budget_consomé
            prestataire.solde = prestataire.budget_total - prestataire.realisation

            # Protection contre les valeurs négatives
            if prestataire.realisation < 0:
                prestataire.realisation = 0
            if prestataire.solde < 0:
                prestataire.solde = 0

            db.commit()
            db.refresh(prestataire)

    db.commit()
    db.refresh(audit)
    return audit


def add_commentaire(db: Session, audit_id: int, contenu: str, auteur: str):
    audit = db.query(Audit).filter(Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")

    commentaire = Commentaire(
        audit_id=audit_id,
        contenu=contenu,
        auteur=auteur
    )
    db.add(commentaire)
    db.commit()
    db.refresh(commentaire)
    return commentaire

UPLOAD_DIR = "commentaires_audit"

def upload_piece_jointe(db: Session, audit_id: int, file: UploadFile, auteur: str):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    unique_filename = f"{uuid4()}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, unique_filename)

    with open(filepath, "wb") as buffer:
        buffer.write(file.file.read())

    # Convertir les backslashes \ en slashes / pour une compatibilité Web
    web_friendly_path = Path(filepath).as_posix()

    piece = PieceJointe(
        audit_id=audit_id,
        filename=file.filename,
        auteur=auteur,
        filepath=web_friendly_path
    )
    db.add(piece)
    db.commit()
    db.refresh(piece)
    return piece