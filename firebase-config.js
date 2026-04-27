/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   PRANVIX V2 — Firebase Configuration               ║
 * ║   Fill in YOUR Firebase project details below       ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * HOW TO GET THESE VALUES:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a new project (or open existing)
 * 3. Click the Web icon (</>)  to add a web app
 * 4. Copy the firebaseConfig object and paste below
 * 5. Enable Authentication → Email/Password
 * 6. Enable Firestore Database (Start in test mode)
 * 7. Enable Storage (Start in test mode)
 */

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCewIz5_LxFFxOAzsiscMDoYErFH2c3vK0",
  authDomain: "pranvix-1.firebaseapp.com",
  projectId: "pranvix-1",
  storageBucket: "pranvix-1.firebasestorage.app",
  messagingSenderId: "817112176548",
  appId: "1:817112176548:web:d4cc63f20afceff6a29331"
};

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);

// ─── Admin email (only this email gets access to /admin.html) ───
const ADMIN_EMAIL = "ujjwalsingh16072006@bbdu.ac.in";

// ─── BBDU email restriction ─────────────────────────────────────
const ALLOWED_EMAIL_DOMAIN = "@bbdu.ac.in";
