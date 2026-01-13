import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { HotelsApiService } from '../../core/services/hotels-api.service';
import { DashboardFacade } from './data-access/dashboard.facade';
import { DashboardFiltersService } from './data-access/dashboard-filters.service';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';
import { DetailsCardComponent } from './components/details-card/details-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    DashboardHeaderComponent,
    DashboardCardComponent,
    DetailsCardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly hotelsApi = inject(HotelsApiService);
  readonly facade = inject(DashboardFacade);
  readonly filtersService = inject(DashboardFiltersService);

  readonly hotels$ = this.hotelsApi.getHotels();
  readonly filters$ = this.filtersService.filters$;

  readonly vm$ = combineLatest([
    this.hotels$,
    this.filters$,
    this.facade.kpis$,
    this.facade.revenueOccupancy$,
    this.facade.bookingsByChannel$
  ]).pipe(
    map(([hotels, filters, kpis, revenueOccupancy, bookingsByChannel]) => ({
      hotels,
      filters,
      kpis,
      revenueOccupancy,
      bookingsByChannel
    }))
  );
}
