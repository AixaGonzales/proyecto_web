// src/app/core/interfaces/order.ts
export interface Order {
    idCustomerOrder: number;
    orderDate: string;
    deliveryDate: string;
    deliveryTime: string;
    deliveryType: string;
    totalAmount: number;
    advancePayment: number;
    balanceAmount: number;  // Cambié de balancePayment a balanceAmount
    advancePaymentMethod: string;
    balancePaymentMethod: string | null;
    orderStatus: string;
    paymentStatus: string;
    balancePaymentDate: string | null;
    notes: string | null;
    cancellationReason: string | null;
    customer: CustomerInfo;
    deliveryAddress: AddressInfo;
    
    // Nuevos campos para el sistema mejorado
    completionDate?: string | null;
    additionalPayments?: AdditionalPayment[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CustomerInfo {
    idCustomer: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
}

export interface AddressInfo {
    district: string;
    addrStreet: string;
    numberHouse: string;
    placeType: string;
    reference: string;
}

export interface AdditionalPayment {
    id: number;
    orderId: number;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    notes?: string | null;
    createdAt: string;
    updatedAt?: string;
}

export interface AdditionalPaymentRequest {
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    notes?: string | null;
}

export interface PaymentResponse {
    success: boolean;
    order: Order;  // Cambié para que devuelva el Order completo
    message?: string;
}

export interface OrderRequest {
    idCustomerOrder?: number;
    orderDate: string;
    deliveryDate: string;
    deliveryTime: string;
    deliveryType: string;
    totalAmount: number;
    advancePayment: number;
    balanceAmount: number;
    advancePaymentMethod: string;
    balancePaymentMethod?: string;
    orderStatus: string;
    paymentStatus: string;
    balancePaymentDate?: string;
    notes?: string;
    cancellationReason?: string;
    customer: {
        idCustomer: number;
    };
    deliveryAddress: {
        district: string;
        addrStreet: string;
        numberHouse: string;
        placeType: string;
        reference: string;
    };
}