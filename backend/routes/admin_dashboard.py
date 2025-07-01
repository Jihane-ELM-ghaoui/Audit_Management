from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from sqlalchemy import func
from unidecode import unidecode

from database import get_db

from backend.models.auditeur import (Auditeur)
from backend.models.prestataire import Prestataire
from backend.models.plan import Plan
from backend.models.affectation import Affectation
from backend.models.audit import Audit

router = APIRouter()

@router.get("/kpis")
def get_dashboard_kpis(db: Session = Depends(get_db)):
    today = date.today()

    total_auditeurs = db.query(Auditeur).count()
    total_prestataires = db.query(Prestataire).count()

    auditeurs_occupees = (
        db.query(Auditeur)
        .join(Auditeur.affectations)
        .distinct()
        .count()
    )

    audit_types = (
        db.query(Affectation.type_audit, func.count(Audit.id).label("count"))
        .join(Audit, Audit.affectation_id == Affectation.id)
        .group_by(Affectation.type_audit)
        .all()
    )

    taux_occupation = (auditeurs_occupees / total_auditeurs) * 100 if total_auditeurs > 0 else 0

    total_audits = db.query(Audit).count()
    audits_en_cours = db.query(Audit).filter(Audit.etat == "EN COURS").count()
    audits_suspendu = db.query(Audit).filter(Audit.etat == "SUSPENDU").count()
    audits_termines = db.query(Audit).filter(Audit.etat == "TERMINE").count()

    total_affectations = db.query(Affectation).count()

    top_prestataires = (
        db.query(
            Prestataire.nom,
            func.count(Affectation.id).label("nb_affects")
        )
        .join(Affectation)
        .group_by(Prestataire.id)
        .order_by(func.count(Affectation.id).desc())
        .limit(5)
        .all()
    )

    audits_par_prestataire = (
        db.query(
            Prestataire.nom,
            func.count(Audit.id).label("nb_audits")
        )
        .join(Affectation, Affectation.prestataire_id == Prestataire.id)
        .join(Audit, Audit.affectation_id == Affectation.id)
        .group_by(Prestataire.nom)
        .all()
    )

    # === 🔢 KPIs Prestataires ===
    budget_total_alloue = db.query(func.coalesce(func.sum(Prestataire.budget_total), 0)).scalar()
    realisation_total = db.query(func.coalesce(func.sum(Prestataire.realisation), 0)).scalar()
    solde_total = db.query(func.coalesce(func.sum(Prestataire.solde), 0)).scalar()

    taux_conso_budget = (realisation_total / budget_total_alloue) * 100 if budget_total_alloue > 0 else 0

    prestataires_inactifs = (
        db.query(Prestataire).filter(func.coalesce(Prestataire.realisation, 0) == 0).count()
    )

    return {
        # === KPIs Auditeurs / Audits ===
        "auditeurs_total": total_auditeurs,
        "prestataires_total": total_prestataires,
        "taux_occupation_auditeurs": round(taux_occupation, 2),
        "audits_total": total_audits,
        "audits_en_cours": audits_en_cours,
        "audits_suspendu": audits_suspendu,
        "audits_termines": audits_termines,
        "affectations_total": total_affectations,

        # === KPIs Prestataires ===
        "budget_total_alloue": round(budget_total_alloue, 2),
        "realisation_total": round(realisation_total, 2),
        "solde_total": round(solde_total, 2),
        "taux_conso_budget": round(taux_conso_budget, 2),
        "prestataires_inactifs": prestataires_inactifs,

        # === Données supplémentaires ===
        "top_prestataires": [
            {"nom": nom, "nb_affects": nb_affects}
            for nom, nb_affects in top_prestataires
        ],
        "types_audit": [
            {"type": t, "count": c} for t, c in audit_types
        ],
        "audits_par_prestataire": [
            {"nom": nom, "nb_audits": nb_audits}
            for nom, nb_audits in audits_par_prestataire
        ],
    }

@router.get("/audits-par-mois")
def get_plans_by_month(db: Session = Depends(get_db)):
    results = (
        db.query(
            func.month(Plan.date_realisation).label("mois"),
            func.count(Plan.id).label("nombre")
        )
        .group_by(func.month(Plan.date_realisation))
        .order_by(func.month(Plan.date_realisation))
        .all()
    )
    return [{"mois": mois, "nombre": nombre} for mois, nombre in results]

@router.get("/affect-prestataires")
def get_affect_prestataires(db: Session = Depends(get_db)):
    results = (
        db.query(Prestataire.nom, func.count(Affectation.id).label("nb_affectations"))
        .join(Affectation, Prestataire.id == Affectation.prestataire_id)
        .group_by(Prestataire.nom)
        .order_by(func.count(Affectation.id).desc())
        .limit(5)
        .all()
    )
    return [{"nom": nom, "affectations": nb} for nom, nb in results]

@router.get("/taux-realisation-audits")
def taux_realisation_audits(db: Session = Depends(get_db)):
    results = (
        db.query(
            func.month(Audit.start_time).label("mois"),
            func.count(Audit.id).label("audits_realises")
        )
        .filter(Audit.etat == "TERMINE")
        .group_by(func.month(Audit.start_time))
        .order_by(func.month(Audit.start_time))
        .all()
    )
    return [{"mois": mois, "audits_realises": nb} for mois, nb in results]

@router.get("/prestataires-kpi")
def get_prestataires_kpi(db: Session = Depends(get_db)):
    prestataires = db.query(Prestataire).all()

    result = []
    for p in prestataires:
        budget_total = p.budget_total or 0
        realisation = p.realisation or 0
        solde = p.solde or 0

        taux_conso = (realisation / budget_total * 100) if budget_total > 0 else 0

        result.append({
            "nom": p.nom,
            "budget_total": round(budget_total, 2),
            "realisation": round(realisation, 2),
            "solde": round(solde, 2),
            "taux_conso": round(taux_conso, 2),
        })

    return result
