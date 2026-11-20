import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Building2, TrendingUp, Users } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate, activeHub, setRole } = useApp();

  return (
    <footer className="bg-white border-t border-[#D0DDD7] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-1.5 text-xs text-[#1F7A4C] font-semibold bg-[#DCFCE7] px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% RERA Verified Inventory</span>
          </div>
          <span className="text-xs text-[#4B5E63]">
            © 2026 GlassWindow Advisory Pvt. Ltd. • Unbiased Real Estate Diligence
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#4B5E63]">
          <button
            onClick={() => {
              setRole('customer');
              navigate('customer-city-select');
            }}
            className="hover:text-[#0F4C5C] transition-colors cursor-pointer flex items-center gap-1"
          >
            <Building2 className="w-3.5 h-3.5" />
            Customer Portal
          </button>
          <span className="text-[#8FA3A8]">·</span>
          <button
            onClick={() => {
              setRole('customer');
              navigate('customer-developer-stocks');
            }}
            className="hover:text-[#0F4C5C] transition-colors cursor-pointer flex items-center gap-1"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Developer Stocks
          </button>
          <span className="text-[#8FA3A8]">·</span>
          <button
            onClick={() => {
              setRole('agent');
              navigate('agent-flats');
            }}
            className="hover:text-[#B44D27] transition-colors cursor-pointer flex items-center gap-1"
          >
            <Users className="w-3.5 h-3.5" />
            Agent Portal
          </button>
          <span className="text-[#8FA3A8]">·</span>
          <button
            onClick={() => {
              setRole('agent');
              navigate('agent-lead-dashboard');
            }}
            className="hover:text-[#B44D27] transition-colors cursor-pointer font-semibold text-[#B44D27]"
          >
            Lead Tracker Dashboard
          </button>
        </div>

        <div className="text-xs font-['Red_Hat_Mono'] text-[#4B5E63] tabular-nums">
          {activeHub.name} • {activeHub.regionCode}
        </div>
      </div>
    </footer>
  );
};
