# SOKO × TWENDE: Ecosystem Integration Map

**Date:** July 2026  
**Classification:** Strategic Product Architecture

---

## 1. The Core Insight

SOKO is not a competing product. It is **the missing commerce layer** that TWENDE's four products have been circling but never directly addressed. Every TWENDE product touches money — saving it, lending it, insuring it, earning it — but none touch **the moment money changes hands for goods and services**. SOKO fills that gap.

![TWENDE 5 Pillars](twende_5_pillars.png)

---

## 2. Where SOKO Sits: The Fifth Pillar

| Pillar | Swahili Meaning | What It Does | User |
|---|---|---|---|
| **Twende Chama** | *"Let's go, community"* | Community savings groups | Chama members |
| **Twende Biashara** | *"Business"* | MSME credit + merchant tools | Shop owners, vendors |
| **Twende Kazi** | *"Work"* | Gig worker financial services | Boda riders, delivery workers |
| **Twende Linda** | *"Protect"* | Microinsurance | All of the above |
| **SOKO** | *"Market"* | **Phone-number commerce layer** | **Sellers + buyers (all of the above)** |

SOKO becomes **"Twende Soko"** — or remains a standalone brand integrated at the data layer. Either way, it is the **fifth pillar** because every other pillar's user is also a buyer or seller in the informal economy.

---

## 3. The Six Integration Points

### 3.1 Chama → SOKO: Pooled Purchasing Power

**What SOKO's PRD describes:** *"A chama group linked on Kipochi can initiate a group order from any Soko seller — each member's YES triggers their individual STK push, seller receives one consolidated order notification"*

**How it works in TWENDE:**

A chama organizer browses SOKO and shares a listing to the chama's WhatsApp group (which already runs on Twende Chama). The Twende Chama bot intercepts this and posts an interactive group order: *"Nyota Chama: who wants Kitenge fabric at 15% bulk discount? Reply YES [quantity]"*. Each member who responds gets an individual STK Push for their share. The chama's shared ledger on Twende Chama records who ordered what. When all payments confirm, SOKO sends the seller one consolidated order: *"8 members from Nyota Chama ordered — total KES 9,600"*.

**Why this matters:** Chamas exist partly to **pool purchasing power for bulk discounts**. Currently this happens offline — one member collects cash, buys in bulk, distributes goods. Digitizing this through SOKO removes the cash-handling risk, creates a transaction record, and improves the chama's credit score (diversified transaction types).

| Metric | Without Integration | With SOKO Integration |
|---|---|---|
| Bulk order coordination | WhatsApp + cash (3+ days) | Bot + STK Push (minutes) |
| Trust in organizer | Personal relationship only | Blockchain-anchored ledger |
| Credit score impact | None | +15–30 points per group order |
| Discount negotiation | Individual, ad hoc | Automated tiered pricing |

---

### 3.2 SOKO → Biashara: Sales Revenue as Credit Data

**What SOKO enables:** Every sale processed through SOKO generates **verified sales revenue data** linked to the seller's M-Pesa number. This data feeds directly into Twende Biashara's alternative credit scoring engine.

**How it works:** Mary sells kitenge dresses on SOKO. Over 6 months, she processes KES 180,000 in sales through SOKO — all recorded, timestamped, and verifiable. When she applies for a Twende Biashara loan, her credit score automatically incorporates this sales history. Her loan approval amount increases from KES 5,000 (based on chama contributions only) to KES 25,000 (based on KES 30,000/month verified revenue). Her interest rate drops from 36% APR to 24% APR.

**The data flow:**

```
[SOKO Order Completed]
         │
         ▼
[Transaction recorded: seller_id, amount, timestamp, mpesa_receipt]
         │
         ▼
[Event published to Kafka: 'soko.order.completed']
         │
         ▼
[Twende Biashara Credit Scoring Engine consumes event]
         │
         ▼
[Updates seller's revenue profile: monthly_avg, growth_trend, seasonality]
         │
         ▼
[Recalculates credit score: revenue_weight = 35% of total score]
         │
         ▼
[Seller sees updated score + pre-qualified loan offer in Biashara app]
```

**Why this matters:** Currently, Twende Biashara relies on M-Pesa transaction data (which includes personal transfers, airtime purchases, mixed revenue) to estimate business revenue. SOKO provides **pure, verified sales data** — dramatically more accurate for credit underwriting. A seller with KES 50,000/month in M-Pesa receipts might only have KES 15,000 in actual business revenue. SOKO separates the signal from the noise.

---

### 3.3 Kazi → SOKO: Delivery Riders as a Service

**What SOKO needs:** Delivery. The PRD explicitly defers logistics to a future product called "Ruka" — but TWENDE already has Kazi, which serves boda-boda riders and delivery workers.

**How it works:** A buyer on SOKO selects "Delivery" at checkout. SOKO pings Twende Kazi's rider marketplace. Available riders (verified Kazi gig workers with insurance and track records) receive a delivery request. The nearest rider accepts, and their verified identity (name, photo, ID number, plate — already in Kazi's system) is shared with both buyer and seller. Payment for the delivery fee is split: half goes to the rider via Kazi's instant payout, half is a platform fee.

**The rider experience:** James, a SafeBoda driver registered on Twende Kazi, gets a push notification: *"Delivery request: Gikomba → Kilimani, KES 250. Accept?"* He taps accept, picks up the package from Mary's stall, delivers it to the buyer, and receives KES 225 instantly in his M-Pesa — with KES 25 held as savings in his Kazi AutoSave pot.

**Why this matters:** SOKO avoids building logistics from scratch. Kazi riders gain a new revenue stream (deliveries between 10am–4pm when ride demand is low). Buyers get verified, insured delivery. The integration is lightweight — Kazi exposes a "delivery request" API; SOKO calls it at checkout.

---

### 3.4 Linda → SOKO: Seller Protection Insurance

**What SOKO creates:** A population of micro-sellers with **daily transaction volume, inventory value, and customer interactions** — all risk factors that Linda can underwrite.

**How it works:** Mary on SOKO can opt into "Twende Linda Seller Shield" for KES 50/week. Coverage includes: **(a)** inventory loss (fire, theft at pickup location — up to KES 50,000), **(b)** customer dispute protection (if a buyer claims item was never received and M-Pesa chargeback is initiated), **(c)** income protection (if Mary cannot sell for 7+ days due to illness/injury, daily payout of KES 500). Premiums are auto-deducted weekly via Daraja Ratiba. Claims are adjudicated via SOKO's order history (Linda checks: was the item marked delivered? Was the buyer's READY message received?). Payouts are instant via M-Pesa B2C.

**The underwriting advantage:** Linda's risk models traditionally struggle with informal sellers — no business registration, no tax records, no fixed address. SOKO provides **6+ months of verified transaction history** before Linda even offers a policy. Mary's 200 completed orders with zero disputes = lower premium than a seller with 10 orders and 2 disputes.

---

### 3.5 SOKO → Chama: Transaction Volume Improves Group Credit

**Reverse flow:** When chama members use SOKO for individual purchases (not just group orders), those transactions still improve the chama's collective credit profile.

**How it works:** Wanjiku is a member of Nyota Chama. She buys a KES 1,200 dress from Mary on SOKO, paying via M-Pesa STK Push. This transaction is recorded in Wanjiku's Twende profile. Even though it's a personal purchase (not a chama activity), it demonstrates **financial activity, payment discipline, and purchasing power** — all signals that improve her individual credit score, which in turn affects the chama's collective risk profile. When the chama later applies for a group loan through Biashara, members with active SOKO purchasing histories contribute positively to the approval decision.

---

### 3.6 SOKO → Linda: Verified Order Count as Trust Signal

**What SOKO generates:** The only public trust signal SOKO displays is a **verified order count** — *"127 completed orders via Kipochi"*. This same data feeds Linda's underwriting models.

**How it works:** A seller with 500+ verified SOKO orders and a 99% on-time delivery rate qualifies for Linda's "Gold Seller" insurance tier — lower premiums, higher coverage limits, faster claims processing. A seller with 10 orders and 2 cancelled transactions pays higher premiums and has a 48-hour claims review period. The verified order count is **impossible to fake** because it derives directly from M-Pesa payment confirmations.

**Why this matters:** In East African informal commerce, trust is everything. Buyers already check a seller's M-Pesa transaction history before sending money. SOKO formalizes this into a visible metric, and Linda monetizes it into an insurance product. Both derive value from the same underlying data.

---

## 4. The Unified User Journey

### Before SOKO Integration

```
Mary (seller)                     Wanjiku (buyer)
    │                                   │
    │── Posts on WhatsApp Status ──────▶│
    │                                   │── DMs Mary
    │◀── Negotiates price ─────────────│
    │── Shares M-Pesa number ─────────▶│
    │                                   │── Sends KES 1,200 manually
    │◀── Checks M-Pesa, confirms ──────│
    │── Arranges pickup ─────────────▶│
    │                                   │
    │── No record. No trust signal. No credit score impact.
```

### After SOKO + TWENDE Integration

```
Mary (seller) on SOKO              Wanjiku (buyer) in Twende Chama
    │                                   │
    │── Listing live at soko.twende.io/mary ──▶│── Discovers via WhatsApp
    │                                   │── Taps "Buy on WhatsApp"
    │◀── SOKO bot handles order ─────────│── Enters quantity: 1
    │                                   │── Enters M-Pesa number
    │◀── STK Push fires ────────────────│── Enters PIN
    │                                   │
    │── Payment confirmed ─────────────▶│── Receives receipt + pickup details
    │                                   │── Credit score: +2 points
    │── Mary: KES 1,200 credited to SOKO balance
    │── Mary's verified orders: 128 (+1)
    │── Linda: auto-offers Seller Shield at KES 45/week
    │── Biashara: pre-qualifies Mary for KES 25,000 loan
```

---

## 5. Technical Integration Architecture

### 5.1 Shared Data Layer

SOKO does not need its own user database when integrated with TWENDE. It reads from and writes to the **same PostgreSQL schema** that Chama, Biashara, Kazi, and Linda already use.

| Data Entity | Owner | SOKO Access | Other Products Access |
|---|---|---|---|
| `users` (identity, KYC, phone) | User Service | Read | All products |
| `chamas` (group config, rules) | Chama Service | Read (for group orders) | Chama, Biashara |
| `chama_members` (membership, balances) | Chama Service | Read/Write (group order tracking) | Chama, Biashara |
| `credit_scores` (scoring model output) | Credit Engine | Write (sales revenue factor) | Biashara, Kazi, Linda |
| `soko_sellers` (NEW — seller profiles) | SOKO Service | Full CRUD | Read (Biashara for credit) |
| `soko_listings` (NEW — product listings) | SOKO Service | Full CRUD | Read (Chama for group orders) |
| `soko_orders` (NEW — order records) | SOKO Service | Full CRUD | Read (Linda for insurance, Biashara for credit) |
| `transactions` (M-Pesa payment log) | Transaction Service | Write (C2B contributions as "order payments") | All products |

### 5.2 Event-Driven Integration

All cross-product communication happens via **Kafka events**, not direct API calls:

| Event Topic | Producer | Consumers | Trigger |
|---|---|---|---|
| `soko.order.created` | SOKO | Chama (group order tracking), Notification | Buyer places order |
| `soko.order.paid` | SOKO | Biashara (credit scoring), Linda (insurance underwriting), Chama (transaction count) | Payment confirms |
| `soko.order.delivered` | SOKO | Kazi (rider payout), Linda (claims closure) | Buyer confirms pickup |
| `soko.seller.activated` | SOKO | Biashara (onboard to merchant tools), Linda (offer insurance) | Seller completes onboarding |
| `chama.group_order.initiated` | Chama | SOKO (create consolidated order) | Chama organizer shares listing |
| `biashara.loan.disbursed` | Biashara | SOKO (flag seller as "funded" on store page) | Seller receives inventory loan |
| `kazi.delivery.completed` | Kazi | SOKO (mark order delivered), Linda (rider accident check) | Rider confirms delivery |
| `linda.claim.paid` | Linda | SOKO (update seller trust badge) | Insurance claim settled |

### 5.3 API Surface

SOKO exposes a minimal API surface to other TWENDE products:

| Endpoint | Method | Caller | Purpose |
|---|---|---|---|
| `/soko/v1/sellers/{phone}` | GET | Chama, Biashara, Linda | Get seller public profile + trust metrics |
| `/soko/v1/sellers/{id}/revenue` | GET | Biashara | Get verified sales revenue (time-range) |
| `/soko/v1/orders` | POST | Chama (group order bot) | Create order on behalf of chama member |
| `/soko/v1/orders/{id}/status` | GET | Linda, Kazi | Check order status for insurance/rider dispatch |
| `/soko/v1/listings/search` | GET | Chama | Search listings for group order selection |
| `/soko/v1/delivery/request` | POST | SOKO (internal) | Ping Kazi for rider availability |

---

## 6. Business Model Integration

### 6.1 Revenue Streams

| Revenue Source | Amount | Shared With |
|---|---|---|
| **SOKO transaction fee** (1.2% per sale) | KES 14 per KES 1,200 order | Seller keeps 98.8% |
| **Chama group order discount** (bulk pricing) | 10–15% off retail | Split between buyer savings and chama fund |
| **Delivery fee** (KES 150–400) | KES 250 average | Kazi rider (90%), TWENDE platform (10%) |
| **Seller Shield insurance** (KES 45–200/week) | KES 100/week average | Linda underwriter (70%), TWENDE (30%) |
| **Premium seller features** (KES 500/month) | Featured listings, analytics | SOKO only |

### 6.2 Cross-Product Economics

A single SOKO transaction of KES 1,200 generates revenue across **4 TWENDE products simultaneously**:

| Product | Revenue from this transaction | Mechanism |
|---|---|---|
| **SOKO** | KES 14 (1.2% fee) | Transaction fee |
| **Chama** | KES 0 (direct) but +credit score value | Group order tracked on ledger |
| **Biashara** | Future loan interest (KES 25–50/month) | Sales data improves creditworthiness |
| **Kazi** | KES 25 (10% of KES 250 delivery) | Rider marketplace fee |
| **Linda** | KES 10/week (seller insurance prorated) | Risk data from order history |
| **TOTAL** | **KES 49–89 per transaction + ongoing** | — |

Without SOKO, this same buyer-seller interaction happens entirely offline in cash — **zero revenue for TWENDE, zero data for credit scoring, zero insurance opportunity**.

---

## 7. Phased Integration Roadmap

### Phase A: Data Layer (Month 1–2)
- Deploy `soko_sellers`, `soko_listings`, `soko_orders` tables in shared PostgreSQL schema
- Wire SOKO events into Kafka event bus
- Enable Biashara credit scoring engine to consume `soko.order.paid` events
- **Milestone:** First seller's SOKO sales data appears in their Biashara credit score

### Phase B: Chama Group Orders (Month 3–4)
- Build chama group order bot flow (WhatsApp + Mini App)
- Enable chama organizer to share SOKO listings to group
- Implement consolidated order notification to sellers
- **Milestone:** First chama group order completed end-to-end

### Phase C: Kazi Delivery (Month 5–6)
- Integrate Kazi rider marketplace into SOKO checkout
- Build delivery fee calculation and split-payment logic
- Enable rider identity verification at handoff
- **Milestone:** 100 deliveries completed via Kazi riders

### Phase D: Linda Seller Shield (Month 7–8)
- Launch seller protection insurance product
- Integrate verified order count into Linda underwriting model
- Build auto-claims adjudication using SOKO order history
- **Milestone:** 500 sellers enrolled in Seller Shield

---

## 8. Why This Integration Wins

| Dimension | Standalone SOKO | SOKO + TWENDE Integrated |
|---|---|---|
| **Seller trust signal** | Verified order count only | Order count + chama membership + credit score + insurance badge |
| **Buyer confidence** | "127 orders" | "127 orders · Member of Nyota Chama · Insured seller · Credit-backed" |
| **Credit access for sellers** | None | Sales revenue directly unlocks Biashara loans |
| **Delivery option** | Build "Ruka" from scratch | Use existing Kazi rider network (10,000+ riders) |
| **Insurance for sellers** | None | Linda Seller Shield underwritten by SOKO transaction data |
| **Group buying power** | None | Chama collective orders with automated split payments |
| **Customer acquisition** | Reverse onboarding (buyers recruit sellers) | + Chama network effects (+ viral within groups) |
| **Revenue per transaction** | 1.2% fee only | 1.2% + delivery + insurance + loan origination (future) |

The integration does not just add a fifth product. It **makes every existing product more valuable** by giving them a commerce context they previously lacked. Chamas save *and* buy together. Merchants borrow *and* sell. Riders deliver *and* earn. Insurers underwrite *and* protect. All on the same M-Pesa rails, the same identity layer, the same trust engine.

That is the TWENDE ecosystem.
