import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product } from '../interfaces/product';
import { BehaviorSubject, Observable, Subject, of, throwError, forkJoin, interval } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = `${environment.apiBaseUrl}${environment.endpoints.product}`; // Usando la URL base de los productos
  private apiUrl = `${environment.apiBaseUrl}${environment.endpoints.product}`;
  private productsSubject = new BehaviorSubject<Product[]>([]); // Comportamiento reactivo de los productos
  public products$ = this.productsSubject.asObservable(); // Observable para suscribirse a los cambios de productos

  constructor(private http: HttpClient) { }

  // Obtener todos los productos
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl); // Petición para obtener todos los productos
  }

  // Obtener producto por ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`); // Petición para obtener un producto por ID
  }

  // Crear un nuevo producto
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/save`, product); // Petición para crear un nuevo producto
  }

  // Actualizar un producto
  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/update`, product); // Petición para actualizar un producto
  }

  // Eliminar producto (soft delete)
  deleteProduct(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/delete/${id}`, {}); // Petición para eliminar producto lógicamente
  }

  // Restaurar producto eliminado
  restoreProduct(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/restore/${id}`, {}); // Petición para restaurar un producto
  }

  // Obtener productos por estado (activo, inactivo, etc.)
  getProductsByStatus(status: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/status/${status}`); // Petición para obtener productos por estado
  }

  // Método para cargar productos desde la API y actualizar el Subject
  loadProductsFromApi(): void {
    this.getAllProducts().subscribe(products => {
      this.productsSubject.next(products); // Actualiza el BehaviorSubject con los productos obtenidos
    });
  }

  reportPdf() {
    return this.http.get(`${this.apiUrl}/pdf`, {
      responseType: 'blob' as const  // 'as const' hace que sea un tipo literal
    });
  }
}
