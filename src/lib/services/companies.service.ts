import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  CollectionReference,
  DocumentData,
  WriteBatch,
  writeBatch,
  where,
  orderBy,
  SetOptions,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Company } from '../types/companies.type';

const COMPANIES_COLLECTION = 'companies';
export const clientCompanyService = {
  create: async (
    companyData: Omit<Company, 'id' | 'created_at'>
  ): Promise<{
    codRet: number;
    msgRet: string;
  }> => {
    const newCompanyData: Omit<Company, 'id'> = {
      ...companyData,
      created_at: Timestamp.now(),
    };
    try {
      const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), newCompanyData);
      return {
        codRet: 0,
        msgRet: `Company created successfully with ID: ${docRef.id}`,
      };
    } catch (error) {
      return {
        codRet: 1,
        msgRet: `Error creating company: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
};
