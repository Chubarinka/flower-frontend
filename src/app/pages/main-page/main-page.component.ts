import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  totalSlides = 3;
  autoPlayInterval: any;
  
  // Добавьте это свойство
  assetsPath = '/assets/';

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 3200);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  getSlidesArray() {
    return [0, 1, 2];
  }
}
// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';

// @Component({
//   selector: 'app-main-page',
//   standalone: true,
//   imports: [CommonModule, RouterLink],
//   templateUrl: './main-page.component.html',
//   styleUrls: ['./main-page.component.css']
// })
// export class MainPageComponent implements OnInit, OnDestroy {
//   currentSlide = 0;
//   totalSlides = 3;
//   autoPlayInterval: any;

//   ngOnInit() {
//     this.startAutoPlay();
//   }

//   ngOnDestroy() {
//     this.stopAutoPlay();
//   }

//   // Методы для карусели
//   nextSlide() {
//     this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
//   }

//   prevSlide() {
//     this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
//   }

//   goToSlide(index: number) {
//     this.currentSlide = index;
//   }

//   startAutoPlay() {
//     this.autoPlayInterval = setInterval(() => {
//       this.nextSlide();
//     }, 3200);
//   }

//   stopAutoPlay() {
//     if (this.autoPlayInterval) {
//       clearInterval(this.autoPlayInterval);
//     }
//   }

//   // Для создания массива для *ngFor
//   getSlidesArray() {
//     return [0, 1, 2]; // Количество слайдов
//   }
// }