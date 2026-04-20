import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProductService, Product } from '../../services/product.service';
import { FavoriteService } from '../../services/favorite.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];

  currentPage: number = 1;
  pageSize: number = 6;
  hasNextPage: boolean = true;
  isLoading: boolean = false;
  initialLoading: boolean = true;

  searchQuery: string = '';
  searchTimeout: any;
  searchSuggestions: Product[] = [];
  showSuggestions: boolean = false;

  filters = {
    price: [] as string[],
    flowers: [] as string[],
    composition: [] as string[],
    occasion: [] as string[]
  };
  favorites: Product[] = [];

  sortOption: string = 'default';

  minPrice: number = 1000;
  maxPrice: number = 50000;
  currentMinPrice: number = 1000;
  currentMaxPrice: number = 50000;

  selectedPriceRange: string | null = null;



  selectedProduct: Product | null = null;
  showQuickView: boolean = false;

  filterTimeout: any;
  constructor(
    private productService: ProductService,
    private favoriteService: FavoriteService 
  ) { }

  ngOnInit() {
    this.loadProducts();

    this.favoriteService.favorites$.subscribe(favorites => {
      console.log('Избранное обновлено:', favorites);
    });
  }

  loadProducts(reset: boolean = false) {
    if (this.isLoading || (!this.hasNextPage && !reset)) return;

    if (reset) {
      this.currentPage = 1;
      this.products = [];
      this.hasNextPage = true;
    }

    this.isLoading = true;
    this.initialLoading = reset;

    const params = this.getFilterParams();

    this.productService.getProductsPage(this.currentPage, this.pageSize, params)
      .subscribe({
        next: (response) => {
          if (reset) {
            this.products = response.products;
          } else {
            this.products = [...this.products, ...response.products];
          }

          this.hasNextPage = response.pagination.hasNext;
          this.currentPage = response.pagination.currentPage + 1;

          this.isLoading = false;
          this.initialLoading = false;
        },
        error: (error) => {
          console.error('Ошибка загрузки товаров:', error);
          this.isLoading = false;
          this.initialLoading = false;
        }
      });
  }



  translateCategory(category: string): string {
    const translations: { [key: string]: string } = {
      // Цветы
      'roses': 'Розы',
      'chrysanthemums': 'Хризантемы',
      'peonies': 'Пионы',
      'daisies': 'Ромашки',
      'hydrangeas': 'Гортензии',
      'lilies': 'Лилии',


      'bouquet': 'Цветы в коробке',
      'box': 'Букет',
      'basket': 'Цветы в корзине',


      'birthday': 'День Рождения',
      'love': 'Люблю',
      'wow': 'WOW Эффект',
      'march8': '8 Марта',
      'home': 'Для дома'
    };

    return translations[category] || category;
  }
  private getFilterParams(): any {
    const params: any = {};

    if (this.searchQuery) params.search = this.searchQuery;
    if (this.sortOption !== 'default') params.sort = this.sortOption;

    params.minPrice = this.currentMinPrice;
    params.maxPrice = this.currentMaxPrice;

    if (this.filters.flowers.length) {
      params.flowers = this.filters.flowers.join(',');
    }
    if (this.filters.composition.length) {
      params.composition = this.filters.composition.join(',');
    }
    if (this.filters.occasion.length) {
      params.occasion = this.filters.occasion.join(',');
    }

    return params;
  }

  onSearchInput() {
    clearTimeout(this.searchTimeout);

    if (this.searchQuery.length < 2) {
      this.searchSuggestions = [];
      this.showSuggestions = false;
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        searchInput.classList.remove('search-input-error');
      }
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.productService.searchProducts(this.searchQuery).subscribe({
        next: (products) => {
          this.searchSuggestions = products;
          this.showSuggestions = products.length > 0;

          const searchInput = document.querySelector('.search-input');
          if (searchInput) {
            if (products.length === 0 && this.searchQuery.length >= 2) {
              searchInput.classList.add('search-input-error');
            } else {
              searchInput.classList.remove('search-input-error');
            }
          }
        },
        error: (error) => {
          console.error('Ошибка поиска:', error);
          this.searchSuggestions = [];
          this.showSuggestions = false;
        }
      });
    }, 300);
  }

  hideSuggestionsWithDelay() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectSuggestion(product: Product) {
    this.searchQuery = product.name;
    this.showSuggestions = false;
    this.loadProducts(true);
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.isLoading || !this.hasNextPage) return;

    const marker = document.getElementById('scroll-marker');
    if (marker) {
      const rect = marker.getBoundingClientRect();
      const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;

      if (isVisible) {
        this.loadProducts();
      }
    }
  }

  onFlowerChange(value: string, event: any) {
    if (event.target.checked) {
      if (!this.filters.flowers.includes(value)) {
        this.filters.flowers.push(value);
      }
    } else {
      const index = this.filters.flowers.indexOf(value);
      if (index > -1) {
        this.filters.flowers.splice(index, 1);
      }
    }
    this.onFilterChange();
  }

  onCompositionChange(value: string, event: any) {
    if (event.target.checked) {
      if (!this.filters.composition.includes(value)) {
        this.filters.composition.push(value);
      }
    } else {
      const index = this.filters.composition.indexOf(value);
      if (index > -1) {
        this.filters.composition.splice(index, 1);
      }
    }
    this.onFilterChange();
  }

  onOccasionChange(value: string, event: any) {
    if (event.target.checked) {
      if (!this.filters.occasion.includes(value)) {
        this.filters.occasion.push(value);
      }
    } else {
      const index = this.filters.occasion.indexOf(value);
      if (index > -1) {
        this.filters.occasion.splice(index, 1);
      }
    }
    this.onFilterChange();
  }

  onPriceRangeChange(range: string) {
    this.selectedPriceRange = range;

    switch (range) {
      case '0-2000':
        this.currentMinPrice = 0;
        this.currentMaxPrice = 2000;
        break;
      case '2000-3000':
        this.currentMinPrice = 2000;
        this.currentMaxPrice = 3000;
        break;
      case '3000-5000':
        this.currentMinPrice = 3000;
        this.currentMaxPrice = 5000;
        break;
      case '5000-10000':
        this.currentMinPrice = 5000;
        this.currentMaxPrice = 10000;
        break;
      case '10000-999999':
        this.currentMinPrice = 10000;
        this.currentMaxPrice = 50000;
        break;
    }

    this.onFilterChange();
  }

  updateMinPrice(event: any) {
    this.currentMinPrice = Number(event.target.value);
    if (this.currentMinPrice > this.currentMaxPrice) {
      this.currentMinPrice = this.currentMaxPrice;
    }
    this.selectedPriceRange = null;
    this.debounceFilter();
  }

  updateMaxPrice(event: any) {
    this.currentMaxPrice = Number(event.target.value);
    if (this.currentMaxPrice < this.currentMinPrice) {
      this.currentMaxPrice = this.currentMinPrice;
    }
    this.selectedPriceRange = null;
    this.debounceFilter();
  }

  debounceFilter() {
    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this.applyFilters();
    }, 500);
  }

  onFilterChange() {
    this.debounceFilter();
  }

  applyFilters() {
    this.loadProducts(true);
  }

  resetAllFilters() {
    this.filters = {
      price: [],
      flowers: [],
      composition: [],
      occasion: []
    };
    this.selectedPriceRange = null;
    this.currentMinPrice = this.minPrice;
    this.currentMaxPrice = this.maxPrice;
    this.searchQuery = '';
    this.sortOption = 'default';
    this.loadProducts(true);
  }

  toggleFavorite(product: Product) {
    this.favoriteService.toggleFavorite(product).subscribe({
      next: (isNowFavorite) => {
        console.log(`Товар ${isNowFavorite ? 'добавлен в' : 'удален из'} избранного`);
      },
      error: (error) => {
        console.error('Ошибка при изменении избранного:', error);
        alert('Не удалось добавить в избранное');
      }
    });
  }

  isFavorite(productId: number): boolean {
    const favorites = this.favoriteService.getCurrentFavorites();
    return favorites.some(f => f.id === productId);
  }


  checkIfFavorite(productId: number): Observable<boolean> {
    return this.favoriteService.checkFavorite(productId);
  }


  addToCart(product: Product) {
    console.log('Добавлено в корзину:', product);
    alert(`Товар "${product.name}" добавлен в корзину!`);
  }

  quickView(product: Product) {
    this.selectedProduct = product;
    this.showQuickView = true;
    document.body.style.overflow = 'hidden';
  }

  closeQuickView() {
    this.showQuickView = false;
    this.selectedProduct = null;
    document.body.style.overflow = '';
  }

  onQuickViewClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('quick-view-overlay')) {
      this.closeQuickView();
    }
  }

  getCompositionList(composition: string): string[] {
    return composition.split(',').map(item => item.trim());
  }
}