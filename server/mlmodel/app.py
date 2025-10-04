# app.py
import pickle
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
import datetime

# 1️⃣ Generate dummy dataset
X, y = make_classification(n_samples=200, n_features=5, n_informative=3, random_state=42)

# 2️⃣ Train a simple Logistic Regression model
model = LogisticRegression()
model.fit(X, y)

# 3️⃣ Generate huge demo text for metadata
created_on = datetime.datetime.utcnow().isoformat() + "Z"
long_text = "This is a demo line for hackathon purposes. " * 500  # repeated to make it long
extra_text = "\n".join([f"Extra info line {i}: " + "Lorem ipsum dolor sit amet, consectetur adipiscing elit." for i in range(1, 101)])

# Combine all into metadata
metadata = {
    "title": "Adaptive AI Assessment Tool - Mega Demo Model",
    "team": ["Vikas K", "Varun TB", "Mahesh N"],
    "description": "This is a demo model with extremely long text metadata for hackathon purposes.",
    "created_on": created_on,
    "usage": "Load via pickle and call model.predict([...]) in backend.",
    "notes": long_text + "\n" + extra_text,
    "sample_qna": [
        "Q: What is this file? A: Demo model with long text for hackathon.",
        "Q: How to use it? A: Load using pickle in Python backend.",
        "Q: Who created it? A: Team CodeAI."
    ]
}

# 4️⃣ Assemble payload
payload = {
    "model": model,
    "metadata": metadata
}

# 5️⃣ Save to model.pkl
with open("model.pkl", "wb") as f:
    pickle.dump(payload, f)

print("model.pkl created successfully with lots of demo text!")
