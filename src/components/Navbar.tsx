import React from 'react';
import {
  Users,
  LogOut,
  Plus,
  Search
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeView: 'contacts' | 'profile';
  onNavigate: (view: 'contacts' | 'profile') => void;
  onOpenCreateModal: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  onNavigate,
  onOpenCreateModal,
  onLogout,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Brand & Navigation */}
          <div className="flex items-center gap-6">
            <div
              onClick={() => onNavigate('contacts')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900 tracking-tight leading-none text-base">
                  ContactHub
                </span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">
                  Enterprise
                </span>
              </div>
            </div>

            {/* Navigation links (clean typography, no pill shapes) */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('contacts')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeView === 'contacts'
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Contacts Directory
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeView === 'profile'
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Account Profile
              </button>
            </nav>
          </div>

          {/* Center: Search input */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by first name, last name, email, phone..."
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-2 text-[11px] text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions & User Menu */}
          <div className="flex items-center gap-3">
            {/* Create Contact Quick Button */}
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Contact</span>
              <span className="sm:hidden">Add</span>
            </button>

            {/* User Profile Mini Badge */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  title="View user profile"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-semibold text-xs flex items-center justify-center">
                    {currentUser.avatar || 'AW'}
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {currentUser.fullName}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-none">
                      {currentUser.role}
                    </p>
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                  title="Sign out of session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
