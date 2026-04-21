import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly API_URL = environment.apiUrl;
  
  get apiUrl(): string {
    return this.API_URL;
  }
  
  get favoritesUrl(): string {
    return `${this.API_URL}/api/favorites`;
  }
  
  get productsUrl(): string {
    return `${this.API_URL}/api/products`;
  }
}