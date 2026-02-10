export interface TrainingType {
  id: string;
  name: string;
  code: string;
  description?: string;
  isDC3: boolean; // Si es true, cuenta como DC-3 oficial
  createdAt: string;
}

export interface TrainingFormData {
  name: string;
  code: string;
  description?: string;
  isDC3: boolean;
}
