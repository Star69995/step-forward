// Windows-only workaround for a known firebase-tools bug: --export-on-exit
// sometimes fails with "EPERM: operation not permitted, rename ..." while
// swapping its temp export folder into place (unfixed upstream, see
// https://github.com/firebase/firebase-tools/issues/3092). The data itself
// survives intact in a stray `firebase-export-<id>/` folder in the repo root
// even when this happens — this script promotes the newest one into the
// path `npm run emulators` imports from, and removes the rest.
import { readFileSync, readdirSync, statSync, cpSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const pkg = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const importMatch = pkg.scripts.emulators.match(/--import=(\S+)/);
if (!importMatch) {
    console.error("Could not find --import=... in the \"emulators\" npm script.");
    process.exit(1);
}
const dataDir = path.resolve(repoRoot, importMatch[1]);

const strayDirs = readdirSync(repoRoot)
    .filter((name) => name.startsWith("firebase-export-"))
    .map((name) => path.join(repoRoot, name))
    .filter((dir) => existsSync(path.join(dir, "firebase-export-metadata.json")));

if (strayDirs.length === 0) {
    console.log("No stray firebase-export-* folders found — nothing to recover.");
    process.exit(0);
}

const newest = strayDirs
    .map((dir) => ({ dir, mtime: statSync(path.join(dir, "firebase-export-metadata.json")).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)[0].dir;

cpSync(newest, dataDir, { recursive: true });
for (const dir of strayDirs) {
    rmSync(dir, { recursive: true, force: true });
}

console.log(`Recovered ${path.basename(newest)} -> ${dataDir}`);
console.log(`Removed ${strayDirs.length} stray folder(s).`);
