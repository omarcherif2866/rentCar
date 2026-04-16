import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Car } from '../model/car';

@Injectable({
  providedIn: 'root',
})
export class CarService {
  private readonly jsonUrl = 'assets/data/cars.json';

  constructor(private http: HttpClient) {}

  getCars(): Observable<Car[]> {
    return this.http.get<Car[]>(this.jsonUrl);
  }

  getCarById(id: number): Observable<Car | undefined> {
    return new Observable((observer) => {
      this.getCars().subscribe({
        next: (cars) => {
          observer.next(cars.find((c) => c.id === id));
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }
}

