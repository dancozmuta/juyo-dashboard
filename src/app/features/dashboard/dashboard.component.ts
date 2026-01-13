import { Component, OnInit } from '@angular/core';
import { HotelsApiService } from '../../core/services/hotels-api.service';
import { DashboardApiService } from './data-access/dashboard-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  constructor(
    private readonly hotelsApi: HotelsApiService,
    private readonly dashboardApi: DashboardApiService
  ) {}

  ngOnInit(): void {
    this.hotelsApi.getHotels().subscribe((response) => {
      console.log('Hotels API response', response);
    });

    this.dashboardApi.getKpisLastMonth().subscribe((response) => {
      console.log('KPIs last month response', response);
    });

    this.dashboardApi.getRevenueOccupancyDailyNovember().subscribe((response) => {
      console.log('Revenue + occupancy daily response', response);
    });

    this.dashboardApi.getBookingsByChannelNovember().subscribe((response) => {
      console.log('Bookings by channel response', response);
    });
  }
}
