import { Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { DeliveryComponent } from './pages/delivery/delivery.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { AddProductComponent } from './pages/add-product/add-product.component';
import { AccountComponent } from './pages/account/account.component';
import { FavoriteComponent } from './pages/favorite/favorite.component';
import { BasketComponent } from './pages/basket/basket.component';
import { CareComponent } from './pages/care/care.component';

export const routes: Routes = [
    { path: '', component: MainPageComponent }, // Главная страница
    { path: 'catalog', component: CatalogComponent },
    { path: 'delivery', component: DeliveryComponent },
    { path: 'about-us', component: AboutUsComponent },
    { path: 'add-product', component: AddProductComponent },
    { path: 'account', component: AccountComponent },
    { path: 'favorite', component: FavoriteComponent },
    { path: 'basket', component: BasketComponent },
    { path: 'care', component: CareComponent },
    { path: '**', redirectTo: '' } // Перенаправление на главную для несуществующих страниц
];