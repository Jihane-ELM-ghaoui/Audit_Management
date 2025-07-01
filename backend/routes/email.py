from fastapi import APIRouter, HTTPException
from backend.services.email import send_email_with_pdf
from backend.schemas.email import EmailRequest, EmailContentType
import base64
import binascii
from fastapi import HTTPException
from log_config import setup_logger

logger = setup_logger()

router = APIRouter()


@router.post("/send-email-with-pdf")
async def send_email_with_pdf_endpoint(email_request: EmailRequest):
    try:
        # Décodage du PDF
        pdf_content = base64.b64decode(email_request.pdf_content)

        # Envoi de l'email
        send_email_with_pdf(
            to_email=email_request.to_email,
            subject=email_request.subject,
            body=email_request.body,
            content_type=email_request.content_type.value,  # Convertit l'enum en string
            pdf_filename=email_request.pdf_filename,
            pdf_content=pdf_content,
            template_name=email_request.template_name
        )

        return {"message": "Email envoyé avec succès"}
    except Exception as e:
        logger.error(f"Erreur: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))