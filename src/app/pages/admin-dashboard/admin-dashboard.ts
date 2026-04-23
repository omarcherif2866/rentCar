import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Reservation } from '../../service/reservation';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {

  loading = true;
  error = '';
  private carsData: any[] = []; // ← stocké après chargement
currentPage = 1;
itemsPerPage = 5;
  stats = {
    totalReservations: 0,
    totalRevenue: 0,
    // avgPrice: 0,
    // totalClients: 0,
  };

  monthlyData: { month: string; count: number; revenue: number }[] = [];
  carStats: {
    id: number;
    name: string;
    brand: string;
    image: string;
    rating: number;
    reservations: number;
    revenue: number;
  }[] = [];
  recentReservations: any[] = [];

  constructor(
    private reservationService: Reservation,
    private http: HttpClient   // ← injecte HttpClient
  ) {}

  async ngOnInit() {
    try {
      // 1. Charge le JSON des voitures
      this.carsData = await this.http
        .get<any[]>('assets/data/cars.json')
        .toPromise() as any[];

      // 2. Charge les réservations depuis Google Sheets
      const sheetData = await this.reservationService.getReservationsFromSheets();

      // 3. Calcule les stats
      this.computeAll(sheetData);

    } catch (e) {
      this.error = 'Impossible de charger les données.';
    } finally {
      this.loading = false;
    }
  }

  private computeAll(reservations: any[]) {
    this.computeStats(reservations);
    this.computeMonthly(reservations);
    this.computeCarStats(reservations);
    this.recentReservations = [...reservations]
      .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
      .slice(0, 6);
  }

  private computeStats(reservations: any[]) {
    const revenue = reservations.reduce((sum, r) => sum + Number(r.total_price || 0), 0);
    const clients = new Set(reservations.map(r => r.email)).size;
    this.stats = {
      totalReservations: reservations.length,
      totalRevenue: revenue,
      // avgPrice: reservations.length > 0 ? Math.round(revenue / reservations.length) : 0,
      // totalClients: clients,
    };
  }

  private computeMonthly(reservations: any[]) {
    const months = ['Jan','Fév','Mar','Avr','Mai','Jui','Jul','Aoû','Sep','Oct','Nov','Déc'];
    const map = new Map<number, { count: number; revenue: number }>();

    reservations.forEach(r => {
      const m = new Date(r.date_debut).getMonth();
      const entry = map.get(m) || { count: 0, revenue: 0 };
      entry.count++;
      entry.revenue += Number(r.total_price || 0);
      map.set(m, entry);
    });

    this.monthlyData = Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([m, d]) => ({ month: months[m], count: d.count, revenue: d.revenue }));
  }

  private computeCarStats(reservations: any[]) {
    const map = new Map<number, { count: number; revenue: number }>();

    reservations.forEach(r => {
      const id = Number(r.car_id);
      const entry = map.get(id) || { count: 0, revenue: 0 };
      entry.count++;
      entry.revenue += Number(r.total_price || 0);
      map.set(id, entry);
    });

    // Jointure avec carsData chargé via HttpClient
    this.carStats = this.carsData.map(car => {
      const stat = map.get(car.id) || { count: 0, revenue: 0 };
      return {
        id: car.id,
        name: car.name,
        brand: car.brand,
        image: car.image,
        rating: car.rating,
        reservations: stat.count,
        revenue: stat.revenue,
      };
    }).sort((a, b) => b.reservations - a.reservations);
  }

  get maxMonthlyCount() {
    return Math.max(...this.monthlyData.map(d => d.count), 1);
  }
  get maxMonthlyRevenue() {
    return Math.max(...this.monthlyData.map(d => d.revenue), 1);
  }
  getBarHeight(count: number): number {
    return Math.round((count / this.maxMonthlyCount) * 160);
  }
  getRevenueHeight(revenue: number): number {
    return Math.round((revenue / this.maxMonthlyRevenue) * 160);
  }
  getCarPercent(reservations: number): number {
    const max = Math.max(...this.carStats.map(c => c.reservations), 1);
    return Math.round((reservations / max) * 100);
  }

get totalPages(): number {
  return Math.ceil(this.recentReservations.length / this.itemsPerPage);
}

get paginatedReservations(): any[] {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  return this.recentReservations.slice(start, start + this.itemsPerPage);
}

get pages(): number[] {
  return Array.from({ length: this.totalPages }, (_, i) => i + 1);
}

goToPage(page: number) {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
  }
}

min(a: number, b: number): number {
  return Math.min(a, b);
}


}