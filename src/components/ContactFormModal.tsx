import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Mail,
  Phone,
  Building2,
  MapPin,
  Star,
  Check,
  AlertCircle
} from 'lucide-react';
import { Contact, EmailEntry, PhoneEntry, EmailLabel, PhoneLabel } from '../types';
import { COUNTRIES } from '../data/countries';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  initialContact?: Contact | null;
  mode: 'create' | 'edit';
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContact,
  mode,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState<Contact['category']>('Clients');
  const [isFavorite, setIsFavorite] = useState(false);

  const [emails, setEmails] = useState<EmailEntry[]>([
    { id: 'em-default-1', email: '', label: 'work', isPrimary: true },
  ]);

  const [phones, setPhones] = useState<PhoneEntry[]>([
    { id: 'ph-default-1', number: '', label: 'work', isPrimary: true },
  ]);

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('United States');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prepopulate form on open or when initialContact changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialContact) {
        setFirstName(initialContact.firstName || '');
        setLastName(initialContact.lastName || '');
        setTitle(initialContact.title || '');
        setCompany(initialContact.company || '');
        setDepartment(initialContact.department || '');
        setCategory(initialContact.category || 'Clients');
        setIsFavorite(Boolean(initialContact.isFavorite));
        setEmails(
          initialContact.emails && initialContact.emails.length > 0
            ? initialContact.emails.map((e) => ({ ...e }))
            : [{ id: `em-${Date.now()}`, email: '', label: 'work', isPrimary: true }]
        );
        setPhones(
          initialContact.phones && initialContact.phones.length > 0
            ? initialContact.phones.map((p) => ({ ...p }))
            : [{ id: `ph-${Date.now()}`, number: '', label: 'work', isPrimary: true }]
        );
        setAddress(initialContact.address || '');
        setCity(initialContact.city || '');
        setState(initialContact.state || '');
        setCountry(initialContact.country || 'United States');
        setNotes(initialContact.notes || '');
      } else {
        // Reset to pristine blank form for create
        setFirstName('');
        setLastName('');
        setTitle('');
        setCompany('');
        setDepartment('');
        setCategory('Clients');
        setIsFavorite(false);
        setEmails([{ id: `em-${Date.now()}`, email: '', label: 'work', isPrimary: true }]);
        setPhones([{ id: `ph-${Date.now()}`, number: '', label: 'work', isPrimary: true }]);
        setAddress('');
        setCity('');
        setState('');
        setCountry('United States');
        setNotes('');
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, mode, initialContact]);

  if (!isOpen) return null;

  // Multi-email helpers
  const handleAddEmail = () => {
    setEmails((prev) => [
      ...prev,
      {
        id: `em-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        email: '',
        label: 'personal',
        isPrimary: prev.length === 0,
      },
    ]);
  };

  const handleRemoveEmail = (id: string) => {
    if (emails.length <= 1) {
      // Just clear content instead of removing sole entry
      setEmails([{ id: `em-${Date.now()}`, email: '', label: 'work', isPrimary: true }]);
      return;
    }
    setEmails((prev) => {
      const remaining = prev.filter((e) => e.id !== id);
      if (!remaining.some((e) => e.isPrimary) && remaining.length > 0) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  const handleEmailChange = (id: string, value: string) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, email: value } : e)));
    if (errors[`email_${id}`]) {
      setErrors((errs) => {
        const next = { ...errs };
        delete next[`email_${id}`];
        return next;
      });
    }
  };

  const handleEmailLabelChange = (id: string, label: EmailLabel) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, label } : e)));
  };

  const handleSetPrimaryEmail = (id: string) => {
    setEmails((prev) => prev.map((e) => ({ ...e, isPrimary: e.id === id })));
  };

  // Multi-phone helpers
  const handleAddPhone = () => {
    setPhones((prev) => [
      ...prev,
      {
        id: `ph-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        number: '',
        label: 'mobile',
        isPrimary: prev.length === 0,
      },
    ]);
  };

  const handleRemovePhone = (id: string) => {
    if (phones.length <= 1) {
      setPhones([{ id: `ph-${Date.now()}`, number: '', label: 'work', isPrimary: true }]);
      return;
    }
    setPhones((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (!remaining.some((p) => p.isPrimary) && remaining.length > 0) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  const handlePhoneChange = (id: string, value: string) => {
    setPhones((prev) => prev.map((p) => (p.id === id ? { ...p, number: value } : p)));
    if (errors[`phone_${id}`]) {
      setErrors((errs) => {
        const next = { ...errs };
        delete next[`phone_${id}`];
        return next;
      });
    }
  };

  const handlePhoneLabelChange = (id: string, label: PhoneLabel) => {
    setPhones((prev) => prev.map((p) => (p.id === id ? { ...p, label } : p)));
  };

  const handleSetPrimaryPhone = (id: string) => {
    setPhones((prev) => prev.map((p) => ({ ...p, isPrimary: p.id === id })));
  };

  // Form Validation & Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required.';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required.';
    }

    // Filter valid emails & phones
    const validEmails = emails.filter((e) => e.email.trim().length > 0);
    const validPhones = phones.filter((p) => p.number.trim().length > 0);

    // Validate email formats if entered
    validEmails.forEach((entry) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(entry.email.trim())) {
        newErrors[`email_${entry.id}`] = 'Please provide a valid email address.';
      }
    });

    if (validEmails.length === 0) {
      newErrors.generalEmail = 'Please provide at least one email address.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Ensure at least one primary is set
    if (!validEmails.some((e) => e.isPrimary) && validEmails.length > 0) {
      validEmails[0].isPrimary = true;
    }
    if (!validPhones.some((p) => p.isPrimary) && validPhones.length > 0) {
      validPhones[0].isPrimary = true;
    }

    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      title: title.trim(),
      company: company.trim(),
      department: department.trim(),
      emails: validEmails.length > 0 ? validEmails : [{ id: `em-${Date.now()}`, email: '', label: 'work', isPrimary: true }],
      phones: validPhones.length > 0 ? validPhones : [{ id: `ph-${Date.now()}`, number: '', label: 'work', isPrimary: true }],
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      notes: notes.trim(),
      category,
      isFavorite,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-[2px] overflow-y-auto"
    >
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 id="contact-form-title" className="text-lg font-semibold text-slate-900">
              {mode === 'edit' ? 'Update Contact Details' : 'Create New Contact'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'edit'
                ? 'Modify contact attributes, email aliases, and phone numbers in the database.'
                : 'Fill in the information below to add a new contact to your directory.'}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Top Section: Names & Favorite */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Identity & Organization
              </span>
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  isFavorite
                    ? 'text-amber-800 bg-amber-50 border border-amber-200'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200'
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                  }`}
                />
                {isFavorite ? 'Starred Favorite' : 'Mark as Favorite'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName) {
                      setErrors((errs) => ({ ...errs, firstName: '' }));
                    }
                  }}
                  placeholder="e.g. Eleanor"
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                    errors.firstName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errors.lastName) {
                      setErrors((errs) => ({ ...errs, lastName: '' }));
                    }
                  }}
                  placeholder="e.g. Vance"
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                    errors.lastName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.lastName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Professional Title / Role
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Principal Software Engineer"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Strata Systems"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Cloud Infrastructure"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category Tag
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Contact['category'])}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Clients">Clients</option>
                  <option value="Partners">Partners</option>
                  <option value="Vendors">Vendors</option>
                  <option value="Team">Team</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Email Addresses (Labeled: Work, Personal, Other) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Email Addresses (Labeled)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddEmail}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Email
              </button>
            </div>

            {errors.generalEmail && (
              <p className="mb-2 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.generalEmail}
              </p>
            )}

            <div className="space-y-2.5">
              {emails.map((entry, idx) => (
                <div key={entry.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50/70 p-2 rounded-lg border border-slate-200">
                  <div className="flex-1 w-full relative">
                    <input
                      type="email"
                      value={entry.email}
                      onChange={(e) => handleEmailChange(entry.id, e.target.value)}
                      placeholder={idx === 0 ? 'primary.email@domain.com' : 'secondary.email@domain.com'}
                      className={`w-full px-3 py-1.5 text-sm rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                        errors[`email_${entry.id}`] ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                    />
                    {errors[`email_${entry.id}`] && (
                      <span className="text-[11px] text-rose-600 block mt-0.5">
                        {errors[`email_${entry.id}`]}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <select
                      value={entry.label}
                      onChange={(e) => handleEmailLabelChange(entry.id, e.target.value as EmailLabel)}
                      className="px-2 py-1.5 text-xs rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="other">Other</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleSetPrimaryEmail(entry.id)}
                      title="Set as primary email"
                      className={`px-2 py-1 text-xs rounded font-medium flex items-center gap-1 border transition-colors ${
                        entry.isPrimary
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {entry.isPrimary && <Check className="w-3 h-3" />}
                      {entry.isPrimary ? 'Primary' : 'Make Primary'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      aria-label="Remove email"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Phone Numbers (Labeled: Work, Mobile, Home, Other) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Phone Numbers (Labeled)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddPhone}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-2 py-1 rounded transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Phone
              </button>
            </div>

            <div className="space-y-2.5">
              {phones.map((entry, idx) => (
                <div key={entry.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50/70 p-2 rounded-lg border border-slate-200">
                  <div className="flex-1 w-full">
                    <input
                      type="tel"
                      value={entry.number}
                      onChange={(e) => handlePhoneChange(entry.id, e.target.value)}
                      placeholder={idx === 0 ? '+1 (555) 012-3456' : '+1 (555) 987-6543'}
                      className="w-full px-3 py-1.5 text-sm rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <select
                      value={entry.label}
                      onChange={(e) => handlePhoneLabelChange(entry.id, e.target.value as PhoneLabel)}
                      className="px-2 py-1.5 text-xs rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="work">Work</option>
                      <option value="mobile">Mobile / Personnel</option>
                      <option value="home">Home</option>
                      <option value="other">Other</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleSetPrimaryPhone(entry.id)}
                      title="Set as primary phone"
                      className={`px-2 py-1 text-xs rounded font-medium flex items-center gap-1 border transition-colors ${
                        entry.isPrimary
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {entry.isPrimary && <Check className="w-3 h-3" />}
                      {entry.isPrimary ? 'Primary' : 'Make Primary'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemovePhone(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      aria-label="Remove phone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Physical Address & Location */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Location & Mailing Address
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 500 Howard Street, Suite 400"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. San Francisco"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. California"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer text-slate-800"
                  >
                    <option value="">Select country...</option>
                    {country && !COUNTRIES.includes(country) && (
                      <option value={country}>{country}</option>
                    )}
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Notes & Remarks */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Profile Notes & Context
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add personal notes, meeting context, project assignments, or communication preferences..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            <span className="text-rose-500">*</span> Required fields
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors border border-slate-300 bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Updated Details' : 'Save Details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
