import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, startWith, switchMap } from 'rxjs';
import { DashboardApiService } from './dashboard-api.service';
import { DashboardFiltersService } from './dashboard-filters.service';
import { KpisResponse, RevenueOccupancyResponse, BookingsByChannelResponse } from '../models';

export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T };

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private readonly api = inject(DashboardApiService);
  private readonly filters = inject(DashboardFiltersService);

  readonly filters$ = this.filters.filters$;

  readonly kpis$: Observable<LoadState<KpisResponse>> = this.filters$.pipe(
    switchMap((f) =>
      this.api.getKpis(f).pipe(
        map((data) => ({ status: 'success' as const, data })),
        startWith({ status: 'loading' as const }),
        catchError(() => of({ status: 'error' as const, error: 'Failed to load KPIs' }))
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly revenueOccupancy$: Observable<LoadState<RevenueOccupancyResponse>> = this.filters$.pipe(
    switchMap((f) =>
      this.api.getRevenueOccupancy(f).pipe(
        map((data) => ({ status: 'success' as const, data })),
        startWith({ status: 'loading' as const }),
        catchError(() => of({ status: 'error' as const, error: 'Failed to load revenue/occupancy' }))
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly bookingsByChannel$: Observable<LoadState<BookingsByChannelResponse>> = this.filters$.pipe(
    switchMap((f) =>
      this.api.getBookingsByChannel(f).pipe(
        map((data) => ({ status: 'success' as const, data })),
        startWith({ status: 'loading' as const }),
        catchError(() => of({ status: 'error' as const, error: 'Failed to load bookings by channel' }))
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
