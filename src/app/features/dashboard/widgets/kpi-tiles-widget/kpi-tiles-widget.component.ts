import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardFacade } from '../../data-access/dashboard.facade';

@Component({
  selector: 'app-kpi-tiles-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-tiles-widget.component.html',
  styleUrl: './kpi-tiles-widget.component.scss',
})
export class KpiTilesWidgetComponent {
  readonly facade = inject(DashboardFacade);
  readonly data$ = this.facade.kpis$;

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
