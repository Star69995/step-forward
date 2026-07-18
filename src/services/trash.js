import { deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Single source for the site-wide "soft delete" behavior: every delete button
// moves its item to a 30-day trash (deletedAt set) instead of removing it
// outright, so it can be restored or purged manually in the meantime. There
// are no Cloud Functions in this project, so automatic purging after the
// retention window is done lazily on the client — see purgeExpired below —
// rather than via a server-side cron.
export const TRASH_RETENTION_DAYS = 30;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toDate = (deletedAt) => (deletedAt?.toDate ? deletedAt.toDate() : null);

// Splits a fetched collection into what's still active and what's in the
// trash, so each list hook can hand both to its screen with one pass.
export const splitByTrash = (items) => {
    const active = [];
    const trashed = [];
    for (const item of items) {
        (item.deletedAt ? trashed : active).push(item);
    }
    return { active, trashed };
};

// Whole days left before an item is eligible for automatic purge — shown on
// each trash entry so the user knows how long restore is still available.
export const daysRemaining = (deletedAt) => {
    const date = toDate(deletedAt);
    if (!date) return TRASH_RETENTION_DAYS;
    const elapsedDays = (Date.now() - date.getTime()) / MS_PER_DAY;
    return Math.max(0, Math.ceil(TRASH_RETENTION_DAYS - elapsedDays));
};

export const isExpired = (deletedAt) => {
    const date = toDate(deletedAt);
    if (!date) return false;
    return Date.now() - date.getTime() > TRASH_RETENTION_DAYS * MS_PER_DAY;
};

// Move-to-trash: sets deletedAt instead of removing the document. Firestore
// rules require deletedAt to already be set before a real delete is allowed,
// so this is the only path into the trash.
export const softDeleteDoc = async (ref) => {
    await updateDoc(ref, { deletedAt: serverTimestamp() });
};

export const restoreDoc = async (ref) => {
    await updateDoc(ref, { deletedAt: null });
};

// Best-effort background cleanup: called after a trashed list is fetched so
// items past the retention window disappear next time anyone with access
// loads that list. Failures are swallowed — this is opportunistic cleanup,
// not a user-requested action, so it must never surface an error toast.
export const purgeExpired = (trashedItems, refFactory) => {
    trashedItems
        .filter((item) => isExpired(item.deletedAt))
        .forEach((item) => {
            deleteDoc(refFactory(item)).catch(() => {});
        });
};
