from flask import Flask, jsonify
from flask_cors import CORS
from phishing_pipeline import extract_and_predict_emails
from flask_cors import cross_origin

# updated
EMAIL = "neharoy.proj@gmail.com"
PASS = "ldem hpjb irtq qheu"  # ⚠️ For dev only, remove hardcoded creds in production!

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])


@app.route("/")
def home():
    return "Phishing Detection API is running!"


@app.route("/scan-emails", methods=["GET"])
@cross_origin(origin="http://localhost:5173")
def scan_emails():
    print("scan-emails route hit")
    try:
        results = extract_and_predict_emails(EMAIL, PASS)
        return jsonify(results)  # This will return the email data
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
