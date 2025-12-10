import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Wallet } from 'src/app/core/models';
import { WalletService } from 'src/app/core/services';

@Component({
  selector: 'app-wallet-form',
  templateUrl: './wallet-form.component.html',
  styleUrls: ['./wallet-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletFormComponent implements OnInit, OnDestroy {
  walletForm!: FormGroup;
  isEditMode = false;
  saving = false;
  private destroy$ = new Subject<void>();
  private walletId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.walletId = this.route.snapshot.paramMap.get('id');
    if (this.walletId) {
      this.isEditMode = true;
      this.loadWallet(this.walletId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.walletForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      currency: ['TND', Validators.required],
      initialBalance: [0, Validators.required],
      creditLimit: [0, Validators.required],
      description: [''],
      status: ['active', Validators.required]
    });
  }

  loadWallet(id: string): void {
    this.walletService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (wallet) => {
          this.walletForm.patchValue(wallet);
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.cdr.markForCheck();
        }
      });
  }

  save(): void {
    if (!this.walletForm.valid) return;

    this.saving = true;
    const walletData = this.walletForm.value;

    if (this.isEditMode && this.walletId) {
      this.walletService.update(this.walletId, walletData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.saving = false;
            this.cdr.markForCheck();
            this.router.navigate(['/wallets', this.walletId]);
          },
          error: (err) => {
            console.error('Erreur:', err);
            this.saving = false;
            this.cdr.markForCheck();
          }
        });
    } else {
      this.walletService.create(walletData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (wallet) => {
            this.saving = false;
            this.cdr.markForCheck();
            this.router.navigate(['/wallets', wallet.id]);
          },
          error: (err) => {
            console.error('Erreur:', err);
            this.saving = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/wallets']);
  }
}
