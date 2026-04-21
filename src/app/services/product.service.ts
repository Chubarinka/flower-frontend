import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Product {
  id: number;
  name: string;
  composition: string;
  price: number;
  sku: string;
  flowers: string[];
  compositionType?: string;
  occasion: string[];
  imageUrl?: string;
}

export interface ProductDto {
  name: string;
  composition: string;
  price: number;
  sku: string;
  flowers: string[];
  compositionType?: string;
  occasion: string[];
  imageBase64?: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://flower-api-q62v.onrender.com/api/products';
  private apiBaseUrl = 'https://flower-api-q62v.onrender.com';

  constructor(private http: HttpClient) { }

  // Получение товаров с пагинацией и фильтрами
  getProductsPage(page: number = 1, pageSize: number = 6, filters?: any): Observable<ProductsResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    // Добавляем фильтры
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.minPrice) params = params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice);
      if (filters.sort) params = params.set('sort', filters.sort);
      if (filters.flowers) params = params.set('flowers', filters.flowers);
      if (filters.composition) params = params.set('composition', filters.composition);
      if (filters.occasion) params = params.set('occasion', filters.occasion);
    }

    return this.http.get<ProductsResponse>(this.apiUrl, { params })
      .pipe(
        map(response => {
          // Преобразуем URL фотографий
          response.products = response.products.map(product => ({
            ...product,
            imageUrl: this.fixImageUrl(product.imageUrl)
          }));
          return response;
        })
      );
  }

  // Поиск товаров для подсказок
  searchProducts(query: string): Observable<Product[]> {
    let params = new HttpParams().set('search', query).set('pageSize', '5');
    return this.http.get<Product[]>(`${this.apiUrl}/search`, { params })
      .pipe(
        map(products => {
          return products.map(product => ({
            ...product,
            imageUrl: this.fixImageUrl(product.imageUrl)
          }));
        })
      );
  }

  // Получение одного товара
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`)
      .pipe(
        map(product => ({
          ...product,
          imageUrl: this.fixImageUrl(product.imageUrl)
        }))
      );
  }

  // Добавление товара
  addProduct(productDto: ProductDto): Observable<any> {
    return this.http.post(this.apiUrl, productDto);
  }

  // Проверка уникальности артикула
  checkSku(sku: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/sku/${sku}`);
  }

  // Вспомогательный метод для исправления URL фотографий
  private fixImageUrl(url?: string): string | undefined {
    if (!url) return undefined;
    
    // Если URL уже полный (начинается с http), возвращаем как есть
    if (url.startsWith('http')) {
      return url;
    }
    
    // Если URL начинается с /uploads, добавляем базовый URL API
    if (url.startsWith('/uploads')) {
      return `${this.apiBaseUrl}${url}`;
    }
    
    // В остальных случаях просто возвращаем оригинал
    return url;
  }
}