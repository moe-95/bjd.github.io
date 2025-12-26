
export enum Tab {
  PASSPORT = 'passport',
  GROOMING = 'grooming',
  FOSTER = 'foster',
  GROWTH = 'growth',
  COUPONS = 'coupons'
}

export interface NavItem {
  id: Tab;
  label: string;
  icon: React.ReactNode;
}

// Cloud Config
export interface CloudConfig {
  secretId: string;
  secretKey: string;
  bucket: string;
  region: string;
}

// Passport Types
export interface PersonalityTag {
  id: string;
  label: string;
  color: string;
  icon: string;
}

export interface PetProfile {
  id: string; // Unique ID for the pet
  name: string;
  birthday: string;
  breed: string;
  weight: string;
  avatar: string | null; // URL or Base64 string
  pawPrint: string | null;
  nosePrint: string | null;
  tags: PersonalityTag[];
}

// Grooming Types
export interface GroomingRecord {
  id: string;
  serviceName: string;
  date: string;
  photos: string[]; // URL or Base64 strings
  advice: string;
  tags: string[];
}

// Foster Types
export interface FosterDiary {
  id: string;
  dateRange: string;
  duration: string;
  mood: 'happy' | 'love' | 'cool' | 'sad' | 'normal';
  content: string;
  photos: string[]; // URL or Base64 strings
}

// Growth Types
export interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  type: 'bath' | 'home' | 'cake' | 'award' | 'vaccine';
}

export interface WeightPoint {
  date: string;
  value: number;
}

// Coupon Types
export interface Coupon {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  validDate: string;
  code: string;
  colorFrom: string;
  colorTo: string;
  status: 'active' | 'used'; // Added status
  icon: React.ReactNode; // Note: ReactNode is not serializable in JSON perfectly, usually better to store iconName, but for this demo within React context it's okay if we reconstruct it or use simple mapping.
  iconName?: string; // Helper for serialization
}