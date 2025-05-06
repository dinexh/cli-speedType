import readline from "readline";
import fs from "fs";
import chalk from "chalk";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const snippets = JSON.parse(fs.readFileSync("snippets.json", "utf-8"));
const snippet = snippets[Math.floor(Math.random() * snippets.length)];

console.log(chalk.cyan("\n📜 Type the following code as fast and accurately as you can:\n"));
console.log(chalk.yellow("========================================"));
console.log(chalk.green(snippet));
console.log(chalk.yellow("========================================"));
console.log(chalk.magenta("\nPress Enter when ready..."));

let start = 0;
let lines: string[] = [];

rl.once("line", () => {
  start = Date.now();
  console.log(chalk.blue("\n📝 Start typing your input. Press Ctrl+D when finished:\n"));
});

rl.on("line", (input) => {
  if (start === 0) return;
  lines.push(input);
});

// When Ctrl+D is pressed
rl.on("close", () => {
  const typed = lines.join("\n");
  const end = Date.now();

  const original = snippet.replace(/\s+/g, " ").trim();
  const normalizedInput = typed.replace(/\s+/g, " ").trim();

  const errors = countErrors(original, normalizedInput);
  const accuracy = ((original.length - errors) / original.length) * 100;
  const timeTaken = (end - start) / 1000;
  const wpm = (normalizedInput.split(" ").length / timeTaken) * 60;

  // Show results
  console.log(chalk.yellow("\n--- 📊 Results ---"));
  console.log(`⏱ Time taken: ${timeTaken.toFixed(2)}s`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`✅ Accuracy: ${accuracy.toFixed(2)}%`);
  console.log(`⌨️ WPM: ${wpm.toFixed(2)}`);

  // Line-by-line diff view
  console.log(chalk.yellow("\n--- 🔍 Diff View ---"));
  const originalLines = snippet.trim().split("\n");
  const inputLines = typed.trim().split("\n");

  originalLines.forEach((line, idx) => {
    const typedLine = inputLines[idx] || "";
    if (line.trim() === typedLine.trim()) {
      console.log(chalk.green(`✔ ${line}`));
    } else {
      console.log(chalk.red(`✘ ${line}`));
      console.log(chalk.yellow(`↳ You typed: ${typedLine}`));
    }
  });

  // Save to leaderboard
  const username = process.env.USER || "Anonymous";
  let leaderboard: { user: string; wpm: number; accuracy: number; time: number }[] = [];

  if (fs.existsSync("leaderboard.json")) {
    leaderboard = JSON.parse(fs.readFileSync("leaderboard.json", "utf-8"));
  }

  leaderboard.push({
    user: username,
    wpm: Number(wpm.toFixed(2)),
    accuracy: Number(accuracy.toFixed(2)),
    time: Number(timeTaken.toFixed(2)),
  });

  leaderboard = leaderboard.sort((a, b) => b.wpm - a.wpm).slice(0, 10);
  fs.writeFileSync("leaderboard.json", JSON.stringify(leaderboard, null, 2));

  // Print leaderboard
  console.log(chalk.yellow("\n🏆 Top 10 Leaderboard:"));
  leaderboard.forEach((entry, i) => {
    console.log(`${i + 1}. ${entry.user} - ${entry.wpm} WPM, ${entry.accuracy}% Accuracy, ${entry.time}s`);
  });
});

function countErrors(a: string, b: string): number {
  const minLen = Math.min(a.length, b.length);
  let errors = 0;
  for (let i = 0; i < minLen; i++) {
    if (a[i] !== b[i]) errors++;
  }
  errors += Math.abs(a.length - b.length);
  return errors;
}
