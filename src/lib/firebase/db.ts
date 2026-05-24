import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './config';

// Generic subscriber for real-time updates
export function subscribeToCollection<T>(
  collectionName: string, 
  callback: (data: T[]) => void,
  q?: any
) {
  const collRef = collection(db, collectionName);
  const targetQuery = q ? q : collRef;
  
  return onSnapshot(targetQuery, (snapshot: any) => {
    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as T[];
    callback(data);
  });
}

// Add Document
export async function addDocument<T>(collectionName: string, data: T) {
  const collRef = collection(db, collectionName);
  const docRef = await addDoc(collRef, data as any);
  return docRef.id;
}

// Update Document
export async function updateDocument<T>(collectionName: string, id: string, data: Partial<T>) {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data as any);
}

// Delete Document
export async function deleteDocument(collectionName: string, id: string) {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

// Helper to get collection once (not real-time)
export async function getCollection<T>(collectionName: string) {
  const collRef = collection(db, collectionName);
  const snapshot = await getDocs(collRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
}
