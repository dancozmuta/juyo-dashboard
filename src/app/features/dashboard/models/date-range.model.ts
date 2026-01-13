export interface DateRange {
  from: string;
  to: string;
}

export interface DateRangeWithType extends DateRange {
  type: string;
}
