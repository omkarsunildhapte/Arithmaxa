import { SelectOption } from '@appTypes/index';

/**
 * Currencies offered by the converter's two dropdowns.
 *
 * Every code here must exist in the rates feed the tool reads
 * (open.er-api.com/v6/latest/USD — 166 codes, all of these verified present on
 * 2026-09-05). A code the feed doesn't return would still appear in the list
 * and then convert to nothing, which reads as a broken tool rather than an
 * unsupported currency.
 *
 * Ordered by how often they're likely to be picked — the majors first, then
 * grouped by region — because ion-select renders this list verbatim and an
 * alphabetical wall of 50 codes buries the common ones.
 */
export const CURRENCY_OPTIONS: SelectOption[] = [
  // Majors
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'CNY', label: 'CNY — Chinese Yuan' },
  { value: 'NZD', label: 'NZD — New Zealand Dollar' },

  // Asia-Pacific
  { value: 'HKD', label: 'HKD — Hong Kong Dollar' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'KRW', label: 'KRW — South Korean Won' },
  { value: 'TWD', label: 'TWD — Taiwan Dollar' },
  { value: 'THB', label: 'THB — Thai Baht' },
  { value: 'MYR', label: 'MYR — Malaysian Ringgit' },
  { value: 'IDR', label: 'IDR — Indonesian Rupiah' },
  { value: 'PHP', label: 'PHP — Philippine Peso' },
  { value: 'VND', label: 'VND — Vietnamese Dong' },

  // South Asia
  { value: 'PKR', label: 'PKR — Pakistani Rupee' },
  { value: 'BDT', label: 'BDT — Bangladeshi Taka' },
  { value: 'LKR', label: 'LKR — Sri Lankan Rupee' },
  { value: 'NPR', label: 'NPR — Nepalese Rupee' },

  // Middle East & Africa
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'SAR', label: 'SAR — Saudi Riyal' },
  { value: 'QAR', label: 'QAR — Qatari Riyal' },
  { value: 'KWD', label: 'KWD — Kuwaiti Dinar' },
  { value: 'BHD', label: 'BHD — Bahraini Dinar' },
  { value: 'OMR', label: 'OMR — Omani Rial' },
  { value: 'ILS', label: 'ILS — Israeli Shekel' },
  { value: 'EGP', label: 'EGP — Egyptian Pound' },
  { value: 'ZAR', label: 'ZAR — South African Rand' },
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
  { value: 'KES', label: 'KES — Kenyan Shilling' },

  // Europe (non-euro)
  { value: 'SEK', label: 'SEK — Swedish Krona' },
  { value: 'NOK', label: 'NOK — Norwegian Krone' },
  { value: 'DKK', label: 'DKK — Danish Krone' },
  { value: 'PLN', label: 'PLN — Polish Zloty' },
  { value: 'CZK', label: 'CZK — Czech Koruna' },
  { value: 'HUF', label: 'HUF — Hungarian Forint' },
  { value: 'RON', label: 'RON — Romanian Leu' },
  { value: 'TRY', label: 'TRY — Turkish Lira' },
  { value: 'UAH', label: 'UAH — Ukrainian Hryvnia' },
  { value: 'RUB', label: 'RUB — Russian Ruble' },

  // Americas
  { value: 'MXN', label: 'MXN — Mexican Peso' },
  { value: 'BRL', label: 'BRL — Brazilian Real' },
  { value: 'ARS', label: 'ARS — Argentine Peso' },
  { value: 'CLP', label: 'CLP — Chilean Peso' },
  { value: 'COP', label: 'COP — Colombian Peso' },
  { value: 'PEN', label: 'PEN — Peruvian Sol' },
];
