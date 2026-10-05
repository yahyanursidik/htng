import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createApp } from "../server/app.mjs";

const server = await createApp({database: ":memory:", origin: "http://127.0.0.1:4407"});
await new Promise((resolveServer,reject)=>{server.once("error",reject);server.listen(4407,"127.0.0.1",resolveServer);});
const playwrightCli = resolve("node_modules", "@playwright", "test", "cli.js");
const child = spawn(process.execPath, [playwrightCli, "test"], {
  stdio: "inherit",
  env: process.env,
});

const exitCode = await new Promise((resolveExit) => {
  child.once("exit", (code) => resolveExit(code ?? 1));
});

await new Promise((resolveClose, reject) => {
  server.close((error) => (error ? reject(error) : resolveClose()));
});

process.exitCode = exitCode;
