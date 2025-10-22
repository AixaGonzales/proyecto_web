// src/app/core/interfaces/employee.ts
export interface Employee {
	idEmployee?: number;
	firstName: string;
	lastName: string;
	documentType: string;
	documentNumber: string;
	email: string;
	phone?: string;
	address?: string;
	idRole?: number;
	roleName?: string;
	hireDate?: string;
	status?: string;
	birthDate?: string;
	gender?: string;
	createdAt?: string;
	updatedAt?: string;
	age?: number;
	emergencyContactName?: string;
	emergencyContactPhone?: string;
	position?: string;
}

export interface EmployeeWithRole extends Employee {
	rolUsuario?: string;
}

export interface EmployeeRequest {
	firstName: string;
	lastName: string;
	documentType: string;
	documentNumber: string;
	email: string;
	phone?: string;
	address?: string;
	idRole?: number;
	hireDate?: string;
	birthDate?: string;
	gender?: string;
	emergencyContactName?: string;
	emergencyContactPhone?: string;
	position?: string;
}

export interface Role {
	id: number;
	name: string;
	description?: string;
}