# 📬 Real-Time Email Phishing Detection Dashboard

## 🔧 Features:
✅ Real-time scanning of unread emails

✅ Email classification using a BERT model

✅ URL analysis with VirusTotal API

✅ Interactive dashboard showing email metadata, prediction, and charts

## 🚀 Setup Instructions:
1. Clone the repo
2. Backend Setup (Flask)
```bash
  cd backend
  pip install -r requirements.txt
  python app.py
  ```
Update app.py with your Gmail credentials, update your VirusTotal api key and ensure phishing_pipeline.py and email_cnn_model.pt are present.

4. Frontend Setup (React)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
