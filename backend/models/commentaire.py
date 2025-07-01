from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Commentaire(Base):
    __tablename__ = "commentaires"

    id = Column(Integer, primary_key=True)
    audit_id = Column(Integer, ForeignKey("audits.id"), nullable=False)
    contenu = Column(String(500), nullable=False)
    auteur = Column(String(200), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    audit = relationship("Audit", back_populates="commentaires")
