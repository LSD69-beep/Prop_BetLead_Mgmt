import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LeadStatus } from '../types';
import {
  ShieldCheck,
  TrendingUp,
  Mail,
  Phone,
  Home,
  Clock,
  Users,
  Compass,
  FileText,
  DollarSign,
  ArrowRight,
  Send,
  Sliders,
} from 'lucide-react';

const STATUS_OPTIONS: LeadStatus[] = [
  'Initial Inquiry',
  'Audit Report Viewed',
  'Callback Requested',
  'Shortlisted',
  'Site Visit Scheduled',
  'Site Visit Completed',
  'Loan Pre-Approved',
  'Negotiation',
  'Advance Placed',
  'Closed / Dropped',
];

export const BuyerProfile: React.FC = () => {
  const {
    selectedBuyerId,
    buyerLeads,
    updateLeadStatus,
    updateLeadProbability,
    addLeadNote,
    navigate,
    selectedCompany,
    selectedProjectName,
    selectedProjectPlace,
  } = useApp();

  const [noteInput, setNoteInput] = useState('');
  const [showNoteSuccess, setShowNoteSuccess] = useState(false);

  const buyer =
    buyerLeads.find((b) => b.id === selectedBuyerId) || buyerLeads[0];

  const handleStatusChange = (newStatus: LeadStatus) => {
    updateLeadStatus(buyer.id, newStatus);
  };

  const handleProbSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLeadProbability(buyer.id, parseInt(e.target.value, 10));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    addLeadNote(buyer.id, noteInput.trim());
    setNoteInput('');
    setShowNoteSuccess(true);
    setTimeout(() => setShowNoteSuccess(false), 2000);
  };

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
        <div className="flex items-center justify-between text-xs text-[#4B5E63]">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                navigate('agent-location-leads', {
                  company: selectedCompany,
                  project: selectedProjectName,
                  place: selectedProjectPlace,
                })
              }
              className="hover:text-[#B44D27] transition-colors cursor-pointer"
            >
              Location User Leads
            </button>
            <span>/</span>
            <span className="text-[#152226] font-semibold">{buyer.name}</span>
          </div>

          <button
            onClick={() => navigate('agent-lead-dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B44D27] hover:underline cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Open in Lead Management Dashboard</span>
          </button>
        </div>

        {/* Profile Hero Card */}
        <section
          aria-label="Buyer profile summary"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col gap-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-[#D0DDD7] bg-[#E9EFEA] shrink-0">
                {buyer.photo ? (
                  <img
                    src={buyer.photo}
                    alt={buyer.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-[#0F4C5C]">
                    {buyer.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#DCFCE7] text-[#14532D] font-['Red_Hat_Mono'] text-xs font-semibold">
                    {buyer.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FCE8E0] text-[#5C220D] font-['Red_Hat_Mono'] text-xs font-semibold">
                    {buyer.project} • {buyer.place}
                  </span>
                </div>

                <h1 className="font-['Playfair_Display'] text-2xl sm:text-4xl font-bold text-[#152226] text-balance">
                  {buyer.name}
                </h1>

                <p className="text-sm text-[#4B5E63]">{buyer.occupation}</p>
                <p className="text-xs text-[#8FA3A8]">Assigned to: {buyer.assignedAgent || 'Unassigned'}</p>
              </div>
            </div>

            {/* Quick Stage Progression Controls */}
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#F2F5F3] border border-[#D0DDD7] shrink-0 min-w-[260px]">
              <label className="text-xs font-semibold text-[#152226]">Update Lead Stage</label>
              <select
                aria-label="Update lead stage"
                value={buyer.status}
                onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#D0DDD7] text-xs font-semibold text-[#152226] focus:border-[#B44D27] cursor-pointer"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between text-[11px] text-[#4B5E63] pt-1">
                <span>Adjust Probability:</span>
                <span className="font-['Red_Hat_Mono'] font-bold text-[#152226]">
                  {buyer.probability}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                aria-label="Conversion probability slider"
                value={buyer.probability}
                onChange={handleProbSliderChange}
                className="w-full h-2 bg-[#D0DDD7] rounded-lg appearance-none cursor-pointer accent-[#B44D27]"
              />
            </div>
          </div>

          {/* Conversion Probability Bar */}
          <div className="pt-4 border-t border-[#D0DDD7] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#4B5E63] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#B44D27]" />
                Conversion Probability Score
              </span>
              <span
                className={`font-['Red_Hat_Mono'] text-lg font-bold tabular-nums ${getTextColor(
                  buyer.probability
                )}`}
              >
                {buyer.probability}%
              </span>
            </div>

            <div
              className="w-full h-4 rounded-full bg-[#E9EFEA] overflow-hidden"
              role="progressbar"
              aria-valuenow={buyer.probability}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${getBarColor(
                  buyer.probability
                )}`}
                style={{ width: `${buyer.probability}%` }}
              />
            </div>
          </div>
        </section>

        {/* Two-Column Detailed Information */}
        <section
          aria-label="Full buyer details"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Card 1: Personal & Contact Information */}
          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-8 shadow-xs flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#D0DDD7]">
              <h2 className="font-['Montserrat'] text-xl font-bold text-[#152226]">
                Personal &amp; Contact Information
              </h2>
              <span className="text-xs font-semibold text-[#0F4C5C] bg-[#D2E8ED] px-2.5 py-1 rounded-md">
                Verified Contact
              </span>
            </div>

            <dl className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email ID
                </dt>
                <dd className="font-['Red_Hat_Mono'] text-sm text-[#0F4C5C] text-right">
                  <a href={`mailto:${buyer.email}`} className="hover:underline">
                    {buyer.email}
                  </a>
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone Number
                </dt>
                <dd className="font-['Red_Hat_Mono'] text-sm font-semibold text-[#152226] tabular-nums text-right">
                  <a href={`tel:${buyer.phone}`} className="hover:text-[#0F4C5C]">
                    {buyer.phone}
                  </a>
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63] flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" /> Current Residence
                </dt>
                <dd className="font-semibold text-sm text-[#152226] text-right">
                  {buyer.city}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Preferred Contact Time
                </dt>
                <dd className="font-medium text-sm text-[#152226] text-right">
                  {buyer.contactTime}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-[#4B5E63] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Family Size
                </dt>
                <dd className="font-semibold text-sm text-[#152226] text-right">
                  {buyer.family}
                </dd>
              </div>
            </dl>
          </div>

          {/* Card 2: Buying Preferences & Financial Readiness */}
          <div className="rounded-2xl bg-white border border-[#D0DDD7] p-8 shadow-xs flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#D0DDD7]">
              <h2 className="font-['Montserrat'] text-xl font-bold text-[#152226]">
                Buying Preferences &amp; Finance
              </h2>
              <span className="text-xs font-semibold text-[#14532D] bg-[#DCFCE7] px-2.5 py-1 rounded-md">
                Pre-Qualified
              </span>
            </div>

            <dl className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Purchase Purpose</dt>
                <dd className="font-semibold text-sm text-[#152226] text-right">{buyer.purpose}</dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Flat Configuration</dt>
                <dd className="font-semibold text-sm text-[#152226] text-right">{buyer.config}</dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Budget Range</dt>
                <dd className="font-['Red_Hat_Mono'] text-base font-bold text-[#152226] tabular-nums text-right">
                  {buyer.budget}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#D0DDD7]/70">
                <dt className="text-sm text-[#4B5E63]">Home Loan Status</dt>
                <dd className="font-semibold text-sm text-[#1F7A4C] text-right">{buyer.loan}</dd>
              </div>

              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-[#4B5E63]">Target Possession</dt>
                <dd className="font-semibold text-sm text-[#152226] text-right">
                  {buyer.possession}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Recent Activity & Advisor Notes Card with Note Input */}
        <section
          aria-label="Buyer activity and advisor notes"
          className="rounded-2xl bg-white border border-[#D0DDD7] p-6 sm:p-8 shadow-xs flex flex-col gap-6"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#D0DDD7]">
            <h2 className="font-['Montserrat'] text-xl font-bold text-[#152226] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#B44D27]" />
              <span>Activity &amp; Advisor Notes</span>
            </h2>
            <span className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63]">
              Last interaction: {buyer.lastActivityDate}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F2F5F3] border border-[#D0DDD7] whitespace-pre-line text-sm text-[#152226] leading-relaxed">
            {buyer.notes}
          </div>

          {/* Add New Note Form */}
          <form onSubmit={handleAddNote} className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-[#152226]">
              Add Quick Interaction Note
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Log phone call, scheduled inspection, or revised price expectation..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F2F5F3] border border-[#D0DDD7] text-sm text-[#152226] focus:border-[#B44D27] focus:bg-white focus:ring-1 focus:ring-[#B44D27] outline-hidden"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#B44D27] hover:bg-[#5C220D] text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>
            {showNoteSuccess && (
              <span className="text-xs text-[#1F7A4C] font-semibold">
                ✓ Note saved and appended to buyer activity history!
              </span>
            )}
          </form>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#D0DDD7] flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() =>
                navigate('agent-location-leads', {
                  company: selectedCompany,
                  project: selectedProjectName,
                  place: selectedProjectPlace,
                })
              }
              className="text-xs text-[#4B5E63] hover:text-[#B44D27] font-semibold cursor-pointer"
            >
              ← Back to Location User Leads
            </button>

            <button
              onClick={() => navigate('agent-lead-dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F4C5C] hover:bg-[#09323D] text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"
            >
              <span>View in Lead Management Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
