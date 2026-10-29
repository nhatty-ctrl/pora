/**
 * Pure domain logic for Umi Creator Dashboard
 */

export interface Campaign {
  id: string;
  name: string;
  color: string;
  icon: string;
  category: string;
  share: string;
  detail: string;
  end: string;
  founder: string;
  desc: string;
  subscribers?: number;
  earned?: number;
  status?: 'Live' | 'Setting up' | 'Paused' | 'Pending' | 'Approved';
  joined?: boolean;
  isCreatedByUser?: boolean;
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0.00';
  return `$${amount.toFixed(2)}`;
}

export function filterCampaigns(
  campaigns: Campaign[],
  searchQuery: string,
  selectedCategories: string[],
  activeTab: 'd' | 'j' | 'c'
): Campaign[] {
  const query = searchQuery.trim().toLowerCase();

  return campaigns.filter(c => {
    // Search match
    if (query) {
      const matchName = c.name.toLowerCase().includes(query);
      const matchCategory = c.category.toLowerCase().includes(query);
      const matchFounder = c.founder.toLowerCase().includes(query);
      if (!matchName && !matchCategory && !matchFounder) return false;
    }

    // Category filter in Discover tab
    if (activeTab === 'd' && selectedCategories.length > 0 && !selectedCategories.includes('All Categories')) {
      if (!selectedCategories.includes(c.category)) return false;
    }

    // Tab filter
    if (activeTab === 'j') {
      return Boolean(c.joined);
    }
    if (activeTab === 'c') {
      return Boolean(c.isCreatedByUser);
    }

    return true;
  });
}

export interface WithdrawalValidationResult {
  valid: boolean;
  error?: string;
  amountNumber?: number;
  newBalance?: number;
}

export function validateWithdrawal(
  amountStr: string,
  balance: number,
  cardCount: number,
  selectedCardId: number | null
): WithdrawalValidationResult {
  const trimmed = amountStr.trim();
  if (!trimmed) {
    return { valid: false, error: 'Enter an amount to withdraw.' };
  }

  const n = Number(trimmed);
  if (!Number.isFinite(n) || isNaN(n) || n <= 0) {
    return { valid: false, error: 'Please enter a valid dollar amount.' };
  }

  if (n < 10) {
    return { valid: false, error: 'The minimum withdrawal amount is $10.00.' };
  }

  if (n > balance) {
    return {
      valid: false,
      error: `That’s more than your available balance of ${formatCurrency(balance)}.`,
    };
  }

  if (cardCount === 0 || selectedCardId === null) {
    return { valid: false, error: 'Add or select a card to withdraw to.' };
  }

  const newBalance = Math.round((balance - n) * 100) / 100;
  return { valid: true, amountNumber: n, newBalance };
}

export interface CardValidationResult {
  valid: boolean;
  error?: string;
  brand?: 'VISA' | 'MC' | 'CARD';
  last4?: string;
}

export function validateCardDetails(
  name: string,
  cardNumber: string,
  expiry: string,
  cvc: string
): CardValidationResult {
  if (!name.trim()) {
    return { valid: false, error: 'Enter the cardholder name.' };
  }

  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 15 || digits.length > 16) {
    return { valid: false, error: 'Enter a valid 15 or 16-digit card number.' };
  }

  const parts = expiry.split('/').map(s => Number(s.trim()));
  const [m, y] = parts;
  if (!m || !y || isNaN(m) || isNaN(y) || m < 1 || m > 12) {
    return { valid: false, error: 'Enter a valid expiry date as MM/YY.' };
  }

  const cvcDigits = cvc.replace(/\D/g, '');
  if (cvcDigits.length < 3 || cvcDigits.length > 4) {
    return { valid: false, error: 'Enter the 3 or 4-digit security code (CVC).' };
  }

  const brand = digits.startsWith('4')
    ? 'VISA'
    : digits.startsWith('5')
    ? 'MC'
    : 'CARD';

  return {
    valid: true,
    brand,
    last4: digits.slice(-4),
  };
}

export function isCampaignLive(
  appleConnected: boolean,
  sdkConnected: boolean,
  funded: boolean
): boolean {
  return appleConnected && sdkConnected && funded;
}
