import os

from fastapi import Form
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import date, datetime


class ContactDemandeurBase(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    phone: str
    entite: str

class ContactDemandeurCreate(ContactDemandeurBase):
    pass

class CompteTest(BaseModel):
    identifiant: str
    mot_de_passe: str

class DemandeAuditBase(BaseModel):

    # Identification du demandeur
    contacts: List[ContactDemandeurCreate]

    @validator("contacts")
    def check_at_least_one_contact(cls, v):
        if not v or len(v) == 0:
            raise ValueError("Au moins un contact est requis.")
        return v

    # Application ou Solution
    nom_app: str
    description: str
    liste_fonctionalites: str
    type_app: str
    type_app_2: str

    # Exigences techniques
    architecture_projet: bool
    architecture_file_path: Optional[str] = None
    architecture_file_url: Optional[str] = None
    commentaires_archi: Optional[str] = "None"
    protection_waf: bool
    commentaires_waf: Optional[str] = "None"
    ports: bool
    liste_ports: str
    cert_ssl_domain_name: bool
    commentaires_cert_ssl_domain_name: Optional[str] = "None"
    logs_siem: bool
    commentaires_logs_siem: Optional[str] = "None"

    # Prérequis techniques
    sys_exploitation: str
    logiciels_installes: Optional[str] = "None"
    env_tests: str
    donnees_prod: bool
    liste_si_actifs: str
    compte_admin: str
    nom_domaine: str
    url_app: str
    existance_swagger: bool
    commentaires_existance_swagger: Optional[str] = "None"
    comptes_test: List[CompteTest]
    code_source: str

    date_previsionnelle: date

    fichiers_attaches: Optional[List[str]] = []
    fichiers_attaches_urls: Optional[List[str]] = []

class DemandeAuditCreate(DemandeAuditBase):
    pass

class DemandeAuditResponse(DemandeAuditBase):
    id: int
    date_creation: date
    etat: str
    fiche_demande_path: Optional[str] = None

    @property
    def fichier_url(self):
        if self.fichiers_attaches:
            return f"http://localhost:8000/{self.fichiers_attaches[0].replace(os.sep, '/')}"
        return None

class DemandeAuditOut(DemandeAuditBase):
    id: int
    date_creation: date
    updated_at: datetime

    class Config:
        from_attributes = True
