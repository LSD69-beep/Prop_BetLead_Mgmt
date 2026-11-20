import React, { useState, useMemo } from 'react';
import { useApp, budgetRangeToLakhs, resolveRecommendedProject } from '../context/AppContext';
import { FLATS_DATABASE } from '../data/mockData';
import { City, DirectionZone, PropertyPurpose, Bedrooms, BudgetRange } from '../types';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  UserPlus,
  ShieldCheck,
  Database,
  CheckCircle2,
  BarChart3,
  Mail,
  Phone,
  Briefcase,
  Building2,
  MapPin,
  AlertCircle,
  Check,
  RefreshCw,
  Send,
  Sparkles,
  Loader2,
} from 'lucide-react';

type SignUpStep = 1 | 2 | 3;

interface Step1Errors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

interface SignInErrors {
  email?: string;
  password?: string;
}

const STEP_META = [
  { step: 1 as SignUpStep, title: 'Account & Security', subtitle: 'Identity & login' },
  { step: 2 as SignUpStep, title: 'City & Metrics', subtitle: 'Home preferences' },
  { step: 3 as SignUpStep, title: 'Match & Review', subtitle: 'Advisor & confirm' },
];

export const CustomerLogin: React.FC = () => {
  const {
    setRole,
    navigate,
    customers,
    addCustomer,
    selectCustomerAccount,
    firebaseUser,
    isCloudSyncing,
    signInWithGoogle,
    signUpWithEmailPassword,
    signInWithEmailPassword,
    refreshEmailVerification,
    resendVerificationEmail,
    signOutFirebase,
    authError,
    clearAuthError,
    agents,
  } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [signUpStep, setSignUpStep] = useState<SignUpStep>(1);

  // Sign-In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [signInTouched, setSignInTouched] = useState<Record<string, boolean>>({});
  const [isSubmittingSignIn, setIsSubmittingSignIn] = useState(false);

  // Multi-Step Sign-Up state (Step 1: Identity & Credentials)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [occupation, setOccupation] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Multi-Step Sign-Up state (Step 2: City & Home Metrics)
  const [city, setCity] = useState<City>('Bangalore');
  const [zone, setZone] = useState<DirectionZone>('East');
  const [purpose, setPurpose] = useState<PropertyPurpose>('Own');
  const [bedrooms, setBedrooms] = useState<Bedrooms>('3 BHK');
  const [budgetRange, setBudgetRange] = useState<BudgetRange>('1 Cr – 2 Cr');

  // Multi-Step Sign-Up state (Step 3: Project Match, Advisor & Review)
  const [selectedProjectOverride, setSelectedProjectOverride] = useState<string>('AUTO');
  const [requirementNotes, setRequirementNotes] = useState('');
  const [acceptedConsent, setAcceptedConsent] = useState(true);
  const [consentError, setConsentError] = useState<string | null>(null);

  // Submission & Feedback state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSubmittingSignUp, setIsSubmittingSignUp] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [providerSetupNotice, setProviderSetupNotice] = useState(false);
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);
  const [isCheckingVerify, setIsCheckingVerify] = useState(false);

  // Live Match Preview for Sign Up Analytics
  const livePreviewStats = useMemo(() => {
    const cityFlats = FLATS_DATABASE.filter((f) => f.city === city);
    const zoneMatched = cityFlats.filter((f) => zone === 'Advice' || f.zone === zone);
    const pool = zoneMatched.length > 0 ? zoneMatched : cityFlats;
    const avgRate =
      pool.length > 0
        ? Math.round(
            pool.reduce((sum, f) => {
              const num = parseInt(f.rate.replace(/[^\d]/g, ''), 10) || 12000;
              return sum + num;
            }, 0) / pool.length
          )
        : 12000;
    const avgCarpet =
      pool.length > 0
        ? Math.round(
            pool.reduce((sum, f) => {
              const num = parseInt(f.carpet.replace(/\D/g, ''), 10) || 74;
              return sum + num;
            }, 0) / pool.length
          )
        : 74;
    return {
      totalCityFlats: cityFlats.length,
      zoneFlats: pool.length,
      avgRate,
      avgCarpet,
      cityFlats,
    };
  }, [city, zone]);

  // Auto-matched recommended project & advisor
  const autoMatchedProject = useMemo(
    () => resolveRecommendedProject(city, zone, bedrooms, budgetRange),
    [city, zone, bedrooms, budgetRange]
  );

  const chosenProjectInfo = useMemo(() => {
    if (selectedProjectOverride === 'AUTO') {
      return autoMatchedProject;
    }
    const flat = FLATS_DATABASE.find((f) => f.id === selectedProjectOverride);
    if (flat) {
      return {
        company: flat.company,
        project: flat.name,
        place: flat.locality,
      };
    }
    return autoMatchedProject;
  }, [selectedProjectOverride, autoMatchedProject]);

  const assignedAdvisor = useMemo(
    () => agents.find((a) => a.city === city) || agents[0],
    [agents, city]
  );

  // Inline Validation: Sign-In
  const signInErrors: SignInErrors = useMemo(() => {
    const errs: SignInErrors = {};
    const trimmedEmail = loginEmail.trim();
    if (!trimmedEmail) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Enter a valid email format (e.g. name@domain.com).';
    }
    if (!loginPassword) {
      errs.password = 'Password is required.';
    } else if (loginPassword.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    return errs;
  }, [loginEmail, loginPassword]);

  // Inline Validation: Step 1 (Sign-Up)
  const passwordChecks = useMemo(() => {
    const lenOk = signupPassword.length >= 8;
    const hasLetter = /[A-Za-z]/.test(signupPassword);
    const hasNumber = /\d/.test(signupPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(signupPassword);
    const score = [lenOk, hasLetter, hasNumber, hasSpecial].filter(Boolean).length;
    const label =
      signupPassword.length === 0
        ? 'Empty'
        : score <= 2
        ? 'Weak'
        : score === 3
        ? 'Good'
        : 'Strong';
    return { lenOk, hasLetter, hasNumber, hasSpecial, score, label };
  }, [signupPassword]);

  const step1Errors: Step1Errors = useMemo(() => {
    const errs: Step1Errors = {};
    const nameClean = fullName.trim();
    if (!nameClean) {
      errs.fullName = 'Full name is required.';
    } else if (nameClean.length < 2) {
      errs.fullName = 'Name must be at least 2 characters.';
    }

    const emailClean = email.trim();
    if (!emailClean) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      errs.email = 'Enter a valid email address (e.g. aarav@example.com).';
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (!digitsOnly) {
      errs.phone = 'Mobile number is required for advisor callbacks.';
    } else if (digitsOnly.length < 10) {
      errs.phone = 'Enter at least 10 phone digits (including country code or mobile).';
    }

    if (!signupPassword) {
      errs.password = 'Create a password for your cloud account.';
    } else if (!passwordChecks.lenOk || !passwordChecks.hasLetter || !passwordChecks.hasNumber) {
      errs.password = 'Use 8+ characters including at least one letter and one number.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== signupPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    return errs;
  }, [fullName, email, phone, signupPassword, confirmPassword, passwordChecks]);

  const isStep1Valid = Object.keys(step1Errors).length === 0;

  const markFieldTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleAdvanceFromStep1 = () => {
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });
    setLocalError(null);
    clearAuthError();
    if (!isStep1Valid) {
      setLocalError('Please fix the highlighted account fields before continuing.');
      return;
    }
    setSignUpStep(2);
  };

  const handleAdvanceFromStep2 = () => {
    setLocalError(null);
    setSignUpStep(3);
  };

  // Real-time Firebase Email + Password Sign-In
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInTouched({ email: true, password: true });
    setLocalError(null);
    setFeedback(null);
    setProviderSetupNotice(false);
    clearAuthError();

    if (Object.keys(signInErrors).length > 0) {
      return;
    }

    setIsSubmittingSignIn(true);
    const res = await signInWithEmailPassword(loginEmail, loginPassword);
    setIsSubmittingSignIn(false);

    if (!res.ok) {
      if (res.providerNotEnabled) {
        setProviderSetupNotice(true);
      }
      setLocalError(res.error || 'Unable to sign in.');
      return;
    }

    if (res.needsVerification) {
      setVerificationPendingEmail(loginEmail.trim());
      setVerificationNotice(
        'Signed in to Firebase Auth! Please verify your email link to enable real-time Cloud Firestore sync, or continue browsing now.'
      );
      return;
    }

    setFeedback(
      `Signed in & synced with Cloud Firestore (${res.customer?.name || loginEmail}). Redirecting to city explorer...`
    );
    setTimeout(() => {
      navigate('customer-city-select');
    }, 550);
  };

  // Multi-Step Final Submit: Real-time Firebase Auth + Customer & Lead Sync
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setFeedback(null);
    setConsentError(null);
    setProviderSetupNotice(false);
    clearAuthError();

    if (!isStep1Valid) {
      setSignUpStep(1);
      setTouched({
        fullName: true,
        email: true,
        phone: true,
        password: true,
        confirmPassword: true,
      });
      setLocalError('Please complete all required account fields in Step 1.');
      return;
    }

    if (!acceptedConsent) {
      setConsentError('Please confirm consent to register your buyer profile and assign an advisor.');
      return;
    }

    setIsSubmittingSignUp(true);
    const res = await signUpWithEmailPassword({
      name: fullName,
      email,
      password: signupPassword,
      phone,
      occupation,
      city,
      zone,
      purpose,
      bedrooms,
      budgetRange,
      requirement:
        requirementNotes.trim() || `${bedrooms} • ${budgetRange} • ${zone} ${city} (${purpose})`,
      preferredCompany: chosenProjectInfo.company,
      preferredProject: chosenProjectInfo.project,
      preferredPlace: chosenProjectInfo.place,
      assignedAgent: assignedAdvisor?.name,
    });
    setIsSubmittingSignUp(false);

    if (!res.ok) {
      if (res.providerNotEnabled) {
        setProviderSetupNotice(true);
      }
      setLocalError(res.error || 'Could not create customer account.');
      return;
    }

    if (res.needsVerification) {
      setVerificationPendingEmail(email.trim());
      setVerificationNotice(
        `Account created in Firebase Auth for ${email.trim()} and added to Agent Leads (${chosenProjectInfo.project}). Verify the link sent to your inbox to sync directly to Cloud Firestore.`
      );
      return;
    }

    setFeedback(
      `Account created for ${res.customer?.name}, synced to Cloud Firestore & added to Agent Leads!`
    );
    setTimeout(() => {
      navigate('customer-city-select');
    }, 650);
  };

  // Real-time Google OAuth Sign-In / Sign-Up
  const handleGoogleContinue = async () => {
    setLocalError(null);
    setFeedback(null);
    clearAuthError();
    setIsGoogleLoading(true);
    const user = await signInWithGoogle();
    setIsGoogleLoading(false);

    if (user) {
      setRole('customer');
      const existing = customers.find(
        (c) =>
          c.uid === user.uid ||
          c.email.toLowerCase() === (user.email || '').toLowerCase()
      );
      if (existing) {
        selectCustomerAccount(existing.id);
        setFeedback(`Signed in with Google as ${existing.name}. Cloud Firestore synchronized.`);
      } else {
        addCustomer(
          {
            name: fullName.trim() || user.displayName || 'Verified Buyer',
            email: user.email || email.trim() || 'buyer@example.com',
            phone: phone.replace(/\s+/g, '').length >= 10 ? phone.trim() : '+91 98450 12345',
            city,
            zone,
            purpose,
            preferredBedrooms: bedrooms,
            budgetRange,
            budgetNum: budgetRangeToLakhs(budgetRange),
            occupation: occupation.trim() || 'Google Verified Homebuyer',
            requirement:
              requirementNotes.trim() ||
              `${bedrooms} • ${budgetRange} • ${zone} ${city} (${purpose})`,
            assignedAgent: assignedAdvisor?.name || 'Vikramaditya (Senior Advisor)',
          },
          {
            authUser: user,
            preferredCompany: chosenProjectInfo.company,
            preferredProject: chosenProjectInfo.project,
            preferredPlace: chosenProjectInfo.place,
          }
        );
        setFeedback(
          `Created & synced customer account for ${user.displayName || user.email} in Cloud Firestore & Agent Leads.`
        );
      }

      setTimeout(() => {
        navigate('customer-city-select');
      }, 650);
    }
  };

  const handleCheckVerification = async () => {
    setIsCheckingVerify(true);
    const verified = await refreshEmailVerification();
    setIsCheckingVerify(false);
    if (verified) {
      setVerificationPendingEmail(null);
      setFeedback('Email verified! Your profile, preferences, and buyer lead are now synced to Cloud Firestore.');
      setTimeout(() => {
        navigate('customer-city-select');
      }, 800);
    } else {
      setVerificationNotice(
        'Still awaiting email verification. Open the verification link in your inbox, then click this button again.'
      );
    }
  };

  const handleResendVerification = async () => {
    const res = await resendVerificationEmail();
    if (res.ok) {
      setVerificationNotice('Verification email resent! Please check your inbox and spam folder.');
    } else {
      setVerificationNotice(res.error || 'Could not resend verification email right now.');
    }
  };

  const handleQuickDemoCustomer = (customer: (typeof customers)[0]) => {
    selectCustomerAccount(customer.id);
    setFeedback(`Loaded ${customer.name} (${customer.city} • ${customer.preferredBedrooms}). Redirecting...`);
    setTimeout(() => {
      navigate('customer-city-select');
    }, 450);
  };

  const switchMode = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setSignUpStep(1);
    setFeedback(null);
    setLocalError(null);
    setProviderSetupNotice(false);
    setVerificationPendingEmail(null);
    clearAuthError();
  };

  const progressPercentage = signUpStep === 1 ? 33 : signUpStep === 2 ? 67 : 100;

  return (
    <div className="relative flex-1 flex items-center justify-center min-h-[calc(100vh-160px)] py-10 px-4 sm:px-6">
      {/* Local architectural background with soft overlay */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/src/assets/images/bangalore_residence_tower_1795170527199.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#F2F5F3]/80 backdrop-blur-xs" />
      </div>

      <div
        className={`relative z-10 w-full ${
          authMode === 'signup' ? 'max-w-3xl' : 'max-w-lg'
        } transition-all duration-200 animate-in fade-in zoom-in-95`}
      >
        <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-[#D0DDD7] p-6 sm:p-8 shadow-xl flex flex-col gap-5">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#D2E8ED] text-[#0F4C5C] flex items-center justify-center shadow-2xs">
                {authMode === 'signup' ? (
                  <UserPlus className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-['Red_Hat_Mono'] uppercase font-bold tracking-wider text-[#0F4C5C]">
                  GlassWindow Buyer Onboarding
                </span>
                <p className="text-xs text-[#4B5E63]">
                  {firebaseUser
                    ? `Signed in: ${firebaseUser.email}`
                    : 'Firebase Auth + Cloud Firestore'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                  firebaseUser?.emailVerified
                    ? 'bg-[#DCFCE7] text-[#14532D]'
                    : 'bg-[#E9F3F5] text-[#0F4C5C]'
                }`}
              >
                <Database className="w-3 h-3" />
                {isCloudSyncing
                  ? 'Syncing Cloud...'
                  : firebaseUser?.emailVerified
                  ? 'Cloud Synced'
                  : firebaseUser
                  ? 'Auth Connected'
                  : 'Cloud Ready'}
              </span>

              {firebaseUser && (
                <button
                  type="button"
                  onClick={() => void signOutFirebase()}
                  className="px-2.5 py-1 rounded-full bg-[#F2F5F3] hover:bg-[#E9EFEA] border border-[#D0DDD7] text-[10px] font-semibold text-[#4B5E63] cursor-pointer"
                >
                  Sign Out Auth
                </button>
              )}
            </div>
          </div>

          {/* Mode Switcher: Customer Sign In vs Multi-Step Registration */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#E9EFEA] border border-[#D0DDD7] gap-1">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-white text-[#0F4C5C] shadow-xs'
                  : 'text-[#4B5E63] hover:text-[#152226]'
              }`}
            >
              Customer Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-[#0F4C5C] shadow-xs'
                  : 'text-[#4B5E63] hover:text-[#152226]'
              }`}
            >
              Create Account (3-Step Wizard)
            </button>
          </div>

          {/* Verification Pending State */}
          {verificationPendingEmail ? (
            <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#0F4C5C]/30 flex flex-col gap-4 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D2E8ED] text-[#0F4C5C] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#152226]">
                    Verify Your Email to Activate Cloud Firestore Sync
                  </h2>
                  <p className="text-xs text-[#4B5E63] leading-relaxed">
                    {verificationNotice ||
                      `A verification link has been sent to ${verificationPendingEmail}. Your buyer profile is already active in Agent Leads (${chosenProjectInfo.project}).`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white border border-[#D0DDD7] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F7A4C] shrink-0" />
                  <span className="font-medium text-[#152226]">Firebase Auth Created</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#D0DDD7] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F7A4C] shrink-0" />
                  <span className="font-medium text-[#152226]">Visible in Agent CRM</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#D0DDD7] flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#0F4C5C] shrink-0" />
                  <span className="font-medium text-[#152226]">Awaiting Email Link</span>
                </div>
              </div>

              {feedback && (
                <div className="p-3 rounded-lg bg-[#DCFCE7] border border-[#1F7A4C]/30 text-[#14532D] text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1F7A4C] shrink-0" />
                  <span>{feedback}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={isCheckingVerify}
                  onClick={() => void handleCheckVerification()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#09323D] text-white text-xs font-semibold cursor-pointer transition-colors disabled:opacity-60"
                >
                  {isCheckingVerify ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>I&apos;ve Verified — Sync to Cloud</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleResendVerification()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#E9EFEA] border border-[#D0DDD7] text-[#152226] text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-[#0F4C5C]" />
                  <span>Resend Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('customer-city-select')}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#E9F3F5] hover:bg-[#D2E8ED] text-[#0F4C5C] text-xs font-semibold cursor-pointer transition-colors ml-auto"
                >
                  <span>Explore Flats Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Titles */}
              <div className="flex flex-col gap-1">
                <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold text-[#152226]">
                  {authMode === 'signin'
                    ? 'Customer Sign In'
                    : 'Homebuyer Registration & Matching'}
                </h1>
                <p className="text-xs sm:text-sm text-[#4B5E63]">
                  {authMode === 'signin'
                    ? 'Sign in with your Firebase Email & Password or Google account to restore your saved flats, preferences, and real-time analytics.'
                    : 'Complete the 3-step onboarding to sync your profile to Firebase Cloud and connect directly with our RERA advisors.'}
                </p>
              </div>

              {/* Error & Firebase Email/Password Enablement Callout */}
              {(localError || authError) && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex flex-col gap-2">
                  <div className="flex items-start gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{localError || authError}</span>
                  </div>
                  {providerSetupNotice && (
                    <div className="pl-6 text-[11px] text-red-800 bg-white/80 p-2.5 rounded-lg border border-red-200/80 space-y-1">
                      <p className="font-bold">How to enable Email/Password in Firebase Console:</p>
                      <p>
                        1. Open Firebase Console → <strong>Authentication</strong> →{' '}
                        <strong>Sign-in method</strong>.<br />
                        2. Click <strong>Add new provider</strong> → select{' '}
                        <strong>Email/Password</strong> → toggle <strong>Enable</strong> → Save.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Google Sign-In / Quick Connect */}
              {(authMode === 'signin' || signUpStep === 1) && (
                <button
                  type="button"
                  disabled={isGoogleLoading}
                  onClick={() => void handleGoogleContinue()}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#F2F5F3] hover:bg-[#E9EFEA] border border-[#D0DDD7] text-[#152226] font-semibold text-xs transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0F4C5C]" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-[#0F4C5C]" />
                  )}
                  <span>
                    {firebaseUser?.emailVerified
                      ? `Continue with Google (${firebaseUser.displayName || firebaseUser.email})`
                      : isGoogleLoading
                      ? 'Authenticating with Google...'
                      : authMode === 'signup'
                      ? 'Quick Sign Up with Google (Instant Verified Sync)'
                      : 'Continue with Google (Instant Cloud Sync)'}
                  </span>
                </button>
              )}

              {authMode === 'signin' ? (
                <div className="flex flex-col gap-5">
                  <form onSubmit={(e) => void handleSignInSubmit(e)} noValidate className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="signin-email" className="text-xs font-semibold text-[#152226]">
                        Registered Email Address *
                      </label>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 text-[#4B5E63] absolute left-3 pointer-events-none" />
                        <input
                          id="signin-email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            setLocalError(null);
                            clearAuthError();
                          }}
                          onBlur={() => setSignInTouched((p) => ({ ...p, email: true }))}
                          placeholder="you@example.com"
                          className={`w-full min-h-[44px] pl-9 pr-3 py-2 rounded-lg bg-[#F2F5F3] border text-sm text-[#152226] focus:bg-white outline-hidden transition-colors ${
                            signInTouched.email && signInErrors.email
                              ? 'border-red-500 focus:border-red-600'
                              : 'border-[#D0DDD7] focus:border-[#0F4C5C]'
                          }`}
                        />
                      </div>
                      {signInTouched.email && signInErrors.email && (
                        <p className="text-[11px] text-red-700 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{signInErrors.email}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="signin-password" className="text-xs font-semibold text-[#152226]">
                        Password *
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="w-4 h-4 text-[#4B5E63] absolute left-3 pointer-events-none" />
                        <input
                          id="signin-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            setLocalError(null);
                            clearAuthError();
                          }}
                          onBlur={() => setSignInTouched((p) => ({ ...p, password: true }))}
                          placeholder="Enter your password"
                          className={`w-full min-h-[44px] pl-9 pr-10 py-2 rounded-lg bg-[#F2F5F3] border text-sm text-[#152226] focus:bg-white outline-hidden transition-colors ${
                            signInTouched.password && signInErrors.password
                              ? 'border-red-500 focus:border-red-600'
                              : 'border-[#D0DDD7] focus:border-[#0F4C5C]'
                          }`}
                        />
                        <button
                          type="button"
                          aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 text-[#4B5E63] hover:text-[#152226] cursor-pointer"
                        >
                          {showLoginPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {signInTouched.password && signInErrors.password && (
                        <p className="text-[11px] text-red-700 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{signInErrors.password}</span>
                        </p>
                      )}
                    </div>

                    {feedback && (
                      <div className="p-3 rounded-lg bg-[#DCFCE7] border border-[#1F7A4C]/30 text-[#14532D] text-xs font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1F7A4C] shrink-0" />
                        <span>{feedback}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmittingSignIn}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[#0F4C5C] hover:bg-[#09323D] text-white font-semibold text-sm transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-60"
                    >
                      {isSubmittingSignIn ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying with Firebase...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In with Email &amp; Password</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Demo Buyer Quick Preview (Distinct from real Firebase Password Auth) */}
                  <div className="pt-4 border-t border-[#D0DDD7] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#4B5E63] uppercase tracking-wider">
                        Instant Buyer Persona Preview ({customers.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="text-[11px] font-semibold text-[#0F4C5C] hover:underline cursor-pointer"
                      >
                        + New Customer Sign Up
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-[#F2F5F3] rounded-xl border border-[#D0DDD7]">
                      {customers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleQuickDemoCustomer(c)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-white text-[#152226] border-[#D0DDD7] hover:border-[#0F4C5C] hover:bg-[#E9F3F5] transition-all cursor-pointer"
                          title={`Preview as ${c.name} (${c.email})`}
                        >
                          <span>{c.name}</span>
                          <span className="ml-1 text-[10px] text-[#4B5E63]">
                            ({c.city.slice(0, 3)})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* MULTI-STEP REGISTRATION WIZARD */
                <div className="flex flex-col gap-5">
                  {/* Step Progress Indicator */}
                  <div className="p-4 rounded-xl bg-[#F2F5F3] border border-[#D0DDD7] flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[11px] font-['Red_Hat_Mono'] font-semibold text-[#4B5E63]">
                      <span>
                        Step {signUpStep} of 3 — {STEP_META[signUpStep - 1].title}
                      </span>
                      <span className="text-[#0F4C5C] font-bold">{progressPercentage}% Complete</span>
                    </div>

                    {/* Linear Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-[#D0DDD7] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0F4C5C] transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    {/* Step Nodes */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {STEP_META.map((item) => {
                        const isCompleted = signUpStep > item.step;
                        const isActive = signUpStep === item.step;
                        const canJump = item.step < signUpStep || (item.step === 2 && isStep1Valid);
                        return (
                          <button
                            key={item.step}
                            type="button"
                            disabled={!canJump && !isActive}
                            onClick={() => {
                              if (canJump) setSignUpStep(item.step);
                            }}
                            className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all border ${
                              isActive
                                ? 'bg-white border-[#0F4C5C] shadow-2xs'
                                : isCompleted
                                ? 'bg-[#DCFCE7]/60 border-[#1F7A4C]/30 cursor-pointer hover:bg-[#DCFCE7]'
                                : 'bg-transparent border-transparent opacity-65 cursor-not-allowed'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full text-xs font-['Red_Hat_Mono'] font-bold flex items-center justify-center shrink-0 ${
                                isCompleted
                                  ? 'bg-[#1F7A4C] text-white'
                                  : isActive
                                  ? 'bg-[#0F4C5C] text-white'
                                  : 'bg-[#D0DDD7] text-[#4B5E63]'
                              }`}
                            >
                              {isCompleted ? <Check className="w-3.5 h-3.5" /> : item.step}
                            </span>
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold text-[#152226] truncate">
                                {item.title}
                              </div>
                              <div className="text-[10px] text-[#4B5E63] truncate hidden sm:block">
                                {item.subtitle}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Wizard Form */}
                  <form onSubmit={(e) => void handleSignUpSubmit(e)} noValidate className="flex flex-col gap-5">
                    {/* STEP 1: ACCOUNT & SECURITY */}
                    {signUpStep === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-150">
                        <div className="flex flex-col gap-1">
                          <label htmlFor="reg-name" className="text-xs font-semibold text-[#152226]">
                            Full Name *
                          </label>
                          <div className="relative flex items-center">
                            <User className="w-3.5 h-3.5 text-[#4B5E63] absolute left-3 pointer-events-none" />
                            <input
                              id="reg-name"
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              onBlur={() => markFieldTouched('fullName')}
                              placeholder="e.g. Aarav Kulkarni"
                              className={`w-full min-h-[42px] pl-8 pr-8 py-2 rounded-lg bg-[#F2F5F3] border text-xs text-[#152226] focus:bg-white outline-hidden ${
                                touched.fullName && step1Errors.fullName
                                  ? 'border-red-500'
                                  : touched.fullName && !step1Errors.fullName
                                  ? 'border-[#1F7A4C]'
                                  : 'border-[#D0DDD7] focus:border-[#0F4C5C]'
                              }`}
                            />
                            {touched.fullName && !step1Errors.fullName && (
                              <Check className="w-3.5 h-3.5 text-[#1F7A4C] absolute right-2.5" />
                            )}
                          </div>
                          {touched.fullName && step1Errors.fullName && (
                            <p className="text-[11px] text-red-700 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{step1Errors.fullName}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <label htmlFor="reg-email" className="text-xs font-semibold text-[#152226]">
                            Email Address *
                          </label>
                          <div className="relative flex items-center">
                            <Mail className="w-3.5 h-3.5 text-[#4B5E63] absolute left-3 pointer-events-none" />
                            <input
                              id="reg-email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              onBlur={() => markFieldTouched('email')}
                              placeholder="aarav.k@example.com"
                              className={`w-full min-h-[42px] pl-8 pr-8 py-2 rounded-lg bg-[#F2F5F3] border text-xs text-[#152226] focus:bg-white outline-hidden ${
                                touched.email && step1Errors.email
                                  ? 'border-red-500'
                                  : touched.email && !step1Errors.email
                                  ? 'border-[#1F7A4C]'
                                  : 'border-[#D0DDD7] focus:border-[#0F4C5C]'
                              }`}
                            />
                            {touched.email && !step1Errors.email && (
                              <Check className="w-3.5 h-3.5 text-[#1F7A4C] absolute right-2.5" />
                            )}
                          </div>
                          {touched.email && step1Errors.email && (
                            <p className="text-[11px] text-red-700 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{step1Errors.email}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <label htmlFor="reg-phone" className="text-xs font-semibold text-[#152226]">
                            Mobile Number *
                          </label>
                          <div className="relative flex items-center">
                            <Phone className="w-3.5 h-3.5 text-[#4B5E63] absolute left-3 pointer-events-none" />
                            <input
                              id="reg-phone"
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              onBlur={() => markFieldTouched('phone')}
                              placeholder="+91 98450 12345"
                              className={`w-full min-h-[42px] pl-8 pr-8 py-2 rounded-lg bg-[#F2F5F3] border text-xs text-[#152226] focus:bg-white outline-hidden ${
                                touched.phone && step1Errors.phone
                                  ? 'border-red-500'
                                  : touched.phone && !step1Errors.phone
                                  ? 'border-[#1F7A4C]'
                                  : 'border-[#D0DDD7] focus:border-[#0F4C5C]'
                              }`}
                            />
                            {touched.phone && !step1Errors.phone && (
                              <Check className="w-3.5 h-3.5 text-[#1F7A4C] absolute right-2.5" />
                            )}
                          </div>
                          {touched.phone && step1Errors.phone && (
                            <p className="text-[11px] text-red-700 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{step1Errors.phone}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <label htmlFor="reg-occ" className="text-xs font-semibold text-[#152226]">
                            Occupation / Role (Optional)
                          </label>
                          <div className="relative flex items-center">
                            <Briefcase className="w-3.5 h-3.5 text-[#4B5E63] absolute left-3 pointer-events-none" />
                            <input
                              id="reg-occ"
                              type="text"
                              value={occupation}
                              onChange={(e) => setOccupation(e.target.value)}
                              placeholder="e.g. Principal Engineer"
                              className="w-full min-h-[42px] pl-8 pr-3 py-2 rounded-lg bg-[#F2F5F3] border border-[#D0DDD7] text-xs text-[#152226] focus:border-[#0F4C5C] focus:bg-white outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label htmlFor="reg-pwd" className="text-xs font-semibold text-[#152226]">
                            Create Password *
                          </label>
                          <div className="relative flex items-center">
                            <Lock className="w-3.5 h-3.5 text-[#4B5E63] absolute left-3 pointer-events-none" />
                            <input
                              id="reg-pwd"
                              type={showSignupPassword ? 'text' : 'password'}
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              onBlur={() => markFieldTouched('password')}
                              placeholder="Min 8 chars, letters + numbers"
                              className={`w-full min-h-[42px] pl-8 pr-9 py-2 rounded-lg bg-[#F2F5F3] border text-xs text-[#152226] focus:bg-white outline-hidden ${
                                touched.password && step1Errors.password
                                  ? 'border-red-500'
                                  : touched.password && !step1Errors.password
                                  ? 'border-[#1F7A4C]'
                                  : 'border-[#D0DDD7] focus:border-[#0F4C5C]'
                              }`}
                            />
                            <button
                              type="button"
                              aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-2.5 text-[#4B5E63] hover:text-[#152226] cursor-pointer"
                            >
                              {showSignupPassword ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Password Strength Bar */}
                          {signupPassword.length > 0 && (
                            <div className="flex flex-col gap-1 mt-1">
                              <div className="flex items-center justify-between text-[10px] font-['Red_Hat_Mono']">
                                <span className="text-[#4B5E63]">Strength: {passwordChecks.label}</span>
                                <span
                                  className={
                                    passwordChecks.score >= 3
                                      ? 'text-[#1F7A4C] font-bold'
                                      : 'text-[#B44D27] font-bold'
                                  }
                                >
                                  {passwordChecks.lenOk && passwordChecks.hasLetter && passwordChecks.hasNumber
                                    ? 'Meets requirements'
                                    : '8+ chars, letter & digit'}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-1">
                                {[1, 2, 3, 4].map((idx) => (
                                  <div
                                    key={idx}
                                    className={`h-1 rounded-full ${
                                      passwordChecks.score >= idx
                                        ? passwordChecks.score >= 4
                                          ? 'bg-[#1F7A4C]'
                                          : passwordChecks.score === 3
                                          ? 'bg-[#0F4C5C]'
                                          : 'bg-[#B44D27]'
                                        : 'bg-[#D0DDD7]'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {touched.password && step1Errors.password && (
                            <p className="text-[11px] text-red-700 flex items-center gap-1 mt-0.5">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{step1Errors.password}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <label htmlFor="reg-cpwd" className="text-xs font-semibold text-[#152226]">
                            Confirm Password *
                          </label>
                          <div className="relative flex items-center">
                            <Lock className="w-3.5 h-3.5 text-[#4B5E63] absolute left-3 pointer-events-none" />
                            <input
                              id="reg-cpwd"
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              onBlur={() => markFieldTouched('confirmPassword')}
                              placeholder="Re-enter password"
                              className={`w-full min-h-[42px] pl-8 pr-9 py-2 rounded-lg bg-[#F2F5F3] border text-xs text-[#152226] focus:bg-white outline-hidden ${
                                touched.confirmPassword && step1Errors.confirmPassword
                                  ? 'border-red-500'
                                  : touched.confirmPassword && !step1Errors.confirmPassword
                                  ? 'border-[#1F7A4C]'
                                  : 'border-[#D0DDD7] focus:border-[#0F4C5C]'
                              }`}
                            />
                            <button
                              type="button"
                              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-2.5 text-[#4B5E63] hover:text-[#152226] cursor-pointer"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {touched.confirmPassword && step1Errors.confirmPassword && (
                            <p className="text-[11px] text-red-700 flex items-center gap-1 mt-0.5">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{step1Errors.confirmPassword}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 2: LOCATION & HOME METRICS */}
                    {signUpStep === 2 && (
                      <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                        {/* Live Market Preview Analytics Strip */}
                        <div className="p-3.5 rounded-xl bg-[#E9F3F5] border border-[#0F4C5C]/25 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#09323D]">
                            <BarChart3 className="w-4 h-4 text-[#0F4C5C]" />
                            <span>
                              Live {zone} {city} Inventory Preview:
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-['Red_Hat_Mono'] font-bold text-[#0F4C5C] tabular-nums">
                            <span>{livePreviewStats.zoneFlats} Audited Flats</span>
                            <span>•</span>
                            <span>Avg ₹{livePreviewStats.avgRate.toLocaleString('en-IN')}/sq.ft</span>
                            <span>•</span>
                            <span>{livePreviewStats.avgCarpet}% Carpet</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5 sm:col-span-2">
                            <span className="text-xs font-semibold text-[#152226]">Target City</span>
                            <div className="grid grid-cols-3 gap-2">
                              {(['Bangalore', 'Hyderabad', 'Delhi'] as City[]).map((cOpt) => (
                                <button
                                  key={cOpt}
                                  type="button"
                                  onClick={() => {
                                    setCity(cOpt);
                                    setSelectedProjectOverride('AUTO');
                                  }}
                                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                    city === cOpt
                                      ? 'bg-[#0F4C5C] text-white border-[#0F4C5C] shadow-xs'
                                      : 'bg-[#F2F5F3] text-[#152226] border-[#D0DDD7] hover:border-[#0F4C5C]'
                                  }`}
                                >
                                  <div className="text-xs font-bold">
                                    {cOpt === 'Delhi' ? 'Delhi NCR' : cOpt}
                                  </div>
                                  <div
                                    className={`text-[10px] mt-0.5 ${
                                      city === cOpt ? 'text-white/80' : 'text-[#4B5E63]'
                                    }`}
                                  >
                                    {FLATS_DATABASE.filter((f) => f.city === cOpt).length} Audited Units
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label htmlFor="reg-zone" className="text-xs font-semibold text-[#152226]">
                              Preferred Zone
                            </label>
                            <select
                              id="reg-zone"
                              value={zone}
                              onChange={(e) => setZone(e.target.value as DirectionZone)}
                              className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-[#F2F5F3] border border-[#D0DDD7] text-xs text-[#152226] font-medium focus:border-[#0F4C5C] outline-hidden cursor-pointer"
                            >
                              <option value="East">East</option>
                              <option value="North">North</option>
                              <option value="South">South</option>
                              <option value="West">West</option>
                              <option value="Advice">Need Advisory Consultation</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label htmlFor="reg-purpose" className="text-xs font-semibold text-[#152226]">
                              Buying Purpose
                            </label>
                            <select
                              id="reg-purpose"
                              value={purpose}
                              onChange={(e) => setPurpose(e.target.value as PropertyPurpose)}
                              className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-[#F2F5F3] border border-[#D0DDD7] text-xs text-[#152226] font-medium focus:border-[#0F4C5C] outline-hidden cursor-pointer"
                            >
                              <option value="Own">Own / Self-Use</option>
                              <option value="Rental">Rental Investment</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label htmlFor="reg-bhk" className="text-xs font-semibold text-[#152226]">
                              Configuration
                            </label>
                            <select
                              id="reg-bhk"
                              value={bedrooms}
                              onChange={(e) => setBedrooms(e.target.value as Bedrooms)}
                              className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-[#F2F5F3] border border-[#D0DDD7] text-xs text-[#152226] font-medium focus:border-[#0F4C5C] outline-hidden cursor-pointer"
                            >
                              <option value="1 BHK">1 BHK</option>
                              <option value="2 BHK">2 BHK</option>
                              <option value="3 BHK">3 BHK</option>
                              <option value="4+ BHK">4+ BHK</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label htmlFor="reg-budget" className="text-xs font-semibold text-[#152226]">
                              Budget Range
                            </label>
                            <select
                              id="reg-budget"
                              value={budgetRange}
                              onChange={(e) => setBudgetRange(e.target.value as BudgetRange)}
                              className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-[#F2F5F3] border border-[#D0DDD7] text-xs text-[#152226] font-medium focus:border-[#0F4C5C] outline-hidden cursor-pointer"
                            >
                              <option value="< 50 Lakhs">&lt; 50 Lakhs</option>
                              <option value="50L – 1 Cr">50L – 1 Cr</option>
                              <option value="1 Cr – 2 Cr">1 Cr – 2 Cr</option>
                              <option value="> 2 Cr">&gt; 2 Cr</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: PROJECT MATCH, ADVISOR & REVIEW */}
                    {signUpStep === 3 && (
                      <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#D0DDD7] flex flex-col gap-1.5">
                            <span className="text-[10px] font-['Red_Hat_Mono'] uppercase font-bold text-[#0F4C5C] flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              Matched Project Pipeline
                            </span>
                            <div className="text-sm font-bold text-[#152226]">
                              {chosenProjectInfo.project}
                            </div>
                            <div className="text-xs text-[#4B5E63]">{chosenProjectInfo.company}</div>
                            <div className="text-[11px] text-[#4B5E63] flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#B44D27]" />
                              <span>{chosenProjectInfo.place}</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-[#FDF7F4] border border-[#B44D27]/25 flex flex-col gap-1.5">
                            <span className="text-[10px] font-['Red_Hat_Mono'] uppercase font-bold text-[#B44D27] flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              Assigned RERA Advisor
                            </span>
                            <div className="text-sm font-bold text-[#152226]">
                              {assignedAdvisor?.name}
                            </div>
                            <div className="text-xs text-[#4B5E63]">
                              {assignedAdvisor?.tier} • {assignedAdvisor?.partnerId}
                            </div>
                            <div className="text-[11px] text-[#4B5E63]">
                              {assignedAdvisor?.specialization}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label htmlFor="reg-project" className="text-xs font-semibold text-[#152226]">
                            Preferred Project Interest (Synced to Agent CRM)
                          </label>
                          <select
                            id="reg-project"
                            value={selectedProjectOverride}
                            onChange={(e) => setSelectedProjectOverride(e.target.value)}
                            className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-[#F2F5F3] border border-[#D0DDD7] text-xs text-[#152226] font-medium focus:border-[#0F4C5C] outline-hidden cursor-pointer"
                          >
                            <option value="AUTO">
                              Auto-Matched: {autoMatchedProject.project} ({autoMatchedProject.company})
                            </option>
                            {livePreviewStats.cityFlats.map((flat) => (
                              <option key={flat.id} value={flat.id}>
                                {flat.name} — {flat.company} ({flat.price})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label htmlFor="reg-notes" className="text-xs font-semibold text-[#152226]">
                            Priority Criteria &amp; Walkthrough Notes (Optional)
                          </label>
                          <input
                            id="reg-notes"
                            type="text"
                            value={requirementNotes}
                            onChange={(e) => setRequirementNotes(e.target.value)}
                            placeholder="e.g. Vastu east-facing, Metro walkability, High floor"
                            className="w-full min-h-[42px] px-3 py-2 rounded-lg bg-[#F2F5F3] border border-[#D0DDD7] text-xs text-[#152226] focus:border-[#0F4C5C] focus:bg-white outline-hidden"
                          />
                        </div>

                        {/* Registration Summary */}
                        <div className="p-3.5 rounded-xl bg-[#F2F5F3] border border-[#D0DDD7] text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div>
                            <span className="text-[10px] text-[#4B5E63] block">Applicant</span>
                            <span className="font-bold text-[#152226] truncate block">{fullName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#4B5E63] block">City &amp; Zone</span>
                            <span className="font-bold text-[#0F4C5C]">
                              {zone} {city}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#4B5E63] block">Configuration</span>
                            <span className="font-bold text-[#152226]">
                              {bedrooms} ({purpose})
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#4B5E63] block">Budget Band</span>
                            <span className="font-bold font-['Red_Hat_Mono'] text-[#152226]">
                              {budgetRange}
                            </span>
                          </div>
                        </div>

                        <label className="flex items-start gap-2.5 text-xs text-[#4B5E63] cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={acceptedConsent}
                            onChange={(e) => {
                              setAcceptedConsent(e.target.checked);
                              if (e.target.checked) setConsentError(null);
                            }}
                            className="mt-0.5 rounded border-[#D0DDD7] text-[#0F4C5C] focus:ring-[#0F4C5C]"
                          />
                          <span>
                            Create my secure Firebase buyer account, persist my home preferences in Cloud Firestore, and assign my inquiry to <strong>{assignedAdvisor?.name}</strong> in the Agent Lead CRM.
                          </span>
                        </label>
                        {consentError && (
                          <p className="text-[11px] text-red-700 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{consentError}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {feedback && (
                      <div className="p-3 rounded-lg bg-[#DCFCE7] border border-[#1F7A4C]/30 text-[#14532D] text-xs font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1F7A4C] shrink-0" />
                        <span>{feedback}</span>
                      </div>
                    )}

                    {/* Step Navigation Footer */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#D0DDD7]">
                      {signUpStep > 1 ? (
                        <button
                          type="button"
                          onClick={() => setSignUpStep((s) => (s === 3 ? 2 : 1))}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F2F5F3] hover:bg-[#E9EFEA] border border-[#D0DDD7] text-[#152226] text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#4B5E63]">
                          All credentials encrypted via Firebase Auth
                        </span>
                      )}

                      {signUpStep === 1 && (
                        <button
                          type="button"
                          onClick={handleAdvanceFromStep1}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#09323D] text-white font-semibold text-xs cursor-pointer transition-colors shadow-xs ml-auto"
                        >
                          <span>Next: City &amp; Metrics</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {signUpStep === 2 && (
                        <button
                          type="button"
                          onClick={handleAdvanceFromStep2}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#09323D] text-white font-semibold text-xs cursor-pointer transition-colors shadow-xs ml-auto"
                        >
                          <span>Next: Project Match &amp; Review</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {signUpStep === 3 && (
                        <button
                          type="submit"
                          disabled={isSubmittingSignUp}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[#0F4C5C] hover:bg-[#09323D] text-white font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md disabled:opacity-60 ml-auto"
                        >
                          {isSubmittingSignUp ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Creating Cloud Account...</span>
                            </>
                          ) : (
                            <>
                              <span>Create Account &amp; Sync to Cloud</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

          <div className="pt-2 border-t border-[#D0DDD7] text-center">
            <button
              type="button"
              onClick={() => navigate('portal-chooser')}
              className="text-xs text-[#4B5E63] hover:text-[#0F4C5C] transition-colors cursor-pointer"
            >
              ← Back to All Profiles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
