/**
 * cloud.js — Synchronisation des Lernstands mit der Firebase Realtime Database.
 *
 * Verbindet den Anmeldestatus (auth.js) mit dem zentralen State (stats.js):
 *  - Beim Login wird der Cloud-Stand geladen und in die App übernommen
 *    (Cloud gewinnt). Ist der Account noch leer, wird der vorhandene lokale
 *    Fortschritt einmalig hochgeladen (Migration des Gast-Stands).
 *  - Danach wird jede Änderung am State (debounced) zurück in die Cloud
 *    geschrieben, sodass der Fortschritt geräteübergreifend erhalten bleibt.
 *
 * Bewusst KEIN onValue-Live-Listener: pro Sitzung wird einmal geladen und bei
 * Änderungen geschrieben. Das vermeidet Überschreib-Schleifen; localStorage
 * dient weiterhin als Offline-Cache (siehe stats.setUserScope).
 */

import { db } from "./firebase.js";
import {
  ref,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import * as stats from "./stats.js";

const SAVE_DEBOUNCE_MS = 1500;

let unsubscribe = null;     // onChange-Abmeldefunktion
let saveTimer = null;       // Debounce-Timer
let activeUid = null;       // aktuell synchronisierter User
let ready = false;          // erst nach initialem Laden schreiben

function stateRef(uid) {
  return ref(db, `users/${uid}/state`);
}

/** Schreibt den aktuellen State (debounced) in die Cloud. */
function scheduleSave() {
  if (!ready || !activeUid) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, SAVE_DEBOUNCE_MS);
}

/** Schreibt sofort, sofern ein User aktiv ist. Gibt das Schreib-Promise zurück. */
function flush() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  if (!ready || !activeUid) return Promise.resolve();
  const uid = activeUid;
  return set(stateRef(uid), stats.getState()).catch((e) => {
    console.warn("Cloud-Speichern fehlgeschlagen (Offline-Cache bleibt erhalten).", e);
  });
}

/**
 * Startet die Synchronisation für einen angemeldeten User.
 * Lädt den Cloud-Stand bzw. migriert den lokalen Stand und abonniert Änderungen.
 */
export async function start(user) {
  const uid = user.uid;
  activeUid = uid;
  ready = false;

  try {
    const snap = await get(stateRef(uid));
    if (snap.exists()) {
      // Cloud-Stand vorhanden → übernehmen (Cloud gewinnt).
      stats.hydrate(snap.val());
    } else {
      // Neuer/leerer Account → vorhandenen lokalen Stand hochladen (Migration).
      await set(stateRef(uid), stats.getState());
      await set(ref(db, `users/${uid}/profile`), {
        email: user.email || null,
        createdAt: Date.now(),
      });
    }
  } catch (e) {
    console.warn("Cloud-Laden fehlgeschlagen – es wird der lokale Stand verwendet.", e);
  }

  ready = true;

  // Erst NACH dem Laden abonnieren, damit die initiale Hydration keinen
  // sofortigen Rückschreib-Vorgang auslöst.
  unsubscribe = stats.onChange(scheduleSave);
}

/** Beendet die Synchronisation (Logout). Schreibt Ausstehendes noch einmal weg. */
export async function stop() {
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  // Letzten Stand sichern, solange wir die uid noch kennen.
  if (saveTimer) await flush();
  ready = false;
  activeUid = null;
}
