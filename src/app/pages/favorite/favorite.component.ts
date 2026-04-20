import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FavoriteService } from '../../services/favorite.service';
import { Product } from '../../services/product.service';

@Component({
  selector: 'app-favorite',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.css']
})
export class FavoriteComponent implements OnInit {
  favorites: Product[] = [];

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit() {
    this.favoriteService.favorites$.subscribe(favorites => {
      this.favorites = favorites;
    });
  }

  removeFromFavorites(productId: number) {
    this.favoriteService.removeFromFavorites(productId).subscribe({
      next: () => {
        console.log('Товар удален из избранного');
      },
      error: (error) => {
        console.error('Ошибка при удалении:', error);
        alert('Не удалось удалить товар из избранного');
      }
    });
  }

  clearFavorites() {
    // Очищаем последовательно все товары
    this.favorites.forEach(product => {
      this.favoriteService.removeFromFavorites(product.id).subscribe();
    });
  }

  addToCart(product: Product) {
    console.log('Добавлено в корзину из избранного:', product);
    alert(`Товар "${product.name}" добавлен в корзину!`);
  }
}