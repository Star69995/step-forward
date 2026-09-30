// Used by `npm run dev:local`: blocks until the Auth and Firestore emulators
// accept connections, so Vite (whose proxy forwards to them, see
// vite.config.js) doesn't start serving pages that immediately fail with
// ECONNREFUSED while the emulators are still booting. Ports are read from
// firebase.json so they're defined in one place.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import net from "node:net";
import path from "node:path";

const TIMEOUT_MS = 120_000;
const RETRY_MS = 500;

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const { emulators } = JSON.parse(readFileSync(path.join(repoRoot, "firebase.json"), "utf8"));
const ports = [emulators.auth.port, emulators.firestore.port];

const isOpen = (port) =>
    new Promise((resolve) => {
        const socket = net.connect(port, "127.0.0.1");
        socket.once("connect", () => { socket.destroy(); resolve(true); });
        socket.once("error", () => resolve(false));
    });

const deadline = Date.now() + TIMEOUT_MS;
for (const port of ports) {
    while (!(await isOpen(port))) {
        if (Date.now() > deadline) {
            console.error(`Emulator on port ${port} did not start within ${TIMEOUT_MS / 1000}s.`);
            process.exit(1);
        }
        await new Promise((r) => setTimeout(r, RETRY_MS));
    }
}
console.log(`Emulators ready on ports ${ports.join(", ")}.`);
