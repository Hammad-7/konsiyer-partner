import { subDays, subMonths, format } from 'date-fns';

// Mock Invoices
export const mockInvoices = [
  {
    id: 'inv_001',
    number: '2025-001',
    date: '2025-10-01',
    dueDate: '2025-10-15',
    amount: 1250.50,
    currency: 'EUR',
    status: 'pending',
    shop: 'TechNova',
    shopId: 'shop_1',
    description: 'Affiliate commission for September',
    lineItems: [
      { id: 1, description: 'Product Sales Commission', quantity: 45, rate: 25.00, amount: 1125.00 },
      { id: 2, description: 'Bonus Performance', quantity: 1, rate: 125.50, amount: 125.50 },
    ],
  },
  {
    id: 'inv_002',
    number: '2025-002',
    date: '2025-09-15',
    dueDate: '2025-09-30',
    amount: 980.00,
    currency: 'EUR',
    status: 'paid',
    shop: 'TechNova',
    shopId: 'shop_1',
    paidDate: '2025-09-28',
    description: 'Affiliate commission for August',
    lineItems: [
      { id: 1, description: 'Product Sales Commission', quantity: 35, rate: 28.00, amount: 980.00 },
    ],
  },
  {
    id: 'inv_003',
    number: '2025-003',
    date: '2025-09-01',
    dueDate: '2025-09-15',
    amount: 2150.75,
    currency: 'EUR',
    status: 'pending',
    shop: 'TechNova',
    shopId: 'shop_1',
    description: 'Q3 Performance Bonus',
    lineItems: [
      { id: 1, description: 'Q3 Sales Target Bonus', quantity: 1, rate: 2000.00, amount: 2000.00 },
      { id: 2, description: 'Additional Incentive', quantity: 1, rate: 150.75, amount: 150.75 },
    ],
  },
  {
    id: 'inv_004',
    number: '2025-004',
    date: '2025-08-15',
    dueDate: '2025-08-30',
    amount: 1450.00,
    currency: 'EUR',
    status: 'paid',
    shop: 'TechNova',
    shopId: 'shop_1',
    paidDate: '2025-08-29',
    description: 'Affiliate commission for July',
    lineItems: [
      { id: 1, description: 'Product Sales Commission', quantity: 50, rate: 29.00, amount: 1450.00 },
    ],
  },
  {
    id: 'inv_005',
    number: '2025-005',
    date: '2025-08-01',
    dueDate: '2025-08-15',
    amount: 875.25,
    currency: 'EUR',
    status: 'paid',
    shop: 'TechNova',
    shopId: 'shop_1',
    paidDate: '2025-08-14',
    description: 'Affiliate commission for June',
    lineItems: [
      { id: 1, description: 'Product Sales Commission', quantity: 30, rate: 29.175, amount: 875.25 },
    ],
  },
  {
    id: 'inv_006',
    number: '2025-006',
    date: '2025-10-05',
    dueDate: '2025-10-20',
    amount: 3200.00,
    currency: 'EUR',
    status: 'pending',
    shop: 'TechNova',
    shopId: 'shop_1',
    description: 'Special Campaign Commission',
    lineItems: [
      { id: 1, description: 'October Campaign Sales', quantity: 80, rate: 40.00, amount: 3200.00 },
    ],
  },
];

// Mock KPI Data
export const mockKPIs = {
  thisMonthSales: 4450.50,
  pendingAmount: 6601.25,
  amountPaid: 3305.25,
  totalOrders: 240,
  averageOrderValue: 95.50,
  conversionRate: 3.2,
};

// Mock Chart Data - Revenue over time
export const mockChartData = {
  daily: Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'MMM dd'),
    revenue: Math.floor(Math.random() * 500) + 100,
    orders: Math.floor(Math.random() * 20) + 5,
  })),
  weekly: Array.from({ length: 12 }, (_, i) => ({
    date: `Week ${i + 1}`,
    revenue: Math.floor(Math.random() * 3000) + 1000,
    orders: Math.floor(Math.random() * 100) + 30,
  })),
  monthly: Array.from({ length: 12 }, (_, i) => ({
    date: format(subMonths(new Date(), 11 - i), 'MMM yyyy'),
    revenue: Math.floor(Math.random() * 10000) + 5000,
    orders: Math.floor(Math.random() * 400) + 150,
  })),
};

// Mock Payment Methods
export const mockPaymentMethods = [
  {
    id: 'pm_1',
    type: 'bank_transfer',
    label: 'Bank Transfer',
    details: 'IBAN: DE89 3704 0044 0532 0130 00',
    isDefault: true,
    icon: '🏦',
  },
  {
    id: 'pm_2',
    type: 'paypal',
    label: 'PayPal',
    details: 'merchant@example.com',
    isDefault: false,
    icon: '💳',
  },
  {
    id: 'pm_3',
    type: 'stripe',
    label: 'Credit Card',
    details: '**** **** **** 4242',
    isDefault: false,
    icon: '💰',
  },
];

// Mock Shop Details
export const mockShops = [
  {
    id: 'shop_1',
    name: 'TechNova',
    shopType: 'shopify',
    domain: 'technova.myshopify.com',
    currency: 'EUR',
    status: 'active',
    connectedDate: '2025-01-15',
    totalSales: 125000.50,
    totalOrders: 1250,
    logo: '/icons/shopify_glyph.svg',
  },
  {
    id: 'shop_2',
    name: 'Fashion Hub',
    shopType: 'other',
    domain: 'fashionhub.com',
    currency: 'USD',
    status: 'active',
    connectedDate: '2025-03-20',
    totalSales: 85000.00,
    totalOrders: 890,
    logo: null,
  },
];

// Mock Recent Activities
export const mockRecentActivities = [
  {
    id: 'act_1',
    type: 'invoice_created',
    description: 'New invoice created',
    invoiceId: 'inv_006',
    date: '2025-10-05',
    icon: '📄',
  },
  {
    id: 'act_2',
    type: 'payment_received',
    description: 'Payment received for invoice #2025-002',
    invoiceId: 'inv_002',
    amount: 980.00,
    date: '2025-09-28',
    icon: '✅',
  },
  {
    id: 'act_3',
    type: 'invoice_sent',
    description: 'Invoice sent to shop',
    invoiceId: 'inv_001',
    date: '2025-10-01',
    icon: '📧',
  },
  {
    id: 'act_4',
    type: 'payment_received',
    description: 'Payment received for invoice #2025-004',
    invoiceId: 'inv_004',
    amount: 1450.00,
    date: '2025-08-29',
    icon: '✅',
  },
];

// Mock Notification Settings
export const mockNotificationSettings = {
  emailNotifications: {
    invoiceCreated: true,
    paymentReceived: true,
    invoiceOverdue: true,
    weeklyReport: false,
  },
  pushNotifications: {
    invoiceCreated: false,
    paymentReceived: true,
    invoiceOverdue: true,
  },
};

// Mock Company Details
export const mockCompanyDetails = {
  companyName: 'TechNova Affiliates',
  contactEmail: 'merchant@technova.com',
  contactPhone: '+49 30 12345678',
  address: {
    street: 'Alexanderplatz 1',
    city: 'Berlin',
    postalCode: '10178',
    country: 'Germany',
  },
  taxId: 'DE123456789',
  bankDetails: {
    accountHolder: 'TechNova Affiliates GmbH',
    iban: 'DE89 3704 0044 0532 0130 00',
    bic: 'COBADEFFXXX',
    bankName: 'Commerzbank Berlin',
  },
};

// Mock Payment Settings
export const mockPaymentSettings = {
  preferredMethod: 'bank_transfer',
  minimumPayoutAmount: 100.00,
  currency: 'EUR',
  paymentSchedule: 'monthly',
  autoWithdraw: false,
};

// Helper function to get invoice by ID
export const getInvoiceById = (id) => {
  return mockInvoices.find((invoice) => invoice.id === id);
};

// Helper function to get invoices by status
export const getInvoicesByStatus = (status) => {
  return mockInvoices.filter((invoice) => invoice.status === status);
};

// Helper function to calculate total pending amount
export const getTotalPendingAmount = () => {
  return mockInvoices
    .filter((invoice) => invoice.status === 'pending')
    .reduce((total, invoice) => total + invoice.amount, 0);
};

// Helper function to calculate total paid amount
export const getTotalPaidAmount = () => {
  return mockInvoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((total, invoice) => total + invoice.amount, 0);
};

// Mock function to simulate payment
export const simulatePayment = async (invoiceId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const invoice = mockInvoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        invoice.status = 'paid';
        invoice.paidDate = new Date().toISOString().split('T')[0];
        resolve({ success: true, invoice });
      } else {
        resolve({ success: false, error: 'Invoice not found' });
      }
    }, 1500); // Simulate network delay
  });
};

// Mock function to generate PDF
export const generateInvoicePDF = (invoice) => {
  // This is a placeholder - in real implementation, use jspdf
  console.log('Generating PDF for invoice:', invoice.number);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        filename: `invoice_${invoice.number}.pdf`,
        url: '#', // Would be actual blob URL in real implementation
      });
    }, 1000);
  });
};
