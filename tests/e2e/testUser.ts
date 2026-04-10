import fs from "fs";
import path from "path";

export const getTestUsername = () => {
  if (process.env.TEST_USERNAME) return process.env.TEST_USERNAME;

  const filePath = path.join(process.cwd(), "playwright", ".auth", "test-user.json");
  if (!fs.existsSync(filePath)) {
    throw new Error("Missing playwright/.auth/test-user.json. Run global setup first.");
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as { username?: string };
  if (!parsed.username) {
    throw new Error("test-user.json missing username.");
  }
  return parsed.username;
};
