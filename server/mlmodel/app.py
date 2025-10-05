from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import random
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)

# ====== Load Question Dataset ======
CSV_PATH = "aptitude_questions_500.csv"

if not os.path.exists(CSV_PATH):
    raise FileNotFoundError("⚠️ CSV file not found! Please run generate_questions.py first.")

df = pd.read_csv(CSV_PATH)

# ====== API ROUTES ======

@app.route("/")
def home():
    return jsonify({"message": "Flask Quiz API is running successfully!"})

# Get list of all topics
@app.route("/topics", methods=["GET"])
def get_topics():
    topics = sorted(df["tags"].dropna().unique().tolist())
    return jsonify({"topics": topics})

# Get random quiz questions
@app.route("/get-questions", methods=["POST"])
def get_questions():
    data = request.get_json()
    topic = data.get("topic", "Mixed")
    num_questions = int(data.get("num_questions", 10))

    if topic == "Mixed":
        questions = df.sample(num_questions)
    else:
        questions = df[df["tags"] == topic].sample(min(num_questions, len(df[df["tags"] == topic])))

    questions_json = []
    for _, row in questions.iterrows():
        questions_json.append({
            "id": int(row["id"]),
            "question": row["question_text"],
            "options": {
                "a": row["option_a"],
                "b": row["option_b"],
                "c": row["option_c"],
                "d": row["option_d"]
            },
            "difficulty": row["difficulty"],
            "topic": row["tags"]
        })
    return jsonify({"questions": questions_json})

# Submit answers and calculate score
@app.route("/submit", methods=["POST"])
def submit_quiz():
    data = request.get_json()
    answers = data.get("answers", {})
    topic = data.get("topic", "Mixed")

    score = 0
    total = len(answers)
    results = []

    for qid, selected in answers.items():
        qid = int(qid)
        row = df.loc[df["id"] == qid]
        if row.empty:
            continue
        correct = row.iloc[0]["answer"]
        is_correct = (selected == correct)
        if is_correct:
            score += 1

        results.append({
            "id": qid,
            "question": row.iloc[0]["question_text"],
            "chosen": selected,
            "correct": correct,
            "is_correct": is_correct
        })

    accuracy = round((score / total) * 100, 2) if total > 0 else 0

    result_summary = {
        "topic": topic,
        "score": score,
        "total": total,
        "accuracy": accuracy,
        "results": results
    }

    # Optional: Save to local file
    result_df = pd.DataFrame([{
        "Topic": topic,
        "Score": score,
        "Total": total,
        "Accuracy": accuracy
    }])
    if not os.path.exists("results.csv"):
        result_df.to_csv("results.csv", index=False)
    else:
        old = pd.read_csv("results.csv")
        pd.concat([old, result_df], ignore_index=True).to_csv("results.csv", index=False)

    return jsonify(result_summary)

# ====== Run Server ======
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
