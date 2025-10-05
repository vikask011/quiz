import pandas as pd
import os
import random

CSV_PATH = "aptitude_questions_500.csv"

if not os.path.exists(CSV_PATH):
    print("⚠️ CSV file not found!")
    exit()

df = pd.read_csv(CSV_PATH)
print("✅ Loaded", len(df), "questions.")

# === Settings ===
NUM_QUESTIONS = 10
difficulty_order = ["Easy", "Moderate", "Hard"]  # adaptive difficulty order

score = 0
topic_scores = {}
difficulty_scores = {}

# Start with Easy
current_difficulty = "Easy"

# Keep track of already asked questions
asked_questions = set()

print("\n🚀 Starting Adaptive Quiz!\nAnswer by typing a/b/c/d.\n")

for i in range(NUM_QUESTIONS):
    # Filter available questions for current difficulty that were not asked yet
    available_questions = df[(df['difficulty'] == current_difficulty) & (~df.index.isin(asked_questions))]
    
    # If no questions left in this difficulty, fallback to any difficulty
    if available_questions.empty:
        available_questions = df[~df.index.isin(asked_questions)]
    
    # If still empty (all questions used), break
    if available_questions.empty:
        print("⚠️ No more questions available!")
        break
    
    # Pick a random question
    question = available_questions.sample(1).iloc[0]
    asked_questions.add(question.name)  # mark as asked

    print(f"Q{i+1} [{question['difficulty']}]: {question['question_text']}")
    print(f"a) {question['option_a']}")
    print(f"b) {question['option_b']}")
    print(f"c) {question['option_c']}")
    print(f"d) {question['option_d']}")

    ans = input("Your answer (a/b/c/d): ").strip().lower()

    # Update scores
    if ans == question['answer']:
        print("✅ Correct!\n")
        score += 1
        difficulty_scores[current_difficulty] = difficulty_scores.get(current_difficulty, 0) + 1
        topic_scores[question['tags']] = topic_scores.get(question['tags'], 0) + 1

        # Move UP difficulty if not already Hard
        if current_difficulty != "Hard":
            current_idx = difficulty_order.index(current_difficulty)
            current_difficulty = difficulty_order[current_idx + 1]
    else:
        print(f"❌ Incorrect. Correct answer: {question['answer']}) {question['option_' + question['answer']]}\n")

        # Move DOWN difficulty if not already Easy
        if current_difficulty != "Easy":
            current_idx = difficulty_order.index(current_difficulty)
            current_difficulty = difficulty_order[current_idx - 1]

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

# Save results
result = {
    "Score": score,
    "Total": total,
    "Accuracy": round(accuracy, 2)
}
if not os.path.exists("results.csv"):
    pd.DataFrame([result]).to_csv("results.csv", index=False)
else:
    existing = pd.read_csv("results.csv")
    pd.concat([existing, pd.DataFrame([result])], ignore_index=True).to_csv("results.csv", index=False)

print("\n📝 Result saved to results.csv ✅")
