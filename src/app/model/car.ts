
export interface Car {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  transmission: string;
  fuel: string;
  puissance: number;
  places: number;
  portes: number;
  climatisation: boolean;
  gps: boolean;
  available: boolean;
  color: string;
  description: string;
  features: string[];
    reservations: { debut: string; fin: string }[];
    immatriculation: string;
}

