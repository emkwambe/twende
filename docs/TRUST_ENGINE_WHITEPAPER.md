# The TWENDE Trust Engine: A Multi-Factor Alternative Credit Scoring System for East Africa's Informal Economy

**Technical White Paper**

**Eddy Mkwambe¹², Mpingo Systems LLC**

¹ *MS Strategic Analytics, Brandeis University, Waltham, MA, USA*  
² *MS Mathematical Modeling, University of Dar es Salaam, Tanzania*

**Version 1.0 | July 2026**

---

## Abstract

Traditional credit scoring systems systematically exclude approximately **1.4 billion adults** globally who lack formal credit histories, formal employment records, or collateral — a population disproportionately concentrated in the Global South [^163^]. In East Africa, where **80% of the workforce** operates in the informal economy and mobile money penetration exceeds **90%** in several markets, the disconnect between digital payment access and formal credit availability represents one of the most significant barriers to inclusive economic growth.

This paper presents the **TWENDE Trust Engine**, a multi-factor alternative credit scoring system specifically designed for populations excluded from traditional credit bureaus. The Trust Engine synthesizes behavioral data across seven distinct dimensions — chama (ROSCA) savings discipline, mobile money transaction patterns, marketplace sales performance, loan repayment history, gig work completion rates, insurance premium consistency, and Know-Your-Customer verification depth — into a composite credit score ranging from 300 to 850. The scoring architecture employs **gradient boosting decision trees** (XGBoost) for the underlying risk classification model, coupled with **SHAP (SHapley Additive exPlanations)** for post-hoc interpretability, ensuring that every credit decision is both statistically robust and transparently explainable to end users.

The Trust Engine addresses three critical design requirements that prior alternative credit scoring systems have failed to satisfy simultaneously: **(1)** predictive accuracy competitive with traditional FICO-style models on populations with sufficient traditional data; **(2)** full explainability of individual score components to satisfy regulatory "right to explanation" mandates and build user trust; and **(3)** explicit fairness constraints that prevent demographic discrimination against protected classes. Our architecture maps to existing regulatory frameworks including Kenya's Data Protection Act 2019 and the Central Bank of Kenya's Digital Credit Provider licensing requirements, positioning the Trust Engine as a compliant, production-ready solution for the East African fintech ecosystem.

**Keywords:** alternative credit scoring, financial inclusion, gradient boosting, XGBoost, explainable AI, SHAP, behavioral credit scoring, informal economy, East Africa, ROSCA, mobile money

---

## 1. Introduction

### 1.1 The Financial Exclusion Crisis

The World Bank's Global Findex Database estimates that **1.4 billion adults** remain unbanked globally, with the highest concentrations in Sub-Saharan Africa and South Asia [^163^]. Even among those who are "financially included" — defined broadly as having access to a transaction account — a substantial gap exists between **payment access** and **credit access**. In Kenya, for example, **96% of adults** have a mobile money account, yet only **42.64%** have any formal banking relationship, and an even smaller fraction can access credit on commercially reasonable terms [^41^]. The proportion of the population that is truly "credit-scorable" under traditional frameworks — those with sufficient credit bureau data, formal employment records, and collateral — remains in the single digits across most of East Africa.

This exclusion is not merely a social inequity; it imposes substantial economic costs. The International Finance Corporation estimates a **$5.2 trillion annual financing gap** for micro, small, and medium enterprises (MSMEs) in developing countries, with women-owned businesses facing a disproportionately larger gap relative to their share of the MSME population [^134^]. In Tanzania specifically, where **65 million people** rely predominantly on informal economic activity, the absence of credit infrastructure constrains business formation, limits household resilience to shocks, and perpetuates cycles of poverty that no amount of mobile money transaction volume alone can address.

### 1.2 The Mobile Money Paradox

The proliferation of mobile money services — most notably M-Pesa in Kenya, which processes over **$314 billion annually** across **51 million active users** — has created a paradoxical situation. On one hand, mobile money has achieved near-universal financial **transaction** access, providing a digital footprint that was previously impossible to capture for informal economy participants. On the other hand, the credit layer that would transform transaction access into economic opportunity remains largely undeveloped. Existing mobile money-based credit products (e.g., Safaricom's M-Shwari, Commercial Bank of Africa's KCB M-Pesa) rely on simplistic eligibility criteria — primarily transaction volume and tenure — that fail to capture the multidimensional nature of credit risk for informal borrowers.

The mobile money paradox creates both a problem and an opportunity. The problem is that **transaction data alone is insufficient** for robust credit assessment; volume and frequency metrics capture only a narrow slice of a borrower's financial behavior and tell us little about savings discipline, business acumen, social capital, or repayment willingness. The opportunity is that mobile money platforms generate a rich, longitudinal behavioral dataset that, if properly structured and analyzed, can serve as the foundation for a genuinely alternative credit scoring system — one that does not merely proxy for traditional credit bureau data but instead creates an entirely new assessment paradigm grounded in the actual economic behaviors of informal workers.

### 1.3 Research Gap and Contribution

The academic and practitioner literature on alternative credit scoring has grown substantially in recent years, with studies demonstrating that machine learning models trained on non-traditional data sources can achieve predictive accuracy comparable to or exceeding traditional scorecards [^161^][^164^]. However, three critical gaps remain unaddressed in the context of East African informal economies:

**First**, existing alternative scoring models typically rely on single-source data — mobile money transactions, telecom usage patterns, or social media activity — without integrating the **multidimensional behavioral signals** that characterize informal economic life. A market vendor in Dar es Salaam, for example, generates credit-relevant signals across chama (ROSCA) participation, marketplace sales, mobile money cash flow, gig work completion, and insurance payments. No existing system synthesizes these disparate signals into a unified credit assessment.

**Second**, the explainability of alternative credit scores remains a significant barrier to adoption in regulated financial environments. Black-box machine learning models — even highly accurate ones — face resistance from regulators who require transparent decision-making and from users who deserve to understand why their credit application was approved or denied [^168^][^177^]. The "right to explanation" embodied in Kenya's Data Protection Act 2019 and similar legislation across East Africa demands that credit scoring systems provide individual-level, human-understandable explanations for every decision.

**Third**, fairness and bias mitigation in alternative credit scoring for developing economies has received insufficient attention. Models trained on behavioral data can inadvertently encode demographic biases — penalizing women who participate in informal savings groups rather than formal banking, for example, or discriminating against rural populations whose mobile money usage patterns differ from urban norms [^163^][^165^]. Without explicit fairness constraints and regular bias audits, alternative credit scoring risks replicating the very exclusions it purports to solve.

The TWENDE Trust Engine addresses all three gaps through a novel architecture that: **(a)** integrates seven distinct behavioral data sources into a unified scoring framework; **(b)** employs XGBoost gradient boosting with SHAP-based explainability to ensure every score is transparently decomposable; and **(c)** implements explicit fairness constraints and demographic bias monitoring as core system requirements rather than afterthoughts.

---

## 2. Literature Review

### 2.1 Traditional Credit Scoring: Limitations for the Informal Economy

The dominant paradigm in consumer credit scoring — exemplified by the FICO Score in the United States and equivalent bureau-based models in developed economies — relies on a relatively narrow set of inputs: credit repayment history, outstanding debt levels, length of credit history, types of credit used, and recent credit inquiries [^171^]. These models, while statistically robust for populations with extensive formal credit histories, fail catastrophically when applied to the **"credit invisible"** — those who have never held a formal loan, credit card, or mortgage [^173^].

In East Africa, the limitations of traditional scoring are structural rather than incidental. The region's credit reference bureaus (CRBs) — established under regulatory mandates in Kenya (2008), Tanzania (2012), Uganda (2008), and Rwanda (2010) — primarily capture data from formal financial institutions: commercial banks, microfinance institutions, and licensed digital credit providers. Informal savings groups (chamas), rotating savings and credit associations (ROSCAs), marketplace transactions, and gig work income streams remain entirely outside the CRB data ecosystem. As a result, a market vendor in Nairobi who has saved diligently in her chama for five years, maintained perfect repayment on informal loans from her savings group, and generated consistent sales revenue has a **credit bureau score of zero** — identical to someone who has never engaged in any financial activity.

The economic literature on ROSCAs provides substantial evidence that these informal institutions generate **credit-relevant behavioral signals** that traditional scoring ignores. Besley, Coate, and Loury's seminal work established the microeconomic foundations of ROSCAs, demonstrating that they function as implicit credit markets where savings discipline and group participation serve as screening mechanisms for creditworthiness [^169^]. More recent scoping reviews have confirmed that ROSCA participation correlates with improved financial asset accumulation, better money management practices, and enhanced social capital — all factors predictive of loan repayment behavior [^172^]. The TWENDE Trust Engine directly incorporates these insights by weighting chama savings behavior at **20% of the total score**.

### 2.2 Machine Learning in Credit Scoring: From Logistic Regression to Gradient Boosting

The application of machine learning to credit scoring has evolved through several generations of methodology. Early approaches relied on **logistic regression** and **linear discriminant analysis**, which offered interpretability but limited predictive power for complex, non-linear relationships in credit data [^161^]. The second generation introduced **neural networks** and **support vector machines**, which improved accuracy but sacrificed transparency — a critical limitation in regulated lending environments.

The third generation — **ensemble methods** and **gradient boosting** — has emerged as the dominant paradigm in both academic research and industrial practice. Chen and Guestrin's XGBoost algorithm, introduced in 2016, represents a particularly significant advancement: it combines the predictive power of gradient boosting with regularization techniques (L1/L2 penalty terms, shrinkage, subsampling) that prevent overfitting, making it well-suited for credit scoring datasets that are typically high-dimensional and moderately sized [^162^][^165^].

The benchmarking literature consistently demonstrates XGBoost's superiority for credit scoring applications. Dastile et al.'s comprehensive review of 74 studies (2010–2018) found that ensemble methods including Random Forest and XGBoost outperformed single classifiers, achieving **79% accuracy** on average [^161^]. More recent studies have pushed these benchmarks higher: Khan et al. (2025) reported an **AUC of 0.943** for XGBoost on a Pakistani microfinance dataset combining traditional and alternative data, with the addition of alternative predictors improving accuracy by **nearly 18%** over traditional-variable-only models [^164^]. Xia et al. (2021) developed a dynamic credit scoring model using survival gradient boosting decision trees, demonstrating superior performance on time-varying default prediction [^161^].

The PMC study (2024) on alternative data for credit scoring provides particularly relevant evidence: using the Home Credit Default Risk competition dataset (N=307,511), models incorporating alternative predictors (social network default status, regional economic ratings, local population characteristics) achieved an **AUC of 0.7936** with LightGBM and **0.7892** with XGBoost, significantly outperforming models using only traditional bureau data (AUC 0.7450) [^166^]. The DeLong test confirmed the statistical significance of these improvements (p < 2.2e-16), providing strong empirical support for the predictive power of non-traditional data sources.

### 2.3 Explainable AI in Financial Services

The tension between predictive accuracy and model interpretability — the so-called "accuracy-interpretability trade-off" — has been a persistent challenge in machine learning for credit scoring [^168^]. While complex ensemble models consistently outperform simpler linear models in predictive tasks, their "black box" nature creates barriers to regulatory compliance, user trust, and ethical oversight.

Two post-hoc explanation techniques have emerged as the dominant solutions: **SHAP (SHapley Additive exPlanations)** and **LIME (Local Interpretable Model-agnostic Explanations)**. SHAP, developed by Lundberg and Lee (2017), is grounded in cooperative game theory: it assigns each feature an importance value (the Shapley value) representing its marginal contribution to the model's prediction, averaged across all possible feature combinations [^177^]. For tree-based models, Lundberg et al. (2020) developed TreeSHAP, which computes exact Shapley values in polynomial time rather than the exponential time required by the general algorithm — making SHAP explanation generation feasible for production credit scoring systems [^165^].

The academic literature strongly supports the integration of SHAP-based explainability into credit scoring workflows. Connors (2025) demonstrated that SHAP explanations for gradient boosting models in emerging markets provide "granular, human-understandable explanations for individual credit decisions" while maintaining the superior predictive accuracy of complex ensemble models [^168^]. Japinye and Adedugbe (2025), writing from the Central Bank of Nigeria, developed an "explainability-first framework" integrating XGBoost with SHAP and LIME, achieving **AUC 0.892–0.923** across three public lending datasets while maintaining explanation stability (Kendall τ = 0.94 ± 0.03) and good calibration (Brier score 0.119–0.154) [^177^]. Their work explicitly addresses the regulatory imperative: "the integration of Explainable AI (XAI) can unlock the potential of alternative data in emerging economies, fostering financial inclusion without compromising risk management standards" [^168^].

### 2.4 Behavioral Credit Scoring and Alternative Data

The concept of **behavioral credit scoring** — assessing creditworthiness through observable behaviors rather than traditional financial records — has gained substantial traction as mobile penetration and digital payment adoption have expanded the available data universe. Chackravarti's comprehensive review (2025) identifies three categories of behavioral signals with demonstrated predictive value for credit risk: **smartphone metadata** (app usage patterns, device interaction frequency), **behavioral biometrics** (typing cadence, swipe patterns), and **psychometric indicators** (survey-based assessments of personality traits like conscientiousness and risk aversion) [^163^].

For East African informal economies, the most relevant behavioral signals fall into a fourth category: **economic activity patterns** captured through mobile money transactions, marketplace sales, savings group participation, and gig work completion. Kumar et al.'s (2021) review of ML technologies for digital credit scoring in rural finance emphasizes that "hybrid and AI-ML-based models yielded higher accuracy and efficiency by integrating multiple techniques" and that these models are "especially impactful in rural contexts, enabling more inclusive credit access through the processing of diverse data sources" [^161^].

The behavioral approach aligns with a broader theoretical shift in development economics: the recognition that informal economic actors are not "unbankable" but rather **"differently bankable"** — their creditworthiness is signaled through behaviors that formal financial systems are not designed to capture. The TWENDE Trust Engine operationalizes this insight by treating chama contribution consistency, Soko marketplace sales volume, Kazi gig completion rates, and Linda insurance premium payments as first-class credit signals, weighted at **20%, 20%, 10%, and 5%** respectively.

---

## 3. The TWENDE Trust Engine Architecture

### 3.1 Design Principles

The Trust Engine was designed according to five core principles derived from the literature review, regulatory requirements, and operational constraints of East African fintech:

**P1 — Multidimensional Signal Integration.** The system must synthesize credit-relevant signals from all major dimensions of an informal economy participant's financial life, not merely mobile money transactions. This principle is grounded in the economic literature on ROSCAs and informal finance, which demonstrates that savings discipline, group participation, and social capital are independently predictive of creditworthiness.

**P2 — Explainability by Default.** Every credit score must be decomposable into human-understandable component scores, with each component traceable to specific user behaviors. This principle responds to regulatory requirements (Kenya Data Protection Act 2019, Tanzania Personal Data Protection Act 2022) and the operational need for user trust: a borrower who understands why their score is what it is can take concrete actions to improve it.

**P3 — Fairness as a System Requirement.** The scoring system must include explicit mechanisms to prevent demographic discrimination and must be subject to regular bias audits. This principle addresses the documented risk that alternative data models can replicate or amplify existing inequalities [^163^][^165^].

**P4 — Computational Efficiency.** Score calculation must complete in under 5 seconds per user, and loan eligibility queries must return in under 500 milliseconds. These latency constraints are dictated by the user experience requirements of mobile-first financial services in markets with variable network connectivity.

**P5 — Configurability and Auditability.** Scoring weights, tier boundaries, and fairness constraints must be stored in configuration tables (not hardcoded) to enable A/B testing, regulatory adjustment, and reproducibility. All score changes must be logged in an append-only audit trail.

### 3.2 System Overview

The Trust Engine operates as a modular pipeline with four stages:

```
Stage 1: Data Ingestion
├─ Chama contribution events (Kafka topic: chama.contribution.created)
├─ M-Pesa transaction summaries (hourly batch, aggregated metrics)
├─ Soko order completion events (Kafka topic: soko.order.fulfilled)
├─ Biashara loan repayment events (Kafka topic: biashara.loan.repayment.received)
├─ Kazi gig completion events (Kafka topic: kazi.gig.completed)
├─ Linda premium payment events (Kafka topic: linda.premium.paid)
└─ KYC tier upgrade events (Kafka topic: user.kyc.upgraded)

Stage 2: Feature Engineering
├─ 25 engineered features from raw behavioral data
├─ Normalization and outlier handling
├─ Recency weighting (more recent behavior weighted higher)
└─ Missing value imputation (population median for new users)

Stage 3: Score Calculation
├─ XGBoost binary classifier (default probability)
├─ Probability-to-score mapping (logistic transform to 300-850)
├─ 7-factor sub-score decomposition
└─ SHAP value generation for explainability

Stage 4: Output and Caching
├─ Composite score (300-850)
├─ Risk tier (1-4)
├─ 7-factor breakdown with SHAP explanations
├─ Loan eligibility pre-computation
└─ Audit event logging
```

### 3.3 The 7-Factor Model

The Trust Engine's scoring framework decomposes creditworthiness into seven behavioral dimensions, each derived from a distinct data source within the TWENDE platform ecosystem. The factor weights were determined through a combination of domain expertise, regulatory constraints, and empirical analysis of proxy datasets.

| Factor | Symbol | Weight | Data Source | Theoretical Basis |
|--------|--------|--------|-------------|-------------------|
| Loan Repayment History | L | **25%** | Biashara loan records | Standard credit scoring: past repayment is the strongest predictor of future repayment [^161^] |
| Chama Savings Behavior | C | **20%** | Chama contribution records | ROSCA economics: savings discipline signals creditworthiness [^169^][^172^] |
| Soko Sales Performance | S | **20%** | Soko marketplace transactions | Business performance as credit signal: revenue stability, growth trajectory |
| M-Pesa Transaction History | M | **15%** | M-Pesa Daraja API summaries | Mobile money literature: transaction patterns predict default risk [^164^] |
| Gig Work Income | G | **10%** | Kazi gig completion records | Labor economics: income stability and skill diversification signal reliability |
| Insurance Payment Discipline | I | **5%** | Linda premium payment records | Behavioral insurance literature: premium consistency signals risk aversion |
| KYC Verification Depth | K | **5%** | User identity verification records | Regulatory compliance: verified identity reduces fraud risk |

The weight assignments reflect several considerations. **Loan repayment history receives the highest weight (25%)** because empirical evidence across credit scoring literature consistently identifies past repayment behavior as the single strongest predictor of future default [^161^][^164^]. This aligns with both the FICO model's emphasis on payment history (35% of the FICO Score) and the findings of alternative data studies that repayment behavior — even on informal loans — carries more predictive signal than any other single factor.

**Chama savings behavior and Soko sales performance each receive 20%**, reflecting the unique structure of East African informal economies. Chama (ROSCA) participation is not merely a savings activity; it is a socially enforced commitment mechanism where default on contributions carries social costs (exclusion from the group, loss of reputation) that parallel the financial costs of loan default. Besley, Coate, and Loury's theoretical framework demonstrates that ROSCAs function as **implicit credit markets with endogenous screening**, where the order of fund rotation and contribution consistency reveal private information about members' creditworthiness [^169^]. The scoping review by the World Development Sustainability team (2024) confirms that ROSCA participation correlates with improved financial asset accumulation and money management practices across 96 studies [^172^].

**M-Pesa transaction history receives 15%** — substantial but not dominant. This weighting reflects the mobile money paradox discussed in Section 1.2: while transaction data is valuable, volume and frequency alone are insufficient for robust credit assessment. The 15% weight captures the signal in cash flow patterns (income regularity, balance stability, airtime purchase consistency) without over-weighting transaction volume, which would disadvantage users with lower but stable transaction patterns.

**Gig work income (10%)**, **insurance discipline (5%)**, and **KYC depth (5%)** complete the framework. The relatively lower weights for these factors reflect their more limited data availability for new users and their secondary predictive value relative to the core behavioral signals. However, their inclusion serves an important function: they create **behavioral nudges** that incentivize users to diversify their platform engagement. A user who participates across multiple TWENDE pillars generates a richer behavioral profile, which both improves their credit score and reduces the system's reliance on any single data source.

---

## 4. Mathematical Formulation

### 4.1 Composite Score Function

The TWENDE Trust Score is a composite function that maps seven factor sub-scores to a unified 300-850 scale. Let the factor sub-scores be denoted as:

$$\mathbf{f} = (f_C, f_M, f_S, f_L, f_G, f_I, f_K) \in [0, 100]^7$$

where each $f_i \in [0, 100]$ represents the normalized sub-score for factor $i$.

The **raw composite score** is computed as a weighted sum:

$$R(\mathbf{f}) = 0.20 \cdot f_C + 0.15 \cdot f_M + 0.20 \cdot f_S + 0.25 \cdot f_L + 0.10 \cdot f_G + 0.05 \cdot f_I + 0.05 \cdot f_K$$

This weighted sum produces a value $R(\mathbf{f}) \in [0, 100]$. The **final Trust Score** is mapped to the 300-850 range via an affine transformation:

$$\text{TrustScore}(\mathbf{f}) = 300 + \frac{R(\mathbf{f})}{100} \times 550 = 300 + 5.5 \cdot R(\mathbf{f})$$

The mapping ensures that a user with minimum scores across all factors (all zeros) receives a score of **300**, while a user with perfect scores across all factors (all 100s) receives **850**. The linear mapping preserves the relative distances between scores, ensuring that a 10-point improvement in the raw composite score translates to a **55-point improvement** in the final Trust Score.

### 4.2 Risk Tier Classification

The Trust Score is discretized into four risk tiers that determine loan eligibility, interest rates, and credit limits:

| Tier | Score Range | Risk Level | Max Loan (KES) | Interest Rate (APR) | Loan Tenure |
|------|------------|------------|---------------|---------------------|-------------|
| **Tier 1** | 300–499 | High | 5,000 | 24% | 1–4 weeks |
| **Tier 2** | 500–649 | Medium | 50,000 | 18% | 1–6 months |
| **Tier 3** | 650–749 | Low | 200,000 | 14% | 1–12 months |
| **Tier 4** | 750–850 | Very Low | 500,000 | 10% | 1–24 months |

The tier boundaries were selected based on empirical analysis of score distributions and regulatory constraints. The **Central Bank of Kenya's Digital Credit Provider regulations** cap interest rates at **24% APR**, which bounds the Tier 1 rate. The progression from 24% to 10% across tiers reflects the risk-based pricing principle: borrowers with stronger behavioral signals receive lower rates, creating an incentive structure that rewards financial discipline.

### 4.3 Individual Factor Score Functions

Each of the seven factor scores is computed through a domain-specific function that transforms raw behavioral data into a normalized 0-100 score. The functions are designed to be **monotonic** (higher values of the underlying metric produce higher scores), **bounded** (outputs constrained to [0, 100]), and **robust to outliers** (extreme values are Winsorized rather than producing extreme scores).

#### 4.3.1 Chama Savings Score ($f_C$)

$$f_C = w_1 \cdot \text{contrib\_consistency} + w_2 \cdot \text{contrib\_rel\_median} + w_3 \cdot \text{group\_tenure} + w_4 \cdot \text{leadership} + w_5 \cdot \text{group\_size}$$

Where:
- **Contribution consistency** ($w_1 = 0.45$): Percentage of on-time contributions over the past 12 months, *independent of amount*. A user who contributes on time every period scores 100; missed contributions are penalized proportionally.
- **Contribution relative to chama median** ($w_2 = 0.15$): The member's own average contribution divided by the **median contribution of their own chama**, capped at 100. Members at or above their group's median score 100. No absolute currency amount enters this term.
- **Group tenure** ($w_3 = 0.20$): Months of continuous membership, with diminishing returns after 24 months ($\min(100, \frac{\text{tenure}}{24} \times 100)$).
- **Leadership** ($w_4 = 0.15$): 100 for serving as a chama officer (treasurer, chairperson, secretary), 0 otherwise. Officers are elected by their peers, so the role is a peer-validated trust signal.
- **Group size** ($w_5 = 0.05$): $\min(100, \frac{\text{member\_count}}{20} \times 100)$. Larger chamas require stronger social coordination.

The 45% weight on contribution consistency reflects the ROSCA economics literature, which identifies **on-time contribution behavior** as the strongest signal of creditworthiness within informal savings groups [^169^][^170^]. The leadership term captures the additional responsibility and social capital that officer roles entail.

**On the deliberate exclusion of absolute contribution amount.** Earlier drafts of this specification weighted *savings volume* at 30%. That formulation was withdrawn because it makes the factor a wealth proxy. The ROSCA literature establishes that contribution size is determined by **income level and self-control needs, not by creditworthiness**: Alemu (2004) finds that wealthier households dominate Indonesian *arisan* membership, and Handa and Kirton (1999) document two distinct Jamaican ROSCA types stratified purely by member income, with no accompanying difference in repayment reliability. Weighting absolute amount would therefore encode income — which correlates with gender, geography, and education — into a score from which those attributes are explicitly excluded (§7.2), reproducing precisely the indirect-discrimination mechanism documented by Women's World Banking (2021) and the Springer algorithmic-discrimination survey (2023).

Normalizing to the group's own median preserves the genuine signal in relative financial commitment while making the term **invariant to the chama's contribution level**. Two members who are equally reliable and each contribute at their own group's median receive identical $f_C$ scores whether that median is TZS 50,000 or TZS 500,000. The full derivation, the cross-demographic fairness simulation, and the portfolio-performance argument for this calibration are given in the companion analysis, *Chama Contribution Size and Credit Scoring Calibration* (Mkwambe, 2026).

#### 4.3.2 M-Pesa Transaction Score ($f_M$)

$$f_M = w_1 \cdot \text{txn\_frequency} + w_2 \cdot \text{volume\_stability} + w_3 \cdot \text{balance\_consistency} + w_4 \cdot \text{digital\_engagement}$$

Where:
- **Transaction frequency** ($w_1 = 0.35$): Weekly transaction count relative to peer group median. Captures economic activity level.
- **Volume stability** ($w_2 = 0.30$): Inverse coefficient of variation of monthly transaction volume. Stable volumes score higher than erratic ones.
- **Balance consistency** ($w_3 = 0.20$): Measures whether the user maintains a non-zero M-Pesa balance (indicates financial cushion).
- **Digital engagement** ($w_4 = 0.15$): Diversity of M-Pesa use cases (airtime, bill pay, merchant payments, not just P2P transfers).

The M-Pesa score function is designed to capture **financial health** rather than merely **transaction volume**. A user who makes 50 small, consistent transactions per month and maintains a stable balance scores higher than a user who makes 5 large, irregular transactions — even though the latter has higher total volume. This design choice addresses the mobile money paradox by valuing stability over volume.

#### 4.3.3 Soko Sales Score ($f_S$)

$$f_S = w_1 \cdot \text{gmv\_normalized} + w_2 \cdot \text{customer\_rating} + w_3 \cdot \text{fulfillment\_rate} + w_4 \cdot \text{inventory\_turnover}$$

Where:
- **GMV (Gross Merchandise Value)** ($w_1 = 0.40$): Monthly sales volume relative to category peers, normalized.
- **Customer rating** ($w_2 = 0.25$): Average customer review score (1-5 stars), mapped to [0, 100].
- **Fulfillment rate** ($w_3 = 0.20$): Percentage of orders successfully delivered. Rates above 95% receive bonus; below 80% penalized.
- **Inventory turnover** ($w_4 = 0.15$): Days to sell inventory — faster turnover signals business acumen.

The Soko score directly connects marketplace performance to creditworthiness: a merchant with strong sales, high customer ratings, and reliable fulfillment has demonstrated business viability that should translate to loan repayment capacity.

#### 4.3.4 Loan Repayment Score ($f_L$)

$$f_L = w_1 \cdot \text{repayment\_rate} + w_2 \cdot \text{credit\_utilization\_inverse} + w_3 \cdot \text{tenure\_bonus} - w_4 \cdot \text{default\_penalty}$$

Where:
- **Repayment rate** ($w_1 = 0.50$): Percentage of installments paid on time. The strongest single predictor.
- **Credit utilization** ($w_2 = 0.20$): Inverse of credit utilization ratio (lower utilization = higher score).
- **Tenure bonus** ($w_3 = 0.15$): Reward for maintaining loans over longer periods without default.
- **Default penalty** ($w_4 = 0.15$): Heavy penalty for any historical default (-50 points minimum).

The 50% weight on repayment rate aligns with the FICO model's emphasis on payment history (35% of FICO Score) and the empirical finding that past repayment behavior is the strongest predictor of future default across all credit scoring methodologies [^161^][^164^]. The default penalty is designed to be severe but not permanent: a single default reduces the score significantly, but consistent repayment behavior afterward can gradually recover it.

#### 4.3.5 Gig Work Score ($f_G$)

$$f_G = w_1 \cdot \text{completion\_rate} + w_2 \cdot \text{employer\_rating} + w_3 \cdot \text{income\_stability} + w_4 \cdot \text{skill\_diversity}$$

Where:
- **Completion rate** ($w_1 = 0.40$): Percentage of booked gigs completed successfully.
- **Employer rating** ($w_2 = 0.25$): Average rating from employers (1-5 stars).
- **Income stability** ($w_3 = 0.20$): Coefficient of variation of monthly gig income — lower variation = higher score.
- **Skill diversity** ($w_4 = 0.15$): Number of unique gig categories worked (plumbing, electrical, cleaning, etc.).

#### 4.3.6 Insurance Payment Score ($f_I$)

$$f_I = w_1 \cdot \text{premium\_consistency} + w_2 \cdot \text{policy\_tenure} + w_3 \cdot \text{no\_claim\_bonus}$$

Where:
- **Premium consistency** ($w_1 = 0.50$): Percentage of premiums paid on time.
- **Policy tenure** ($w_2 = 0.30$): Months of continuous coverage.
- **No-claim bonus** ($w_3 = 0.20$): Bonus for 12+ months without claims (indicates risk-averse behavior).

#### 4.3.7 KYC Verification Score ($f_K$)

$$f_K = \begin{cases} 30 & \text{Tier 1 (phone number only)} \\ 60 & \text{Tier 2 (phone + national ID + selfie)} \\ 100 & \text{Tier 3 (phone + ID + selfie + proof of address + income verification)} \end{cases}$$

The KYC score is discrete rather than continuous, reflecting the tiered verification structure required by East African regulators. Tier 3 verification (full KYC) is necessary for loan amounts exceeding KES 50,000 under CBK guidelines.

---

## 5. XGBoost Model Architecture

### 5.1 Why XGBoost

The TWENDE Trust Engine employs **XGBoost (eXtreme Gradient Boosting)** as the core risk classification algorithm for several reasons grounded in the credit scoring literature:

**Predictive Performance.** XGBoost consistently achieves state-of-the-art performance on structured tabular data — the dominant data type in credit scoring. Chen and Guestrin's (2016) original paper demonstrated that XGBoost outperformed all other methods on multiple benchmark datasets, and subsequent benchmarking studies have confirmed this superiority for credit scoring specifically [^161^][^165^]. The PMC study (2024) reported XGBoost AUC of **0.7892** on the Home Credit dataset with alternative features, compared to 0.7450 without alternative data [^166^].

**Handling of Missing Values.** Credit scoring datasets inevitably contain missing values — new users have no loan repayment history, users who don't participate in chamas have no savings data, etc. XGBoost's built-in handling of missing values (learning optimal default directions during training) eliminates the need for explicit imputation, which can introduce bias.

**Regularization.** XGBoost's L1 (Lasso) and L2 (Ridge) regularization terms prevent overfitting — a critical concern in credit scoring, where models must generalize to populations that may differ from the training data. The regularization also performs implicit feature selection, reducing the model's reliance on spurious correlations.

**Efficiency.** XGBoost's parallel tree construction and cache-aware algorithms enable score calculation in under 5 seconds per user, satisfying the P4 latency constraint.

**TreeSHAP Compatibility.** XGBoost's tree structure enables exact SHAP value computation via TreeSHAP in polynomial time, making post-hoc explainability computationally feasible for production systems.

### 5.2 Model Specification

The XGBoost classifier is trained to predict the probability of loan default given the 25 engineered features. The model architecture is specified as follows:

```
Objective: binary:logistic (probability of default)
Evaluation metric: AUC-ROC

Hyperparameters (tuned via Bayesian optimization):
- max_depth: 6 (tree depth — balances complexity and interpretability)
- learning_rate (eta): 0.05 (shrinkage — prevents overfitting)
- n_estimators: 500 (number of boosting rounds)
- min_child_weight: 3 (minimum sum of instance weight in leaf)
- subsample: 0.8 (row sampling ratio)
- colsample_bytree: 0.8 (column sampling ratio)
- reg_alpha: 0.1 (L1 regularization)
- reg_lambda: 1.0 (L2 regularization)
- scale_pos_weight: 5.0 (class weight for imbalanced data)
```

The **max_depth of 6** represents a deliberate trade-off: deeper trees (e.g., 10+) improve predictive accuracy but reduce interpretability, while shallower trees (e.g., 3-4) are more interpretable but may miss important feature interactions. A depth of 6 provides sufficient capacity to capture non-linear relationships (e.g., the interaction between chama contribution consistency and M-Pesa transaction stability) while keeping the model sufficiently simple for SHAP-based explanation.

The **scale_pos_weight of 5.0** addresses class imbalance: in typical microfinance portfolios, default rates range from 5-15%, meaning the positive class (default) is underrepresented. The class weight ensures the model pays appropriate attention to default cases during training.

### 5.3 Feature Engineering Pipeline

The 25 engineered features are derived from the seven raw data sources through a structured transformation pipeline:

| Feature Group | Features | Source |
|---------------|----------|--------|
| Chama behavior | 5 | Contribution frequency, amount consistency, group tenure, officer status, group size |
| M-Pesa activity | 5 | Transaction frequency, volume CV, balance stability, digital diversity, airtime ratio |
| Soko performance | 4 | Monthly GMV, customer rating, fulfillment rate, inventory turnover |
| Loan history | 4 | Repayment rate, credit utilization, active loan count, days since last default |
| Gig work | 3 | Completion rate, employer rating, income CV |
| Insurance | 2 | Premium consistency, policy tenure |
| KYC | 2 | Verification tier, days since last KYC update |

All numerical features are **Winsorized** at the 1st and 99th percentiles to handle outliers, then **standardized** (z-score normalization) to ensure all features contribute on comparable scales during model training.

### 5.4 Probability-to-Score Mapping

The XGBoost model outputs a default probability $p \in [0, 1]$. This probability is transformed to the Trust Score range via a **logistic mapping** that concentrates scores in the middle range (where most users fall) while preserving the full 300-850 dynamic range:

$$\text{TrustScore} = 300 + 550 \times \frac{1}{1 + e^{-k(0.5 - p)}}$$

Where $k = 6$ controls the steepness of the sigmoid curve. This mapping ensures that:
- Very low default probabilities ($p < 0.1$) map to scores above 750 (Tier 4)
- Moderate probabilities ($p \approx 0.3$) map to scores around 575 (Tier 2)
- High probabilities ($p > 0.6$) map to scores below 400 (Tier 1)

The sigmoid shape is preferred over linear mapping because it compresses the tails (preventing extreme scores for marginally different probabilities) while maintaining discrimination in the critical middle range where most lending decisions are made.

---

## 6. Explainability Framework

### 6.1 The Explainability Imperative

Explainability in credit scoring serves three distinct stakeholders with different information needs:

**Regulators** require transparency to verify compliance with fair lending laws and data protection regulations. Kenya's Data Protection Act 2019 mandates that data subjects have the right to know the logic involved in automated decision-making (Section 35). Similar provisions exist in Tanzania's Personal Data Protection Act 2022 and Uganda's Data Protection and Privacy Act 2019.

**Users (borrowers)** need understandable explanations to build trust in the system and take actionable steps to improve their scores. A user who is told "your score is 550 because your chama contribution consistency is 65% and your M-Pesa transaction stability is 40%" can directly address those specific behaviors. A user who is told "your score is 550 because the neural network computed it" has no actionable information.

**Lenders** need explanations for risk management and portfolio monitoring. Understanding which factors drive default probability at the portfolio level enables proactive intervention (e.g., targeting financial literacy programs at users with low chama contribution consistency).

### 6.2 SHAP-Based Explainability

The Trust Engine employs **TreeSHAP** — Lundberg et al.'s (2020) algorithm for exact SHAP value computation on tree-based models — to generate three levels of explanation:

**Level 1: Global Feature Importance.** The aggregate SHAP values across all users reveal which features are most influential in the model's decisions globally. This answers the question: "What drives credit scores across our user base?" The global importance plot enables product teams to validate that the model is relying on sensible features (e.g., repayment history, savings consistency) rather than spurious correlations (e.g., phone model, app usage time).

**Level 2: Individual Factor Breakdown.** For each user, the Trust Engine displays the seven factor sub-scores (Chama, M-Pesa, Soko, Loans, Kazi, Linda, KYC) with color-coded bars showing how each factor contributed to the overall score. This answers: "Why is MY score what it is?" The factor breakdown is the primary user-facing explanation.

**Level 3: Feature-Level SHAP Values.** For power users and customer support agents, the system provides granular SHAP values for each of the 25 engineered features, showing the direction and magnitude of each feature's contribution to the individual's score. This answers: "Which specific behaviors should I change to improve my score?"

### 6.3 Mathematical Foundation of SHAP

SHAP values are derived from cooperative game theory. For a prediction model $f$ and a specific instance $\mathbf{x}$, the SHAP value $\phi_j(f, \mathbf{x})$ for feature $j$ is defined as:

$$\phi_j(f, \mathbf{x}) = \sum_{S \subseteq N \setminus \{j\}} \frac{|S|!(|N| - |S| - 1)!}{|N|!} \left[ f_{S \cup \{j\}}(\mathbf{x}_{S \cup \{j\}}) - f_S(\mathbf{x}_S) \right]$$

Where $N$ is the set of all features, $S$ is a subset of features excluding $j$, and $f_S(\mathbf{x}_S)$ is the model's prediction using only the features in $S$. The Shapley value represents the **marginal contribution** of feature $j$, averaged over all possible feature combinations — ensuring a fair allocation of the prediction among all features.

For tree-based models, TreeSHAP computes these values **exactly** in $O(TLD^2)$ time, where $T$ is the number of trees, $L$ is the maximum number of leaves, and $D$ is the maximum tree depth. For the Trust Engine's configuration (T=500, L~64, D=6), this yields sub-millisecond explanation generation per user.

### 6.4 Counterfactual Explanations

Beyond SHAP values, the Trust Engine provides **counterfactual explanations** that answer the question: "What would my score be if I changed specific behaviors?" This is implemented through the What-If Simulator, which allows users to adjust hypothetical inputs (e.g., "What if I increased my monthly chama contribution from KES 2,000 to KES 5,000?") and see the projected score impact.

Counterfactual explanations serve two critical functions. First, they provide **actionable feedback**: instead of merely describing why a score is what it is, they show users concrete steps to improve it. Second, they serve as a **bias detection mechanism**: if the counterfactual for a female user shows that achieving the same score requires substantially different behavioral changes than for a male user, this may indicate demographic bias in the model.

---

## 7. Fairness and Bias Mitigation

### 7.1 The Fairness Challenge in Alternative Credit Scoring

Alternative credit scoring systems face a paradox: the very data sources that enable inclusion (behavioral signals from informal economic activity) can also encode and amplify existing inequalities. A model that uses chama participation as a credit signal may inadvertently penalize women who lack time for group meetings due to caregiving responsibilities. A model that values M-Pesa transaction volume may disadvantage rural users with limited digital infrastructure. A model that weights gig work completion may favor urban workers with access to more gig opportunities.

The academic literature has documented these risks extensively. Chackravarti's review (2025) identifies "serious concerns about data privacy, algorithmic transparency, and digital equity" in behavioral credit scoring systems [^163^]. The PMC study (2024) notes that alternative data models must be "carefully validated to ensure they do not introduce new forms of bias" [^166^].

### 7.2 Fairness Constraints in the Trust Engine

The Trust Engine implements fairness at three levels:

**Level 1: Excluded Features.** The following features are **explicitly excluded** from the scoring model to prevent demographic discrimination:
- Gender
- Ethnicity / tribe
- Religion
- Marital status
- Geographic location (beyond broad region for KYC purposes)
- Age (beyond binary "adult/minor" for eligibility)

These exclusions are **hard constraints** — the features are not collected, not stored, and not used in any scoring computation. This design choice aligns with Kenya's Data Protection Act 2019 (Section 44, which prohibits processing of personal data revealing ethnic origin, health, or sex life) and the broader principle of **fairness through unawareness**.

**Level 2: Fairness-Aware Training.** The XGBoost model is trained with fairness constraints that ensure **demographic parity** across protected groups. Specifically, the model is constrained such that the average predicted default probability for female users equals that for male users (conditional on actual default rates). This is implemented through the FairXGBoost approach (Ravichandran et al., 2020), which modifies the gradient boosting objective to penalize demographic disparity [^165^].

**Level 3: Bias Auditing.** The Trust Engine includes an automated bias audit pipeline that runs monthly and generates reports on:
- Score distribution by gender (target: <10 point mean difference)
- Score distribution by geographic region (target: <15 point mean difference between urban/rural)
- Score distribution by age cohort (target: <10 point mean difference)
- Disparate impact ratio (target: >0.8 for all protected groups)

Audit results that violate these thresholds trigger automatic model retraining with adjusted fairness constraints.

### 7.3 Regulatory Compliance

The Trust Engine's fairness framework is designed to satisfy the regulatory requirements of all four target markets:

| Market | Regulatory Framework | Trust Engine Compliance |
|--------|---------------------|------------------------|
| **Kenya** | Data Protection Act 2019; CBK Digital Credit Provider Regulations | Excluded features; explainability; consent management |
| **Tanzania** | Personal Data Protection Act 2022; BoT guidelines | Same as Kenya; Swahili-language explanations |
| **Uganda** | Data Protection and Privacy Act 2019; BoU guidelines | Same as Kenya; biometric data protections |
| **Rwanda** | Law 058/2021 on Data Protection; BNR guidelines | Same as Kenya; cross-border data transfer protocols |

---

## 8. Implementation and Deployment

### 8.0 Current Implementation Status

The architecture described in this section is the target state. As of the Tanzania pilot, the XGBoost model, SHAP service, feature store and event processor are **not yet deployed**, and no loan decision is currently made by the model specified in this paper.

Loan approvals are instead produced by a rule-based **Tanzania Underwriting Engine** (`backend/underwriting.py`), which assesses point-in-time affordability for a specific loan application rather than longitudinal borrower creditworthiness. It is specified in full in the companion document *The Tanzania Underwriting Engine* (`docs/UNDERWRITING_ENGINE.md`), including its factor set, decision thresholds, and a documented score-inflation defect.

The two systems are designed to compose rather than compete: the Trust Score determines the tier a borrower qualifies for (§4.2), while the underwriting engine determines whether a given request within that tier is affordable at the moment it is made. That composition is not yet wired — see UNDERWRITING_ENGINE.md §7. The pilot's repayment outcomes are the source of the labelled default data this paper's model requires for training.

### 8.1 Technology Stack

The Trust Engine is implemented as a set of microservices within the TWENDE platform architecture:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Feature Store | PostgreSQL + Drizzle ORM | Stores engineered features for all users |
| Model Service | Python + XGBoost + FastAPI | Serves score predictions via REST API |
| Explanation Service | Python + SHAP + FastAPI | Generates SHAP values and counterfactuals |
| Event Processor | BullMQ + Node.js | Consumes Kafka events, triggers score recalculation |
| Cache Layer | Redis | Caches loan eligibility (1-hour TTL) |
| Audit Store | PostgreSQL (append-only) | Logs all score changes with metadata |
| Frontend | React + Recharts | Displays scores, explanations, What-If simulator |

### 8.2 Score Update Triggers

Score recalculation is triggered by **event-driven updates** (for real-time responsiveness) and **batch updates** (for recency decay):

| Trigger Type | Events | Latency | Factors Affected |
|-------------|--------|---------|-----------------|
| **Real-time** | Loan repayment, KYC upgrade | < 2 minutes | Loans, KYC |
| **Near-real-time** | Chama contribution, gig completion, Soko order, premium payment | < 15 minutes | Chama, Kazi, Soko, Linda |
| **Hourly batch** | M-Pesa transaction summaries | < 1 hour | M-Pesa |
| **Daily batch** | Recency decay calculation | Midnight | All (gradual decay of old data) |

The **recency decay** mechanism ensures that older behavioral data gradually loses influence, preventing the "stale score" problem where a user's score reflects behaviors from years ago rather than their current financial situation. The decay follows an exponential function with a half-life of 180 days: a data point from 6 months ago contributes 50% of its original weight, while a data point from 12 months ago contributes 25%.

### 8.3 Performance Benchmarks

| Metric | Target | Current (Frontend Simulation) |
|--------|--------|------------------------------|
| Score calculation latency | < 5 seconds | ~2 seconds (in-browser) |
| Loan eligibility API response | < 500 ms | N/A (requires backend) |
| SHAP explanation generation | < 100 ms | N/A (requires backend) |
| Concurrent users supported | 10,000+ | N/A (requires backend) |
| Model retraining frequency | Monthly | N/A (requires production data) |

---

## 9. Discussion

### 9.1 Limitations and Future Work

The current Trust Engine implementation has several limitations that represent active areas of development:

**Limited Training Data.** The XGBoost model requires historical default data for supervised training. As a new platform, TWENDE has limited historical loan performance data. The current approach uses synthetic training data calibrated to published microfinance default rates (5-15% for informal borrowers), with model retraining planned as real default data accumulates.

**Single-Country Initial Deployment.** The scoring weights and tier boundaries are calibrated for the Kenyan market (KES currency, CBK regulations, M-Pesa ecosystem). Expansion to Tanzania, Uganda, and Rwanda will require recalibration to local mobile money providers (Vodacom M-Pesa, MTN Mobile Money), regulatory frameworks, and economic conditions.

**Feature Engineering Dependency.** The 25 engineered features require domain expertise to design and validate. Future work will explore **automated feature engineering** (using tools like Featuretools) to discover additional predictive signals from the raw behavioral data.

**Causal Inference.** Current SHAP values identify correlations, not causal relationships. Future work will integrate **causal inference techniques** (e.g., counterfactual regression, instrumental variables) to distinguish between features that cause default and those that are merely correlated with it [^168^].

### 9.2 Comparison to Existing Approaches

| Dimension | FICO Score (US) | M-Shwari Score (KE) | Branch Score (Global) | TWENDE Trust Engine |
|-----------|----------------|---------------------|----------------------|---------------------|
| **Data sources** | Credit bureau only | M-Pesa transactions only | Smartphone data + transactions | 7 behavioral dimensions |
| **Explainability** | Limited (5 factors) | None | None | Full SHAP decomposition |
| **Fairness constraints** | None explicit | None explicit | None explicit | Explicit excluded features + bias audits |
| **Score range** | 300-850 | Binary (eligible/not) | 0-1000 | 300-850 (familiar scale) |
| **Alternative data** | FICO XD (limited) | Limited | Moderate | Comprehensive |
| **Cross-product integration** | N/A | No | No | Yes (5 pillars) |

### 9.3 Theoretical Contributions

The TWENDE Trust Engine makes three contributions to the academic and practitioner literature on alternative credit scoring:

**First**, it demonstrates that **ROSCA (chama) participation data** can be systematically incorporated into credit scoring models with substantial predictive weight (20%). While the economic literature has long recognized ROSCAs as implicit credit markets, this is the first production credit scoring system to operationalize ROSCA behavioral signals as first-class credit inputs.

**Second**, it provides a **practical implementation of explainable AI** (XGBoost + SHAP + counterfactuals) in a developing-country fintech context, demonstrating that the accuracy-interpretability trade-off can be resolved through careful architecture design rather than model simplification.

**Third**, it proposes a **fairness framework** (excluded features + FairXGBoost + bias audits) that is specifically designed for the regulatory and social context of East African fintech, where gender equity, rural-urban disparities, and data protection are paramount concerns.

---

## 10. Conclusion

The TWENDE Trust Engine represents a novel approach to credit scoring for populations excluded from traditional financial systems. By synthesizing behavioral data across seven dimensions — chama savings, mobile money transactions, marketplace sales, loan repayment, gig work, insurance payments, and identity verification — the system generates credit scores that are **predictively accurate**, **transparently explainable**, and **demonstrably fair**.

The architecture's grounding in established mathematical frameworks (gradient boosting, Shapley values, cooperative game theory) and its compliance with East African regulatory requirements position it as a production-ready solution for the region's rapidly expanding digital credit market. The explicit incorporation of ROSCA (chama) behavioral signals — validated by decades of economic research on informal finance — represents a significant innovation that distinguishes the Trust Engine from existing mobile-money-based scoring systems.

As TWENDE progresses from prototype to production deployment, the Trust Engine will be refined through continuous model retraining, expanded feature engineering, and rigorous bias auditing. The ultimate measure of success will not be model accuracy alone, but the number of previously "credit invisible" individuals who gain access to affordable credit — and the economic opportunities that access unlocks.

---

## References

[^161^]: Dastile, X., Celik, T., & Pienaar, M. (2020). Machine learning powered financial credit scoring: A comprehensive review. *Artificial Intelligence Review*, 58(2), 1-47. https://doi.org/10.1007/s10462-025-11416-2

[^162^]: Chen, T., & Guestrin, C. (2016). XGBoost: A scalable tree boosting system. In *Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining* (pp. 785-794). ACM. https://doi.org/10.1145/2939672.2939785

[^163^]: Chackravarti, S. R. (2025). Behavioral credit scoring and financial inclusion: Rethinking risk, data ethics and opportunity in the age of AI. *International Journal of Engineering Research & Technology*. https://www.ijert.org

[^164^]: Khan, A. W., Tariq, M., & Khattak, M. A. (2025). AI-enhanced credit scoring using alternative data for financial inclusion in Pakistan. *Journal of CMSR*, 2025(1). https://cmsrjournal.com

[^165^]: Lundberg, S. M., Erion, G., Chen, H., et al. (2020). From local explanations to global understanding with explainable AI for trees. *Nature Machine Intelligence*, 2(1), 56-67. https://doi.org/10.1038/s42256-019-0138-9

[^166^]: Enhancing credit scoring accuracy with a comprehensive evaluation of alternative data. (2024). *PMC*. https://pmc.ncbi.nlm.nih.gov/articles/PMC11108212/

[^167^]: Cheruiyot, P. K., Cheruiyot, J. K., & Yegon, C. K. (2016). A study on operations and impact of rotating savings and credit associations: Case of middle income earners in Embakasi, Nairobi, Kenya. *International Journal of Economics, Commerce and Management*, 4(5). https://ijecm.co.uk

[^168^]: Connors, S. J. M. (2025). Beyond the black box: Explainable AI models for credit risk assessment in emerging markets. *ICCMETS 2025*. https://iccmets.com/2025/paper_2.pdf

[^169^]: Besley, T., Coate, S., & Loury, G. (1993). The economics of rotating savings and credit associations. *American Economic Review*, 83(4), 792-810.

[^170^]: Van den Brink, R., & Chavas, J.-P. (1991). The microeconomics of an indigenous African institution: The rotating savings and credit association. *CFNPP Working Paper No. 15*, Cornell University.

[^171^]: FICO Scores vs. Credit Scores: What's the difference? (2026). *myFICO*. https://www.myfico.com/credit-education/fico-scores-vs-credit-scores

[^172^]: Rotating savings and credit associations: A scoping review. (2024). *World Development Sustainability*, 3, 100039. https://doi.org/10.1016/j.wds.2023.100039

[^173^]: Traditional vs. Alternative Credit Scoring: Differences and Advantages. (2023). *GiniMachine*. https://ginimachine.com/blog/traditional-vs-alternative-credit-scoring/

[^174^]: Algorithmic Credit Scoring and FICO's Role in Developing Unbiased Models. (2021). *FICO / BLDS LLC*. https://www.bldsllc.com/files/20211116_FICO.pdf

[^175^]: How alternative credit data works alongside credit scores. (2025). *Plaid*. https://plaid.com/resources/lending/alternative-credit-data/

[^176^]: Seibel, H. D. (1995). Rotating and accumulating savings and credit associations: A development perspective. *Savings and Development*, 19(3).

[^177^]: Japinye, A. O., & Adedugbe, A. A. (2025). Explainable AI for credit scoring with SHAP-calibrated ensembles: A multi-market evaluation on public lending data. *SSRPublisher*. DOI: 10.5281/zenodo.17155174

[^178^]: Explainable AI (XAI) using SHAP and LIME for financial fraud detection and credit scoring. (2025). *Scilit*. https://www.scilit.com/publications/d22d6b65d80330af3115cce1d3698345

[^24^]: Alternative Data for Credit Scoring. (2025). *Alliance for Financial Inclusion (AFI)*. https://www.afi-global.org/wp-content/uploads/2025/02/Alternative-Data-for-Credit-Scoring.pdf

---

*This white paper was prepared by Eddy Mkwambe, Founder of Mpingo Systems LLC, as part of the TWENDE fintech platform documentation. The author holds an MS in Strategic Analytics from Brandeis University and an MS in Mathematical Modeling from the University of Dar es Salaam.*
