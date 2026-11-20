import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { City, DirectionZone, Bedrooms, BudgetRange, PropertyPurpose } from '../types';
import {
  Users,
  Briefcase,
  UserCheck,
  Phone,
  Mail,
  CheckCircle,
  X,
  Sparkles,
  ArrowRight,
  UserPlus,
  Database,
} from 'lucide-react';

interface DirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'agents' | 'customers';
}

export const DirectoryManagementModal: React.FC<DirectoryModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'customers',
}) => {
  const {
    agents,
    customers,
    addCustomer,
    selectCustomerAccount,
    selectAgentAccount,
    agentName,
    navigate,
    firebaseUser,
    parameterHistory,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'agents' | 'customers'>(defaultTab);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Customer Form State
  const [custFullName, setCustFullName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custCity, setCustCity] = useState<City>('Bangalore');
  const [custZone, setCustZone] = useState<DirectionZone>('East');
  const [custBedrooms, setCustBedrooms] = useState<Bedrooms>('3 BHK');
  const [custBudget, setCustBudget] = useState<BudgetRange>('1 Cr – 2 Cr');
  const [custPurpose, setCustPurpose] = useState<PropertyPurpose>('Own');
  const [custOccupation, setCustOccupation] = useState('Software Engineering Leader • Global MNC');
  const [custRequirement, setCustRequirement] = useState(
    'High-rise luxury 3 BHK with carpet efficiency > 75%'
  );
  const [custAssignedAgent, setCustAssignedAgent] = useState(agentName);

  if (!isOpen) return null;

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custFullName || !custEmail) return;

    let budgetNum = 165;
    if (custBudget === '< 50 Lakhs') budgetNum = 45;
    else if (custBudget === '50L – 1 Cr') budgetNum = 85;
    else if (custBudget === '1 Cr – 2 Cr') budgetNum = 165;
    else budgetNum = 280;

    const created = addCustomer({
      name: custFullName,
      email: custEmail,
      phone: custPhone || '+91 98450 12345',
      city: custCity,
      zone: custZone,
      preferredBedrooms: custBedrooms,
      budgetRange: custBudget,
      budgetNum,
      purpose: custPurpose,
      occupation: custOccupation,
      requirement: custRequirement,
      assignedAgent: custAssignedAgent,
    });

    setSuccessToast(
      `Customer ${created.name} registered in unified database, synced to buyer leads, and parameter telemetry logged.`
    );
    setShowCreateForm(false);
    setCustFullName('');
    setCustEmail('');
    setCustPhone('');

    setTimeout(() => setSuccessToast(null), 4500);
  };

  const handleLoginAsAgent = (agentId: string) => {
    selectAgentAccount(agentId);
    onClose();
    navigate('agent-flats');
  };

  const handleLoginAsCustomer = (customerId: string) => {
    selectCustomerAccount(customerId);
    onClose();
    navigate('customer-matching-flats');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-[#D0DDD7] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D0DDD7] bg-[#F2F5F3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-['Playfair_Display'] text-xl font-bold text-[#152226]">
                  Unified Directory &amp; Customer Database
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#D2E8ED] text-[#09323D] text-[10px] font-semibold inline-flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  {firebaseUser ? 'Firestore Cloud Active' : 'Local Sync • Ready for Cloud'}
                </span>
              </div>
              <p className="text-xs text-[#4B5E63]">
                Register new customers and track live parameter changes across {parameterHistory.length} recorded metric events.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#4B5E63] hover:text-[#152226] hover:bg-[#E9EFEA] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#DCFCE7] border border-[#1F7A4C]/30 text-[#14532D] text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200">
            <CheckCircle className="w-4 h-4 shrink-0 text-[#1F7A4C]" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Tab Controls & Customer Sign-Up Button Only */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 pt-4 pb-2 gap-3 border-b border-[#D0DDD7]/60">
          <div className="flex items-center p-1 rounded-xl bg-[#E9EFEA] border border-[#D0DDD7] gap-1 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveTab('customers');
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-white text-[#0F4C5C] shadow-xs'
                  : 'text-[#4B5E63] hover:text-[#152226]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Customers &amp; Buyers ({customers.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('agents');
                setShowCreateForm(false);
              }}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'agents'
                  ? 'bg-white text-[#B44D27] shadow-xs'
                  : 'text-[#4B5E63] hover:text-[#152226]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Assigned Advisors ({agents.length})</span>
            </button>
          </div>

          {activeTab === 'customers' && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#0F4C5C] hover:bg-[#09323D] transition-all shadow-xs cursor-pointer"
            >
              {showCreateForm ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Cancel Entry</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>+ Register New Customer</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer Create Form Drawer */}
          {activeTab === 'customers' && showCreateForm && (
            <div className="p-5 rounded-2xl bg-[#F8FAF9] border-2 border-dashed border-[#0F4C5C]/30 shadow-xs animate-in slide-in-from-top-4 duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0F4C5C]" />
                  <h3 className="font-['Playfair_Display'] font-bold text-base text-[#152226]">
                    Register New Customer &amp; Buyer Profile
                  </h3>
                </div>
                <span className="text-[11px] text-[#4B5E63] font-['Red_Hat_Mono']">
                  Persists to Unified Database
                </span>
              </div>

              <form onSubmit={handleCreateCustomer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#152226]">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={custFullName}
                    onChange={(e) => setCustFullName(e.target.value)}
                    placeholder="e.g. Rajesh & Sneha Kulkarni"
                    className="px-3 py-2 rounded-lg bg-white border border-[#D0DDD7] text-xs text-[#152226] focus:border-[#0F4C5C] outline-hidden"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#152226]">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="rajesh.kulkarni@gmail.com"
                    className="px-3 py-2 rounded-lg bg-white border border-[#D0DDD7] text-xs text-[#152226] focus:border-[#0F4C5C] outline-hidden"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#152226]">Phone Number</label>
                  <input
                    type="tel"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+91 98451 99201"
                    className="px-3 py-2 rounded-lg bg-white border border-[#D0DDD7] text-xs text-[#152226] focus:border-[#0F4C5C] outline-hidden"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#152226]">Target City</label>
                  <select
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value as City)}
                    className="px-3 py-2 rounded-lg bg-white border border-[#D0DDD7] text-xs text-[#152226] focus:border-[#0F4C5C] outline-hidden cursor-pointer"
                  >
                    <option value="Bangalore">Bangalore (Bengaluru)</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Delhi">Delhi NCR</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#152226]">Direction Zone</label>
                  <select
                    value={custZone}
                    onChange={(e) => setCustZone(e.target.value as DirectionZone)}
                    className="px-3 py-2 rounded-lg bg-white border border-[#D0DDD7] text-xs text-[#152226] focus:border-[#0F4C5C] outline-hidden cursor-pointer"
                  >
                    <option value="East">East (IT Corridors / Tech Parks)</option>
                    <option value="North">North (Airport Corridor)</option>
                    <option value="South">South (Established Green Belts)</option>
                    <option value="West">West (Central Cultural Enclaves)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#152226]">Purpose</label>
                  <select
                    value={custPurpose}
                    onChange={(e) => setCustPurpose(e.target.value as PropertyPurpose)}
                    className="px-3 py-2 rounded-lg bg-white border border-[#D0DDD7] text-xs text-[#152226] focus:border-[#0F4C5C] outline-hidden cursor-pointer"
                  >
                    <option value="Own">Own / Self-Use</option>
                    <option value="Rental">Rental / Investment Yield</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#152226]">Configuration</label>
                  <select
                    value={custBedrooms}
                    onChange={(e) => setCustBedrooms(e.target.value as Bedrooms)}
                    className="px-3 py-2 rounded-lg bg-white border border-[#D0DDD7] text-xs text-[#152226] focus:border-[#0F4C5C] outline-hidden cursor-pointer"
                  >
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK (1,150 sq.ft)</option>
                    <option value="3 BHK">3 BHK (1,840 sq.ft)</option>
                    <option value="4+ BHK">4+ BHK Penthouse</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#152226]">Budget Range</label>
                  <select
                    value={custBudget}
                    onChange={(e) => setCustBudget(e.target.value as BudgetRange)}
                    className="px-3 py-2 rounded-lg bg-white border border-[#D0DDD7] text-xs text-[#152226] focus:border-[#0F4C5C] outline-hidden cursor-pointer"
                  >
                    <option value="< 50 Lakhs">&lt; 50 Lakhs</option>
                    <option value="50L – 1 Cr">50L – 1 Cr</option>
                    <option value="1 Cr – 2 Cr">1 Cr – 2 Cr</option>
                    <option value="> 2 Cr">&gt; 2 Cr</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#152226]">
                    Assign Advisor / Lead Owner
                  </label>
                  <select
                    value={custAssignedAgent}
                    onChange={(e) => setCustAssignedAgent(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white border border-[#D0DDD7] text-xs text-[#152226] focus:border-[#0F4C5C] outline-hidden cursor-pointer"
                  >
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.name}>
                        {ag.name} ({ag.city} • {ag.tier})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#152226]">Occupation &amp; Profile</label>
                  <input
                    type="text"
                    value={custOccupation}
                    onChange={(e) => setCustOccupation(e.target.value)}
                    placeholder="e.g. Senior Director of Product • Adobe Systems"
                    className="px-3 py-2 rounded-lg bg-white border border-[#D0DDD7] text-xs text-[#152226] focus:border-[#0F4C5C] outline-hidden"
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs font-semibold text-[#152226]">Requirement Notes</label>
                  <input
                    type="text"
                    value={custRequirement}
                    onChange={(e) => setCustRequirement(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white border border-[#D0DDD7] text-xs text-[#152226] focus:border-[#0F4C5C] outline-hidden"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-[#4B5E63] hover:bg-[#E9EFEA] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#0F4C5C] hover:bg-[#09323D] text-white text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Create Customer &amp; Save to Unified DB
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Directory Listings */}
          {activeTab === 'agents' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((ag) => (
                <div
                  key={ag.id}
                  className="p-5 rounded-2xl bg-white border border-[#D0DDD7] hover:border-[#B44D27]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={ag.avatar || '/src/assets/images/bangalore_residence_tower_1795170527199.jpg'}
                        alt={ag.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#D0DDD7] shrink-0"
                      />
                      <div>
                        <h4 className="font-['Playfair_Display'] font-bold text-base text-[#152226]">
                          {ag.name}
                        </h4>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#FCE8E0] text-[#5C220D] text-[10px] font-semibold font-['Red_Hat_Mono']">
                          {ag.partnerId} • {ag.tier}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-[#E9EFEA] text-[#0F4C5C] text-xs font-semibold shrink-0">
                      {ag.city}
                    </span>
                  </div>

                  <div className="text-xs text-[#4B5E63] space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#8FA3A8]" />
                      <span>{ag.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#8FA3A8]" />
                      <span>{ag.phone}</span>
                    </div>
                    {ag.specialization && (
                      <p className="pt-1 text-[11px] text-[#152226] font-medium">
                        Focus: {ag.specialization}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#D0DDD7]/70 text-xs">
                    <div className="flex items-center gap-3 text-[#4B5E63]">
                      <span>
                        Rating: <strong className="text-[#152226]">★ {ag.rating.toFixed(1)}</strong>
                      </span>
                      <span>
                        Deals: <strong className="text-[#152226]">{ag.closedDealsCount}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => handleLoginAsAgent(ag.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FCE8E0] hover:bg-[#B44D27] text-[#B44D27] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Sign in as Agent</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers.map((cust) => (
                <div
                  key={cust.id}
                  className="p-5 rounded-2xl bg-white border border-[#D0DDD7] hover:border-[#0F4C5C]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-['Playfair_Display'] font-bold text-base text-[#152226]">
                          {cust.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md bg-[#D2E8ED] text-[#09323D] text-[10px] font-semibold">
                          {cust.preferredBedrooms}
                        </span>
                      </div>
                      <p className="text-xs text-[#4B5E63]">{cust.occupation}</p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-[#E9EFEA] text-[#0F4C5C] text-xs font-semibold shrink-0">
                      {cust.zone} {cust.city}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F2F5F3] border border-[#D0DDD7]/60 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#4B5E63]">Budget Range:</span>
                      <span className="font-semibold text-[#152226]">{cust.budgetRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4B5E63]">Purpose:</span>
                      <span className="font-semibold text-[#152226]">
                        {cust.purpose === 'Own' ? 'Self-Use (Own)' : 'Rental Investment'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#4B5E63]">Assigned Advisor:</span>
                      <span className="font-semibold text-[#0F4C5C]">
                        {cust.assignedAgent || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#D0DDD7]/70 text-xs">
                    <div className="flex items-center gap-1.5 text-[#4B5E63] text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-[#8FA3A8]" />
                      <span className="truncate max-w-[140px]">{cust.email}</span>
                    </div>

                    <button
                      onClick={() => handleLoginAsCustomer(cust.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#D2E8ED] hover:bg-[#0F4C5C] text-[#0F4C5C] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Sign in as Buyer</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
