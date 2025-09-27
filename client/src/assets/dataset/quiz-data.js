export const percentageQuestions = {
  very_easy: [
    {
      id: 1,
      question: "What is 10% of 100?",
      options: ["5", "10", "15", "20"],
      correct: 1,
      explanation: "10% of 100 = (10/100) × 100 = 10",
      fundamentals: ["grasping", "application"],
    },
    {
      id: 2,
      question: "Convert 0.5 to percentage",
      options: ["5%", "50%", "0.5%", "500%"],
      correct: 1,
      explanation: "0.5 = 0.5 × 100% = 50%",
      fundamentals: ["grasping", "retention"],
    },
    {
      id: 3,
      question: "What is 25% of 20?",
      options: ["4", "5", "6", "7"],
      correct: 0,
      explanation: "25% of 20 = (25/100) × 20 = 5",
      fundamentals: ["application"],
    },
    {
      id: 4,
      question: "Convert 1/4 to percentage",
      options: ["20%", "25%", "30%", "40%"],
      correct: 1,
      explanation: "1/4 = 0.25 = 25%",
      fundamentals: ["grasping", "retention"],
    },
    {
      id: 5,
      question: "What is 50% of 80?",
      options: ["30", "35", "40", "45"],
      correct: 2,
      explanation: "50% of 80 = (50/100) × 80 = 40",
      fundamentals: ["application"],
    },
  ],
  easy: [
    {
      id: 6,
      question: "If 20% of a number is 40, what is the number?",
      options: ["160", "180", "200", "220"],
      correct: 2,
      explanation:
        "Let x be the number. 20% of x = 40, so (20/100) × x = 40, x = 200",
      fundamentals: ["grasping", "application", "retention"],
    },
    {
      id: 7,
      question:
        "A shirt costs $80. If there's a 15% discount, what's the final price?",
      options: ["$68", "$70", "$72", "$75"],
      correct: 0,
      explanation: "Discount = 15% of $80 = $12. Final price = $80 - $12 = $68",
      fundamentals: ["application", "listening"],
    },
    {
      id: 8,
      question: "What percentage is 30 out of 120?",
      options: ["20%", "25%", "30%", "35%"],
      correct: 1,
      explanation: "(30/120) × 100% = 25%",
      fundamentals: ["grasping", "application"],
    },
    {
      id: 9,
      question:
        "If a student scored 85 out of 100, what percentage did they get?",
      options: ["80%", "85%", "90%", "95%"],
      correct: 1,
      explanation: "(85/100) × 100% = 85%",
      fundamentals: ["application"],
    },
    {
      id: 10,
      question: "Increase 60 by 25%",
      options: ["70", "75", "80", "85"],
      correct: 1,
      explanation: "25% of 60 = 15. Increased value = 60 + 15 = 75",
      fundamentals: ["application", "retention"],
    },
  ],
  moderate: [
    {
      id: 11,
      question:
        "A population increases from 8000 to 9200. What is the percentage increase?",
      options: ["12%", "15%", "18%", "20%"],
      correct: 1,
      explanation:
        "Increase = 9200 - 8000 = 1200. Percentage = (1200/8000) × 100% = 15%",
      fundamentals: ["grasping", "application", "retention"],
    },
    {
      id: 12,
      question:
        "If 35% of students passed and 260 students failed, how many students appeared?",
      options: ["380", "400", "420", "450"],
      correct: 1,
      explanation:
        "If 35% passed, then 65% failed. 65% = 260, so 100% = 260 ÷ 0.65 = 400",
      fundamentals: ["listening", "grasping", "application"],
    },
    {
      id: 13,
      question:
        "A number decreased by 20% becomes 240. What was the original number?",
      options: ["280", "300", "320", "340"],
      correct: 1,
      explanation:
        "If decreased by 20%, remaining is 80%. 80% = 240, so 100% = 240 ÷ 0.8 = 300",
      fundamentals: ["grasping", "application", "retention"],
    },
    {
      id: 14,
      question: "What is 12.5% of 640?",
      options: ["70", "75", "80", "85"],
      correct: 2,
      explanation: "12.5% of 640 = (12.5/100) × 640 = 80",
      fundamentals: ["application"],
    },
    {
      id: 15,
      question:
        "If the price of an item increases by 40% and then decreases by 25%, what is the net change?",
      options: ["5% increase", "10% increase", "15% increase", "20% increase"],
      correct: 0,
      explanation:
        "Let original price = 100. After 40% increase = 140. After 25% decrease = 140 × 0.75 = 105. Net change = 5% increase",
      fundamentals: ["listening", "grasping", "application", "retention"],
    },
  ],
  difficult: [
    {
      id: 16,
      question:
        "In an election, candidate A got 45% votes, B got 35%, and the rest were invalid. If invalid votes were 2400, find total votes.",
      options: ["10000", "12000", "14000", "16000"],
      correct: 1,
      explanation:
        "Invalid votes = 100% - 45% - 35% = 20%. If 20% = 2400, then 100% = 12000",
      fundamentals: ["listening", "grasping", "application", "retention"],
    },
    {
      id: 17,
      question:
        "A's salary is 25% more than B's. If B's salary increases by 20%, by what percentage is A's salary more than B's new salary?",
      options: ["4.17%", "5.25%", "6.33%", "8.50%"],
      correct: 0,
      explanation:
        "Let B's original salary = 100. A's salary = 125. B's new salary = 120. Difference = (125-120)/120 × 100% = 4.17%",
      fundamentals: ["listening", "grasping", "application", "retention"],
    },
    {
      id: 18,
      question:
        "A mixture contains 40% alcohol. How much water should be added to 50L of this mixture to make it 25% alcohol?",
      options: ["20L", "25L", "30L", "35L"],
      correct: 2,
      explanation:
        "Alcohol in mixture = 40% of 50L = 20L. For 25% concentration: 20L/(50L + x) = 0.25. Solving: x = 30L",
      fundamentals: ["listening", "grasping", "application", "retention"],
    },
    {
      id: 19,
      question:
        "If the length of a rectangle increases by 30% and width decreases by 20%, what is the percentage change in area?",
      options: ["4% increase", "6% increase", "8% increase", "10% increase"],
      correct: 0,
      explanation:
        "New area = 1.3 × 0.8 = 1.04 times original area. Change = 4% increase",
      fundamentals: ["listening", "grasping", "application", "retention"],
    },
    {
      id: 20,
      question:
        "A shopkeeper marks up goods by 60% but gives successive discounts of 20% and 15%. What is his profit percentage?",
      options: ["8.8%", "9.2%", "10.4%", "12.6%"],
      correct: 0,
      explanation:
        "Marked price = 160% of cost. After discounts: 160 × 0.8 × 0.85 = 108.8% of cost. Profit = 8.8%",
      fundamentals: ["listening", "grasping", "application", "retention"],
    },
  ],
};
