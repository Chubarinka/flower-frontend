import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  // Логика для аккордеона
  toggleAccordion(event: MouseEvent) {
    event.stopPropagation();
    
    // Получаем элемент заголовка, на который кликнули
    const headerElement = event.currentTarget as HTMLElement;
    // Получаем родительский элемент (accordion-item)
    const accordionItem = headerElement.parentElement;
    
    // Переключаем класс active
    if (accordionItem) {
      accordionItem.classList.toggle('active');
    }
  }

  closeAllDropdowns() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
      item.classList.remove('active');
    });
  }
}