import { Contact, User } from '../types';

export const INITIAL_USER: User = {
  id: 'usr_enterprise_01',
  fullName: 'Alexander Wright',
  email: 'alex.wright@apexenterprise.com',
  phone: '+1 (415) 890-2100',
  company: 'Apex Solutions Corp',
  role: 'Operations Director',
  avatar: 'AW',
  createdAt: '2026-01-15T09:30:00Z',
  lastLogin: new Date().toISOString(),
};

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'cnt_001',
    userId: 'usr_enterprise_01',
    firstName: 'Sarah',
    lastName: 'Chen',
    title: 'VP of Product Engineering',
    company: 'Strata Cloud Systems',
    department: 'Engineering',
    emails: [
      { id: 'em_1', email: 'sarah.chen@stratacloud.io', label: 'work', isPrimary: true },
      { id: 'em_2', email: 'schen.personal@gmail.com', label: 'personal', isPrimary: false }
    ],
    phones: [
      { id: 'ph_1', number: '+1 (415) 782-9901', label: 'work', isPrimary: true },
      { id: 'ph_2', number: '+1 (415) 340-1124', label: 'mobile', isPrimary: false }
    ],
    address: '450 Mission Street, Suite 1200',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    notes: 'Key decision maker for the Q3 enterprise architecture migration. Prefers communications via work email.',
    category: 'Clients',
    isFavorite: true,
    avatarColor: 'indigo',
    createdAt: '2026-02-10T14:22:00Z',
    updatedAt: '2026-03-01T11:15:00Z'
  },
  {
    id: 'cnt_002',
    userId: 'usr_enterprise_01',
    firstName: 'Marcus',
    lastName: 'Vance',
    title: 'Managing Director',
    company: 'Vance & Sterling Capital',
    department: 'Private Equity',
    emails: [
      { id: 'em_3', email: 'm.vance@vancestirling.com', label: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'ph_3', number: '+1 (212) 604-8830', label: 'work', isPrimary: true },
      { id: 'ph_4', number: '+1 (917) 555-0199', label: 'mobile', isPrimary: false }
    ],
    address: '767 Fifth Avenue, 28th Floor',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    notes: 'Followed up regarding Series B co-investment timeline. Meets quarterly in New York.',
    category: 'Partners',
    isFavorite: true,
    avatarColor: 'amber',
    createdAt: '2026-02-12T09:14:00Z',
    updatedAt: '2026-03-02T16:40:00Z'
  },
  {
    id: 'cnt_003',
    userId: 'usr_enterprise_01',
    firstName: 'Elena',
    lastName: 'Rostova',
    title: 'Principal Security Architect',
    company: 'Nordic CyberTech',
    department: 'InfoSec & Compliance',
    emails: [
      { id: 'em_5', email: 'elena.rostova@cybertech.se', label: 'work', isPrimary: true },
      { id: 'em_6', email: 'elena.r@infosec-advisors.net', label: 'other', isPrimary: false }
    ],
    phones: [
      { id: 'ph_5', number: '+46 8 123 4567', label: 'work', isPrimary: true },
      { id: 'ph_6', number: '+46 70 890 1234', label: 'mobile', isPrimary: false }
    ],
    address: 'Hamngatan 15',
    city: 'Stockholm',
    state: 'Stockholm County',
    country: 'Sweden',
    notes: 'Oversees SOC2 Type II compliance audit and penetration testing procedures.',
    category: 'Vendors',
    isFavorite: false,
    avatarColor: 'cyan',
    createdAt: '2026-02-14T11:05:00Z',
    updatedAt: '2026-02-28T08:30:00Z'
  },
  {
    id: 'cnt_004',
    userId: 'usr_enterprise_01',
    firstName: 'David',
    lastName: 'Kim',
    title: 'Head of Global Supply Chain',
    company: 'Pacific Rim Logistics',
    department: 'Operations',
    emails: [
      { id: 'em_7', email: 'dkim@pacificrimlogistics.com', label: 'work', isPrimary: true },
      { id: 'em_8', email: 'davidkim.personal@outlook.com', label: 'personal', isPrimary: false }
    ],
    phones: [
      { id: 'ph_7', number: '+1 (206) 881-4200', label: 'work', isPrimary: true },
      { id: 'ph_8', number: '+1 (206) 440-9921', label: 'home', isPrimary: false }
    ],
    address: '1201 Third Avenue, Suite 3300',
    city: 'Seattle',
    state: 'WA',
    country: 'United States',
    notes: 'Handles West Coast port freight contracts and customs clearances.',
    category: 'Clients',
    isFavorite: false,
    avatarColor: 'emerald',
    createdAt: '2026-02-15T15:45:00Z',
    updatedAt: '2026-02-25T13:20:00Z'
  },
  {
    id: 'cnt_005',
    userId: 'usr_enterprise_01',
    firstName: 'Priya',
    lastName: 'Patel',
    title: 'Chief Technology Officer',
    company: 'Aura Health Technologies',
    department: 'Executive Leadership',
    emails: [
      { id: 'em_9', email: 'priya.patel@aurahealth.co', label: 'work', isPrimary: true },
      { id: 'em_10', email: 'dr.priya.patel@biomed.org', label: 'other', isPrimary: false }
    ],
    phones: [
      { id: 'ph_9', number: '+1 (617) 502-7711', label: 'mobile', isPrimary: true },
      { id: 'ph_10', number: '+1 (617) 220-4000', label: 'work', isPrimary: false }
    ],
    address: '100 Binney Street',
    city: 'Cambridge',
    state: 'MA',
    country: 'United States',
    notes: 'Healthcare IT specialist; leading EHR integration with Spring Boot microservices.',
    category: 'Clients',
    isFavorite: true,
    avatarColor: 'rose',
    createdAt: '2026-02-18T10:10:00Z',
    updatedAt: '2026-03-03T18:00:00Z'
  },
  {
    id: 'cnt_006',
    userId: 'usr_enterprise_01',
    firstName: 'Liam',
    lastName: 'O\'Connor',
    title: 'Senior Solutions Consultant',
    company: 'Apex Solutions Corp',
    department: 'Professional Services',
    emails: [
      { id: 'em_11', email: 'liam.oconnor@apexenterprise.com', label: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'ph_11', number: '+353 1 496 0000', label: 'work', isPrimary: true },
      { id: 'ph_12', number: '+353 87 234 5678', label: 'mobile', isPrimary: false }
    ],
    address: 'Grand Canal Dock, 4 Hanover Quay',
    city: 'Dublin',
    state: 'Leinster',
    country: 'Ireland',
    notes: 'Internal team colleague managing EMEA customer implementations.',
    category: 'Team',
    isFavorite: false,
    avatarColor: 'teal',
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-02-19T09:30:00Z'
  },
  {
    id: 'cnt_007',
    userId: 'usr_enterprise_01',
    firstName: 'Sofia',
    lastName: 'Moretti',
    title: 'Creative Director',
    company: 'Studio Milano Design',
    department: 'Branding & UI',
    emails: [
      { id: 'em_13', email: 'sofia@studiomilano.it', label: 'work', isPrimary: true },
      { id: 'em_14', email: 'sofia.design@icloud.com', label: 'personal', isPrimary: false }
    ],
    phones: [
      { id: 'ph_13', number: '+39 02 8845 1', label: 'work', isPrimary: true },
      { id: 'ph_14', number: '+39 347 112 3456', label: 'mobile', isPrimary: false }
    ],
    address: 'Via Montenapoleone 8',
    city: 'Milan',
    state: 'Lombardy',
    country: 'Italy',
    notes: 'Brand agency contractor for corporate rebrand and product design guidelines.',
    category: 'Vendors',
    isFavorite: false,
    avatarColor: 'purple',
    createdAt: '2026-02-22T12:30:00Z',
    updatedAt: '2026-02-24T14:15:00Z'
  },
  {
    id: 'cnt_008',
    userId: 'usr_enterprise_01',
    firstName: 'Julian',
    lastName: 'Thorne',
    title: 'General Counsel',
    company: 'Thorne, Sterling & Becker LLP',
    department: 'Corporate Law',
    emails: [
      { id: 'em_15', email: 'jthorne@tsblegal.com', label: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'ph_15', number: '+1 (202) 555-0144', label: 'work', isPrimary: true },
      { id: 'ph_16', number: '+1 (202) 555-0182', label: 'home', isPrimary: false }
    ],
    address: '1401 Pennsylvania Avenue NW',
    city: 'Washington',
    state: 'DC',
    country: 'United States',
    notes: 'Advises on enterprise Master Service Agreements and data privacy regulations.',
    category: 'Partners',
    isFavorite: true,
    avatarColor: 'slate',
    createdAt: '2026-02-23T16:00:00Z',
    updatedAt: '2026-03-04T10:11:00Z'
  },
  {
    id: 'cnt_009',
    userId: 'usr_enterprise_01',
    firstName: 'Ananya',
    lastName: 'Deshmukh',
    title: 'Staff Database Administrator',
    company: 'DataCore Infrastructure',
    department: 'Core Infrastructure',
    emails: [
      { id: 'em_17', email: 'ananya.d@datacoreinfra.com', label: 'work', isPrimary: true },
      { id: 'em_18', email: 'ananya.dba@gmail.com', label: 'personal', isPrimary: false }
    ],
    phones: [
      { id: 'ph_17', number: '+91 80 4112 9000', label: 'work', isPrimary: true },
      { id: 'ph_18', number: '+91 98450 12345', label: 'mobile', isPrimary: false }
    ],
    address: 'Outer Ring Road, Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    notes: 'SQL Server clustered failover expert and Hibernate query tuning specialist.',
    category: 'Vendors',
    isFavorite: false,
    avatarColor: 'amber',
    createdAt: '2026-02-25T07:15:00Z',
    updatedAt: '2026-03-02T11:45:00Z'
  },
  {
    id: 'cnt_010',
    userId: 'usr_enterprise_01',
    firstName: 'Claire',
    lastName: 'Dubois',
    title: 'Director of Procurement',
    company: 'Hexagon Global Media',
    department: 'Finance & Purchasing',
    emails: [
      { id: 'em_19', email: 'c.dubois@hexagonmedia.fr', label: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'ph_19', number: '+33 1 42 68 55 00', label: 'work', isPrimary: true },
      { id: 'ph_20', number: '+33 6 12 34 56 78', label: 'mobile', isPrimary: false }
    ],
    address: '28 Boulevard Haussmann',
    city: 'Paris',
    state: 'Île-de-France',
    country: 'France',
    notes: 'Key stakeholder for annual enterprise license renewal negotiations.',
    category: 'Clients',
    isFavorite: false,
    avatarColor: 'blue',
    createdAt: '2026-02-26T10:00:00Z',
    updatedAt: '2026-03-05T09:20:00Z'
  },
  {
    id: 'cnt_011',
    userId: 'usr_enterprise_01',
    firstName: 'Taro',
    lastName: 'Yamamoto',
    title: 'Senior Technical Lead',
    company: 'NeoTokyo Robotics Labs',
    department: 'R&D Automation',
    emails: [
      { id: 'em_21', email: 't.yamamoto@neotokyo-robotics.jp', label: 'work', isPrimary: true },
      { id: 'em_22', email: 'taro.y@tokyo-eng.net', label: 'other', isPrimary: false }
    ],
    phones: [
      { id: 'ph_21', number: '+81 3 5555 0143', label: 'work', isPrimary: true },
      { id: 'ph_22', number: '+81 90 1234 5678', label: 'mobile', isPrimary: false }
    ],
    address: 'Roppongi Hills Mori Tower, 6-10-1 Roppongi',
    city: 'Minato-ku',
    state: 'Tokyo',
    country: 'Japan',
    notes: 'Collaborating on IoT telemetry streaming and Spring Kafka consumer pipelines.',
    category: 'Partners',
    isFavorite: true,
    avatarColor: 'rose',
    createdAt: '2026-02-27T04:20:00Z',
    updatedAt: '2026-03-06T06:10:00Z'
  },
  {
    id: 'cnt_012',
    userId: 'usr_enterprise_01',
    firstName: 'Rachel',
    lastName: 'Greenberg',
    title: 'VP of Human Resources',
    company: 'Apex Solutions Corp',
    department: 'People Operations',
    emails: [
      { id: 'em_23', email: 'rachel.greenberg@apexenterprise.com', label: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'ph_23', number: '+1 (415) 890-2105', label: 'work', isPrimary: true },
      { id: 'ph_24', number: '+1 (510) 902-8811', label: 'mobile', isPrimary: false }
    ],
    address: '500 Howard Street, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    country: 'United States',
    notes: 'Coordinates engineering team headcount expansion and senior hiring pipelines.',
    category: 'Team',
    isFavorite: false,
    avatarColor: 'emerald',
    createdAt: '2026-01-18T11:00:00Z',
    updatedAt: '2026-02-15T14:30:00Z'
  },
  {
    id: 'cnt_013',
    userId: 'usr_enterprise_01',
    firstName: 'Mateo',
    lastName: 'Hernandez',
    title: 'Lead Cloud Architect',
    company: 'Solaria FinTech Solutions',
    department: 'Core Banking Systems',
    emails: [
      { id: 'em_25', email: 'mhernandez@solaria-fintech.mx', label: 'work', isPrimary: true },
      { id: 'em_26', email: 'mateo.cloud@gmail.com', label: 'personal', isPrimary: false }
    ],
    phones: [
      { id: 'ph_25', number: '+52 55 5280 1234', label: 'work', isPrimary: true },
      { id: 'ph_26', number: '+52 1 55 9876 5432', label: 'mobile', isPrimary: false }
    ],
    address: 'Paseo de la Reforma 250, Piso 19',
    city: 'Mexico City',
    state: 'CDMX',
    country: 'Mexico',
    notes: 'Spearheaded hybrid cloud banking migration; verified SQL Server Always On availability groups.',
    category: 'Clients',
    isFavorite: false,
    avatarColor: 'indigo',
    createdAt: '2026-03-01T15:20:00Z',
    updatedAt: '2026-03-04T12:10:00Z'
  },
  {
    id: 'cnt_014',
    userId: 'usr_enterprise_01',
    firstName: 'Hanna',
    lastName: 'Lindqvist',
    title: 'Head of Quality Assurance',
    company: 'Vanguard Software Testing',
    department: 'Test Automation & SonarQube',
    emails: [
      { id: 'em_27', email: 'hanna.l@vanguardqa.fi', label: 'work', isPrimary: true }
    ],
    phones: [
      { id: 'ph_27', number: '+358 9 123 456', label: 'work', isPrimary: true },
      { id: 'ph_28', number: '+358 40 123 4567', label: 'mobile', isPrimary: false }
    ],
    address: 'Mannerheimintie 12',
    city: 'Helsinki',
    state: 'Uusimaa',
    country: 'Finland',
    notes: 'Configures SonarQube quality gate thresholds and Mockito integration test coverage metrics.',
    category: 'Vendors',
    isFavorite: false,
    avatarColor: 'teal',
    createdAt: '2026-03-02T09:40:00Z',
    updatedAt: '2026-03-05T16:00:00Z'
  }
];
