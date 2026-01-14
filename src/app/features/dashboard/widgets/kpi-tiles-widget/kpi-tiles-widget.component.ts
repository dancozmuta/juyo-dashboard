import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardFacade } from '../../data-access/dashboard.facade';
import { DashboardFiltersService } from '../../data-access/dashboard-filters.service';
import { WidgetStateComponent } from '../../../../shared/components/widget-state/widget-state.component';

@Component({
  selector: 'app-kpi-tiles-widget',
  standalone: true,
  imports: [CommonModule, WidgetStateComponent],
  templateUrl: './kpi-tiles-widget.component.html',
  styleUrl: './kpi-tiles-widget.component.scss',
})
export class KpiTilesWidgetComponent {
  readonly facade = inject(DashboardFacade);
  private readonly filtersService = inject(DashboardFiltersService);

  readonly data$ = this.facade.kpis$;
  readonly filters$ = this.facade.filters$;

  getContextString(data: any, currentFilters: any): string {
    if (!data) return '';
    const hotelName = data.hotel_name || '';
    let rangeText = '';
    if (currentFilters?.dateRange === 'last_7_days') rangeText = 'Last 7 days';
    else if (currentFilters?.dateRange === 'last_30_days') rangeText = 'Last 30 days';
    else rangeText = 'Last month';
    return hotelName ? `${hotelName} • ${rangeText}` : rangeText;
  }

  onRetry(): void {
    // Trigger refresh through filters service, which causes facade to re-fetch
    this.filtersService.refresh();
  }

  formatCurrency(value: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }
}
