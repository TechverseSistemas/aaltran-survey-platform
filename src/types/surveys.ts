import { FieldValue } from 'firebase-admin/firestore';

type FirestoreTimestamp = Date | FieldValue;

export interface Question {
  id: string;
  text: string;
  type: 'likert_5' | 'binary' | 'open_text';
  category: string;
  weight?: number;
}

export interface SurveyTemplate {
  id: string;
  title: string;
  description?: string;
  type: 'climate' | 'performance_90' | 'performance_180' | 'performance_360';
  isGlobal: boolean;
  companyId?: string;
  questions: Question[];
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface SurveyCampaign {
  id: string;
  title: string;
  templateId: string;
  status: 'draft' | 'active' | 'closed';
  participants: string[];
  startDate: FirestoreTimestamp;
  endDate: FirestoreTimestamp;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

export interface SurveyResponse {
  id: string;
  assessorId: string;
  assesseeId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  answers: Record<string, any>;
  submittedAt: FirestoreTimestamp;
}
