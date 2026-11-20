import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Briefcase, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

export const AgentLogin: React.FC = () => {
  const {
    setRole,
    setAgentName,
    setAgentPartnerId,
    navigate,
    agents,
    selectAgentAccount,
    firebaseUser,
    signInWithGoogle,
    authError,
  } = useApp();
  const [username, setUsername] = useState('advisor_vikram');
  const [fullName, setFullName] = useState('Vikramaditya (Senior Advisor)');
  const [partnerId, setPartnerId] = useState('GW-RERA-2048');
  const [password, setPassword] = useState('agentpassword');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole('agent');

    const matchedAgent = agents.find(
      (a) =>
        a.name.toLowerCase() === fullName.toLowerCase() ||
        a.partnerId.toLowerCase() === partnerId.toLowerCase() ||
        a.name.toLowerCase().includes(username.toLowerCase())
    );

    if (matchedAgent) {
      selectAgentAccount(matchedAgent.id);
      setFeedback(
        `Welcome back, ${matchedAgent.name} (${matchedAgent.partnerId}). Opening Agent Portal...`
      );
    } else {
      if (fullName) setAgentName(fullName);
      if (partnerId) setAgentPartnerId(partnerId);
      setFeedback(`Welcome back, ${fullName || username}. Opening your Agent Portal...`);
    }

    setTimeout(() => {
      navigate('agent-flats');
    }, 500);
  };

  const handleSelectDemoAdvisor = (ag: typeof agents[0]) => {
    selectAgentAccount(ag.id);
    setFullName(ag.name);
    setPartnerId(ag.partnerId);
    setUsername(ag.name.toLowerCase().replace(/[^a-z0-9]/g, '_'));
    setPassword('agentpassword');
    setFeedback(`Loaded Advisor ${ag.name} (${ag.partnerId} • ${ag.city})`);
  };

  const handleGoogleAdvisorSignIn = async () => {
    setIsGoogleLoading(true);
    const user = await signInWithGoogle();
    setIsGoogleLoading(false);
    if (user) {
      setRole('agent');
      setFeedback(
        `Google session verified for ${user.email}. Unified Firestore cloud sync active.`
      );
      setTimeout(() => {
        navigate('agent-flats');
      }, 500);
    }
  };

  return (
    <div className="relative flex-1 flex items-center justify-center min-h-[calc(100vh-160px)] py-12 px-4 sm:px-6">
      {/* Local architectural background with soft overlay */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/src/assets/images/dlf_capital_greens_1795183528661.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#F2F5F3]/75 backdrop-blur-xs" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-[#D0DDD7] p-8 shadow-xl flex flex-col gap-6">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-[#FCE8E0] text-[#B44D27] flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="px-3 py-1 rounded-full bg-[#FCE8E0] text-[#5C220D] text-xs font-semibold">
              Authorized Agent Sign In
            </span>
          </div>

          {/* Titles */}
          <div className="flex flex-col gap-1">
            <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#152226]">
              Agent Login
            </h1>
            <p className="text-xs sm:text-sm text-[#4B5E63]">
              Sign in with your verified GlassWindow RERA advisor credentials to manage buyer briefs, site audits, and deal conversions.
            </p>
          </div>

          {/* Pre-registered Advisor Accounts Picker */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#4B5E63] uppercase tracking-wider">
                Authorized Advisors ({agents.length})
              </span>
              <span className="text-[10px] font-['Red_Hat_Mono'] text-[#B44D27] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Sign-In Only
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-[#F2F5F3] rounded-xl border border-[#D0DDD7]">
              {agents.map((ag) => (
                <button
                  key={ag.id}
                  type="button"
                  onClick={() => handleSelectDemoAdvisor(ag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    fullName === ag.name || partnerId === ag.partnerId
                      ? 'bg-[#B44D27] text-white border-[#B44D27] shadow-xs'
                      : 'bg-white text-[#152226] border-[#D0DDD7] hover:border-[#B44D27]'
                  }`}
                >
                  <span>{ag.name}</span>
                  <span className="ml-1 text-[10px] opacity-75 font-['Red_Hat_Mono']">
                    ({ag.city.slice(0, 3)})
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#152226]">Agent Username</label>
              <div className="relative flex items-center">
                <Briefcase className="w-4 h-4 text-[#4B5E63] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your agent username"
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-lg bg-[#F2F5F3] border border-[#D0DDD7] text-sm text-[#152226] focus:border-[#B44D27] focus:bg-white focus:ring-1 focus:ring-[#B44D27] outline-hidden transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#152226]">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#4B5E63] absolute left-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full min-h-[44px] pl-9 pr-10 py-2 rounded-lg bg-[#F2F5F3] border border-[#D0DDD7] text-sm text-[#152226] focus:border-[#B44D27] focus:bg-white focus:ring-1 focus:ring-[#B44D27] outline-hidden transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#4B5E63] hover:text-[#152226] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                {authError}
              </div>
            )}

            {feedback && (
              <div className="p-3 rounded-lg bg-[#DCFCE7] border border-[#1F7A4C]/30 text-[#14532D] text-xs font-medium">
                {feedback}
              </div>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-xl bg-[#B44D27] hover:bg-[#5C220D] text-white font-semibold text-sm transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md"
            >
              <span>Sign in to Agent Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#D0DDD7] w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-[#4B5E63] whitespace-nowrap">
              Cloud Database Sync
            </span>
            <div className="border-t border-[#D0DDD7] w-full" />
          </div>

          <button
            type="button"
            disabled={isGoogleLoading}
            onClick={handleGoogleAdvisorSignIn}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F2F5F3] hover:bg-[#E9EFEA] border border-[#D0DDD7] text-[#152226] font-semibold text-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <ShieldCheck className="w-4 h-4 text-[#B44D27]" />
            <span>
              {firebaseUser
                ? `Cloud Synced (${firebaseUser.email})`
                : isGoogleLoading
                ? 'Connecting Google Account...'
                : 'Connect Google Account for Cloud Telemetry'}
            </span>
          </button>

          <div className="pt-2 border-t border-[#D0DDD7] text-center">
            <button
              type="button"
              onClick={() => navigate('portal-chooser')}
              className="text-xs text-[#4B5E63] hover:text-[#B44D27] transition-colors cursor-pointer"
            >
              ← Back to All Profiles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
