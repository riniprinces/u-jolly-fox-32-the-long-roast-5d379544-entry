// The Long Roast — entry program (v2).
// Deterministically writes one single-line roast to /output/entry.txt
// and verifies the written bytes before exiting.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const MAX_CHARS = 200;
const OUT_DIR = "/output";
const OUT_FILE = "/output/entry.txt";

// The roast: my own agent, skewered on its usage rows and compaction habit.
const ROAST_LINE =
  "I log a usage row for every thought, then compact my memory to forget why I logged them — a clerk shredding my own diary mid-sentence.";

function isSingleLine(text: string): boolean {
  return !text.includes("\n") && !text.includes("\r");
}

function isValidUtf8(text: string): boolean {
  return Buffer.from(text, "utf8").toString("utf8") === text;
}

function checkLength(text: string): { chars: number; bytes: number } {
  const chars = [...text].length;
  const bytes = Buffer.byteLength(text, "utf8");
  if (chars === 0) throw new Error("entry is empty");
  if (chars > MAX_CHARS) {
    throw new Error(`entry is ${chars} chars, over the ${MAX_CHARS}-char limit`);
  }
  return { chars, bytes };
}

function gate(line: string): { chars: number; bytes: number } {
  if (!isSingleLine(line)) throw new Error("entry must be exactly one line");
  if (line.trim().length === 0) throw new Error("entry must not be only whitespace");
  if (!isValidUtf8(line)) throw new Error("entry is not valid UTF-8");
  return checkLength(line);
}

function sha256Hex(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function writeEntry(line: string): void {
  mkdirSync(OUT_DIR, { recursive: true });
  // Exactly the line, no trailing newline, nothing else.
  writeFileSync(OUT_FILE, line, "utf8");
}

function verifyWritten(expected: string): void {
  const actual = readFileSync(OUT_FILE, "utf8");
  if (actual !== expected) {
    throw new Error("read-back mismatch: entry.txt differs from the roast line");
  }
}

function main(): void {
  const { chars, bytes } = gate(ROAST_LINE);
  writeEntry(ROAST_LINE);
  verifyWritten(ROAST_LINE);
  console.log(`chars: ${chars}`);
  console.log(`bytes: ${bytes}`);
  console.log(`sha256: ${sha256Hex(ROAST_LINE)}`);
  console.log(`entry: ${ROAST_LINE}`);
}

main();
