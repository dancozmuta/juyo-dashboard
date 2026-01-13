import { DateRange } from './date-range.model';

export interface BookingsByChannelItem {
  channel: string;
  bookings: number;
}

export interface BookingsByChannelResponse {
  hotel_id: number;
  hotel_name: string;
  range: DateRange;
  data: BookingsByChannelItem[];
}
