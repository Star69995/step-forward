import { v4 as uuidv4 } from "uuid";
import { contentOnly, savePlan } from "./savePlan";

// Plan export/import as a plain JSON file — a portable copy of the plan's
// own content (the same fields savePlan.js snapshots into a version), so it
// can be moved between accounts or kept as a backup. Comments, shares and
// version history are separate collections and deliberately not included.
const FORMAT = "step-forward-plan";
const FORMAT_VERSION = 1;
const MAX_FILE_BYTES = 1024 * 1024;

// Bookkeeping that only makes sense on the original document — never
// carried over into an imported copy. previousPlanId points at another plan
// of the original account by id, which means nothing once imported.
const stripForTransfer = (planData) => {
    const { id: _id, deletedAt: _deletedAt, previousPlanId: _previousPlanId, ...rest } = contentOnly(planData);
    return rest;
};

export const downloadPlanFile = (planData, fileLabel) => {
    const payload = {
        format: FORMAT,
        version: FORMAT_VERSION,
        exportedAt: new Date().toISOString(),
        data: stripForTransfer(planData),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `צעד_קדימה_${fileLabel}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

// A file-content problem worth showing to the user as-is, as opposed to an
// unexpected failure (network, permissions) that gets a generic message.
export class PlanFileError extends Error {}

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

// Throws a PlanFileError with a user-facing message on any invalid file.
export const readPlanFile = async (file) => {
    if (file.size > MAX_FILE_BYTES) throw new PlanFileError("הקובץ גדול מדי");

    let payload;
    try {
        payload = JSON.parse(await file.text());
    } catch {
        throw new PlanFileError("הקובץ אינו קובץ תוכנית תקין");
    }
    if (payload?.format !== FORMAT || !isPlainObject(payload.data)) {
        throw new PlanFileError("הקובץ אינו קובץ תוכנית של צעד קדימה");
    }
    if (payload.version > FORMAT_VERSION) {
        throw new PlanFileError("הקובץ נוצר בגרסה חדשה יותר של האתר");
    }
    return stripForTransfer(payload.data);
};

// Always creates a new plan (never overwrites an existing one). An anonymous
// account never stores a real name — see FormPage.jsx's "name" field — so
// one carried in the file is dropped rather than persisted.
export const importPlan = async (uid, data, editor, { isAnonymous = false } = {}) => {
    const content = isAnonymous ? { ...data, name: "" } : data;
    return savePlan(uid, content, uuidv4(), editor);
};
