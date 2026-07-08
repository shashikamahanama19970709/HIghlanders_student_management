export interface User {
  _id: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
  profile?: {
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: Date;
    isMinor?: boolean;
    parentGuardian?: {
      name: string;
      phone: string;
      email: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  _id: string;
  name: string;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  ageCategory: string;
  description: string;
  isVisible: boolean;
  maxCapacity?: number;
  currentEnrollment: number;
  showOnWeb?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberRequest {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  isMinor: boolean;
  parentGuardian?: {
    name: string;
    phone: string;
    email: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalInfo?: string;
  termsAccepted: boolean;
  termsAcceptedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  _id: string;
  user: string | User;
  membershipId: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: Date;
  subscriptions: Subscription[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  classes: string[]; // Class IDs
  isActive: boolean;
  stripePriceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  _id: string;
  member: string | Member;
  subscription: string | Subscription;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  stripePaymentIntentId?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  _id: string;
  clubName: string;
  vision: string;
  mission: string;
  description: string;
  logo?: {
    fileKey: string;
    url: string;
  };
  heroVideo?: {
    fileKey: string;
    url: string;
  };
  history?: string;
  masters: Master[];
  socialMedia: SocialMediaLink[];
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    mapEmbedUrl?: string;
  };
  operatingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  membershipFees: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Master {
  _id: string;
  name: string;
  title?: string;
  bio: string;
  image?: {
    fileKey: string;
    url: string;
  };
  rank?: string;
  certifications?: string[];
  showOnWeb?: boolean;
}

export interface SocialMediaLink {
  platform: string;
  icon: string;
  url: string;
  isEnabled: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface FileUpload {
  fileKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface OnboardingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  isMinor: boolean;
  parentGuardian?: {
    name: string;
    phone: string;
    email: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalInfo?: string;
  termsAccepted: boolean;
}
