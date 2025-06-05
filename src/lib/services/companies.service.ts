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
import { Company } from '../../types/companies';
import { fromFirestore } from '../utils';

const COMPANIES_COLLECTION = 'companies';
export const clientCompanyService = {
  create: async (
    companyData: Omit<Company, 'id' | 'created_at'>
  ): Promise<{
    codRet: number;
    msgRet: string;
    companyId?: string; // Adicionado para retornar o ID da empresa em caso de sucesso
  }> => {
    const { cnpj } = companyData;
    if (!cnpj || cnpj.trim() === '') {
      return {
        codRet: 1,
        msgRet: 'CNPJ é obrigatório e não pode ser vazio.',
      };
    }
    try {
      // 2. Executar a operação como uma transação
      const newCompanyId = await runTransaction(db, async (transaction) => {
        const companiesCollectionRef = collection(
          db,
          COMPANIES_COLLECTION
        ) as CollectionReference<Company>;

        // 3. Dentro da transação: verificar se o CNPJ já existe
        const existingCompanyQuery = query(
          companiesCollectionRef,
          where('cnpj', '==', cnpj)
          // limit(1) // Opcional: limit(1) pode tornar a leitura um pouco mais eficiente
        );
        // Todas as leituras DEVEM vir antes de todas as escritas na transação
        const existingCompanySnapshot = await getDocs(existingCompanyQuery);
        if (!existingCompanySnapshot.empty) {
          throw new Error('Uma empresa com este CNPJ já existe.');
        }
        // 4. Se o CNPJ não existe, prepare e crie o novo documento da empresa
        // É importante criar uma nova referência de documento para a escrita na transação
        const newCompanyDocRef = doc(companiesCollectionRef); // Gera uma nova ID automaticamente
        const newCompanyDataWithTimestamp: Omit<Company, 'id'> = {
          ...companyData,
          created_at: Timestamp.now(),
        };
        transaction.set(newCompanyDocRef, newCompanyDataWithTimestamp); // Use transaction.set()
        return newCompanyDocRef.id;
      });

      return {
        codRet: 0,
        msgRet: `Empresa criada com sucesso com ID: ${newCompanyId}`,
        companyId: newCompanyId,
      };
    } catch (error: any) {
      console.error('Erro ao criar empresa:', error);
      return {
        codRet: 1,
        msgRet:
          error.message ||
          `Erro ao criar empresa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  },
  getAll: async (): Promise<Company[]> => {
    const q = query(collection(db, COMPANIES_COLLECTION));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSn) => fromFirestore<Company>(docSn));
  },
  getById: async (id: string | undefined): Promise<Company | null> => {
    const docRef = doc(db, COMPANIES_COLLECTION, id ? id : '');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return fromFirestore<Company>(docSnap);
    } else {
      return null;
    }
  },
  update: async (
    id: string | undefined,
    companyData: Omit<Company, 'id' | 'created_at'>
  ): Promise<{
    codRet: number;
    msgRet: string;
  }> => {
    const docRef = doc(db, COMPANIES_COLLECTION, id ? id : '');
    try {
      const updateCompanyData: Omit<Company, 'id' | 'created_at'> = {
        ...companyData,
        updated_at: Timestamp.now(), // Adiciona o campo de atualização
      };
      await updateDoc(docRef, updateCompanyData as SetOptions);
      return {
        codRet: 0,
        msgRet: `Company with ID ${id} updated successfully`,
      };
    } catch (error) {
      return {
        codRet: 1,
        msgRet: `Error updating company: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
        msgRet: `Company with ID ${id} deleted successfully`,
      };
    } catch (error) {
      return {
        codRet: 1,
        msgRet: `Error deleting company: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
};
