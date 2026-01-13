import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  KpisResponse,
  RevenueOccupancyResponse,
  BookingsByChannelResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private readonly http = inject(HttpClient);

  getKpisLastMonth(): Observable<KpisResponse> {
    return this.http.get<KpisResponse>('/assets/mock/kpis-last-month.json');
  }

  getRevenueOccupancyDailyNovember(): Observable<RevenueOccupancyResponse> {
    return this.http.get<RevenueOccupancyResponse>('/assets/mock/revenue-occupancy-daily-november.json');
  }

  getBookingsByChannelNovember(): Observable<BookingsByChannelResponse> {
    return this.http.get<BookingsByChannelResponse>('/assets/mock/bookings-by-channel-november.json');
  }
}

