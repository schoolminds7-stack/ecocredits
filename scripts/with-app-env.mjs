#!/usr/bin/env node
import { spawn } from "node:child_process";
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("usage: with-app-env.mjs <cmd> [...args]");
  process.exit(1);
}
const [cmd, ...rest] = args;
const child = spawn(cmd, rest, {
  stdio: "inherit",
  shell: false,
  env: {
    ...process.env,
    HOST: process.env.HOST || "0.0.0.0",
    PORT: process.env.PORT || "8080",
  },
});
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
