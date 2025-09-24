import React from 'react';
import AudixTopbar from '@/components/AudixTopbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Settings, User as UserIcon, LogOut, Repeat2, FileText, Bell } from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';

type MenuItem = {
  key: string;
  label: string;
  to?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'danger';
  onClick?: () => void;
};

const SettingsMenu: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useLogout();

  const items: MenuItem[] = [
    { key: 'edit-profile', label: 'Edit profile', to: '/settings?tab=profile', icon: <UserIcon className="w-4 h-4" /> },
    { key: 'account', label: 'Account settings', to: '/settings?tab=account', icon: <Settings className="w-4 h-4" /> },
    { key: 'notifications', label: 'Notifications', to: '/settings?tab=notifications', icon: <Bell className="w-4 h-4" /> },
    { key: 'payment-invoices', label: 'Payment invoices', to: '/PaymentInvoices', icon: <FileText className="w-4 h-4" /> },
    { key: 'switch-account', label: 'Switch account', variant: 'highlight', icon: <Repeat2 className="w-4 h-4" />, onClick: () => logout() },
    { key: 'logout', label: 'Logout', variant: 'danger', icon: <LogOut className="w-4 h-4" />, onClick: () => logout() },
  ];

  return (
    <main className='rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900'>
      <AudixTopbar />
      <ScrollArea className='h-[calc(100vh-180px)]'>
        <div className="p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Account Settings</h1>
              <p className="text-zinc-400 text-sm">Manage your account options</p>
            </div>
          </div>

          {/* Single-layer list with subtle dividers */}
          <ul className="divide-y divide-zinc-700/60">
            {items.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => (item.onClick ? item.onClick() : (item.to && navigate(item.to)))}
                  className={`w-full flex items-center justify-between px-2 sm:px-3 md:px-4 py-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md hover:bg-zinc-800/40 ${
                    item.variant === 'danger' ? 'text-red-400' : item.variant === 'highlight' ? 'text-sky-400' : 'text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {item.icon}
                    <span className={`text-sm ${item.variant === 'danger' ? 'text-red-400' : item.variant === 'highlight' ? 'text-sky-400' : 'text-zinc-100'}`}>{item.label}</span>
                  </span>
                  <ChevronRight className={`w-4 h-4 ${item.variant === 'danger' ? 'text-red-400' : item.variant === 'highlight' ? 'text-sky-400' : 'text-zinc-400'}`} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </ScrollArea>
    </main>
  );
};

export default SettingsMenu;


