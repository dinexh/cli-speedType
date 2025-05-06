import { readFileSync } from "fs";
import readline from "readline";

// Load code snippets
let snippets: string[] = [];
try {
  const fileContent = readFileSync("./snippets.json", "utf-8");
  snippets = JSON.parse(fileContent);
} catch (error: any) {
  console.error("Error reading snippets.json:", error.message);
  process.exit(1);
}

// Pick a random snippet
const snippet = snippets[Math.floor(Math.random() * snippets.length)];

console.log("\n📜 Type the following code as fast and accurately as you can:\n");
console.log("========================================");
console.log(snippet);
console.log("========================================\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Press Enter when ready...", () => {
  const start = Date.now();

  const typedLines: string[] = [];
  console.log("\n📝 Start typing below (Press Ctrl+D when done):");

  rl.on("line", (line) => {
    typedLines.push(line);
  });

  rl.on("close", () => {
    const end = Date.now();

    const typed = typedLines.join("\n");
    const original = snippet.replace(/\s+/g, " ").trim();
    const input = typed.replace(/\s+/g, " ").trim();

    let errors = 0;
    const maxLength = Math.max(original.length, input.length);

    for (let i = 0; i < maxLength; i++) {
      if (original[i] !== input[i]) errors++;
    }

    const accuracy = ((original.length - errors) / original.length) * 100;
    const timeInMinutes = (end - start) / 60000;
    const wpm = input.split(/\s+/).length / timeInMinutes;

    console.log("\n--- 📊 Results ---");
    console.log(`⏱ Time taken: ${((end - start) / 1000).toFixed(2)}s`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`✅ Accuracy: ${accuracy.toFixed(2)}%`);
    console.log(`⌨️ WPM: ${wpm.toFixed(2)}`);
  });
});
