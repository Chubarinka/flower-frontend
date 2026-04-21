import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Product } from './product.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/api/favorites`;  // ← ИСПРАВЛЕНО
  private favoritesSubject = new BehaviorSubject<Product[]>([]);
  
  favorites$: Observable<Product[]> = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFavorites();
  }

  getCurrentFavorites(): Product[] {
    return this.favoritesSubject.getValue();
  }

  loadFavorites(): void {
    this.http.get<Product[]>(this.apiUrl).subscribe({
      next: (favorites) => {
        this.favoritesSubject.next(favorites || []);
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.favoritesSubject.next([]);
      }
    });
  }

  checkFavorite(productId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/${productId}`);
  }

  addToFavorites(productId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}`, {}).pipe(
      tap(() => this.loadFavorites())
    );
  }

  removeFromFavorites(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`).pipe(
      tap(() => this.loadFavorites())
    );
  }

  toggleFavorite(product: Product): Observable<boolean> {
    return new Observable(observer => {
      this.checkFavorite(product.id).subscribe({
        next: (isFavorite) => {
          if (isFavorite) {
            this.removeFromFavorites(product.id).subscribe({
              next: () => {
                observer.next(false);
                observer.complete();
              },
              error: (err) => observer.error(err)
            });
          } else {
            this.addToFavorites(product.id).subscribe({
              next: () => {
                observer.next(true);
                observer.complete();
              },
              error: (err) => observer.error(err)
            });
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }
}