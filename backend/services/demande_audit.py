import json
import os
import shutil
import uuid
from datetime import date

from fastapi import UploadFile, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional, Dict

from backend.config.encryption import encrypt_password, decrypt_password
from backend.models.DemandeurContact import DemandeurContact
from backend.models.demande_audit import Demande_Audit
from werkzeug.utils import secure_filename

from backend.services.email import send_email_with_pdf, send_email_alerte_demande, send_email_validation_demande, \
    send_email_rejet_demande
from log_config import setup_logger

from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML

logger = setup_logger()

PDF_DIR = "fiches_demandes_audit"
STATIC_DIR = "pictures"
os.makedirs(PDF_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)

# Extensions dangereuses (voir liste précédente)
DANGEROUS_EXTENSIONS = {
    ".exe", ".bat", ".cmd", ".msi", ".vbs", ".js", ".jse", ".wsf", ".ps1", ".gadget",
    ".dll", ".sys", ".drv", ".ocx", ".scr", ".lnk", ".reg", ".hta",
    ".docm", ".xlsm", ".pptm", ".dotm", ".xltm", ".potm",
    ".php", ".asp", ".aspx", ".jsp", ".cgi", ".pl", ".sh", ".py",
    ".iso", ".img",
    ".zip", ".rar", ".7z", ".cab"
}

def save_uploaded_file(upload_file: UploadFile):
    logger.debug("Tentative de sauvegarde du fichier")

    try:
        # Récupérer et sécuriser l'extension
        original_filename = secure_filename(upload_file.filename)
        _, file_extension = os.path.splitext(original_filename)
        file_extension = file_extension.lower()

        # Refuser les extensions dangereuses
        if file_extension in DANGEROUS_EXTENSIONS:
            logger.warning("Extension de fichier interdite : %s", file_extension)
            return None

        # Renommer avec UUID pour éviter les collisions/injections
        new_filename = f"{uuid.uuid4()}{file_extension}"
        upload_folder = "fichiers_attaches_audit"
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, new_filename)

        # Sauvegarde du fichier
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)

        logger.info("Fichier '%s' sauvegardé avec succès sous : %s", original_filename, file_path)
        return file_path

    except Exception as e:
        logger.error("Échec de l'enregistrement du fichier")
        return None

def generate_audit_pdf(demande_audit) -> str:
    pdf_path = os.path.join(PDF_DIR, f"fiche_demande_audit_{demande_audit.id}_{demande_audit.nom_app}_{demande_audit.date_creation}.pdf")

    # Load the HTML template
    env = Environment(loader=FileSystemLoader('templates'))
    template = env.get_template('fiche_demande_audit_template.html')

    try:
        template = env.get_template("fiche_demande_audit_template.html")

        # Prepare data
        fichiers_list = []
        if demande_audit.fichiers_attaches:
            if isinstance(demande_audit.fichiers_attaches, str):
                try:
                    fichiers_list = json.loads(demande_audit.fichiers_attaches)
                except json.JSONDecodeError:
                    fichiers_list = [demande_audit.fichiers_attaches]
            else:
                fichiers_list = demande_audit.fichiers_attaches
        if not fichiers_list:
            fichiers_list = ["Aucun"]

        logo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "pictures", "logo.png"))
        logo_path_url = f"file:///{logo_path.replace(os.sep, '/')}"

        contacts = demande_audit.contacts if hasattr(demande_audit, "contacts") else []

        comptes_test = demande_audit.comptes_test if demande_audit.comptes_test else []

        architecture_filename = os.path.basename(
            demande_audit.architecture_file_path) if demande_audit.architecture_file_path else "Aucun"

        html_content = template.render(
            demande_audit=demande_audit,
            fichiers=fichiers_list,
            fichiers_attaches_urls=getattr(demande_audit, "fichiers_attaches_urls", []),
            architecture_file_url=getattr(demande_audit, "architecture_file_url", ""),
            logo_path=logo_path_url,
            contacts=contacts,
            comptes_test=comptes_test,
            architecture_filename=architecture_filename
        )

        HTML(string=html_content).write_pdf(pdf_path)
        return pdf_path

    except Exception as e:
        raise HTTPException(status_code=500, detail="Échec lors de la génération du PDF")

def create_demande_audit(
    contacts: List[Dict],
    demandeur_email: str,
    nom_app: str,
    description: str,
    liste_fonctionalites: str,
    type_app: str,
    type_app_2: str,
    architecture_projet: bool,
    commentaires_archi: str,
    protection_waf: bool,
    commentaires_waf: str,
    ports: bool,
    liste_ports: str,
    cert_ssl_domain_name: bool,
    commentaires_cert_ssl_domain_name: str,
    logs_siem: bool,
    commentaires_logs_siem: str,
    sys_exploitation: str,
    logiciels_installes: str,
    env_tests: str,
    donnees_prod: bool,
    liste_si_actifs: str,
    compte_admin: str,
    nom_domaine: str,
    url_app: str,
    existance_swagger: bool,
    commentaires_existance_swagger: str,
    comptes_test: List[Dict[str, str]],
    code_source: str,
    date_previsionnelle: date,
    db: Session,
    fichiers_attaches: List[UploadFile] = [],
    fichiers_attaches_urls: List[str] = [],
    architecture_file: Optional[UploadFile] = None,
    architecture_file_url: Optional[str] = None
) -> Demande_Audit:
    logger.info("Début de la création d'une demande d'audit.")
    logger.debug("Création d'un audit.")

    # Sauvegarde fichier architecture uniquement si fourni
    architecture_path = None
    if architecture_file:
        architecture_path = save_uploaded_file(architecture_file)

    fichiers_paths = []
    for file in fichiers_attaches:
        path = save_uploaded_file(file)
        if path:
            fichiers_paths.append(path)
        else:
            logger.error("Échec de l'enregistrement du fichier : %s", file.filename)
            raise HTTPException(status_code=400, detail=f"Failed to upload file: {file.filename}")

    contact_instances = [
        DemandeurContact(**contact.dict()) if isinstance(contact, BaseModel) else DemandeurContact(**contact)
        for contact in contacts
    ]

    fichiers_attaches_urls_list = fichiers_attaches_urls or []

    for compte in comptes_test:
        mot_de_passe = compte.get("mot_de_passe")
        if mot_de_passe:
            compte["mot_de_passe"] = encrypt_password(mot_de_passe)

    # Création de l'objet ORM
    demande = Demande_Audit(
        contacts=contact_instances,
        demandeur_email=demandeur_email,
        nom_app=nom_app,
        description=description,
        liste_fonctionalites=liste_fonctionalites,
        type_app=type_app,
        type_app_2=type_app_2,
        architecture_projet=architecture_projet,
        architecture_file_path=architecture_path,
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
        comptes_test=comptes_test,
        code_source=code_source,
        date_previsionnelle=date_previsionnelle,
        fichiers_attaches=fichiers_paths,
        fichiers_attaches_urls=fichiers_attaches_urls_list
    )

    db.add(demande)
    db.flush()
    db.commit()
    db.refresh(demande)

    logger.info("Demande d'audit insérée en base avec succès. ID : %d", demande.id)

    # Génération du PDF
    pdf_path = generate_audit_pdf(demande)
    demande.fiche_demande_path = pdf_path
    db.commit()

    with open(pdf_path, "rb") as f:
        pdf_data = f.read()

    first_email = demande.contacts[0].email if demande.contacts else "default@email.com"

    send_email_with_pdf(
        to_email=first_email,
        subject="Confirmation de la demande d'audit",
        body="Votre demande d'audit a bien été enregistrée.",
        content_type="html",
        pdf_filename="fiche_demande_audit.pdf",
        pdf_content=pdf_data,
        template_name="default_template.html"
    )

    logger.info("Email de confirmation envoyee avec succes.")

    send_email_alerte_demande(
        subject="Alerte d'une nouvelle demande d'audit",
        body="Nouvelle demande d'audit.",
        content_type="html",
        pdf_filename="fiche_demande_audit.pdf",
        pdf_content=pdf_data,
        template_name="alerte_template.html"
    )

    logger.info("Email d'alerte envoyee avec succes.")

    logger.info("Demande d'audit finalisée. Fiche PDF générée à l'emplacement : %s", pdf_path)

    return demande

def get_all_audits(db: Session) -> List[Demande_Audit]:
    demande_audits = db.query(Demande_Audit).all()
    logger.info("Récupération de tous les audits. Total : %d", len(demande_audits))
    return demande_audits


def get_audit_by_id(demande_audit_id: int, db: Session) -> Optional[Demande_Audit]:
    demande_audit = db.query(Demande_Audit).filter(Demande_Audit.id == demande_audit_id).first()
    if demande_audit.comptes_test:
        comptes_dechiffres = []
        for compte in demande_audit.comptes_test:
            mot_de_passe_crypte = compte.get("mot_de_passe")
            mot_de_passe_dechiffre = decrypt_password(mot_de_passe_crypte) if mot_de_passe_crypte else ""
            comptes_dechiffres.append({
                **compte,
                "mot_de_passe": mot_de_passe_dechiffre
            })
        demande_audit.comptes_test = comptes_dechiffres

    else:
        logger.warning("Aucun audit trouvé pour l'ID %d", demande_audit_id)
    return demande_audit

def update_etat_audit(audit_id: int, new_etat: str, db: Session, commentaire_rejet: Optional[str] = None):
    logger.info("Mise à jour de l'état de l'audit ID %d vers: %s", audit_id, new_etat)

    demande_audit = db.query(Demande_Audit).filter(Demande_Audit.id == audit_id).first()

    if not demande_audit:
        logger.error("Audit ID %d non trouvé", audit_id)
        raise HTTPException(status_code=404, detail="Audit not found")

    if new_etat.lower() == "rejetée" and not commentaire_rejet:
        raise HTTPException(status_code=400, detail="Le commentaire de rejet est requis.")

    demande_audit.etat = new_etat
    db.commit()
    db.refresh(demande_audit)

    logger.info("État mis à jour avec succès pour l'audit ID %d | Nouvel état: %s", audit_id, new_etat)

    first_email = demande_audit.contacts[0].email if demande_audit.contacts else "default@email.com"

    try:
        if new_etat.lower() == "validée":
            send_email_validation_demande(
                to_email=first_email,
                subject="Validation de la demande d'audit",
                body=f"Bonjour,Votre demande d'audit a été validée.",
                content_type="html"
            )
            logger.info("Email de validation envoyé à %s", demande_audit.demandeur_email_1)

        elif new_etat.lower() == "rejetée":
            send_email_rejet_demande(
                to_email=first_email,
                subject="Rejet de votre demande d'audit",
                body=(
                    f"{commentaire_rejet}"
                ),
                content_type="html"
            )
            logger.info("Email de rejet envoyé à %s", demande_audit.demandeur_email_1)

    except Exception as e:
        logger.error("Erreur lors de l'envoi de l'email: %s", str(e), exc_info=True)

    return demande_audit
