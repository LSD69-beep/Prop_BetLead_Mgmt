import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BUILDING_LOCATIONS } from '../data/mockData';
import { ConstructionStage } from '../types';
import { GoogleCityMap } from '../components/GoogleCityMap';
import {
  Compass,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Building,
  Users,
  BarChart3,
} from 'lucide-react';

const STAGES: ('All' | ConstructionStage)[] = [
  'All',
  'Already Present',
  'Under Construction',
  'About to Start',
];

export const CompanyProjects: React.FC = () => {
  const { selectedCompany, setSelectedCompany, buyerLeads, navigate } = useApp();
  const [activeStage, setActiveStage] = useState<'All' | ConstructionStage>('All');

  const buildings = BUILDING_LOCATIONS.filter((b) => {
    const matchesCompany = b.companyName === selectedCompany;
    const matchesStage = activeStage === 'All' || b.stage === activeStage;
    return matchesCompany && matchesStage;
  });

  const liveProjectLeadCounts = useMemo(() => {
    const counts = new Map<string, number>();
    buyerLeads.forEach((l) => {
      if (l.id.startsWith('cust_') || l.lastActivityDate === 'Just now') {
        const key = l.project.toLowerCase();
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    });
    return counts;
  }, [buyerLeads]);

  const stageAnalytics = useMemo(() => {
    const companyAll = BUILDING_LOCATIONS.filter((b) => b.companyName === selectedCompany);
    const totalLeads = buildings.reduce((sum, b) => sum + b.leadCount, 0);
    const avgConversion =
      buildings.length > 0
        ? Math.round(buildings.reduce((sum, b) => sum + b.avgConversion, 0) / buildings.length)
        : 0;
    const readyCount = companyAll.filter((b) => b.stage === 'Already Present').length;
    const underConstCount = companyAll.filter((b) => b.stage === 'Under Construction').length;
    const preLaunchCount = companyAll.filter((b) => b.stage === 'About to Start').length;
    return {
      totalLeads,
      avgConversion,
      readyCount,
      underConstCount,
      preLaunchCount,
    };
  }, [buildings, selectedCompany]);

  const getStageBadgeColor = (stage: ConstructionStage) => {
    switch (stage) {
      case 'Already Present':
        return 'bg-[#DCFCE7] text-[#14532D] border-[#1F7A4C]/30';
      case 'Under Construction':
        return 'bg-[#D2E8ED] text-[#09323D] border-[#0F4C5C]/30';
      case 'About to Start':
        return 'bg-[#FCE8E0] text-[#5C220D] border-[#B44D27]/30';
    }
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 bg-[#F2F5F3]">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#4B5E63]">
          <button
            onClick={() => navigate('agent-flats')}
            className="hover:text-[#B44D27] transition-colors cursor-pointer"
          >
            All Companies &amp; Flats
          </button>
          <span>/</span>
          <span className="text-[#152226] font-semibold">{selectedCompany}</span>
        </div>

        {/* Company Header with Dropdown & Stage Filters */}
        <section
          aria-label="Selected developer company"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FCE8E0] text-[#B44D27] font-['Red_Hat_Mono'] text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Developer Portfolio
              </span>
              <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63]">
                RERA Registered Entity
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="font-['Playfair_Display'] text-2xl sm:text-4xl font-bold text-[#152226] text-balance">
                {selectedCompany}
              </h1>

              <select
                aria-label="Switch developer company"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="text-xs bg-[#F2F5F3] border border-[#D0DDD7] rounded-lg px-2.5 py-1.5 text-[#152226] font-semibold cursor-pointer hidden sm:block"
              >
                <option value="Sobha Limited">Sobha Limited</option>
                <option value="Prestige Estates Projects Limited">Prestige Estates</option>
                <option value="Brigade Enterprises Limited">Brigade Enterprises</option>
                <option value="Godrej Properties Limited">Godrej Properties</option>
                <option value="DLF Limited">DLF Limited</option>
              </select>
            </div>

            <p className="text-xs sm:text-sm text-[#4B5E63]">
              Explore live Google Maps coordinates and buyer lead velocity across Already Present, Under Construction, and About to Start stages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {STAGES.map((stage) => {
              const isSelected = activeStage === stage;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setActiveStage(stage)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#B44D27] text-white border-[#B44D27] shadow-xs'
                      : 'bg-[#F2F5F3] text-[#4B5E63] border-[#D0DDD7] hover:text-[#152226] hover:bg-white'
                  }`}
                >
                  {stage}
                </button>
              );
            })}
          </div>
        </section>

        {/* Developer Portfolio Analytics Strip */}
        <section
          aria-label="Developer site analytics"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-4 shadow-xs flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#4B5E63]">Filtered Project Sites</span>
            <span className="font-['Playfair_Display'] text-2xl font-bold text-[#152226] tabular-nums">
              {buildings.length} Locations
            </span>
            <span className="text-[11px] text-[#4B5E63]">
              Ready: {stageAnalytics.readyCount} • Active: {stageAnalytics.underConstCount} • Pre: {stageAnalytics.preLaunchCount}
            </span>
          </div>

          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-4 shadow-xs flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#4B5E63]">Active Buyer Leads</span>
            <span className="font-['Playfair_Display'] text-2xl font-bold text-[#0F4C5C] tabular-nums">
              {stageAnalytics.totalLeads} Leads
            </span>
            <span className="text-[11px] text-[#0F4C5C] font-medium">Across visible developer sites</span>
          </div>

          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-4 shadow-xs flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#4B5E63]">Mean Site Conversion</span>
            <span className="font-['Playfair_Display'] text-2xl font-bold text-[#1F7A4C] tabular-nums flex items-center gap-1.5">
              <BarChart3 className="w-5 h-5 text-[#1F7A4C]" />
              {stageAnalytics.avgConversion}%
            </span>
            <span className="text-[11px] text-[#4B5E63]">Historical site-visit-to-booking</span>
          </div>

          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-4 shadow-xs flex flex-col gap-1">
            <span className="text-xs font-semibold text-[#4B5E63]">GIS Map Coverage</span>
            <span className="font-['Playfair_Display'] text-2xl font-bold text-[#B44D27] tabular-nums">
              Google Maps Live
            </span>
            <span className="text-[11px] text-[#4B5E63]">Click any pin to inspect leads</span>
          </div>
        </section>

        {/* Live Google Maps GIS Portfolio Explorer */}
        <section
          aria-label="Developer building sites Google Map"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-5 sm:p-6 shadow-xs flex flex-col gap-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B44D27] font-['Red_Hat_Mono']">
                Google Maps Platform • Portfolio GIS
              </span>
              <h2 className="font-['Montserrat'] text-lg font-bold text-[#152226]">
                {selectedCompany} — Interactive Project Coordinates
              </h2>
            </div>
            <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63]">
              Click any marker to open buyer leads
            </span>
          </div>

          <GoogleCityMap
            mode="company-projects"
            buildings={buildings}
            selectedCompany={selectedCompany}
            onSelectBuilding={(b) =>
              navigate('agent-location-leads', {
                company: selectedCompany,
                project: b.name,
                place: b.place,
              })
            }
            heightClass="h-[360px] sm:h-[420px]"
          />
        </section>

        {/* Buildings & Embedded Locations Grid */}
        <section aria-label="Company buildings and locations" className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#152226] flex items-center gap-2">
              <Building className="w-5 h-5 text-[#B44D27]" />
              <span>Building Locations &amp; Lead Conversion Cards</span>
            </h2>
            <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63] tabular-nums">
              {buildings.length} sites
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {buildings.map((b) => (
              <article
                key={b.id}
                className="rounded-2xl bg-white border border-[#D0DDD7] hover:border-[#B44D27] p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between gap-5 group"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md border text-xs font-['Red_Hat_Mono'] font-bold ${getStageBadgeColor(
                        b.stage
                      )}`}
                    >
                      {b.stage}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-['Red_Hat_Mono'] font-bold text-[#0F4C5C] bg-[#D2E8ED] px-2 py-0.5 rounded-md">
                      <Users className="w-3 h-3" />
                      {b.leadCount + (liveProjectLeadCounts.get(b.name.toLowerCase()) || 0)} Leads ({b.avgConversion}%)
                    </span>
                  </div>

                  <h3 className="font-['Montserrat'] text-lg font-bold text-[#152226]">
                    {b.name}
                  </h3>

                  <div className="p-3.5 rounded-xl bg-[#F2F5F3] border border-[#D0DDD7] flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#152226] font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#B44D27] shrink-0" />
                      <span>{b.place}</span>
                    </div>
                    <span className="font-['Red_Hat_Mono'] text-[11px] text-[#4B5E63] tabular-nums">
                      GPS: {b.lat.toFixed(4)}° N, {b.lng.toFixed(4)}° E
                    </span>
                    <span className="text-xs text-[#152226] font-medium">{b.units}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate('agent-location-leads', {
                      company: selectedCompany,
                      project: b.name,
                      place: b.place,
                    })
                  }
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F2F5F3] hover:bg-[#B44D27] hover:text-white text-[#152226] font-semibold text-xs border border-[#D0DDD7] transition-all cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Inspect Interested Buyers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </article>
            ))}
          </div>

          {buildings.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-white border border-[#D0DDD7] flex flex-col items-center gap-2">
              <Compass className="w-6 h-6 text-[#8FA3A8]" />
              <p className="text-xs text-[#4B5E63]">
                No projects found in this construction stage for {selectedCompany}.
              </p>
              <button
                onClick={() => setActiveStage('All')}
                className="text-xs font-semibold text-[#B44D27] hover:underline cursor-pointer"
              >
                Show All Stages
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
