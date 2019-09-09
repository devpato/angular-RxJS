import { Component, ChangeDetectionStrategy } from '@angular/core';

import { Subscription, Observable, EMPTY, Subject, combineLatest } from 'rxjs';

import { Product } from './product';
import { ProductService } from './product.service';
import { catchError, map } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  categories;
  sub: Subscription;
  // selectedCategoryId = 1;
  private categorySelectedSubject = new Subject<number>();
  categorySelectedActions$ = this.categorySelectedSubject.asObservable();

  products$ = combineLatest([
    this.productService.productWithCategory$,
    this.categorySelectedActions$
  ]).pipe(
    map(([products, selectedCategoryId]) =>
      products.filter(product =>
        selectedCategoryId ? product.categoryId === selectedCategoryId : true
      )
    ),
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  categories$ = this.productCategoryService.productCategories$.pipe(
    catchError(err => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  // productsSimpleFilter$ = this.productService.productWithCategory$.pipe(
  //   map(products =>
  //     products.filter(product =>
  //       this.selectedCategoryId ? product.categoryId === this.selectedCategoryId : true
  //     )
  //   )
  // );

  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService
  ) {}

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    // this.selectedCategoryId = +categoryId;
    this.categorySelectedSubject.next(+categoryId);
    console.log('Not yet implemented');
  }
}
