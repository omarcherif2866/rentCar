import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../model/user';
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable({
  providedIn: 'root'
})
export class Auth {
  private jsonUrl = 'assets/data/users.json'; // ← fichier local
  private localStorageKey = 'userAuth';
  private jwtHelper: JwtHelperService;
  private loggedIn = new BehaviorSubject<boolean>(false);

constructor(private httpClient: HttpClient) {
  this.jwtHelper = new JwtHelperService();

  const userData = localStorage.getItem(this.localStorageKey);

  if (userData) {
    try {
      const parsedData = JSON.parse(userData);
      this.loggedIn.next(!!parsedData.accessToken);
    } catch (error) {
      console.error('LocalStorage corrompu:', userData);
      localStorage.removeItem(this.localStorageKey); // nettoyage
      this.loggedIn.next(false);
    }
  }
}

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  // ✅ Login depuis JSON local
  login(loginData: { username: string; password: string }): Observable<any> {
    return this.httpClient.get<any>(this.jsonUrl).pipe(
      map(data => {
        const user = data.users.find(
          (u: any) =>
            u.username === loginData.username &&
            u.password === loginData.password
        );

        if (user) {
          const response = {
            id: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
            accessToken: user.accessToken
          };
          localStorage.setItem(this.localStorageKey, JSON.stringify(response));
          this.loggedIn.next(true);
          return response;
        } else {
          throw new Error('Nom d\'utilisateur ou mot de passe incorrect');
        }
      }),
      catchError(error => {
        console.error('Erreur de connexion:', error);
        return throwError(() => error);
      })
    );
  }

  // ✅ Inscription : ajoute dans le JSON (simulation en mémoire uniquement)
  addUser(user: any): Observable<User> {
    return this.httpClient.get<any>(this.jsonUrl).pipe(
      map(data => {
        const exists = data.users.find((u: any) => u.username === user.username);
        if (exists) {
          throw new Error('Utilisateur déjà existant');
        }
        // Note : on ne peut pas écrire dans un fichier JSON côté client
        // Les données ne seront pas persistées (simulation uniquement)
        const newUser: User = { ...user, id: Date.now() };
        return newUser;
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.localStorageKey);
    this.loggedIn.next(false);
  }

  getToken(): string | null {
    const currentUser = localStorage.getItem(this.localStorageKey);
    return currentUser ? JSON.parse(currentUser).accessToken : null;
  }

  getRoleFromToken(token: string): string {
    if (!token) return 'vide';
    const decodedToken = this.decodeToken(token);
    return decodedToken ? decodedToken.role : '';
  }

  private decodeToken(token: string): any {
    if (!token) return null;
    try {
      const tokenPayload = token.split('.')[1];
      return JSON.parse(atob(tokenPayload));
    } catch {
      return null;
    }
  }

  getUserId(): number | null {
    const userData = localStorage.getItem(this.localStorageKey);
    if (userData) {
      return JSON.parse(userData).id || null;
    }
    return null;
  }

  updateUser(id: number, user: User): Observable<User> {
    // Simulation : retourne l'utilisateur modifié sans appel réseau
    return new Observable(observer => {
      observer.next({ ...user, id });
      observer.complete();
    });
  }

  // ✅ Récupérer tous les utilisateurs (utile pour un admin)
  getAllUsers(): Observable<User[]> {
    return this.httpClient.get<any>(this.jsonUrl).pipe(
      map(data => data.users)
    );
  }

storeUserIdFromToken(): void {
  const currentUser = localStorage.getItem(this.localStorageKey);

  if (currentUser) {
    const parsed = JSON.parse(currentUser);
    const token = parsed.accessToken;

    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      const userId = decodedToken.id;
      localStorage.setItem('userId', userId.toString());
    }
  }
}
}