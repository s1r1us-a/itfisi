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
  "auth/operation-not-allowed": "Anmeldung per E-Mail/Passwort ist nicht aktiviert.",
};

/**
 * Übersetzt einen Firebase-Auth-Fehler in eine verständliche deutsche Meldung.
 * Akzeptiert den Error selbst oder einen Code-String.
 */
export function mapError(err) {
  const code = typeof err === "string" ? err : err?.code;
  return ERROR_MESSAGES[code] || "Es ist ein Fehler aufgetreten. Bitte versuche es erneut.";
}
