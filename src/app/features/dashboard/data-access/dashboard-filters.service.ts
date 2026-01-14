import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';

export type DateRangeType = 'last_7_days' | 'last_30_days' | 'last_month';

export interface DashboardFilters {
  hotelId: number;
  dateRange: DateRangeType;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardFiltersService {
  private readonly hotelIdSubject = new BehaviorSubject<number>(734921);
  private readonly dateRangeSubject = new BehaviorSubject<DateRangeType>('last_30_days');

  readonly hotelId$ = this.hotelIdSubject.asObservable();
  readonly dateRange$ = this.dateRangeSubject.asObservable();

  private readonly refreshTrigger$ = new BehaviorSubject<number>(0);

  readonly filters$: Observable<DashboardFilters> = combineLatest([
    this.hotelId$,
    this.dateRange$,
    this.refreshTrigger$,
  ]).pipe(map(([hotelId, dateRange]) => ({ hotelId, dateRange })));

  setHotelId(hotelId: number): void {
    this.hotelIdSubject.next(hotelId);
  }

  setDateRange(dateRange: DateRangeType): void {
    this.dateRangeSubject.next(dateRange);
  }

  refresh(): void {
    // Trigger a refresh by incrementing the refresh trigger
    // This causes filters$ to re-emit, which triggers switchMap in facade to re-fetch
    this.refreshTrigger$.next(this.refreshTrigger$.value + 1);
  }

  getCurrentFilters(): DashboardFilters {
    return {
      hotelId: this.hotelIdSubject.value,
      dateRange: this.dateRangeSubject.value,
    };
  }
}
