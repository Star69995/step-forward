// Exercises firestore.rules end-to-end against the LOCAL emulators only —
// role/email-verification setup, exact-email sharing, view vs. edit
// permission, comment access, immediate revocation (including the
// collection-group query ProviderSwitcher/useSharedWithMe.js relies on), and
// the site-wide soft-delete/trash lifecycle (shares, comments, plans): a
// real delete is only allowed once deletedAt is already set, revocation via
// soft-delete still blocks access immediately, and restore (clearing
// deletedAt) is always available to whoever could delete in the first place.
// Requires the emulators running first: `npm run emulators` in one
// terminal, then `npm run verify:rules` in another. Never point this at a
// real project — it freely creates/deletes test users and data.
import { initializeApp, deleteApp } from "firebase/app";
import {
    getAuth,
    connectAuthEmulator,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    applyActionCode,
} from "firebase/auth";
import {
    getFirestore,
    connectFirestoreEmulator,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    collectionGroup,
    query,
    where,
    getDocs,
    serverTimestamp,
} from "firebase/firestore";

const PROJECT_ID = "demo-step-forward";
const config = { apiKey: "demo-key", authDomain: "localhost", projectId: PROJECT_ID };

let passed = 0;
let failed = 0;

async function expectOk(label, fn) {
    try {
        await fn();
        console.log(`OK   ${label}`);
        passed++;
    } catch (e) {
        console.log(`FAIL ${label} — expected success, got: ${e.code || e.message}`);
        failed++;
    }
}

async function expectDenied(label, fn) {
    try {
        await fn();
        console.log(`FAIL ${label} — expected permission-denied, but it succeeded`);
        failed++;
    } catch (e) {
        if (e.code === "permission-denied" || /permission/i.test(e.message)) {
            console.log(`OK   ${label} (denied as expected)`);
            passed++;
        } else {
            console.log(`FAIL ${label} — expected permission-denied, got: ${e.code || e.message}`);
            failed++;
        }
    }
}

async function verifyEmail(auth) {
    await sendEmailVerification(auth.currentUser);
    const res = await fetch(
        `http://127.0.0.1:9099/emulator/v1/projects/${PROJECT_ID}/oobCodes`
    );
    const { oobCodes } = await res.json();
    const entry = oobCodes.filter((c) => c.email === auth.currentUser.email).pop();
    await applyActionCode(auth, entry.oobCode);
    await auth.currentUser.reload();
    // The ID token cached from sign-up predates verification — force a
    // refresh so its email_verified claim is current (see userProfile.js).
    await auth.currentUser.getIdToken(true);
}

async function main() {
    const recipientApp = initializeApp(config, "recipient");
    const providerApp = initializeApp(config, "provider");

    const rAuth = getAuth(recipientApp);
    const pAuth = getAuth(providerApp);
    const rDb = getFirestore(recipientApp);
    const pDb = getFirestore(providerApp);

    connectAuthEmulator(rAuth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectAuthEmulator(pAuth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(rDb, "127.0.0.1", 8080);
    connectFirestoreEmulator(pDb, "127.0.0.1", 8080);

    const stamp = Date.now();
    const recipientEmail = `recipient-${stamp}@example.com`;
    const providerEmail = `provider-${stamp}@example.com`;
    const password = "test123456";

    const rCred = await createUserWithEmailAndPassword(rAuth, recipientEmail, password);
    const pCred = await createUserWithEmailAndPassword(pAuth, providerEmail, password);
    const rUid = rCred.user.uid;
    const pUid = pCred.user.uid;

    await verifyEmail(rAuth);
    await verifyEmail(pAuth);

    // 1. users/{uid} self-creation
    await expectOk("recipient creates own users/{uid} profile", () =>
        setDoc(doc(rDb, `users/${rUid}`), {
            role: "recipient",
            email: recipientEmail,
            displayName: "",
            createdAt: serverTimestamp(),
        })
    );
    await expectOk("provider creates own users/{uid} profile", () =>
        setDoc(doc(pDb, `users/${pUid}`), {
            role: "provider",
            email: providerEmail,
            displayName: "",
            createdAt: serverTimestamp(),
        })
    );

    // 2. emailIndex — only for your own verified email
    await expectOk("recipient creates own emailIndex entry", () =>
        setDoc(doc(rDb, `emailIndex/${recipientEmail}`), {
            uid: rUid,
            role: "recipient",
            email: recipientEmail,
        })
    );
    await expectOk("provider creates own emailIndex entry", () =>
        setDoc(doc(pDb, `emailIndex/${providerEmail}`), {
            uid: pUid,
            role: "provider",
            email: providerEmail,
        })
    );
    await expectDenied("recipient CANNOT squat provider's emailIndex entry", () =>
        setDoc(doc(rDb, `emailIndex/${providerEmail}`), {
            uid: rUid,
            role: "recipient",
            email: providerEmail,
        })
    );
    await expectDenied("emailIndex collection cannot be listed (no directory)", () =>
        getDocs(collection(rDb, "emailIndex"))
    );
    await expectOk("resolveEmailToUser: get provider by exact email", async () => {
        const snap = await getDoc(doc(rDb, `emailIndex/${providerEmail}`));
        if (!snap.exists() || snap.data().uid !== pUid) throw new Error("lookup mismatch");
    });

    // 3. plan ownership
    const planId = "test-plan-1";
    await expectOk("recipient creates own plan", () =>
        setDoc(doc(rDb, `users/${rUid}/plans/${planId}`), {
            name: "Test Plan",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        })
    );
    await expectDenied("provider CANNOT read plan before any share exists", () =>
        getDoc(doc(pDb, `users/${rUid}/plans/${planId}`)).then((s) => {
            if (!s.exists()) throw Object.assign(new Error("not found (rule blocked list? or just empty)"), { code: "not-found" });
        })
    );

    // 4. share with view permission
    await expectOk("recipient creates share (scope=all, permission=view)", () =>
        setDoc(doc(rDb, `users/${rUid}/shares/${pUid}`), {
            providerUid: pUid,
            providerEmail,
            scope: "all",
            planIds: [],
            permission: "view",
            recipientEmail,
            recipientDisplayName: "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        })
    );
    await expectOk("provider CAN now read the plan (view grant)", async () => {
        const snap = await getDoc(doc(pDb, `users/${rUid}/plans/${planId}`));
        if (!snap.exists()) throw new Error("plan not visible");
    });
    await expectDenied("provider CANNOT write the plan (view-only)", () =>
        setDoc(doc(pDb, `users/${rUid}/plans/${planId}`), { name: "Hacked" }, { merge: true })
    );
    await expectOk("provider CAN comment while view-only", () =>
        setDoc(doc(collection(pDb, `users/${rUid}/plans/${planId}/comments`), "c1"), {
            text: "Progress looks good",
            targetGoal: null,
            authorUid: pUid,
            authorName: "Provider",
            authorRole: "provider",
            createdAt: serverTimestamp(),
        })
    );
    await expectOk("collection-group query finds the share for the provider", async () => {
        const snap = await getDocs(
            query(collectionGroup(pDb, "shares"), where("providerUid", "==", pUid))
        );
        if (snap.empty) throw new Error("no shares found via collection group");
    });

    // 4b. version history — created by savePlan.js as an editing-session
    // snapshot (see CLAUDE.md's "היסטוריית גרסאות"). Readable by anyone with
    // access to the plan; writable only by whoever can write the plan.
    await expectOk("recipient creates a version snapshot", () =>
        setDoc(doc(rDb, `users/${rUid}/plans/${planId}/versions/v1`), {
            data: { name: "Test Plan" },
            startedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            editedByUid: rUid,
            editedByName: "Recipient",
            editedByRole: "recipient",
        })
    );
    await expectOk("provider (view-only) CAN read the version history", async () => {
        const snap = await getDoc(doc(pDb, `users/${rUid}/plans/${planId}/versions/v1`));
        if (!snap.exists()) throw new Error("version not visible");
    });
    await expectDenied("provider (view-only) CANNOT create a version", () =>
        setDoc(doc(pDb, `users/${rUid}/plans/${planId}/versions/v2`), {
            data: { name: "Hacked" },
            startedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            editedByUid: pUid,
            editedByName: "Provider",
            editedByRole: "provider",
        })
    );
    await expectDenied("nobody can delete a version — permanent history", () =>
        deleteDoc(doc(rDb, `users/${rUid}/plans/${planId}/versions/v1`))
    );

    // 5. upgrade to edit
    await expectOk("recipient upgrades share to permission=edit", () =>
        setDoc(
            doc(rDb, `users/${rUid}/shares/${pUid}`),
            { permission: "edit" },
            { merge: true }
        )
    );
    await expectOk("provider CAN write the plan after upgrade to edit", () =>
        setDoc(doc(pDb, `users/${rUid}/plans/${planId}`), { name: "Edited by provider" }, { merge: true })
    );
    await expectOk("provider CAN create a version after upgrade to edit", () =>
        setDoc(doc(pDb, `users/${rUid}/plans/${planId}/versions/v2`), {
            data: { name: "Edited by provider" },
            startedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            editedByUid: pUid,
            editedByName: "Provider",
            editedByRole: "provider",
        })
    );
    await expectDenied("provider CANNOT create a version claiming the recipient as editor", () =>
        setDoc(doc(pDb, `users/${rUid}/plans/${planId}/versions/v3`), {
            data: { name: "Spoofed" },
            startedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            editedByUid: rUid,
            editedByName: "Recipient",
            editedByRole: "recipient",
        })
    );
    await expectDenied("nobody can delete a version even after edit grant", () =>
        deleteDoc(doc(pDb, `users/${rUid}/plans/${planId}/versions/v2`))
    );

    // 6. revoke is now a soft-delete (deletedAt set), not an outright
    // deleteDoc — access must still be blocked immediately, even though the
    // share document itself still exists in the trash for 30 days.
    await expectOk("recipient revokes the share (soft-delete)", () =>
        updateDoc(doc(rDb, `users/${rUid}/shares/${pUid}`), { deletedAt: serverTimestamp() })
    );
    await expectDenied("provider CANNOT read the plan after revoke", () =>
        getDoc(doc(pDb, `users/${rUid}/plans/${planId}`)).then((s) => {
            if (!s.exists()) throw Object.assign(new Error("blocked"), { code: "not-found" });
        })
    );
    await expectOk("collection-group query still returns the trashed share (client filters it out)", async () => {
        const snap = await getDocs(
            query(collectionGroup(pDb, "shares"), where("providerUid", "==", pUid))
        );
        const found = snap.docs.find((d) => d.data().deletedAt != null);
        if (!found) throw new Error("expected the trashed share to still be readable, with deletedAt set");
    });
    await expectOk("provider's own get() of the revoked share doc still exists, with deletedAt set", async () => {
        const snap = await getDoc(doc(pDb, `users/${rUid}/shares/${pUid}`));
        if (!snap.exists() || snap.data().deletedAt == null) throw new Error("expected trashed share to still exist");
    });
    await expectDenied("provider CANNOT hard-delete the trashed share", () =>
        deleteDoc(doc(pDb, `users/${rUid}/shares/${pUid}`))
    );
    await expectOk("recipient restores the share (clears deletedAt)", () =>
        updateDoc(doc(rDb, `users/${rUid}/shares/${pUid}`), { deletedAt: null })
    );
    await expectOk("provider CAN read the plan again after restore", async () => {
        const snap = await getDoc(doc(pDb, `users/${rUid}/plans/${planId}`));
        if (!snap.exists()) throw new Error("plan not visible after restore");
    });
    await expectOk("recipient re-revokes the share", () =>
        updateDoc(doc(rDb, `users/${rUid}/shares/${pUid}`), { deletedAt: serverTimestamp() })
    );
    await expectOk("recipient hard-deletes the now-trashed share", () =>
        deleteDoc(doc(rDb, `users/${rUid}/shares/${pUid}`))
    );
    await expectOk("recipient re-creates the share (active, permission=edit)", () =>
        setDoc(doc(rDb, `users/${rUid}/shares/${pUid}`), {
            providerUid: pUid,
            providerEmail,
            scope: "all",
            planIds: [],
            permission: "edit",
            recipientEmail,
            recipientDisplayName: "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            deletedAt: null,
        })
    );
    await expectDenied("recipient CANNOT hard-delete an active (non-trashed) share", () =>
        deleteDoc(doc(rDb, `users/${rUid}/shares/${pUid}`))
    );

    // 7. comment soft-delete/restore/hard-delete (c1 was created by the
    // provider back in step 4, while view-only).
    const commentRef = doc(rDb, `users/${rUid}/plans/${planId}/comments/c1`);
    await expectOk("comment author (provider) soft-deletes their own comment", () =>
        updateDoc(doc(pDb, `users/${rUid}/plans/${planId}/comments/c1`), { deletedAt: serverTimestamp() })
    );
    await expectOk("comment author (provider) hard-deletes their own trashed comment", () =>
        deleteDoc(doc(pDb, `users/${rUid}/plans/${planId}/comments/c1`))
    );
    await expectOk("provider re-creates the comment", () =>
        setDoc(doc(pDb, `users/${rUid}/plans/${planId}/comments/c1`), {
            text: "Progress looks good",
            targetGoal: null,
            authorUid: pUid,
            authorName: "Provider",
            authorRole: "provider",
            createdAt: serverTimestamp(),
            deletedAt: null,
        })
    );
    await expectDenied("recipient CANNOT hard-delete a comment that isn't trashed yet", () =>
        deleteDoc(commentRef)
    );
    await expectOk("recipient (plan owner) soft-deletes another author's comment", () =>
        updateDoc(commentRef, { deletedAt: serverTimestamp() })
    );
    await expectOk("recipient restores the comment", () => updateDoc(commentRef, { deletedAt: null }));

    // 8. plan soft-delete/hard-delete (separate plan so it doesn't disturb
    // the comment/share tests above, which still reference planId).
    const planId2 = "test-plan-2";
    await expectOk("recipient creates a second plan", () =>
        setDoc(doc(rDb, `users/${rUid}/plans/${planId2}`), {
            name: "Second Plan",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        })
    );
    await expectDenied("provider (edit-permission) CANNOT hard-delete a plan — edit grants writes, not deletes", () =>
        deleteDoc(doc(pDb, `users/${rUid}/plans/${planId2}`))
    );
    await expectDenied("recipient CANNOT hard-delete a plan that isn't trashed yet", () =>
        deleteDoc(doc(rDb, `users/${rUid}/plans/${planId2}`))
    );
    await expectOk("recipient soft-deletes the plan", () =>
        updateDoc(doc(rDb, `users/${rUid}/plans/${planId2}`), { deletedAt: serverTimestamp() })
    );
    await expectDenied("provider CANNOT hard-delete even a trashed plan — owner-only", () =>
        deleteDoc(doc(pDb, `users/${rUid}/plans/${planId2}`))
    );
    await expectOk("recipient restores the plan", () =>
        updateDoc(doc(rDb, `users/${rUid}/plans/${planId2}`), { deletedAt: null })
    );
    await expectOk("recipient re-soft-deletes the plan", () =>
        updateDoc(doc(rDb, `users/${rUid}/plans/${planId2}`), { deletedAt: serverTimestamp() })
    );
    await expectOk("recipient hard-deletes the now-trashed plan", () =>
        deleteDoc(doc(rDb, `users/${rUid}/plans/${planId2}`))
    );

    console.log(`\n${passed} passed, ${failed} failed`);
    await deleteApp(recipientApp);
    await deleteApp(providerApp);
    process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
    console.error("Script error:", e);
    process.exit(1);
});
