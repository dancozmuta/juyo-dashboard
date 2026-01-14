import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';

export interface NavItem {
  label: string;
  iconSrc: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  searchQuery = '';

  // Central, declarative configuration for navigation items.
  // Each item defines its label, icon source and active state.
  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      iconSrc: '/assets/icons/home-4-line.svg',
      active: false,
    },
    {
      label: 'Analytics',
      iconSrc: '/assets/icons/line-chart-line.svg',
      active: true,
    },
  ];

  onSearchChange(value: string): void {
    this.searchQuery = value;
  }
}
