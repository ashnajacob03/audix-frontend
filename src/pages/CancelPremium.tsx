import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AudixTopbar from '@/components/AudixTopbar';
import { useCustomAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import { toast } from 'react-hot-toast';
import { ShieldAlert, Crown, ArrowLeft } from 'lucide-react';

const CancelPremium = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useCustomAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const resp = await apiService.updateSubscription({ accountType: 'free', subscriptionExpires: null });
      if (!(resp as any)?.success) {
        throw new Error((resp as any)?.message || 'Failed to cancel premium');
      }
      if (user) {
        updateUser({ ...(user as any), accountType: 'free' } as any);
      }
      const mongoUserRaw = localStorage.getItem('mongoUser');
      if (mongoUserRaw) {
        try {
          const mongoUser = JSON.parse(mongoUserRaw);
          mongoUser.accountType = 'free';
          localStorage.setItem('mongoUser', JSON.stringify(mongoUser));
        } catch {}
      }
      toast.success('Your subscription has been cancelled.');
      navigate('/settings');
    } catch (e: any) {
      console.error('Cancel premium error:', e);
      toast.error(e?.message || 'Failed to cancel premium');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900 min-h-screen'>
      <AudixTopbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/settings" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>

        <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Cancel Premium</h1>
          <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
            Are you sure you want to cancel your <span className="text-yellow-400 inline-flex items-center gap-1"><Crown className="w-4 h-4" /> Premium</span> subscription?
            You will lose access to ad-free listening, offline downloads, and high-quality audio immediately.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 disabled:opacity-50"
            >
              Keep Premium
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Cancelling...' : 'Yes, cancel now'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CancelPremium;


