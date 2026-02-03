import OpenAI from "openai";
import nodemailer from "nodemailer";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const EMAIL = process.env.EMAIL_USER;
const PASS = process.env.EMAIL_PASS;

const problems = JSON.parse(fs.readFileSync("problems.json"));
const progress = JSON.parse(fs.readFileSync("progress.json"));

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";

function getTwoQuestions() {

  const i = progress.index;

  const q1 = problems[i % problems.length];
  const q2 = problems[(i + 1) % problems.length];

  progress.index += 2;
  fs.writeFileSync("progress.json", JSON.stringify(progress));

  return [q1, q2];
}

async function sendEmail(q1, q2) {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL, pass: PASS }
  });

  const message = `
Day ${progress.day} / 30

Question 1:
Topic: ${q1.topic}
Problem: ${q1.problem}

Question 2:
Topic: ${q2.topic}
Problem: ${q2.problem}

Reply with data structure or pattern you would use.
`;

  await transporter.sendMail({
    from: EMAIL,
    to: EMAIL,
    subject: "📘 Daily DSA Challenge",
    text: message
  });
}

async function main() {

  if (progress.day > 30) {
    console.log("Completed 30 day program 🎉");
    return;
  }

  const [q1, q2] = getTwoQuestions();
  await sendEmail(q1, q2);

  progress.day += 1;
  fs.writeFileSync("progress.json", JSON.stringify(progress));

  console.log("Email Sent");
}

main();
