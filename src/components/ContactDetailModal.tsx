import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Building2,
  MapPin,
  Star,
  Edit2,
  Trash2,
  Download,
  Copy,
  Check,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Contact } from '../types';
import { storage } from '../services/storage';
import { useToast } from './Toast';

interface ContactDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onToggleFavorite: (id: string) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  isOpen,
  onClose,
  contact,
  onEdit,
  onDelete,
  onToggleFavorite,
}) => {
  const { showToast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen || !contact) return null;

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('info', 'Copied to clipboard', `${label}: ${text}`, 2000);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadVCard = () => {
    const vcard = storage.exportToVCard(contact);
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${contact.firstName}_${contact.lastName}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'vCard Exported', `Downloaded ${contact.firstName} ${contact.lastName}.vcf`);
  };

  const initials = `${contact.firstName[0] || ''}${contact.lastName[0] || ''}`.toUpperCase();

  const getAvatarBg = (color?: string) => {
    switch (color) {
      case 'indigo':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'amber':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cyan':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rose':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'teal':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-[2px] overflow-y-auto"
    >
      <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono text-slate-600">ID: {contact.id}</span>
            <span aria-hidden="true">·</span>
            <span>Category: {contact.category || 'General'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(contact.id)}
              className={`p-1.5 rounded-lg border transition-colors ${
                contact.isFavorite
                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                  : 'bg-white text-slate-400 hover:text-slate-600 border-slate-200'
              }`}
              title={contact.isFavorite ? 'Remove favorite' : 'Mark as favorite'}
            >
              <Star
                className={`w-4 h-4 ${
                  contact.isFavorite ? 'fill-amber-500 text-amber-500' : ''
                }`}
              />
            </button>
            <button
              onClick={handleDownloadVCard}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              title="Export as vCard (.vcf)"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors ml-1"
              aria-label="Close profile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Hero */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-xl border flex items-center justify-center font-semibold text-lg shrink-0 ${getAvatarBg(
                contact.avatarColor
              )}`}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <h2 id="contact-detail-title" className="text-xl font-bold text-slate-900 truncate">
                  {contact.firstName} {contact.lastName}
                </h2>
              </div>
              <p className="text-sm font-medium text-slate-700 mt-0.5">
                {contact.title || 'No Title Specified'}
              </p>
              {contact.company && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {contact.company}
                    {contact.department ? ` · ${contact.department}` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Labeled Email Addresses */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Mail className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Email Addresses
              </h3>
            </div>
            <div className="space-y-2">
              {contact.emails.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-medium uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      {entry.label}
                    </span>
                    <a
                      href={`mailto:${entry.email}`}
                      className="text-sm font-medium text-slate-900 hover:text-indigo-600 truncate underline-offset-2 hover:underline"
                    >
                      {entry.email}
                    </a>
                    {entry.isPrimary && (
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleCopy(entry.email, entry.id, 'Email')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      title="Copy email address"
                    >
                      {copiedId === entry.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={`mailto:${entry.email}`}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      title="Send email"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Labeled Phone Numbers */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Phone className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Phone Numbers
              </h3>
            </div>
            <div className="space-y-2">
              {contact.phones.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-medium uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      {entry.label === 'mobile' ? 'Mobile' : entry.label}
                    </span>
                    <a
                      href={`tel:${entry.number.replace(/\s+/g, '')}`}
                      className="text-sm font-medium text-slate-900 hover:text-indigo-600 truncate font-mono"
                    >
                      {entry.number}
                    </a>
                    {entry.isPrimary && (
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => handleCopy(entry.number, entry.id, 'Phone')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      title="Copy phone number"
                    >
                      {copiedId === entry.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={`tel:${entry.number.replace(/\s+/g, '')}`}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                      title="Call phone number"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Physical Address */}
          {(contact.address || contact.city || contact.country) && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Location & Address
                </h3>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-slate-700">
                {contact.address && <p>{contact.address}</p>}
                <p className="text-slate-600 mt-0.5">
                  {[contact.city, contact.state, contact.country].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Profile Notes
              </h3>
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {contact.notes}
              </div>
            </div>
          )}

          {/* Metadata timestamps */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Added {new Date(contact.createdAt).toLocaleDateString()}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Updated {new Date(contact.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onDelete(contact)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
          >
            <Trash2 className="w-4 h-4" />
            Delete Contact
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors border border-slate-300 bg-white"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onEdit(contact)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <Edit2 className="w-4 h-4" />
              Edit Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
