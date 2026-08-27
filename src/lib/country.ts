export type CountryCode = 'KE' | 'TZ';

export interface CountryConfig {
  code: CountryCode;
  name: string;
  currency: string;
  currencySymbol: string;
  phonePrefix: string;
  idLabel: string;
  idPlaceholder: string;
  groupTypeDefault: string;
  groupTypes: string[];
}

export const COUNTRY_CONFIG: Record<CountryCode, CountryConfig> = {
  KE: {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    currencySymbol: 'KSh',
    phonePrefix: '+254',
    idLabel: 'Huduma Namba',
    idPlaceholder: '12345678',
    groupTypeDefault: 'chama',
    groupTypes: ['chama', 'sacco', 'merry_go_round'],
  },
  TZ: {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'TZS',
    currencySymbol: 'TSh',
    phonePrefix: '+255',
    idLabel: 'NIDA',
    idPlaceholder: '1984-0313-11101-00006-25',
    groupTypeDefault: 'vicoba',
    groupTypes: ['vicoba', 'upatu', 'sacco', 'other'],
  },
};

export function getCountryConfig(country: CountryCode): CountryConfig {
  return COUNTRY_CONFIG[country] ?? COUNTRY_CONFIG.TZ;
}

export function formatCurrency(amount: number, country: CountryCode): string {
  const cfg = getCountryConfig(country);
  return `${cfg.currencySymbol} ${amount.toLocaleString()}`;
}
