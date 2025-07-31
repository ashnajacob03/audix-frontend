import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  Crown, 
  Check, 
  X, 
  Music, 
  Download, 
  Shuffle, 
  SkipForward, 
  Volume2, 
  Headphones,
  Zap,
  Star,
  ArrowLeft,
  CreditCard,
  Shield
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const Premium = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { userProfile } = useUserProfile();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

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

  const pricingPlans = {
    monthly: {
      price: '$9.99',
      period: '/month',
      savings: null,
      description: 'Perfect for trying out Premium features'
    },
    yearly: {
      price: '$99.99',
      period: '/year',
      savings: 'Save $19.89',
      description: 'Best value - 2 months free!'
    }
  };

  const handleUpgrade = (plan: 'monthly' | 'yearly') => {
    // Here you would integrate with your payment processor (Stripe, PayPal, etc.)
    console.log(`Upgrading to ${plan} plan`);
    // For now, just show an alert
    alert(`Redirecting to payment for ${plan} plan...`);
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
            {isSignedIn && (
              <div className="bg-zinc-900/50 rounded-lg p-4 inline-block">
                <p className="text-zinc-300">
                  Welcome back, <span className="text-white font-medium">
                    {userProfile?.firstName || user?.firstName}
                  </span>!
                  Ready to upgrade your music experience?
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
                <div className="text-4xl font-bold text-white mb-2">$0</div>
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
                Current Plan
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
              
              <button 
                onClick={() => handleUpgrade(selectedPlan)}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#1db954] to-[#1ed760] text-white rounded-lg font-medium hover:from-[#1ed760] hover:to-[#1db954] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Upgrade to Premium
              </button>
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
