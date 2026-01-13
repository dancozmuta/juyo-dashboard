import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
import { DropdownComponent, DropdownOption } from '../../../../shared/components/dropdown/dropdown.component';
import { DashboardFiltersService, DateRangeType } from '../../data-access/dashboard-filters.service';
import { HotelsApiService } from '../../../../core/services/hotels-api.service';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, DropdownComponent],
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss'
})
export class DashboardHeaderComponent {
  @Input() title = 'Riverside Hospitality Holdings';

  private readonly filtersService = inject(DashboardFiltersService);
  private readonly hotelsApi = inject(HotelsApiService);

  readonly locationOptions$ = this.hotelsApi.getHotels().pipe(
    map((response) =>
      response.data.map((hotel) => ({
        label: hotel.name,
        value: hotel.id
      }))
    )
  );

  readonly dateRangeOptions: DropdownOption[] = [
    { label: 'Last 7 days', value: 'last_7_days' },
    { label: 'Last 30 days', value: 'last_30_days' },
    { label: 'Custom date', value: 'custom', disabled: true }
  ];

  readonly selectedHotelId$ = this.filtersService.hotelId$;
  readonly selectedDateRange$ = this.filtersService.dateRange$;

  onLocationChange(value: string | number): void {
    this.filtersService.setHotelId(value as number);
  }

  onDateRangeChange(value: string | number): void {
    // Ensure we're setting a valid DateRangeType
    const dateRange = value as DateRangeType;
    if (dateRange === 'last_7_days' || dateRange === 'last_30_days' || dateRange === 'last_month') {
      this.filtersService.setDateRange(dateRange);
    }
  }
}
