import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CarList } from './pages/car-list/car-list';
import { CarDetails } from './pages/car-details/car-details';
import { Signin } from './pages/signin/signin';
import { Signup } from './pages/signup/signup';

export const routes: Routes = [ // 👈 AJOUT "export"
  { path: '', component: Home },
  { path: 'cars',     component: CarList },
  { path: 'cars/:id', component: CarDetails },
  { path: 'signin', component: Signin },
  { path: 'signup', component: Signup },
];

export class AppRoutingModule {}
