from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.mime.image import MIMEImage
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from sqlalchemy.orm import Session
import smtplib

from backend.models.email import Email
from settings import settings
from log_config import setup_logger

logger = setup_logger()

# Configuration des templates
TEMPLATE_DIR = Path(__file__).parent.parent.parent / "templates/emails"
LOGO_PATH = Path(__file__).parent.parent.parent / "pictures" / "logo.png"

template_env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))


def log_email_to_db(
    subject: str,
    body: str,
    to_email: str,
    sender: str,
    status: str,
    error_message: str = None
):
    email_record = Email(
        subject=subject,
        message=body,
        recipient=to_email,
        sender=sender,
        status=status,
        sent_at=datetime.utcnow() if status == 'sent' else None,
        error_message=error_message
    )


def render_html_email(template_name: str, context: dict) -> str:
    try:
        template = template_env.get_template(template_name)
        html_content = template.render(context)
        return html_content.replace('src="/pictures/logo.png"', 'src="cid:logo_cam"')
    except Exception as e:
        logger.error(f"Erreur de rendu du template: {e}", exc_info=True)
        return context["body"].replace('\n', '<br>')


def attach_logo(msg: MIMEMultipart):
    try:
        with open(LOGO_PATH, "rb") as img_file:
            logo = MIMEImage(img_file.read())
            logo.add_header('Content-ID', '<logo_cam>')
            logo.add_header('Content-Disposition', 'inline', filename="logo.png")
            msg.attach(logo)
    except Exception as e:
        logger.warning(f"Impossible d'attacher le logo: {e}", exc_info=True)


def build_email(
    to_email: str,
    subject: str,
    body: str,
    template_name: str,
    pdf_filename: str = None,
    pdf_content: bytes = None
) -> MIMEMultipart:
    msg = MIMEMultipart('mixed')
    msg['From'] = settings.SMTP_USER
    msg['To'] = to_email
    msg['Subject'] = subject

    context = {"subject": subject, "body": body.replace('\n', '<br>')}
    html = render_html_email(template_name, context)

    alt_part = MIMEMultipart('alternative')
    alt_part.attach(MIMEText(body, 'plain'))
    alt_part.attach(MIMEText(html, 'html'))
    msg.attach(alt_part)

    attach_logo(msg)

    if pdf_content and pdf_filename:
        pdf = MIMEApplication(pdf_content, Name=pdf_filename)
        pdf['Content-Disposition'] = f'attachment; filename="{pdf_filename}"'
        msg.attach(pdf)

    return msg


def send_email(
    to_email: str,
    subject: str,
    body: str,
    template_name: str,
    pdf_filename: str = None,
    pdf_content: bytes = None
):
    try:
        msg = build_email(to_email, subject, body, template_name, pdf_filename, pdf_content)

        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        log_email_to_db(subject, body, to_email, settings.SMTP_USER, "sent")

    except Exception as e:
        logger.error(f"Erreur d'envoi d'email: {e}", exc_info=True)
        log_email_to_db(subject, body, to_email, settings.SMTP_USER, "failed", str(e))
        raise


# ==== Fonctions spécifiques =====

def send_email_with_pdf(
    to_email: str,
    subject: str,
    body: str,
    content_type: str,
    pdf_filename: str,
    pdf_content: bytes,
    template_name: str = "default_template.html"
):
    send_email(to_email, subject, body, template_name, pdf_filename, pdf_content)


def send_email_alerte_demande(
    subject: str,
    body: str,
    content_type: str,
    pdf_filename: str,
    pdf_content: bytes,
    template_name: str = "alerte_template.html"
):
    send_email(settings.SMTP_RECEIVER_USER, subject, body, template_name, pdf_filename, pdf_content)


def send_email_validation_demande(
    to_email: str,
    subject: str,
    body: str,
    content_type: str,
    template_name: str = "validation_template.html"
):
    send_email(to_email, subject, body, template_name)


def send_email_rejet_demande(
    to_email: str,
    subject: str,
    body: str,
    content_type: str,
    template_name: str = "rejet_template.html"
):
    send_email(to_email, subject, body, template_name)
