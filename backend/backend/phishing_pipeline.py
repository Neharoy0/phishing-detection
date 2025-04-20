import imaplib
import email
from email import policy
import re
import torch
import numpy as np
import torch.nn as nn
import torch.nn.functional as F
import os
import base64
import requests


# Define the CNN model for phishing detection
class EmailCNN(nn.Module):
    def __init__(self):
        super(EmailCNN, self).__init__()
        self.conv1 = nn.Conv1d(1, 128, kernel_size=3, stride=1, padding=1)
        self.conv2 = nn.Conv1d(128, 64, kernel_size=3, stride=1, padding=1)
        self.patch_norm = nn.BatchNorm1d(64)
        self.pool = nn.MaxPool1d(kernel_size=2, stride=2)
        self.global_pool = nn.AdaptiveAvgPool1d(192)
        self.fc1 = nn.Linear(192 * 64, 128)
        self.fc2 = nn.Linear(128, 2)
        self.dropout = nn.Dropout(0.3)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = F.relu(self.conv2(x))
        x = self.patch_norm(x)
        x = self.pool(x)
        x = self.global_pool(x)
        x = x.view(x.size(0), -1)
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x


# Load trained model
model = EmailCNN()
model_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "email_cnn_model.pt"
)
model.load_state_dict(torch.load(model_path, map_location=torch.device("cpu")))
model.eval()

VT_API_KEY = "29bf6da50274c54d7890657c41cf739c5eabd6b7513b5de8854ce24ba5c16325"


def clean_email_body(text):
    """Clean the email body by removing unwanted characters but keeping dots in URLs."""
    if not text or not isinstance(text, str):
        return "", []

    # Extract URLs using regex
    url_pattern = r"https?://\S+"
    urls = re.findall(url_pattern, text)

    # Remove unwanted characters but keep dots in URLs
    text = re.sub(r"<[^>]*>", "", text)  # Remove HTML tags
    text = re.sub(r"http[s]?://\S+", "", text)  # Remove URLs
    text = re.sub(
        r"[^a-zA-Z0-9\s.:/-]", "", text
    )  # Keep letters, digits, spaces, dots, slashes, and colons
    cleaned_text = text.lower().strip()

    return cleaned_text, urls


def extract_urls(text):
    """Extract all URLs from the email body."""
    url_pattern = r"https?://\S+"
    return re.findall(url_pattern, text)


def vt_url_verdict(url, api_key):
    """Get the verdict of the URL using the VirusTotal API."""
    url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
    headers = {"x-apikey": api_key}
    response = requests.get(
        f"https://www.virustotal.com/api/v3/urls/{url_id}", headers=headers
    )
    if response.status_code == 200:
        data = response.json()
        stats = data["data"]["attributes"]["last_analysis_stats"]
        malicious = stats.get("malicious", 0)
        suspicious = stats.get("suspicious", 0)
        return (
            "malicious" if malicious > 0 else "suspicious" if suspicious > 0 else "safe"
        )
    else:
        print("Error getting verdict:", response.status_code, response.text)
        return None


def extract_and_predict_emails(email_user, email_pass, num_emails=5):
    emails_data = []

    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com", 993)
        mail.login(email_user, email_pass)
        mail.select("inbox")
        result, data = mail.search(None, "UNSEEN")
        mail_ids = data[0].split()

        for num in mail_ids[:num_emails]:
            result, data = mail.fetch(num, "(RFC822)")
            raw_email = data[0][1]
            msg = email.message_from_bytes(raw_email, policy=policy.default)

            subject = msg["subject"]
            sender = msg["from"]
            date = msg["date"]

            # Extract body and URLs
            body = ""
            urls = []
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == "text/plain":
                        charset = part.get_content_charset() or "utf-8"
                        body = part.get_payload(decode=True).decode(
                            charset, errors="ignore"
                        )
                        urls = extract_urls(body)  # Extract URLs from the body
                        break
            else:
                charset = msg.get_content_charset() or "utf-8"
                body = msg.get_payload(decode=True).decode(charset, errors="ignore")
                urls = extract_urls(body)

            cleaned_body, urls = clean_email_body(body)

            # Detect verdicts for extracted URLs
            url_verdicts = {}
            for url in urls:
                verdict = vt_url_verdict(url, VT_API_KEY)
                if verdict:
                    url_verdicts[url] = verdict

            # Prepare data to send to the frontend
            input_data = np.array([ord(char) for char in cleaned_body[:12288]])
            input_data = np.pad(input_data, (0, 12288 - len(input_data)), "constant")
            input_tensor = torch.tensor(input_data, dtype=torch.float32).reshape(
                1, 1, 12288
            )

            with torch.no_grad():
                output = model(input_tensor)
                prediction = torch.argmax(output, dim=1).item()
                label = "Phishing" if prediction == 1 else "Safe"

            # Determine final verdict based on body + URLs
            has_malicious_or_suspicious_url = any(
                verdict in ["malicious", "suspicious"] for verdict in url_verdicts.values()
            )

            if has_malicious_or_suspicious_url:
                final_status = "malicious"
            elif prediction == 1:
                final_status = "suspicious"
            else:
                final_status = "clean"


            emails_data.append(
                {
                    "subject": subject,
                    "from": sender,
                    "date": date,
                    "body": cleaned_body[:500],  # Limit size of email body
                    #"is_phishing": prediction == 1,
                    "model_prediction": "Phishing" if prediction == 1 else "Safe",
                    "url_verdicts": url_verdicts,  # Add URL verdicts to each email
                    "urls": urls,  # Add the extracted URLs
                    "status": final_status,
                }
            )

        mail.logout()

    except Exception as e:
        return {"error": str(e)}

    return emails_data


if __name__ == "__main__":
    from pprint import pprint

    EMAIL = "<<enter your email>>"
    PASS = "<<enter app pwd>>"
    pprint(extract_and_predict_emails(EMAIL, PASS, num_emails=5))
