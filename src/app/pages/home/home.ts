import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true, // ✅ IMPORTANT
imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
 
  isScrolled = false;
 
  @HostListener('window:scroll', [])
  onScroll() {
    this.isScrolled = window.scrollY > 50;
  }
 
cars = [
  {
    name: 'kia rio',
    price: 150,
    image: 'assets/kia rio.png',
    rating: '4.9',
    transmission: 'Manuelle',
    fuel: 'Essence',
    puissance: 5
  },
  {
    name: 'Polo 8',
    price: 140,
    image: 'assets/polo8.png',
    rating: '4.8',
    transmission: 'Automatique',
    fuel: 'Diesel',
    puissance: 5
  },
  {
    name: 'Hyundai i10',
    price: 160,
    image: 'assets/hyundai-i10.png',
    rating: '5.0',
    transmission: 'Automatique',
    fuel: 'Hybride',
    puissance: 5
  },
  {
    name: 'Renault Clio',
    price: 90,
    image: 'assets/clio4.png',
    rating: '4.6',
    transmission: 'Manuelle',
    fuel: 'Essence',
    puissance: 5
  }
];


 
  categories = [
    { icon: '🏙️', name: 'Citadines', desc: 'Idéales pour la ville, économiques et maniables.', from: 50 },
    { icon: '🚗', name: 'Berlines', desc: 'Confort et style pour vos trajets professionnels.', from: 100 },
    { icon: '🚙', name: 'SUV & 4x4', desc: 'Puissance et espace pour toute la famille.', from: 130 },
    { icon: '⚡', name: 'Électriques', desc: 'Écologique et moderne, l\'avenir de la mobilité.', from: 90 },
    { icon: '💎', name: 'Luxe', desc: 'L\'excellence automobile à votre portée.', from: 200 },
    { icon: '🚐', name: 'Utilitaires', desc: 'Transport de marchandises et déménagement.', from: 80 },
  ];
 
  steps = [
    {
      icon: '🔍',
      title: 'Choisissez votre véhicule',
      desc: 'Parcourez notre catalogue et sélectionnez le véhicule qui vous correspond.'
    },
    {
      icon: '📋',
      title: 'Complétez votre réservation',
      desc: 'Renseignez vos informations et choisissez vos options supplémentaires.'
    },
    {
      icon: '🚗',
      title: 'Prenez le volant',
      desc: 'Récupérez votre véhicule à l\'agence ou faites-vous livrer directement.'
    }
  ];
 
  features = [
    {
      icon: '💸',
      title: 'Prix compétitifs',
      desc: 'Nos tarifs sont parmi les plus avantageux du marché, sans frais cachés.'
    },
    {
      icon: '🛡️',
      title: 'Assurance incluse',
      desc: 'Chaque véhicule est couvert par une assurance tous risques complète.'
    },
    {
      icon: '⚡',
      title: 'Réservation instantanée',
      desc: 'Confirmez votre réservation en moins de 2 minutes, 24h/24.'
    },
    {
      icon: '🔧',
      title: 'Assistance 24/7',
      desc: 'Notre équipe est disponible à toute heure pour vous accompagner.'
    },
    {
      icon: '🚗',
      title: 'Large choix',
      desc: 'Plus de 500 véhicules disponibles dans 12 villes tunisiennes.'
    },
    {
      icon: '✅',
      title: 'Véhicules vérifiés',
      desc: 'Chaque voiture est révisée et nettoyée avant chaque location.'
    }
  ];
 
  testimonials = [
    {
      text: 'Service impeccable, la voiture était propre et en parfait état. Livraison à l\'heure. Je recommande vivement CarRent !',
      name: 'Mehdi Trabelsi',
      city: 'Tunis',
      initials: 'MT'
    },
    {
      text: 'J\'utilise CarRent régulièrement pour mes déplacements professionnels. Toujours fiable, toujours ponctuel. Excellent rapport qualité-prix.',
      name: 'Sonia Gharbi',
      city: 'Sfax',
      initials: 'SG'
    },
    {
      text: 'Une BMW pour le week-end à un tarif incroyable. L\'expérience était parfaite du début à la fin. À refaire !',
      name: 'Karim Mansouri',
      city: 'Sousse',
      initials: 'KM'
    }
  ];




}