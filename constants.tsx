
import { CarModel } from './types';

export const CAR_MODELS: CarModel[] = [
  {
    id: 'porsche-911',
    brand: 'Porsche',
    name: '911 GT3 RS',
    type: 'Sport',
    baseImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    baseSpecs: { topSpeed: 312, acceleration: '3.2s', horsepower: 518 }
  },
  {
    id: 'tesla-s',
    brand: 'Tesla',
    name: 'Model S Plaid',
    type: 'Electric',
    baseImage: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800',
    baseSpecs: { topSpeed: 322, acceleration: '1.99s', horsepower: 1020 }
  },
  {
    id: 'lamborghini-rev',
    brand: 'Lamborghini',
    name: 'Revuelto',
    type: 'Hypercar',
    baseImage: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=800',
    baseSpecs: { topSpeed: 350, acceleration: '2.5s', horsepower: 1001 }
  },
  {
    id: 'bmw-m4',
    brand: 'BMW',
    name: 'M4 Competition',
    type: 'Sport',
    baseImage: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
    baseSpecs: { topSpeed: 290, acceleration: '3.8s', horsepower: 503 }
  },
  {
    id: 'range-rover',
    brand: 'Land Rover',
    name: 'Range Rover Sport SV',
    type: 'SUV',
    baseImage: 'https://images.unsplash.com/photo-1606148632399-54ae8840b49d?auto=format&fit=crop&q=80&w=800',
    baseSpecs: { topSpeed: 290, acceleration: '3.6s', horsepower: 626 }
  }
];

export const COLORS = [
  { name: 'Phanton Black', hex: '#0a0a0a' },
  { name: 'Velocity Red', hex: '#dc2626' },
  { name: 'Turbo Blue', hex: '#2563eb' },
  { name: 'Acid Green', hex: '#84cc16' },
  { name: 'Frozen White', hex: '#f8fafc' },
  { name: 'Gunmetal Grey', hex: '#4b5563' }
];

export const PERFORMANCE_TIERS = ['Stock', 'Sport', 'Race'] as const;
