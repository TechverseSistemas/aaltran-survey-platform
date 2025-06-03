import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  SetOptions,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Employee } from '../types/employees.types';
import { fromFirestore } from '../utils';

const COMPANIES_COLLECTION = 'employees';
export const employessService = {
  create: async (
    employeeData: Omit<Employee, 'id' | 'created_at'>
  ): Promise<{
    codRet: number;
    msgRet: string;
  }> => {
    const employeesRef = collection(db, COMPANIES_COLLECTION) as CollectionReference<Employee>;
    try {
      const newEmployeeRef = doc(employeesRef);
      await runTransaction(db, async (transaction) => {
        transaction.set(newEmployeeRef, {
          ...employeeData,
          created_at: Timestamp.now(),
        } as Employee);
      });
      return {
        codRet: 0,
        msgRet: `Employee created successfully with ID ${newEmployeeRef.id}`,
      };
    } catch (error) {
      return {
        codRet: 1,
        msgRet: `Error creating employee: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
  },

  getAllByCompanyId: async (id_company: string): Promise<Employee[]> => {
    const q = query(collection(db, COMPANIES_COLLECTION), where('id_company', '==', id_company));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSn) => fromFirestore<Employee>(docSn));
  },

  getById: async (id: string | undefined): Promise<Employee | null> => {
    const docRef = doc(db, COMPANIES_COLLECTION, id ? id : '');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return fromFirestore<Employee>(docSnap);
    } else {
      return null;
    }
  },

  update: async (
    id: string | undefined,
    employeeData: Partial<Omit<Employee, 'id' | 'created_at'>>
  ): Promise<{
    codRet: number;
    msgRet: string;
  }> => {
    const docRef = doc(db, COMPANIES_COLLECTION, id ? id : '');
    try {
      await updateDoc(docRef, employeeData as SetOptions);
      return {
        codRet: 0,
        msgRet: `Employee with ID ${id} updated successfully`,
      };
    } catch (error) {
      return {
        codRet: 1,
        msgRet: `Error updating employee: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
  },
  delete: async (
    id: string | undefined
  ): Promise<{
    codRet: number;
    msgRet: string;
  }> => {
    const docRef = doc(db, COMPANIES_COLLECTION, id ? id : '');
    try {
      await deleteDoc(docRef);
      return {
        codRet: 0,
        msgRet: `Employee with ID ${id} deleted successfully`,
      };
    } catch (error) {
      return {
        codRet: 1,
        msgRet: `Error deleting employee: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
  },
  getAll: async (): Promise<Employee[]> => {
    const q = query(collection(db, COMPANIES_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSn) => fromFirestore<Employee>(docSn));
  },
};
