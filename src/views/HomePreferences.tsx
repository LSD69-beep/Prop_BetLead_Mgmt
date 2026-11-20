import React, { useRef, useMemo } from 'react';
import { useApp, computeMatchedAnalytics } from '../context/AppContext';
import { FLATS_DATABASE } from '../data/mockData';
import { PropertyPurpose, Bedrooms, BudgetRange } from '../types';
import { Home, Key, ArrowRight, Check, Database, BarChart3, Clock } from 'lucide-react';

export const HomePreferences: React.FC = () => {
  const {
    preferredPurpose,
    setPreferredPurpose,
    preferredBedrooms,
    setPreferredBedrooms,
    preferredBudget,
    setPreferredBudget,
    selectedCity,
    selectedZone,
    navigate,
    activeCustomerId,
    customerName,
    parameterHistory,
    firebaseUser,
  } = useApp();

  const bedroomRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);

  const handlePurposeChange = (purpose: PropertyPurpose) => {
    setPreferredPurpose(purpose);
    bedroomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleBedroomsChange = (bhk: Bedrooms) => {
    setPreferredBedrooms(bhk);
    budgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleBudgetChange = (budget: BudgetRange) => {
    setPreferredBudget(budget);
  };

  const handleVerifyMatching = () => {
    navigate('customer-matching-flats');
  };

  const liveAnalytics = useMemo(() => {
    const stats = computeMatchedAnalytics(
      selectedCity,
      selectedZone,
      preferredPurpose,
      preferredBedrooms,
      preferredBudget
    );
    const cityFlats = FLATS_DATABASE.filter((f) => f.city === selectedCity);
    const bhkFlats = cityFlats.filter((f) => f.bedrooms === preferredBedrooms);
    const pool = bhkFlats.length > 0 ? bhkFlats : cityFlats;
    const avgCarpet =
      pool.length > 0
        ? Math.round(
            pool.reduce((s, f) => s + (parseInt(f.carpet.replace(/\D/g, ''), 10) || 74), 0) /
              pool.length
          )
        : 74;

    return {
      ...stats,
      avgCarpet,
    };
  }, [selectedCity, selectedZone, preferredPurpose, preferredBedrooms, preferredBudget]);

  const recentCustomerChanges = useMemo(
    () =>
      parameterHistory
        .filter((p) => p.customerId === activeCustomerId || p.customerName === customerName)
        .slice(0, 4),
    [parameterHistory, activeCustomerId, customerName]
  );

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 bg-[#F2F5F3]">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#4B5E63]">
              Tell us about your home, {customerName}.
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#14532D] text-xs font-['Red_Hat_Mono'] font-semibold tabular-nums">
              2/4
            </span>
          </div>
          <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#152226] text-balance">
            Your flat preferences
          </h1>
          <p className="text-sm text-[#4B5E63]">
            Searching in <strong className="text-[#0F4C5C]">{selectedCity}</strong> ({selectedZone || 'East'} Zone) • All metric updates auto-sync to your unified buyer record.
          </p>
        </div>

        {/* Live Parameter Impact Analytics Banner */}
        <section
          aria-label="Live parameter impact analytics"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-5 shadow-xs flex flex-col gap-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#D0DDD7]/70">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0F4C5C]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F4C5C]">
                Live Parameter Impact Analytics
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-['Red_Hat_Mono'] font-semibold text-[#1F7A4C] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
              <Database className="w-3 h-3" />
              {firebaseUser ? 'Synced to Firestore' : 'Unified DB Active'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-[#F2F5F3] border border-[#D0DDD7]/60 flex flex-col gap-0.5">
              <span className="text-[11px] text-[#4B5E63]">Matching Audited Flats</span>
              <span className="font-['Red_Hat_Mono'] text-2xl font-bold text-[#0F4C5C] tabular-nums">
                {liveAnalytics.count} Properties
              </span>
              <span className="text-[11px] text-[#4B5E63]">
                {selectedCity} • {preferredBedrooms}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F2F5F3] border border-[#D0DDD7]/60 flex flex-col gap-0.5">
              <span className="text-[11px] text-[#4B5E63]">Mean Matched Ticket Size</span>
              <span className="font-['Red_Hat_Mono'] text-2xl font-bold text-[#152226] tabular-nums">
                ₹{(liveAnalytics.avgPriceLakhs / 100).toFixed(2)} Cr
              </span>
              <span className="text-[11px] text-[#4B5E63]">
                Budget Band: {preferredBudget}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F2F5F3] border border-[#D0DDD7]/60 flex flex-col gap-0.5">
              <span className="text-[11px] text-[#4B5E63]">Avg Carpet Usability</span>
              <span className="font-['Red_Hat_Mono'] text-2xl font-bold text-[#1F7A4C] tabular-nums">
                {liveAnalytics.avgCarpet}%
              </span>
              <span className="text-[11px] text-[#1F7A4C] font-medium">
                +{Math.max(0, liveAnalytics.avgCarpet - 64)}% vs market median
              </span>
            </div>
          </div>

          {recentCustomerChanges.length > 0 && (
            <div className="pt-2 border-t border-[#D0DDD7]/60 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-[#4B5E63] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#0F4C5C]" />
                Recent Recorded Parameter Changes ({recentCustomerChanges.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {recentCustomerChanges.map((chg) => (
                  <span
                    key={chg.id}
                    className="px-2.5 py-1 rounded-lg bg-[#E9F3F5] border border-[#0F4C5C]/20 text-[11px] font-['Red_Hat_Mono'] text-[#09323D]"
                  >
                    {chg.parameterKey}: {chg.previousValue} → <strong>{chg.newValue}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 3 Vertically Stacked Steps */}
        <div className="flex flex-col gap-6">
          {/* Step 1: Purpose */}
          <section className="rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-[#152226]">
                1. Are you looking for rental or own?
              </h2>
              {preferredPurpose && (
                <span className="flex items-center gap-1 text-xs text-[#1F7A4C] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                  <Check className="w-3.5 h-3.5" />
                  Selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handlePurposeChange('Own')}
                className={`text-left rounded-xl p-5 flex items-center gap-4 transition-all cursor-pointer border ${
                  preferredPurpose === 'Own'
                    ? 'border-[#0F4C5C] bg-[#D2E8ED]/30 ring-1 ring-[#0F4C5C]'
                    : 'border-[#D0DDD7] bg-white hover:border-[#0F4C5C]/60 hover:bg-[#F2F5F3]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#D2E8ED] text-[#0F4C5C] flex items-center justify-center shrink-0">
                  <Home className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base text-[#152226]">Own / Buy</span>
                  <span className="text-xs text-[#4B5E63]">Purchase a verified residential flat</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePurposeChange('Rental')}
                className={`text-left rounded-xl p-5 flex items-center gap-4 transition-all cursor-pointer border ${
                  preferredPurpose === 'Rental'
                    ? 'border-[#0F4C5C] bg-[#D2E8ED]/30 ring-1 ring-[#0F4C5C]'
                    : 'border-[#D0DDD7] bg-white hover:border-[#0F4C5C]/60 hover:bg-[#F2F5F3]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#D2E8ED] text-[#0F4C5C] flex items-center justify-center shrink-0">
                  <Key className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base text-[#152226]">Rental</span>
                  <span className="text-xs text-[#4B5E63]">Lease a verified apartment</span>
                </div>
              </button>
            </div>
          </section>

          {/* Step 2: Bedrooms */}
          <section
            ref={bedroomRef}
            className="rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-[#152226]">
                2. How many bedrooms do you want?
              </h2>
              {preferredBedrooms && (
                <span className="flex items-center gap-1 text-xs text-[#1F7A4C] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                  <Check className="w-3.5 h-3.5" />
                  Selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['1 BHK', '2 BHK', '3 BHK', '4+ BHK'] as Bedrooms[]).map((bhk) => {
                const isSelected = preferredBedrooms === bhk;
                return (
                  <button
                    key={bhk}
                    type="button"
                    onClick={() => handleBedroomsChange(bhk)}
                    className={`rounded-xl p-4 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-[#0F4C5C] bg-[#D2E8ED]/30 ring-1 ring-[#0F4C5C]'
                        : 'border-[#D0DDD7] bg-white hover:border-[#0F4C5C]/60 hover:bg-[#F2F5F3]'
                    }`}
                  >
                    <span className="font-['Red_Hat_Mono'] text-lg font-bold text-[#152226] tabular-nums">
                      {bhk}
                    </span>
                    <span className="text-xs text-[#4B5E63]">
                      {bhk === '1 BHK'
                        ? '1 Bedroom'
                        : bhk === '2 BHK'
                        ? '2 Bedrooms'
                        : bhk === '3 BHK'
                        ? '3 Bedrooms'
                        : '4+ Bedrooms'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 3: Budget Range */}
          <section
            ref={budgetRef}
            className="rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-[#152226]">
                3. What is your flat budget range?
              </h2>
              {preferredBudget && (
                <span className="flex items-center gap-1 text-xs text-[#1F7A4C] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                  <Check className="w-3.5 h-3.5" />
                  Selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['< 50 Lakhs', '50L – 1 Cr', '1 Cr – 2 Cr', '> 2 Cr'] as BudgetRange[]).map(
                (b) => {
                  const isSelected = preferredBudget === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => handleBudgetChange(b)}
                      className={`rounded-xl p-4 flex items-center justify-center text-center transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-[#0F4C5C] bg-[#D2E8ED]/30 ring-1 ring-[#0F4C5C]'
                          : 'border-[#D0DDD7] bg-white hover:border-[#0F4C5C]/60 hover:bg-[#F2F5F3]'
                      }`}
                    >
                      <span className="font-['Red_Hat_Mono'] text-sm sm:text-base font-semibold text-[#152226] tabular-nums">
                        {b}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </section>
        </div>

        {/* Action Button */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleVerifyMatching}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#0F4C5C] hover:bg-[#09323D] text-white font-semibold text-base transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md"
          >
            <span>Verify Matching Flats ({liveAnalytics.count} Verified)</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-center text-xs text-[#4B5E63]">
            Matches are scored using GlassWindow&apos;s 80-point inspection algorithm and verified carpet ratios.
          </p>
        </div>
      </div>
    </div>
  );
};
