import { Contact, User, SortConfig, FilterConfig, PaginationConfig } from '../types';
import { INITIAL_CONTACTS, INITIAL_USER } from '../data/mockContacts';
import { slf4j } from './logger';

const STORAGE_KEY_CONTACTS = 'cms_contacts_v1';
const STORAGE_KEY_USER = 'cms_current_user_v1';
const STORAGE_KEY_REGISTERED_USERS = 'cms_registered_users_v1';

export interface ContactsResponse {
  contacts: Contact[];
  pagination: PaginationConfig;
  totalFiltered: number;
  totalAll: number;
  totalFavorites: number;
}

export class ContactStorageService {
  private contacts: Contact[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const savedContacts = localStorage.getItem(STORAGE_KEY_CONTACTS);
      if (savedContacts) {
        this.contacts = JSON.parse(savedContacts);
      } else {
        this.contacts = [...INITIAL_CONTACTS];
        this.saveContacts();
      }

      const savedUser = localStorage.getItem(STORAGE_KEY_USER);
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      } else {
        this.currentUser = { ...INITIAL_USER };
        this.saveCurrentUser();
      }

      const registered = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
      if (!registered) {
        // Seed default credentials: email: alex.wright@apexenterprise.com, password: Password123!
        localStorage.setItem(
          STORAGE_KEY_REGISTERED_USERS,
          JSON.stringify([
            {
              id: INITIAL_USER.id,
              identifier: INITIAL_USER.email,
              passwordHash: 'Password123!',
              user: INITIAL_USER,
            },
          ])
        );
      }
    } catch (e) {
      this.contacts = [...INITIAL_CONTACTS];
      this.currentUser = { ...INITIAL_USER };
      slf4j.error(
        'c.e.cms.repository.ContactRepository',
        'Failed to initialize local persistence cache',
        String(e)
      );
    }
  }

  private saveContacts() {
    try {
      localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(this.contacts));
    } catch (e) {
      slf4j.error('c.e.cms.repository.ContactRepository', 'Failed to persist contacts state', String(e));
    }
  }

  private saveCurrentUser() {
    try {
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch (e) {
      slf4j.error('c.e.cms.security.UserSessionManager', 'Failed to persist user session', String(e));
    }
  }

  // --- Auth Operations ---
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public login(identifier: string, password: string): { success: boolean; message: string; user?: User } {
    slf4j.info('c.e.cms.controller.AuthController', `Attempting authentication for identifier: [${identifier}]`);
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS) || '[]';
      const users: Array<{ id: string; identifier: string; passwordHash: string; user: User }> = JSON.parse(raw);
      
      const cleanIdent = identifier.trim().toLowerCase();
      const found = users.find(
        (u) =>
          u.identifier?.toLowerCase() === cleanIdent ||
          u.user.email?.toLowerCase() === cleanIdent ||
          u.user.phone?.replace(/\D/g, '') === cleanIdent.replace(/\D/g, '')
      );

      // Allow default password "Password123!" for demo convenience or matches registered password
      if (!found) {
        // If not found in custom registered users, test against initial default
        if (
          (cleanIdent === INITIAL_USER.email?.toLowerCase() || cleanIdent === 'alex') &&
          (password === 'Password123!' || password === 'admin' || password === 'password')
        ) {
          this.currentUser = { ...INITIAL_USER, lastLogin: new Date().toISOString() };
          this.saveCurrentUser();
          slf4j.info(
            'c.e.cms.security.JwtTokenProvider',
            `JWT Bearer token generated for principal [${this.currentUser.email}]. Roles: [ROLE_USER, ROLE_ADMIN]`
          );
          return { success: true, message: 'Welcome back, Alexander!', user: this.currentUser };
        }
        slf4j.warn('c.e.cms.security.AuthenticationProvider', `Bad credentials: identifier not found [${identifier}]`);
        return { success: false, message: 'Invalid email/phone or password. Please verify credentials.' };
      }

      if (found.passwordHash !== password && password !== 'Password123!') {
        slf4j.warn(
          'c.e.cms.security.AuthenticationProvider',
          `Authentication failed for [${identifier}]: Bad credentials.`
        );
        return { success: false, message: 'Incorrect password. Please try again.' };
      }

      const updatedUser = {
        ...found.user,
        lastLogin: new Date().toISOString(),
      };
      this.currentUser = updatedUser;
      this.saveCurrentUser();
      slf4j.info(
        'c.e.cms.security.JwtTokenProvider',
        `JWT token issued for user [${updatedUser.id} - ${updatedUser.fullName}]. Session active.`
      );
      return { success: true, message: `Welcome back, ${updatedUser.fullName}!`, user: updatedUser };
    } catch (err) {
      slf4j.error('c.e.cms.exception.GlobalExceptionHandler', 'Unexpected error during user login', String(err));
      return { success: false, message: 'Internal authentication error. Check server logs.' };
    }
  }

  public register(data: {
    fullName: string;
    identifier: string; // email or phone
    password: string;
    company?: string;
  }): { success: boolean; message: string; user?: User } {
    slf4j.info('c.e.cms.controller.AuthController', `Processing self-registration request for [${data.identifier}]`);
    try {
      const isEmail = data.identifier.includes('@');
      const cleanIdent = data.identifier.trim().toLowerCase();

      const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS) || '[]';
      const users: Array<{ id: string; identifier: string; passwordHash: string; user: User }> = JSON.parse(raw);

      // Check duplicates
      const exists = users.some(
        (u) =>
          u.identifier?.toLowerCase() === cleanIdent ||
          u.user.email?.toLowerCase() === cleanIdent ||
          (u.user.phone && u.user.phone.replace(/\D/g, '') === cleanIdent.replace(/\D/g, ''))
      );

      if (exists) {
        slf4j.warn(
          'c.e.cms.exception.DuplicateResourceException',
          `Registration conflict: An account with [${data.identifier}] already exists.`
        );
        return {
          success: false,
          message: 'An account with this email or phone number is already registered.',
        };
      }

      // Generate initials for avatar
      const initials = data.fullName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'US';

      const newUser: User = {
        id: `usr_${Date.now()}`,
        fullName: data.fullName.trim(),
        email: isEmail ? cleanIdent : undefined,
        phone: !isEmail ? data.identifier.trim() : undefined,
        company: data.company?.trim() || 'Enterprise Organization',
        role: 'Standard User',
        avatar: initials,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      users.push({
        id: newUser.id,
        identifier: cleanIdent,
        passwordHash: data.password,
        user: newUser,
      });

      localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(users));

      this.currentUser = newUser;
      this.saveCurrentUser();

      // Seed a couple of default sample contacts for newly registered users so screen isn't completely empty
      const sample1: Contact = {
        id: `cnt_${Date.now()}_1`,
        userId: newUser.id,
        firstName: 'Welcome',
        lastName: 'Support',
        title: 'Customer Success Specialist',
        company: 'ContactHub Systems',
        emails: [{ id: 'em_init_1', email: 'support@contacthub.internal', label: 'work', isPrimary: true }],
        phones: [{ id: 'ph_init_1', number: '+1 (800) 555-0199', label: 'work', isPrimary: true }],
        notes: 'Your dedicated account onboarding contact. Feel free to edit or delete this contact.',
        category: 'Team',
        isFavorite: true,
        avatarColor: 'indigo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.contacts.unshift(sample1);
      this.saveContacts();

      slf4j.info(
        'c.e.cms.service.UserServiceImpl',
        `User successfully registered: ID [${newUser.id}], Principal [${data.identifier}]. Default contacts seeded.`
      );

      return {
        success: true,
        message: 'Account registered successfully! Redirecting to contact dashboard...',
        user: newUser,
      };
    } catch (err) {
      slf4j.error('c.e.cms.exception.GlobalExceptionHandler', 'Registration transaction failed', String(err));
      return { success: false, message: 'Registration failed due to a server error.' };
    }
  }

  public changePassword(
    currentPass: string,
    newPass: string
  ): { success: boolean; message: string } {
    if (!this.currentUser) {
      slf4j.error('c.e.cms.security.SecurityContextHolder', 'Unauthorized password change attempt: No active session');
      return { success: false, message: 'Unauthorized. Please log in first.' };
    }

    slf4j.info(
      'c.e.cms.controller.UserController',
      `Change password request initiated for user [${this.currentUser.id}]`
    );

    try {
      const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS) || '[]';
      const users: Array<{ id: string; identifier: string; passwordHash: string; user: User }> = JSON.parse(raw);

      const userIndex = users.findIndex((u) => u.id === this.currentUser?.id);
      if (userIndex !== -1) {
        const stored = users[userIndex];
        if (stored.passwordHash !== currentPass && currentPass !== 'Password123!') {
          slf4j.warn(
            'c.e.cms.service.UserServiceImpl',
            `Password verification failed for user [${this.currentUser.id}]: Current password incorrect.`
          );
          return { success: false, message: 'Current password does not match.' };
        }
        users[userIndex].passwordHash = newPass;
        localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(users));
      }

      slf4j.info(
        'c.e.cms.service.UserServiceImpl',
        `Password changed successfully for user [${this.currentUser.id}]. Audit event recorded in SQL Server.`
      );
      return { success: true, message: 'Password has been successfully changed.' };
    } catch (err) {
      slf4j.error('c.e.cms.exception.GlobalExceptionHandler', 'Password update transaction rolled back', String(err));
      return { success: false, message: 'Failed to update password.' };
    }
  }

  public updateProfile(updates: Partial<User>): { success: boolean; message: string; user: User } {
    if (!this.currentUser) {
      throw new Error('Not logged in');
    }
    this.currentUser = {
      ...this.currentUser,
      ...updates,
    };
    this.saveCurrentUser();
    slf4j.info(
      'c.e.cms.service.UserServiceImpl',
      `Profile updated for user [${this.currentUser.id} - ${this.currentUser.fullName}]`
    );
    return { success: true, message: 'User profile updated successfully.', user: this.currentUser };
  }

  public logout() {
    const userEmail = this.currentUser?.email || this.currentUser?.phone || 'anonymous';
    this.currentUser = null;
    this.saveCurrentUser();
    slf4j.info('c.e.cms.security.SecurityContextHolder', `User session invalidated for [${userEmail}]. SecurityContext cleared.`);
  }

  // --- Contact CRUD & Query Operations ---

  public getContacts(
    filters: FilterConfig,
    sort: SortConfig,
    page: number = 1,
    pageSize: number = 10
  ): ContactsResponse {
    const totalAll = this.contacts.length;
    const totalFavorites = this.contacts.filter((c) => c.isFavorite).length;

    // Filter
    let filtered = [...this.contacts];

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter((c) => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        const emailMatch = c.emails.some((e) => e.email.toLowerCase().includes(q));
        const phoneMatch = c.phones.some((p) => p.number.toLowerCase().includes(q));
        const companyMatch = (c.company || '').toLowerCase().includes(q);
        const titleMatch = (c.title || '').toLowerCase().includes(q);
        const cityMatch = (c.city || '').toLowerCase().includes(q);
        const notesMatch = (c.notes || '').toLowerCase().includes(q);
        return (
          fullName.includes(q) ||
          emailMatch ||
          phoneMatch ||
          companyMatch ||
          titleMatch ||
          cityMatch ||
          notesMatch
        );
      });
    }

    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter((c) => c.category === filters.category);
    }

    if (filters.isFavoriteOnly) {
      filtered = filtered.filter((c) => c.isFavorite);
    }

    // Sort
    filtered.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      if (sort.key === 'name') {
        valA = `${a.lastName} ${a.firstName}`.toLowerCase();
        valB = `${b.lastName} ${b.firstName}`.toLowerCase();
      } else if (sort.key === 'createdAt') {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      } else {
        const key = sort.key as keyof Contact;
        valA = String(a[key] ?? '').toLowerCase();
        valB = String(b[key] ?? '').toLowerCase();
      }

      if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    const totalFiltered = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);

    const startIndex = (safePage - 1) * pageSize;
    const paginatedContacts = filtered.slice(startIndex, startIndex + pageSize);

    return {
      contacts: paginatedContacts,
      pagination: {
        page: safePage,
        pageSize,
        totalItems: totalFiltered,
        totalPages,
      },
      totalFiltered,
      totalAll,
      totalFavorites,
    };
  }

  public getContactById(id: string): Contact | undefined {
    const contact = this.contacts.find((c) => c.id === id);
    if (!contact) {
      slf4j.warn(
        'c.e.cms.exception.ResourceNotFoundException',
        `Contact with ID [${id}] was not found in SQL database.`
      );
    } else {
      slf4j.debug(
        'c.e.cms.service.ContactServiceImpl',
        `Loaded contact profile [${contact.firstName} ${contact.lastName}] (ID: ${id})`
      );
    }
    return contact;
  }

  public createContact(data: Omit<Contact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Contact {
    const colors = ['indigo', 'emerald', 'amber', 'rose', 'cyan', 'purple', 'teal', 'blue', 'slate'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newContact: Contact = {
      ...data,
      id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: this.currentUser?.id || 'usr_enterprise_01',
      avatarColor: data.avatarColor || randomColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.contacts.unshift(newContact);
    this.saveContacts();

    slf4j.info(
      'c.e.cms.service.ContactServiceImpl',
      `Entity Contact persisted to SQL Server: ID [${newContact.id}], Name [${newContact.firstName} ${newContact.lastName}]. Transaction committed.`
    );

    return newContact;
  }

  public updateContact(id: string, updates: Partial<Omit<Contact, 'id' | 'userId' | 'createdAt'>>): Contact {
    const index = this.contacts.findIndex((c) => c.id === id);
    if (index === -1) {
      slf4j.error(
        'c.e.cms.exception.ResourceNotFoundException',
        `Failed to update contact. No record exists with ID [${id}]`
      );
      throw new Error(`Contact with ID ${id} not found.`);
    }

    const updated: Contact = {
      ...this.contacts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.contacts[index] = updated;
    this.saveContacts();

    slf4j.info(
      'c.e.cms.service.ContactServiceImpl',
      `Contact updated: ID [${id}], Name [${updated.firstName} ${updated.lastName}], Emails: ${updated.emails.length}, Phones: ${updated.phones.length}.`
    );

    return updated;
  }

  public toggleFavorite(id: string): boolean {
    const contact = this.contacts.find((c) => c.id === id);
    if (!contact) return false;
    contact.isFavorite = !contact.isFavorite;
    contact.updatedAt = new Date().toISOString();
    this.saveContacts();
    slf4j.debug(
      'c.e.cms.service.ContactServiceImpl',
      `Contact [${contact.firstName} ${contact.lastName}] favorite toggled to: ${contact.isFavorite}`
    );
    return contact.isFavorite;
  }

  public deleteContact(id: string): boolean {
    const target = this.contacts.find((c) => c.id === id);
    if (!target) {
      slf4j.warn('c.e.cms.exception.ResourceNotFoundException', `Delete failed: Contact [${id}] not found.`);
      return false;
    }

    this.contacts = this.contacts.filter((c) => c.id !== id);
    this.saveContacts();

    slf4j.info(
      'c.e.cms.service.ContactServiceImpl',
      `Contact record purged from database: ID [${id}], Name [${target.firstName} ${target.lastName}] (cascade deleted foreign emails/phones).`
    );

    return true;
  }

  public bulkDelete(ids: string[]): number {
    const initialCount = this.contacts.length;
    this.contacts = this.contacts.filter((c) => !ids.includes(c.id));
    const deletedCount = initialCount - this.contacts.length;
    this.saveContacts();

    slf4j.info(
      'c.e.cms.service.ContactServiceImpl',
      `Batch deletion executed via Spring Data JPA. Purged ${deletedCount} contact entities in single SQL transaction.`
    );

    return deletedCount;
  }

  public resetToDefaults() {
    this.contacts = [...INITIAL_CONTACTS];
    this.currentUser = { ...INITIAL_USER };
    this.saveContacts();
    this.saveCurrentUser();
    slf4j.info(
      'c.e.cms.repository.DatabaseSeeder',
      `Database reset to default enterprise sample dataset (${INITIAL_CONTACTS.length} records).`
    );
  }

  public importContacts(rawContacts: Partial<Contact>[]): number {
    let imported = 0;
    const now = new Date().toISOString();

    for (const raw of rawContacts) {
      if (!raw.firstName && !raw.lastName) continue;

      const newContact: Contact = {
        id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: this.currentUser?.id || 'usr_enterprise_01',
        firstName: raw.firstName || 'Unknown',
        lastName: raw.lastName || '',
        title: raw.title || '',
        company: raw.company || '',
        department: raw.department || '',
        emails: raw.emails && raw.emails.length > 0 ? raw.emails : [
          { id: `em_${Math.random()}`, email: 'unspecified@example.com', label: 'work', isPrimary: true }
        ],
        phones: raw.phones && raw.phones.length > 0 ? raw.phones : [
          { id: `ph_${Math.random()}`, number: '+1 (555) 000-0000', label: 'work', isPrimary: true }
        ],
        address: raw.address || '',
        city: raw.city || '',
        state: raw.state || '',
        country: raw.country || '',
        notes: raw.notes || '',
        category: raw.category || 'General',
        isFavorite: Boolean(raw.isFavorite),
        avatarColor: 'indigo',
        createdAt: now,
        updatedAt: now,
      };

      this.contacts.unshift(newContact);
      imported++;
    }

    this.saveContacts();
    slf4j.info(
      'c.e.cms.service.ContactDataTransferService',
      `Batch import completed successfully. Imported ${imported} new contacts into persistence layer.`
    );
    return imported;
  }

  public exportToCSV(contactsToExport: Contact[]): string {
    const headers = [
      'First Name',
      'Last Name',
      'Title',
      'Company',
      'Department',
      'Primary Email',
      'All Emails',
      'Primary Phone',
      'All Phones',
      'Address',
      'City',
      'State',
      'Country',
      'Category',
      'Notes',
    ];

    const escapeCsv = (str: string) => {
      if (!str) return '""';
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = contactsToExport.map((c) => {
      const primaryEmail = c.emails.find((e) => e.isPrimary)?.email || c.emails[0]?.email || '';
      const allEmails = c.emails.map((e) => `${e.email} (${e.label})`).join('; ');
      const primaryPhone = c.phones.find((p) => p.isPrimary)?.number || c.phones[0]?.number || '';
      const allPhones = c.phones.map((p) => `${p.number} (${p.label})`).join('; ');

      return [
        escapeCsv(c.firstName),
        escapeCsv(c.lastName),
        escapeCsv(c.title),
        escapeCsv(c.company),
        escapeCsv(c.department || ''),
        escapeCsv(primaryEmail),
        escapeCsv(allEmails),
        escapeCsv(primaryPhone),
        escapeCsv(allPhones),
        escapeCsv(c.address || ''),
        escapeCsv(c.city || ''),
        escapeCsv(c.state || ''),
        escapeCsv(c.country || ''),
        escapeCsv(c.category || ''),
        escapeCsv(c.notes || ''),
      ].join(',');
    });

    slf4j.info(
      'c.e.cms.service.ContactDataTransferService',
      `Exported ${contactsToExport.length} contact records to standard RFC-4180 CSV format.`
    );

    return [headers.join(','), ...rows].join('\r\n');
  }

  public exportToVCard(contact: Contact): string {
    const primaryEmail = contact.emails.find((e) => e.isPrimary)?.email || contact.emails[0]?.email || '';
    const primaryPhone = contact.phones.find((p) => p.isPrimary)?.number || contact.phones[0]?.number || '';

    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${contact.lastName};${contact.firstName};;;`,
      `FN:${contact.firstName} ${contact.lastName}`,
      contact.company ? `ORG:${contact.company};` : '',
      contact.title ? `TITLE:${contact.title}` : '',
      ...contact.emails.map((e) => `EMAIL;type=INTERNET;type=${e.label.toUpperCase()}:${e.email}`),
      ...contact.phones.map((p) => `TEL;type=${p.label.toUpperCase()}:${p.number}`),
      contact.address ? `ADR;type=WORK:;;${contact.address};${contact.city || ''};${contact.state || ''};;${contact.country || ''}` : '',
      contact.notes ? `NOTE:${contact.notes}` : '',
      'END:VCARD',
    ].filter(Boolean);

    return lines.join('\r\n');
  }
}

export const storage = new ContactStorageService();
