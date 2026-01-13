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
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import { DashboardFacade } from '../../data-access/dashboard.facade';

interface PieDataPoint {
  channel: string;
  bookings: number;
}

@Component({
  selector: 'app-bookings-by-channel-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bookings-by-channel-widget.component.html',
  styleUrl: './bookings-by-channel-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingsByChannelWidgetComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartRoot', { static: false }) chartRoot!: ElementRef<HTMLDivElement>;

  private readonly facade = inject(DashboardFacade);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  readonly data$ = this.facade.bookingsByChannel$;

  private root: am5.Root | null = null;
  private chart: am5percent.PieChart | null = null;
  private series: am5percent.PieSeries | null = null;

  ngAfterViewInit(): void {
    // Subscribe to data changes
    this.data$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
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
              } else if (this.chart && this.series) {
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
              this.series = null;
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
    this.root.interfaceColors.set('text', am5.color('#ffffff'));

    // Create pie chart with padding to prevent label clipping
    this.chart = this.root.container.children.push(
      am5percent.PieChart.new(this.root, {
        layout: this.root.verticalLayout,
        paddingTop: 30,
        paddingBottom: 30,
        paddingLeft: 30,
        paddingRight: 30,
      })
    );

    // Create pie series
    this.series = this.chart.series.push(
      am5percent.PieSeries.new(this.root, {
        valueField: 'bookings',
        categoryField: 'channel',
        alignLabels: true,
      })
    );
    
    // Set inner radius to make pie smaller and leave more room for labels
    this.series.set('innerRadius', am5.percent(0));

    // Set colors for pie slices - using a nice color palette
    this.series.get('colors')?.set('colors', [
      am5.color('#3b82f6'), // Blue - Direct
      am5.color('#10b981'), // Green - Booking.com
      am5.color('#f59e0b'), // Amber - Expedia
      am5.color('#ef4444'), // Red - Airbnb
      am5.color('#8b5cf6'), // Purple
      am5.color('#06b6d4'), // Cyan
      am5.color('#f97316'), // Orange
      am5.color('#ec4899'), // Pink
    ]);

    // Configure labels to be visible on slices - use shorter format to prevent clipping
    this.series.labels.template.setAll({
      text: '{category}\n{valuePercentTotal.formatNumber(\'#.0\')}%',
      fill: am5.color('#ffffff'),
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
      populateText: true,
      inside: true,
      radius: 20,
      centerX: am5.p50,
      centerY: am5.p50,
    });

    // Configure tooltips
    const tooltip = am5.Tooltip.new(this.root, {
      labelText: '{category}: {value} bookings ({valuePercentTotal.formatNumber(\'#.0\')}%)',
    });
    tooltip.get('background')?.setAll({
      fill: am5.color('rgba(30, 30, 40, 0.98)'),
      stroke: am5.color('rgba(255, 255, 255, 0.1)'),
    });
    tooltip.label.setAll({
      fill: am5.color('rgba(255, 255, 255, 0.9)'),
    });
    this.series.set('tooltip', tooltip);

    // Configure slices - add hover effects
    this.series.slices.template.setAll({
      strokeOpacity: 0,
      cornerRadius: 0,
      tooltipText: '{category}: {value} bookings ({valuePercentTotal.formatNumber(\'#.0\')}%)',
    });

    // Add hover state with smooth animation
    this.series.slices.template.states.create('hover', {
      scale: 1.05,
    });

    // Add entrance animation - slices appear with rotation and scale
    this.series.appear(1000, 100);

    // Add legend
    const legend = this.chart.children.push(
      am5.Legend.new(this.root, {
        centerX: am5.p50,
        x: am5.p50,
        marginTop: 15,
        marginBottom: 15,
      })
    );
    legend.data.setAll(this.series.dataItems);
    
    // Set legend label colors
    legend.labels.template.setAll({
      fill: am5.color('rgba(255, 255, 255, 0.9)'),
      fontSize: 12,
    });
  }

  private updateChartData(data: Array<{ channel: string; bookings: number }>): void {
    if (!this.series) {
      return;
    }

    const chartData: PieDataPoint[] = data.map((item) => ({
      channel: item.channel,
      bookings: item.bookings,
    }));

    this.ngZone.runOutsideAngular(() => {
      this.series?.data.setAll(chartData);
      
      // Re-animate if chart already exists
      if (this.chart) {
        this.series?.appear(1000, 100);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
      this.root = null;
      this.chart = null;
      this.series = null;
    }
  }
}
