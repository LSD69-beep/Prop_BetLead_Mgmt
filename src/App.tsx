import React, { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PortalChooser } from './views/PortalChooser';
import { CustomerLogin } from './views/CustomerLogin';
import { CitySelection } from './views/CitySelection';
import { HomePreferences } from './views/HomePreferences';
import { MatchingFlats } from './views/MatchingFlats';
import { FlatDetail } from './views/FlatDetail';
import { DeveloperStocks } from './views/DeveloperStocks';
import { AgentLogin } from './views/AgentLogin';
import { AgentFlats } from './views/AgentFlats';
import { CompanyProjects } from './views/CompanyProjects';
import { LocationLeads } from './views/LocationLeads';
import { BuyerProfile } from './views/BuyerProfile';
import { LeadManagementDashboard } from './views/LeadManagementDashboard';

const AppContent: React.FC = () => {
  const { currentView } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'portal-chooser':
        return <PortalChooser />;
      case 'customer-login':
        return <CustomerLogin />;
      case 'customer-city-select':
        return <CitySelection />;
      case 'customer-preferences':
        return <HomePreferences />;
      case 'customer-matching-flats':
        return <MatchingFlats />;
      case 'customer-flat-detail':
        return <FlatDetail />;
      case 'customer-developer-stocks':
        return <DeveloperStocks />;
      case 'agent-login':
        return <AgentLogin />;
      case 'agent-flats':
        return <AgentFlats />;
      case 'agent-company-projects':
        return <CompanyProjects />;
      case 'agent-location-leads':
        return <LocationLeads />;
      case 'agent-lead-profile':
        return <BuyerProfile />;
      case 'agent-lead-dashboard':
        return <LeadManagementDashboard />;
      default:
        return <PortalChooser />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F5F3] text-[#152226]">
      <Header />
      <main className="flex-1 flex flex-col">
        {renderCurrentView()}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuota);
  }, []);

  const mapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

  const appTree = (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );

  return (
    <ErrorBoundary>
      {quotaExceeded && mapsApiKey && (
        <div
          role="alert"
          className="sticky top-0 z-[100] bg-amber-100 border-b border-amber-400 text-amber-950 px-4 py-2.5 text-xs sm:text-sm font-medium flex flex-wrap items-center justify-between gap-3 shadow-sm"
        >
          <span>
            Google Maps demo key quota reached or unavailable. Review limits and upgrade options:{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold text-amber-950 hover:text-amber-800"
            >
              Google Maps Platform AI Studio Quota Guide
            </a>
          </span>
          <button
            type="button"
            onClick={() => setQuotaExceeded(false)}
            className="px-2.5 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
      {mapsApiKey ? (
        <APIProvider
          apiKey={mapsApiKey}
          language="en"
          region="IN"
          onError={() => {
            window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          }}
        >
          {appTree}
        </APIProvider>
      ) : (
        appTree
      )}
    </ErrorBoundary>
  );
}
