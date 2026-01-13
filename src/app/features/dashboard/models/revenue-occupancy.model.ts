import { DateRange } from './date-range.model';

export interface RevenueOccupancyPoint {
  date: string;
  revenue: number;
  occupancy: number;
}

export interface RevenueOccupancyResponse {
  hotel_id: number;
  hotel_name: string;
  currency: string;
  range: DateRange;
  data: RevenueOccupancyPoint[];
}
