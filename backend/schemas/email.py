from pydantic import BaseModel, EmailStr, validator
from enum import Enum
import base64
import binascii
from typing import Optional


class EmailContentType(str, Enum):
    PLAIN = "plain"
    HTML = "html"


class EmailRequest(BaseModel):
    to_email: EmailStr  # Validation automatique de l'email
    subject: str = "Document important"
    body: str  # Texte brut, sera converti en HTML automatiquement
    content_type: EmailContentType = EmailContentType.HTML
    pdf_filename: str = "document.pdf"
    pdf_content: str  # Base64
    template_name: Optional[str] = "default_template.html"

    @validator('pdf_content')
    def validate_base64(cls, v):
        try:
            # Ajout du padding manquant si nécessaire
            padding = len(v) % 4
            if padding:
                v += '=' * (4 - padding)
            base64.b64decode(v, validate=True)
            return v
        except binascii.Error as e:
            raise ValueError(f"Encodage Base64 invalide : {str(e)}")

    @validator('pdf_filename')
    def validate_pdf_filename(cls, v):
        if not v.lower().endswith('.pdf'):
            raise ValueError("Le nom du fichier doit se terminer par .pdf")
        return v