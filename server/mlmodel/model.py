import pandas as pd
import os
import random
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier

# --- Paths ---
CSV_PATH = r"aptitude_questions_500.csv"
USER_DATA_PATH = r"user_data.csv"

# --- Load questions ---
if not os.path.exists(CSV_PATH):
    print("⚠️ CSV file not found!")
    exit()

df = pd.read_csv(CSV_PATH)
print(f"✅ Loaded {len(df)} questions.")

# --- Initialize or load user history ---
columns = ["topic", "difficulty", "question_length", "user_previous_score", "answered_correctly"]
if os.path.exists(USER_DATA_PATH):
    user_data = pd.read_csv(USER_DATA_PATH)
else:
    user_data = pd.DataFrame(columns=columns)

NUM_QUESTIONS = 10
asked_questions = set()
score = 0
difficulty_scores = {}
topic_scores = {}

# --- Label encoders ---
le_topic = LabelEncoder()
le_diff = LabelEncoder()
le_topic.fit(df['tags'])
le_diff.fit(df['difficulty'])

# --- Train model if enough historical data exists ---
if len(user_data) >= 5:
    X_train = user_data[['topic', 'difficulty', 'question_length', 'user_previous_score']].copy()
    X_train['topic'] = le_topic.transform(X_train['topic'])
    X_train['difficulty'] = le_diff.transform(X_train['difficulty'])
    y_train = user_data['answered_correctly']
    model = RandomForestClassifier()
    model.fit(X_train, y_train)
    model_available = True
else:
    model_available = False

print("\n🚀 Starting AI-Powered Adaptive Quiz!\nAnswer by typing a/b/c/d.\n")

for i in range(NUM_QUESTIONS):
    available_questions = df[~df.index.isin(asked_questions)]

    # --- Select question ---
    if model_available:
        X_pred = available_questions[['tags', 'difficulty', 'question_text']].copy()
        X_pred['topic'] = le_topic.transform(X_pred['tags'])
        X_pred['difficulty'] = le_diff.transform(X_pred['difficulty'])
        X_pred['question_length'] = X_pred['question_text'].apply(lambda x: len(str(x).split()))
        X_pred['user_previous_score'] = score / (i+1)
        X_pred = X_pred[['topic', 'difficulty', 'question_length', 'user_previous_score']]
        probs = model.predict_proba(X_pred)[:,1]
        idx = (abs(probs - 0.7)).argmin()
        question = available_questions.iloc[idx]
    else:
        # fallback: random Easy question first
        easy_questions = available_questions[available_questions['difficulty'] == 'Easy']
        question = easy_questions.sample(1).iloc[0] if not easy_questions.empty else available_questions.sample(1).iloc[0]

    asked_questions.add(question.name)

    print(f"Q{i+1} [{question['difficulty']} - {question['tags']}]: {question['question_text']}")
    print(f"a) {question['option_a']}")
    print(f"b) {question['option_b']}")
    print(f"c) {question['option_c']}")
    print(f"d) {question['option_d']}")

    ans = input("Your answer (a/b/c/d): ").strip().lower()
    correct = int(ans == question['answer'])

    if correct:
        print("✅ Correct!\n")
        score += 1
        difficulty_scores[question['difficulty']] = difficulty_scores.get(question['difficulty'], 0) + 1
        topic_scores[question['tags']] = topic_scores.get(question['tags'], 0) + 1
    else:
        print(f"❌ Incorrect. Correct answer: {question['answer']}) {question['option_' + question['answer']]}\n")

    # --- Save attempt safely to avoid FutureWarning ---
    attempt_dict = {
        "topic": question['tags'],
        "difficulty": question['difficulty'],
        "question_length": len(str(question['question_text']).split()),
        "user_previous_score": score / (i+1),
        "answered_correctly": correct
    }

    # Ensure attempt_df has exact columns
    attempt_df = pd.DataFrame([{col: attempt_dict.get(col, None) for col in columns}])

    # Ensure user_data has all columns
    for col in columns:
        if col not in user_data.columns:
            user_data[col] = pd.NA

    # Concatenate safely
    user_data = pd.concat([user_data[columns], attempt_df], ignore_index=True)

# === Summary ===
total = len(asked_questions)
accuracy = (score / total) * 100

print("📊 === QUIZ SUMMARY ===")
print(f"Total Questions: {total}")
print(f"Correct Answers: {score}")
print(f"Accuracy: {accuracy:.2f}%")

print("\nPerformance by Difficulty:")
for d, s in difficulty_scores.items():
    print(f"• {d}: {s} correct")

print("\nPerformance by Topic:")
for t, s in topic_scores.items():
    print(f"• {t}: {s} correct")

# --- Save historical data ---
user_data.to_csv(USER_DATA_PATH, index=False)
print("\n📝 User attempt data saved for learning ✅")
