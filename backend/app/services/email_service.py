import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_email_otp(to_email: str, otp_code: str) -> bool:
    """
    Sends a 6-digit verification code (OTP) via SMTP to the target user email.
    """
    try:
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning("SMTP credentials not configured. Skipping email send.")
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"ParkEase Verification Code: {otp_code}"
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = to_email

        text_content = f"Your ParkEase verification code is: {otp_code}. It will expire in 10 minutes."

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
            .container {{ max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
            .header {{ text-align: center; margin-bottom: 24px; }}
            .title {{ font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; }}
            .subtitle {{ font-size: 14px; color: #64748b; margin: 0; }}
            .otp-box {{ text-align: center; margin: 28px 0; padding: 20px; background-color: #f0fdf4; border: 2px dashed #22c55e; border-radius: 10px; }}
            .otp-code {{ font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #16a34a; }}
            .footer {{ text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">ParkEase Verification</h1>
              <p class="subtitle">Smart Parking Availability & Location Platform</p>
            </div>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hello,</p>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">Your one-time verification code (OTP) for account registration is:</p>
            <div class="otp-box">
              <div class="otp-code">{otp_code}</div>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code will expire in <strong>10 minutes</strong>. If you did not request this verification, please ignore this email.</p>
            <div class="footer">
              &copy; 2026 ParkEase. All rights reserved.
            </div>
          </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        logger.info(f"OTP email sent successfully to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send OTP email to {to_email}: {e}")
        return False
