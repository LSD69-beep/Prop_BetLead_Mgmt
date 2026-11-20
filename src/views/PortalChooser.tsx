import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Briefcase, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const BACKGROUND_SLIDES = [
  '/src/assets/images/bangalore_residence_tower_1795170527199.jpg',
  '/src/assets/images/delhi_penthouse_interior_1795020658514.jpg',
  '/src/assets/images/hyderabad_highrise_tower_1795020657744.jpg',
  '/src/assets/images/luxury_villa_facade_1795020656675.jpg',
];

export const PortalChooser: React.FC = () => {
  const { setRole, navigate } = useApp();
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % BACKGROUND_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectCustomer = () => {
    setRole('customer');
    navigate('customer-login');
  };

  const handleSelectAgent = () => {
    setRole('agent');
    navigate('agent-login');
  };

  return (
    <div className="relative flex-1 flex items-center justify-center min-h-[calc(100vh-160px)] py-12 px-4 sm:px-6 overflow-hidden">
      {/* Cross-Fading Architectural Background Slideshow */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {BACKGROUND_SLIDES.map((url, idx) => (
          <img
            key={url}
            src={url}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-out animate-ken-burns ${
              idx === slideIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-[#F2F5F3]/55 backdrop-blur-xs" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col gap-8">
        {/* Intro Banner */}
        <div className="flex flex-col items-center text-center gap-3 max-w-xl mx-auto px-8 py-6 rounded-2xl bg-white/90 backdrop-blur-md border border-[#D0DDD7] shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-[#0F4C5C] font-semibold bg-[#D2E8ED] px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Multi-Tenant Real Estate Due Diligence</span>
          </div>

          <h1 className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#152226] tracking-tight">
            Welcome to GlassWindow
          </h1>

          <p className="text-sm sm:text-base text-[#4B5E63] font-normal max-w-md">
            Select your profile to continue. Every listing is backed by 80-point inspections, carpet efficiency metrics, and live developer market health.
          </p>
        </div>

        {/* Two Profile Cards: Customer & Agent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Customer Profile Card */}
          <div
            onClick={handleSelectCustomer}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectCustomer()}
            className="group text-left rounded-2xl bg-white/90 hover:bg-white backdrop-blur-md border border-[#D0DDD7] hover:border-[#0F4C5C] p-8 flex flex-col justify-between gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#D2E8ED] text-[#0F4C5C] flex items-center justify-center transition-transform group-hover:scale-105">
                  <User className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#D2E8ED] text-[#09323D] text-xs font-semibold">
                  Homebuyers
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="font-['Montserrat'] text-2xl font-bold text-[#152226]">
                  Customer
                </h2>
                <p className="text-sm text-[#4B5E63] leading-relaxed">
                  Explore verified flats across Bangalore, Hyderabad, and Delhi. Filter by carpet area efficiency, view true pricing, and inspect developer financial health.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-[#D0DDD7]/60 text-xs text-[#4B5E63]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A4C]" />
                  <span>City &amp; Zone matching with interactive maps</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A4C]" />
                  <span>Developer stock quotes &amp; market health graphs</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D0DDD7] flex items-center justify-between text-[#0F4C5C] font-semibold text-sm group-hover:text-[#09323D]">
              <span>Continue as Customer</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
            </div>
          </div>

          {/* Agent Profile Card */}
          <div
            onClick={handleSelectAgent}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectAgent()}
            className="group text-left rounded-2xl bg-white/90 hover:bg-white backdrop-blur-md border border-[#D0DDD7] hover:border-[#B44D27] p-8 flex flex-col justify-between gap-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#FCE8E0] text-[#B44D27] flex items-center justify-center transition-transform group-hover:scale-105">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#FCE8E0] text-[#5C220D] text-xs font-semibold">
                  Advisors &amp; Agents
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="font-['Montserrat'] text-2xl font-bold text-[#152226]">
                  Agent
                </h2>
                <p className="text-sm text-[#4B5E63] leading-relaxed">
                  Manage assigned buyer briefs, inspect developer building locations, review user leads with conversion probabilities, and track deals in the pipeline dashboard.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-[#D0DDD7]/60 text-xs text-[#4B5E63]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B44D27]" />
                  <span>Company building locations &amp; GIS map pins</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B44D27]" />
                  <span>Lead conversion tracker &amp; Kanban CRM pipeline</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D0DDD7] flex items-center justify-between text-[#B44D27] font-semibold text-sm group-hover:text-[#5C220D]">
              <span>Continue as Agent</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
