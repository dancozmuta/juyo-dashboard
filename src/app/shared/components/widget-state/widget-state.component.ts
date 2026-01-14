import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loadable } from '../../../features/dashboard/data-access/loadable.model';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

@Component({
  selector: 'app-widget-state',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './widget-state.component.html',
  styleUrl: './widget-state.component.scss',
})
export class WidgetStateComponent {
  @Input() state: Loadable<any> | null = null;

  @Input() emptyMessage = 'No data available for the selected range';
  @Input() errorMessage?: string;
  @Input() context?: string; // e.g., "Grand Maple City Hotel • Last 7 days"
  @Output() retry = new EventEmitter<void>();

  get displayMessage(): string {
    if (this.state?.status === 'error') {
      const baseMessage = this.errorMessage || this.state.message || 'Failed to load data';
      return this.context ? `${baseMessage} • ${this.context}` : baseMessage;
    }
    if (this.state?.status === 'empty') {
      return this.context ? `${this.emptyMessage} • ${this.context}` : this.emptyMessage;
    }
    return this.emptyMessage;
  }

  onRetry(): void {
    this.retry.emit();
  }
}
