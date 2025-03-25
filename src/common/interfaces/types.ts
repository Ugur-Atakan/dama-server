export interface Question {
    id: string;
    text: string;
    type: 'text' | 'number' | 'select' | 'file' | 'date';
    options?: string[]; // select için gerekli
    required: boolean;
  }
  
export interface FormDefinition {
    id: string;
    title: string;
    description: string;
    questions: Question[];
  }
    
export interface FormSubmission {
    formId: string;
    answers: Answer[];
    submittedAt?: Date;
  }
  
export type ApplicationStatus = 'PRE_APPLICATION' | 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'INPROGRESS' | 'APPROVED' | 'REJECTED' | 'DOCTOR_APPROVAL' | 'DOCTOR_REJECTION' | 'DOCTOR_PENDING' | 'DOCTOR_INPROGRESS' | 'DOCTOR_COMPLETED';
  

export interface Answer {
  questionId: string;
  value: string | number | boolean | null;
  fileId?: string; // Dosya yüklendiyse, dosyanın id'si
}
