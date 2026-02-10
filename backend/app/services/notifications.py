# MICSA OS - Notifications Service
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

class NotificationService:
    @staticmethod
    def send_email(to_email: str, subject: str, body: str):
        if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
            print(f"📧 [STUB] Sending email to {to_email}: {subject}")
            return True

        try:
            msg = MIMEMultipart()
            msg['From'] = settings.SMTP_FROM or settings.SMTP_USER
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            print(f"📧 Email sent to {to_email}")
            return True
        except Exception as e:
            print(f"❌ Error sending email: {e}")
            return False

    @staticmethod
    def send_whatsapp_stub(to_number: str, message: str):
        print(f"📱 [STUB] Sending WhatsApp to {to_number}: {message}")
        # Preparation for real API (e.g. Twilio, Meta API)
        return True
