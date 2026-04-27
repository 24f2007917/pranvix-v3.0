/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   PRANVIX V2 — Firebase Configuration               ║
 * ╚══════════════════════════════════════════════════════╝
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCewIz5_LxFFxOAzsiscMDoYErFH2c3vK0",
  authDomain: "pranvix-1.firebaseapp.com",
  projectId: "pranvix-1",
  storageBucket: "pranvix-1.firebasestorage.app",
  messagingSenderId: "817112176548",
  appId: "1:817112176548:web:d4cc63f20afceff6a29331"
};

// ─── Admin email (only this email gets access to /admin.html) ───
const ADMIN_EMAIL = "ujjwalsingh16072006@bbdu.ac.in";

// ─── BBDU email restriction ─────────────────────────────────────
const ALLOWED_EMAIL_DOMAIN = "@bbdu.ac.in";

// NOTE: Do NOT call firebase.initializeApp() here.
// Each page (login, register, chatbot, admin) calls it themselves
// using a try/catch guard to avoid double-initialisation errors.
