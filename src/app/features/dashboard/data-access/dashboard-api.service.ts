import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KpisResponse, RevenueOccupancyResponse, BookingsByChannelResponse } from '../models';
import { DashboardFilters } from './dashboard-filters.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private readonly http = inject(HttpClient);

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
