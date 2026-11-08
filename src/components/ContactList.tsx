import React, { useState, useRef } from 'react';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  Mail,
  Phone,
  Building2,
  Trash2,
  Edit2,
  Eye,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  CheckSquare,
  Square,
  FileSpreadsheet,
  RotateCcw,
  Copy,
  Check
} from 'lucide-react';
import { Contact, SortConfig, FilterConfig, PaginationConfig } from '../types';
import { storage } from '../services/storage';
import { useToast } from './Toast';

interface ContactListProps {
  contacts: Contact[];
  pagination: PaginationConfig;
  totalFiltered: number;
  totalAll: number;
  totalFavorites: number;
  sortConfig: SortConfig;
  filterConfig: FilterConfig;
  onSortChange: (key: SortConfig['key']) => void;
  onFilterChange: (filters: Partial<FilterConfig>) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (contact: Contact) => void;
  onOpenDeleteModal: (contact: Contact) => void;
  onOpenBulkDeleteModal: (selectedIds: string[]) => void;
  onViewContactDetail: (contact: Contact) => void;
  onToggleFavorite: (id: string) => void;
  onRefresh: () => void;
}

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  pagination,
  totalFiltered,
  totalAll,
  totalFavorites,
  sortConfig,
  filterConfig,
  onSortChange,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onOpenBulkDeleteModal,
  onViewContactDetail,
  onToggleFavorite,
  onRefresh,
}) => {
  const { showToast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bulk select toggles
  const isAllSelected = contacts.length > 0 && contacts.every((c) => selectedIds.includes(c.id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      const pageIds = contacts.map((c) => c.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyText = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('info', 'Copied to clipboard', `${label}: ${text}`, 2000);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export functions
  const handleExportCSV = () => {
    const listToExport =
      selectedIds.length > 0
        ? contacts.filter((c) => selectedIds.includes(c.id))
        : storage.getContacts({ searchQuery: '', category: 'All', isFavoriteOnly: false }, { key: 'name', direction: 'asc' }, 1, 1000).contacts;

    const csvData = storage.exportToCSV(listToExport);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contacts_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'CSV Exported', `Exported ${listToExport.length} contacts.`);
  };

  // Import handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          const count = storage.importContacts(Array.isArray(parsed) ? parsed : [parsed]);
          showToast('success', 'Import Successful', `Imported ${count} contacts from JSON.`);
        } else {
          // Parse simple CSV
          const lines = text.split(/\r?\n/).filter(Boolean);
          if (lines.length <= 1) {
            showToast('error', 'Import Failed', 'CSV file is empty or missing data rows.');
            return;
          }
          const importedContacts: Partial<Contact>[] = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
            if (cols.length >= 2 && (cols[0] || cols[1])) {
              importedContacts.push({
                firstName: cols[0] || 'Imported',
                lastName: cols[1] || 'Contact',
                title: cols[2] || '',
                company: cols[3] || '',
                department: cols[4] || '',
                emails: cols[5]
                  ? [{ id: `em_imp_${i}`, email: cols[5], label: 'work', isPrimary: true }]
                  : [],
                phones: cols[7]
                  ? [{ id: `ph_imp_${i}`, number: cols[7], label: 'work', isPrimary: true }]
                  : [],
              });
            }
          }
          const count = storage.importContacts(importedContacts);
          showToast('success', 'Import Successful', `Imported ${count} contacts from CSV.`);
        }
        onRefresh();
      } catch (err) {
        showToast('error', 'Import Failed', 'Failed to parse file: ' + String(err));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSortIcon = (key: SortConfig['key']) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 inline ml-1" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-slate-900 inline ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-slate-900 inline ml-1" />
    );
  };

  const getAvatarBg = (color?: string) => {
    switch (color) {
      case 'indigo':
        return 'bg-indigo-100 text-indigo-700';
      case 'amber':
        return 'bg-amber-100 text-amber-800';
      case 'cyan':
        return 'bg-cyan-100 text-cyan-800';
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800';
      case 'rose':
        return 'bg-rose-100 text-rose-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      case 'teal':
        return 'bg-teal-100 text-teal-800';
      case 'blue':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const startIndex = (pagination.page - 1) * pagination.pageSize + 1;
  const endIndex = Math.min(pagination.page * pagination.pageSize, totalFiltered);

  return (
    <div className="space-y-4">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.json"
        className="hidden"
      />

      {/* Action Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Left: Search & Segmented category filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Mobile Search */}
          <div className="relative sm:hidden w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filterConfig.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="Search contacts..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300"
            />
          </div>

          {/* Category Tabs (Segmented buttons - allowed by design guidelines) */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            {['All', 'Clients', 'Partners', 'Vendors', 'Team'].map((cat) => (
              <button
                key={cat}
                onClick={() => onFilterChange({ category: cat })}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  (filterConfig.category || 'All') === cat
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Starred filter button */}
          <button
            onClick={() => onFilterChange({ isFavoriteOnly: !filterConfig.isFavoriteOnly })}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              filterConfig.isFavoriteOnly
                ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                filterConfig.isFavoriteOnly ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
              }`}
            />
            <span>Starred ({totalFavorites})</span>
          </button>

          {(filterConfig.searchQuery || filterConfig.category !== 'All' || filterConfig.isFavoriteOnly) && (
            <button
              onClick={() =>
                onFilterChange({ searchQuery: '', category: 'All', isFavoriteOnly: false })
              }
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 underline-offset-2 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Right: Data Export / Import & Add Contact */}
        <div className="flex items-center gap-2">
          {/* Export to CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
            title="Export contacts to CSV file"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Import Contacts */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
            title="Import contacts from CSV or JSON file"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              storage.resetToDefaults();
              onRefresh();
              showToast('info', 'Directory Reset', 'Restored 14 default enterprise contacts.');
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Reset directory to standard sample dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Add Contact Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <Plus className="w-4 h-4" />
            <span>Create Contact</span>
          </button>
        </div>
      </div>

      {/* Bulk action ribbon */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-md transition-all">
          <div className="flex items-center gap-3 text-xs font-medium">
            <span>
              <strong className="text-emerald-400">{selectedIds.length}</strong> contacts selected
            </span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-300 hover:text-white underline underline-offset-2"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Selected
            </button>
            <button
              onClick={() => onOpenBulkDeleteModal(selectedIds)}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Contact Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold select-none">
                {/* Select All Checkbox */}
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-700"
                    aria-label="Select all rows"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-slate-900" />
                    ) : isSomeSelected ? (
                      <div className="w-4 h-4 rounded border-2 border-slate-900 bg-slate-900 flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-white" />
                      </div>
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>

                {/* Favorite Star */}
                <th className="py-3 px-2 w-8 text-center">
                  <span className="sr-only">Starred</span>
                </th>

                {/* Name */}
                <th
                  onClick={() => onSortChange('name')}
                  className="py-3 px-3 cursor-pointer group hover:text-slate-900"
                >
                  <span className="flex items-center">
                    Name {getSortIcon('name')}
                  </span>
                </th>

                {/* Title & Organization */}
                <th
                  onClick={() => onSortChange('title')}
                  className="py-3 px-3 cursor-pointer group hover:text-slate-900 hidden md:table-cell"
                >
                  <span className="flex items-center">
                    Title & Company {getSortIcon('title')}
                  </span>
                </th>

                {/* Primary Email */}
                <th className="py-3 px-3">
                  <span>Email Addresses</span>
                </th>

                {/* Primary Phone */}
                <th className="py-3 px-3 hidden sm:table-cell">
                  <span>Phone Numbers</span>
                </th>

                {/* Category */}
                <th className="py-3 px-3 hidden lg:table-cell">
                  <span>Category</span>
                </th>

                {/* Actions */}
                <th className="py-3 px-4 text-right">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-semibold text-slate-800 text-sm">No contacts found</p>
                      <p className="text-xs text-slate-500">
                        {filterConfig.searchQuery
                          ? `No contacts match "${filterConfig.searchQuery}". Try modifying your search criteria or resetting filters.`
                          : 'Your contact directory is currently empty. Click "Create Contact" to get started.'}
                      </p>
                      <button
                        onClick={onOpenCreateModal}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create New Contact
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => {
                  const isSelected = selectedIds.includes(contact.id);
                  const primaryEmail =
                    contact.emails.find((e) => e.isPrimary) || contact.emails[0] || null;
                  const primaryPhone =
                    contact.phones.find((p) => p.isPrimary) || contact.phones[0] || null;
                  const initials = `${contact.firstName[0] || ''}${contact.lastName[0] || ''}`.toUpperCase();

                  return (
                    <tr
                      key={contact.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-slate-50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRow(contact.id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-slate-900" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Favorite Star */}
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(contact.id)}
                          className="text-slate-300 hover:text-amber-500 transition-colors"
                          title={contact.isFavorite ? 'Unstar contact' : 'Star contact'}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              contact.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-3 px-3">
                        <div
                          onClick={() => onViewContactDetail(contact)}
                          className="flex items-center gap-2.5 cursor-pointer group"
                        >
                          <div
                            className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${getAvatarBg(
                              contact.avatarColor
                            )}`}
                          >
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 group-hover:text-indigo-600 block leading-tight">
                              {contact.firstName} {contact.lastName}
                            </span>
                            <span className="text-[11px] text-slate-500 md:hidden block leading-tight mt-0.5">
                              {contact.title || contact.company || 'Contact'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Title & Company */}
                      <td className="py-3 px-3 hidden md:table-cell">
                        <div className="leading-tight">
                          <span className="font-medium text-slate-800 block truncate max-w-[200px]">
                            {contact.title || '—'}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                            {contact.company || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Primary Email (with clean unboxed label and copy) */}
                      <td className="py-3 px-3">
                        {primaryEmail ? (
                          <div className="flex items-center gap-1.5 group/email">
                            <span className="text-slate-700 font-medium truncate max-w-[170px]">
                              {primaryEmail.email}
                            </span>
                            {/* Unboxed label as per design rules */}
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                              · {primaryEmail.label}
                            </span>
                            {contact.emails.length > 1 && (
                              <span
                                className="text-[10px] text-slate-600 cursor-pointer"
                                onClick={() => onViewContactDetail(contact)}
                                title={`+${contact.emails.length - 1} more emails`}
                              >
                                (+{contact.emails.length - 1})
                              </span>
                            )}
                            <button
                              onClick={() => handleCopyText(primaryEmail.email, primaryEmail.id, 'Email')}
                              className="opacity-0 group-hover/email:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition-opacity"
                              title="Copy email"
                            >
                              {copiedId === primaryEmail.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Primary Phone */}
                      <td className="py-3 px-3 hidden sm:table-cell">
                        {primaryPhone ? (
                          <div className="flex items-center gap-1.5 group/phone">
                            <span className="font-mono text-slate-700 truncate max-w-[150px]">
                              {primaryPhone.number}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                              · {primaryPhone.label === 'mobile' ? 'mob' : primaryPhone.label}
                            </span>
                            {contact.phones.length > 1 && (
                              <span
                                className="text-[10px] text-slate-600 cursor-pointer"
                                onClick={() => onViewContactDetail(contact)}
                                title={`+${contact.phones.length - 1} more phones`}
                              >
                                (+{contact.phones.length - 1})
                              </span>
                            )}
                            <button
                              onClick={() => handleCopyText(primaryPhone.number, primaryPhone.id, 'Phone')}
                              className="opacity-0 group-hover/phone:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition-opacity"
                              title="Copy phone"
                            >
                              {copiedId === primaryPhone.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <span className="text-slate-600 font-medium">
                          {contact.category || 'General'}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            onClick={() => onViewContactDetail(contact)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            title="View detailed profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(contact)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            title="Update contact"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteModal(contact)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginated Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
          {/* Summary */}
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="font-semibold text-slate-900">{totalFiltered === 0 ? 0 : startIndex}</strong> to{' '}
              <strong className="font-semibold text-slate-900">{endIndex}</strong> of{' '}
              <strong className="font-semibold text-slate-900">{totalFiltered}</strong> contacts
              {totalFiltered !== totalAll && ` (filtered from ${totalAll})`}
            </span>
          </div>

          {/* Right: Page Size & Nav buttons */}
          <div className="flex items-center gap-4">
            {/* Rows Per Page */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Rows per page:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-2 py-1 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(1)}
                disabled={pagination.page <= 1}
                className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-2 text-xs font-medium text-slate-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onPageChange(pagination.totalPages)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600"
                title="Last Page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
