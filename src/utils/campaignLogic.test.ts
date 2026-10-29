import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  filterCampaigns,
  validateWithdrawal,
  validateCardDetails,
  isCampaignLive,
  type Campaign,
} from './campaignLogic';

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Palazzo Lens',
    color: '#e4d8ff',
    icon: 'ti-aperture',
    category: 'Photo and video',
    share: '20%',
    detail: 'First payment plus 6 months of renewals',
    end: 'Ends Nov 27',
    founder: 'Maya Chen',
    desc: 'Photo editing app.',
    joined: true,
    isCreatedByUser: true,
    status: 'Live',
  },
  {
    id: '2',
    name: 'Tidal',
    color: '#cfe8dc',
    icon: 'ti-wave-sine',
    category: 'Productivity',
    share: '25%',
    detail: 'First payment plus 6 months of renewals',
    end: 'Ends Dec 3',
    founder: 'Dawit Bekele',
    desc: 'Focus timer app.',
    joined: false,
    isCreatedByUser: false,
  },
  {
    id: '3',
    name: 'Lumen Habit',
    color: '#ffd9e8',
    icon: 'ti-sun',
    category: 'Health',
    share: '15%',
    detail: 'First payment plus 6 months of renewals',
    end: 'Ends Nov 30',
    founder: 'Hana Mulugeta',
    desc: 'Habit tracker.',
    joined: true,
    isCreatedByUser: false,
  },
];

test('formatCurrency formats numbers with dollar sign and 2 decimals', () => {
  assert.equal(formatCurrency(99.5), '$99.50');
  assert.equal(formatCurrency(0), '$0.00');
  assert.equal(formatCurrency(1234.567), '$1234.57');
});

test('filterCampaigns filters by search query', () => {
  const result = filterCampaigns(mockCampaigns, 'tidal', ['All Categories'], 'd');
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Tidal');
});

test('filterCampaigns filters by category in Discover tab', () => {
  const result = filterCampaigns(mockCampaigns, '', ['Health'], 'd');
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Lumen Habit');
});

test('filterCampaigns preserves All Categories behavior', () => {
  const result = filterCampaigns(mockCampaigns, '', ['All Categories'], 'd');
  assert.equal(result.length, 3);
});

test('filterCampaigns filters joined campaigns in Joined tab', () => {
  const result = filterCampaigns(mockCampaigns, '', ['All Categories'], 'j');
  assert.equal(result.length, 2);
  assert.ok(result.every(c => c.joined));
});

test('filterCampaigns filters user-created campaigns in Created tab', () => {
  const result = filterCampaigns(mockCampaigns, '', ['All Categories'], 'c');
  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Palazzo Lens');
});

test('validateWithdrawal enforces minimum $10 and available balance', () => {
  const tooLow = validateWithdrawal('5.00', 100, 1, 1);
  assert.equal(tooLow.valid, false);
  assert.match(tooLow.error!, /minimum/i);

  const tooHigh = validateWithdrawal('150.00', 100, 1, 1);
  assert.equal(tooHigh.valid, false);
  assert.match(tooHigh.error!, /more than your available balance/i);

  const noCard = validateWithdrawal('50.00', 100, 0, null);
  assert.equal(noCard.valid, false);
  assert.match(noCard.error!, /card/i);

  const valid = validateWithdrawal('50.00', 100, 1, 1);
  assert.equal(valid.valid, true);
  assert.equal(valid.amountNumber, 50);
  assert.equal(valid.newBalance, 50);
});

test('validateCardDetails identifies brand and detects invalid fields', () => {
  const invalidName = validateCardDetails('', '4111111111111111', '12/28', '123');
  assert.equal(invalidName.valid, false);

  const invalidDigits = validateCardDetails('John Doe', '1234', '12/28', '123');
  assert.equal(invalidDigits.valid, false);

  const invalidExpiry = validateCardDetails('John Doe', '4111111111111111', '14/28', '123');
  assert.equal(invalidExpiry.valid, false);

  const validVisa = validateCardDetails('John Doe', '4111111111114417', '08/28', '123');
  assert.equal(validVisa.valid, true);
  assert.equal(validVisa.brand, 'VISA');
  assert.equal(validVisa.last4, '4417');
});

test('isCampaignLive requires apple, sdk, and funding', () => {
  assert.equal(isCampaignLive(true, true, true), true);
  assert.equal(isCampaignLive(false, true, true), false);
  assert.equal(isCampaignLive(true, false, true), false);
  assert.equal(isCampaignLive(true, true, false), false);
});
