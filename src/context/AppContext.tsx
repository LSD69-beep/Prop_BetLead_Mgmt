import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  User as FirebaseUser,
  onIdTokenChanged,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  ADMIN_EMAIL,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import {
  City,
  DirectionZone,
  PropertyPurpose,
  Bedrooms,
  BudgetRange,
  UserRole,
  AppView,
  BuyerLead,
  LeadStatus,
  TenantHub,
  Agent,
  CustomerUser,
  ParameterMetricCategory,
  ParameterMetricChange,
  SiteVisitBooking,
} from '../types';
import {
  INITIAL_BUYER_LEADS,
  TENANT_HUBS,
  INITIAL_AGENTS,
  INITIAL_CUSTOMERS,
  FLATS_DATABASE,
  BUILDING_LOCATIONS,
} from '../data/mockData';

interface SyncableLead extends BuyerLead {
  syncedToCloud?: boolean;
}

interface SyncableCustomer extends CustomerUser {
  syncedToCloud?: boolean;
}

interface SyncableVisit extends SiteVisitBooking {
  syncedToCloud?: boolean;
}

interface AuthActionResult {
  ok: boolean;
  needsVerification?: boolean;
  error?: string;
  providerNotEnabled?: boolean;
  customer?: CustomerUser;
}

interface EmailSignUpPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  occupation: string;
  city: City;
  zone: DirectionZone;
  purpose: PropertyPurpose;
  bedrooms: Bedrooms;
  budgetRange: BudgetRange;
  requirement: string;
  preferredCompany?: string;
  preferredProject?: string;
  preferredPlace?: string;
  assignedAgent?: string;
}

interface AppContextType {
  // Firebase Auth & Unified DB State
  firebaseUser: FirebaseUser | null;
  isAuthReady: boolean;
  isAdminUser: boolean;
  isCloudSyncing: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<FirebaseUser | null>;
  signUpWithEmailPassword: (payload: EmailSignUpPayload) => Promise<AuthActionResult>;
  signInWithEmailPassword: (email: string, password: string) => Promise<AuthActionResult>;
  refreshEmailVerification: () => Promise<boolean>;
  resendVerificationEmail: () => Promise<{ ok: boolean; error?: string }>;
  signOutFirebase: () => Promise<void>;

  // Navigation & User Role
  role: UserRole;
  setRole: (r: UserRole) => void;
  currentView: AppView;
  navigate: (view: AppView, params?: Record<string, string>) => void;
  goBack: () => void;
  canGoBack: boolean;
  activeHub: TenantHub;
  setActiveHub: (hub: TenantHub) => void;
  navigationHistory: AppView[];

  // Global Directory & Unified Customer Account Registry (Agent sign-up removed)
  agents: Agent[];
  customers: CustomerUser[];
  activeCustomerId: string;
  addCustomer: (
    newCustomer: Omit<CustomerUser, 'id' | 'createdDate' | 'savedFlatIds'>,
    options?: {
      authUser?: FirebaseUser | null;
      preferredCompany?: string;
      preferredProject?: string;
      preferredPlace?: string;
    }
  ) => CustomerUser;
  assignLeadToAgent: (leadId: string, agentName: string) => void;
  selectCustomerAccount: (customerId: string) => void;
  selectAgentAccount: (agentId: string) => void;
  isDirectoryModalOpen: boolean;
  setIsDirectoryModalOpen: (open: boolean) => void;

  // Unified Parameter & Metric Telemetry
  parameterHistory: ParameterMetricChange[];
  siteVisits: SiteVisitBooking[];
  bookSiteVisit: (flatId: string, visitDate: string, visitSlot: string) => SiteVisitBooking;

  // Customer State & Parameter Setters
  customerName: string;
  setCustomerName: (name: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  selectedCity: City;
  setSelectedCity: (city: City) => void;
  selectedZone: DirectionZone | null;
  setSelectedZone: (zone: DirectionZone | null) => void;
  preferredPurpose: PropertyPurpose;
  setPreferredPurpose: (p: PropertyPurpose) => void;
  preferredBedrooms: Bedrooms;
  setPreferredBedrooms: (b: Bedrooms) => void;
  preferredBudget: BudgetRange;
  setPreferredBudget: (b: BudgetRange) => void;
  selectedFlatId: string;
  setSelectedFlatId: (id: string) => void;
  selectedDeveloperId: string;
  setSelectedDeveloperId: (id: string) => void;
  followedStocks: Record<string, boolean>;
  toggleFollowStock: (id: string) => void;
  savedFlatIds: string[];
  toggleSaveFlat: (id: string) => void;

  // Agent State
  agentName: string;
  setAgentName: (name: string) => void;
  agentPartnerId: string;
  setAgentPartnerId: (id: string) => void;
  selectedCompany: string;
  setSelectedCompany: (company: string) => void;
  selectedProjectName: string;
  setSelectedProjectName: (project: string) => void;
  selectedProjectPlace: string;
  setSelectedProjectPlace: (place: string) => void;
  selectedBuyerId: string;
  setSelectedBuyerId: (id: string) => void;
  buyerLeads: BuyerLead[];
  updateLeadStatus: (leadId: string, status: LeadStatus, newProb?: number) => void;
  updateLeadProbability: (leadId: string, prob: number) => void;
  addLeadNote: (leadId: string, noteText: string) => void;
  addNewLead: (lead: Omit<BuyerLead, 'id' | 'lastActivityDate'>) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function budgetRangeToLakhs(budget: BudgetRange): number {
  switch (budget) {
    case '< 50 Lakhs':
      return 45;
    case '50L – 1 Cr':
      return 85;
    case '1 Cr – 2 Cr':
      return 165;
    case '> 2 Cr':
      return 280;
    default:
      return 160;
  }
}

export function computeMatchedAnalytics(
  city: City,
  zone: DirectionZone | null,
  purpose: PropertyPurpose,
  bedrooms: Bedrooms,
  budget: BudgetRange
): { count: number; avgPriceLakhs: number } {
  const maxBudget =
    budget === '< 50 Lakhs'
      ? 55
      : budget === '50L – 1 Cr'
      ? 110
      : budget === '1 Cr – 2 Cr'
      ? 220
      : 2000;

  let matched = FLATS_DATABASE.filter((f) => {
    const cityOk = f.city === city;
    const zoneOk = !zone || zone === 'Advice' || f.zone === zone;
    const bhkOk = f.bedrooms === bedrooms;
    const budgetOk = f.priceNum <= maxBudget;
    const purposeOk = f.purpose === purpose || purpose === 'Own';
    return cityOk && zoneOk && bhkOk && budgetOk && purposeOk;
  });

  if (matched.length === 0) {
    matched = FLATS_DATABASE.filter(
      (f) => f.city === city && (!zone || zone === 'Advice' || f.zone === zone)
    );
  }
  if (matched.length === 0) {
    matched = FLATS_DATABASE.filter((f) => f.city === city);
  }

  const avgPriceLakhs =
    matched.length > 0
      ? Math.round(matched.reduce((sum, f) => sum + f.priceNum, 0) / matched.length)
      : 0;

  return { count: matched.length, avgPriceLakhs };
}

export function resolveRecommendedProject(
  city: City,
  zone: DirectionZone | null,
  bedrooms: Bedrooms,
  budget: BudgetRange,
  preferredCompany?: string,
  preferredProject?: string,
  preferredPlace?: string
): { company: string; project: string; place: string } {
  if (preferredCompany && preferredProject) {
    const matchedFlat = FLATS_DATABASE.find(
      (f) => f.company === preferredCompany && f.name === preferredProject
    );
    const matchedBldg = BUILDING_LOCATIONS.find(
      (b) => b.companyName === preferredCompany && b.name === preferredProject
    );
    return {
      company: preferredCompany,
      project: preferredProject,
      place: preferredPlace || matchedFlat?.locality || matchedBldg?.place || `${zone || 'East'} ${city}`,
    };
  }

  const maxBudget =
    budget === '< 50 Lakhs'
      ? 55
      : budget === '50L – 1 Cr'
      ? 110
      : budget === '1 Cr – 2 Cr'
      ? 220
      : 2000;

  const cityFlats = FLATS_DATABASE.filter((f) => f.city === city);
  const scored = cityFlats
    .map((f) => {
      let score = 0;
      if (!zone || zone === 'Advice' || f.zone === zone) score += 3;
      if (f.bedrooms === bedrooms) score += 2;
      if (f.priceNum <= maxBudget) score += 2;
      return { flat: f, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.flat;
  if (best) {
    return {
      company: best.company,
      project: best.name,
      place: best.locality,
    };
  }

  return {
    company: 'Sobha Limited',
    project: 'Sobha Neopolis',
    place: `${zone || 'East'} ${city}`,
  };
}

function mapFirebaseAuthError(err: unknown): { message: string; code: string; providerNotEnabled: boolean } {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: unknown }).code || '')
      : '';
  const rawMsg = err instanceof Error ? err.message : 'Authentication request failed';

  switch (code) {
    case 'auth/email-already-in-use':
      return {
        code,
        providerNotEnabled: false,
        message: 'An account with this email address already exists. Please switch to Sign In or use Google.',
      };
    case 'auth/invalid-email':
      return {
        code,
        providerNotEnabled: false,
        message: 'Please enter a valid email address.',
      };
    case 'auth/weak-password':
      return {
        code,
        providerNotEnabled: false,
        message: 'Password is too weak. Use at least 8 characters with letters and numbers.',
      };
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return {
        code,
        providerNotEnabled: false,
        message: 'Incorrect email or password. Double-check your credentials or sign in with Google.',
      };
    case 'auth/too-many-requests':
      return {
        code,
        providerNotEnabled: false,
        message: 'Too many authentication attempts. Please wait a moment and try again.',
      };
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      return {
        code,
        providerNotEnabled: true,
        message:
          'Email/Password sign-in is not yet enabled in your Firebase project. Enable it in Firebase Console → Authentication → Sign-in method → Email/Password.',
      };
    case 'auth/popup-closed-by-user':
      return {
        code,
        providerNotEnabled: false,
        message: 'Google sign-in window was closed before completing authentication.',
      };
    default:
      return {
        code,
        providerNotEnabled: false,
        message: rawMsg,
      };
  }
}

const INITIAL_PARAMETER_HISTORY: ParameterMetricChange[] = [
  {
    id: 'chg-seed-1',
    customerId: 'priya',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    metricCategory: 'account_lifecycle',
    parameterKey: 'customerSignup',
    previousValue: 'Unregistered',
    newValue: 'Bangalore • East • 3 BHK • 1 Cr – 2 Cr',
    city: 'Bangalore',
    impactedMatchesCount: 4,
    avgMatchedPriceLakhs: 175,
    timestampIso: '2026-11-18T09:15:00.000Z',
    syncedToCloud: true,
  },
  {
    id: 'chg-seed-2',
    customerId: 'vikram',
    customerName: 'Vikramaditya Reddy',
    customerEmail: 'v.reddy@reddyinfra.com',
    metricCategory: 'preference_parameter',
    parameterKey: 'budgetRange',
    previousValue: '1 Cr – 2 Cr',
    newValue: '> 2 Cr',
    city: 'Hyderabad',
    impactedMatchesCount: 2,
    avgMatchedPriceLakhs: 325,
    timestampIso: '2026-11-19T14:22:00.000Z',
    syncedToCloud: true,
  },
];

function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned.length > 0 ? cleaned : `id_${Date.now()}`;
}

function toIsoString(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Firebase Auth
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  const isAdminUser = Boolean(
    firebaseUser && firebaseUser.email === ADMIN_EMAIL && firebaseUser.emailVerified
  );

  // Navigation & Role
  const [role, setRoleState] = useState<UserRole>(null);
  const [currentView, setCurrentViewState] = useState<AppView>('portal-chooser');

  const [navigationHistory, setNavigationHistory] = useState<AppView[]>(['portal-chooser']);
  const [activeHub, setActiveHub] = useState<TenantHub>(TENANT_HUBS[0]);

  // Global Directory: Read-only Advisors + Persistent Customers
  const [agents] = useState<Agent[]>(INITIAL_AGENTS);

  const [customers, setCustomers] = useState<SyncableCustomer[]>(() => {
    try {
      const saved = localStorage.getItem('gw_customers');
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [activeCustomerId, setActiveCustomerId] = useState<string>(() => {
    return localStorage.getItem('gw_active_cust_id') || 'priya';
  });

  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);

  // Customer State
  const [customerName, setCustomerName] = useState<string>(() => {
    return localStorage.getItem('gw_cust_name') || 'Priya Sharma';
  });
  const [customerEmail, setCustomerEmail] = useState<string>(() => {
    return localStorage.getItem('gw_cust_email') || 'priya.sharma@example.com';
  });
  const [selectedCity, setSelectedCityState] = useState<City>(() => {
    return (localStorage.getItem('gw_city') as City) || 'Bangalore';
  });
  const [selectedZone, setSelectedZoneState] = useState<DirectionZone | null>(() => {
    return (localStorage.getItem('gw_zone') as DirectionZone) || 'East';
  });
  const [preferredPurpose, setPreferredPurposeState] = useState<PropertyPurpose>(() => {
    return (localStorage.getItem('gw_purpose') as PropertyPurpose) || 'Own';
  });
  const [preferredBedrooms, setPreferredBedroomsState] = useState<Bedrooms>(() => {
    return (localStorage.getItem('gw_bedrooms') as Bedrooms) || '3 BHK';
  });
  const [preferredBudget, setPreferredBudgetState] = useState<BudgetRange>(() => {
    return (localStorage.getItem('gw_budget') as BudgetRange) || '1 Cr – 2 Cr';
  });

  const [selectedFlatId, setSelectedFlatId] = useState<string>('blr-1');
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<string>('PRESTIGE');

  const [followedStocks, setFollowedStocks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('gw_followed_stocks');
      return saved ? JSON.parse(saved) : { PRESTIGE: true };
    } catch {
      return { PRESTIGE: true };
    }
  });

  const [savedFlatIds, setSavedFlatIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gw_saved_flats');
      return saved ? JSON.parse(saved) : ['blr-1', 'blr-sky-luminary'];
    } catch {
      return ['blr-1', 'blr-sky-luminary'];
    }
  });

  // Parameter & Metric History + Site Visits
  const [parameterHistory, setParameterHistory] = useState<ParameterMetricChange[]>(() => {
    try {
      const saved = localStorage.getItem('gw_param_history');
      return saved ? JSON.parse(saved) : INITIAL_PARAMETER_HISTORY;
    } catch {
      return INITIAL_PARAMETER_HISTORY;
    }
  });

  const [siteVisits, setSiteVisits] = useState<SyncableVisit[]>(() => {
    try {
      const saved = localStorage.getItem('gw_site_visits');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Agent State
  const [agentName, setAgentName] = useState<string>(() => {
    return localStorage.getItem('gw_agent_name') || 'Vikramaditya (Senior Advisor)';
  });
  const [agentPartnerId, setAgentPartnerId] = useState<string>(() => {
    return localStorage.getItem('gw_agent_partner_id') || 'GW-RERA-2048';
  });
  const [selectedCompany, setSelectedCompany] = useState<string>('Sobha Limited');
  const [selectedProjectName, setSelectedProjectName] = useState<string>('Sobha Neopolis');
  const [selectedProjectPlace, setSelectedProjectPlace] = useState<string>(
    'Panathur Road, East Bengaluru'
  );
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('rohan');

  const [buyerLeads, setBuyerLeads] = useState<SyncableLead[]>(() => {
    try {
      const saved = localStorage.getItem('gw_buyer_leads');
      return saved ? JSON.parse(saved) : INITIAL_BUYER_LEADS;
    } catch {
      return INITIAL_BUYER_LEADS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      if (role) localStorage.setItem('gw_role', role);
      localStorage.setItem('gw_view', currentView);
      localStorage.setItem('gw_active_cust_id', activeCustomerId);
      localStorage.setItem('gw_city', selectedCity);
      if (selectedZone) localStorage.setItem('gw_zone', selectedZone);
      localStorage.setItem('gw_purpose', preferredPurpose);
      localStorage.setItem('gw_bedrooms', preferredBedrooms);
      localStorage.setItem('gw_budget', preferredBudget);
      localStorage.setItem('gw_followed_stocks', JSON.stringify(followedStocks));
      localStorage.setItem('gw_saved_flats', JSON.stringify(savedFlatIds));
      localStorage.setItem('gw_param_history', JSON.stringify(parameterHistory));
      localStorage.setItem('gw_site_visits', JSON.stringify(siteVisits));
      localStorage.setItem('gw_buyer_leads', JSON.stringify(buyerLeads));
      localStorage.setItem('gw_cust_name', customerName);
      localStorage.setItem('gw_cust_email', customerEmail);
      localStorage.setItem('gw_agent_name', agentName);
      localStorage.setItem('gw_agent_partner_id', agentPartnerId);
      localStorage.setItem('gw_customers', JSON.stringify(customers));
    } catch {
      // ignore quota errors
    }
  }, [
    role,
    currentView,
    activeCustomerId,
    selectedCity,
    selectedZone,
    preferredPurpose,
    preferredBedrooms,
    preferredBudget,
    followedStocks,
    savedFlatIds,
    parameterHistory,
    siteVisits,
    buyerLeads,
    customerName,
    customerEmail,
    agentName,
    agentPartnerId,
    customers,
  ]);

  // Helper to build exact Firestore customer payload (no undefined keys)
  const buildCustomerDoc = useCallback(
    (c: CustomerUser, ownerUid: string, isCreate: boolean) => {
      const stockKeys = c.followedStocks || [];
      const base: Record<string, unknown> = {
        id: sanitizeId(c.id),
        uid: ownerUid,
        name: (c.name || 'Buyer').slice(0, 120),
        email: (c.email || 'buyer@example.com').slice(0, 180),
        phone: (c.phone || '+91 98450 12345').slice(0, 32),
        city: c.city,
        zone: c.zone || 'East',
        purpose: c.purpose,
        preferredBedrooms: c.preferredBedrooms,
        budgetRange: c.budgetRange,
        budgetNum: c.budgetNum || budgetRangeToLakhs(c.budgetRange),
        occupation: (c.occupation || 'Private Executive').slice(0, 180),
        requirement: (c.requirement || `${c.preferredBedrooms} • ${c.budgetRange}`).slice(0, 300),
        savedFlatIds: (c.savedFlatIds || []).slice(0, 50).map((s) => s.slice(0, 64)),
        followedStocks: stockKeys.slice(0, 20).map((s) => s.slice(0, 64)),
        assignedAgent: (c.assignedAgent || 'Vikramaditya (Senior Advisor)').slice(0, 120),
        createdDate: (c.createdDate || new Date().toLocaleDateString()).slice(0, 64),
        updatedAt: serverTimestamp(),
      };
      if (isCreate) {
        base.createdAt = serverTimestamp();
      }
      return base;
    },
    []
  );

  // Helper to build exact Firestore parameter change payload
  const buildParamChangeDoc = useCallback(
    (chg: ParameterMetricChange, ownerUid: string) => ({
      id: sanitizeId(chg.id),
      uid: ownerUid,
      customerId: sanitizeId(chg.customerId),
      customerName: (chg.customerName || 'Buyer').slice(0, 120),
      customerEmail: (chg.customerEmail || 'buyer@example.com').slice(0, 180),
      metricCategory: chg.metricCategory,
      parameterKey: chg.parameterKey.slice(0, 64),
      previousValue: String(chg.previousValue || 'None').slice(0, 240),
      newValue: String(chg.newValue || 'None').slice(0, 240),
      city: (chg.city || 'Bangalore').slice(0, 64),
      impactedMatchesCount: Math.max(0, Math.min(1000, chg.impactedMatchesCount)),
      avgMatchedPriceLakhs: Math.max(0, Math.min(10000, chg.avgMatchedPriceLakhs ?? 0)),
      createdAt: serverTimestamp(),
    }),
    []
  );

  // Helper to build exact Firestore buyer lead payload
  const buildBuyerLeadDoc = useCallback((lead: BuyerLead, ownerUid: string, isCreate: boolean) => {
    const base: Record<string, unknown> = {
      id: sanitizeId(lead.id),
      uid: ownerUid,
      name: (lead.name || 'Buyer Lead').slice(0, 120),
      email: (lead.email || 'lead@example.com').slice(0, 180),
      phone: (lead.phone || '+91 98450 12345').slice(0, 32),
      requirement: (lead.requirement || '3 BHK • ₹1 Cr – 2 Cr').slice(0, 300),
      status: lead.status,
      probability: Math.max(0, Math.min(100, Math.round(lead.probability))),
      occupation: (lead.occupation || 'Executive').slice(0, 180),
      city: (lead.city || 'Bengaluru').slice(0, 120),
      contactTime: (lead.contactTime || 'Weekdays after 6 PM').slice(0, 120),
      family: (lead.family || 'Family Buyer').slice(0, 120),
      purpose: (lead.purpose || 'Own / Self-Use').slice(0, 80),
      config: (lead.config || '3 BHK').slice(0, 120),
      budget: (lead.budget || '1 Cr – 2 Cr').slice(0, 80),
      budgetNum: Math.max(0, Math.min(10000, lead.budgetNum || 150)),
      loan: (lead.loan || 'Evaluating Options').slice(0, 120),
      possession: (lead.possession || 'Flexible').slice(0, 80),
      notes: (lead.notes || '').slice(0, 4000),
      company: (lead.company || 'GlassWindow Direct Portfolio').slice(0, 160),
      project: (lead.project || 'Premier Living').slice(0, 160),
      place: (lead.place || 'East Corridor').slice(0, 160),
      assignedAgent: (lead.assignedAgent || 'Vikramaditya (Senior Advisor)').slice(0, 120),
      lastActivityDate: (lead.lastActivityDate || 'Just now').slice(0, 64),
      updatedAt: serverTimestamp(),
    };
    if (isCreate) {
      base.createdAt = serverTimestamp();
    }
    return base;
  }, []);

  // Helper to build exact Firestore site visit payload
  const buildSiteVisitDoc = useCallback((v: SiteVisitBooking, ownerUid: string) => ({
    id: sanitizeId(v.id),
    uid: ownerUid,
    customerId: sanitizeId(v.customerId),
    customerName: (v.customerName || 'Buyer').slice(0, 120),
    customerEmail: (v.customerEmail || 'buyer@example.com').slice(0, 180),
    flatId: v.flatId.slice(0, 64),
    flatName: v.flatName.slice(0, 160),
    city: v.city,
    visitDate: v.visitDate.slice(0, 32),
    visitSlot: v.visitSlot.slice(0, 32),
    status: 'Scheduled',
    createdAt: serverTimestamp(),
  }), []);

  // Keep refs to flush queued local mutations when Firebase Auth signs in
  const customersRef = useRef(customers);
  const paramHistoryRef = useRef(parameterHistory);
  const buyerLeadsRef = useRef(buyerLeads);
  const siteVisitsRef = useRef(siteVisits);

  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);
  useEffect(() => {
    paramHistoryRef.current = parameterHistory;
  }, [parameterHistory]);
  useEffect(() => {
    buyerLeadsRef.current = buyerLeads;
  }, [buyerLeads]);
  useEffect(() => {
    siteVisitsRef.current = siteVisits;
  }, [siteVisits]);

  // Listen to Firebase Auth + flush pending local changes + attach Firestore listeners
  useEffect(() => {
    let unsubCustomers: (() => void) | null = null;
    let unsubChanges: (() => void) | null = null;
    let unsubLeads: (() => void) | null = null;
    let unsubVisits: (() => void) | null = null;

    const cleanupListeners = () => {
      unsubCustomers?.();
      unsubChanges?.();
      unsubLeads?.();
      unsubVisits?.();
      unsubCustomers = null;
      unsubChanges = null;
      unsubLeads = null;
      unsubVisits = null;
    };

    let activeListenerKey: string | null = null;

    const unsubAuth = onIdTokenChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsAuthReady(true);

      if (!user || !user.emailVerified) {
        activeListenerKey = null;
        cleanupListeners();
        return;
      }

      const nextKey = `${user.uid}:${user.emailVerified}`;
      if (activeListenerKey === nextKey) {
        return;
      }
      activeListenerKey = nextKey;
      cleanupListeners();

      const adminMode = user.email === ADMIN_EMAIL;
      setIsCloudSyncing(true);

      // Flush queued local records created before Google Sign-In
      try {
        const pendingCusts = customersRef.current.filter((c) => c.syncedToCloud === false);
        for (const c of pendingCusts) {
          const id = sanitizeId(c.id);
          await setDoc(doc(db, 'customers', id), buildCustomerDoc(c, user.uid, true));
        }
        if (pendingCusts.length > 0) {
          setCustomers((prev) =>
            prev.map((c) => (c.syncedToCloud === false ? { ...c, uid: user.uid, syncedToCloud: true } : c))
          );
        }

        const pendingChanges = paramHistoryRef.current.filter((p) => p.syncedToCloud === false);
        for (const chg of pendingChanges) {
          const id = sanitizeId(chg.id);
          await setDoc(doc(db, 'parameterChanges', id), buildParamChangeDoc(chg, user.uid));
        }
        if (pendingChanges.length > 0) {
          setParameterHistory((prev) =>
            prev.map((p) => (p.syncedToCloud === false ? { ...p, uid: user.uid, syncedToCloud: true } : p))
          );
        }

        const pendingLeads = buyerLeadsRef.current.filter((l) => l.syncedToCloud === false);
        for (const lead of pendingLeads) {
          const id = sanitizeId(lead.id);
          await setDoc(doc(db, 'buyerLeads', id), buildBuyerLeadDoc(lead, user.uid, true));
        }
        if (pendingLeads.length > 0) {
          setBuyerLeads((prev) =>
            prev.map((l) => (l.syncedToCloud === false ? { ...l, uid: user.uid, syncedToCloud: true } : l))
          );
        }

        const pendingVisits = siteVisitsRef.current.filter((v) => v.syncedToCloud === false);
        for (const visit of pendingVisits) {
          const id = sanitizeId(visit.id);
          await setDoc(doc(db, 'siteVisits', id), buildSiteVisitDoc(visit, user.uid));
        }
        if (pendingVisits.length > 0) {
          setSiteVisits((prev) =>
            prev.map((v) => (v.syncedToCloud === false ? { ...v, uid: user.uid, syncedToCloud: true } : v))
          );
        }
      } catch (err) {
        console.warn('Queued sync notice:', err);
      }

      // Attach live listeners (scoped by uid unless adminMode)
      const customersQuery = adminMode
        ? query(collection(db, 'customers'))
        : query(collection(db, 'customers'), where('uid', '==', user.uid));

      unsubCustomers = onSnapshot(
        customersQuery,
        (snap) => {
          const cloudCusts: SyncableCustomer[] = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id || d.id,
              uid: data.uid,
              name: data.name,
              email: data.email,
              phone: data.phone || '',
              city: data.city,
              zone: data.zone,
              purpose: data.purpose,
              preferredBedrooms: data.preferredBedrooms,
              budgetRange: data.budgetRange,
              budgetNum: data.budgetNum,
              occupation: data.occupation || '',
              requirement: data.requirement || '',
              savedFlatIds: data.savedFlatIds || [],
              followedStocks: data.followedStocks || [],
              createdDate: data.createdDate || 'Cloud Synced',
              assignedAgent: data.assignedAgent,
              syncedToCloud: true,
            };
          });

          setCustomers((prev) => {
            const byId = new Map<string, SyncableCustomer>();
            cloudCusts.forEach((c) => byId.set(c.id, c));
            prev.forEach((c) => {
              if (!byId.has(c.id)) byId.set(c.id, c);
            });
            return Array.from(byId.values());
          });

          // Hydrate active customer profile from Firestore when signing in as that user
          const ownCloudCustomer =
            cloudCusts.find((c) => c.uid === user.uid) ||
            cloudCusts.find(
              (c) => user.email && c.email.toLowerCase() === user.email.toLowerCase()
            );
          if (ownCloudCustomer) {
            setActiveCustomerId(ownCloudCustomer.id);
            setCustomerName(ownCloudCustomer.name);
            setCustomerEmail(ownCloudCustomer.email);
            setSelectedCityState(ownCloudCustomer.city);
            setSelectedZoneState(ownCloudCustomer.zone);
            setPreferredPurposeState(ownCloudCustomer.purpose);
            setPreferredBedroomsState(ownCloudCustomer.preferredBedrooms);
            setPreferredBudgetState(ownCloudCustomer.budgetRange);
            setSavedFlatIds(ownCloudCustomer.savedFlatIds || []);
            if (ownCloudCustomer.followedStocks && ownCloudCustomer.followedStocks.length > 0) {
              const stockMap: Record<string, boolean> = {};
              ownCloudCustomer.followedStocks.forEach((s) => {
                stockMap[s] = true;
              });
              setFollowedStocks(stockMap);
            }
          }

          setIsCloudSyncing(false);
        },
        (err) => {
          setIsCloudSyncing(false);
          handleFirestoreError(err, OperationType.LIST, 'customers');
        }
      );

      const changesQuery = adminMode
        ? query(collection(db, 'parameterChanges'))
        : query(collection(db, 'parameterChanges'), where('uid', '==', user.uid));

      unsubChanges = onSnapshot(
        changesQuery,
        (snap) => {
          const cloudChanges: ParameterMetricChange[] = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id || d.id,
              uid: data.uid,
              customerId: data.customerId,
              customerName: data.customerName,
              customerEmail: data.customerEmail,
              metricCategory: data.metricCategory,
              parameterKey: data.parameterKey,
              previousValue: data.previousValue,
              newValue: data.newValue,
              city: data.city,
              impactedMatchesCount: data.impactedMatchesCount ?? 0,
              avgMatchedPriceLakhs: data.avgMatchedPriceLakhs ?? 0,
              timestampIso: toIsoString(data.createdAt),
              syncedToCloud: true,
            };
          });

          setParameterHistory((prev) => {
            const byId = new Map<string, ParameterMetricChange>();
            cloudChanges.forEach((c) => byId.set(c.id, c));
            prev.forEach((c) => {
              if (!byId.has(c.id)) byId.set(c.id, c);
            });
            return Array.from(byId.values()).sort(
              (a, b) => new Date(b.timestampIso).getTime() - new Date(a.timestampIso).getTime()
            );
          });
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'parameterChanges');
        }
      );

      const leadsQuery = adminMode
        ? query(collection(db, 'buyerLeads'))
        : query(collection(db, 'buyerLeads'), where('uid', '==', user.uid));

      unsubLeads = onSnapshot(
        leadsQuery,
        (snap) => {
          const cloudLeads: SyncableLead[] = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id || d.id,
              uid: data.uid,
              name: data.name,
              email: data.email,
              phone: data.phone,
              requirement: data.requirement,
              status: data.status,
              probability: data.probability,
              occupation: data.occupation || '',
              city: data.city || '',
              contactTime: data.contactTime || '',
              family: data.family || '',
              purpose: data.purpose || '',
              config: data.config || '',
              budget: data.budget || '',
              budgetNum: data.budgetNum || 150,
              loan: data.loan || '',
              possession: data.possession || '',
              notes: data.notes || '',
              company: data.company,
              project: data.project,
              place: data.place || '',
              assignedAgent: data.assignedAgent,
              lastActivityDate: data.lastActivityDate || 'Synced',
              syncedToCloud: true,
            };
          });

          setBuyerLeads((prev) => {
            const byId = new Map<string, SyncableLead>();
            cloudLeads.forEach((l) => byId.set(l.id, l));
            prev.forEach((l) => {
              if (!byId.has(l.id)) byId.set(l.id, l);
            });
            return Array.from(byId.values());
          });
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'buyerLeads');
        }
      );

      const visitsQuery = adminMode
        ? query(collection(db, 'siteVisits'))
        : query(collection(db, 'siteVisits'), where('uid', '==', user.uid));

      unsubVisits = onSnapshot(
        visitsQuery,
        (snap) => {
          const cloudVisits: SyncableVisit[] = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: data.id || d.id,
              uid: data.uid,
              customerId: data.customerId,
              customerName: data.customerName,
              customerEmail: data.customerEmail,
              flatId: data.flatId,
              flatName: data.flatName,
              city: data.city || 'Bangalore',
              visitDate: data.visitDate,
              visitSlot: data.visitSlot,
              status: data.status || 'Scheduled',
              createdAtIso: toIsoString(data.createdAt),
              syncedToCloud: true,
            };
          });

          setSiteVisits((prev) => {
            const byId = new Map<string, SyncableVisit>();
            cloudVisits.forEach((v) => byId.set(v.id, v));
            prev.forEach((v) => {
              if (!byId.has(v.id)) byId.set(v.id, v);
            });
            return Array.from(byId.values()).sort(
              (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime()
            );
          });
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'siteVisits');
        }
      );
    });

    return () => {
      unsubAuth();
      cleanupListeners();
    };
  }, [buildBuyerLeadDoc, buildCustomerDoc, buildParamChangeDoc, buildSiteVisitDoc]);

  const clearAuthError = () => setAuthError(null);

  const flushPendingRecordsForUser = useCallback(
    async (user: FirebaseUser) => {
      if (!user.emailVerified) return;
      setIsCloudSyncing(true);
      try {
        const pendingCusts = customersRef.current.filter((c) => c.syncedToCloud === false);
        for (const c of pendingCusts) {
          const id = sanitizeId(c.id);
          await setDoc(doc(db, 'customers', id), buildCustomerDoc(c, user.uid, true));
        }
        if (pendingCusts.length > 0) {
          setCustomers((prev) =>
            prev.map((c) =>
              c.syncedToCloud === false ? { ...c, uid: user.uid, syncedToCloud: true } : c
            )
          );
        }

        const pendingChanges = paramHistoryRef.current.filter((p) => p.syncedToCloud === false);
        for (const chg of pendingChanges) {
          const id = sanitizeId(chg.id);
          await setDoc(doc(db, 'parameterChanges', id), buildParamChangeDoc(chg, user.uid));
        }
        if (pendingChanges.length > 0) {
          setParameterHistory((prev) =>
            prev.map((p) =>
              p.syncedToCloud === false ? { ...p, uid: user.uid, syncedToCloud: true } : p
            )
          );
        }

        const pendingLeads = buyerLeadsRef.current.filter((l) => l.syncedToCloud === false);
        for (const lead of pendingLeads) {
          const id = sanitizeId(lead.id);
          await setDoc(doc(db, 'buyerLeads', id), buildBuyerLeadDoc(lead, user.uid, true));
        }
        if (pendingLeads.length > 0) {
          setBuyerLeads((prev) =>
            prev.map((l) =>
              l.syncedToCloud === false ? { ...l, uid: user.uid, syncedToCloud: true } : l
            )
          );
        }

        const pendingVisits = siteVisitsRef.current.filter((v) => v.syncedToCloud === false);
        for (const visit of pendingVisits) {
          const id = sanitizeId(visit.id);
          await setDoc(doc(db, 'siteVisits', id), buildSiteVisitDoc(visit, user.uid));
        }
        if (pendingVisits.length > 0) {
          setSiteVisits((prev) =>
            prev.map((v) =>
              v.syncedToCloud === false ? { ...v, uid: user.uid, syncedToCloud: true } : v
            )
          );
        }
      } catch (err) {
        console.warn('Manual flush notice:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    },
    [buildBuyerLeadDoc, buildCustomerDoc, buildParamChangeDoc, buildSiteVisitDoc]
  );

  const signInWithGoogle = async (): Promise<FirebaseUser | null> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err: unknown) {
      const mapped = mapFirebaseAuthError(err);
      setAuthError(mapped.message);
      return null;
    }
  };

  const signInWithEmailPassword = async (
    emailInput: string,
    passwordInput: string
  ): Promise<AuthActionResult> => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      const user = cred.user;
      setRole('customer');

      // Hydrate from existing local/synced customer record if available before onSnapshot resolves
      const existing = customersRef.current.find(
        (c) => c.uid === user.uid || c.email.toLowerCase() === (user.email || '').toLowerCase()
      );
      if (existing) {
        setActiveCustomerId(existing.id);
        setCustomerName(existing.name);
        setCustomerEmail(existing.email);
        setSelectedCityState(existing.city);
        setSelectedZoneState(existing.zone);
        setPreferredPurposeState(existing.purpose);
        setPreferredBedroomsState(existing.preferredBedrooms);
        setPreferredBudgetState(existing.budgetRange);
        setSavedFlatIds(existing.savedFlatIds || []);
      } else {
        setCustomerName(user.displayName || emailInput.split('@')[0]);
        setCustomerEmail(user.email || emailInput.trim());
      }

      if (user.emailVerified) {
        await flushPendingRecordsForUser(user);
      }

      return {
        ok: true,
        needsVerification: !user.emailVerified,
        customer: existing,
      };
    } catch (err: unknown) {
      const mapped = mapFirebaseAuthError(err);
      setAuthError(mapped.message);
      return {
        ok: false,
        error: mapped.message,
        providerNotEnabled: mapped.providerNotEnabled,
      };
    }
  };

  const refreshEmailVerification = async (): Promise<boolean> => {
    const current = auth.currentUser;
    if (!current) return false;
    try {
      await current.reload();
      const reloaded = auth.currentUser;
      if (reloaded?.emailVerified) {
        await reloaded.getIdToken(true);
        setFirebaseUser({ ...reloaded } as FirebaseUser);
        await flushPendingRecordsForUser(reloaded);
        return true;
      }
      setFirebaseUser(reloaded ? ({ ...reloaded } as FirebaseUser) : null);
      return false;
    } catch {
      return false;
    }
  };

  const resendVerificationEmail = async (): Promise<{ ok: boolean; error?: string }> => {
    const current = auth.currentUser;
    if (!current) {
      return { ok: false, error: 'No signed-in Firebase account found.' };
    }
    try {
      await sendEmailVerification(current);
      return { ok: true };
    } catch (err: unknown) {
      const mapped = mapFirebaseAuthError(err);
      return { ok: false, error: mapped.message };
    }
  };

  const signOutFirebase = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch {
      // ignore sign-out errors
    }
  };

  // Core Unified Parameter Change Logger + Active Customer Record Sync
  const recordParameterChange = useCallback(
    (
      metricCategory: ParameterMetricCategory,
      parameterKey: string,
      previousValue: string,
      newValue: string,
      overrides?: {
        city?: City;
        zone?: DirectionZone | null;
        purpose?: PropertyPurpose;
        bedrooms?: Bedrooms;
        budget?: BudgetRange;
        savedFlatIds?: string[];
        followedStocks?: Record<string, boolean>;
        customerId?: string;
        customerName?: string;
        customerEmail?: string;
      }
    ) => {
      const nextCity = overrides?.city ?? selectedCity;
      const nextZone = overrides?.zone !== undefined ? overrides.zone : selectedZone;
      const nextPurpose = overrides?.purpose ?? preferredPurpose;
      const nextBedrooms = overrides?.bedrooms ?? preferredBedrooms;
      const nextBudget = overrides?.budget ?? preferredBudget;
      const nextSaved = overrides?.savedFlatIds ?? savedFlatIds;
      const nextFollowed = overrides?.followedStocks ?? followedStocks;

      const analytics = computeMatchedAnalytics(
        nextCity,
        nextZone,
        nextPurpose,
        nextBedrooms,
        nextBudget
      );

      const targetCustId = overrides?.customerId ?? activeCustomerId;
      const targetCustName = overrides?.customerName ?? customerName;
      const targetCustEmail = overrides?.customerEmail ?? customerEmail;

      const changeId = sanitizeId(
        `chg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      );
      const isCloudReady = Boolean(firebaseUser && firebaseUser.emailVerified);

      const entry: ParameterMetricChange = {
        id: changeId,
        uid: firebaseUser?.uid,
        customerId: targetCustId,
        customerName: targetCustName,
        customerEmail: targetCustEmail,
        metricCategory,
        parameterKey,
        previousValue: String(previousValue),
        newValue: String(newValue),
        city: nextCity,
        impactedMatchesCount: analytics.count,
        avgMatchedPriceLakhs: analytics.avgPriceLakhs,
        timestampIso: new Date().toISOString(),
        syncedToCloud: isCloudReady,
      };

      setParameterHistory((prev) => [entry, ...prev.slice(0, 199)]);

      // Also update the active customer record in customers array & Firestore
      const nextBudgetNum = budgetRangeToLakhs(nextBudget);
      const nextRequirement = `${nextBedrooms} • ${nextBudget} • ${nextZone || 'East'} ${nextCity} (${nextPurpose})`;
      const followedList = Object.entries(nextFollowed)
        .filter(([, v]) => Boolean(v))
        .map(([k]) => k);

      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id !== targetCustId) return c;
          return {
            ...c,
            city: nextCity,
            zone: nextZone || 'East',
            purpose: nextPurpose,
            preferredBedrooms: nextBedrooms,
            budgetRange: nextBudget,
            budgetNum: nextBudgetNum,
            requirement: nextRequirement,
            savedFlatIds: nextSaved,
            followedStocks: followedList,
            syncedToCloud: isCloudReady ? true : c.syncedToCloud,
          };
        })
      );

      // Update corresponding buyerLead if owned or admin
      setBuyerLeads((prev) =>
        prev.map((l) => {
          if (l.id !== targetCustId) return l;
          return {
            ...l,
            requirement: nextRequirement,
            city: `${nextZone || 'East'} ${nextCity}`,
            purpose: nextPurpose === 'Own' ? 'Own / Self-Use' : 'Investment / Rental',
            config: `${nextBedrooms} • ${nextZone || 'East'} Facing`,
            budget: nextBudget,
            budgetNum: nextBudgetNum,
            lastActivityDate: 'Just now',
          };
        })
      );

      if (isCloudReady && firebaseUser) {
        void setDoc(
          doc(db, 'parameterChanges', changeId),
          buildParamChangeDoc(entry, firebaseUser.uid)
        ).catch((err) => handleFirestoreError(err, OperationType.CREATE, 'parameterChanges'));

        // Sync active customer doc if it belongs to this Firebase user or is admin
        const targetCust = customersRef.current.find((c) => c.id === targetCustId);
        if (targetCust && (targetCust.uid === firebaseUser.uid || isAdminUser)) {
          const safeCustId = sanitizeId(targetCustId);
          void updateDoc(doc(db, 'customers', safeCustId), {
            city: nextCity,
            zone: nextZone || 'East',
            purpose: nextPurpose,
            preferredBedrooms: nextBedrooms,
            budgetRange: nextBudget,
            budgetNum: nextBudgetNum,
            requirement: nextRequirement.slice(0, 300),
            savedFlatIds: nextSaved.slice(0, 50).map((s) => s.slice(0, 64)),
            followedStocks: followedList.slice(0, 20).map((s) => s.slice(0, 64)),
            updatedAt: serverTimestamp(),
          }).catch((err) => console.warn('Customer update notice:', err));
        }

        const targetLead = buyerLeadsRef.current.find((l) => l.id === targetCustId);
        if (
          targetLead &&
          (targetLead.uid === firebaseUser.uid || isAdminUser) &&
          targetLead.status !== 'Closed / Dropped'
        ) {
          const safeLeadId = sanitizeId(targetCustId);
          void updateDoc(doc(db, 'buyerLeads', safeLeadId), {
            requirement: nextRequirement.slice(0, 300),
            city: `${nextZone || 'East'} ${nextCity}`.slice(0, 120),
            purpose: nextPurpose === 'Own' ? 'Own / Self-Use' : 'Investment / Rental',
            config: `${nextBedrooms} • ${nextZone || 'East'} Facing`.slice(0, 120),
            budget: nextBudget.slice(0, 80),
            budgetNum: nextBudgetNum,
            lastActivityDate: 'Just now',
            updatedAt: serverTimestamp(),
          }).catch((err) => console.warn('Lead parameter update notice:', err));
        }
      }
    },
    [
      activeCustomerId,
      buildParamChangeDoc,
      customerEmail,
      customerName,
      firebaseUser,
      followedStocks,
      isAdminUser,
      preferredBedrooms,
      preferredBudget,
      preferredPurpose,
      savedFlatIds,
      selectedCity,
      selectedZone,
    ]
  );

  // Tracked Parameter Setters
  const setSelectedCity = (city: City) => {
    if (city === selectedCity) return;
    const prevVal = selectedCity;
    setSelectedCityState(city);
    recordParameterChange('location_parameter', 'city', prevVal, city, { city });
  };

  const setSelectedZone = (zone: DirectionZone | null) => {
    if (zone === selectedZone) return;
    const prevVal = selectedZone || 'None';
    setSelectedZoneState(zone);
    recordParameterChange('location_parameter', 'zone', prevVal, zone || 'None', { zone });
  };

  const setPreferredPurpose = (purpose: PropertyPurpose) => {
    if (purpose === preferredPurpose) return;
    const prevVal = preferredPurpose;
    setPreferredPurposeState(purpose);
    recordParameterChange('preference_parameter', 'purpose', prevVal, purpose, { purpose });
  };

  const setPreferredBedrooms = (bedrooms: Bedrooms) => {
    if (bedrooms === preferredBedrooms) return;
    const prevVal = preferredBedrooms;
    setPreferredBedroomsState(bedrooms);
    recordParameterChange('preference_parameter', 'preferredBedrooms', prevVal, bedrooms, {
      bedrooms,
    });
  };

  const setPreferredBudget = (budget: BudgetRange) => {
    if (budget === preferredBudget) return;
    const prevVal = preferredBudget;
    setPreferredBudgetState(budget);
    recordParameterChange('preference_parameter', 'budgetRange', prevVal, budget, { budget });
  };

  const setRole = (r: UserRole) => {
    setRoleState(r);
  };

  const navigate = (view: AppView, params?: Record<string, string>) => {
    if (params) {
      if (params.flatId) setSelectedFlatId(params.flatId);
      if (params.devId) setSelectedDeveloperId(params.devId);
      if (params.company) setSelectedCompany(params.company);
      if (params.project) setSelectedProjectName(params.project);
      if (params.place) setSelectedProjectPlace(params.place);
      if (params.buyerId) setSelectedBuyerId(params.buyerId);
      if (params.city) setSelectedCity(params.city as City);
    }

    setNavigationHistory((prev) => [...prev, view]);
    setCurrentViewState(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      const previous = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentViewState(previous);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (role === 'customer') {
      setCurrentViewState('customer-matching-flats');
    } else if (role === 'agent') {
      setCurrentViewState('agent-flats');
    } else {
      setCurrentViewState('portal-chooser');
    }
  };

  const canGoBack = navigationHistory.length > 1;

  const toggleFollowStock = (id: string) => {
    const nextVal = !followedStocks[id];
    const updated = { ...followedStocks, [id]: nextVal };
    setFollowedStocks(updated);
    recordParameterChange(
      'stock_metric',
      `followedStock:${id}`,
      nextVal ? 'Unfollowed' : 'Following',
      nextVal ? 'Following' : 'Unfollowed',
      { followedStocks: updated }
    );
  };

  const toggleSaveFlat = (id: string) => {
    const exists = savedFlatIds.includes(id);
    const updated = exists ? savedFlatIds.filter((item) => item !== id) : [...savedFlatIds, id];
    setSavedFlatIds(updated);
    recordParameterChange(
      'shortlist_metric',
      `shortlist:${id}`,
      exists ? 'Saved' : 'Not Saved',
      exists ? 'Removed' : 'Saved',
      { savedFlatIds: updated }
    );
  };

  const bookSiteVisit = (flatId: string, visitDate: string, visitSlot: string): SiteVisitBooking => {
    const flat = FLATS_DATABASE.find((f) => f.id === flatId) || FLATS_DATABASE[0];
    const visitId = sanitizeId(`visit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
    const isCloudReady = Boolean(firebaseUser && firebaseUser.emailVerified);

    const booking: SyncableVisit = {
      id: visitId,
      uid: firebaseUser?.uid,
      customerId: activeCustomerId,
      customerName,
      customerEmail,
      flatId: flat.id,
      flatName: flat.name,
      city: flat.city,
      visitDate,
      visitSlot,
      status: 'Scheduled',
      createdAtIso: new Date().toISOString(),
      syncedToCloud: isCloudReady,
    };

    setSiteVisits((prev) => [booking, ...prev]);

    if (isCloudReady && firebaseUser) {
      void setDoc(
        doc(db, 'siteVisits', visitId),
        buildSiteVisitDoc(booking, firebaseUser.uid)
      ).catch((err) => handleFirestoreError(err, OperationType.CREATE, 'siteVisits'));
    }

    recordParameterChange(
      'visit_metric',
      `siteVisit:${flat.id}`,
      'Not Scheduled',
      `${flat.name} on ${visitDate} @ ${visitSlot}`,
      { city: flat.city }
    );

    return booking;
  };

  const updateLeadStatus = (leadId: string, status: LeadStatus, newProb?: number) => {
    const targetLead = buyerLeads.find((l) => l.id === leadId);
    const prevStatus = targetLead?.status || 'Initial Inquiry';
    let computedProb = newProb !== undefined ? newProb : targetLead?.probability ?? 50;

    if (newProb === undefined) {
      switch (status) {
        case 'Initial Inquiry':
          computedProb = 30;
          break;
        case 'Audit Report Viewed':
          computedProb = 45;
          break;
        case 'Callback Requested':
          computedProb = 50;
          break;
        case 'Shortlisted':
          computedProb = 60;
          break;
        case 'Site Visit Scheduled':
          computedProb = 70;
          break;
        case 'Site Visit Completed':
          computedProb = 85;
          break;
        case 'Loan Pre-Approved':
          computedProb = 88;
          break;
        case 'Negotiation':
          computedProb = 92;
          break;
        case 'Advance Placed':
          computedProb = 100;
          break;
        case 'Closed / Dropped':
          computedProb = 10;
          break;
      }
    }

    const clampedProb = Math.min(100, Math.max(0, computedProb));

    setBuyerLeads((prev) =>
      prev.map((lead) =>
        lead.id !== leadId
          ? lead
          : {
              ...lead,
              status,
              probability: clampedProb,
              lastActivityDate: 'Just now',
            }
      )
    );

    if (targetLead) {
      recordParameterChange(
        'pipeline_metric',
        `leadStatus:${leadId}`,
        `${prevStatus} (${targetLead.probability}%)`,
        `${status} (${clampedProb}%)`,
        {
          customerId: leadId,
          customerName: targetLead.name,
          customerEmail: targetLead.email,
        }
      );
    }

    if (firebaseUser && firebaseUser.emailVerified && isAdminUser && targetLead?.uid) {
      void updateDoc(doc(db, 'buyerLeads', sanitizeId(leadId)), {
        status,
        probability: clampedProb,
        lastActivityDate: 'Just now',
        updatedAt: serverTimestamp(),
      }).catch((err) => console.warn('Lead status update notice:', err));
    }
  };

  const updateLeadProbability = (leadId: string, prob: number) => {
    const clamped = Math.min(100, Math.max(0, prob));
    const targetLead = buyerLeads.find((l) => l.id === leadId);
    const prevProb = targetLead?.probability ?? 50;

    setBuyerLeads((prev) =>
      prev.map((lead) =>
        lead.id !== leadId
          ? lead
          : {
              ...lead,
              probability: clamped,
              lastActivityDate: 'Just now',
            }
      )
    );

    if (targetLead) {
      recordParameterChange(
        'pipeline_metric',
        `leadProbability:${leadId}`,
        `${prevProb}%`,
        `${clamped}%`,
        {
          customerId: leadId,
          customerName: targetLead.name,
          customerEmail: targetLead.email,
        }
      );
    }

    if (firebaseUser && firebaseUser.emailVerified && isAdminUser && targetLead?.uid) {
      void updateDoc(doc(db, 'buyerLeads', sanitizeId(leadId)), {
        probability: clamped,
        lastActivityDate: 'Just now',
        updatedAt: serverTimestamp(),
      }).catch((err) => console.warn('Lead prob update notice:', err));
    }
  };

  const addLeadNote = (leadId: string, noteText: string) => {
    const targetLead = buyerLeads.find((l) => l.id === leadId);
    const updatedNotes = `${noteText} • Added by ${agentName} (${new Date().toLocaleDateString()})\n\n${targetLead?.notes || ''}`;
    setBuyerLeads((prev) =>
      prev.map((lead) =>
        lead.id !== leadId
          ? lead
          : {
              ...lead,
              notes: updatedNotes,
              lastActivityDate: 'Just now',
            }
      )
    );

    if (firebaseUser && firebaseUser.emailVerified && isAdminUser && targetLead?.uid) {
      void updateDoc(doc(db, 'buyerLeads', sanitizeId(leadId)), {
        notes: updatedNotes.slice(0, 4000),
        lastActivityDate: 'Just now',
        updatedAt: serverTimestamp(),
      }).catch((err) => console.warn('Lead note update notice:', err));
    }
  };

  const addNewLead = (newLeadData: Omit<BuyerLead, 'id' | 'lastActivityDate'>) => {
    const newId = sanitizeId(`lead_${Date.now()}`);
    const isCloudReady = Boolean(firebaseUser && firebaseUser.emailVerified);
    const fullLead: SyncableLead = {
      ...newLeadData,
      id: newId,
      uid: firebaseUser?.uid,
      lastActivityDate: 'Just now',
      syncedToCloud: isCloudReady,
    };
    setBuyerLeads((prev) => [fullLead, ...prev]);

    if (isCloudReady && firebaseUser) {
      void setDoc(
        doc(db, 'buyerLeads', newId),
        buildBuyerLeadDoc(fullLead, firebaseUser.uid, true)
      ).catch((err) => handleFirestoreError(err, OperationType.CREATE, 'buyerLeads'));
    }
  };

  const addCustomer = (
    data: Omit<CustomerUser, 'id' | 'createdDate' | 'savedFlatIds'>,
    options?: {
      authUser?: FirebaseUser | null;
      preferredCompany?: string;
      preferredProject?: string;
      preferredPlace?: string;
    }
  ): CustomerUser => {
    const effectiveAuthUser = options?.authUser !== undefined ? options.authUser : firebaseUser;
    const newCustId = sanitizeId(`cust_${Date.now()}`);
    const isCloudReady = Boolean(effectiveAuthUser && effectiveAuthUser.emailVerified);
    const followedList = Object.entries(followedStocks)
      .filter(([, v]) => Boolean(v))
      .map(([k]) => k);

    const newCustomer: SyncableCustomer = {
      ...data,
      id: newCustId,
      uid: effectiveAuthUser?.uid,
      createdDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      savedFlatIds: [],
      followedStocks: followedList,
      syncedToCloud: isCloudReady,
    };

    setCustomers((prev) => [newCustomer, ...prev]);

    // Switch active session to newly signed-up customer
    setActiveCustomerId(newCustId);
    setCustomerName(newCustomer.name);
    setCustomerEmail(newCustomer.email);
    setSelectedCityState(newCustomer.city);
    setSelectedZoneState(newCustomer.zone);
    setPreferredPurposeState(newCustomer.purpose);
    setPreferredBedroomsState(newCustomer.preferredBedrooms);
    setPreferredBudgetState(newCustomer.budgetRange);
    setSavedFlatIds([]);

    const matchedProject = resolveRecommendedProject(
      newCustomer.city,
      newCustomer.zone,
      newCustomer.preferredBedrooms,
      newCustomer.budgetRange,
      options?.preferredCompany,
      options?.preferredProject,
      options?.preferredPlace
    );

    const newLead: SyncableLead = {
      id: newCustId,
      uid: effectiveAuthUser?.uid,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone || '+91 98450 12345',
      requirement: `${newCustomer.preferredBedrooms} • ${newCustomer.budgetRange} • ${newCustomer.zone} ${newCustomer.city}`,
      status: 'Initial Inquiry',
      probability: 40,
      occupation: newCustomer.occupation || 'Verified Homebuyer',
      city: `${newCustomer.zone} ${newCustomer.city}`,
      contactTime: 'Weekdays after 6 PM',
      family: 'Registered Family Buyer',
      purpose: newCustomer.purpose === 'Own' ? 'Own / Self-Use' : 'Investment / Rental',
      config: `${newCustomer.preferredBedrooms} • ${newCustomer.zone} Facing`,
      budget: newCustomer.budgetRange,
      budgetNum: newCustomer.budgetNum || budgetRangeToLakhs(newCustomer.budgetRange),
      loan: 'Evaluating Options',
      possession: 'Flexible',
      notes: `New customer registered on ${new Date().toLocaleDateString()}. Matched to ${matchedProject.project} (${matchedProject.company}) in ${newCustomer.zone} ${newCustomer.city}. Criteria: ${newCustomer.requirement}`,
      company: matchedProject.company,
      project: matchedProject.project,
      place: matchedProject.place,
      assignedAgent: newCustomer.assignedAgent || agentName,
      lastActivityDate: 'Just now',
      syncedToCloud: isCloudReady,
    };
    setBuyerLeads((prev) => [newLead, ...prev]);

    const analytics = computeMatchedAnalytics(
      newCustomer.city,
      newCustomer.zone,
      newCustomer.purpose,
      newCustomer.preferredBedrooms,
      newCustomer.budgetRange
    );
    const chgId = sanitizeId(`chg_${Date.now()}_signup`);
    const signupChange: ParameterMetricChange = {
      id: chgId,
      uid: effectiveAuthUser?.uid,
      customerId: newCustId,
      customerName: newCustomer.name,
      customerEmail: newCustomer.email,
      metricCategory: 'account_lifecycle',
      parameterKey: 'customerSignup',
      previousValue: 'Unregistered',
      newValue: `${newCustomer.city} • ${newCustomer.zone} • ${newCustomer.preferredBedrooms} • ${newCustomer.budgetRange}`,
      city: newCustomer.city,
      impactedMatchesCount: analytics.count,
      avgMatchedPriceLakhs: analytics.avgPriceLakhs,
      timestampIso: new Date().toISOString(),
      syncedToCloud: isCloudReady,
    };
    setParameterHistory((prev) => [signupChange, ...prev.slice(0, 199)]);

    if (isCloudReady && effectiveAuthUser) {
      void setDoc(
        doc(db, 'customers', newCustId),
        buildCustomerDoc(newCustomer, effectiveAuthUser.uid, true)
      ).catch((err) => handleFirestoreError(err, OperationType.CREATE, 'customers'));

      void setDoc(
        doc(db, 'buyerLeads', newCustId),
        buildBuyerLeadDoc(newLead, effectiveAuthUser.uid, true)
      ).catch((err) => handleFirestoreError(err, OperationType.CREATE, 'buyerLeads'));

      void setDoc(
        doc(db, 'parameterChanges', chgId),
        buildParamChangeDoc(signupChange, effectiveAuthUser.uid)
      ).catch((err) => handleFirestoreError(err, OperationType.CREATE, 'parameterChanges'));
    }

    return newCustomer;
  };

  const signUpWithEmailPassword = async (payload: EmailSignUpPayload): Promise<AuthActionResult> => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        payload.email.trim(),
        payload.password
      );
      const user = cred.user;
      await updateProfile(user, { displayName: payload.name.trim() });
      try {
        await sendEmailVerification(user);
      } catch {
        // Non-fatal if verification email dispatch throttles
      }

      setRole('customer');
      const assignedAdvisor =
        payload.assignedAgent ||
        agents.find((a) => a.city === payload.city)?.name ||
        'Vikramaditya (Senior Advisor)';

      const created = addCustomer(
        {
          name: payload.name.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim() || '+91 98450 12345',
          city: payload.city,
          zone: payload.zone,
          purpose: payload.purpose,
          preferredBedrooms: payload.bedrooms,
          budgetRange: payload.budgetRange,
          budgetNum: budgetRangeToLakhs(payload.budgetRange),
          occupation: payload.occupation.trim() || 'Verified Homebuyer',
          requirement:
            payload.requirement.trim() ||
            `${payload.bedrooms} • ${payload.budgetRange} • ${payload.zone} ${payload.city} (${payload.purpose})`,
          assignedAgent: assignedAdvisor,
        },
        {
          authUser: user,
          preferredCompany: payload.preferredCompany,
          preferredProject: payload.preferredProject,
          preferredPlace: payload.preferredPlace,
        }
      );

      return {
        ok: true,
        needsVerification: !user.emailVerified,
        customer: created,
      };
    } catch (err: unknown) {
      const mapped = mapFirebaseAuthError(err);
      setAuthError(mapped.message);
      return {
        ok: false,
        error: mapped.message,
        providerNotEnabled: mapped.providerNotEnabled,
      };
    }
  };

  const assignLeadToAgent = (leadId: string, assignedAgentName: string) => {
    const targetLead = buyerLeads.find((l) => l.id === leadId);
    const prevAgent = targetLead?.assignedAgent || 'Unassigned';

    setBuyerLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              assignedAgent: assignedAgentName,
              lastActivityDate: 'Just now',
              notes: `Assigned advisor changed to ${assignedAgentName} on ${new Date().toLocaleDateString()}.\n\n${lead.notes}`,
            }
          : lead
      )
    );
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === leadId || c.email === leadId ? { ...c, assignedAgent: assignedAgentName } : c
      )
    );

    if (targetLead) {
      recordParameterChange(
        'pipeline_metric',
        `assignedAgent:${leadId}`,
        prevAgent,
        assignedAgentName,
        {
          customerId: leadId,
          customerName: targetLead.name,
          customerEmail: targetLead.email,
        }
      );
    }
  };

  const selectCustomerAccount = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (cust) {
      setRole('customer');
      setActiveCustomerId(cust.id);
      setCustomerName(cust.name);
      setCustomerEmail(cust.email);
      setSelectedCityState(cust.city);
      setSelectedZoneState(cust.zone);
      setPreferredPurposeState(cust.purpose);
      setPreferredBedroomsState(cust.preferredBedrooms);
      setPreferredBudgetState(cust.budgetRange);
      setSavedFlatIds(cust.savedFlatIds || []);
      if (cust.followedStocks && cust.followedStocks.length > 0) {
        const stockMap: Record<string, boolean> = {};
        cust.followedStocks.forEach((s) => {
          stockMap[s] = true;
        });
        setFollowedStocks(stockMap);
      }
    }
  };

  const selectAgentAccount = (agentId: string) => {
    const ag = agents.find((a) => a.id === agentId);
    if (ag) {
      setRole('agent');
      setAgentName(ag.name);
      setAgentPartnerId(ag.partnerId);
    }
  };

  const resetAllData = () => {
    setBuyerLeads(INITIAL_BUYER_LEADS);
    setCustomers(INITIAL_CUSTOMERS);
    setParameterHistory(INITIAL_PARAMETER_HISTORY);
    setSiteVisits([]);
    setActiveCustomerId('priya');
    setCustomerName('Priya Sharma');
    setCustomerEmail('priya.sharma@example.com');
    setSelectedCityState('Bangalore');
    setSelectedZoneState('East');
    setPreferredPurposeState('Own');
    setPreferredBedroomsState('3 BHK');
    setPreferredBudgetState('1 Cr – 2 Cr');
    setSavedFlatIds(['blr-1', 'blr-sky-luminary']);
    setCurrentViewState('portal-chooser');
    setNavigationHistory(['portal-chooser']);
    setRoleState(null);
  };

  return (
    <AppContext.Provider
      value={{
        firebaseUser,
        isAuthReady,
        isAdminUser,
        isCloudSyncing,
        authError,
        clearAuthError,
        signInWithGoogle,
        signUpWithEmailPassword,
        signInWithEmailPassword,
        refreshEmailVerification,
        resendVerificationEmail,
        signOutFirebase,

        role,
        setRole,
        currentView,
        navigate,
        goBack,
        canGoBack,
        activeHub,
        setActiveHub,
        navigationHistory,

        agents,
        customers,
        activeCustomerId,
        addCustomer,
        assignLeadToAgent,
        selectCustomerAccount,
        selectAgentAccount,
        isDirectoryModalOpen,
        setIsDirectoryModalOpen,

        parameterHistory,
        siteVisits,
        bookSiteVisit,

        customerName,
        setCustomerName,
        customerEmail,
        setCustomerEmail,
        selectedCity,
        setSelectedCity,
        selectedZone,
        setSelectedZone,
        preferredPurpose,
        setPreferredPurpose,
        preferredBedrooms,
        setPreferredBedrooms,
        preferredBudget,
        setPreferredBudget,
        selectedFlatId,
        setSelectedFlatId,
        selectedDeveloperId,
        setSelectedDeveloperId,
        followedStocks,
        toggleFollowStock,
        savedFlatIds,
        toggleSaveFlat,

        agentName,
        setAgentName,
        agentPartnerId,
        setAgentPartnerId,
        selectedCompany,
        setSelectedCompany,
        selectedProjectName,
        setSelectedProjectName,
        selectedProjectPlace,
        setSelectedProjectPlace,
        selectedBuyerId,
        setSelectedBuyerId,
        buyerLeads,
        updateLeadStatus,
        updateLeadProbability,
        addLeadNote,
        addNewLead,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
