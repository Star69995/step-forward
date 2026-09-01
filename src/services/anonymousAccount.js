// Shared mechanics for "anonymous" (username + password, no real email)
// accounts. These accounts still use Firebase Auth's normal email/password
// provider — there's no separate/parallel auth mechanism — just with a
// synthetic, non-deliverable email deterministically derived from the
// username, so login never needs a Firestore lookup (see resolveUsernameToUser
// for the one thing that *does* need a lookup: turning a username into a uid
// for sharing). ".invalid" is the domain RFC 2606 reserves specifically for
// addresses that must never resolve.
export const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
export const ANON_EMAIL_DOMAIN = "usernames.invalid";

export const normalizeUsername = (value) => (value || "").trim().toLowerCase();

export const syntheticEmailForUsername = (username) => `${normalizeUsername(username)}@${ANON_EMAIL_DOMAIN}`;

export const isSyntheticEmail = (email) => !!email && email.toLowerCase().endsWith(`@${ANON_EMAIL_DOMAIN}`);
