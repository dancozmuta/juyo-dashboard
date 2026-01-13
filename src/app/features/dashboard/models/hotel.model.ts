export interface Hotel {
  id: number;
  name: string;
}

export interface HotelsMeta {
  total: number;
}

export interface HotelsResponse {
  data: Hotel[];
  meta: HotelsMeta;
}
