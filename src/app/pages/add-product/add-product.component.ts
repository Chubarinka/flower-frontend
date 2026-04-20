import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ProductService, ProductDto } from '../../services/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent {
  product = {
    name: '',
    composition: '',
    price: null as number | null,
    sku: '',
    flowers: [] as string[],
    compositionType: '',
    occasion: [] as string[]
  };

  errors: { [key: string]: string } = {};
  imageError: string = '';
  previewImage: string | null = null;
  isSubmitting: boolean = false;
  successMessage: string = '';
  skuCheckTimeout: any;

  constructor(private productService: ProductService) {}

  hasErrors(): boolean {
    return Object.values(this.errors).some(error => error !== '') || !!this.imageError;
  }

  validateField(fieldName: string, value: any): string {
    switch(fieldName) {
      case 'name':
        if (!value || value.trim() === '') return 'Название товара обязательно';
        if (value.length < 3) return 'Название должно содержать минимум 3 символа';
        if (value.length > 100) return 'Название не должно превышать 100 символов';
        break;
      
      case 'composition':
        if (!value || value.trim() === '') return 'Состав букета обязателен';
        if (value.length < 10) return 'Состав должен содержать минимум 10 символов';
        if (value.length > 500) return 'Состав не должен превышать 500 символов';
        break;
      
      case 'price':
        if (!value) return 'Цена обязательна';
        if (value < 1000) return 'Цена должна быть не менее 1000 руб';
        if (value > 50000) return 'Цена не должна превышать 50000 руб';
        break;
      
      case 'sku':
        if (!value || value.trim() === '') return 'Артикул обязателен';
        const skuPattern = /^[A-Z]{2,3}-\d{3}$/;
        if (!skuPattern.test(value)) return 'Формат: FLW-001 (2-3 буквы, дефис, 3 цифры)';
        break;
      
      case 'flowers':
        if (!value || value.length === 0) return 'Выберите хотя бы один тип цветка';
        break;
    }
    return '';
  }

  onFieldChange(fieldName: string, event: any) {
    const value = event.target?.value;
    this.errors[fieldName] = this.validateField(fieldName, value);
    
    if (fieldName === 'sku') {
      delete this.errors['general'];
      this.checkSkuUniqueness(value);
    }
  }

  checkSkuUniqueness(sku: string) {
    if (!sku.match(/^[A-Z]{2,3}-\d{3}$/)) return;
    
    clearTimeout(this.skuCheckTimeout);
    this.skuCheckTimeout = setTimeout(() => {
      this.productService.checkSku(sku).subscribe({
        next: (result) => {
          if (result.exists) {
            this.errors['sku'] = 'Товар с таким артикулом уже существует';
          } else {
            if (this.errors['sku'] === 'Товар с таким артикулом уже существует') {
              this.errors['sku'] = '';
            }
          }
        },
        error: () => {
          console.log('Ошибка при проверке артикула');
        }
      });
    }, 500);
  }

  onFlowerChange(value: string, event: any) {
    if (event.target.checked) {
      if (!this.product.flowers.includes(value)) {
        this.product.flowers.push(value);
      }
    } else {
      const index = this.product.flowers.indexOf(value);
      if (index > -1) {
        this.product.flowers.splice(index, 1);
      }
    }
    this.errors['flowers'] = this.validateField('flowers', this.product.flowers);
  }

  onCompositionChange(value: string, event: any) {
    if (event.target.checked) {
      this.product.compositionType = value;
    }
  }

  onOccasionChange(value: string, event: any) {
    if (event.target.checked) {
      if (!this.product.occasion.includes(value)) {
        this.product.occasion.push(value);
      }
    } else {
      const index = this.product.occasion.indexOf(value);
      if (index > -1) {
        this.product.occasion.splice(index, 1);
      }
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    this.imageError = '';

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.imageError = 'Допустимые форматы: JPG, PNG, WEBP';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.imageError = 'Размер файла не должен превышать 5MB';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewImage = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.previewImage = null;
    this.imageError = '';
  }

  resetForm() {
    this.product = {
      name: '',
      composition: '',
      price: null,
      sku: '',
      flowers: [],
      compositionType: '',
      occasion: []
    };
    this.errors = {};
    this.imageError = '';
    this.previewImage = null;
    this.successMessage = '';
    this.isSubmitting = false;
    
    setTimeout(() => {
      document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        (checkbox as HTMLInputElement).checked = false;
      });
      document.querySelectorAll('input[type="radio"]').forEach(radio => {
        (radio as HTMLInputElement).checked = false;
      });
    }, 0);
  }

  onSubmit(form: NgForm) {
    delete this.errors['general'];
    this.successMessage = '';
    
    this.errors['name'] = this.validateField('name', this.product.name);
    this.errors['composition'] = this.validateField('composition', this.product.composition);
    this.errors['price'] = this.validateField('price', this.product.price);
    this.errors['sku'] = this.validateField('sku', this.product.sku);
    this.errors['flowers'] = this.validateField('flowers', this.product.flowers);

    if (!this.previewImage) {
      this.imageError = 'Загрузите изображение товара';
    }

    const hasErrors = Object.values(this.errors).some(error => error !== '') || !!this.imageError;
    
    if (!hasErrors && form.valid && this.product.price) {
      this.isSubmitting = true;

      const productDto: ProductDto = {
        name: this.product.name,
        composition: this.product.composition,
        price: this.product.price,
        sku: this.product.sku,
        flowers: this.product.flowers,
        compositionType: this.product.compositionType || undefined,
        occasion: this.product.occasion,
        imageBase64: this.previewImage || undefined
      };

      this.productService.addProduct(productDto).subscribe({
        next: (response) => {
          console.log('Товар успешно добавлен:', response);
          this.successMessage = 'Товар успешно добавлен!';
          this.resetForm();
          form.resetForm();
        },
        error: (error) => {
          console.error('Ошибка при добавлении товара:', error);
          if (error.error && error.error.error) {
            this.errors['general'] = error.error.error;
          } else {
            this.errors['general'] = 'Ошибка при добавлении товара';
          }
          this.isSubmitting = false;
        }
      });
    } else {
      this.isSubmitting = false;
    }
  }
}