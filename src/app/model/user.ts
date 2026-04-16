export enum Role {
  ADMIN = 'Admin',
  USER = 'SIMPLEU',

}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  birthdate: string;
  phone: string;
  role?: Role; 
  blocked?: boolean;

}


  