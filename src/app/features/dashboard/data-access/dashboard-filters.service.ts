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
  private readonly dateRangeSubject = new BehaviorSubject<DateRangeType>('last_7_days');

  readonly hotelId$ = this.hotelIdSubject.asObservable();
  readonly dateRange$ = this.dateRangeSubject.asObservable();

  readonly filters$: Observable<DashboardFilters> = combineLatest([
    this.hotelId$,
    this.dateRange$,
  ]).pipe(map(([hotelId, dateRange]) => ({ hotelId, dateRange })));

  setHotelId(hotelId: number): void {
    this.hotelIdSubject.next(hotelId);
  }

  setDateRange(dateRange: DateRangeType): void {
    this.dateRangeSubject.next(dateRange);
  }

  getCurrentFilters(): DashboardFilters {
    return {
      hotelId: this.hotelIdSubject.value,
      dateRange: this.dateRangeSubject.value,
    };
  }
}
