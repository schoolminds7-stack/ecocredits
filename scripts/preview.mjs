#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";

const PID_FILE = "/tmp/ecocredits-preview.pid";
const action = process.argv[2] || "status";

function isUp() {
  try {
    const res = spawn("curl", ["-sf", "-o", "/dev/null", "--max-time", "2", "http://127.0.0.1:8080/"], { stdio: "ignore" });
    return new Promise((resolve) => {
      res.on("exit", (c) => resolve(c === 0));
    });
  } catch {
    return Promise.resolve(false);
  }
}

async function stop() {
  if (existsSync(PID_FILE)) {
    try {
      const pid = Number(readFileSync(PID_FILE, "utf8").trim());
      if (pid) process.kill(pid, "SIGTERM");
    } catch {}
    try { unlinkSync(PID_FILE); } catch {}
  }
  // best-effort kill vite on 8080
  try {
    spawn("pkill", ["-f", "vite --host 0.0.0.0 --port 8080"], { stdio: "ignore" });
  } catch {}
}

async function start() {
  if (await isUp()) {
    console.log("already running on :8080");
    return;
  }
  const child = spawn("npm", ["run", "dev"], {
    cwd: new URL("..", import.meta.url).pathname,
    detached: true,
    stdio: "ignore",
    env: process.env,
  });
  child.unref();
  if (child.pid) writeFileSync(PID_FILE, String(child.pid));
  console.log("started pid", child.pid);
}

if (action === "stop") {
  await stop();
} else if (action === "restart") {
  await stop();
  await start();
} else if (action === "start") {
  await start();
} else {
  console.log((await isUp()) ? "up" : "down");
}
