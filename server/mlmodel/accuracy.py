import pandas as pd

USER_DATA_PATH = r"user_data.csv"

if not pd.io.common.file_exists(USER_DATA_PATH):
    print("No quiz data found.")
else:
    data = pd.read_csv(USER_DATA_PATH)

    # --- Overall statistics ---
    total_attempts = len(data)
    total_correct = data['answered_correctly'].sum()
    overall_accuracy = (total_correct / total_attempts) * 100

    print(f"\n📊 === Overall Quiz Performance ===")
    print(f"Total Questions Attempted: {total_attempts}")
    print(f"Total Correct Answers: {total_correct}")
    print(f"Overall Accuracy: {overall_accuracy:.2f}%\n")

    # --- Performance by Difficulty ---
    print("📌 Performance by Difficulty:")
    diff_summary = data.groupby('difficulty')['answered_correctly'].agg(['sum','count'])
    for diff, row in diff_summary.iterrows():
        correct = row['sum']
        total = row['count']
        print(f"• {diff}: {correct}/{total} correct ({(correct/total)*100:.2f}%)")

    # --- Performance by Topic ---
    print("\n📌 Performance by Topic:")
    topic_summary = data.groupby('topic')['answered_correctly'].agg(['sum','count'])
    for topic, row in topic_summary.iterrows():
        correct = row['sum']
        total = row['count']
        print(f"• {topic}: {correct}/{total} correct ({(correct/total)*100:.2f}%)")

    # --- Optional: Last 10 questions with result ---
    print("\n📌 Last 10 Questions Attempted:")
    last10 = data.tail(10)
    for idx, row in last10.iterrows():
        result = "✅" if row['answered_correctly'] == 1 else "❌"
        print(f"{result} [{row['difficulty']} - {row['topic']}] Q-length: {row['question_length']} words")
