import React, { useState } from 'react';
import {
  User as UserIcon,
  Shield,
  KeyRound,
  LogOut,
  Calendar,
  Save
} from 'lucide-react';
import { User } from '../types';
import { storage } from '../services/storage';
import { useToast } from './Toast';

interface UserProfileViewProps {
  user: User;
  onLogout: () => void;
  onOpenChangePassword: () => void;
  onProfileUpdated: (updatedUser: User) => void;
  totalContacts: number;
  totalFavorites: number;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  onLogout,
  onOpenChangePassword,
  onProfileUpdated,
  totalContacts,
  totalFavorites,
}) => {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone || '');
  const [company, setCompany] = useState(user.company || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('error', 'Name Required', 'User full name cannot be blank.');
      return;
    }

    setIsSaving(true);
    try {
      const res = storage.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
      });
      onProfileUpdated(res.user);
      setIsEditing(false);
      showToast('success', 'Profile Saved', 'Your user account details have been updated.');
    } catch {
      showToast('error', 'Update Failed', 'Could not update user profile.');
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account & Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal profile, credentials, authentication security, and session.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-300 hover:border-rose-200 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center shadow-sm">
            <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
              {user.avatar || 'US'}
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-4">{user.fullName}</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">{user.company || 'Enterprise'}</p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">Active Session · Authenticated</span>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Total Contacts</span>
                <span className="font-semibold text-slate-900">{totalContacts}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Starred Contacts</span>
                <span className="font-semibold text-slate-900">{totalFavorites}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Account Role</span>
                <span className="font-medium text-slate-700">{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: User Details & Credentials */}
        <div className="md:col-span-2 space-y-6">
          {/* User Details Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-900">User Profile Details</h3>
              </div>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 px-2.5 py-1 rounded transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2.5 py-1 rounded"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="p-6">
              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 block">Full Name</span>
                    <span className="font-medium text-slate-900">{user.fullName}</span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block">Email Address</span>
                    <span className="font-medium text-slate-900">
                      {user.email || 'None (Registered with phone)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block">Phone Number</span>
                    <span className="font-medium text-slate-900">
                      {user.phone || 'Not specified'}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block">Company / Organization</span>
                    <span className="font-medium text-slate-900">
                      {user.company || 'Not specified'}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block">Account ID</span>
                    <span className="font-mono text-xs text-slate-700">{user.id}</span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block">Registered Date</span>
                    <span className="font-medium text-slate-900 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Organization name"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3.5 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Security & Password Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-slate-100 text-slate-700">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Security & Password</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Keep your account secure with a strong password. Changing your password requires verifying your current credentials.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenChangePassword}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:border-slate-400 rounded-lg hover:bg-slate-50 transition-colors shadow-sm shrink-0"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
