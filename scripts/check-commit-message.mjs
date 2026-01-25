#!/usr/bin/env node

import fs from "node:fs";

const TYPES = [
  "feat",
  "fix",
  "chore",
  "refactor",
  "perf",
  "test",
  "docs",
  "style",
  "build",
  "ci",
  "revert",
];

const commitMsgFile = process.argv[2];

if (!commitMsgFile) {
  console.error("No commit message file provided");
  process.exit(1);
}

const message = fs.readFileSync(commitMsgFile, "utf8").trim();

if (message.startsWith("Merge ")) {
  process.exit(0);
}

const regex = new RegExp(`^(${TYPES.join("|")}):\\s.+`);

if (!regex.test(message)) {
  console.error("\n✖ Invalid commit message\n");
  console.error("Expected: <type>: <description>");
  console.error(`Allowed types: ${TYPES.join(", ")}`);
  process.exit(1);
}

process.exit(0);
