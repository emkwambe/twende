## **Required Correction to Sprint 13**

The current segmentation proposal needs one fundamental architectural correction:

> **A Chama is defined by the common lawful purpose agreed by its members, not by who the members are.**

### **1\. Remove Member Segment as a Chama-Defining Attribute**

Remove `primary_segment` as a defining field from the core `chamas` model.

A Chama must not be classified as a teacher Chama, farmer Chama, salaried-worker Chama, trader Chama, gig-worker Chama, or similar category simply because of who participates in it.

A single Chama may legitimately contain:

* teachers  
* farmers  
* traders  
* civil servants  
* salaried private-sector workers  
* entrepreneurs  
* gig workers  
* people with multiple income sources

Occupation or economic activity belongs primarily to the **member/profile layer**, not the Chama identity.

Member attributes may still be useful for:

* recommendations  
* analytics  
* onboarding defaults  
* financial-product eligibility  
* contribution-method recommendations  
* future personalization

They must not constrain Chama creation, membership, or purpose.

---

## **2\. Chama Identity Is Separate from Purpose**

The group chooses its own identity.

For example:

**Name:** Tujikomboe Group

"Tujikomboe Group" is neither a segment nor a financial model. It is the group's chosen identity.

The group then declares its common lawful purpose.

For example:

**Name:** Tujikomboe Group  
**Purpose:** Purchase farmland  
**Members:** Mixed occupations  
**Capabilities:** Savings \+ member loans  
**Rules:** KES 5,000 monthly contribution \+ 2/3 approval for major expenditures

Another group could be:

**Name:** Tujikomboe Group  
**Purpose:** Accumulate capital to establish a transport business  
**Members:** Mixed occupations  
**Capabilities:** Savings \+ investment fund  
**Rules:** Weekly contributions \+ unanimous approval for capital deployment

The platform should therefore ask:

**"What does your group want to accomplish together?"**

It should not require:

**"What type of people are in your Chama?"**

as the basis for determining what kind of Chama they can create.

---

## **3\. Revised Core Domain Model**

The architecture should move toward:

`Chama Identity`  
→ `Common Purpose`  
→ `Financial Capabilities`  
→ `Rules`  
→ `Contribution / Loan Schedules`  
→ `Governance`  
→ `Members`  
→ `Member Collection Methods`  
→ `Country / Localization`

The critical separation is:

**WHO the members are ≠ WHY the Chama exists ≠ HOW money is collected.**

These are independent dimensions.

---

## **4\. Purpose-First Templates**

Rework the proposed templates so they are primarily based on **purpose and financial mechanics**, not profession.

Instead of:

* Salaried Workers \+ Investment Club  
* Salaried Workers \+ Education/Development  
* Farmers \+ Agriculture Project  
* Farmers \+ Asset Acquisition  
* Traders \+ Business Capital  
* Gig Workers \+ Welfare/Emergency

Prefer purpose-oriented templates such as:

* Investment Club  
* Education / Development Fund  
* Agriculture Project  
* Asset Acquisition  
* Business Capital  
* Emergency / Welfare  
* Land Acquisition  
* Housing / Construction  
* Rotating Savings

These templates may recommend different rules and configurations, but they must not restrict who can participate.

For example, an **Agriculture Project Chama** could consist of farmers, teachers, traders, professionals, or any combination of members who have agreed to invest together in an agricultural project.

---

## **5\. Contribution Collection Is a Separate Dimension**

There is another important distinction that must not be confused with member segmentation:

**How a member is able to contribute money.**

Some members may have income sources that support automatic collection while others may not.

The same Chama must therefore support different collection mechanisms for different members.

Example:

**Tujikomboe Group**

Purpose → Buy land  
Contribution rule → KES 5,000/month

Member A — Teacher  
→ Payroll deduction

Member B — Bank employee  
→ Bank standing order / auto-debit

Member C — Trader  
→ Mobile money or manual payment

Member D — Farmer  
→ Manual or potentially seasonal contribution arrangement

All four remain members of the **same Chama pursuing the same purpose**.

---

## **6\. Model Collection Capability at the Member Level**

Add `contribution_method` / `collection_method` as a dimension independent of Chama purpose and occupation.

Supported mechanisms may include:

* `payroll_deduction`  
* `bank_auto_debit`  
* `bank_standing_order`  
* `mobile_money`  
* `manual`  
* other supported mechanisms as integrations become available

Do not assume that every member of a Chama uses the same collection method.

A member's collection method may also change over time.

Therefore, avoid modeling:

`Chama → salaried → payroll deduction`

Instead model:

`Chama`  
→ `Member`  
→ `Collection Method`

The Chama establishes the **obligation**:

> KES 5,000 per member per month.

The member's collection configuration determines **how that obligation is fulfilled**.

---

## **7\. Keep Contribution Schedule Separate from Collection Method**

Do not confuse **when/how much someone owes** with **how the money is collected**.

These should be separate concepts.

For example:

`Contribution Rule`

* amount: KES 5,000  
* frequency: monthly  
* due date: 28th

`Member Collection Method`

* payroll deduction

Another member can have exactly the same contribution obligation but:

`Member Collection Method`

* mobile money/manual

This separation becomes particularly important for irregular or seasonal earners.

---

## **8\. Occupation Can Still Be Valuable**

This correction does **not** mean removing occupation/economic information from Twende.

Attributes such as:

`teacher`  
`farmer`  
`trader`  
`civil_servant`  
`business_owner`  
`gig_worker`

may remain useful member metadata.

They can later support:

* recommendations  
* analytics  
* relevant financial services  
* payroll integration eligibility  
* seasonal-income configuration  
* credit assessment where legally appropriate  
* product personalization

But they must remain subordinate to the member and must not define the Chama.

---

## **9\. Revised Architectural Principle**

Sprint 13 should adopt this principle explicitly:

> **A Chama is a member-defined group organized around a common lawful purpose and governed by agreed financial and governance rules. Member profession, employment status, economic activity, income pattern, and contribution collection capability are attributes of individual members and must not define or restrict the Chama itself.**

Therefore, the core abstraction should be:

**Identity \+ Common Purpose \+ Financial Capabilities \+ Agreed Rules \+ Governance**

with members independently carrying:

**Profile \+ Economic Characteristics \+ Income Pattern \+ Collection Capability**

This should replace the current **segment-first** architecture before Sprint 13 implementation begins.

The Chama cannot be modeled only as a flexible group-purpose system. **Twende’s strategic objective is to turn real financial behavior into credible credit signals.** The Chama architecture therefore needs two layers:

**Layer 1 — Group freedom**  
 `Chama identity → lawful purpose → rules → contributions → governance`

**Layer 2 — Credit evidence**  
 `member behavior → contribution consistency → repayment behavior → savings discipline → participation history → verified cash-flow signals → credit profile`

So I would slightly revise our previous principle:

> **A Chama is defined by the common lawful purpose agreed by its members, but Twende separately captures standardized member-level financial behavior generated through the Chama so that participation can contribute to creditworthiness.**

This solves the tension.

For example, **Tujikomboe Group** can exist to buy land. Twende does not care whether its members are teachers, traders, or farmers for purposes of defining the group. But Twende *does* care that:

`Member A`  
 → agreed contribution: KES 5,000/month  
 → paid 12/12 contributions on time  
 → savings accumulated: KES 60,000  
 → borrowed KES 20,000  
 → repaid 100% on schedule  
 → participated for 18 months

That is valuable credit evidence irrespective of occupation.

The salary-auto-deduction nuance becomes even more important here. **Payment method should not itself equal creditworthiness.** A teacher whose KES 5,000 is automatically deducted every month has a structurally easier path to perfect contribution history than a trader who manually pays from variable income.

Therefore Twende should record both:

`obligation performance`  
 and  
 `collection context`

For example:

`contribution_due`  
 `amount_paid`  
 `days_late`  
 `collection_method`  
 `automatic_or_manual`  
 `income_pattern`  
 `missed_contributions`  
 `loan_repayment_history`

Then the future credit model can distinguish **behavior** from **mechanism** rather than naively giving salaried workers better scores because their payments are automated.

This also tells us what Sprint 13 should **not** do: remove economic/member attributes entirely. They should be removed from **Chama classification**, but retained where they are legitimate explanatory variables or contextual signals for the Trust Engine.

So the corrected architecture is:

**Chama**  
 → identity  
 → common lawful purpose  
 → financial rules  
 → governance

**Membership**  
 → member  
 → obligation  
 → contribution method  
 → income/cash-flow context  
 → participation history

**Credit Evidence**  
 → contribution consistency  
 → savings behavior  
 → loan repayment  
 → defaults/arrears  
 → longevity  
 → verified transactions  
 → other validated Trust Engine signals

**Trust Engine**  
 → transforms standardized evidence into creditworthiness signals.

That keeps us aligned with the original product. Twende is **not primarily building better Chama software**. The Chama is one of the mechanisms through which Twende can capture financial behavior that conventional credit systems often cannot see.

I would make that explicit in the Sprint 13 correction before implementation.

**KYC is the missing bridge between Chama activity and usable credit evidence.**

Without verified identity, Twende may know that *someone* made 24 contributions and repaid three loans, but it cannot confidently attach that history to the same real person. For a credit system, that is fundamental.

The architecture should therefore be:

**Identity / KYC**  
 → establishes **who the person is**

**Chama**  
 → establishes **what members agreed to do together**

**Membership \+ Transactions**  
 → establishes **what that verified person actually did**

**Credit Evidence**  
 → converts behavior into standardized signals

**Trust Engine**  
 → evaluates those signals for creditworthiness.

For example:

`Verified Member`  
 → KYC identity  
 → member of Tujikomboe Group  
 → obligation: KES 5,000/month  
 → collection: manual M-Pesa  
 → 23/24 contributions on time  
 → 2 Chama loans  
 → 2/2 repaid  
 → 31 months membership  
 → savings balance/history  
 → **Trust Engine credit signals**

One architectural warning: **KYC should verify identity, not become a credit score.** Having stronger identity documentation shouldn't automatically mean someone is more creditworthy. Twende should distinguish:

`Identity confidence ≠ Financial behavior ≠ Creditworthiness`

KYC establishes that the behavioral evidence belongs to a reliably identified person. The Trust Engine then evaluates the financial evidence.

So I would amend the Sprint 13 model to:

**KYC / Identity → Member → Chama Membership → Financial Obligations → Verified Transactions → Behavioral Evidence → Trust Engine → Credit Profile**

That is much closer to the architecture required if **credit infrastructure remains Twende's actual destination and Chamas are one important source of alternative credit evidence.**

