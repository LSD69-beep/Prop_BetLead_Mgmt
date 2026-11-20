import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  TrendingUp,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Mail,
  Phone,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

function extractCityTag(text: string): 'Bangalore' | 'Hyderabad' | 'Delhi' | null {
  const lower = text.toLowerCase();
  if (lower.includes('bangalore') || lower.includes('bengaluru')) return 'Bangalore';
  if (lower.includes('hyderabad')) return 'Hyderabad';
  if (lower.includes('delhi') || lower.includes('gurugram') || lower.includes('ncr')) return 'Delhi';
  return null;
}

export const LocationLeads: React.FC = () => {
  const {
    selectedCompany,
    selectedProjectName,
    selectedProjectPlace,
    buyerLeads,
    navigate,
  } = useApp();

  const [minProbability, setMinProbability] = useState<number>(0);
  const [leadScope, setLeadScope] = useState<'project_and_signups' | 'exact_project' | 'all_buyers'>(
    'project_and_signups'
  );

  const projectCity = useMemo(
    () => extractCityTag(`${selectedProjectPlace} ${selectedProjectName}`),
    [selectedProjectPlace, selectedProjectName]
  );

  // Filter leads for this location/project + include newly registered customers in matching city/portfolio
  const locationLeads = useMemo(() => {
    return buyerLeads
      .filter((lead) => {
        const isNewCustomerSignup =
          lead.id.startsWith('cust_') || lead.lastActivityDate === 'Just now';
        const matchesProjectOrCompany =
          lead.project.toLowerCase() === selectedProjectName.toLowerCase() ||
          lead.company.toLowerCase() === selectedCompany.toLowerCase();

        const leadCity = extractCityTag(`${lead.city} ${lead.place} ${lead.project}`);
        const matchesSameCitySignup =
          isNewCustomerSignup && (!projectCity || !leadCity || leadCity === projectCity);

        const matchesScope =
          leadScope === 'all_buyers'
            ? true
            : leadScope === 'exact_project'
            ? matchesProjectOrCompany
            : matchesProjectOrCompany || matchesSameCitySignup;

        const matchesProb = lead.probability >= minProbability;
        return matchesScope && matchesProb;
      })
      .sort((a, b) => {
        const aNew = a.id.startsWith('cust_') || a.lastActivityDate === 'Just now' ? 1 : 0;
        const bNew = b.id.startsWith('cust_') || b.lastActivityDate === 'Just now' ? 1 : 0;
        if (aNew !== bNew) return bNew - aNew;
        return b.probability - a.probability;
      });
  }, [buyerLeads, selectedProjectName, selectedCompany, projectCity, leadScope, minProbability]);

  const newCustomerSignupsCount = useMemo(
    () => locationLeads.filter((l) => l.id.startsWith('cust_')).length,
    [locationLeads]
  );

  const totalUsers = locationLeads.length;
  const avgConversion =
    totalUsers > 0
      ? Math.round(
          locationLeads.reduce((acc, l) => acc + l.probability, 0) / totalUsers
        )
      : 0;

  const getBarColor = (prob: number) => {
    if (prob >= 75) return 'bg-[#1F7A4C]';
    if (prob >= 50) return 'bg-[#0F4C5C]';
    return 'bg-[#B44D27]';
  };

  const getTextColor = (prob: number) => {
    if (prob >= 75) return 'text-[#1F7A4C]';
    if (prob >= 50) return 'text-[#0F4C5C]';
    return 'text-[#B44D27]';
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 bg-[#F2F5F3]">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-[#4B5E63] flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('agent-flats')}
              className="hover:text-[#B44D27] transition-colors cursor-pointer"
            >
              All Companies
            </button>
            <span>/</span>
            <button
              onClick={() =>
                navigate('agent-company-projects', { company: selectedCompany })
              }
              className="hover:text-[#B44D27] transition-colors cursor-pointer"
            >
              {selectedCompany}
            </button>
            <span>/</span>
            <span className="text-[#152226] font-semibold">{selectedProjectName} Leads</span>
          </div>

          <button
            onClick={() => navigate('agent-lead-dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B44D27] hover:underline cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Open in Lead Conversion Dashboard</span>
          </button>
        </div>

        {/* Location & Project Summary Header */}
        <section
          aria-label="Selected building location"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FCE8E0] text-[#B44D27] font-['Red_Hat_Mono'] text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {selectedCompany}
              </span>
              <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#B44D27]" />
                {selectedProjectPlace}
              </span>
              {newCustomerSignupsCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#14532D] font-['Red_Hat_Mono'] text-xs font-semibold">
                  <Sparkles className="w-3 h-3 text-[#1F7A4C]" />
                  {newCustomerSignupsCount} New Customer Signup{newCustomerSignupsCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#152226] text-balance">
              {selectedProjectName}
            </h1>

            <p className="text-sm text-[#4B5E63]">
              Prospective buyers matched to this building location and newly registered customers in {projectCity || 'your corridor'}.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0 bg-[#F2F5F3] px-5 py-3 rounded-xl border border-[#D0DDD7]">
            <div className="flex flex-col items-center">
              <span className="text-xs text-[#4B5E63]">Total Buyers</span>
              <span className="font-['Playfair_Display'] text-2xl font-bold text-[#152226] tabular-nums">
                {totalUsers}
              </span>
            </div>
            <div className="w-[1px] h-8 bg-[#D0DDD7]" />
            <div className="flex flex-col items-center">
              <span className="text-xs text-[#4B5E63]">Avg. Conversion</span>
              <span className="font-['Playfair_Display'] text-2xl font-bold text-[#0F4C5C] tabular-nums">
                {avgConversion}%
              </span>
            </div>
          </div>
        </section>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#D0DDD7]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-[#4B5E63] flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Lead Scope:
            </span>
            {[
              { id: 'project_and_signups' as const, label: 'Project & City Signups' },
              { id: 'exact_project' as const, label: 'Project / Company Only' },
              { id: 'all_buyers' as const, label: `All Registered Leads (${buyerLeads.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLeadScope(tab.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  leadScope === tab.id
                    ? 'bg-[#0F4C5C] text-white'
                    : 'bg-[#F2F5F3] text-[#4B5E63] hover:text-[#152226]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4B5E63]">Min Score:</span>
            {[0, 50, 75].map((prob) => (
              <button
                key={prob}
                type="button"
                onClick={() => setMinProbability(prob)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  minProbability === prob
                    ? 'bg-[#B44D27] text-white'
                    : 'bg-[#F2F5F3] text-[#4B5E63] hover:text-[#152226]'
                }`}
              >
                {prob === 0 ? 'All' : `≥ ${prob}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Users List with Conversion Probability Bar Below Each Person */}
        <section aria-label="Interested users list" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#152226] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#B44D27]" />
              <span>Interested Buyers</span>
            </h2>
            <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63]">
              New customer signups appear first • Click to open profile
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {locationLeads.map((user) => {
              const barColor = getBarColor(user.probability);
              const textColor = getTextColor(user.probability);
              const isNewCustomer = user.id.startsWith('cust_');

              return (
                <div
                  key={user.id}
                  onClick={() =>
                    navigate('agent-lead-profile', {
                      buyerId: user.id,
                      company: user.company || selectedCompany,
                      project: user.project || selectedProjectName,
                      place: user.place || selectedProjectPlace,
                    })
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') &&
                    navigate('agent-lead-profile', {
                      buyerId: user.id,
                      company: user.company || selectedCompany,
                      project: user.project || selectedProjectName,
                      place: user.place || selectedProjectPlace,
                    })
                  }
                  className="rounded-2xl bg-white border border-[#D0DDD7] hover:border-[#B44D27] p-6 shadow-xs hover:shadow-lg transition-all duration-150 cursor-pointer flex flex-col gap-5 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Avatar */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#D0DDD7] bg-[#E9EFEA] shrink-0">
                      {user.photo ? (
                        <img
                          src={user.photo}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xl text-[#0F4C5C]">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-['Montserrat'] text-xl font-bold text-[#152226] group-hover:text-[#B44D27] transition-colors">
                            {user.name}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-md bg-[#F2F5F3] border border-[#D0DDD7] font-['Red_Hat_Mono'] text-xs font-semibold text-[#152226]">
                            {user.status}
                          </span>
                          {isNewCustomer && (
                            <span className="px-2 py-0.5 rounded-md bg-[#DCFCE7] border border-[#1F7A4C]/30 font-['Red_Hat_Mono'] text-[11px] font-bold text-[#14532D] inline-flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#1F7A4C]" />
                              New Customer Signup
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B44D27] group-hover:translate-x-1 transition-transform">
                          <span>Open Profile</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#4B5E63]">
                        {user.occupation} • <span className="font-medium text-[#152226]">{user.project}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#4B5E63] mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" /> {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> {user.phone}
                        </span>
                        <span className="font-['Red_Hat_Mono'] text-[#0F4C5C] font-semibold tabular-nums">
                          {user.requirement}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conversion Probability Bar Below Each Person */}
                  <div className="pt-4 border-t border-[#D0DDD7] flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#4B5E63]">
                        Conversion Probability
                      </span>
                      <span
                        className={`font-['Red_Hat_Mono'] text-base font-bold tabular-nums ${textColor}`}
                      >
                        {user.probability}%
                      </span>
                    </div>

                    <div
                      className="w-full h-3.5 rounded-full bg-[#E9EFEA] overflow-hidden"
                      role="progressbar"
                      aria-valuenow={user.probability}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Conversion probability for ${user.name}`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{ width: `${user.probability}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {locationLeads.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-white border border-[#D0DDD7] flex flex-col items-center gap-2">
              <Users className="w-6 h-6 text-[#8FA3A8]" />
              <p className="text-xs text-[#4B5E63]">
                No leads match the current scope and minimum probability filter of {minProbability}%.
              </p>
              <button
                onClick={() => {
                  setMinProbability(0);
                  setLeadScope('all_buyers');
                }}
                className="text-xs font-semibold text-[#B44D27] hover:underline cursor-pointer"
              >
                Show All Leads
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
