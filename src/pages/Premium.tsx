import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useCustomAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import toast from 'react-hot-toast';
import { 
  Crown, 
  Check, 
  X, 
  Download, 
  Volume2, 
  Headphones,
  ArrowLeft,
  CreditCard,
  Shield
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import apiService from '@/services/api';

const Premium = () => {
  const { user, isAuthenticated, updateUser } = useCustomAuth();
  const { userProfile } = useUserProfile();
  const accountType = (user as any)?.accountType || (userProfile as any)?.accountType || 'free';
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const navigate = useNavigate();

  const persistSubscription = async (payload?: { plan?: 'monthly' | 'yearly'; amount?: number; currency?: string; paymentId?: string }): Promise<void> => {
    // Prefer API helper if available; fallback to direct fetch during HMR edge cases
    if (apiService && typeof (apiService as any).updateSubscription === 'function') {
      await (apiService as any).updateSubscription({ accountType: 'premium', subscriptionExpires: null, ...(payload || {}) });
      return;
    }
    let API_BASE_URL: string = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3002/api';
    // Normalize base URL if someone configured it without protocol/host
    if (!/^https?:\/\//i.test(API_BASE_URL)) {
      if (API_BASE_URL.startsWith('//')) {
        API_BASE_URL = `${window.location.protocol}${API_BASE_URL}`;
      } else if (API_BASE_URL.startsWith(':')) {
        API_BASE_URL = `${window.location.protocol}//${window.location.hostname}${API_BASE_URL}`; // e.g. :3002/api -> http://localhost:3002/api (development only)
      } else if (API_BASE_URL.startsWith('/')) {
        API_BASE_URL = `${window.location.origin}${API_BASE_URL}`;
      } else {
        API_BASE_URL = `${window.location.origin}/${API_BASE_URL.replace(/^\/*/, '')}`;
      }
    }
    const token = localStorage.getItem('accessToken');
    const resp = await fetch(`${API_BASE_URL}/user/subscription`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ accountType: 'premium', subscriptionExpires: null, ...(payload || {}) })
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data?.message || 'Server rejected subscription update');
    }
  };

  const handleCancelPremium = async () => {
    try {
      // Update backend subscription to free
      if (apiService && typeof (apiService as any).updateSubscription === 'function') {
        const resp = await (apiService as any).updateSubscription({ accountType: 'free', subscriptionExpires: null });
        if (!(resp as any)?.success) {
          throw new Error((resp as any)?.message || 'Failed to cancel subscription');
        }
      } else {
        let API_BASE_URL: string = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3002/api';
        if (!/^https?:\/\//i.test(API_BASE_URL)) {
          if (API_BASE_URL.startsWith('//')) {
            API_BASE_URL = `${window.location.protocol}${API_BASE_URL}`;
          } else if (API_BASE_URL.startsWith(':')) {
            API_BASE_URL = `${window.location.protocol}//${window.location.hostname}${API_BASE_URL}`;
          } else if (API_BASE_URL.startsWith('/')) {
            API_BASE_URL = `${window.location.origin}${API_BASE_URL}`;
          } else {
            API_BASE_URL = `${window.location.origin}/${API_BASE_URL.replace(/^\/*/, '')}`;
          }
        }
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE_URL}/user/subscription`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ accountType: 'free', subscriptionExpires: null })
        });
        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          throw new Error(data?.message || 'Server rejected subscription update');
        }
      }

      // Update local auth state
      if (user) {
        const updated: any = { ...user, accountType: 'free' };
        updateUser(updated);
      }
      const mongoUserRaw = localStorage.getItem('mongoUser');
      if (mongoUserRaw) {
        try {
          const mongoUser = JSON.parse(mongoUserRaw);
          mongoUser.accountType = 'free';
          localStorage.setItem('mongoUser', JSON.stringify(mongoUser));
        } catch {}
      }

      toast.success('Premium cancelled. You are back on Free plan.');
    } catch (e: any) {
      console.error('Cancel premium error:', e);
      toast.error(e?.message || 'Failed to cancel premium. Please try again.');
    }
  };

  const features = {
    free: [
      { name: 'Limited skips per hour', included: true },
      { name: 'Ads between songs', included: true },
      { name: 'Shuffle play only', included: true },
      { name: 'Standard audio quality', included: true },
      { name: 'Unlimited skips', included: false },
      { name: 'Ad-free listening', included: false },
      { name: 'Offline downloads', included: false },
      { name: 'High-quality audio', included: false },
      { name: 'Play any song', included: false },
    ],
    premium: [
      { name: 'Unlimited skips', included: true },
      { name: 'Ad-free listening', included: true },
      { name: 'Offline downloads', included: true },
      { name: 'High-quality audio (320kbps)', included: true },
      { name: 'Play any song on demand', included: true },
      { name: 'Create unlimited playlists', included: true },
      { name: 'Exclusive content', included: true },
      { name: 'Early access to new features', included: true },
      { name: 'Priority customer support', included: true },
    ]
  };

  // Single source of truth for prices (INR)
  const PRICE_INR = { monthly: 99, yearly: 999 } as const;
  const formatINR = (value: number): string =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  const pricingPlans = {
    monthly: {
      price: formatINR(PRICE_INR.monthly),
      period: '/month',
      savings: null,
      description: 'Perfect for trying out Premium features'
    },
    yearly: {
      price: formatINR(PRICE_INR.yearly),
      period: '/year',
      savings: `Save ${formatINR((PRICE_INR.monthly * 12) - PRICE_INR.yearly)}`,
      description: 'Best value - 2 months free!'
    }
  };

  const handleUpgrade = async (plan: 'monthly' | 'yearly') => {
    const loadRazorpay = (): Promise<boolean> => {
      return new Promise((resolve) => {
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const scriptLoaded = await loadRazorpay();
    if (!scriptLoaded) {
      toast.error('Failed to load payment SDK. Please try again.');
      return;
    }

    const amountInPaise = PRICE_INR[plan] * 100; // amounts in paise (INR)
    const keyFromEnv = (import.meta as any).env?.VITE_RAZORPAY_KEY || '';
    const resolvedKey = keyFromEnv.trim();
    if (!resolvedKey) {
      toast('Simulating payment (no Razorpay key set)', { icon: '🧪' });
      // Simulate a successful payment: try to persist, then update local and redirect
      setTimeout(async () => {
        try {
          await persistSubscription({ plan, amount: PRICE_INR[plan], currency: 'INR', paymentId: 'simulated' });
          if (user) {
            const updated: any = { ...user, accountType: 'premium' };
            updateUser(updated);
          }
          const mongoUserRaw = localStorage.getItem('mongoUser');
          if (mongoUserRaw) {
            try {
              const mongoUser = JSON.parse(mongoUserRaw);
              mongoUser.accountType = 'premium';
              localStorage.setItem('mongoUser', JSON.stringify(mongoUser));
            } catch {}
          }
          toast.success('You are now Premium! Redirecting...');
          navigate('/');
        } catch (e: any) {
          console.error('Failed to persist subscription:', e);
          toast.error(e?.message || 'Failed to update subscription. Please try again.');
        }
      }, 800);
      return;
    }

    const options: any = {
      key: resolvedKey, // test key from env
      amount: amountInPaise,
      currency: 'INR',
      name: 'Audix Premium',
      description: `Upgrade to ${plan} plan`,
      // Use HTTPS image to avoid mixed-content warnings inside Razorpay iframe
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Logo_placeholder.svg',
      handler: async (response: any) => {
        try {
          await persistSubscription({ plan, amount: PRICE_INR[plan], currency: 'INR', paymentId: response?.razorpay_payment_id });
          if (user) {
            const updated: any = { ...user, accountType: 'premium' };
            updateUser(updated);
          }
          const mongoUserRaw = localStorage.getItem('mongoUser');
          if (mongoUserRaw) {
            try {
              const mongoUser = JSON.parse(mongoUserRaw);
              mongoUser.accountType = 'premium';
              localStorage.setItem('mongoUser', JSON.stringify(mongoUser));
            } catch {}
          }
          toast.success('You are now Premium! Redirecting...');
          navigate('/');
        } catch (e: any) {
          console.error('Failed to persist subscription:', e);
          toast.error(e?.message || 'Failed to update subscription. Please contact support.');
        }
        console.log('Razorpay success:', response);
      },
      modal: {
        ondismiss: function () {
          toast('Payment cancelled', { icon: '⚠️' });
        }
      },
      prefill: {
        name: userProfile?.firstName || user?.firstName || 'Audix User',
        email: (user as any)?.email || 'user@example.com',
      },
      notes: {
        plan,
      },
      theme: {
        color: '#1db954',
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.on('payment.failed', function (response: any) {
      console.error('Razorpay failure:', response);
      toast.error('Payment failed. Please try again.');
    });
    paymentObject.open();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#191414] via-[#1db954]/5 to-[#191414]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#191414]/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Music
          </Link>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <span className="text-xl font-bold text-white">Audix Premium</span>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full">
                <Crown className="w-8 h-8 text-black" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Premium</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Unlock the full potential of your music experience with ad-free listening, 
              unlimited skips, and high-quality audio.
            </p>
            {isAuthenticated && (
              <div className="bg-zinc-900/50 rounded-lg p-4 inline-block">
                <p className="text-zinc-300">
                  Welcome back, <span className="text-white font-medium">
                    {userProfile?.firstName || user?.firstName}
                  </span>!
                  {accountType === 'premium' ? ' You already have Premium. Enjoy the music!' : ' Ready to upgrade your music experience?'}
                </p>
              </div>
            )}
          </div>

          {/* Pricing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-zinc-900 p-1 rounded-lg flex">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  selectedPlan === 'monthly'
                    ? 'bg-[#1db954] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-6 py-3 rounded-md font-medium transition-all relative ${
                  selectedPlan === 'yearly'
                    ? 'bg-[#1db954] text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="text-4xl font-bold text-white mb-2">₹0</div>
                <p className="text-zinc-400">Forever free</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {features.free.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-white' : 'text-zinc-500 line-through'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
              
              <button 
                disabled
                className="w-full py-3 px-4 bg-zinc-700 text-zinc-400 rounded-lg font-medium cursor-not-allowed"
              >
                {accountType === 'premium' ? 'Switch to Free' : 'Current Plan'}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-[#1db954]/20 to-yellow-500/20 rounded-2xl p-8 border-2 border-[#1db954] relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-4 py-2 rounded-full text-sm font-bold">
                  MOST POPULAR
                </span>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  {pricingPlans[selectedPlan].price}
                  <span className="text-lg text-zinc-400">{pricingPlans[selectedPlan].period}</span>
                </div>
                {pricingPlans[selectedPlan].savings && (
                  <p className="text-yellow-400 font-medium">{pricingPlans[selectedPlan].savings}</p>
                )}
                <p className="text-zinc-400 mt-2">{pricingPlans[selectedPlan].description}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {features.premium.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#1db954] flex-shrink-0" />
                    <span className="text-white">{feature.name}</span>
                  </li>
                ))}
              </ul>
              
              {accountType !== 'premium' ? (
                <button 
                  onClick={() => handleUpgrade(selectedPlan)}
                  className="w-full py-5 px-8 bg-gradient-to-r from-emerald-700 to-gray-800 hover:from-emerald-600 hover:to-gray-700 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-4 border border-emerald-600/40 hover:border-emerald-500/60 hover:shadow-emerald-500/20 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 -top-1 -left-1 w-[calc(100%+8px)] h-[calc(100%+8px)] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>
                  <CreditCard className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Upgrade to Premium</span>
                </button>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    className="w-full py-3 px-4 bg-zinc-700 text-white rounded-lg font-medium"
                    disabled
                  >
                    You are on Premium
                  </button>
                  <button 
                    onClick={handleCancelPremium}
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel Premium
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Features Showcase */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Why Choose Premium?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#1db954] to-[#1ed760] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ad-Free Listening</h3>
                <p className="text-zinc-400">
                  Enjoy uninterrupted music without any advertisements breaking your flow.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Offline Downloads</h3>
                <p className="text-zinc-400">
                  Download your favorite songs and listen anywhere, even without internet.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">High-Quality Audio</h3>
                <p className="text-zinc-400">
                  Experience crystal-clear sound with 320kbps high-quality audio streaming.
                </p>
              </div>
            </div>
          </div>

          {/* Trust & Security */}
          <div className="bg-zinc-900/30 rounded-2xl p-8 text-center">
            <Shield className="w-12 h-12 text-[#1db954] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Secure & Trusted</h3>
            <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
              Your payment information is protected with bank-level security. 
              Cancel anytime with no hidden fees or commitments.
            </p>
            <div className="flex justify-center items-center gap-8 text-zinc-500">
              <span>🔒 SSL Encrypted</span>
              <span>💳 Secure Payments</span>
              <span>🔄 Cancel Anytime</span>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Premium;

