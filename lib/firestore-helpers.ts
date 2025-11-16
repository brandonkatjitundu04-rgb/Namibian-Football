import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore'
import { db } from './firebase'

// Helper to convert Firestore Timestamp to Date
export const timestampToDate = (timestamp: any): Date | null => {
  if (!timestamp) return null
  if (timestamp?.toDate) {
    return timestamp.toDate()
  }
  if (timestamp instanceof Date) {
    return timestamp
  }
  try {
    return new Date(timestamp)
  } catch (e) {
    return null
  }
}

// Helper to convert Date to Firestore Timestamp
export const dateToTimestamp = (date: Date | string) => {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return Timestamp.fromDate(date)
}

// Generic CRUD operations
export const firestoreHelpers = {
  // Create or update a document
  async set(collectionName: string, id: string, data: any) {
    const docRef = doc(db, collectionName, id)
    // Convert Date objects to Timestamps
    const processedData = processDatesForFirestore(data)
    await setDoc(docRef, processedData, { merge: true })
    return docRef
  },

  // Get a single document
  async get(collectionName: string, id: string) {
    const docRef = doc(db, collectionName, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  },

  // Get all documents in a collection
  async getAll(collectionName: string, constraints: QueryConstraint[] = []) {
    const collectionRef = collection(db, collectionName)
    const q = constraints.length > 0 
      ? query(collectionRef, ...constraints)
      : query(collectionRef)
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  },

  // Update a document
  async update(collectionName: string, id: string, data: any) {
    const docRef = doc(db, collectionName, id)
    const processedData = processDatesForFirestore(data)
    await updateDoc(docRef, processedData)
  },

  // Delete a document
  async delete(collectionName: string, id: string) {
    const docRef = doc(db, collectionName, id)
    await deleteDoc(docRef)
  },

  // Query helper
  query: {
    where,
    orderBy,
    limit,
  }
}

// Helper to process dates in objects for Firestore
function processDatesForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }
  
  if (obj instanceof Date) {
    return Timestamp.fromDate(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => processDatesForFirestore(item))
  }
  
  if (typeof obj === 'object') {
    const processed: any = {}
    for (const key in obj) {
      if (obj[key] instanceof Date) {
        processed[key] = Timestamp.fromDate(obj[key])
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        processed[key] = processDatesForFirestore(obj[key])
      } else {
        processed[key] = obj[key]
      }
    }
    return processed
  }
  
  return obj
}

