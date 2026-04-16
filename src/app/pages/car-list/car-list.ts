import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CarService } from '../../service/car';
import { Car } from '../../model/car';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Reservation } from '../../service/reservation';

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [CommonModule,FormsModule], // 👈 AJOUT
  templateUrl: './car-list.html',
  styleUrl: './car-list.css',
})
export class CarList implements OnInit {
  cars: Car[] = [];
  filteredCars: Car[] = [];
 
  // Filtres actifs
  selectedCategory: string = 'Tous';
  selectedFuel: string = 'Tous';
  selectedTransmission: string = 'Tous';
  sortBy: string = 'price-asc';
  searchQuery: string = '';
 
  categories = ['Tous', 'Citadines', 'Berlines', 'SUV & 4x4', 'Électriques', 'Luxe', 'Utilitaires'];
  fuels = ['Tous', 'Essence', 'Diesel', 'Hybride', 'Électrique'];
  transmissions = ['Tous', 'Manuelle', 'Automatique'];
 lieu: string = '';
dateDebut: string = '';
dateFin: string = '';
allCars: any[] = [];       // toutes les voitures chargées depuis le JSON

reservationsFromSheets: any[] = [];
  constructor(private carService: CarService, private router: Router,private http: HttpClient,   private reservationService: Reservation) {}
 
async ngOnInit(): Promise<void> {
  const cars = await this.http.get<any[]>('assets/data/cars.json').toPromise();

  this.allCars = cars || [];

  // 🔥 récupérer les réservations depuis Google Sheets
  this.reservationsFromSheets = await this.reservationService.getReservationsFromSheets();

  this.applyFilters();
}



onSearchAvailable() {
  if (!this.dateDebut || !this.dateFin) {
    this.applyFilters(); // reset si dates vides
    return;
  }
  // Filtre par date D'ABORD, puis applique les autres filtres dessus
  const disponibles = this.allCars.filter(car =>
    this.isCarAvailable(car, this.dateDebut, this.dateFin)
  );
  // Applique les filtres catégorie/fuel/etc. sur le résultat
  this.filteredCars = this.applyFiltersOn(disponibles);
}

isCarAvailable(car: any, dateDebut: string, dateFin: string): boolean {
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);

  // 🔥 récupérer les réservations liées à cette voiture
  const reservations = this.reservationsFromSheets.filter(
    (r: any) => r.car_id == car.id
  );

  return reservations.every((r: any) => {
    const rDebut = new Date(r.date_debut);
    const rFin = new Date(r.date_fin);

    return fin <= rDebut || debut >= rFin;
  });
}
 
applyFiltersOn(source: any[]): any[] {
  let result = [...source];

  if (this.selectedCategory !== 'Tous')
    result = result.filter(c => c.category === this.selectedCategory);
  if (this.selectedFuel !== 'Tous')
    result = result.filter(c => c.fuel === this.selectedFuel);
  if (this.selectedTransmission !== 'Tous')
    result = result.filter(c => c.transmission === this.selectedTransmission);
  if (this.searchQuery.trim()) {
    const q = this.searchQuery.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.brand.toLowerCase().includes(q) ||
      c.model.toLowerCase().includes(q)
    );
  }

  switch (this.sortBy) {
    case 'price-asc': result.sort((a, b) => a.price - b.price); break;
    case 'price-desc': result.sort((a, b) => b.price - a.price); break;
    case 'rating': result.sort((a, b) => b.rating - a.rating); break;
  }

  return result;
}

// applyFilters existant devient juste un wrapper
applyFilters(): void {
  this.filteredCars = this.applyFiltersOn(this.allCars);
}
 
  onCategoryChange(cat: string): void {
    this.selectedCategory = cat;
    this.applyFilters();
  }
 
  onFuelChange(event: Event): void {
    this.selectedFuel = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }
 
  onTransmissionChange(event: Event): void {
    this.selectedTransmission = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }
 
  onSortChange(event: Event): void {
    this.sortBy = (event.target as HTMLSelectElement).value;
    this.applyFilters();
  }
 
  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }
 
  goToDetail(car: Car): void {
    this.router.navigate(['/cars', car.id]);
  }
 
  resetFilters(): void {
    this.selectedCategory = 'Tous';
    this.selectedFuel = 'Tous';
    this.selectedTransmission = 'Tous';
    this.sortBy = 'price-asc';
    this.searchQuery = '';
    this.applyFilters();
  }


}