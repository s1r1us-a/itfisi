/**
 * social.js — Community-/Sozial-Datenzugriff über die Firebase Realtime Database.
 *
 * Kapselt alle Lese-/Schreibzugriffe auf die ÖFFENTLICHEN Knoten, die für die
 * Community-Funktionen nötig sind. Im Gegensatz zu /users/{uid} (privat) sind
 * diese Knoten für alle angemeldeten Nutzer:innen lesbar (siehe firebase-rules.json):
 *
 *   /profiles/{uid}                     – kuratierter, öffentlicher Profil-Snapshot
 *                                         (Anzeigename + Lernstatistiken, KEINE E-Mail)
 *   /profileLikes/{uid}/{likerUid}      – Likes auf ein Profil
 *   /profileComments/{uid}/{commentId}  – Kommentare auf einem Profil
 *
 * Alle Funktionen sind defensiv: Bei fehlender Verbindung / fehlenden Rechten
 * werfen sie zwar (damit die UI reagieren kann), aber die übrige App bleibt nutzbar.
 */

import { db } from "./firebase.js";
import {
  ref,
  get,
  set,
  remove,
  push,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

/* ------------------------------------------------------------------ *
 *  Öffentliche Profile
 * ------------------------------------------------------------------ */

/**
 * Schreibt den öffentlichen Profil-Snapshot eines Accounts.
 * snapshot kommt aus stats.publicProfileSnapshot(); displayName separat, damit
 * der Name die kanonische Quelle (Firebase-Auth) bleibt.
 */
export function publishProfile(uid, displayName, snapshot) {
  if (!uid) return Promise.resolve();
  const data = {
    ...snapshot,
    displayName: displayName || "Lernende:r",
    updatedAt: Date.now(),
  };
  return set(ref(db, `profiles/${uid}`), data);
}

/** Liefert ein einzelnes öffentliches Profil { uid, ... } oder null. */
export async function getProfile(uid) {
  if (!uid) return null;
  const snap = await get(ref(db, `profiles/${uid}`));
  if (!snap.exists()) return null;
  return { uid, ...snap.val() };
}

/** Liefert alle öffentlichen Profile als Array [{ uid, ... }]. */
export async function getAllProfiles() {
  const snap = await get(ref(db, "profiles"));
  if (!snap.exists()) return [];
  const val = snap.val();
  return Object.keys(val).map((uid) => ({ uid, ...val[uid] }));
}

/**
 * Liefert das Leaderboard: alle Profile absteigend nach Punkten sortiert.
 * Jedes Element erhält zusätzlich rank (1-basiert).
 */
export async function getLeaderboard() {
  const profiles = await getAllProfiles();
  profiles.sort((a, b) => (b.points || 0) - (a.points || 0));
  profiles.forEach((p, i) => { p.rank = i + 1; });
  return profiles;
}

/* ------------------------------------------------------------------ *
 *  Likes
 * ------------------------------------------------------------------ */

/** Likes eines Profils: { count, likedByMe }. */
export async function getLikes(profileUid, myUid) {
  const snap = await get(ref(db, `profileLikes/${profileUid}`));
  if (!snap.exists()) return { count: 0, likedByMe: false };
  const val = snap.val();
  return { count: Object.keys(val).length, likedByMe: !!(myUid && val[myUid]) };
}

/**
 * Schaltet das Like des aktuellen Accounts auf einem Profil um.
 * Gibt den neuen Zustand { count, likedByMe } zurück.
 */
export async function toggleLike(profileUid, myUid) {
  if (!myUid) throw new Error("not-signed-in");
  const likeRef = ref(db, `profileLikes/${profileUid}/${myUid}`);
  const existing = await get(likeRef);
  if (existing.exists()) await remove(likeRef);
  else await set(likeRef, true);
  return getLikes(profileUid, myUid);
}

/* ------------------------------------------------------------------ *
 *  Kommentare
 * ------------------------------------------------------------------ */

/** Kommentare eines Profils, aufsteigend nach Zeit: [{ id, authorUid, authorName, text, createdAt }]. */
export async function getComments(profileUid) {
  const snap = await get(ref(db, `profileComments/${profileUid}`));
  if (!snap.exists()) return [];
  const val = snap.val();
  return Object.keys(val)
    .map((id) => ({ id, ...val[id] }))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}

/** Fügt einen Kommentar hinzu. Liefert die neue Kommentar-ID. */
export async function addComment(profileUid, authorUid, authorName, text) {
  if (!authorUid) throw new Error("not-signed-in");
  const clean = String(text || "").trim();
  if (!clean) throw new Error("empty-comment");
  const listRef = ref(db, `profileComments/${profileUid}`);
  const newRef = push(listRef);
  await set(newRef, {
    authorUid,
    authorName: authorName || "Lernende:r",
    text: clean.slice(0, 1000),
    createdAt: Date.now(),
  });
  return newRef.key;
}

/**
 * Löscht einen Kommentar. Die Datenbank-Regeln erlauben dies nur dem Autor
 * oder dem Profil-Eigentümer.
 */
export function deleteComment(profileUid, commentId) {
  return remove(ref(db, `profileComments/${profileUid}/${commentId}`));
}
