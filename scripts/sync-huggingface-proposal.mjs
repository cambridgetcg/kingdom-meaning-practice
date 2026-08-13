import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const argument = process.argv[2];
const replaceGenerated = process.argv.includes("--replace-generated");
if (!argument) {
  throw new Error("Pass the exact local Hugging Face proposal directory.");
}

const target = resolve(argument);
const reviewedTarget = join(homedir(), "hf-folding-feedback-20260812");
if (target !== reviewedTarget) {
  throw new Error("Refusing a target outside the one reviewed folding-feedback proposal.");
}

const source = new URL("../doors/huggingface-field-lab/", import.meta.url);
const sourcePath = fileURLToPath(source);
const files = [
  "README.md",
  "index.html",
  "lab.css",
  "app.mjs",
  "engine.mjs",
  "release-lock.json",
  "robots.txt",
];
const allowedEntries = new Set([".git", ...files]);

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function readLock(directory) {
  const lock = JSON.parse(readFileSync(join(directory, "release-lock.json"), "utf8"));
  if (
    lock.schema !== "kingdom.field-lab-release/0.1"
    || lock.artifact !== "folding-feedback-field-lab"
    || lock.platform !== "huggingface-static-space"
    || typeof lock.releaseFiles !== "object"
    || lock.releaseFiles === null
  ) {
    throw new Error("Release lock does not identify the reviewed Hugging Face field lab.");
  }
  return lock;
}

function verifyRelease(directory, lock) {
  const actualNames = readdirSync(directory)
    .filter((name) => name !== ".git" && name !== "release-lock.json")
    .sort();
  const lockedNames = Object.keys(lock.releaseFiles).sort();
  if (JSON.stringify(actualNames) !== JSON.stringify(lockedNames)) {
    throw new Error("Release payload does not match the exact locked file list.");
  }
  for (const name of lockedNames) {
    const path = join(directory, name);
    const stat = lstatSync(path);
    if (!stat.isFile() || stat.isSymbolicLink() || sha256(path) !== lock.releaseFiles[name]) {
      throw new Error(`Release payload does not match its locked bytes: ${name}`);
    }
  }
}

const targetStat = lstatSync(target);
if (!targetStat.isDirectory() || targetStat.isSymbolicLink()) {
  throw new Error("The proposal target must be one real directory.");
}
if (realpathSync(target) !== target) {
  throw new Error("The reviewed proposal path must not pass through a symlink.");
}
const gitStat = lstatSync(join(target, ".git"));
if (!gitStat.isDirectory() || gitStat.isSymbolicLink()) {
  throw new Error("The proposal target must have its own real .git directory.");
}

const unexpected = readdirSync(target).filter((name) => !allowedEntries.has(name));
if (unexpected.length > 0) {
  throw new Error(`Refusing unexpected proposal entries: ${unexpected.join(", ")}`);
}

const newLock = readLock(sourcePath);
verifyRelease(sourcePath, newLock);

const status = execFileSync("git", ["status", "--short"], {
  cwd: target,
  encoding: "utf8",
});
if (status.trim() !== "") {
  if (!replaceGenerated) {
    throw new Error("Refusing to overwrite a dirty Hugging Face proposal.");
  }
  const changed = status
    .split(/\r?\n/u)
    .filter((line) => line.trim() !== "")
    .map((line) => line.slice(3).trim());
  if (changed.some((name) => !files.includes(name))) {
    throw new Error("Refusing dirty paths outside the generated proposal files.");
  }
  try {
    const priorLock = readLock(target);
    verifyRelease(target, priorLock);
  } catch {
    throw new Error(
      "Refusing dirty replacement unless every current payload byte matches its prior release lock.",
    );
  }
}

const remotes = execFileSync("git", ["remote"], {
  cwd: target,
  encoding: "utf8",
});
if (remotes.trim() !== "") {
  throw new Error("Refusing to sync a proposal that already has a remote.");
}

const parent = dirname(target);
const staging = mkdtempSync(join(parent, ".field-lab-sync-stage-"));
const backup = mkdtempSync(join(parent, ".field-lab-sync-backup-"));
const previousFiles = new Set(files.filter((name) => existsSync(join(target, name))));
let mutationStarted = false;
let keepBackup = false;

try {
  for (const name of files) {
    const sourceFile = new URL(name, source);
    const sourceStat = lstatSync(sourceFile);
    if (!sourceStat.isFile() || sourceStat.isSymbolicLink()) {
      throw new Error(`Generated release file is not one regular file: ${name}`);
    }
    copyFileSync(sourceFile, join(staging, name));
  }
  verifyRelease(staging, newLock);

  for (const name of previousFiles) {
    copyFileSync(join(target, name), join(backup, name));
  }
  mutationStarted = true;
  for (const name of files) {
    renameSync(join(staging, name), join(target, name));
  }
  verifyRelease(target, newLock);
} catch (error) {
  if (mutationStarted) {
    try {
      for (const name of files) rmSync(join(target, name), { force: true });
      for (const name of previousFiles) {
        copyFileSync(join(backup, name), join(target, name));
      }
    } catch (restoreError) {
      keepBackup = true;
      throw new Error(
        `Sync failed and automatic restore also failed. Recover from ${backup}. Original errors: ${error.message}; ${restoreError.message}`,
      );
    }
  }
  throw error;
} finally {
  rmSync(staging, { recursive: true, force: true });
  if (!keepBackup) rmSync(backup, { recursive: true, force: true });
}

process.stdout.write(`Synced ${files.length} reviewed files into ${target}\n`);
