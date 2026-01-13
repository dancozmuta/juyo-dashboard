import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})
export class DropdownComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() label = '';
  @Input() options: DropdownOption[] = [];
  @Input() placeholder = 'Select...';
  @Input() value: string | number | null = null;
  @Output() selectionChange = new EventEmitter<string | number>();

  isOpen = false;
  selectedValue: string | number | null = null;
  selectedLabel = '';

  private onChange = (value: string | number) => {};
  private onTouched = () => {};

  ngOnInit(): void {
    if (this.value !== null && this.value !== undefined) {
      this.writeValue(this.value);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.value !== null && this.value !== undefined) {
      // Only update if the value actually changed
      if (this.selectedValue !== this.value) {
        this.writeValue(this.value);
      }
    }
    // Also update if options changed and we have a value
    if (changes['options'] && this.value !== null && this.value !== undefined) {
      this.writeValue(this.value);
    }
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.onTouched();
    }
  }

  selectOption(option: DropdownOption): void {
    if (option.disabled) {
      return;
    }
    this.selectedValue = option.value;
    this.selectedLabel = option.label;
    this.isOpen = false;
    this.onChange(option.value);
    this.selectionChange.emit(option.value);
  }

  onBlur(event: FocusEvent): void {
    // Only close if focus is moving outside the dropdown component
    // This prevents closing when clicking on an option
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (relatedTarget && this.isDropdownElement(relatedTarget)) {
      return;
    }
    // Use setTimeout to allow click events to fire first
    setTimeout(() => {
      if (!this.isDropdownElement(document.activeElement as HTMLElement)) {
        this.isOpen = false;
      }
    }, 150);
  }

  private isDropdownElement(element: HTMLElement | null): boolean {
    if (!element) {
      return false;
    }
    const dropdown = element.closest('.dropdown');
    return dropdown !== null;
  }

  // ControlValueAccessor implementation
  writeValue(value: string | number | null): void {
    if (value !== undefined && value !== null) {
      // Convert to string for comparison to handle type mismatches
      const option = this.options.find(opt => String(opt.value) === String(value));
      if (option) {
        this.selectedValue = option.value;
        this.selectedLabel = option.label;
      } else if (this.options.length > 0) {
        // If value doesn't match, try to find by exact match first
        const exactMatch = this.options.find(opt => opt.value === value);
        if (exactMatch) {
          this.selectedValue = exactMatch.value;
          this.selectedLabel = exactMatch.label;
        }
      }
    } else {
      this.selectedValue = null;
      this.selectedLabel = '';
    }
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
