import { Injectable, inject } from '@angular/core';
import { Observable, catchError, delay, map, of, shareReplay, startWith, switchMap } from 'rxjs';
import { DashboardApiService } from './dashboard-api.service';
import { DashboardFiltersService } from './dashboard-filters.service';
import { KpisResponse, RevenueOccupancyResponse, BookingsByChannelResponse } from '../models';
import { Loadable } from './loadable.model';

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  private readonly api = inject(DashboardApiService);
  private readonly filters = inject(DashboardFiltersService);

  readonly filters$ = this.filters.filters$;

  readonly kpis$: Observable<Loadable<KpisResponse>> = this.filters$.pipe(
    switchMap((f) =>
      this.api.getKpis(f).pipe(
        map((data) => {
          // Empty if KPIs object is missing or all values are null/undefined
          if (!data?.kpis) {
            return { status: 'empty' as const };
          }
          const hasData = Object.values(data.kpis).some(
            (value) => value !== null && value !== undefined && value !== 0
          );
          return hasData
            ? ({ status: 'success' as const, data } as const)
            : ({ status: 'empty' as const } as const);
        }),
        startWith({ status: 'loading' as const }),
        catchError(() =>
          of({ status: 'error' as const, message: 'Failed to load KPIs. This is a controlled mock error.' } as const).pipe(
            delay(2000)
          )
        )
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly revenueOccupancy$: Observable<Loadable<RevenueOccupancyResponse>> = this.filters$.pipe(
    switchMap((f) =>
      this.api.getRevenueOccupancy(f).pipe(
        map((data) => {
          // Empty if no data or all points are invalid
          if (!data?.data || data.data.length === 0) {
            return { status: 'empty' as const };
          }
          const hasValidData = data.data.some(
            (point) =>
              (point.revenue !== null && point.revenue !== undefined) ||
              (point.occupancy !== null && point.occupancy !== undefined)
          );
          return hasValidData
            ? ({ status: 'success' as const, data } as const)
            : ({ status: 'empty' as const } as const);
        }),
        startWith({ status: 'loading' as const }),
        catchError(() =>
          of({ status: 'error' as const, message: 'Failed to load revenue/occupancy. This is a controlled mock error.' } as const).pipe(
            delay(2000)
          )
        )
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly bookingsByChannel$: Observable<Loadable<BookingsByChannelResponse>> = this.filters$.pipe(
    switchMap((f) =>
      this.api.getBookingsByChannel(f).pipe(
        map((data) => {
          // Empty if no data or all bookings are 0
          if (!data?.data || data.data.length === 0) {
            return { status: 'empty' as const };
          }
          const hasBookings = data.data.some((item) => item.bookings > 0);
          return hasBookings
            ? ({ status: 'success' as const, data } as const)
            : ({ status: 'empty' as const } as const);
        }),
        startWith({ status: 'loading' as const }),
        catchError(() =>
          of({ status: 'error' as const, message: 'Failed to load bookings by channel. This is a controlled mock error.' } as const).pipe(
            delay(2000)
          )
        )
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );
}
