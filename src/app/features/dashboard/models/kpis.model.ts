import { DateRangeWithType } from './date-range.model';

export interface Kpis {
  total_revenue: number;
  average_occupancy: number;
  adr: number;
  total_bookings: number;
}

export interface KpisResponse {
  hotel_id: number;
  hotel_name: string;
  currency: string;
  range: DateRangeWithType;
  as_of: string;
  kpis: Kpis;
}
