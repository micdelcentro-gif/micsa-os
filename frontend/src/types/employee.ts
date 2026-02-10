export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface EmployeeCertification {
  trainingTypeId: string; // Relación con el catálogo de capacitaciones
  status: 'VALID' | 'EXPIRING' | 'EXPIRED' | 'MISSING';
  expirationDate: string | null;
  fileUrl?: string;
  notes?: string;
}

export interface Employee {
  id: string;
  employeeId: string; // Número de nómina / ID visible
  
  // Personales
  name: string;
  paternalSurname: string;
  maternalSurname: string;
  birthDate: string;
  age: number; // Calculada
  phone: string;
  email?: string;

  // Legales
  curp: string;
  rfc: string;
  nss: string;

  // Laborales
  position: string;
  department?: string;
  status: EmployeeStatus;
  startDate: string; // Fecha ingreso

  // Inactividad (Solo si status === 'INACTIVE')
  inactivityDate?: string;
  returnDate?: string | null; // null = indefinido
  isIndefinite?: boolean;
  inactivityReason?: string;

  // Matriz de Capacitaciones
  certifications: Record<string, EmployeeCertification>; // Key: trainingTypeId
}

export interface EmployeeFormData extends Omit<Employee, 'id' | 'status' | 'certifications' | 'age'> {
  // Para formularios de creación/edición
}
