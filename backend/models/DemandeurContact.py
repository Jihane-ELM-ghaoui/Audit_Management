from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy_utils import EmailType

from database import Base

class DemandeurContact(Base):
    __tablename__ = "demandeurs_contacts"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    email = Column(EmailType, nullable=False)
    phone = Column(String(20), nullable=False)
    entite = Column(String(100), nullable=False)

    demande_audit_id = Column(Integer, ForeignKey("demandes_audits.id", ondelete="CASCADE"), nullable=False)
    demande_audit = relationship("Demande_Audit", back_populates="contacts")
