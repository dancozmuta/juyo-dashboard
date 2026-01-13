import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HotelsResponse } from '../../features/dashboard/models';

@Injectable({
  providedIn: 'root'
})
export class HotelsApiService {
  private readonly http = inject(HttpClient);

  getHotels(): Observable<HotelsResponse> {
    return this.http.get<HotelsResponse>('/assets/mock/hotels.json');
  }
}

