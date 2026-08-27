# Sprint 13 — Chama Segmentation & Configurable Group Architecture

**Type:** Research + Architecture Sprint (No implementation code yet)  
**Status:** Proposal for review  
**Owner:** Product / Engineering / Research  
**Markets:** Kenya (KE) and Tanzania (TZ) — equal weight  
**Date:** August 2026

---

## Executive Summary

This sprint answers one question before we build the next set of contribution/ledger features:

> Should Twende Chama support different group types based on **who the members are** (member segment) and **what the group is trying to achieve** (purpose)?

The answer is **yes**, but only through a **shared Chama engine with configurable rules and templates**, not through separate apps or workflows for each profession.

Field evidence from Kenya and Tanzania shows that:

- Chamas/VICOBA/Upatu already serve very different economic realities.
- Teachers, farmers, traders, and gig workers have measurably different income patterns, contribution capacity, and group goals.
- Most of these differences can be expressed through **rules and templates** (contribution frequency, loan terms, approval thresholds, seasonal schedules) rather than separate products.
- Tanzania is structurally different from Kenya: VICOBA dominates rural savings, Upatu is the ROSCA equivalent, and regulatory/financial infrastructure is less formal. Any segmentation must work for both markets.

This document proposes the **minimum extensible architecture** that lets Twende represent the major ways East Africans organize, save, lend, accumulate capital, and invest together — without fragmenting the product.

---

## 1. Research Findings and Supporting Evidence

### 1.1 Market scale and group types

**Kenya**

- An estimated **300,000 chamas** manage roughly **KES 300 billion (USD ~3.4 billion)** in collective assets. [[Huduma Global](https://hudumaglobal.com/blog/understanding-chamas-kenya-investment-groups-merry-go-rounds-collective-saving)]
- **41% of Kenyans** had used a chama by 2018, according to FSD Kenya research. [[money254.co.ke](https://www.money254.co.ke/post/chama-revolution-what-successful-chamas-know-do-why-many-fail)]
- Common Kenyan forms include:
  - **Merry-go-round / ROSCA** — fixed contributions, lump-sum payout to one member per cycle.
  - **Welfare / emergency fund** — member-facing safety net for funerals, medical, school fees.
  - **Savings + loans (ASCA-like)** — accumulate savings, lend internally at agreed interest.
  - **Investment club** — pooled capital for land, property, shares, or businesses. [[money254.co.ke — From Chama to Portfolio](https://www.money254.co.ke/post/from-chama-to-portfolio-turning-group-savings-into-investments-money-management)]
  - **Single-purpose groups** — school fees, travel, weddings, emergencies.

**Tanzania**

- **VICOBA** (Village Community Banks) are the dominant accumulating-savings model: 15–30 members, weekly meetings, share purchases, internal loans (often ~10% per period), and an **annual share-out**. [[UN Women](https://africa.unwomen.org/en/stories/feature-story/2026/05/vicoba-where-financial-inclusion-meets-leadership-with-women-at-the-forefront)]
- **Upatu / Mchezo** is the Tanzanian ROSCA: fixed periodic contributions, rotating payout. The names are interchangeable; "upatu" is seen as more modern/middle-class, "mchezo" older. [[Sociostudies](https://www.sociostudies.org/journal/articles/1556388/)]
- VICOBA and Upatu are deeply embedded in rural and peri-urban life, especially among women, market vendors, farmers, and informal workers. [[Uchumi360](https://uchumi360.com/Markets/financial-services/why-tanzanians-prefer-informal-savings-groups)]
- Payouts are commonly used for: school fees, farming inputs, stocking business inventory, and household emergencies. [[Uchumi360](https://uchumi360.com/m/b/tanzanians-prefer-informal-savings)]
- Tanzanian VICOBA savings typically range from **TSh 5,000 to 100,000 per month**, with groups of 15–30. [[NIH PMC study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10624283/)]

### 1.2 Why the generic Chama model is not enough

The current Twende Chama data model (`chamas` table) already supports three `group_type` values:

- `savings_only`
- `savings_loans`
- `investment`

This is a good start, but it conflates **member identity** and **group purpose** into one field. It also assumes:

- Monthly or weekly contributions are the norm.
- Loan repayment follows a fixed monthly schedule.
- All members have similar income patterns.

Evidence shows these assumptions break down for:

- **Farmers** — income is seasonal; repayment after harvest is preferred.
- **Gig workers** — daily cash income; micro-contributions and emergency liquidity matter more than monthly lump sums.
- **Teachers** — predictable salaries support longer-term capital accumulation and investment clubs.
- **Traders** — need working-capital liquidity tied to stock cycles, not fixed long-term loans.

### 1.3 High-potential segments — what the research says

#### Teachers (Kenya and Tanzania)

- In Kenya, **Mwalimu National SACCO** holds over **KES 100 billion in assets** and serves **90,000+ teachers**. [[locallistingdealz.com](https://locallistingdealz.com/sacco-vs-chama-kenya-2026/)]
- Teachers already have strong professional networks and predictable salaries. They use SACCOs for formal savings/loans but also informal chamas for land buying, investment, and welfare.
- A teacher-specific Chama profile is not about special workflows; it is about **defaults**: higher contribution amounts, longer investment horizons, lower loan default risk, and goals like land, housing, professional development, and retirement.

#### Farmers (Kenya and Tanzania)

- Agriculture dominates rural livelihoods in both countries. Existing cooperatives already organize around labor-sharing, input purchasing, equipment sharing, harvesting, storage, and transport.
- Farmer groups need capital for: inputs, equipment, livestock, irrigation, land lease, storage, processing/value addition, and working capital.
- Income is **seasonal**, so contribution schedules and loan repayment must be harvest-aligned.
- VICOBA in Tanzania already demonstrates this behavior: loans are taken before planting and repaid after harvest. [[Uchumi360](https://uchumi360.com/Markets/financial-services/why-tanzanians-prefer-informal-savings-groups)]

#### Traders / market vendors

- Operate on **daily/weekly cash income**.
- Common use of ROSCA/Upatu to get lump sums for restocking inventory.
- Need **working-capital Chamas** with short cycles and quick loan access.
- Flexible repayment is important because sales fluctuate.

#### Gig workers (boda boda, delivery, digital gigs)

- Kenya has **1M+ boda-boda riders**; Tanzania has large informal transport and delivery sectors.
- CGAP research shows gig workers’ top need is a **safe savings mechanism** to lock money away from impulse spending. [[TWENDE startup strategy](docs/twende_startup_strategy.md)]
- Common goals: emergency fund, vehicle repair, fuel, medical.
- Contribution pattern: **micro, frequent** (daily/weekly) rather than monthly.
- This is the original Twende Chama persona, but it should be one segment among several, not the default assumption.

### 1.4 SACCO vs Chama — a critical boundary

- **SACCOs** are regulated, formal financial cooperatives (SASRA-regulated in Kenya). They offer larger loans, dividends on share capital, and stricter governance.
- **Chamas** are informal, flexible, relationship-based, and can be set up instantly.
- Twende Chama digitizes the **informal Chama layer**, not SACCOs. However, the most successful teacher and farmer groups may later graduate toward SACCO-like behavior. The architecture should allow that graduation path without forcing it.

### 1.5 Key implication for Tanzania

Tanzania is not just "Kenya with Swahili names." The product must:

- Support **VICOBA-style accumulating savings + annual share-out**, not just merry-go-round.
- Support **Upatu** as a recognized ROSCA purpose.
- Default to smaller group sizes (15–30 vs Kenya's larger investment clubs).
- Allow weekly/daily contribution patterns common in informal Tanzanian groups.
- Not block on **NIDA integration**; it can be added when the format is provided.

---

## 2. Recommended Segmentation Taxonomy

We propose **two independent dimensions** that live on top of the Core Chama Engine.

### 2.1 Dimension 1: Member Segment

A segment is a group of members with similar income patterns, trust networks, and financial goals. It is **not** a hard-coded category list; it is a configuration axis.

| Segment | Definition | Typical Income Pattern | Trust Basis |
|---|---|---|---|
| `salaried_workers` | Teachers, civil servants, healthcare workers, corporate employees | Regular monthly salary | Workplace / professional network |
| `farmers` | Smallholder farmers, pastoralists, agribusiness workers | Seasonal, harvest-dependent | Village / cooperative / producer group |
| `traders` | Market vendors, mama mbogas, shopkeepers, wholesalers | Daily/weekly cash, irregular | Market association / neighborhood |
| `gig_workers` | Boda boda, delivery riders, freelancers, casual labor | Daily micro-income, high variance | Work site / stage / platform |
| `micro_entrepreneurs` | Small business owners, artisans, service providers | Variable business revenue | Business community / family |
| `mixed_community` | Default neighborhood/family group with no single profession | Mixed | Family / neighborhood |

**Notes:**

- A group can have a **primary segment** and still allow mixed membership.
- Segments are not KYC fields; they are **group design inputs**.
- The list is extensible without schema changes.

### 2.2 Dimension 2: Chama Purpose

Purpose describes what the group is trying to accomplish. This is closer to the current `group_type` concept but expanded.

| Purpose | Description | Typical Payout / Use |
|---|---|---|
| `rotating_savings` | ROSCA / merry-go-round / upatu / mchezo | Fixed lump-sum payout to one member per cycle |
| `welfare_emergency` | Safety net for death, medical, school fees, disasters | Grant or low-interest loan to affected member |
| `savings_accumulation` | Accumulate savings with optional internal loans | Annual/biannual share-out or loan access |
| `investment_club` | Pool capital for collective investment | Dividends from land, shares, MMFs, business |
| `business_capital` | Working capital for traders/entrepreneurs | Short-term inventory/stock loans |
| `asset_acquisition` | Save for land, equipment, vehicles, livestock | Targeted payout when goal is reached |
| `education_development` | Professional development, school fees, training | Payout tied to education goal |
| `agriculture_project` | Seasonal inputs, equipment, irrigation, storage | Harvest-aligned loans and payouts |

### 2.3 Why keep them separate?

- `Teachers → Investment Club`
- `Teachers → Welfare Fund`
- `Farmers → Agriculture Project`
- `Farmers → Equipment Acquisition`
- `Traders → Working Capital Chama`
- `Gig Workers → Emergency Savings`

If we merge segment and purpose, we would end up with `Teacher Chama`, `Farmer Chama`, `Trader Chama` — exactly the fragmentation the architecture principle rejects.

---

## 3. Member Segment × Chama Purpose Matrix

| Segment / Purpose | Rotating Savings | Welfare / Emergency | Savings Accumulation | Investment Club | Business Capital | Asset Acquisition | Education / Development | Agriculture Project |
|---|---|---|---|---|---|---|---|---|
| **Salaried workers** | Medium | Medium | **High** | **High** | Low | **High** | **High** | Low |
| **Farmers** | Medium | **High** | **High** | Low | Medium | **High** | Low | **High** |
| **Traders** | **High** | Medium | Medium | Low | **High** | Medium | Low | Low |
| **Gig workers** | **High** | **High** | Medium | Low | Medium | Medium | Low | Low |
| **Micro-entrepreneurs** | Medium | Medium | **High** | Medium | **High** | **High** | Low | Low |
| **Mixed community** | **High** | **High** | Medium | Low | Low | Low | Low | Low |

**Legend:**

- **High** = strong natural fit; recommended initial templates.
- Medium = viable but secondary.
- Low = not a natural fit for that segment; do not build specialized templates yet.

### 3.1 Initial priority combinations

Based on adoption potential and the need to prove the architecture with real diversity, we recommend **six priority templates**:

1. **Salaried workers + Investment Club** (e.g., teachers saving for land/shares)
2. **Salaried workers + Education/Development** (e.g., teacher professional development)
3. **Farmers + Agriculture Project** (seasonal inputs, equipment)
4. **Farmers + Asset Acquisition** (livestock, irrigation, storage)
5. **Traders + Business Capital** (working capital, inventory)
6. **Gig workers + Welfare/Emergency** (micro-savings, quick loans)

---

## 4. Recommended Initial Target Segments

### 4.1 Primary launch segments

| Priority | Segment | Why first? | Market evidence |
|---|---|---|---|
| 1 | **Gig workers** | Original Twende persona; high pain; existing Kazi product synergy | CGAP savings-as-top-need; 1M+ boda-boda in Kenya |
| 2 | **Traders / market vendors** | High ROSCA/Upatu usage; working-capital need is immediate | Common in Kenyan chamas and Tanzanian Upatu groups |
| 3 | **Teachers / salaried workers** | Predictable income; strong professional networks; land/investment goals | Mwalimu SACCO 90K+ teachers; Amina persona in PRD |
| 4 | **Farmers** | Largest rural segment; seasonal mechanics prove template engine | VICOBA model already validates behavior in TZ |

### 4.2 Why not SACCOs?

SACCOs are regulated institutions. Twende Chama should not try to become a SACCO, but it can:

- Help informal groups **graduate** toward SACCO-style behavior.
- Provide the transparency and record-keeping SACCOs require.
- Allow groups to register formally if they choose (deferred feature).

### 4.3 Why Kenya and Tanzania equally?

- Kenya has more documented Chama behavior, but it is also more saturated with fintech solutions.
- Tanzania has **less formal finance penetration**, strong VICOBA/Upatu behavior, and a larger untapped market in rural areas.
- The architecture must work for both from day one. This means: weekly contribution cycles, ROSCA + ASCA models, and country-specific defaults.

---

## 5. Shared Functionality Across All Chamas

These features exist regardless of segment or purpose:

| Feature | Rationale |
|---|---|
| Phone-number-based registration + OTP | Universal entry point across KE/TZ |
| KYC tier system (1–3) | Already defined; segment does not change KYC requirements |
| M-Pesa C2B contributions | Universal payment rail |
| Transparent ledger + blockchain anchoring | Trust layer; applies to every group |
| Member roles: admin, treasurer, secretary, member | Governance is universal |
| Digital loan request + voting | Core engine feature |
| M-Pesa B2C disbursement | Universal payout method |
| Repayment tracking + penalty engine | Universal |
| USSD access (*384*77#) | Rural and feature-phone users in both markets |
| Credit score building from contribution behavior | Cross-product flywheel |
| WhatsApp/SMS notifications | Universal engagement layer |

---

## 6. Segment-Specific Functionality

For each proposed segment-specific feature, we explain why the generic engine cannot handle it adequately.

### 6.1 Salaried workers (teachers, civil servants)

| Feature | Why not generic? |
|---|---|
| **Higher default contribution amounts** (e.g., KES 2,000–10,000/month) | Generic engine allows any amount, but defaults/templates should reflect capacity |
| **Longer loan terms** (6–24 months) | Generic engine caps at 12 months today; investment clubs need longer horizons |
| **Investment-goal tracking** (land, shares, MMFs) | Generic engine has no goal-tracking UI; teachers need visibility toward collective targets |
| **Professional-development purpose category** | Loan purpose list should include education/training |

### 6.2 Farmers

| Feature | Why not generic? |
|---|---|
| **Seasonal contribution schedules** (planting → harvest) | Generic engine only supports weekly/bi-weekly/monthly fixed cycles |
| **Harvest-aligned loan repayment** | Fixed monthly repayment does not match cash flow |
| **Agricultural-purpose categories** (inputs, equipment, livestock, storage) | Generic purpose list is too generic |
| **Crop-cycle milestones** | Need ability to define contribution windows around planting, weeding, harvest |

### 6.3 Traders

| Feature | Why not generic? |
|---|---|
| **Short-cycle ROSCA templates** (weekly/daily) | Default monthly cycle is too slow for working capital |
| **Inventory/restocking purpose categories** | Need specific loan purposes tied to stock |
| **Flexible repayment tied to sales** | Fixed monthly repayment may not match cash flow |
| **Lower contribution floors** (e.g., KES 50–200) | Daily traders need micro contributions |

### 6.4 Gig workers

| Feature | Why not generic? |
|---|---|
| **Micro, frequent contributions** (daily/weekly) | Generic defaults are monthly |
| **Emergency-only savings pot** | Welfare purpose needs fast-access rules |
| **Vehicle/repair purpose categories** | Specific to boda-boda/delivery |
| **Integration with Kazi auto-save** | Future: sweep percentage of gig income into Chama |

---

## 7. Data-Model Changes Required

The existing schema in `docs/twende_chama_trd.md` is close to what we need. We propose incremental additions, not a rewrite.

### 7.1 Additions to `chamas` table

```sql
ALTER TABLE chamas ADD COLUMN primary_segment VARCHAR(50);
ALTER TABLE chamas ADD COLUMN purpose VARCHAR(50);
ALTER TABLE chamas ADD COLUMN template_id UUID REFERENCES chama_templates(id);
ALTER TABLE chamas ADD COLUMN country_code CHAR(2) DEFAULT 'KE'; -- KE or TZ
ALTER TABLE chamas ADD COLUMN seasonal_schedule JSONB DEFAULT NULL;
```

- `primary_segment`: the dominant member segment for this group.
- `purpose`: the Chama purpose.
- `template_id`: link to the template that generated initial rules.
- `country_code`: enables country-specific defaults and terminology.
- `seasonal_schedule`: flexible JSONB for planting/harvest windows, dry season, etc.

### 7.2 New `chama_templates` table

```sql
CREATE TABLE chama_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    country_code CHAR(2),                    -- NULL = both; KE; TZ
    primary_segment VARCHAR(50) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    default_rules JSONB NOT NULL,            -- contribution, loan, governance defaults
    ui_overrides JSONB DEFAULT NULL,         -- screen copy, icons, suggested goals
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(country_code, primary_segment, purpose)
);
```

### 7.3 Additions to `users` / `chama_members` table

```sql
-- Optional: capture member profession for analytics and template suggestions
ALTER TABLE chama_members ADD COLUMN member_segment VARCHAR(50);
ALTER TABLE users ADD COLUMN profession VARCHAR(100);
ALTER TABLE users ADD COLUMN employment_type VARCHAR(50);
```

These are **optional metadata fields** used for template suggestions and analytics, not for gating access.

### 7.4 Expansion of `loans.purpose` enum / vocabulary

Current PRD lists: emergency, business, education, medical, agriculture, other.

Proposed richer vocabulary:

- `emergency_medical`
- `emergency_funeral`
- `school_fees`
- `professional_training`
- `business_inventory`
- `business_equipment`
- `farm_inputs`
- `farm_equipment`
- `livestock`
- `land_lease`
- `asset_purchase`
- `home_construction`
- `vehicle_repair`
- `other`

### 7.5 Expansion of `contribution_frequency`

Current: `weekly`, `bi_weekly`, `monthly`.

Proposed additions:

- `daily`
- `quarterly`
- `seasonal`
- `custom` (with schedule defined in `seasonal_schedule` JSONB)

---

## 8. UX / Workflow Implications

### 8.1 Group creation wizard

Current wizard (PRD §2.2): 4 steps — Basic Info, Contribution Rules, Loan Rules, Governance & Invite.

Proposed new wizard:

1. **Basic Info** — name, description, country.
2. **Who is this Chama for?** — select primary member segment.
3. **What is the Chama for?** — select purpose.
4. **Choose a template** — system suggests 1–3 templates based on segment + purpose + country.
5. **Review / customize rules** — contribution amount, frequency, loan rules, governance.
6. **Invite members**.

The template pre-fills rules, but the organizer can override everything.

### 8.2 Dashboard variations by purpose

- **ROSCA / Upatu dashboard**: shows payout order, next payout amount, countdown.
- **Investment club dashboard**: shows total capital, investments, returns, goal progress.
- **Agriculture project dashboard**: shows crop-cycle milestones, input budget, harvest payout date.
- **Welfare dashboard**: shows welfare balance, recent claims, member coverage.

These are **view-layer differences**, not separate apps.

### 8.3 Contribution flows

- **Regular salaried**: monthly recurring via Ratiba.
- **Gig worker**: micro daily/weekly contributions with one-tap "save KES 50 today."
- **Farmer**: seasonal contributions with reminders at planting and harvest.
- **Trader**: weekly contributions aligned to market days.

### 8.4 USSD flow

USSD must support segment/purpose selection via numbered menus. Example:

```
*384*77# → Chama → Create Chama
1. Who are the members?
   1. Salaried workers
   2. Farmers
   3. Traders
   4. Gig workers
2. What is the goal?
   1. Save together
   2. Lending group
   3. Investment
   ...
```

### 8.5 Terminology by country

| Concept | Kenya term | Tanzania term |
|---|---|---|
| ROSCA | Merry-go-round | Upatu / Mchezo |
| ASCA / accumulating savings | Savings & loans Chama | VICOBA |
| Group | Chama | Kikundi / Chama |
| Savings share | Share | Hisa |

The UI should use the country-appropriate term without hard-coding it in business logic.

---

## 9. Configuration / Template Architecture

### 9.1 Core principle

```
Core Chama Engine
    → Member Segment
        → Purpose
            → Template
                → Configurable Rules
                    → Group Instance
```

### 9.2 Template JSONB structure

```json
{
  "template_id": "uuid",
  "name": "Teacher Investment Club",
  "country": "KE",
  "primary_segment": "salaried_workers",
  "purpose": "investment_club",
  "defaults": {
    "contribution_amount": 5000,
    "contribution_frequency": "monthly",
    "contribution_day": 5,
    "max_loan_multiplier": 3.0,
    "loan_interest_rate_monthly": 5.0,
    "max_loan_term_months": 12,
    "approval_threshold": "two_thirds",
    "auto_approve_threshold": 10000,
    "late_contribution_penalty_rate": 2.0,
    "grace_period_days": 14,
    "max_members": 30
  },
  "ui_overrides": {
    "goal_suggestions": ["Land purchase", "Money market fund", "Group business"],
    "icon": "land",
    "welcome_copy": "Build long-term wealth with colleagues."
  },
  "segment_specific": {
    "allow_seasonal_schedule": false,
    "allow_daily_contributions": false,
    "loan_purpose_whitelist": ["business_equipment", "asset_purchase", "home_construction", "other"]
  }
}
```

### 9.3 Rule override behavior

- Templates provide **defaults**.
- Organizers can override any rule during creation.
- Rule changes after creation follow existing governance vote workflow.
- Template version is stored on the group for audit.

### 9.4 Extensibility

Adding a new segment/purpose combination should require:

1. Adding a row to `chama_templates`.
2. Adding UI strings/icons.
3. No backend code changes.

---

## 10. Features Proposed for This Sprint

This sprint is architecture-only. No full feature launch.

| # | Feature | Acceptance criteria |
|---|---|---|
| 1 | **Segment + purpose data model** | `chamas` table has `primary_segment`, `purpose`, `template_id`, `country_code`, `seasonal_schedule`; new `chama_templates` table created; migration is backward-compatible. |
| 2 | **Template engine seed data** | At least 6 templates created for priority combinations (teachers investment, teachers education, farmers agriculture, farmers asset, traders working capital, gig welfare) for both KE and TZ where applicable. |
| 3 | **Group creation wizard update** | Organizer can select segment and purpose; system suggests templates; organizer can override all rules; new groups store template reference. |
| 4 | **Contribution frequency expansion** | Support `daily`, `quarterly`, `seasonal`, and `custom` schedules in schema and validation; at least monthly/weekly/day used in templates. |
| 5 | **Loan purpose vocabulary expansion** | At least 13 specific purpose codes supported in `loans.purpose` and UI. |
| 6 | **Country-specific defaults** | KE/TZ terminology and defaults differ where evidence shows difference (e.g., Upatu vs merry-go-round, VICOBA defaults). |
| 7 | **USSD segment/purpose menu** | Feature-phone users can create or join a group and see segment/purpose options via numbered menus. |
| 8 | **Admin template management API** | CRUD endpoints for `chama_templates`; restricted to platform admins. |
| 9 | **Analytics foundation** | Events emitted when group created with segment/purpose/template; dashboard-ready for later analytics sprint. |

### 10.1 Explicitly out of scope for this sprint

- Building separate apps or screens per profession.
- Full seasonal/harvest repayment automation (schema only).
- SACCO integration or formal registration workflows.
- Investment marketplace or MMF integration.
- Agricultural insurance (Linda integration).
- Kazi auto-save integration.
- NIDA verification (wait for format).

---

## 11. Features Explicitly Deferred

| Feature | Why deferred? | Likely sprint |
|---|---|---|
| **SACCO integration / graduation path** | Regulatory scope; requires SASRA/CBRT dialogue | Phase 2+ |
| **Investment marketplace** | Requires partner integrations (MMFs, brokerages) | SPRINT_INVESTMENT or later |
| **Agricultural insurance** | Depends on Linda launch and weather data | SPRINT_LINDA_V3 |
| **Kazi auto-save into Chama** | Requires gig platform APIs | SPRINT_KAZI_V2/V3 |
| **Advanced segment analytics** | Depends on analytics infrastructure | SPRINT_ANALYTICS |
| **AI-driven template recommendations** | Needs transaction history at scale | Later |
| **Formal group registration** | Legal/compliance work; not core engine | Later |
| **NIDA integration** | Format not provided yet | SPRINT_AUTH or SPRINT_KYC |

---

## 12. Acceptance Criteria for the Sprint

### 12.1 Research acceptance

- [ ] At least 6 priority segment-purpose combinations are documented with market evidence from Kenya and/or Tanzania.
- [ ] SACCO vs Chama boundary is clearly defined.
- [ ] Tanzania-specific differences (VICOBA, Upatu, smaller group sizes, weekly patterns) are reflected in the proposal.

### 12.2 Architecture acceptance

- [ ] Data model supports member segment, purpose, template, country, and seasonal schedule without breaking existing groups.
- [ ] Adding a new segment-purpose combination requires only template + UI changes, not backend code.
- [ ] Existing generic Chama model (`savings_only`, `savings_loans`, `investment`) continues to work unchanged.

### 12.3 UX acceptance

- [ ] Group creation wizard includes segment and purpose selection.
- [ ] System suggests relevant templates based on segment + purpose + country.
- [ ] Organizer can override template defaults.
- [ ] USSD flow supports segment/purpose selection.

### 12.4 Engineering acceptance

- [ ] Migration scripts are backward-compatible.
- [ ] New template CRUD API is restricted to admins.
- [ ] Contribution frequency enum supports new values.
- [ ] Loan purpose vocabulary supports at least 13 codes.
- [ ] Analytics events are emitted for segment/purpose/template selection.

### 12.5 Documentation acceptance

- [ ] This proposal is reviewed and approved by product/engineering.
- [ ] API and data-model changes are documented in the TRD.
- [ ] UX copy and terminology map (KE vs TZ) is created for design.

---

## 13. Risks and Open Questions

| Risk | Mitigation |
|---|---|
| Over-engineering segment support | Start with 6 templates; refuse separate apps/workflows per profession. |
| Tanzania terminology confusion | Use "Upatu" for ROSCA in TZ, "merry-go-round" in KE; store canonical purpose code internally. |
| NIDA format delay | Do not block; KE Huduma Namba path can be built first; TZ path accepts manual ID upload until NIDA is ready. |
| Farmers' seasonal schedule complexity | Schema supports it; full repayment automation deferred. |
| SACCO overlap | Position Twende Chama as the informal, flexible entry point; SACCO graduation is a future feature. |

---

## 14. Recommended Next Steps

1. **Review and approve this proposal** with product and engineering leads.
2. **Finalize terminology map** for Kenya vs Tanzania (copywriting task).
3. **Create design mocks** for updated group creation wizard and segment-specific dashboards.
4. **Write migration scripts** for data-model changes.
5. **Seed template table** with the 6 priority templates.
6. **Plan implementation sprint** (Sprint 14 or later) focused on wizard + template engine only.
7. **Re-engage on NIDA** once the format is provided.

---

## References

- [Huduma Global — Understanding Chamas in Kenya](https://hudumaglobal.com/blog/understanding-chamas-kenya-investment-groups-merry-go-rounds-collective-saving)
- [money254 — Chama Revolution](https://www.money254.co.ke/post/chama-revolution-what-successful-chamas-know-do-why-many-fail)
- [money254 — From Chama to Portfolio](https://www.money254.co.ke/post/from-chama-to-portfolio-turning-group-savings-into-investments-money-management)
- [Uchumi360 — Why Tanzanians Prefer Informal Savings Groups](https://uchumi360.com/Markets/financial-services/why-tanzanians-prefer-informal-savings-groups)
- [Uchumi360 — Tanzanians Prefer Informal Savings (mobile)](https://uchumi360.com/m/b/tanzanians-prefer-informal-savings)
- [UN Women — VICOBA](https://africa.unwomen.org/en/stories/feature-story/2026/05/vicoba-where-financial-inclusion-meets-leadership-with-women-at-the-forefront)
- [Sociostudies — Mchezo/Upatu in Tanzania](https://www.sociostudies.org/journal/articles/1556388/)
- [NIH PMC — VICOBA for house improvements in rural Tanzania](https://pmc.ncbi.nlm.nih.gov/articles/PMC10624283/)
- [World Bank Blogs — VICOBA in Mbeya](https://blogs.worldbank.org/en/impactevaluations/five-things-we-learnt-loan-and-grain-storage-intervention-in-tanzania-guest-post-hira-channa)
- [locallistingdealz — SACCO vs Chama Kenya](https://locallistingdealz.com/sacco-vs-chama-kenya-2026/)
- [fibo360 — Comparison between Chama and SACCO](https://fibo360.co.ke/comparison-between-a-chama-and-a-sacco/)
- [Lendsqr — Consumer credit in Tanzania](https://blog.lendsqr.com/a-deep-overview-of-consumer-credit-in-tanzania/)
- Internal: `docs/twende_unified_prd.md`, `docs/twende_chama_prd.md`, `docs/twende_chama_trd.md`, `docs/twende_startup_strategy.md`
