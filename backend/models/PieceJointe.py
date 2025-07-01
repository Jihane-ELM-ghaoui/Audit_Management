from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class PieceJointe(Base):
    __tablename__ = "pieces_jointes"

    id = Column(Integer, primary_key=True)
    audit_id = Column(Integer, ForeignKey("audits.id"), nullable=False)
    filename = Column(String(100), nullable=False)
    filepath = Column(String(300), nullable=False)
    auteur = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)

    audit = relationship("Audit", back_populates="pieces_jointes")
