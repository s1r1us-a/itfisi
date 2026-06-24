/**
 * auth.js — Dünne Hülle um Firebase Authentication (E-Mail/Passwort).
 *
 * Stellt die von der App benötigten Aktionen bereit (Registrieren, Anmelden,
 * Abmelden, Passwort zurücksetzen, Auth-Status beobachten) und übersetzt die
 * Firebase-Fehlercodes in verständliche deutsche Meldungen.
 */

import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

/** Registriert einen neuen Account. Gibt das User-Objekt zurück. */
export async function register(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/** Meldet einen bestehenden Account an. */
export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/** Meldet den aktuellen Account ab. */
export function logout() {
  return signOut(auth);
}

/** Sendet eine E-Mail zum Zurücksetzen des Passworts. */
export function sendReset(email) {
  return sendPasswordResetEmail(auth, email);
}

/** Beobachtet den Anmeldestatus. cb erhält das User-Objekt oder null. */
export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

/** Aktuell angemeldeter User (oder null). */
export function currentUser() {
  return auth.currentUser;
}

/* ------------------------------------------------------------------ *
 *  Account-Verwaltung (Anzeigename, E-Mail, Passwort)
 * ------------------------------------------------------------------ */

/** Setzt/aktualisiert den Anzeigenamen des aktuellen Accounts. */
export async function updateDisplayName(name) {
  const user = auth.currentUser;
  if (!user) throw new Error("not-signed-in");
  await updateProfile(user, { displayName: name });
  return user;
}

/**
 * Bestätigt die Identität erneut (für sensible Änderungen wie E-Mail/Passwort).
 * Firebase verlangt dafür eine kürzliche Anmeldung; bei falschem Passwort wirft
 * Firebase auth/invalid-credential bzw. auth/wrong-password.
 */
export async function reauthenticate(currentPassword) {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("not-signed-in");
  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  return reauthenticateWithCredential(user, cred);
}

/**
 * Ändert die E-Mail-Adresse. Verwendet verifyBeforeUpdateEmail: Firebase sendet
 * einen Bestätigungslink an die NEUE Adresse; erst nach Klick wird sie aktiv.
 * Erfordert das aktuelle Passwort (Reauthentifizierung).
 */
export async function changeEmail(newEmail, currentPassword) {
  await reauthenticate(currentPassword);
  await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
}

/**
 * Ändert das Passwort. Erfordert das aktuelle Passwort (Reauthentifizierung).
 */
export async function changePassword(newPassword, currentPassword) {
  await reauthenticate(currentPassword);
  await updatePassword(auth.currentUser, newPassword);
}

/* ------------------------------------------------------------------ *
 *  Fehlertexte (Firebase-Code → Deutsch)
 * ------------------------------------------------------------------ */

const ERROR_MESSAGES = {
  "auth/invalid-email": "Die E-Mail-Adresse ist ungültig.",
  "auth/missing-email": "Bitte gib eine E-Mail-Adresse ein.",
  "auth/email-already-in-use": "Für diese E-Mail-Adresse besteht bereits ein Konto.",
  "auth/weak-password": "Das Passwort ist zu schwach (mindestens 6 Zeichen).",
  "auth/missing-password": "Bitte gib ein Passwort ein.",
  "auth/wrong-password": "E-Mail-Adresse oder Passwort ist falsch.",
  "auth/user-not-found": "E-Mail-Adresse oder Passwort ist falsch.",
  "auth/invalid-credential": "E-Mail-Adresse oder Passwort ist falsch.",
  "auth/user-disabled": "Dieses Konto wurde deaktiviert.",
  "auth/too-many-requests": "Zu viele Versuche. Bitte versuche es später erneut.",
  "auth/network-request-failed": "Netzwerkfehler. Bitte prüfe deine Internetverbindung.",
  "auth/operation-not-allowed": "Diese Aktion ist derzeit nicht erlaubt.",
  "auth/requires-recent-login": "Bitte melde dich aus Sicherheitsgründen erneut an und versuche es noch einmal.",
  "auth/invalid-new-email": "Die neue E-Mail-Adresse ist ungültig.",
};

/**
 * Übersetzt einen Firebase-Auth-Fehler in eine verständliche deutsche Meldung.
 * Akzeptiert den Error selbst oder einen Code-String.
 */
export function mapError(err) {
  const code = typeof err === "string" ? err : err?.code;
  return ERROR_MESSAGES[code] || "Es ist ein Fehler aufgetreten. Bitte versuche es erneut.";
}
