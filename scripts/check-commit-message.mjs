#!/usr/bin/env node

import fs from "node:fs";

const TYPES = [
  "feat", // new user-facing feature or behavior
  "fix", // bug fix that changes broken behavior
  "chore", // maintenance / tooling / deps, no runtime change
  "refactor", // code change with no behavior change
  "perf", // improves performance (speed, memory, bundle)
  "test", // add or update tests only
  "docs", // documentation only changes
  "style", // formatting only (prettier, lint, whitespace)
  "build", // build system, bundler, config changes
  "ci", // CI/CD pipeline or automation changes
  "revert", // reverts a previous commit
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
