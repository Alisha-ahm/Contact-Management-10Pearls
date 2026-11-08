import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Contact } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contact?: Contact | null;
  bulkCount?: number;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  contact,
  bulkCount,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  const isBulk = Boolean(bulkCount && bulkCount > 1);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
    >
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 id="delete-modal-title" className="text-base font-semibold text-slate-900">
              {isBulk ? `Delete ${bulkCount} Contacts` : 'Delete Contact'}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            {isBulk ? (
              <>
                Are you sure you want to permanently delete these <strong className="text-slate-900">{bulkCount}</strong> selected contacts? All associated labeled emails, phone numbers, and address details will be purged from the SQL Server database.
              </>
            ) : contact ? (
              <>
                Are you sure you want to delete <strong className="text-slate-900">{contact.firstName} {contact.lastName}</strong> ({contact.title || 'Contact'}{contact.company ? ` at ${contact.company}` : ''})? This action cannot be undone.
              </>
            ) : (
              'Are you sure you want to delete this contact? This action is permanent and will remove all associated contact information.'
            )}
          </p>

          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Notice:</span> All associated email addresses, phone numbers, and location details for this contact will also be removed.
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors border border-slate-300 bg-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : isBulk ? `Confirm Delete (${bulkCount})` : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
