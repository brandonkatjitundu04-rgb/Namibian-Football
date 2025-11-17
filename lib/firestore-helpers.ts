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
export const dateToTimestamp = (date: Date | string | null | undefined): Timestamp | null => {
  if (!date) return null
  
  try {
    let dateObj: Date
    if (typeof date === 'string') {
      dateObj = new Date(date)
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date string provided to dateToTimestamp:', date)
        return null
      }
    } else {
      dateObj = date
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to dateToTimestamp:', date)
      return null
    }
    
    return Timestamp.fromDate(dateObj)
  } catch (error) {
    console.error('Error converting date to timestamp:', error)
    return null
  }
}

// Generic CRUD operations
export const firestoreHelpers = {
  // Create or update a document
  async set(collectionName: string, id: string, data: any) {
    try {
      if (!collectionName || !id) {
        throw new Error('Collection name and document ID are required')
      }
      const docRef = doc(db, collectionName, id)
      // Convert Date objects to Timestamps
      const processedData = processDatesForFirestore(data)
      await setDoc(docRef, processedData, { merge: true })
      return docRef
    } catch (error: any) {
      console.error(`Error setting document in ${collectionName}:`, error)
      throw new Error(`Failed to set document: ${error.message || error}`)
    }
  },

  // Get a single document
  async get(collectionName: string, id: string) {
    try {
      if (!collectionName || !id) {
        throw new Error('Collection name and document ID are required')
      }
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error: any) {
      console.error(`Error getting document from ${collectionName}:`, error)
      throw new Error(`Failed to get document: ${error.message || error}`)
    }
  },

  // Get all documents in a collection
  async getAll(collectionName: string, constraints: QueryConstraint[] = []) {
    try {
      if (!collectionName) {
        throw new Error('Collection name is required')
      }
      const collectionRef = collection(db, collectionName)
      const q = constraints.length > 0 
        ? query(collectionRef, ...constraints)
        : query(collectionRef)
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error: any) {
      console.error(`Error getting all documents from ${collectionName}:`, error)
      throw new Error(`Failed to get documents: ${error.message || error}`)
    }
  },

  // Update a document
  async update(collectionName: string, id: string, data: any) {
    try {
      if (!collectionName || !id) {
        throw new Error('Collection name and document ID are required')
      }
      const docRef = doc(db, collectionName, id)
      const processedData = processDatesForFirestore(data)
      await updateDoc(docRef, processedData)
    } catch (error: any) {
      console.error(`Error updating document in ${collectionName}:`, error)
      throw new Error(`Failed to update document: ${error.message || error}`)
    }
  },

  // Delete a document
  async delete(collectionName: string, id: string) {
    try {
      if (!collectionName || !id) {
        throw new Error('Collection name and document ID are required')
      }
      const docRef = doc(db, collectionName, id)
      await deleteDoc(docRef)
    } catch (error: any) {
      console.error(`Error deleting document from ${collectionName}:`, error)
      throw new Error(`Failed to delete document: ${error.message || error}`)
    }
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

