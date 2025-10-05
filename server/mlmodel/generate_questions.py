import random
import pandas as pd
from pathlib import Path

random.seed(42)

# Helper functions
def pick_options(correct, distractors):
    opts = [correct] + distractors[:3]
    random.shuffle(opts)
    labels = ['a', 'b', 'c', 'd']
    mapping = dict(zip(labels, opts))
    correct_label = next(k for k, v in mapping.items() if v == correct)
    return mapping, correct_label

def fmt_val(x):
    """Format numeric values nicely, keep strings as they are."""
    if isinstance(x, (int, float)):
        if float(x).is_integer():
            return str(int(x))
        return str(round(x, 2))
    return str(x)

questions = []
qid = 1

def add_question(qtext, correct, distractors, difficulty, tag):
    global qid, questions
    mapping, label = pick_options(correct, distractors)
    questions.append({
        "id": qid,
        "question_text": qtext,
        "option_a": fmt_val(mapping['a']),
        "option_b": fmt_val(mapping['b']),
        "option_c": fmt_val(mapping['c']),
        "option_d": fmt_val(mapping['d']),
        "answer": label,
        "difficulty": difficulty,
        "tags": tag
    })
    qid += 1

# === Category Generators ===
def gen_percentages(n):
    for _ in range(n):
        a = random.randint(10, 500)
        p = random.choice([5, 10, 12.5, 20, 25, 30, 40, 50])
        correct = round((p / 100) * a, 2)
        q = f"What is {p}% of {a}?"
        add_question(q, correct, [correct + 5, correct - 5, correct * 1.5], "Easy", "Percentages")

def gen_time_work(n):
    for _ in range(n):
        x, y = random.randint(2, 30), random.randint(2, 30)
        correct = round((x * y) / (x + y), 2)
        q = f"A can finish a work in {x} days and B in {y} days. How long to finish together?"
        add_question(q, correct, [correct + 2, correct - 2, correct * 1.5], "Moderate", "Time & Work")

def gen_speed_distance(n):
    for _ in range(n):
        s, t = random.randint(20, 100), random.choice([0.5, 1, 2, 3])
        correct = round(s * t, 2)
        q = f"A train runs at {s} km/h for {t} hours. Find the distance covered."
        add_question(q, correct, [correct + 10, correct - 10, correct * 1.1], "Easy", "Speed/Distance/Time")

def gen_blood_relations(n):
    names = ["Aman", "Bhavya", "Charu", "Deepak", "Esha", "Farhan"]
    for _ in range(n):
        A, B, C = random.sample(names, 3)
        q = f"If {A} is the mother of {B} and {B} is the brother of {C}, what is {C}'s relation to {A}?"
        add_question(q, "son or daughter", ["uncle", "father", "sister"], "Easy", "Blood Relations")

def gen_ratio_prop(n):
    for _ in range(n):
        a, b, S = random.randint(2, 10), random.randint(2, 10), random.randint(100, 500)
        A_val = round((a / (a + b)) * S, 2)
        q = f"If A:B = {a}:{b} and A + B = {S}, find A."
        add_question(q, A_val, [A_val + 10, A_val - 10, A_val * 1.2], "Moderate", "Ratio & Proportion")

def gen_profit_loss(n):
    for _ in range(n):
        cost = random.randint(100, 2000)
        profit_percent = random.choice([5, 10, 15, 20, 25])
        sell = round(cost * (1 + profit_percent / 100), 2)
        q = f"A product costs Rs.{cost} and is sold for Rs.{sell}. Find profit percentage."
        add_question(q, f"{profit_percent}%", ["5%", "10%", "15%"], "Easy", "Profit & Loss")

def gen_simple_interest(n):
    for _ in range(n):
        P, R, T = random.randint(1000, 10000), random.choice([5, 6, 8, 10, 12]), random.randint(1, 5)
        SI = round((P * R * T) / 100, 2)
        q = f"Find the simple interest on Rs.{P} for {T} years at {R}% p.a."
        add_question(q, SI, [SI + 200, SI - 200, SI * 1.1], "Moderate", "Simple Interest")

def gen_average(n):
    for _ in range(n):
        nums = [random.randint(10, 100) for _ in range(5)]
        avg = round(sum(nums) / 5, 2)
        q = f"Find the average of the numbers {', '.join(map(str, nums))}."
        add_question(q, avg, [avg + 3, avg - 3, avg * 1.1], "Easy", "Average")

# === Generate All Questions ===
gen_percentages(70)
gen_time_work(70)
gen_speed_distance(70)
gen_blood_relations(60)
gen_ratio_prop(60)
gen_profit_loss(60)
gen_simple_interest(55)
gen_average(55)

# === Save to CSV ===
df = pd.DataFrame(questions)
path = Path("aptitude_questions_500.csv")
df.to_csv(path, index=False)
print(f"✅ Generated {len(df)} questions saved to {path}")
