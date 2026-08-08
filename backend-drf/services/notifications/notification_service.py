class NotificationService:
    def send_email(self, to, subject, body):
        print(f"Sending email to {to}: {subject}")

    def send_sms(self, to, message):
        print(f"Sending SMS to {to}: {message}")
