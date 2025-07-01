from sqlalchemy import Column, Integer, String, Float, Date, JSON
from sqlalchemy.orm import relationship
from database import Base

class Prestataire(Base):
    __tablename__ = "prestataires"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False, unique=True)
    numero_marche = Column(String(50), nullable=True)
    objet_marche = Column(String(255), nullable=True)
    budget_total = Column(Float, nullable=True)
    date_debut = Column(Date, nullable=True)
    date_fin = Column(Date, nullable=True)
    realisation = Column(Float, default=0.0)
    solde = Column(Float, nullable=True)
    montant_annuel = Column(Float, nullable=True)
    duree = Column(Float, nullable=True)

    classes = Column(String(255), nullable=True)
    lettre_commande = Column(String(255), nullable=True)
    pv_reception = Column(String(255), nullable=True)

    budget_jour_homme = Column(Float, nullable=True)

    pieces_jointes = Column(JSON, nullable=True)

    # Relations si nécessaire
    auditeurs = relationship("Auditeur", back_populates="prestataire")
    affectations = relationship("Affectation", back_populates="prestataire")
    audit = relationship("Audit", back_populates="prestataire")
