export type City = 'Bangalore' | 'Hyderabad' | 'Delhi';
export type DirectionZone = 'North' | 'South' | 'East' | 'West' | 'Advice';
export type PropertyPurpose = 'Own' | 'Rental';
export type Bedrooms = '1 BHK' | '2 BHK' | '3 BHK' | '4+ BHK';
export type BudgetRange = '< 50 Lakhs' | '50L – 1 Cr' | '1 Cr – 2 Cr' | '> 2 Cr';

export type UserRole = 'customer' | 'agent' | null;

export interface AuditScorecard {
  structural: number; // out of 10
  legalClearance: number; // out of 10
  waterSecurity: number; // out of 10
  acousticInsulation: number; // out of 10
  carpetEfficiency: number; // out of 10
  liquidityScore: number; // out of 10
  localityAvgRate: number; // e.g. 11200
  floorplanCutawayImage?: string;
}

export interface GalleryImageItem {
  title: string;
  category: string;
  src: string;
}

export interface Flat {
  id: string;
  name: string;
  company: string;
  devId: string;
  locality: string;
  city: City;
  zone: DirectionZone;
  purpose: PropertyPurpose;
  bedrooms: Bedrooms;
  price: string;
  priceNum: number; // in Lakhs
  rate: string;
  config: string;
  carpet: string;
  score: string;
  image: string;
  galleryImages?: GalleryImageItem[];
  lat: number;
  lng: number;
  type: string;
  flatNo: string;
  floor: string;
  advance: string;
  advanceNum: number;
  email: string;
  phone: string;
  reraNumber: string;
  description: string;
  amenities: string[];
  facing?: string;
  possession?: string;
  parking?: string;
  bathrooms?: number;
  balconies?: number;
  highlights?: string[];
  auditScorecard?: AuditScorecard;
}

export interface DeveloperStock {
  id: string;
  name: string;
  shortName: string;
  ticker: string;
  hq: string;
  price: string;
  priceNum: number;
  changeText: string;
  changePercent: number;
  positive: boolean;
  timestamp: string;
  prevClose: string;
  mcap: string;
  high52: string;
  pe: string;
  founded: string;
  delivered: string;
  score: string;
  overview: string;
  flatId: string;
  flatName: string;
  flatPrice: string;
  series: Record<'1D' | '5D' | '1M' | '6M' | '1Y' | '5Y', number[]>;
  labels: Record<'1D' | '5D' | '1M' | '6M' | '1Y' | '5Y', string[]>;
}

export type ConstructionStage = 'Already Present' | 'Under Construction' | 'About to Start';

export interface BuildingLocation {
  id: string;
  name: string;
  companyName: string;
  stage: ConstructionStage;
  place: string;
  coords: string;
  lat: number;
  lng: number;
  units: string;
  pinX: number;
  pinY: number;
  leadCount: number;
  avgConversion: number;
}

export type LeadStatus =
  | 'Initial Inquiry'
  | 'Audit Report Viewed'
  | 'Callback Requested'
  | 'Shortlisted'
  | 'Site Visit Scheduled'
  | 'Site Visit Completed'
  | 'Loan Pre-Approved'
  | 'Negotiation'
  | 'Advance Placed'
  | 'Closed / Dropped';

export interface BuyerLead {
  id: string;
  uid?: string;
  name: string;
  photo?: string;
  email: string;
  phone: string;
  requirement: string;
  status: LeadStatus;
  probability: number; // 0 - 100
  occupation: string;
  city: string;
  contactTime: string;
  family: string;
  purpose: string;
  config: string;
  budget: string;
  budgetNum: number; // in Lakhs
  loan: string;
  possession: string;
  notes: string;
  company: string;
  project: string;
  place: string;
  assignedAgent?: string;
  lastActivityDate: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  partnerId: string; // RERA / Partner ID, e.g. "GW-RERA-2048"
  city: City;
  agency: string;
  tier: 'Senior Advisor' | 'Principal Broker' | 'Associate Partner' | 'Managing Partner';
  activeLeadsCount: number;
  closedDealsCount: number;
  rating: number;
  avatar?: string;
  specialization?: string;
}

export interface CustomerUser {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone: string;
  city: City;
  zone: DirectionZone;
  purpose: PropertyPurpose;
  preferredBedrooms: Bedrooms;
  budgetRange: BudgetRange;
  budgetNum: number;
  occupation: string;
  requirement: string;
  savedFlatIds: string[];
  followedStocks?: string[];
  createdDate: string;
  assignedAgent?: string;
}

export type ParameterMetricCategory =
  | 'location_parameter'
  | 'preference_parameter'
  | 'shortlist_metric'
  | 'stock_metric'
  | 'account_lifecycle'
  | 'pipeline_metric'
  | 'visit_metric';

export interface ParameterMetricChange {
  id: string;
  uid?: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  metricCategory: ParameterMetricCategory;
  parameterKey: string;
  previousValue: string;
  newValue: string;
  city?: string;
  impactedMatchesCount: number;
  avgMatchedPriceLakhs?: number;
  timestampIso: string;
  syncedToCloud: boolean;
}

export interface SiteVisitBooking {
  id: string;
  uid?: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  flatId: string;
  flatName: string;
  city: City;
  visitDate: string;
  visitSlot: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAtIso: string;
}

export interface TenantHub {
  id: string;
  name: string;
  city: City;
  regionCode: string;
  address: string;
  activeAdvisors: number;
  activeProperties: number;
  totalLeads: number;
}

export type AppView =
  | 'portal-chooser'
  | 'customer-login'
  | 'customer-city-select'
  | 'customer-preferences'
  | 'customer-matching-flats'
  | 'customer-flat-detail'
  | 'customer-developer-stocks'
  | 'agent-login'
  | 'agent-flats'
  | 'agent-company-projects'
  | 'agent-location-leads'
  | 'agent-lead-profile'
  | 'agent-lead-dashboard';
