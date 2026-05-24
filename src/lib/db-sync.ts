import { doc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase/config';

// Safe JSON parser helper
function safeJsonParse(str: string | null | undefined, defaultValue: any = null) {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
}

// Convert Date objects to Firebase Timestamps recursively
function convertDatesToTimestamps(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) {
    return Timestamp.fromDate(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => convertDatesToTimestamps(item));
  }
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = convertDatesToTimestamps(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

// Map Prisma SQLite object to Firebase document format
export function mapSqlToFirebase(collectionName: string, sqlData: any): any {
  if (!sqlData) return null;
  
  const mapped = { ...sqlData };
  
  // Remove SQLite-only fields
  delete mapped.passwordHash; // Don't sync password hashes to Firestore
  
  // Handle specific fields transformations
  if (collectionName === 'users') {
    mapped.certifications = mapped.certifications 
      ? mapped.certifications.split(',').map((s: string) => s.trim()).filter(Boolean) 
      : [];
    mapped.allowedSections = safeJsonParse(mapped.allowedSections, []);
  } else if (collectionName === 'patrols') {
    mapped.routeCoordinates = safeJsonParse(mapped.routeCoordinates, []);
  } else if (collectionName === 'observations') {
    mapped.indicators = safeJsonParse(mapped.indicators, []);
  } else if (collectionName === 'homepage') {
    mapped.announcements = safeJsonParse(mapped.announcements, []);
  } else if (collectionName === 'visitor_guide') {
    mapped.links = safeJsonParse(mapped.links, []);
  }

  // Convert Date objects to Timestamps
  return convertDatesToTimestamps(mapped);
}

export async function syncToFirebase(collectionName: string, id: string, sqlData: any) {
  try {
    const docRef = doc(db, collectionName, id);
    const firebaseData = mapSqlToFirebase(collectionName, sqlData);
    if (firebaseData.id) delete firebaseData.id; // Firebase ID is the doc path/id, not in doc data
    await setDoc(docRef, firebaseData);
    console.log(`Successfully synced ${collectionName}/${id} to Firebase`);
  } catch (error) {
    console.error(`Error syncing ${collectionName}/${id} to Firebase:`, error);
  }
}

export async function deleteFromFirebase(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    console.log(`Successfully deleted ${collectionName}/${id} from Firebase`);
  } catch (error) {
    console.error(`Error deleting ${collectionName}/${id} from Firebase:`, error);
  }
}
