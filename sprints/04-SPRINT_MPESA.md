# Sprint 4: M-Pesa Payment Integration

**Goal:** Real money movement through M-Pesa Daraja 3.0 APIs. Users can contribute to chamas, pay for Soko orders, receive loan disbursements, and pay insurance premiums via M-Pesa.  
**Duration:** 1.5 weeks  
**Dependencies:** Sprint 3 (Frontend-API Integration)  
**Business Value:** Revenue begins — transaction fees on every payment. This is the monetization layer.

---

## User Stories

### Story 4.1: M-Pesa STK Push (Customer Pays)

**As a** chama member, **I want** to contribute via M-Pesa STK Push, **so that** my payment is instant and recorded automatically.

**Acceptance Criteria:**
- [ ] User taps "Contribute" → enters amount → confirms
- [ ] Backend calls Daraja STK Push API with user's phone number
- [ ] User receives M-Pesa popup on phone → enters PIN
- [ ] M-Pesa sends callback to backend with payment confirmation
- [ ] Backend records transaction, updates chama ledger
- [ ] Frontend shows success notification with M-Pesa receipt number
- [ ] If payment fails (insufficient balance, wrong PIN), user sees clear error
- [ ] If callback times out, frontend polls for status every 10 seconds

### Story 4.2: M-Pesa C2B (Business Receives)

**As a** Soko seller, **I want** buyers to pay me via M-Pesa, **so that** I receive money directly.

**Acceptance Criteria:**
- [ ] Buyer taps "Pay via M-Pesa" on Soko checkout
- [ ] Backend initiates STK Push to buyer's phone
- [ ] Buyer pays → callback received → order marked as paid
- [ ] Seller receives notification: "New order paid — KES X,XXX"
- [ ] Seller balance updated in real-time
- [ ] Transaction recorded with M-Pesa receipt number

### Story 4.3: M-Pesa B2C (Business Pays Customer)

**As a** Biashara borrower, **I want** my approved loan disbursed to my M-Pesa, **so that** I receive funds instantly.

**Acceptance Criteria:**
- [ ] Loan approved → backend initiates B2C payment to borrower's phone
- [ ] Borrower receives M-Pesa notification: "You have received KES X,XXX"
- [ ] Backend records disbursement transaction
- [ ] Loan status updated to "disbursed"
- [ ] Borrower sees updated balance in dashboard

### Story 4.4: M-Pesa B2B (Business Pays Business)

**As a** merchant, **I want** to pay my suppliers in bulk via M-Pesa, **so that** I can manage business payments.

**Acceptance Criteria:**
- [ ] Merchant selects "Pay Suppliers" in Biashara dashboard
- [ ] Uploads/enters list of phone numbers + amounts
- [ ] Backend initiates B2B batch payments
- [ ] Each supplier receives M-Pesa notification
- [ ] Merchant sees batch payment summary (successful/failed)
- [ ] All transactions recorded with receipt numbers

### Story 4.5: Recurring Payments (Ratiba)

**As a** Kazi gig worker, **I want** my insurance premium auto-deducted weekly, **so that** I'm always covered.

**Acceptance Criteria:**
- [ ] User opts into AutoSave (5% of earnings) + insurance (KES 50/week)
- [ ] Backend schedules recurring payment via Daraja Ratiba API
- [ ] Every week, M-Pesa auto-deducts premium from user's phone
- [ ] User receives SMS: "KES 50 deducted for Linda insurance"
- [ ] Backend records payment, updates policy status
- [ ] User can pause/cancel recurring payments anytime

### Story 4.6: Transaction Reconciliation

**As the** platform, **I want** all M-Pesa transactions reconciled, **so that** financial records are accurate.

**Acceptance Criteria:**
- [ ] Every callback received is validated (HMAC-SHA256 signature check)
- [ ] Every transaction is recorded with: receipt number, amount, phone, timestamp
- [ ] Failed transactions are logged with reason code
- [ ] Hourly reconciliation job checks for missing callbacks
- [ ] Daily summary report: total volume, success rate, fees collected
- [ ] Blockchain anchor hash generated daily for audit trail

---

## Technical Implementation

### M-Pesa Daraja 3.0 API Mapping

| Operation | Daraja Endpoint | TWENDE Use Case |
|---|---|---|
| **STK Push** | `POST /mpesa/stkpush/v1/processrequest` | Chama contributions, Soko payments, insurance premiums |
| **C2B Validation** | Webhook `POST /webhook/c2b/validation` | Validate incoming payments before processing |
| **C2B Confirmation** | Webhook `POST /webhook/c2b/confirmation` | Confirm received payments, update ledger |
| **B2C Payment** | `POST /mpesa/b2c/v1/paymentrequest` | Loan disbursements, insurance claim payouts, Soko cashouts |
| **B2B Payment** | `POST /mpesa/b2b/v1/paymentrequest` | Merchant supplier payments |
| **Ratiba Schedule** | `POST /mpesa/ratiba/v1/schedule` | Recurring insurance premiums, AutoSave |
| **Transaction Status** | `POST /mpesa/transactionstatus/v1/query` | Poll for pending transaction status |
| **Account Balance** | `POST /mpesa/accountbalance/v1/query` | Monitor float balance |

### Payment Service Architecture

```
[Frontend: User taps "Contribute"]
         │
         ▼ POST /api/v1/chamas/:id/contributions
[Backend: Contribution Controller]
         │
         ▼ Validate (user auth, chama membership, amount)
         │
         ▼ Create transaction record (status: 'pending')
         │
         ▼ Call M-Pesa Service
         │
         ▼ POST /mpesa/stkpush/v1/processrequest
[M-Pesa: Sends STK Push to user's phone]
         │
         ▼ User enters PIN
         │
         ▼ M-Pesa processes payment
         │
         ▼ M-Pesa sends C2B callback to backend
[Backend: C2B Webhook Handler]
         │
         ▼ Validate callback signature (HMAC-SHA256)
         │
         ▼ Update transaction status → 'completed'
         │
         ▼ Update chama ledger
         │
         ▼ Publish Kafka event: transaction.completed
         │
         ▼ Trigger credit score recalculation (async)
         │
         ▼ Send push notification to user
[Frontend: Receives real-time update]
         │
         ▼ Shows "Payment successful!" with receipt number
         │
         ▼ Updates balance in real-time
```

### Backend Files to Create

| File | Purpose |
|---|---|
| `src/services/mpesaService.ts` | Daraja API wrapper: STK Push, B2C, B2B, Ratiba, status query |
| `src/controllers/paymentController.ts` | Handle payment initiation requests |
| `src/controllers/webhookController.ts` | Handle M-Pesa callbacks (C2B, B2C, STK) |
| `src/middleware/webhookAuth.ts` | Validate callback signatures (HMAC-SHA256 + IP whitelist) |
| `src/services/transactionService.ts` | Record transactions, update ledgers, reconcile |
| `src/jobs/reconciliation.ts` | Hourly job to check for missing callbacks |
| `src/jobs/dailyReport.ts` | Daily summary report generation |

### Frontend Files to Create/Modify

| File | Purpose |
|---|---|
| `src/components/PaymentModal.tsx` | Reusable payment modal (amount input, confirm, status) |
| `src/components/PaymentStatus.tsx` | Real-time payment status tracker (pending → processing → completed/failed) |
| `src/hooks/usePayment.ts` | React Query hooks for payment initiation and status polling |
| `src/hooks/useMpesa.ts` | M-Pesa specific hooks (STK Push, B2C, etc.) |
| `src/pages/Chama.tsx` | Modify: contribution flow triggers real payment |
| `src/pages/Soko.tsx` | Modify: checkout triggers real STK Push |
| `src/pages/Biashara.tsx` | Modify: loan approval triggers real B2C disbursement |
| `src/pages/Kazi.tsx` | Modify: AutoSave + insurance triggers real Ratiba |

### M-Pesa Service Implementation

```typescript
// src/services/mpesaService.ts (Backend)

import axios from 'axios';
import crypto from 'crypto';

const DARAJA_BASE_URL = 'https://sandbox.safaricom.co.ke';

export class MpesaService {
  private consumerKey: string;
  private consumerSecret: string;
  private shortcode: string;
  private passkey: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY!;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    this.shortcode = process.env.MPESA_SHORTCODE!;
    this.passkey = process.env.MPESA_PASSKEY!;
  }

  // Get OAuth access token
  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    const response = await axios.get(`${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    return this.accessToken;
  }

  // STK Push (Lipa Na M-Pesa Online)
  async initiateSTKPush(
    phoneNumber: string,
    amount: number,
    accountReference: string,
    transactionDesc: string
  ): Promise<string> {
    const token = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');

    const response = await axios.post(
      `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: this.shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: `${process.env.BACKEND_URL}/webhooks/mpesa/stk`,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.CheckoutRequestID; // Return checkout request ID for polling
  }

  // B2C Payment (Business to Customer)
  async initiateB2C(
    phoneNumber: string,
    amount: number,
    occasion: string
  ): Promise<string> {
    const token = await this.getAccessToken();

    const response = await axios.post(
      `${DARAJA_BASE_URL}/mpesa/b2c/v1/paymentrequest`,
      {
        InitiatorName: process.env.MPESA_INITIATOR_NAME,
        SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
        CommandID: 'BusinessPayment',
        Amount: amount,
        PartyA: this.shortcode,
        PartyB: phoneNumber,
        Remarks: occasion,
        QueueTimeOutURL: `${process.env.BACKEND_URL}/webhooks/mpesa/b2c/timeout`,
        ResultURL: `${process.env.BACKEND_URL}/webhooks/mpesa/b2c/result`,
        Occasion: occasion,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.ConversationID;
  }

  // Validate callback signature
  validateCallbackSignature(payload: any, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.passkey)
      .update(JSON.stringify(payload))
      .digest('hex');
    return signature === expectedSignature;
  }
}

export const mpesaService = new MpesaService();
```

### Webhook Handler

```typescript
// src/controllers/webhookController.ts (Backend)

import { Request, Response } from 'express';
import { mpesaService } from '../services/mpesaService';
import { transactionService } from '../services/transactionService';

export const webhookController = {
  // Handle STK Push callback
  async handleSTKCallback(req: Request, res: Response) {
    const { Body } = req.body;
    const callback = Body.stkCallback;

    // Validate signature
    const signature = req.headers['x-mpesa-signature'] as string;
    if (!mpesaService.validateCallbackSignature(req.body, signature)) {
      console.error('Invalid callback signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const checkoutRequestId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;

    if (resultCode === 0) {
      // Success
      const metadata = callback.CallbackMetadata.Item;
      const receiptNumber = metadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      const amount = metadata.find((item: any) => item.Name === 'Amount')?.Value;
      const phoneNumber = metadata.find((item: any) => item.Name === 'PhoneNumber')?.Value;

      await transactionService.completeTransaction(checkoutRequestId, {
        receiptNumber,
        amount,
        phoneNumber,
        status: 'completed',
      });
    } else {
      // Failed
      await transactionService.failTransaction(checkoutRequestId, {
        errorCode: resultCode,
        errorDescription: callback.ResultDesc,
      });
    }

    res.status(200).json({ success: true });
  },

  // Handle B2C result callback
  async handleB2CResult(req: Request, res: Response) {
    const { Result } = req.body;
    // Similar logic for B2C disbursements
    res.status(200).json({ success: true });
  },

  // Handle C2B validation (before payment is accepted)
  async handleC2BValidation(req: Request, res: Response) {
    const { BillRefNumber, MSISDN, TransAmount } = req.body;
    
    // Validate: check if reference number exists, if user is valid
    const isValid = await transactionService.validateC2BReference(BillRefNumber);
    
    if (isValid) {
      res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
    } else {
      res.status(200).json({ ResultCode: 1, ResultDesc: 'Rejected' });
    }
  },

  // Handle C2B confirmation (payment received)
  async handleC2BConfirmation(req: Request, res: Response) {
    const { TransID, TransAmount, MSISDN, BillRefNumber, TransTime } = req.body;
    
    await transactionService.recordC2BPayment({
      receiptNumber: TransID,
      amount: parseFloat(TransAmount),
      phoneNumber: MSISDN,
      reference: BillRefNumber,
      timestamp: TransTime,
    });

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  },
};
```

### Environment Variables

```
# M-Pesa Daraja (Sandbox for development)
MPESA_ENVIRONMENT=sandbox                    # sandbox | production
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_SHORTCODE=174379                       # Sandbox paybill
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_INITIATOR_NAME=testapi
MPESA_SECURITY_CREDENTIAL=your_security_credential

# Callback URLs (must be HTTPS and publicly accessible)
BACKEND_URL=https://your-backend-url.com

# For local development with ngrok:
# 1. Install ngrok: npm install -g ngrok
# 2. Run: ngrok http 3001
# 3. Set BACKEND_URL to the ngrok HTTPS URL
```

---

## Guardrails (Sprint 4 Specific)

| Guardrail | Why | How |
|---|---|---|
| **Never commit M-Pesa credentials** | Financial fraud risk | .env only, .env.example as template |
| **Always validate callback signatures** | Prevent spoofing | HMAC-SHA256 verification on every callback |
| **Never process a callback twice** | Double-charging | Idempotency key check per receipt number |
| **Always handle timeout callbacks** | M-Pesa may retry | Store checkout request ID, reconcile hourly |
| **Never store M-Pesa PINs** | Security breach | PIN entered by user on phone only |
| **Always log all financial transactions** | Regulatory compliance | Every payment logged with receipt, amount, timestamp |
| **Always use HTTPS for callbacks** | Man-in-the-middle prevention | ngrok for dev, SSL cert for production |
| **Never initiate payments without user confirmation** | Consumer protection | Double-confirm all payments |
| **Always show receipt numbers** | Dispute resolution | Display M-Pesa receipt on success screen |
| **Rate limit payment initiations** | Fraud prevention | Max 5 payments per user per minute |

---

## Sandbox vs Production

| Environment | Daraja URL | Shortcode | Purpose |
|---|---|---|---|
| **Sandbox** | `https://sandbox.safaricom.co.ke` | 174379 | Development, testing |
| **Production** | `https://api.safaricom.co.ke` | Your real shortcode | Live transactions |

**Getting Production Credentials:**
1. Register at https://developer.safaricom.co.ke
2. Create app, get consumer key/secret
3. Request shortcode from Safaricom
4. Generate security credential
5. Configure callback URLs (must be HTTPS)

---

## Testing Checklist

| # | Test | Method |
|---|---|---|
| 1 | Get Daraja access token | `mpesaService.getAccessToken()` |
| 2 | Initiate STK Push (sandbox) | Use +254708374149 (Safaricom test number) |
| 3 | Simulate callback (sandbox) | Use Daraja simulator or ngrok |
| 4 | Verify callback signature | `mpesaService.validateCallbackSignature()` |
| 5 | Record transaction in DB | Check PostgreSQL transactions table |
| 6 | Update chama ledger | Verify balance updated |
| 7 | Trigger credit score update | Verify score recalculation |
| 8 | Test B2C disbursement | Verify loan payout |
| 9 | Test C2B payment | Simulate buyer payment to seller |
| 10 | Test reconciliation job | Run hourly job, verify no missing transactions |

### Sandbox Test Numbers

Safaricom provides these test numbers for sandbox:
- **+254708374149** — Always succeeds
- **+254708374150** — Insufficient balance
- **+254708374151** — Wrong PIN
- **+254708374152** — Timeout

---

## Definition of Done

- [ ] M-Pesa service connects to Daraja sandbox
- [ ] STK Push works end-to-end (initiate → callback → record)
- [ ] B2C disbursement works (loan payout)
- [ ] C2B payment works (Soko buyer → seller)
- [ ] Callback signatures validated
- [ ] Transaction reconciliation job running
- [ ] All financial transactions logged
- [ ] Frontend shows real-time payment status
- [ ] Error handling for all failure cases
- [ ] No M-Pesa credentials in git
- [ ] `npm run build` passes on both frontend and backend

---

## Kimi Code Execution Prompt

```powershell
cd C:userse1c8se1c8s	wende-app
kimi "Integrate M-Pesa Daraja 3.0 payments. Read sprints/04-SPRINT_MPESA.md for full requirements.

This sprint has TWO parts: backend (twende-api) and frontend (twende-app).

## BACKEND (twende-api/)

Install packages:
cd twende-api && npm install axios crypto

Create these files:
1. src/services/mpesaService.ts — Daraja API wrapper: getAccessToken, initiateSTKPush, initiateB2C, validateCallbackSignature
2. src/controllers/paymentController.ts — Handle payment initiation from frontend
3. src/controllers/webhookController.ts — Handle M-Pesa callbacks (STK, B2C, C2B validation, C2B confirmation)
4. src/middleware/webhookAuth.ts — Validate callback signatures (HMAC-SHA256) + IP whitelist
5. src/services/transactionService.ts — Record transactions, update ledgers, handle idempotency
6. src/jobs/reconciliation.ts — Hourly job to check for missing callbacks
7. src/routes/payments.ts — Payment routes
8. src/routes/webhooks.ts — Webhook routes (no auth — public endpoints for M-Pesa)

Add routes to src/routes/index.ts:
- POST /api/v1/payments/stk-push — Initiate STK Push
- POST /api/v1/payments/b2c — Initiate B2C payment
- POST /webhooks/mpesa/stk — STK callback (public)
- POST /webhooks/mpesa/b2c/result — B2C result (public)
- POST /webhooks/mpesa/c2b/validation — C2B validation (public)
- POST /webhooks/mpesa/c2b/confirmation — C2B confirmation (public)

## FRONTEND (twende-app/)

Create these files:
1. src/components/PaymentModal.tsx — Reusable payment modal with amount input, confirm button, status tracker
2. src/components/PaymentStatus.tsx — Real-time status: pending → processing → completed/failed with receipt number
3. src/hooks/usePayment.ts — React Query: initiatePayment, pollPaymentStatus

Modify these files:
- src/pages/Chama.tsx: Replace contribution flow with real payment (call API, show PaymentModal)
- src/pages/Soko.tsx: Replace checkout with real STK Push
- src/pages/Biashara.tsx: Loan approval triggers real B2C disbursement
- src/pages/Kazi.tsx: AutoSave + insurance setup triggers Ratiba scheduling

## Requirements:
- Use sandbox environment (https://sandbox.safaricom.co.ke)
- Test number: +254708374149 (always succeeds)
- Callbacks: use ngrok for local dev (ngrok http 3001)
- All callbacks validate HMAC-SHA256 signature
- Idempotency: never process same receipt twice
- Frontend shows real-time status with polling (every 10 seconds)
- Display M-Pesa receipt number on success
- Handle errors: insufficient balance, wrong PIN, timeout
- Run npm run build on both frontend and backend
- Report what was integrated and how to test"
```

---

*Sprint 4: M-Pesa Payment Integration — v1.0*
