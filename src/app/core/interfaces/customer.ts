// src/app/core/interfaces/customer.ts
export interface Customer {
    idCustomer: number;
    firstName: string;
    lastName: string;
    birthDate: string | Date;
    gender: string; // Cambiado a no opcional
    documentType: string;
    documentNumber: string;
    phone: string;
    registrationDate: string | Date;
    email: string;
    status: string;
    notes?: string;
    address: Address;
    age?: number;
}

export interface Address {
    idAddress?: number;
    district: string;
    addrStreet: string;
    numberHouse: string;
    placeType: string;
    reference: string;
}