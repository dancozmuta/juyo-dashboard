import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { HotelsApiService } from '../../core/services/hotels-api.service';
import { DashboardDataService } from './data-access/dashboard-data.service';
import { DashboardFiltersService } from './data-access/dashboard-filters.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';
import { PerformanceWidgetComponent } from './widgets/performance-widget/performance-widget.component';
import { BookingsByChannelWidgetComponent } from './widgets/bookings-by-channel-widget/bookings-by-channel-widget.component';
import { KpiTilesWidgetComponent } from './widgets/kpi-tiles-widget/kpi-tiles-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    DashboardHeaderComponent,
    DashboardCardComponent,
    PerformanceWidgetComponent,
    BookingsByChannelWidgetComponent,
    KpiTilesWidgetComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly hotelsApi = inject(HotelsApiService);
  readonly dashboardData = inject(DashboardDataService);
  readonly filtersService = inject(DashboardFiltersService);

  readonly hotels$ = this.hotelsApi.getHotels();
  readonly filters$ = this.filtersService.filters$;

  readonly vm$ = combineLatest([
    this.hotels$,
    this.filters$,
    this.dashboardData.kpis$,
    this.dashboardData.revenueOccupancy$,
    this.dashboardData.bookingsByChannel$,
  ]).pipe(
    map(([hotels, filters, kpis, revenueOccupancy, bookingsByChannel]) => ({
      hotels,
      filters,
      kpis,
      revenueOccupancy,
      bookingsByChannel,
    }))
  );
}
