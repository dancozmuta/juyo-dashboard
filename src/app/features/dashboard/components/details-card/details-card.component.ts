import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DetailItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-details-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-card.component.html',
  styleUrl: './details-card.component.scss'
})
export class DetailsCardComponent {
  details: DetailItem[] = [
    { label: 'Previous Close', value: '4,324.32' },
    { label: 'Year Range', value: '4,834.32 - 4,932.53' },
    { label: 'Day Range', value: '2,623.28 - 3,823.74' },
    { label: 'Market Cap', value: '$23.7 T USD' },
    { label: 'P/E Ratio', value: '82.73' }
  ];
}
