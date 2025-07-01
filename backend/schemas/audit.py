import os
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from backend.schemas.auditeur import AuditeurResponse
from backend.schemas.demande_audit import DemandeAuditResponse
from backend.schemas.prestataire import PrestataireResponse
from backend.schemas.affectation import AffectResponse

class AuditBase(BaseModel):
    demande_audit_id: int
    affectation_id: int
    prestataire_id: Optional[int] = None
    auditeur_ids: List[int]

class CommentaireCreate(BaseModel):
    contenu: str

class CommentaireResponse(BaseModel):
    id: int
    contenu: str
    auteur: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True

class PieceJointeResponse(BaseModel):
    id: int
    filename: str
    filepath: str
    auteur: Optional[str]
    upload_date: datetime

    class Config:
        from_attributes = True

class AuditResponse(BaseModel):
    id: int
    total_duration: float
    etat: str
    demande_audit: Optional[DemandeAuditResponse]
    affectation: Optional[AffectResponse]
    prestataire: Optional[PrestataireResponse]
    auditeurs: List[AuditeurResponse] = []
    commentaires: List[CommentaireResponse] = []
    pieces_jointes: List[PieceJointeResponse] = []
    current_duration: Optional[float] = None

    @property
    def fichier_url(self):
        if self.pieces_jointes:
            return f"http://localhost:8000/{self.fichiers_attaches[0].replace(os.sep, '/')}"
        return None


class EtatUpdate(BaseModel):
    new_etat: str

    class Config:
        from_attributes = True