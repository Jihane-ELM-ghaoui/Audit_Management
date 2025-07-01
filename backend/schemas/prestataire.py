import os

from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class PrestataireShema(BaseModel):
    nom: str
    numero_marche: Optional[str] = None
    objet_marche: Optional[str] = None
    budget_total: Optional[float] = None
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None
    realisation: Optional[float] = 0.0
    solde: Optional[float] = None
    montant_annuel: Optional[float] = None
    duree: Optional[float] = None
    classes: Optional[str] = None
    lettre_commande: Optional[str] = None
    pv_reception: Optional[str] = None
    budget_jour_homme: Optional[float] = None
    pieces_jointes: Optional[List[str]] = []

    @property
    def fichier_url(self):
        if self.pieces_jointes:
            return f"http://localhost:8000/{self.pieces_jointes[0].replace(os.sep, '/')}"
        return None

class PrestataireCreate(PrestataireShema):
    pass

class PrestataireUpdate(PrestataireShema):
    pass

class PrestataireResponse(PrestataireShema):
    id: int

    class Config:
        from_attributes = True
