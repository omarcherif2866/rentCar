// src/app/service/reservation.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs-config';
import { SHEETS_CONFIG } from '../config/google-sheets.config';

export interface ReservationData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  dateDebut: string;
  dateFin: string;
  carId?: number;
  carName?: string;
  carPrice?: number;
  totalDays: number;
  totalPrice: number;
  immatriculation?: string;
}
 
@Injectable({
  providedIn: 'root',
})
export class Reservation {
  // ─── Génère le PDF et retourne le base64 ───────────────────────
  generatePdf(r: ReservationData): { pdf: jsPDF; base64: string } {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
    const W = pdf.internal.pageSize.getWidth();
 
    // ── Fond header ──────────────────────────────────────────────
    pdf.setFillColor(10, 10, 15);
    pdf.rect(0, 0, W, 45, 'F');
 
    // Logo texte
    pdf.setTextColor(232, 200, 74);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CarRent', 14, 22);
 
    pdf.setTextColor(180, 180, 180);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Votre partenaire de location de voitures en Tunisie', 14, 30);
 
    // Titre BON DE RÉSERVATION
    pdf.setTextColor(232, 200, 74);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BON DE RÉSERVATION', W - 14, 22, { align: 'right' });
 
    // Numéro de réservation aléatoire
    const refNum = 'CR-' + Date.now().toString().slice(-6);
    pdf.setTextColor(180, 180, 180);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Réf : ${refNum}`, W - 14, 29, { align: 'right' });
    pdf.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, W - 14, 35, { align: 'right' });
 
    let y = 60;
 
    // ── Helpers ──────────────────────────────────────────────────
    const sectionTitle = (title: string) => {
      pdf.setFillColor(232, 200, 74);
      pdf.rect(14, y - 5, 3, 7, 'F');
      pdf.setTextColor(20, 20, 20);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, 20, y);
      y += 3;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(14, y, W - 14, y);
      y += 8;
    };
 
    const row = (label: string, value: string) => {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 100, 100);
      pdf.text(label, 16, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 30, 30);
      pdf.text(value, 75, y);
      y += 7;
    };
 
    // ── Section : Informations client ────────────────────────────
    sectionTitle('Informations client');
    row('Nom complet',  `${r.prenom} ${r.nom}`);
    row('Email',        r.email);
    row('Téléphone',    r.telephone);
    row('Adresse',      r.adresse);
    y += 4;
 
    // ── Section : Véhicule ───────────────────────────────────────
    sectionTitle('Véhicule loué');
    row('Véhicule',     r.carName ?? '—');
    row('Immatriculation', r.immatriculation ?? '—');
    row('Tarif journalier', `${r.carPrice ?? 0} Dt / jour`);
    y += 4;
 
    // ── Section : Période ────────────────────────────────────────
    sectionTitle('Période de location');
    const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR');
    row('Date de début', fmt(r.dateDebut));
    row('Date de fin',   fmt(r.dateFin));
    row('Durée',         `${r.totalDays} jour${r.totalDays > 1 ? 's' : ''}`);
    y += 4;
 
    // ── Bloc total ───────────────────────────────────────────────
    pdf.setFillColor(248, 248, 245);
    pdf.roundedRect(14, y, W - 28, 36, 4, 4, 'F');
 
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${r.carPrice} Dt × ${r.totalDays} jour${r.totalDays > 1 ? 's' : ''}`, 20, y + 10);
    pdf.text('Assurance tous risques', 20, y + 19);
 
    pdf.text(`${r.totalPrice} Dt`, W - 20, y + 10, { align: 'right' });
 
    pdf.setTextColor(46, 204, 113);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Offerte', W - 20, y + 19, { align: 'right' });
 
    pdf.setDrawColor(220, 220, 220);
    pdf.line(20, y + 24, W - 20, y + 24);
 
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 20, 20);
    pdf.text('Total à payer', 20, y + 32);
    pdf.setTextColor(232, 200, 74);
    pdf.text(`${r.totalPrice} Dt`, W - 20, y + 32, { align: 'right' });
 
    y += 50;
 
    // ── Note légale ──────────────────────────────────────────────
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(150, 150, 150);
    pdf.text('Assurance tous risques incluse  -  Annulation gratuite 24h avant la prise en charge', 14, y);
    y += 12;
    pdf.text('CarRent  -  contact@carrent.tn  -  +216 70 000 000  -  Tunis, Tunisie', 14, y);
 
    // ── Footer ───────────────────────────────────────────────────
    const pageH = pdf.internal.pageSize.getHeight();
    pdf.setFillColor(10, 10, 15);
    pdf.rect(0, pageH - 14, W, 14, 'F');
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(7);
    pdf.text(`© ${new Date().getFullYear()} CarRent – Tous droits réservés`, W / 2, pageH - 5, { align: 'center' });
 
    const base64 = pdf.output('datauristring').split(',')[1];
    return { pdf, base64 };
  }
 
  // ─── Télécharge le PDF ─────────────────────────────────────────
  downloadPdf(r: ReservationData): string {
    const { pdf, base64 } = this.generatePdf(r);
    pdf.save(`reservation_${r.carName?.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    return base64;
  }
 
  // ─── Envoie les emails (admin + client) ───────────────────────
  async sendEmails(r: ReservationData, pdfBase64: string): Promise<void> {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
 
    const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR');
 
    const commonParams = {
      client_name:    `${r.prenom} ${r.nom}`,
      client_email:   r.email,
      client_phone:   r.telephone,
      client_address: r.adresse,
      car_name:       r.carName ?? '—',
      car_price:      `${r.carPrice ?? 0} Dt`,
      date_debut:     fmt(r.dateDebut),
      date_fin:       fmt(r.dateFin),
      total_days:     `${r.totalDays}`,
      total_price:    `${r.totalPrice} Dt`,
      pdf_content:    pdfBase64,   // joint dans le template si configuré
    };
 
    // Email admin
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ADMIN,
      {
        ...commonParams,
        to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
        to_name:  'Admin CarRent',
      }
    );
 
    // Email client
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_CLIENT,
      {
        ...commonParams,
        to_email: r.email,
        to_name:  `${r.prenom} ${r.nom}`,
      }
    );
  }
 
// ─── Envoie la réservation vers Google Sheets ─────────────────
async saveToGoogleSheets(r: ReservationData): Promise<void> {
  const payload = {
    car_id:          r.carId,
    car_name:        r.carName,
    immatriculation: r.immatriculation,
    prenom:          r.prenom,
    nom:             r.nom,
    email:           r.email,
    telephone:       r.telephone,
    adresse:         r.adresse,
    date_debut:      r.dateDebut,
    date_fin:        r.dateFin,
    total_price:     r.totalPrice,
  };

await fetch(SHEETS_CONFIG.SCRIPT_URL, {
  method: 'POST',
  body: JSON.stringify(payload),
  mode: 'no-cors'
});

// considérer comme succès directement
}

// ─── Méthode principale mise à jour ───────────────────────────
async processReservation(r: ReservationData): Promise<void> {
  // 1. Télécharge le PDF
  const pdfBase64 = this.downloadPdf(r);

  // 2. Envoie les emails
  await this.sendEmails(r, pdfBase64);

  // 3. Sauvegarde dans Google Sheets
  await this.saveToGoogleSheets(r);
}


async getReservationsFromSheets(): Promise<any[]> {
  const res = await fetch(SHEETS_CONFIG.SCRIPT_URL);
  const data = await res.json();

  if (data.success) {
    return data.reservations;
  }

  return [];
}

  
}
