# TWENDE Demo Deck Creation Prompt
## Slide-by-Slide Screenshot + Voiceover Script

**Purpose:** Create a 12-slide demo presentation that funders can click through OR that you can narrate in a 3-minute video. Each slide pairs a screenshot with your spoken explanation.

**Output Format:** PowerPoint / Google Slides / Canva — or screen-record with voiceover

**Time Budget:** 45 minutes to create, 3 minutes to deliver

---

## SLIDE STRUCTURE: 12 Slides, 3 Acts

### ACT 1: THE PROBLEM (Slides 1-3) — 45 seconds

---

### SLIDE 1: Title Card
**Screenshot Needed:** None — design slide

**Visual:**
- TWENDE logo (top center)
- Headline: "Financial Infrastructure for Africa's Informal Economy"
- Subhead: "300 million people. Zero credit score. Infinite potential."
- Your name: Eddy Mkwambe, Founder & Chief Architect
- Contact: eddy@mpingo.ai | https://twende-app.vercel.app
- Bottom right: "Demo Account: +255712345678 / PIN 1234"

**Voiceover Script:**
> "My name is Eddy Mkwambe. I'm a Tanzanian-American mathematician and educator, and I built TWENDE to solve a problem I watched my own family face: 300 million Africans in the informal economy have no access to credit, not because they're unreliable, but because banks have no way to measure their reliability."

**Screenshot Instructions:**
- Open Canva / PowerPoint
- Create 1920x1080 slide
- Use TWENDE navy (#0A2463) background, white text
- Add logo from `public/twende-logo.png`

---

### SLIDE 2: The Problem — Invisible to Banks
**Screenshot Needed:** NO — use stock imagery or simple graphic

**Visual:**
- Split screen: Left = formal economy person with bank, credit card, loan approval. Right = market vendor with cash, no documents, bank says "NO."
- Stat callouts:
  - "300M unbanked in Africa"
  - "$693.9M African fintech funding in 2025"
  - "70% of Tanzanians rely on informal savings groups (VICOBA)"

**Voiceover Script:**
> "In Tanzania, 70% of adults save through chamas — rotating savings groups. They've been doing this for decades. They're disciplined. They're reliable. But to a bank, they're invisible. No credit history. No collateral. No score. So when they need a loan to buy inventory, expand their stall, or pay school fees, their only option is money lenders charging 30 to 50 percent interest."

**Screenshot Instructions:**
- Search Unsplash for "African market vendor" and "bank rejection"
- Or use simple icon graphics: 💰 vs 🚫

---

### SLIDE 3: The Insight
**Screenshot Needed:** None — text + graphic slide

**Visual:**
- Central insight in large text:
  > "The data exists. It's just not where banks look."
- Four data sources around it:
  - 📱 M-Pesa transaction history
  - 👥 Chama contribution records
  - 🛒 Marketplace sales data
  - 🛡️ Insurance payment history

**Voiceover Script:**
> "But here's the insight: these people are already generating rich financial data. Every M-Pesa transaction. Every chama contribution. Every sale on WhatsApp. Every insurance premium. The data exists — it's just not where banks look. TWENDE collects this alternative data, runs it through a Trust Engine, and produces a credit score that opens doors."

---

### ACT 2: THE PRODUCT (Slides 4-9) — 90 seconds

---

### SLIDE 4: Login — Meet Wanjiku
**Screenshot Needed:** YES — Login page

**Visual:** Full screenshot of TWENDE login page with `+255712345678` and PIN `1234` pre-filled, demo banner visible.

**Voiceover Script:**
> "Let me show you how this works. Meet Wanjiku — she's a real user profile in our pilot. She's a market vendor in Kariakoo, Dar es Salaam. She saves 40,000 shillings a month in her chama, sells vegetables on Soko, and has taken two micro-loans through TWENDE. Let me log in as her."

**Screenshot Instructions:**
1. Open `http://localhost:5173/login` (both servers running)
2. Ensure fields show: Phone `+255712345678`, PIN `1234`
3. Screenshot the full page
4. Crop to 16:9 if needed

---

### SLIDE 5: Dashboard — The Five Pillars
**Screenshot Needed:** YES — Overview dashboard

**Visual:** Full screenshot of the dashboard showing:
- Trust Score 696 (Gold)
- KYC Tier 3
- Four metric cards: Chama Balance, Available Credit, Insurance, Soko Revenue
- Credit Score History chart (580→720)
- Your Products sidebar (Chama Active, Biashara loan active, Linda 3 policies, Soko 127 orders)

**Voiceover Script:**
> "This is Wanjiku's dashboard. TWENDE has five pillars: Chama for savings groups, Biashara for business credit, Kazi for gig work, Linda for insurance, and Soko for commerce. Her Trust Score is 696 — Gold tier — calculated from seven factors: her chama consistency, M-Pesa flow, loan repayment, Soko sales, gig income, insurance history, and KYC verification. This score unlocks everything else."

**Screenshot Instructions:**
1. After login, you're on Overview
2. Screenshot full page (1920x1080 or close)
3. Highlight the Trust Score card (use PowerPoint arrow or circle)

---

### SLIDE 6: Trust Score Breakdown
**Screenshot Needed:** YES — Trust Score page

**Visual:** Screenshot of `/trust/score` showing:
- Score: 696 (Gold tier)
- The 7 factor breakdown (Chama 20%, M-Pesa 15%, etc.)
- What-If Simulator
- Score History chart

**Voiceover Script:**
> "Let me show you the Trust Score in detail. It's not a black box. Wanjiku can see exactly what's driving her score: her chama savings behavior contributes 20 percent, her M-Pesa transaction history 15 percent, her loan repayment record 25 percent. The What-If simulator lets her test: what if I improve my on-time contribution rate from 85 to 95 percent? Her score projects to 720. This is transparency that builds trust."

**Screenshot Instructions:**
1. Click **Trust Score** in left sidebar
2. Scroll to show factor breakdown
3. If What-If Simulator is visible, set a scenario and show projection
4. Full page screenshot

---

### SLIDE 7: The Money Shot — Loan Application + Underwriting
**Screenshot Needed:** YES — Two screenshots side by side

**Visual:**
- Left: Loan application form (Biashara → Apply)
- Right: Underwriting decision result (score, approved/flagged, max amount, reason)

**Voiceover Script:**
> "Now watch this. Wanjiku needs TZS 500,000 to buy bulk inventory before the rainy season. She opens Biashara, fills the loan application, and hits submit. In under one second, our underwriting engine evaluates five factors: her mobile money flow, debt service ratio, group guarantee, business formalization status, and agricultural seasonality. The result: approved at 76 out of 100. She can borrow up to TZS 1.2 million at 18 percent APR — compared to 30 to 50 percent from informal lenders."

**Screenshot Instructions:**
1. Click **Biashara** in sidebar
2. Click **Apply for Loan**
3. Fill: Amount `500000`, Purpose `Working capital for inventory`, Term `6 months`
4. Screenshot the form BEFORE submitting
5. Submit
6. Screenshot the underwriting decision (score, bands, approval status)
7. In PowerPoint, place both screenshots side by side with arrow showing flow

---

### SLIDE 8: Active Loans + Repayment
**Screenshot Needed:** YES — Active loans page

**Visual:** Screenshot showing:
- List of active loans with amounts, status, remaining balance
- Repayment button/action
- Or the repayment success confirmation

**Voiceover Script:**
> "Wanjiku already has an active loan — TZS 25,000 for working capital. She repays weekly through M-Pesa STK Push. Every repayment updates her Trust Score in real time. The passbook records every transaction. There's no hidden fee, no surprise. Everything is transparent."

**Screenshot Instructions:**
1. From Biashara, click **My Loans** or view Active Loans section
2. Screenshot the loan list
3. Click repay on one loan, enter amount, submit
4. Screenshot the success state

---

### SLIDE 9: Passbook — The Ledger
**Screenshot Needed:** YES — Passbook/Recent Activity

**Visual:** Screenshot of passbook showing:
- Transaction history: Chama contribution, Soko sale, Linda premium, Biashara repayment
- Running balance
- Timestamps

**Voiceover Script:**
> "Every transaction is recorded in Wanjiku's digital passbook. Chama contribution: 40,000 shillings. Soko sale: 24,000. Insurance premium: 1,000. Loan repayment: 75,000. This is her financial history — portable, auditable, and for the first time, bankable. She can export this passbook and show it to any formal lender as proof of discipline."

**Screenshot Instructions:**
1. Scroll down on Overview page to show Recent Activity
2. Or navigate to passbook view
3. Screenshot showing 5-6 transactions with TZS amounts

---

### ACT 3: THE BUSINESS (Slides 10-12) — 45 seconds

---

### SLIDE 10: Market Opportunity
**Screenshot Needed:** NO — infographic slide

**Visual:**
- TAM/SAM/SOM pyramid:
  - TAM: 300M unbanked Africans
  - SAM: 50M chama members in East Africa
  - SOM: 5M in Tanzania pilot
- Revenue model: Interest spread (18% lend - 8% cost = 10% margin)
- Unit economics: CAC $3-5 via chama viral loop, LTV $150+ per user

**Voiceover Script:**
> "The market is massive. 300 million unbanked Africans. 50 million chama members in East Africa alone. Our pilot targets 5 million in Tanzania. We make money on interest spread: we lend at 18 percent, our cost of capital is 8 percent, so our margin is 10 percent. But our real advantage is acquisition cost: when one chama leader onboard 20 members, our customer acquisition cost is 3 to 5 dollars — among the lowest in African fintech."

---

### SLIDE 11: Traction + Roadmap
**Screenshot Needed:** NO — timeline slide

**Visual:**
- Timeline:
  - ✅ Q2 2026: MVP built, 5 pillars, Trust Engine, underwriting live
  - 🔄 Q3 2026: Pilot with 3 chamas in Dar es Salaam
  - ⏳ Q4 2026: Scale to 50 chamas, apply for mobile money license
  - ⏳ Q1 2027: Regional expansion to Kenya, Uganda, Rwanda
- Current status badge: "Seeking $350K pre-seed for pilot execution"

**Voiceover Script:**
> "We're not at idea stage. The platform is built. The backend is live. The underwriting engine is running real decisions. Our next step is a 3-month pilot with 3 chamas in Dar es Salaam, then scale to 50 chamas by year-end. We're seeking 350,000 dollars in pre-seed funding to execute this pilot and apply for our mobile money license."

---

### SLIDE 12: Ask + Contact
**Screenshot Needed:** NO — closing slide

**Visual:**
- Headline: "Let's Build Financial Infrastructure for the Underserved"
- Subhead: "Demo: https://twende-app.vercel.app"
- Contact: eddy@mpingo.ai
- Documents available: Blueprint, Whitepaper, Financial Model
- QR code linking to deployed app

**Voiceover Script:**
> "TWENDE is not just an app. It's foundational digital trust infrastructure for Africa's informal economy. The data exists. The technology exists. The users exist. What we're building is the bridge. I'd love to show you more. The demo is live at twende-app.vercel.app. My email is eddy at mpingo dot ai. Thank you."

---

## SCREENSHOT CAPTURE CHECKLIST

Before creating slides, capture these screenshots in order:

| # | Slide | Page/State | Screenshot File |
|---|-------|-----------|----------------|
| 1 | Slide 4 | Login page with demo credentials | `screenshots/01-login.png` |
| 2 | Slide 5 | Overview dashboard (after login) | `screenshots/02-dashboard.png` |
| 3 | Slide 6 | Trust Score page (factor breakdown) | `screenshots/03-trust-score.png` |
| 4 | Slide 7a | Loan application form (BEFORE submit) | `screenshots/04a-loan-form.png` |
| 5 | Slide 7b | Underwriting decision (AFTER submit) | `screenshots/04b-underwriting.png` |
| 6 | Slide 8 | Active loans list | `screenshots/05-active-loans.png` |
| 7 | Slide 9 | Passbook / Recent Activity | `screenshots/06-passbook.png` |

---

## VOICEOVER RECORDING GUIDE

### Tools
- **Windows:** Xbox Game Bar (Win+G) or OBS Studio
- **Mac:** QuickTime Player (File > New Screen Recording)
- **Browser:** Loom (loom.com) — easiest, auto-uploads, shareable link

### Setup
1. Both servers running (backend :8000, frontend :5173)
2. Browser fullscreen at 1920x1080
3. Mic test: record 5 seconds, play back
4. Close all other tabs/notifications

### Recording Flow
1. **Record the slide deck** (PowerPoint/Canva with screenshots) while narrating
2. **OR** record screen directly on TWENDE app while narrating live
3. **OR** hybrid: record slides with embedded screenshots + voiceover

### Delivery Tips
- Speak slowly — funders may not know what "chama" or "VICOBA" means
- Pause after key numbers ("Trust Score: 696 [pause] Gold tier")
- Show enthusiasm at the underwriting moment — it's the climax
- End with confidence, not a question

---

## QUICK-START: Loom Recording (Fastest Path)

1. Go to [loom.com](https://loom.com), sign up (free)
2. Install Chrome extension
3. Open TWENDE at `http://localhost:5173`
4. Click Loom icon → "Screen + Camera" → "Full Screen"
5. Record this exact sequence:
   - [0:00] Start on login page: "This is TWENDE..."
   - [0:15] Login, show dashboard
   - [0:30] Click Trust Score, explain factors
   - [0:50] Click Biashara, apply for loan, show underwriting
   - [1:15] Show active loans, repayment
   - [1:35] Show passbook
   - [1:55] Switch to PowerPoint closing slide with contact info
6. Stop recording — Loom auto-uploads
7. Copy link → paste in email/pitch deck

**Target length:** 2.5 to 3 minutes

---

## ALTERNATE FORMAT: Self-Playing Deck (No Video)

If you prefer a click-through deck over video:

1. Create PowerPoint / Google Slides with all 12 slides
2. Embed screenshots on Slides 4-9
3. Add speaker notes (the voiceover scripts above)
4. Export as PDF for email attachment
5. **OR** present live on Zoom/Teams, clicking through while narrating

---

## FILES TO CREATE

| File | Content |
|------|---------|
| `demo/TWENDE_Demo_Deck.pptx` | PowerPoint with 12 slides |
| `demo/screenshots/*.png` | 7 screenshots from the app |
| `demo/TWENDE_Demo_Script.docx` | This script formatted for printing |
| `demo/TWENDE_Demo_Video.mp4` | Screen recording with voiceover |

---

## POST-CREATION CHECKLIST

After creating the deck/video:

- [ ] Screenshots show TZS (not KES)
- [ ] No personal data visible (your real NIDA, etc.)
- [ ] Demo credentials visible on Slide 1 or 4
- [ ] Underwriting decision clearly visible
- [ ] Contact info on final slide
- [ ] Video under 3 minutes
- [ ] Audio clear, no background noise
- [ ] Link tested (if using Loom)

---

**End of Prompt. Start recording.**
