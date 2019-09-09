import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    tap(data => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  productWithCategory$ = combineLatest([
    this.products$,
    this.productCategoriesService.productCategories$
  ]).pipe(
    map(([products, categories]) =>
      products.map(
        product =>
          ({
            ...product,
            price: product.price * 5.5,
            searchKey: [product.productName],
            category: categories.find(c => product.categoryId === c.id).name
          } as Product)
      )
    )
  );

  selectedProduct$ = combineLatest([this.productSelectedAction$, this.productWithCategory$]).pipe(
    map(([selectedProduct, products]) => products.find(product => product.id === selectedProduct)),
    tap(product => console.log('selected product ', product))
  );

  constructor(
    private http: HttpClient,
    private supplierService: SupplierService,
    private productCategoriesService: ProductCategoryService
  ) {}

  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  private fakeProduct() {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }
}
