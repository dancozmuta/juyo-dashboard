import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { KpisResponse, RevenueOccupancyResponse, BookingsByChannelResponse } from '../models';
import { DashboardFilters } from './dashboard-filters.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private readonly http = inject(HttpClient);

  // Track which (hotel, range) combinations have already produced a simulated error.
  // This lets us fail once (first load) and then succeed after the user hits "Retry".
  private readonly kpisErrorKeys = new Set<string>();
  private readonly revenueErrorKeys = new Set<string>();
  private readonly bookingsErrorKeys = new Set<string>();

  private getErrorKey(filters: DashboardFilters): string {
    return `${filters.hotelId}_${filters.dateRange}`;
  }

  // Helper function to get hotel folder name (hotel-name-id)
  private getHotelFolderName(hotelId: number): string {
    const hotelFolderMap: Record<number, string> = {
      734921: 'riverside-business-hotel-734921',
      734922: 'grand-maple-city-hotel-734922',
      734923: 'aurora-harbor-suites-734923',
    };
    return hotelFolderMap[hotelId] || 'riverside-business-hotel-734921';
  }

  getKpis(filters: DashboardFilters): Observable<KpisResponse> {
    // Simulate a one-time error for Grand Maple City Hotel on last_30_days
    if (filters.hotelId === 734922 && filters.dateRange === 'last_30_days') {
      const key = this.getErrorKey(filters);
      if (!this.kpisErrorKeys.has(key)) {
        this.kpisErrorKeys.add(key);
      return throwError(() => new Error('Network error: Failed to fetch KPIs'));
      }
    }

    // Select JSON file based on date range and hotel folder
    // In a real app, this would be: `/api/dashboard/kpis?hotel_id=${filters.hotelId}&range=${filters.dateRange}`
    const hotelFolder = this.getHotelFolderName(filters.hotelId);
    const dateRange =
      filters.dateRange === 'last_7_days'
        ? 'last-7-days'
        : filters.dateRange === 'last_30_days'
        ? 'last-30-days'
        : 'last-month';
    const file = `kpis-${dateRange}.json`;

    return this.http.get<KpisResponse>(`/assets/mock/${hotelFolder}/${file}`);
  }

  getRevenueOccupancy(filters: DashboardFilters): Observable<RevenueOccupancyResponse> {
    // Simulate a one-time error for Grand Maple City Hotel on last_30_days
    if (filters.hotelId === 734922 && filters.dateRange === 'last_30_days') {
      const key = this.getErrorKey(filters);
      if (!this.revenueErrorKeys.has(key)) {
        this.revenueErrorKeys.add(key);
      return throwError(() => new Error('Network error: Failed to fetch revenue/occupancy data'));
      }
    }

    // Select JSON file based on date range and hotel folder
    // In a real app, this would be: `/api/dashboard/revenue-occupancy?hotel_id=${filters.hotelId}&range=${filters.dateRange}`
    const hotelFolder = this.getHotelFolderName(filters.hotelId);
    const dateRange =
      filters.dateRange === 'last_7_days'
        ? 'last-7-days'
        : filters.dateRange === 'last_30_days'
        ? 'last-30-days'
        : 'daily-november';
    const file = `revenue-occupancy-${dateRange}.json`;

    return this.http.get<RevenueOccupancyResponse>(`/assets/mock/${hotelFolder}/${file}`);
  }

  getBookingsByChannel(filters: DashboardFilters): Observable<BookingsByChannelResponse> {
    // Simulate a one-time error for Grand Maple City Hotel on last_30_days
    if (filters.hotelId === 734922 && filters.dateRange === 'last_30_days') {
      const key = this.getErrorKey(filters);
      if (!this.bookingsErrorKeys.has(key)) {
        this.bookingsErrorKeys.add(key);
      return throwError(() => new Error('Network error: Failed to fetch bookings by channel'));
      }
    }

    // Select JSON file based on date range and hotel folder
    // In a real app, this would be: `/api/dashboard/bookings-by-channel?hotel_id=${filters.hotelId}&range=${filters.dateRange}`
    const hotelFolder = this.getHotelFolderName(filters.hotelId);
    const dateRange =
      filters.dateRange === 'last_7_days'
        ? 'last-7-days'
        : filters.dateRange === 'last_30_days'
        ? 'last-30-days'
        : 'november';
    const file = `bookings-by-channel-${dateRange}.json`;

    return this.http.get<BookingsByChannelResponse>(`/assets/mock/${hotelFolder}/${file}`);
  }
}
