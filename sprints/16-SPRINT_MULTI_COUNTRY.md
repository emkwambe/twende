# Sprint 16 — Multi-Country Readiness

## Making Territory Expansion Actually Additive

**Status:** Plan. Nothing in this sprint is implemented.
**Depends on:** Sprint 14 (country packs — the shape), Sprint 15 (KYC — the forcing function)
**Blocks:** Kenya, Uganda, Rwanda — any second market
**Supersedes:** Sprint 11 (Regional Expansion UG/ET/RW)
**Recommended order:** **Phase 0 now**, before anything else. Phases 1–4 after Sprint 15.

> **On Phase 0 and the sprint number.** Phase 0 is a correctness fix that belongs to no
> market, and it should run *before* Sprint 15 despite living in a higher-numbered
> document. Sprint numbers here identify specs, not schedule; `00-SPRINT_ROADMAP.md` §3
> holds the execution order. If it helps, treat Phase 0 as standalone work that Sprint 16
> happens to document because it is the foundation the rest of the sprint stands on.

---

## 0.0 Relationship to Sprint 11

`11-SPRINT_REGIONAL.md` covered the same ground and is superseded. It was written when
**Kenya was the base market and Tanzania was an expansion target** — the reverse of where
the platform now stands. It targets Uganda, **Ethiopia** and Rwanda; Ethiopia is out of
scope, and Kenya, which the old spec treated as home, is now the market that needs a pack
built.

Its country research (mobile money providers, regulators, currency) may still be worth
mining. Its sequencing and its geographic premise are not.

---

## 0. The Finding

Sprint 14 created `country_packs/` and moved every Tanzania-specific constant into `tanzania.py`. That was the right move and the module is genuinely clean — pure data, no backend imports, no cycles.

**But nothing consumes the abstraction.** Every backend module reaches past the registry and imports the Tanzania pack directly:

```python
# config.py, constitution.py, country_config.py, ledger.py, main.py, underwriting.py
from country_packs import tanzania as tz
```

`get_pack()` is called by **nothing**. `PACKS` has **one** entry. And the resolver fails open:

```python
def get_pack(country_code: str = "TZ"):
    return PACKS.get(country_code.upper(), tanzania)   # UG → Tanzania, silently
```

So adding a market today would not add behaviour — it would produce a system that **silently underwrites Uganda and Rwanda as Tanzania**, with no error and no signal. That is worse than not supporting them, because it looks like it works.

### Coupling, measured

| Module | `tz.*` refs | What breaks in a second market |
|---|---|---|
| `underwriting.py` | 15 | **Never reads `group.country`.** A Kenyan group gets the VICOBA 4× rule, a TZS 50,000 weekly income floor, the Upatu guarantee multiplier, agricultural seasonality tuned to Tanzanian harvests, and NIDA/TIN/BRELA formalization points |
| `config.py` | 8 | TZ constants frozen into module-level Pydantic singletons at import. One is named `MIN_WEEKLY_INCOME_TZS` — the currency is in the setting name. Process-wide, not per-request |
| `main.py` | 3 | `tz.tier_for_score()` (lines 466, 548) and `tz.CURRENCY` (582) — every borrower gets TZS-denominated tiers regardless of country |
| `ledger.py` | 2 | `tz.DEFAULT_GRACE_WEEKS` sets the default threshold for all markets; `tz.CURRENCY` labels every ledger response |
| `constitution.py` | 1 | `JOINING_FEE_TZS` — currency in the variable name, TZ value in the constant |

### What exists for Kenya, and what doesn't

`country_config.py` and `src/lib/country.ts` both carry a KE entry: currency, symbol, phone prefix, ID label, group vocabulary. That is the **display** layer, and it is fine.

`country_packs/` contains **only `tanzania.py`**. Kenya has no underwriting guardrails, no formalization documents, no loan tiers, no seasonality model, no payment methods, no scoring bands. And `country_config.py:36` reads `id_regex=None,  # TODO: add Huduma Namba regex`.

So Kenya can be *displayed*. It cannot be *underwritten*.

---

## 1. Phase 0 — Currency Denomination (do this now)

**This is the one item that should not wait for Sprint 15**, because it gets more expensive with every transaction the pilot writes.

### The problem

**No money column anywhere carries a currency.** Thirteen columns across five tables:

| Table | Columns |
|---|---|
| `groups` | `total_savings` |
| `members` | `savings_balance`, `loan_balance` |
| `loan_applications` | `amount`, `weekly_payment`, `total_repayment`, `loan_balance` |
| `mobile_money_statements` | `total_inflow`, `total_outflow`, `net_flow`, `avg_weekly_inflow` |
| `transactions` | `amount`, `balance_after` |

All are bare `Numeric(12, 2)`. The denomination lives nowhere — not on the row, not on the table, not in a constraint. It is currently implicit in the fact that every row is Tanzanian.

The two `currency` fields that exist (`schemas.py:333`, `:390`) are **response-shaping only** — computed at serialisation from `tz.CURRENCY`, never stored.

### Why it matters the moment a second market exists

TZS 1,000,000 and KES 50,000 are roughly the same value and twenty-fold apart as numbers. Once both are in the same column with no denomination:

- Group totals, portfolio aggregates and the ledger silently mis-sum across markets.
- The underwriting ratios — `savings / amount`, `group_savings / amount`, DSR — are dimensionless *only if numerator and denominator share a currency. Nothing enforces that.*
- `Numeric(12, 2)` gives 10 integer digits. TZS 10,000,000 (the Tier 4 ceiling) is fine, but a low-denomination currency plus inflation is worth a second look before it bites.
- **The failure is silent and plausible.** A wrong total looks like a total.

### The work

1. Add `currency CHAR(3) NOT NULL` to all thirteen columns' tables (one per table is sufficient where every money column on the row shares a denomination; `transactions` and `loan_applications` should carry their own since they are the durable financial record).
2. Backfill `'TZS'` — every existing row is Tanzanian.
3. Set `NOT NULL` after backfill.
4. Add a **check constraint** or application-level guard that a group's currency matches its country's pack currency.
5. Make `Money` a value type in the application layer — an amount without a currency should not be constructible. This is the same defence as the redacting `NationalId` type in Sprint 15: make the wrong thing unrepresentable rather than relying on discipline.
6. Assert same-currency in every arithmetic path — `ledger.post_transaction`, `underwriting.evaluate`, all aggregate queries.

**Alembic is already wired** (5 migrations present), so this is a normal migration, not new infrastructure.

**Test:**
```bash
cd backend && alembic upgrade head
pytest backend/tests/test_currency_integrity.py -v
python backend/scripts/verify_no_null_currency.py
```
**Acceptance:** no money row without a currency; a cross-currency arithmetic attempt raises rather than returning a number; existing Tanzania behaviour is byte-identical.

---

## 2. Phase 1 — Write the Pack Contract

There is no contract today. A pack is "whatever `tanzania.py` happens to export", which is discoverable only by reading every `tz.` reference across six modules.

1. Define a `CountryPack` `Protocol` (or ABC) naming every required constant and function: identity (`ID_LABEL`, `ID_REGEX`, `ID_FORMAT_HINT`, `FORMALIZATION_DOCS`), money (`CURRENCY`, `CURRENCY_SYMBOL`, `JOINING_FEE`, `DEFAULT_INTEREST_RATE`), vocabulary (`GROUP_TYPES`, `GROUP_TYPE_DEFAULT`, `MEETING_FREQUENCIES`), payments (`MOBILE_MONEY_PROVIDERS`, `PAYMENT_METHODS`), underwriting (all guardrails, `SCORE_WEIGHTS`, `GUARANTEE_MULTIPLIER_BY_GROUP_TYPE`, seasonality), tiers (`LOAN_TIERS`, `tier_for_score`), thresholds (`SCORE_APPROVE`, `SCORE_FLAG`, `DEFAULT_GRACE_WEEKS`).
2. Make `tanzania.py` satisfy it explicitly — a conformance test, not a comment.
3. **`get_pack()` raises `UnsupportedCountry` on an unknown code.** Failing open is the defect; failing closed is the fix.

**Acceptance:** `get_pack("UG")` raises; a pack missing any contract member fails a test rather than an import.

---

## 3. Phase 2 — Resolve Packs at Runtime

Replace every module-level `tz` reference with a pack resolved from the entity's country.

1. **`underwriting.evaluate(member, group, loan)` resolves `get_pack(group.country)`** and uses it throughout. This is the largest change — 15 references — and the most consequential.
2. **`config.py` stops being the source of country constants.** The eight settings that mirror the TZ pack become either per-country overrides keyed by code, or move out of `Settings` entirely. `MIN_WEEKLY_INCOME_TZS` is renamed.
3. `constitution.generate_constitution` takes the group's pack; `JOINING_FEE_TZS` → `pack.JOINING_FEE`.
4. `ledger` takes the pack for grace weeks and currency labelling.
5. `main.py`'s eligibility and tier endpoints resolve from the member's country, not the module import.
6. **`country_config.py` collapses into the pack layer.** It currently duplicates what packs hold, and re-exports TZ values while hardcoding KE ones — two sources of truth for the same facts.

**Test:**
```bash
pytest backend/tests/test_pack_resolution.py -v   # a KE group must not get TZ guardrails
pytest backend/tests/test_underwriting.py -v      # TZ results unchanged
```
**Acceptance:** every TZ underwriting outcome is identical to before; a group with a non-TZ country raises `UnsupportedCountry` rather than being scored as Tanzanian.

---

## 4. Phase 3 — The Second Pack (Kenya)

Kenya first, because it is the only other market with real research behind it and because it is the sharpest test of the contract — a different ID system, a different regulator, a different group vocabulary, and a genuinely different lending regime.

Needs: `kenya.py` with Huduma Namba / Maisha Namba format (**note: the second-generation ID is up to 8 digits and is *not* zero-padded — a fixed-width mask or `\d{8}` rejects legitimate older holders**; Maisha Namba is 14), KRA PIN format, KES tiers and guardrails, M-Pesa/Airtel providers, chama/SACCO/merry-go-round vocabulary, CBK-aligned rate caps (**24% APR ceiling under the DCP regime**), and Kenya's own formalization documents.

**Expect the contract to break here.** That is the point of the second implementation. Kenya has no direct equivalent of the VICOBA 4× rule, and its agricultural seasonality differs — those are contract questions the Tanzania-only design could not have surfaced.

**Type changes:** `CountryCode` widens in `backend/country_config.py:7` and `src/lib/country.ts:1`. Both are `Literal`/union types, so the compiler will find the call sites.

**Acceptance:** a Kenyan group is underwritten with Kenyan rules end to end; no TZ behaviour changes.

---

## 5. Phase 4 — Uganda and Rwanda

Only after Kenya proves the contract. Each is then genuinely additive: a new pack module, a registry entry, a `CountryCode` widening.

Identity formats differ in every market, which is why Sprint 15 must come first (§6):

| Market | ID | Note |
|---|---|---|
| Tanzania | NIDA NIN, 20 digits | No public checksum; card prints `8-5-5-2` |
| Kenya | Huduma Namba ≤8 digits, **unpadded**; Maisha Namba 14 | A fixed-width mask excludes real holders |
| Uganda | NIN, 14 alphanumeric, `CM`/`CF` prefix | Search results routinely conflate this with Tanzania's — a spec citing 14 characters with letters is Uganda's |
| Rwanda | NID, 16 digits | Not researched |

**Not researched at all:** Uganda's and Rwanda's data-protection regimes, mobile-money KYC tiers, credit-provider licensing, and group-savings vocabulary. Treat Phase 4 as unscoped until that research is done.

---

## 6. Why This Sprint Follows Sprint 15

**KYC is what tells you what a pack must contain.** Identity is irreducibly per-market — four countries, four ID formats, four registries, four verification regimes, four tier ladders. Building the abstraction against zero real implementations is speculative generality; the contract would be wrong in ways only a real second market reveals.

Sprint 15 delivers a reference implementation for Tanzania. Kenya then becomes the second implementation that *proves* the contract, and Uganda and Rwanda become the additive case the abstraction was built for.

**And the code is not the long pole.** Every market needs its own licence and data-protection registration, and that work is sequential and slow:

| Market | Known obligations |
|---|---|
| Tanzania | PDPC registration (**overdue — enforcement live since 9 Apr 2026**), DPO, cross-border permit (**unpublished timeline**), BoT/Microfinance Tier 2 position |
| Kenya | ODPC registration, **DPIA filed 60 days before processing**, CBK credit-provider licence (ODPC certificate is a precondition) |
| Uganda | Not researched |
| Rwanda | Not researched |

Shipping the code faster than the licences arrive gains nothing.

**The exception is Phase 0.** Currency denomination is not a multi-country feature — it is a correctness bug that is cheap now and a data-repair exercise later. Do it independently of everything above.

---

## 7. Definition of Done

- [ ] Every money row carries a currency; cross-currency arithmetic raises rather than returning a number
- [ ] `CountryPack` contract defined; `tanzania.py` conforms by test
- [ ] `get_pack()` raises on an unsupported code — no silent Tanzania fallback
- [ ] No module-level `tz` import outside the pack layer itself
- [ ] `underwriting.evaluate` resolves the pack from `group.country`
- [ ] `country_config.py` no longer duplicates pack data
- [ ] Every Tanzania underwriting outcome unchanged, proven by a before/after fixture
- [ ] Kenya underwrites end to end with Kenyan rules
- [ ] `tsc --noEmit` 0 errors; build passes; backend tests green

---

## 8. Open Questions

- **Does a group's currency ever differ from its country's?** Cross-border groups, diaspora contributions, USD-denominated savings. Assumed no; unverified.
- **Do loan tiers belong in the pack or in a rate card?** They are regulator-constrained (CBK caps APR at 24%) and change more often than identity formats. A pack change requires a deploy.
- **`Numeric(12, 2)` headroom.** Ten integer digits is comfortable for TZS today. Confirm before adding a lower-denomination currency.
- **Does `country` belong on `Transaction`?** It is derivable through `group`, but the ledger is the durable financial record and denormalising is defensible.
- **How do FX and cross-market reporting work at all?** Out of scope here, but the Blueprint's consolidated revenue projections assume it.

---

*Planning document. The regulatory items in §6 should be confirmed by counsel in each market.*
