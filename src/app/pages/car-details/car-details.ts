import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../service/car';
import { Car } from '../../model/car';
import { FormsModule } from '@angular/forms';
import { Reservation, ReservationData } from '../../service/reservation';

@Component({
  selector: 'app-car-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './car-details.html',
  styleUrl: './car-details.css',
})
export class CarDetails implements OnInit {
  car: Car | null = null;
  relatedCars: Car[] = [];
  loading = true;
  notFound = false;

  startDate: string = '';
  endDate: string = '';
  totalDays: number = 0;
  totalPrice: number = 0;

  today: string = new Date().toISOString().split('T')[0];

  showDialog = false;
  sending     = false;
  sendSuccess = false;
  sendError   = false;
  errorMessage = '';

  reservation = {
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    dateDebut: '',
    dateFin: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carService: CarService,
    private reservationService: Reservation
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.carService.getCars().subscribe((data) => {
        this.car = data.find((c) => c.id === id) ?? null;
        this.loading = false;

        if (!this.car) {
          this.notFound = true;
          return;
        }

        this.relatedCars = data
          .filter((c) => c.category === this.car!.category && c.id !== id)
          .slice(0, 3);

        // ✅ Appelé ICI, après que this.car est chargé
        this.loadReservationsFromStorage();
      });
    });
  }

  // ─── Charge les réservations depuis localStorage ───────────────
  private loadReservationsFromStorage(): void {
    if (!this.car) return;

    const saved = JSON.parse(
      localStorage.getItem('car_reservations') ?? '[]'
    ) as { id: number; reservations: { debut: string; fin: string }[] }[];

    const entry = saved.find(e => e.id === this.car!.id);
    if (entry) {
      entry.reservations.forEach((r: { debut: string; fin: string }) => {
        const exists = this.car!.reservations.some(
          (x: { debut: string; fin: string }) =>
            x.debut === r.debut && x.fin === r.fin
        );
        if (!exists) {
          this.car!.reservations.push(r);
        }
      });
    }
  }

  // ─── Sauvegarde les réservations dans localStorage ─────────────
  private saveReservationsToStorage(): void {
    const existing = JSON.parse(
      localStorage.getItem('car_reservations') ?? '[]'
    ) as { id: number; reservations: { debut: string; fin: string }[] }[];

    const idx = existing.findIndex(e => e.id === this.car!.id);
    if (idx !== -1) {
      existing[idx].reservations = this.car!.reservations;
    } else {
      existing.push({
        id:           this.car!.id,
        reservations: this.car!.reservations,
      });
    }

    localStorage.setItem('car_reservations', JSON.stringify(existing));
  }

  // ─── Confirmation réservation ──────────────────────────────────
  async confirmReservation(): Promise<void> {
    if (!this.isFormValid() || !this.car) return;

    this.sending   = true;
    this.sendError = false;

    const data: ReservationData = {
      prenom:          this.reservation.prenom,
      nom:             this.reservation.nom,
      email:           this.reservation.email,
      telephone:       this.reservation.telephone,
      adresse:         this.reservation.adresse,
      dateDebut:       this.reservation.dateDebut,
      dateFin:         this.reservation.dateFin,
      carId:           this.car.id,
      carName:         this.car.name,
      carPrice:        this.car.price,
      immatriculation: this.car.immatriculation,
      totalDays:       this.totalDays,
      totalPrice:      this.totalPrice,
    };

    try {
      await this.reservationService.processReservation(data);

      // ── Ajouter en mémoire ──
      this.car.reservations.push({
        debut: this.reservation.dateDebut,
        fin:   this.reservation.dateFin,
      });

      // ── Persister dans localStorage ──
      this.saveReservationsToStorage();

      this.sendSuccess = true;
    } catch (err) {
      this.sendError    = true;
      this.errorMessage = 'Une erreur est survenue. Vérifiez votre connexion et réessayez.';
      console.error(err);
    } finally {
      this.sending = false;
    }
  }

  // ─── Dialog ────────────────────────────────────────────────────
  openReservationDialog(): void {
    this.reservation = {
      prenom: '', nom: '', email: '',
      telephone: '', adresse: '',
      dateDebut: '', dateFin: '',
    };
    this.totalDays   = 0;
    this.totalPrice  = 0;
    this.sendSuccess = false;
    this.sendError   = false;
    this.showDialog  = true;
    document.body.style.overflow = 'hidden';
  }

  closeDialog(): void {
    this.showDialog   = false;
    this.sendSuccess  = false;
    this.sendError    = false;
    this.sending      = false;
    this.errorMessage = '';
    this.reservation  = {
      prenom: '', nom: '', email: '',
      telephone: '', adresse: '',
      dateDebut: '', dateFin: '',
    };
    this.totalDays  = 0;
    this.totalPrice = 0;
    document.body.style.overflow = '';
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.closeDialog();
    }
  }

  onDateChange(): void {
    const { dateDebut, dateFin } = this.reservation;
    if (dateDebut && dateFin && dateFin > dateDebut) {
      const start = new Date(dateDebut).getTime();
      const end   = new Date(dateFin).getTime();
      this.totalDays  = Math.round((end - start) / (1000 * 60 * 60 * 24));
      this.totalPrice = this.totalDays * (this.car?.price ?? 0);
    } else {
      this.totalDays  = 0;
      this.totalPrice = 0;
    }
  }

  isFormValid(): boolean {
    const r = this.reservation;
    return !!(
      r.prenom.trim()    &&
      r.nom.trim()       &&
      r.email.trim()     &&
      r.telephone.trim() &&
      r.adresse.trim()   &&
      r.dateDebut        &&
      r.dateFin          &&
      this.totalDays > 0
    );
  }

  // ─── Navigation ────────────────────────────────────────────────
  onStartDateChange(event: Event): void {
    this.startDate = (event.target as HTMLInputElement).value;
    this.calculateTotal();
  }

  onEndDateChange(event: Event): void {
    this.endDate = (event.target as HTMLInputElement).value;
    this.calculateTotal();
  }

  calculateTotal(): void {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end   = new Date(this.endDate);
      const diff  = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      this.totalDays  = diff > 0 ? diff : 0;
      this.totalPrice = this.totalDays * (this.car?.price ?? 0);
    } else {
      this.totalDays  = 0;
      this.totalPrice = 0;
    }
  }

  goBack(): void {
    this.router.navigate(['/cars']);
  }

  goToRelated(car: Car): void {
    this.router.navigate(['/cars', car.id]);
  }
}