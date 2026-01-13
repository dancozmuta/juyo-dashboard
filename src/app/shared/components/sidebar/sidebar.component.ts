import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

export interface NavItem {
  label: string;
  icon: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  searchQuery = '';

  navItems: NavItem[] = [
    { label: 'Analytics', icon: 'bar-chart', active: true }
  ];

  onSearchChange(value: string): void {
    this.searchQuery = value;
  }
}
