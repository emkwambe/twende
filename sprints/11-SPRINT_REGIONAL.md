# Sprint 11: Regional Expansion (UG/ET/RW)

## Sprint Metadata
| Field | Value |
|---|---|
| **Sprint ID** | SPRINT-11 |
| **Title** | Regional Expansion (UG/ET/RW) |
| **Duration** | 4 weeks |
| **Priority** | P2 — Growth |
| **Dependency** | All previous sprints (mature product required) |
| **Parallelizable** | Yes — each country is independent |
| **Owner** | Backend + DevOps + Compliance Team |

---

## 1. Objective

Prepare TWENDE for **multi-country deployment** across Uganda (UG), Ethiopia (ET), and Rwanda (RW). This is not a full launch — it's the infrastructure and configuration work to make the platform region-aware, payment-ready, and legally compliant in each target market.

The sprint delivers: country-specific configurations, mobile money integrations (MTN Mobile Money, Telebirr, MTN MoMo Rwanda), regulatory compliance frameworks, localized content, and feature flagging per region.

---

## 2. Country Analysis

### 2.1 Market Overview

| Country | Population | Mobile Money | Key Competitors | Regulatory Body | Currency |
|---------|-----------|--------------|-----------------|-----------------|----------|
| **Uganda** | 48M | MTN Mobile Money (60%), Airtel Money (35%) | ChapChap, Numida, Ensibuuko | Bank of Uganda (BoU) | UGX |
| **Ethiopia** | 120M | Telebirr (50M users, state-owned) | Kacha, ArifPay | National Bank of Ethiopia (NBE) | ETB |
| **Rwanda** | 14M | MTN MoMo (70%), Airtel Money (25%) | Exuus, SPENN | National Bank of Rwanda (BNR) | RWF |

### 2.2 Payment Integration Mapping

| Country | Primary Mobile Money | API Available | Integration Complexity |
|---------|---------------------|---------------|----------------------|
| Uganda | MTN Mobile Money | MTN MoMo API | Medium — REST API, OAuth 2.0 |
| Uganda | Airtel Money | Airtel Money API | Medium — similar to MTN |
| Ethiopia | Telebirr | Telebirr API (state) | High — government-controlled, slow approval |
| Ethiopia | Kacha | Kacha API | Low — startup-friendly |
| Rwanda | MTN MoMo | MTN MoMo API | Medium — same as Uganda |
| Rwanda | Airtel Money | Airtel Money API | Medium |

---

## 3. Technical Specification

### 3.1 Country Configuration System

```typescript
// Country-specific configuration
interface CountryConfig {
  code: 'KE' | 'UG' | 'ET' | 'RW';
  name: string;
  currency: {
    code: string;           // 'KES', 'UGX', 'ETB', 'RWF'
    symbol: string;         // 'KSh', 'USh', 'Br', 'RF'
    subunit: string;        // 'cents', etc.
  };
  
  // Mobile money providers
  paymentProviders: {
    id: string;
    name: string;
    type: 'mobile_money' | 'bank' | 'card';
    apiConfig: {
      baseUrl: string;
      authType: 'oauth2' | 'api_key' | 'basic';
      credentials: Record<string, string>;
    };
    features: {
      stkPush: boolean;
      b2c: boolean;
      c2b: boolean;
      balanceQuery: boolean;
    };
  }[];
  
  // Regulatory
  regulatory: {
    centralBank: string;
    licensingRequired: boolean;
    licenseType?: string;
    maxInterestRate?: number;     // annual %
    dataProtectionLaw: string;
    kycRequirements: {
      tier1: string[];
      tier2: string[];
      tier3: string[];
    };
  };
  
  // Localization
  localization: {
    primaryLanguage: string;
    secondaryLanguage: string;
    dateFormat: string;
    numberFormat: string;
    timezone: string;
  };
  
  // Features enabled
  features: {
    chama: boolean;
    biashara: boolean;
    kazi: boolean;
    linda: boolean;
    soko: boolean;
  };
  
  // Go-live status
  status: 'disabled' | 'beta' | 'live';
}

const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  KE: {
    code: 'KE',
    name: 'Kenya',
    currency: { code: 'KES', symbol: 'KSh', subunit: 'cents' },
    paymentProviders: [
      {
        id: 'mpesa',
        name: 'M-Pesa',
        type: 'mobile_money',
        apiConfig: {
          baseUrl: 'https://sandbox.safaricom.et/ke', // or production
          authType: 'oauth2',
          credentials: { consumerKey: '', consumerSecret: '' }
        },
        features: { stkPush: true, b2c: true, c2b: true, balanceQuery: true }
      }
    ],
    regulatory: {
      centralBank: 'Central Bank of Kenya (CBK)',
      licensingRequired: true,
      licenseType: 'Digital Credit Provider',
      maxInterestRate: 24,
      dataProtectionLaw: 'Data Protection Act 2019',
      kycRequirements: {
        tier1: ['phone_number'],
        tier2: ['national_id', 'selfie'],
        tier3: ['proof_of_address', 'income_verification']
      }
    },
    localization: {
      primaryLanguage: 'sw',
      secondaryLanguage: 'en',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '#,##0.00',
      timezone: 'Africa/Nairobi'
    },
    features: { chama: true, biashara: true, kazi: true, linda: true, soko: true },
    status: 'live'
  },
  
  UG: {
    code: 'UG',
    name: 'Uganda',
    currency: { code: 'UGX', symbol: 'USh', subunit: 'cents' },
    paymentProviders: [
      {
        id: 'mtn_momo_ug',
        name: 'MTN Mobile Money',
        type: 'mobile_money',
        apiConfig: {
          baseUrl: 'https://sandbox.momodeveloper.mtn.com', // or production
          authType: 'oauth2',
          credentials: { subscriptionKey: '', apiUser: '', apiKey: '' }
        },
        features: { stkPush: true, b2c: true, c2b: true, balanceQuery: true }
      },
      {
        id: 'airtel_money_ug',
        name: 'Airtel Money',
        type: 'mobile_money',
        apiConfig: {
          baseUrl: 'https://api.airtel.africa/ug', // placeholder
          authType: 'oauth2',
          credentials: { clientId: '', clientSecret: '' }
        },
        features: { stkPush: true, b2c: true, c2b: false, balanceQuery: true }
      }
    ],
    regulatory: {
      centralBank: 'Bank of Uganda (BoU)',
      licensingRequired: true,
      licenseType: 'Tier 4 Microfinance Institution',
      maxInterestRate: 36,  // Uganda higher cap
      dataProtectionLaw: 'Data Protection and Privacy Act 2019',
      kycRequirements: {
        tier1: ['phone_number'],
        tier2: ['national_id', 'selfie'],
        tier3: ['proof_of_address']
      }
    },
    localization: {
      primaryLanguage: 'en',
      secondaryLanguage: 'lg',  // Luganda
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '#,##0',
      timezone: 'Africa/Kampala'
    },
    features: { chama: true, biashara: true, kazi: true, linda: false, soko: true },
    status: 'beta'
  },
  
  ET: {
    code: 'ET',
    name: 'Ethiopia',
    currency: { code: 'ETB', symbol: 'Br', subunit: 'santim' },
    paymentProviders: [
      {
        id: 'telebirr',
        name: 'Telebirr',
        type: 'mobile_money',
        apiConfig: {
          baseUrl: 'https://api.telebirr.com', // placeholder
          authType: 'api_key',
          credentials: { apiKey: '', merchantCode: '' }
        },
        features: { stkPush: true, b2c: false, c2b: true, balanceQuery: false }
      },
      {
        id: 'kacha',
        name: 'Kacha',
        type: 'mobile_money',
        apiConfig: {
          baseUrl: 'https://api.kacha.com', // placeholder
          authType: 'oauth2',
          credentials: { clientId: '', clientSecret: '' }
        },
        features: { stkPush: true, b2c: true, c2b: true, balanceQuery: true }
      }
    ],
    regulatory: {
      centralBank: 'National Bank of Ethiopia (NBE)',
      licensingRequired: true,
      licenseType: 'Payment Instrument Issuer',
      maxInterestRate: null,  // No formal cap, but usury laws apply
      dataProtectionLaw: 'Computer Crime Proclamation 2016',
      kycRequirements: {
        tier1: ['phone_number'],
        tier2: ['national_id'],
        tier3: ['proof_of_address', 'tax_id']
      }
    },
    localization: {
      primaryLanguage: 'am',  // Amharic
      secondaryLanguage: 'en',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '#,##0.00',
      timezone: 'Africa/Addis_Ababa'
    },
    features: { chama: false, biashara: true, kazi: true, linda: false, soko: true },
    status: 'disabled'  // Most complex — last to launch
  },
  
  RW: {
    code: 'RW',
    name: 'Rwanda',
    currency: { code: 'RWF', symbol: 'RF', subunit: 'centime' },
    paymentProviders: [
      {
        id: 'mtn_momo_rw',
        name: 'MTN MoMo',
        type: 'mobile_money',
        apiConfig: {
          baseUrl: 'https://sandbox.momodeveloper.mtn.com', // Rwanda endpoint
          authType: 'oauth2',
          credentials: { subscriptionKey: '', apiUser: '', apiKey: '' }
        },
        features: { stkPush: true, b2c: true, c2b: true, balanceQuery: true }
      }
    ],
    regulatory: {
      centralBank: 'National Bank of Rwanda (BNR)',
      licensingRequired: true,
      licenseType: 'Payment Service Provider',
      maxInterestRate: null,
      dataProtectionLaw: 'Law No. 058/2021 on Data Protection',
      kycRequirements: {
        tier1: ['phone_number'],
        tier2: ['national_id'],
        tier3: ['proof_of_address']
      }
    },
    localization: {
      primaryLanguage: 'rw',  // Kinyarwanda
      secondaryLanguage: 'en',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '#,##0',
      timezone: 'Africa/Kigali'
    },
    features: { chama: true, biashara: true, kazi: true, linda: false, soko: true },
    status: 'beta'
  }
};
```

### 3.2 Payment Provider Abstraction

```typescript
// Abstract payment interface — country-agnostic
interface PaymentProvider {
  id: string;
  name: string;
  
  // Authentication
  authenticate(): Promise<AuthToken>;
  refreshToken(): Promise<AuthToken>;
  
  // Payment operations
  initiateStkPush(params: StkPushParams): Promise<StkPushResult>;
  queryTransactionStatus(checkoutRequestId: string): Promise<TransactionStatus>;
  sendB2C(params: B2CParams): Promise<B2CResult>;
  registerC2BUrl(confirmationUrl: string, validationUrl: string): Promise<void>;
  processC2BCallback(payload: unknown): Promise<C2BCallbackResult>;
  
  // Utilities
  formatPhoneNumber(phone: string): string;  // country-specific formatting
  parseAmount(amount: number): number;       // handle currency subunits
  validatePhoneNumber(phone: string): boolean;
}

// Factory pattern — instantiate correct provider by country
class PaymentProviderFactory {
  static getProvider(country: string, providerId: string): PaymentProvider {
    const config = COUNTRY_CONFIGS[country];
    const providerConfig = config.paymentProviders.find(p => p.id === providerId);
    
    switch (providerId) {
      case 'mpesa':
        return new MpesaProvider(providerConfig.apiConfig);
      case 'mtn_momo_ug':
      case 'mtn_momo_rw':
        return new MtnMoMoProvider(providerConfig.apiConfig);
      case 'airtel_money_ug':
        return new AirtelMoneyProvider(providerConfig.apiConfig);
      case 'telebirr':
        return new TelebirrProvider(providerConfig.apiConfig);
      case 'kacha':
        return new KachaProvider(providerConfig.apiConfig);
      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }
  }
}
```

### 3.3 Database Changes for Multi-Country

```sql
-- Add country column to existing tables
ALTER TABLE users ADD COLUMN country VARCHAR(2) NOT NULL DEFAULT 'KE';
ALTER TABLE users ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'KES';

-- Country-specific configurations (runtime config)
CREATE TABLE country_settings (
  country VARCHAR(2) PRIMARY KEY,
  config JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment provider credentials (encrypted)
CREATE TABLE payment_provider_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country VARCHAR(2) NOT NULL,
  provider_id VARCHAR(30) NOT NULL,
  environment VARCHAR(10) NOT NULL DEFAULT 'sandbox',  -- 'sandbox' | 'production'
  credentials_encrypted TEXT NOT NULL,  -- AES-256 encrypted
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(country, provider_id, environment)
);

-- Transaction records (country-aware)
ALTER TABLE transactions ADD COLUMN country VARCHAR(2) NOT NULL DEFAULT 'KE';
ALTER TABLE transactions ADD COLUMN provider_id VARCHAR(30);
ALTER TABLE transactions ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'KES';
CREATE INDEX idx_transactions_country ON transactions(country);

-- Localized content
CREATE TABLE localized_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL,
  country VARCHAR(2) NOT NULL,
  language VARCHAR(5) NOT NULL,
  content TEXT NOT NULL,
  content_type VARCHAR(20) NOT NULL DEFAULT 'text',  -- 'text', 'html', 'json'
  UNIQUE(key, country, language)
);
```

---

## 4. Implementation Guardrails

### 4.1 MUST NOT

- **NEVER** hardcode country-specific values in business logic — always use CountryConfig
- **NEVER** process payments in a country without testing in sandbox first
- **NEVER** share production credentials between countries
- **NEVER** launch lending in a country without regulatory approval
- **NEVER** skip KYC requirements specific to each country's regulations
- **NEVER** store payment provider credentials in plain text — AES-256 encryption required
- **NEVER** enable all features in a new country simultaneously — phased rollout

### 4.2 MUST

- **MUST** implement feature flags per country (can disable products per region)
- **MUST** store all country configurations in database (not code) for runtime changes
- **MUST** encrypt payment provider credentials at rest
- **MUST** validate phone numbers using country-specific formats
- **MUST** format currency amounts using country-specific locale
- **MUST** handle timezone conversions for all date/time displays
- **MUST** provide localized error messages in primary language
- **MUST** maintain separate sandbox and production credentials per country
- **MUST** log all cross-border transactions for regulatory reporting
- **MUST** implement gradual rollout: 1% → 10% → 50% → 100% of users

### 4.3 LAUNCH SEQUENCE

| Phase | Country | Products | Timeline | Gate |
|-------|---------|----------|----------|------|
| 1 | Uganda | Chama + Soko | Month 1 | Sandbox testing complete |
| 2 | Uganda | + Biashara + Kazi | Month 2 | BoU notification filed |
| 3 | Rwanda | All except Linda | Month 3 | BNR approval received |
| 4 | Ethiopia | Soko + Kazi only | Month 6+ | NBE license obtained |
| 5 | All | Full feature parity | Month 12 | Regulatory compliance verified |

---

## 5. Deliverables Checklist

- [ ] Country configuration system (database-driven)
- [ ] Payment provider abstraction layer (factory pattern)
- [ ] MTN MoMo Uganda integration (sandbox)
- [ ] Airtel Money Uganda integration (sandbox)
- [ ] Telebirr Ethiopia integration (sandbox)
- [ ] Kacha Ethiopia integration (sandbox)
- [ ] MTN MoMo Rwanda integration (sandbox)
- [ ] Phone number validation per country format
- [ ] Currency formatting per locale
- [ ] Timezone handling for all date displays
- [ ] Feature flag system per country
- [ ] Localized content management system
- [ ] Database migrations for country columns
- [ ] Payment provider credential encryption
- [ ] Country-specific KYC flow adaptations
- [ ] Regulatory compliance checklist per country
- [ ] Gradual rollout mechanism (percentage-based)
- [ ] Cross-border transaction logging
- [ ] Country-specific analytics segmentation
- [ ] Documentation: integration guides for each payment provider

---

## 6. Definition of Done

- [ ] Country configuration loaded from database at runtime
- [ ] Payment provider factory instantiates correct provider by country
- [ ] All 5 payment providers integrated in sandbox mode
- [ ] Phone numbers validate correctly for all 4 countries
- [ ] Currency formats correctly for KES, UGX, ETB, RWF
- [ ] Feature flags can disable products per country
- [ ] KYC flow adapts to country-specific requirements
- [ ] All database tables include country column
- [ ] Payment credentials encrypted at rest
- [ ] Gradual rollout can be configured per country
- [ ] Localized error messages in primary languages
- [ ] Cross-border transaction logging operational
- [ ] Uganda beta launch ready (Chama + Soko)
