/**
 * firebase.js — Firebase-Initialisierung (Auth + Realtime Database).
 *
 * Nutzt das modulare Firebase-SDK direkt als ES-Modul vom gstatic-CDN, passend
 * zur „kein Build / kein npm"-Philosophie der Plattform. Es werden bewusst nur
 * App, Auth und Realtime Database geladen – kein Analytics.
 *
 * Hinweis zur Sicherheit: Die Web-Config (inkl. apiKey) ist bei Firebase
 * absichtlich öffentlich. Der Schutz der Daten erfolgt NICHT über Geheimhaltung
 * dieser Werte, sondern über die Realtime-Database-Regeln (siehe firebase-rules.json),
 * die jedem Account nur Zugriff auf seinen eigenen Knoten /users/{uid} erlauben.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCHxSGhIWMgK6z-SoX1Wrm3nrgf_VPgxzo",
  authDomain: "fisi-822b2.firebaseapp.com",
  databaseURL: "https://fisi-822b2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fisi-822b2",
  storageBucket: "fisi-822b2.firebasestorage.app",
  messagingSenderId: "2226852075",
  appId: "1:2226852075:web:89175c7b3063c7e15b6eae",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
