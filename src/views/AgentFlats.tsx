import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FLATS_DATABASE } from '../data/mockData';
import {
  Building2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Compass,
  Layers,
  Sparkles,
} from 'lucide-react';

const COMPANIES = [
  'All Companies',
  'Sobha Limited',
  'Prestige Estates Projects Limited',
  'Brigade Enterprises Limited',
  'Godrej Properties Limited',
  'DLF Limited',
];

export const AgentFlats: React.FC = () => {
  const { setSelectedCompany, buyerLeads, navigate } = useApp();
  const [activeCompany, setActiveCompany] = useState<string>('All Companies');

  const filteredFlats = FLATS_DATABASE.filter((flat) => {
    return activeCompany === 'All Companies' || flat.company === activeCompany;
  });

  const handleOpenCompanyProjects = (company: string) => {
    setSelectedCompany(company);
    navigate('agent-company-projects', { company });
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 bg-[#F2F5F3]">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Top Header & Conversion Tracker Banner */}
        <div className="flex flex-col gap-6 pb-6 border-b border-[#D0DDD7]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FCE8E0] text-[#B44D27] font-['Red_Hat_Mono'] text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Agent Portal
                </span>
                <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63]">
                  RERA Partner Directory
                </span>
              </div>

              <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#152226] text-balance">
                Listed flats &amp; developer companies
              </h1>

              <p className="text-sm text-[#4B5E63]">
                Browse all registered real estate partners and inspect their available residential flat inventory.
              </p>
            </div>

            {/* Quick Conversion Dashboard CTA */}
            <button
              onClick={() => navigate('agent-lead-dashboard')}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[#B44D27] hover:bg-[#5C220D] text-white shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
            >
              <TrendingUp className="w-4 h-4" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/80">
                  Lead Management
                </span>
                <span className="text-sm font-bold">Conversion Tracker Dashboard</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/20 font-['Red_Hat_Mono'] text-xs font-bold tabular-nums">
                {buyerLeads.length} Leads
              </span>
            </button>
          </div>
        </div>

        {/* Companies Present Section (Directly links to company building locations!) */}
        <section
          aria-label="Registered developer companies"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-6 shadow-xs flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#B44D27]" />
              <h2 className="text-base font-bold text-[#152226]">Companies Present</h2>
            </div>
            <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63] tabular-nums">
              5 registered developers
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {COMPANIES.map((company) => {
              const isSelected = activeCompany === company;
              if (company === 'All Companies') {
                return (
                  <button
                    key={company}
                    type="button"
                    onClick={() => setActiveCompany('All Companies')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#B44D27] text-white shadow-xs'
                        : 'bg-[#F2F5F3] text-[#4B5E63] hover:text-[#152226] border border-[#D0DDD7]'
                    }`}
                  >
                    All Companies
                  </button>
                );
              }

              return (
                <button
                  key={company}
                  type="button"
                  onClick={() => handleOpenCompanyProjects(company)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#FCE8E0] text-[#B44D27] border-[#B44D27]'
                      : 'bg-white text-[#152226] border-[#D0DDD7] hover:border-[#B44D27] hover:text-[#B44D27]'
                  }`}
                  title="Click to view building locations & projects"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#B44D27]" />
                  <span>{company}</span>
                  <Compass className="w-3.5 h-3.5 text-[#4B5E63] ml-1" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent Customer Signups & Direct Leads */}
        {(() => {
          const recentCustomerLeads = buyerLeads.filter(
            (l) => l.id.startsWith('cust_') || l.lastActivityDate === 'Just now'
          );
          if (recentCustomerLeads.length === 0) return null;
          return (
            <section
              aria-label="Recent customer signups"
              className="rounded-2xl bg-white border border-[#1F7A4C]/30 p-6 shadow-xs flex flex-col gap-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1F7A4C]" />
                  <h2 className="text-base font-bold text-[#152226]">
                    New Customer Signups &amp; Live Inquiries ({recentCustomerLeads.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('agent-lead-dashboard')}
                  className="text-xs font-semibold text-[#B44D27] hover:underline cursor-pointer"
                >
                  Manage all in CRM →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentCustomerLeads.slice(0, 6).map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() =>
                      navigate('agent-lead-profile', {
                        buyerId: lead.id,
                        company: lead.company,
                        project: lead.project,
                        place: lead.place,
                      })
                    }
                    className="p-4 rounded-xl bg-[#F8FAF9] hover:bg-[#FCE8E0]/40 border border-[#D0DDD7] hover:border-[#B44D27] text-left flex flex-col gap-2 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-[#152226] group-hover:text-[#B44D27] truncate">
                        {lead.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#14532D] font-['Red_Hat_Mono'] text-[10px] font-bold shrink-0">
                        {lead.probability}% • {lead.lastActivityDate}
                      </span>
                    </div>
                    <p className="text-xs text-[#4B5E63] truncate">
                      {lead.project} ({lead.company})
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-['Red_Hat_Mono'] text-[#0F4C5C] font-semibold">
                      <span className="truncate">{lead.requirement}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#B44D27] shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Flats Grid */}
        <section aria-label="Agent flat inventory" className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#152226]">Available Inventory</h2>
            <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63] tabular-nums">
              {filteredFlats.length} properties
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {filteredFlats.map((flat) => (
              <article
                key={flat.id}
                className="rounded-2xl bg-white border border-[#D0DDD7] hover:border-[#B44D27] p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between gap-5 group"
              >
                <div className="flex flex-col gap-4">
                  <div className="relative h-52 w-full rounded-xl overflow-hidden bg-[#E9EFEA]">
                    <img
                      src={flat.image}
                      alt={flat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#B44D27]/90 text-white font-['Red_Hat_Mono'] text-xs font-semibold tabular-nums">
                        ★ {flat.score}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-xs text-[#152226] text-xs font-semibold">
                        {flat.city} • {flat.zone}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="font-['Red_Hat_Mono'] text-xs font-semibold text-[#B44D27]">
                        {flat.company}
                      </span>
                      <h3 className="font-['Montserrat'] text-xl font-bold text-[#152226] mt-0.5">
                        {flat.name}
                      </h3>
                      <p className="text-xs text-[#4B5E63] mt-0.5">{flat.locality}</p>
                    </div>

                    <span className="px-2.5 py-1 rounded-md bg-[#DCFCE7] text-[#14532D] font-['Red_Hat_Mono'] text-xs font-semibold tabular-nums shrink-0">
                      RERA Audited
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#D0DDD7]">
                    <div className="flex flex-col">
                      <span className="text-xs text-[#4B5E63]">Price</span>
                      <span className="font-['Red_Hat_Mono'] text-lg font-bold text-[#152226] tabular-nums">
                        {flat.price}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-[#4B5E63]">Efficiency</span>
                      <span className="font-['Red_Hat_Mono'] text-lg font-bold text-[#0F4C5C] tabular-nums flex items-center gap-1">
                        <Layers className="w-4 h-4 text-[#0F4C5C]" />
                        {flat.carpet}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#4B5E63] font-['Red_Hat_Mono'] tabular-nums">
                    {flat.config} • {flat.rate}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenCompanyProjects(flat.company)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#F2F5F3] hover:bg-[#E9EFEA] border border-[#D0DDD7] text-[#152226] font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#B44D27]" />
                    <span>View Projects</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate('agent-location-leads', {
                        company: flat.company,
                        project: flat.name,
                        place: flat.locality,
                      })
                    }
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#B44D27] hover:bg-[#5C220D] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                  >
                    <span>View Leads</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
