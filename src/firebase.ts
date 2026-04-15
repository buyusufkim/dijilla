import { 
  db, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  orderBy, 
  serverTimestamp, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  setDoc
} from "./lib/supabase/db";
import { 
  auth, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "./lib/supabase/auth";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from "./lib/supabase/storage";
import type { User } from "./lib/supabase/types";

// Mocking Timestamp for compatibility
export const Timestamp = {
  now: () => new Date(),
  fromDate: (date: Date) => date,
};

// Mocking GoogleAuthProvider
export const GoogleAuthProvider = class {};
export const signInWithPopup = async () => {
  throw new Error("Google Login is not implemented for Supabase in this environment yet. Please use email/password.");
};

export {
  db,
  auth,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  setDoc,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};

export type { User };
