import { Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription, catchError, switchMap, throwError } from 'rxjs';

import { Category } from 'src/app/models/category';
import { AuthService } from 'src/app/services/auth.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { MocDataService } from 'src/app/services/moc-data.service';

@Component({
  selector: 'app-category-navbar',
  templateUrl: './category-navbar.component.html',
  styleUrls: ['./category-navbar.component.scss'],
})
export class CategoryNavbarComponent implements OnInit, OnDestroy {
  private loadDataSub!: Subscription;
  private isAuthenticatedObservableSub!: Subscription;
  categoryArray!: Category[];
  isAuth!: any;

  constructor(
    private categoriesService: CategoriesService,
    private toastr: ToastrService,
    private authService: AuthService,
    private mocDataService: MocDataService //moc
  ) {}

  ngOnInit(): void {
    this.loadDataSub = this.categoriesService
      .loadData()
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (data: Category[]) => {
          data ? (this.categoryArray = data) : null;
        },
        error: (err) => {
          this.categoryArray = this.mocDataService.categories; //moc
          this.toastr.error(err);
        },
      });

    this.isAuthenticatedObservableSub = this.authService
      .isAuthenticatedObservable()
      .pipe(
        catchError((err) => {
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (isAuth) => {
          this.isAuth = isAuth;
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  ngOnDestroy(): void {
    this.loadDataSub ? this.loadDataSub.unsubscribe() : null;
    this.isAuthenticatedObservableSub
      ? this.isAuthenticatedObservableSub.unsubscribe()
      : null;
  }
}
