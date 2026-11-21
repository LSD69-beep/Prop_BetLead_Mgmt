import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TENANT_HUBS } from '../data/mockData';
import { OmniSearchModal } from './OmniSearchModal';
import { DirectoryManagementModal } from './DirectoryManagementModal';
import {
  Building2,
  Users,
  Compass,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  ArrowLeft,
  LogOut,
  MapPin,
  Search,
  UserPlus,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    currentView,
    navigate,
    goBack,
    canGoBack,
    activeHub,
    setActiveHub,
    customerName,
    agentName,
    buyerLeads,
    isDirectoryModalOpen,
    setIsDirectoryModalOpen,
  } = useApp();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isLoginView = currentView === 'customer-login' || currentView === 'agent-login';

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePortalSwitch = (newRole: 'customer' | 'agent') => {
    setRole(newRole);
    navigate(newRole === 'customer' ? 'customer-login' : 'agent-login');
  };

  const handleSignOut = () => {
    setRole(null);
    navigate('portal-chooser');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D0DDD7] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">
        {/* Zone 1: Brand & Hub Identity */}
        <div className="flex items-center gap-4 shrink-0">
          {canGoBack && currentView !== 'portal-chooser' && (
            <button
              onClick={goBack}
              title="Go back to previous page"
              className="w-9 h-9 rounded-md bg-[#E9EFEA] border border-[#D0DDD7] text-[#152226] hover:bg-[#DDE6E0] hover:text-[#0F4C5C] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => navigate('portal-chooser')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <span
              className={`w-9 h-9 rounded-lg ${
                role === 'agent' ? 'bg-[#B44D27]' : 'bg-[#0F4C5C]'
              } text-white flex items-center justify-center transition-transform duration-150 group-hover:scale-105 shadow-xs`}
            >
              <span className="material-symbols-outlined text-[20px]">window</span>
            </span>
            <div className="flex flex-col">
              <span className="font-['Playfair_Display'] text-xl font-bold tracking-tight text-[#0F4C5C]">
                GlassWindow
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#4B5E63]">
                {role === 'agent'
                  ? 'Advisor & Broker Portal'
                  : role === 'customer'
                  ? 'Homebuyer Advisory'
                  : 'Due Diligence Platform'}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single line, clean typography) */}
        {role && !isLoginView && (
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#4B5E63]">
            {role === 'customer' ? (
              <>
                <button
                  onClick={() => navigate('customer-city-select')}
                  className={`hover:text-[#0F4C5C] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'customer-city-select' ? 'text-[#0F4C5C] font-semibold' : ''
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Select City
                </button>
                <button
                  onClick={() => navigate('customer-preferences')}
                  className={`hover:text-[#0F4C5C] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'customer-preferences' ? 'text-[#0F4C5C] font-semibold' : ''
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Preferences
                </button>
                <button
                  onClick={() => navigate('customer-matching-flats')}
                  className={`hover:text-[#0F4C5C] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'customer-matching-flats' || currentView === 'customer-flat-detail'
                      ? 'text-[#0F4C5C] font-semibold'
                      : ''
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Matching Flats
                </button>
                <button
                  onClick={() => navigate('customer-developer-stocks')}
                  className={`hover:text-[#0F4C5C] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'customer-developer-stocks' ? 'text-[#0F4C5C] font-semibold' : ''
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Developer Stocks
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('agent-flats')}
                  className={`hover:text-[#B44D27] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'agent-flats' ? 'text-[#B44D27] font-semibold' : ''
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Flats & Companies
                </button>
                <button
                  onClick={() => navigate('agent-company-projects', { company: 'Sobha Limited' })}
                  className={`hover:text-[#B44D27] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'agent-company-projects' ? 'text-[#B44D27] font-semibold' : ''
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Building Locations
                </button>
                <button
                  onClick={() =>
                    navigate('agent-location-leads', {
                      company: 'Sobha Limited',
                      project: 'Sobha Neopolis',
                      place: 'Panathur Road, East Bengaluru',
                    })
                  }
                  className={`hover:text-[#B44D27] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    currentView === 'agent-location-leads' || currentView === 'agent-lead-profile'
                      ? 'text-[#B44D27] font-semibold'
                      : ''
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Buyer Leads ({buyerLeads.length})
                </button>
                <button
                  onClick={() => navigate('agent-lead-dashboard')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    currentView === 'agent-lead-dashboard'
                      ? 'bg-[#FCE8E0] text-[#B44D27] border border-[#B44D27]/30'
                      : 'bg-[#F2F5F3] text-[#152226] hover:bg-[#E9EFEA] border border-[#D0DDD7]'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#B44D27]" />
                  Conversion Tracker
                </button>
              </>
            )}
          </nav>
        )}

        {/* Zone 3: Actions, Search Bar & Multi-Tenant Hub Selector */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Universal Search Bar Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            title="Search flats, developers, locations, leads (⌘K)"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F2F5F3] hover:bg-[#E9EFEA] border border-[#D0DDD7] text-xs text-[#4B5E63] hover:text-[#152226] transition-colors cursor-pointer group shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 text-[#0F4C5C] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.2 text-[10px] font-['Red_Hat_Mono'] font-semibold bg-white border border-[#D0DDD7] rounded text-[#4B5E63]">
              ⌘K
            </kbd>
          </button>

          {/* Global Multi-Tenant Accounts & Directory Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsDirectoryModalOpen(true)}
            title="Manage and create Agents & Customers"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E9EFEA] hover:bg-[#DDE6E0] border border-[#D0DDD7] text-xs font-semibold text-[#0F4C5C] hover:text-[#09323D] transition-colors cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#B44D27]" />
            <span className="hidden sm:inline">Directory</span>
          </button>

          {/* Multi-Tenant Hub Selector */}
          <div className="relative hidden md:block">
            <select
              aria-label="Select active regional hub"
              value={activeHub.id}
              onChange={(e) => {
                const found = TENANT_HUBS.find((h) => h.id === e.target.value);
                if (found) setActiveHub(found);
              }}
              className="text-xs bg-[#F2F5F3] hover:bg-[#E9EFEA] border border-[#D0DDD7] rounded-md px-2.5 py-1.5 text-[#152226] font-medium pr-7 focus:ring-1 focus:ring-[#0F4C5C] focus:border-[#0F4C5C] transition-colors cursor-pointer appearance-none"
            >
              {TENANT_HUBS.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.name} ({hub.city})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#4B5E63] absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Quick Portal Switcher (Customer <-> Agent) */}
          {isLoginView ? null : role ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePortalSwitch(role === 'customer' ? 'agent' : 'customer')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                  role === 'customer'
                    ? 'bg-[#FCE8E0] text-[#B44D27] border-[#B44D27]/30 hover:bg-[#FCE8E0]/80'
                    : 'bg-[#D2E8ED] text-[#0F4C5C] border-[#0F4C5C]/30 hover:bg-[#D2E8ED]/80'
                }`}
                title={`Switch to ${role === 'customer' ? 'Agent' : 'Customer'} Portal`}
              >
                Switch to {role === 'customer' ? 'Agent' : 'Customer'}
              </button>

              <button
                onClick={handleSignOut}
                title="Sign out of current portal"
                className="p-1.5 text-[#4B5E63] hover:text-[#B91C1C] rounded-md hover:bg-[#E9EFEA] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('customer-login')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#0F4C5C] text-white hover:bg-[#09323D] transition-colors whitespace-nowrap cursor-pointer shadow-xs"
              >
                Customer Login
              </button>
              <button
                onClick={() => navigate('agent-login')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#B44D27] text-white hover:bg-[#5C220D] transition-colors whitespace-nowrap cursor-pointer shadow-xs"
              >
                Agent Portal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Universal Search Modal */}
      <OmniSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Directory & Multi-Tenant User Management Modal */}
      <DirectoryManagementModal
        isOpen={isDirectoryModalOpen}
        onClose={() => setIsDirectoryModalOpen(false)}
      />
    </header>
  );
};
