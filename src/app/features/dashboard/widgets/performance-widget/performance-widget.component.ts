import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  NgZone,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, combineLatest, switchMap, startWith } from 'rxjs';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import { DashboardFacade } from '../../data-access/dashboard.facade';
import { DashboardFiltersService } from '../../data-access/dashboard-filters.service';
import { WidgetStateComponent } from '../../../../shared/components/widget-state/widget-state.component';
import { SvgIconComponent } from '../../../../shared/components/svg-icon/svg-icon.component';

interface ChartDataPoint {
  date: number;
  revenue: number | null;
  occupancy: number | null;
}

@Component({
  selector: 'app-performance-widget',
  standalone: true,
  imports: [CommonModule, WidgetStateComponent, SvgIconComponent],
  templateUrl: './performance-widget.component.html',
  styleUrl: './performance-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceWidgetComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartRoot', { static: false }) chartRoot!: ElementRef<HTMLDivElement>;

  private readonly facade = inject(DashboardFacade);
  private readonly filtersService = inject(DashboardFiltersService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  // Direct subscription to facade observable - retry triggers facade refresh
  readonly data$ = this.facade.revenueOccupancy$;

  readonly filters$ = this.facade.filters$;

  // Calculate missing days for partial data hint
  getMissingDaysCount(data: any): number {
    if (!data?.range || !data?.data) return 0;
    try {
      const from = new Date(data.range.from);
      const to = new Date(data.range.to);
      // Calculate expected days (inclusive of both start and end dates)
      const timeDiff = to.getTime() - from.getTime();
      const expectedDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
      const actualDays = data.data.length;
      return Math.max(0, expectedDays - actualDays);
    } catch {
      return 0;
    }
  }

  // Get context string for widget state (synchronous)
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

  private root: am5.Root | null = null;
  private chart: am5xy.XYChart | null = null;
  private revenueSeries: am5xy.ColumnSeries | null = null;
  private occupancySeries: am5xy.LineSeries | null = null;

  ngAfterViewInit(): void {
    // Subscribe to data changes
    this.data$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((state) => {
      if (state.status === 'success' && state.data.data.length > 0) {
        // Use requestAnimationFrame and setTimeout to ensure ViewChild is available after Angular renders the template
        requestAnimationFrame(() => {
          setTimeout(() => {
            // Force change detection to ensure ViewChild is updated
            this.cdr.detectChanges();

            if (!this.chart && this.chartRoot?.nativeElement) {
              // Create chart on first data load or after filter change
              this.ngZone.runOutsideAngular(() => {
                this.createChart();
                // Set initial data after chart creation
                this.updateChartData(state.data.data);
              });
              this.cdr.markForCheck();
            } else if (this.chart) {
              // Update chart data when filters change (chart already exists)
              this.updateChartData(state.data.data);
              this.cdr.markForCheck();
            } else if (!this.chartRoot?.nativeElement) {
              // If chart root is not available yet, retry after a short delay
              setTimeout(() => {
                if (!this.chart && this.chartRoot?.nativeElement) {
                  this.ngZone.runOutsideAngular(() => {
                    this.createChart();
                    this.updateChartData(state.data.data);
                  });
                  this.cdr.markForCheck();
                }
              }, 100);
            }
          }, 0);
        });
      } else if (state.status === 'loading') {
        // When loading, dispose chart to prevent stale data
        // Chart will be recreated when new data arrives
        if (this.root) {
          this.ngZone.runOutsideAngular(() => {
            this.root?.dispose();
            this.root = null;
            this.chart = null;
            this.revenueSeries = null;
            this.occupancySeries = null;
          });
          this.cdr.markForCheck();
        }
      }
    });
  }

  private createChart(): void {
    if (!this.chartRoot?.nativeElement) {
      console.error('Chart root element not available');
      return;
    }

    // Dispose existing chart if any
    if (this.root) {
      this.root.dispose();
    }

    this.root = am5.Root.new(this.chartRoot.nativeElement);

    // Set dark theme
    this.root.setThemes([am5.Theme.new(this.root)]);

    // Set root colors for dark theme
    this.root.interfaceColors.set('grid', am5.color('#ffffff'));
    this.root.interfaceColors.set('text', am5.color('#ffffff'));

    // Create chart with minimal padding for rotated labels
    this.chart = this.root.container.children.push(
      am5xy.XYChart.new(this.root, {
        panX: false,
        panY: false,
        wheelX: 'panX',
        wheelY: 'zoomX',
        layout: this.root.verticalLayout,
        paddingBottom: 35, // Reduced padding to bring logo up
        paddingLeft: 50, // Space for y-axis labels
      })
    );

    // Let the plot area stretch as much as possible horizontally
    this.chart.plotContainer.set('marginLeft', 0);
    this.chart.plotContainer.set('marginRight', 0);

    // Create axes
    const xAxis = this.chart.xAxes.push(
      am5xy.DateAxis.new(this.root, {
        baseInterval: { timeUnit: 'day', count: 1 },
        renderer: am5xy.AxisRendererX.new(this.root, {
          minGridDistance: 40,
          stroke: am5.color('rgba(255, 255, 255, 0.1)'),
          strokeOpacity: 0.5,
        }),
      })
    );

    // Set x-axis label colors and rotation
    xAxis.get('renderer').labels.template.setAll({
      fill: am5.color('rgba(255, 255, 255, 0.9)'),
      fontSize: 11,
      rotation: -45, // Rotate labels 45 degrees counter-clockwise
      centerY: am5.p100,
      centerX: 0,
      paddingTop: 5,
    });

    // Remove x-axis grid lines (keep only axis)
    xAxis.get('renderer').grid.template.setAll({
      strokeOpacity: 0,
    });

    const yAxisRevenue = this.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {
          opposite: false,
          stroke: am5.color('rgba(255, 255, 255, 0.1)'),
          strokeOpacity: 0.5,
        }),
        numberFormat: "#,###'€'",
        // Tiny headroom so top of columns + bullets are not visually clipped
        extraMax: 0.01,
      })
    );

    // Set y-axis label colors
    yAxisRevenue.get('renderer').labels.template.setAll({
      fill: am5.color('rgba(255, 255, 255, 0.9)'),
      fontSize: 12,
    });

    // Remove y-axis grid lines (keep only axis)
    yAxisRevenue.get('renderer').grid.template.setAll({
      strokeOpacity: 0,
    });

    const yAxisOccupancy = this.chart.yAxes.push(
      am5xy.ValueAxis.new(this.root, {
        renderer: am5xy.AxisRendererY.new(this.root, {
          opposite: true,
          stroke: am5.color('rgba(255, 255, 255, 0.1)'),
          strokeOpacity: 0.5,
        }),
        numberFormat: "#'%'",
        min: 0,
        max: 100,
        // Very small headroom so 100% line + bullets stay fully visible
        extraMax: 0.01,
      })
    );

    // Set y-axis label colors
    yAxisOccupancy.get('renderer').labels.template.setAll({
      fill: am5.color('rgba(255, 255, 255, 0.9)'),
      fontSize: 12,
    });

    // Remove y-axis grid lines (keep only axis)
    yAxisOccupancy.get('renderer').grid.template.setAll({
      strokeOpacity: 0,
    });

    // Create revenue series (columns)
    const revenueTooltip = am5.Tooltip.new(this.root, {
      labelText: '{valueY}€',
    });
    revenueTooltip.get('background')?.setAll({
      fill: am5.color('rgba(30, 30, 40, 0.98)'),
      stroke: am5.color('rgba(255, 255, 255, 0.1)'),
    });
    revenueTooltip.label.setAll({
      fill: am5.color('rgba(255, 255, 255, 0.9)'),
    });

    this.revenueSeries = this.chart.series.push(
      am5xy.ColumnSeries.new(this.root, {
        name: 'Revenue',
        xAxis: xAxis,
        yAxis: yAxisRevenue,
        valueYField: 'revenue',
        valueXField: 'date',
        fill: am5.color('#f59e0b'), // Amber/orange color for revenue
        stroke: am5.color('#f59e0b'),
        tooltip: revenueTooltip,
      })
    );

    // Configure to handle null values (creates gaps in chart)
    this.revenueSeries.set('interpolationDuration', 0);

    // Make columns thinner by adjusting column width
    this.revenueSeries.columns.template.setAll({
      width: am5.percent(50), // Make columns 50% of available space instead of default 100%
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
    });

    // Animate columns appearing (grow from bottom with stagger effect)
    this.revenueSeries.appear(1000, 100);

    // Create occupancy series (line)
    const occupancyTooltip = am5.Tooltip.new(this.root, {
      labelText: '{valueY}%',
    });
    occupancyTooltip.get('background')?.setAll({
      fill: am5.color('rgba(30, 30, 40, 0.98)'),
      stroke: am5.color('rgba(255, 255, 255, 0.1)'),
    });
    occupancyTooltip.label.setAll({
      fill: am5.color('rgba(255, 255, 255, 0.9)'),
    });

    this.occupancySeries = this.chart.series.push(
      am5xy.LineSeries.new(this.root, {
        name: 'Occupancy',
        xAxis: xAxis,
        yAxis: yAxisOccupancy,
        valueYField: 'occupancy',
        valueXField: 'date',
        stroke: am5.color('#06b6d4'), // Cyan color for occupancy line
        fill: am5.color('#06b6d4'), // Same color for fill
        tooltip: occupancyTooltip,
      })
    );

    // Add bullets (dots) on the line at each data point - matching amCharts example
    // Slightly nudge bullets downward via locationY so they don't get clipped at the very top
    this.occupancySeries.bullets.push(function (root, series) {
      return am5.Bullet.new(root, {
        locationY: 0.97, // keep bullet just below the exact data point
        sprite: am5.Circle.new(root, {
          strokeWidth: 3,
          stroke: series.get('stroke'),
          radius: 5,
          fill: root.interfaceColors.get('background'),
        }),
      });
    });

    // Configure to handle null values (creates breaks in line)
    this.occupancySeries.set('interpolationDuration', 0);

    // Configure the line series to have a filled area underneath with opacity
    this.occupancySeries.strokes.template.setAll({
      strokeWidth: 3,
    });

    // Add filled area underneath the line with opacity
    this.occupancySeries.fills.template.setAll({
      fillOpacity: 0.25, // 25% opacity for the filled area
      visible: true,
    });

    // Add gradient fill for more appealing look
    this.occupancySeries.fills.template.set(
      'fillGradient',
      am5.LinearGradient.new(this.root, {
        stops: [
          { color: am5.color('#06b6d4'), opacity: 0.3 },
          { color: am5.color('#06b6d4'), opacity: 0.1 },
        ],
        rotation: 90,
      })
    );

    // Add entrance animation for line (draw from left to right)
    this.occupancySeries.appear(1000, 100);

    // Add legend
    const legend = this.chart.children.push(
      am5.Legend.new(this.root, {
        centerX: am5.p50,
        x: am5.p50,
      })
    );
    legend.data.setAll(this.chart.series.values);

    // Set legend label colors
    legend.labels.template.setAll({
      fill: am5.color('rgba(255, 255, 255, 0.9)'),
      fontSize: 12,
    });

    // Add cursor
    this.chart.set('cursor', am5xy.XYCursor.new(this.root, {}));
  }

  private updateChartData(data: Array<{ date: string; revenue: number; occupancy: number }>): void {
    if (!this.revenueSeries || !this.occupancySeries) {
      return;
    }

    // Map data - missing dates will naturally create gaps
    // amCharts will skip null/undefined values, creating visual gaps
    const chartData: ChartDataPoint[] = data.map((item) => ({
      date: new Date(item.date).getTime(),
      revenue: item.revenue ?? null, // null creates gaps in bar chart
      occupancy: item.occupancy ?? null, // null creates breaks in line chart
    }));

    this.ngZone.runOutsideAngular(() => {
      // Animate data updates
      this.revenueSeries?.data.setAll(chartData);
      this.occupancySeries?.data.setAll(chartData);

      // Re-animate if chart already exists
      if (this.chart) {
        this.revenueSeries?.appear();
        this.occupancySeries?.appear(1000, 100);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
      this.root = null;
      this.chart = null;
      this.revenueSeries = null;
      this.occupancySeries = null;
    }
  }
}
