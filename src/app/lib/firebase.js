// lib/firebase.js
import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs } from "firebase/firestore"
import { getAuth, GoogleAuthProvider, onAuthStateChanged, User, signOut } from "firebase/auth"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyDhI-xmTn7pNDYzISS1WbnfGGAfDLoU2PM",
  authDomain: "missonjobportal.firebaseapp.com",
  projectId: "missonjobportal",
  storageBucket: "missonjobportal.firebasestorage.app",
  messagingSenderId: "631191077926",
  appId: "1:631191077926:web:0242f41393e65d4ad712e7",
  measurementId: "G-229FSW9WDT",
}

export const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const storage = getStorage(app)

export { db, collection, getDocs, onAuthStateChanged, User, signOut }