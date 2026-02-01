
export interface CarModel {
  id: string;
  brand: string;
  name: string;
  type: 'Sedan' | 'SUV' | 'Sport' | 'Hypercar' | 'Electric';
  baseImage: string;
  baseSpecs: {
    topSpeed: number;
    acceleration: string;
    horsepower: number;
  };
}

export interface UserConfig {
  car: CarModel;
  color: string;
  colorHex: string;
  wheels: string;
  performanceTier: 'Stock' | 'Sport' | 'Race';
}

export interface AISpecs {
  description: string;
  technicalDetails: {
    engine: string;
    drivetrain: string;
    weight: string;
    aerodynamics: string;
  };
  funFact: string;
}

export interface GameState {
  score: number;
  speed: number;
  distance: number;
  isGameOver: boolean;
  isPlaying: boolean;
  boostLevel: number;
  isBoosting: boolean;
}
