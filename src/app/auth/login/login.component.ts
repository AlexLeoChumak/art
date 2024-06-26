import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, catchError, takeUntil, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from 'src/app/services/auth.service';
import { InputService } from 'src/app/services/input.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  submitted: boolean = false;
  loginForm!: FormGroup<any>;
  isLoading!: boolean;
  isVisibilityPassword: boolean = false;

  userAuthState = signal({
    name: '',
    email: '',
  });

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private inputService: InputService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }

  submit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.submitted = true;

    const { email, password } = this.loginForm.value;

    this.authService
      .login(email, password)
      .pipe(
        catchError((err) => throwError(() => err)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe({
        next: () => {
          this.router.navigate([this.inputService.getInputState()()[1]]);
          this.inputService.setInputState([false, '']);
          this.toastr.success('Login successful');
          this.loginForm.reset();
          this.submitted = false;
          this.isLoading = false;
        },
        error: (err) => {
          this.toastr.error(err);
          this.submitted = false;
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
