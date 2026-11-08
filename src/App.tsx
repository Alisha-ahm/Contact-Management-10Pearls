/**
 * Contact Management System - Enterprise Application Entry
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ContactList } from './components/ContactList';
import { ContactFormModal } from './components/ContactFormModal';
import { ContactDetailModal } from './components/ContactDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { UserProfileView } from './components/UserProfileView';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { AuthModal } from './components/AuthModal';
import { ToastProvider, useToast } from './components/Toast';
import { storage, ContactsResponse } from './services/storage';
import { Contact, User, SortConfig, FilterConfig } from './types';
import { slf4j } from './services/logger';

function ContactAppContent() {
  const { showToast } = useToast();

  // Active user session
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [activeView, setActiveView] = useState<'contacts' | 'profile'>('contacts');

  // Contact list state & parameters
  const [dataResponse, setDataResponse] = useState<ContactsResponse>(() =>
    storage.getContacts(
      { searchQuery: '', category: 'All', isFavoriteOnly: false },
      { key: 'name', direction: 'asc' },
      1,
      10
    )
  );

  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    searchQuery: '',
    category: 'All',
    isFavoriteOnly: false,
  });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active target contact for modals
  const [targetContact, setTargetContact] = useState<Contact | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load and refresh contacts
  const refreshContacts = useCallback(() => {
    const res = storage.getContacts(filterConfig, sortConfig, page, pageSize);
    setDataResponse(res);
  }, [filterConfig, sortConfig, page, pageSize]);

  useEffect(() => {
    refreshContacts();
  }, [refreshContacts]);

  // Handle Sort Change
  const handleSortChange = (key: SortConfig['key']) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Handle Filter Change
  const handleFilterChange = (updates: Partial<FilterConfig>) => {
    setFilterConfig((prev) => ({ ...prev, ...updates }));
    setPage(1); // Reset to page 1 on filter change
  };

  // Modal 2: Create Contact Handler
  const handleCreateContact = (data: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const created = storage.createContact(data);
      refreshContacts();
      setIsCreateModalOpen(false);
      showToast(
        'success',
        'Contact Created',
        `${created.firstName} ${created.lastName} has been added to the directory.`
      );
    } catch {
      showToast('error', 'Error', 'Failed to save new contact entity.');
    }
  };

  // Modal 1: Update Contact Handler
  const handleUpdateContact = (data: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!targetContact) return;
    try {
      const updated = storage.updateContact(targetContact.id, data);
      refreshContacts();
      setIsEditModalOpen(false);
      setTargetContact(updated);
      showToast(
        'success',
        'Contact Updated',
        `Details for ${updated.firstName} ${updated.lastName} saved successfully.`
      );
    } catch {
      showToast('error', 'Error', 'Failed to update contact entity.');
    }
  };

  // Modal 3: Delete Contact Confirm Handler (supports single & bulk)
  const handleConfirmDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      if (bulkDeleteIds.length > 0) {
        const count = storage.bulkDelete(bulkDeleteIds);
        setBulkDeleteIds([]);
        setIsDeleteModalOpen(false);
        refreshContacts();
        showToast('success', 'Contacts Deleted', `Successfully purged ${count} contacts from database.`);
      } else if (targetContact) {
        const name = `${targetContact.firstName} ${targetContact.lastName}`;
        storage.deleteContact(targetContact.id);
        setIsDeleteModalOpen(false);
        setIsDetailModalOpen(false);
        setTargetContact(null);
        refreshContacts();
        showToast('success', 'Contact Deleted', `${name} has been removed.`);
      }
      setIsDeleting(false);
    }, 200);
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    const isFav = storage.toggleFavorite(id);
    refreshContacts();
    if (targetContact && targetContact.id === id) {
      setTargetContact((prev) => (prev ? { ...prev, isFavorite: isFav } : null));
    }
  };

  // Auth Operations
  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setIsAuthModalOpen(true);
    showToast('info', 'Signed Out', 'Your active user session has ended.');
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setActiveView('contacts');
    refreshContacts();
  };

  // If no user is logged in, show AuthModal
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <AuthModal
          isOpen={true}
          onSuccess={handleAuthSuccess}
          defaultTab="login"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onLogout={handleLogout}
        searchQuery={filterConfig.searchQuery}
        onSearchChange={(q) => handleFilterChange({ searchQuery: q })}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'contacts' ? (
          <div>
            {/* View Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Directory & Contacts
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Manage enterprise contacts, multiple communication channels, and organizational profiles.
                </p>
              </div>
            </div>

            {/* Contact Listing */}
            <ContactList
              contacts={dataResponse.contacts}
              pagination={dataResponse.pagination}
              totalFiltered={dataResponse.totalFiltered}
              totalAll={dataResponse.totalAll}
              totalFavorites={dataResponse.totalFavorites}
              sortConfig={sortConfig}
              filterConfig={filterConfig}
              onSortChange={handleSortChange}
              onFilterChange={handleFilterChange}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(ps) => {
                setPageSize(ps);
                setPage(1);
              }}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              onOpenEditModal={(c) => {
                setTargetContact(c);
                setIsEditModalOpen(true);
              }}
              onOpenDeleteModal={(c) => {
                setTargetContact(c);
                setBulkDeleteIds([]);
                setIsDeleteModalOpen(true);
              }}
              onOpenBulkDeleteModal={(ids) => {
                setBulkDeleteIds(ids);
                setTargetContact(null);
                setIsDeleteModalOpen(true);
              }}
              onViewContactDetail={(c) => {
                setTargetContact(c);
                setIsDetailModalOpen(true);
              }}
              onToggleFavorite={handleToggleFavorite}
              onRefresh={refreshContacts}
            />
          </div>
        ) : (
          <UserProfileView
            user={currentUser}
            onLogout={handleLogout}
            onOpenChangePassword={() => setIsChangePasswordOpen(true)}
            onProfileUpdated={(up) => setCurrentUser(up)}
            totalContacts={dataResponse.totalAll}
            totalFavorites={dataResponse.totalFavorites}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <span className="font-medium text-slate-700">ContactHub</span>
            <span className="text-slate-400"> — Enterprise Contact Management System</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Modal 2: Create Contact Modal */}
      <ContactFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateContact}
        mode="create"
      />

      {/* Modal 1: Update Contact Modal */}
      <ContactFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setTargetContact(null);
        }}
        onSave={handleUpdateContact}
        initialContact={targetContact}
        mode="edit"
      />

      {/* Modal 3: Delete Contact Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTargetContact(null);
          setBulkDeleteIds([]);
        }}
        onConfirm={handleConfirmDelete}
        contact={targetContact}
        bulkCount={bulkDeleteIds.length}
        isDeleting={isDeleting}
      />

      {/* Detailed Contact Profile Modal */}
      <ContactDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setTargetContact(null);
        }}
        contact={targetContact}
        onEdit={(c) => {
          setIsDetailModalOpen(false);
          setTargetContact(c);
          setIsEditModalOpen(true);
        }}
        onDelete={(c) => {
          setIsDetailModalOpen(false);
          setTargetContact(c);
          setBulkDeleteIds([]);
          setIsDeleteModalOpen(true);
        }}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Modal 4: Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ContactAppContent />
    </ToastProvider>
  );
}
