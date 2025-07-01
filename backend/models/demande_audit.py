from sqlalchemy import Column, Integer, String, Date, Boolean, func, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy_utils import EmailType

from database import Base
from datetime import date

class Demande_Audit(Base):
    __tablename__ = "demandes_audits"

    id = Column(Integer, primary_key=True, index=True)
    etat = Column(String(50), default="En attente", index=True)
    date_creation = Column(Date, default=date.today, nullable=False, index=True)
    updated_at = Column(Date, onupdate=func.current_date())

    # Identification du demandeur
    contacts = relationship("DemandeurContact", back_populates="demande_audit", cascade="all, delete-orphan")
    demandeur_email = Column(String(255), nullable=False, index=True)

    # Application ou Solution
    nom_app = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    liste_fonctionalites = Column(Text, nullable=False)
    type_app = Column(String(100), nullable=False)
    type_app_2 = Column(String(100), nullable=False)

    # Exigence techniques
    architecture_projet = Column(Boolean, nullable=False) # True = Existe
    architecture_file_path = Column(String(255), nullable=True)
    architecture_file_url = Column(String(255), nullable=True)
    commentaires_archi = Column(Text, nullable=False)
    protection_waf = Column(Boolean, nullable=False) # True = Existe
    commentaires_waf = Column(Text, nullable=False)
    ports = Column(Boolean, nullable=False)
    liste_ports = Column(Text, nullable=False)
    cert_ssl_domain_name = Column(Boolean, nullable=False)
    commentaires_cert_ssl_domain_name = Column(Text, nullable=False)
    logs_siem = Column(Boolean, nullable=False)
    commentaires_logs_siem = Column(Text, nullable=False)

    # Prerequis techniques
    sys_exploitation = Column(String(100), nullable=False)
    logiciels_installes = Column(Text, nullable=False)
    env_tests = Column(String(100), nullable=False)
    donnees_prod = Column(Boolean, nullable=False)
    liste_si_actifs = Column(Text, nullable=False)
    compte_admin = Column(String(150), nullable=False)
    nom_domaine = Column(String(100), nullable=False)
    url_app = Column(String(100), nullable=False)
    existance_swagger = Column(Boolean, nullable=False)
    commentaires_existance_swagger = Column(Text, nullable=False)
    comptes_test = Column(JSON, nullable=False)
    code_source = Column(String(255), nullable=False)

    date_previsionnelle = Column(Date, nullable=True)

    fichiers_attaches = Column(JSON, nullable=True)
    fichiers_attaches_urls = Column(JSON, nullable=True)
    fiche_demande_path = Column(String(255), nullable=True)

    affectations = relationship("Affectation", back_populates="demande_audit")
    audit = relationship("Audit", back_populates="demande_audit")
    #plans = relationship("Plan", back_populates="audit")


    def __repr__(self):
        return f"<Audit(id={self.id}, etat={self.etat})>"
