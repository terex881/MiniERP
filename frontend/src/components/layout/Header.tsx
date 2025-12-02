'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/utils';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuthStore();

  const roleBadgeVariant = {
    ADMIN: 'danger',
    SUPERVISOR: 'purple',
    OPERATOR: 'info',
    CLIENT: 'success',
  } as const;

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 w-64 lg:w-80">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none w-full"
            />
            <kbd className="hidden lg:inline-flex text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
          </button>

          {/* User menu */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-700">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-200">
                {user?.firstName} {user?.lastName}
              </p>
              <Badge variant={roleBadgeVariant[user?.role || 'OPERATOR']} size="sm">
                {user?.role}
              </Badge>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium shadow-lg shadow-primary-500/25">
              {user ? getInitials(user.firstName, user.lastName) : '?'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

