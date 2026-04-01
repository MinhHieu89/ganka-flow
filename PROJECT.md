# PROJECT.md — Ganka Flow

## Project Overview

- **What**: Clinic management system (HIS) for Ganka28, a Vietnamese ophthalmology clinic
- **Location**: Hanoi, single location at launch (multi-branch expansion planned)
- **Model**: Boutique clinic — small scale, personalized patient experience
- **Team at launch**: 2 doctors, 2 technicians, 1 nurse, 1 cashier, 1 optical staff, 1 manager
- **Language**: Bilingual VN/EN — all UI labels in Vietnamese with proper diacritics
- **Tech stack**: React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS v4 + shadcn/ui
- **Current stage**: Frontend mockup screens (no backend yet)

---

## Phase Roadmap

### Phase 1: Clinical Core (Current)

**IN**: Patient Intake, Pre-Exam (Screening), Basic EMR, Dry Eye Core, Reporting

**OUT (deferred)**: AI, Advanced analytics, Device integration

### Phase 2: Operations

Pharmacy, Optical Center, Treatment Courses, Payments, VIP Membership

### Phase 3: Online & Integration

Online Sales, Zalo OA, MISA auto-sync, BHYT, Sở Y tế connection (deadline 31/12/2026)

---

## Modules

### 1. Patient Intake

**Status**: Phase 1

- Patient ID format: `GK-YYYY-NNNN` (e.g. GK-2026-0001)
- Required fields (exam patients): Name, Phone, DOB, Gender, Chief complaint
- Minimal fields (walk-in pharmacy customers): Name, Phone only
- Optional fields: Occupation, Medical history, Medications, Allergies, Lifestyle
- Search: by phone, name, or patient ID (< 3 seconds)
- Allergy info: structured list with prescribing alerts
- Patients can see different doctors across visits (history tracked per visit)
- Configurable: Address + CCCD can be made required for legal/referral cases

---

### 2. Pre-Exam (Screening)

**Status**: Phase 1

**Purpose**: Triage & route patient to correct disease group — NOT diagnosis.

**Step 1 — Screening:**

- Core data (always): Chief complaint, UCVA, Current glasses Rx (if any)
- Screening questions: Dry/gritty/irritated eyes? Blurry after blinking? Screen time hrs/day
- Red flags (mandatory check): Eye pain, Sudden vision loss, Asymmetry between eyes
- Red flag → fast-track to doctor (skip Step 2, bypass normal flow)

**Step 2 — Route to disease group template:**

- **Dry Eye** → OSDI, TBUT, Schirmer, Meibomian, Staining
- **Refraction** → Full refraction, Current glasses, VA
- **Myopia Control** → Axial length, Progression, Lifestyle, Risk scoring
- **General** → VA, IOP, Slit-lamp, Fundus

**Data layers:**

- **Core** (mandatory for all) — always shown
- **Conditional** (context-based) — shown based on patient type/complaint
- **Optional** (flexible) — staff can add extra info
- Dynamic form approach (not static)

**Performer**: Technician or Doctor depending on case

---

### 3. EMR (Doctor Exam)

**Status**: Phase 1

**Sections**: History, VA, Refraction, Slit-lamp, Fundus, Diagnosis, Plan

**Refraction data**: SPH, CYL, AXIS, ADD, PD, VA (with/without glasses), IOP, Axial Length

**Diagnosis:**

- Multi-diagnosis support (primary + secondary)
- ICD-10 optional (required for Sở Y tế by 31/12/2026)

**Plan options**: Medication, Optical (glasses Rx), Procedure, Follow-up

**Prescribing:**

- Select from catalog (linked to pharmacy stock) + free-text for external meds
- Allergy alert when prescribing
- Prescription validity: 7 days (per MoH regulation)
- Doctor name on prescription (no e-signature in v1)

**Data rules:**

- Visit-based (never overwrite previous visits)
- OD/OS tracked separately (symptoms can be combined)
- Structured data preferred over free text
- Clear units on all measurements
- Full history tracked

**Images**: Fluorescein, Meibography, Specular microscopy, Topography, OCT, Video

- Side-by-side comparison between visits
- Zoom ≥ 200% without quality loss
- Attached to specific visit

---

### 4. Dry Eye System

**Status**: Phase 1

**Core logic**: DEWS III diagnosis, classification, severity

**OSDI-6 questionnaire scoring:**

| Score | Level |
|-------|-------|
| 0–3 | Normal |
| 4–8 | Mild |
| ≥9 | Severe |

**TBUT auto-classification:**

| Value | Flag |
|-------|------|
| <5s | Severe |
| 5–10s | Moderate |
| >10s | Normal |

**Schirmer auto-classification:**

| Value | Flag |
|-------|------|
| <5 | Severe |
| 5–10 | Moderate |
| >10 | Normal |

**System auto-suggests**: Dry eye subtype, Severity, Risk level

- Risk level uses separate detailed scoring sheet (not combined from TBUT/Schirmer)
- Dry eye subtype: currently only "aqueous deficient" — full subtype classification deferred

**Charts**: OSDI trend over time, TBUT comparison across visits

**Reports**: Treatment progress exportable

**Each eye tracked separately for measurements.**

---

### 5. Reporting

**Status**: Phase 1

**Output**: Patient summary — VA, Refraction, Diagnosis, Recommendation

**Format**: Printable PDF, bilingual VN/EN (optional future)

**Print templates**: Prescription, Glasses Rx, Invoice/Receipt, Referral letter, Consent form, Pharmacy labels

**Research export:**

- All clinical data (OSDI, TBUT, Schirmer, refraction, treatment outcomes)
- Anonymized, Excel/CSV format
- Must handle ≥ 1,000 patients without error

---

### 6. Pharmacy (Phase 2)

- In-house pharmacy (tủ thuốc), not separate entity
- Serves both patients (with Rx) and walk-in customers
- Import: from supplier invoices (scan/manual) or Excel
- Min stock alerts per item, expiry warnings
- No controlled substances
- Prescription linked to stock for auto-deduction
- Separate supply warehouse for consumables (IPL gel, eye patches, etc.)
- E-invoice via MISA

---

### 7. Treatment Courses (Phase 2)

- IPL, LLLT, Eyelid care — 1–6 sessions flexible
- Pricing: per session or package (both)
- Payment: full upfront or 50/50 split (2nd payment before mid-course session)
- Only doctors create/modify protocols
- Multiple active courses per patient allowed
- Min interval: IPL 2–4 weeks, LLLT 1–2 weeks, Eyelid care 1–2 weeks
- OSDI recorded per session
- Track consumables per session
- Cancellation: refund with 10–20% fee, manager-approved, configurable
- Course switching: requires doctor approval
- Auto-complete when all sessions done

---

### 8. Optical Center (Phase 2)

- Lens suppliers: Essilor, Hoya, Việt Pháp
- Barcode system: needs setup from scratch
- Glasses Rx stored per visit, compared across years
- Order states: Ordered → In progress → Received → Ready → Delivered
- Processing: 1–3 days, in-house or outsourced
- Delivery: pickup or ship
- Combo pricing: preset + custom combos
- Warranty: 12 months frames, 12 months lenses (case-by-case based on cause + evidence)
- Contact lenses (Ortho-K): prescribed via HIS
- Ortho-K follow-up protocol: 1d → 1w → 1m → 3m → 6m (auto-scheduled)
- Payment: full payment before lens cutting (no deposit)
- Profit tracking per product, per staff, per brand

---

### 9. Online Sales (Phase 3)

- Products: glasses frames, sunglasses (expand later)
- Public-facing, appointment booking integrated
- Payment: cash, bank transfer, QR, card
- Shipping: self-delivery, GHTK, GHN, Grab/Bee/Xanh SM
- Real-time stock sync (≤ 10s between online/offline)
- Promotions & warranty management

---

## Cross-Cutting Concerns

### Roles & Permissions

| Role | Access |
|------|--------|
| Reception | Patient intake, appointment scheduling |
| Technician / Refractionist | Pre-exam, measurements |
| Doctor | EMR, diagnosis, prescribing, treatment protocols |
| Cashier | Payments, invoicing |
| Optical Staff | Glasses orders, fitting |
| Manager / Owner | Full access, pricing, reports, refund approval, discount approval |
| Admin | System configuration |

### Appointments & Scheduling

- Walk-in + booked (combined)
- Clinic hours: Tue–Fri 13:00–20:00, Sat–Sun 08:00–12:00 (expandable to 13:00–17:00), Mon closed
- Slot duration: New patient 30min, Follow-up 20min, IPL/LLLT 30–45min, Ortho-K 60–90min
- 1 patient per doctor per slot (no overbooking)
- No electronic queue system in v1 (boutique model, call by name)
- Patient self-booking via website/Zalo + staff booking (both)
- Reminder: 1 day before via Zalo (no SMS fallback in v1)
- No double booking allowed

### Payments & Finance

- Single consolidated invoice per visit (internal revenue split by department)
- Methods: Cash, Bank transfer, QR (VNPay/MoMo/ZaloPay), Card (Visa/MC)
- VIP membership: tier based on 12-month spend or completed treatment course
  - Benefits: 10% off follow-up exams, 5–7% off services, 2 family members get 10% off exams
  - Duration: 12 months, auto-calculated
- Cashier discounts require manager approval
- Refunds: manager/owner approval only
- Price changes: manager/owner only, with audit log
- E-invoice: MISA
- BHYT: not connected yet, future plan
- MISA integration: Phase 1 manual export → Phase 2 auto-sync

### Notifications (Zalo)

- Appointment reminder (1 day before)
- Post-visit summary / thank you
- Treatment session reminder
- Glasses ready for pickup
- Zalo OA: not yet set up

### Data & Compliance

- Medical records stored minimum 10 years
- Access logging on all records
- Daily automated backup
- Cloud-based
- Data ownership: Ganka28
- Sở Y tế connection: ready before 31/12/2026 (ICD-10 codes needed)
- Open API for future device/system integration
- No patient data migration (fresh start)

### Dashboard KPIs

- Revenue by department (exam, optical, pharmacy, treatment)
- Optical center gross margin
- Dry Eye treatment effectiveness (OSDI improvement)
- Revenue per doctor
- Treatment sessions completed / remaining
- Revenue by shift
- Doctor performance (revenue, patient count)

---

## Key Decisions Log

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| 1 | Phase 1 = Clinical Core only | Focus on core clinical workflow before operations | 2026-Q1 |
| 2 | Online Sales deferred to Phase 3 | Not needed at launch, single location | 2026-Q1 |
| 3 | No electronic queue system in v1 | Boutique model, small scale | 2026-Q1 |
| 4 | Patient ID = GK-YYYY-NNNN | Year-based, professional, not tied to phone number | 2026-Q1 |
| 5 | OD/OS tracked separately, symptoms combined | Clinical accuracy per Dr. Chi Vu | 2026-Q1 |
| 6 | Dynamic forms for pre-exam | Flexibility for different patient contexts | 2026-Q1 |
| 7 | Red flag → fast-track to doctor | Safety: bypasses normal triage flow | 2026-Q1 |
| 8 | OSDI-6 (not full OSDI) | Clinic preference | 2026-Q1 |
| 9 | Risk level = separate scoring sheet | Not derived from TBUT/Schirmer, per Dr. Chi Vu | 2026-Q1 |
| 10 | Bilingual VN/EN interface | Clinic preference | 2026-Q1 |
| 11 | Separate supply warehouse from pharmacy | Clean inventory separation | 2026-Q1 |

---

## Current Status

- **Stage**: Frontend mockup screens
- **Phase**: Phase 1 — Clinical Core
- **Next**: Build mockup screens for Patient Intake → Pre-Exam → EMR → Dry Eye → Reporting flow
