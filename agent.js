import OpenAI from "openai";
import nodemailer from "nodemailer";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const EMAIL = process.env.EMAIL_USER;
const PASS = process.env.EMAIL_PASS;

const progress = JSON.parse(fs.readFileSync("progress.json"));

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";

// ⭐ Topic rotation list (hidden from user)
const topics = [
  "Arrays",
  "Sliding Window",
  "Stack",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Two Pointers",
  "Binary Search",
  "Intervals"
];

// -----------------------------
// Pick 2 Topics Daily
// -----------------------------
function getTwoTopics() {

  const i = progress.index;

  const t1 = topics[i % topics.length];
  const t2 = topics[(i + 1) % topics.length];

  progress.index += 2;
  fs.writeFileSync("progress.json", JSON.stringify(progress));

  return [t1, t2];
}

// -----------------------------
// AI Question Generator
// -----------------------------
async function generateQuestion(topic) {

  const client = new OpenAI({
    baseURL: endpoint,
    apiKey: token
  });

  const prompt = `
Generate a LeetCode-style coding interview problem.

Internal Topic: ${topic}

STRICT RULES:
- Do NOT mention the topic name
- Do NOT hint which algorithm to use
- Make it realistic and interview quality
- Include title
- Include description
- Include constraints
- Include example input/output
- Do NOT include solution
`;

  const response = await client.chat.completions.create({
    model: "openai/gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return response.choices[0].message.content;
}

// -----------------------------
// Email Sender
// -----------------------------
async function sendEmail(q1, q2) {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL, pass: PASS }
  });

  const message = `
Day ${progress.day} / 30

---------------------------------

QUESTION 1
${q1}

---------------------------------

QUESTION 2
${q2}

---------------------------------

Reply to this email with:

👉 Which data structure or algorithm pattern would you apply?

Do NOT write code. Just concept.
`;

  await transporter.sendMail({
    from: EMAIL,
    to: EMAIL,
    subject: "📘 Daily AI DSA Challenge",
    text: message
  });
}

// -----------------------------
// Main Agent
// -----------------------------
async function main() {

  if (progress.day > 30) {
    console.log("Completed 30 day program 🎉");
    return;
  }

  const [topic1, topic2] = getTwoTopics();

  console.log("Generating questions...");

  const q1 = await generateQuestion(topic1);
  const q2 = await generateQuestion(topic2);

  await sendEmail(q1, q2);

  progress.day += 1;
  fs.writeFileSync("progress.json", JSON.stringify(progress));

  console.log("Email Sent ✅");
}

main();
