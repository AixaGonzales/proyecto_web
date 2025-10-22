export interface Product {
    id: number;
    nameProduct: string;  // Usando 'name_product' para que coincida con el backend
    description: string;
    price: number;
    category: string;
    units: number;
    status: string;  // Nueva propiedad 'status'
    creationDate: string;  // Nueva propiedad 'creation_date'
    imageUrl?: string;  // Propiedad opcional para la imagen
}
