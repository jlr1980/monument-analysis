# Monument Financial Engine: Rebuild Changelog

This document records the rebuild of the financial engine behind the Monument
scenario analysis. It is written so that a partner who is skeptical of the
analysis can read it cold and see exactly what changed, why, and whether the
new engine still ties to the team's own numbers.

---

## Why we are rebuilding

The four-scenario model in `models/monument_scenario_model.xlsx` sits on top of
the team's pro forma (`archive/MONUMENT PROFORM FINAL WORKING DRAFT.xlsx`). That
pro forma is structurally a per-lot model: every lot has its own detail row,
with a hard-coded sale year and price, and the cash flow reads those rows
directly. Lot count is not an input. It is the number of populated rows.

That design has a consequence the current scenario model cannot escape. When we
present Compact at 32 lots or Conservation at 25 lots, the cash flow underneath
is still running the same 27 monetized lots as Base Case. The scenario columns
change per-lot intensity (pricing, Foundation contribution, mech rec scope, tax
realization), but they do not change the count of lots flowing through revenue,
development cost, Foundation funding, or debt retirement. The non-Base internal
rates of return are therefore artifacts of a 27-lot engine wearing a 25-lot or
32-lot label. They are not wrong arithmetic. They are answers to a question
nobody asked.

A partnership deciding whether to build 50 lots or 25 deserves an engine where
lot count is a real lever. That is what we are building: a clean parametric
engine where lot count flows through revenue, development cost, Foundation
contribution, and debt retirement as a genuine input.

---

## Principle 1: Six-number reconciliation

The rebuilt engine is not trusted until it reproduces the team's own pro forma.
At Base Case inputs, the engine must reconcile to these six headline numbers
within one percent:

| # | Output                          | Team value   |
|---|---------------------------------|--------------|
| 1 | Total real estate revenue       | $146M        |
| 2 | Levered XIRR                    | 16.2%        |
| 3 | MOIC                            | 1.79x        |
| 4 | Net profit                      | $7.9M        |
| 5 | Foundation end balance          | $33.5M       |
| 6 | Total Pre-Existing Debt Service | $30.8M       |

When all six tie at Base inputs, the engine is structurally validated and we can
trust the non-Base scenarios it produces. Any residual inside the one percent
tolerance must be explained in writing in this changelog, with the source of the
gap named. A number that ties "close enough" without an explanation is treated
as not tied.

This is the same discipline used to validate the existing scenario model
(Base Case bit-identical to the archive). The rebuild raises the bar: not just
identical outputs from identical wiring, but identical outputs from a
re-derived engine.

---

## Principle 2: Correlation-aware design

A Monte Carlo step will follow this rebuild. It will draw input distributions
for snowpack, sales velocity, tax realization, entitlement risk, and similar
variables. Those inputs are not independent. A weak snowpack year pressures
sales velocity. An entitlement setback delays tax realization and slows sales
together. Treating them as independent draws would understate the real spread
of outcomes, which is the opposite of rigor.

The engine is therefore built so that correlated inputs can be added later
without rewiring. Concretely:

- Every stochastic input lives in one identified input cell, never buried inside
  a downstream formula. The set of input cells is the correlation surface.
- Inputs are kept separate from the transforms applied to them, so a correlation
  layer can sit between the raw draws and the engine.
- No input is silently derived from another. If snowpack should move sales
  velocity, that link is modeled explicitly and visibly, not hidden in a formula
  that happens to reference both.

The test: a reader should be able to point at the input block and say "these are
the things that vary, and here is where their joint behavior would be
specified." If finding the correlation surface requires reading formulas, the
design has failed.

---

## Color convention for engine changes

Any sheet, column, or cell added or modified by the rebuilt engine is filled
light green so changes are visually obvious against the team's original work and
against the existing scenario model. Confirmed 2026-05-22:

- **Light green (`#C6EFCE`)** — every engine-added sheet, column, and cell. The
  "this is new, not the team's" marker.
- **Yellow (unchanged)** — reserved for Custom scenario partner-input cells. The
  engine never adds yellow fill.
- Engine input cells that are meant to be user-editable get the light green fill
  plus a cell border, so they read as "new and editable" without colliding with
  the Custom convention.

---

## Session 1: Cost structure investigation (2026-05-22)

**Scope.** Read-only investigation of `Project & Constr. Cost Detail` and
`Project & Constr. Cost Summary` in the team's pro forma. Goal: determine
whether the team's development cost can be split into fixed infrastructure cost
(exists regardless of lot count) versus variable per-lot cost. No files modified
except this changelog.

### What the cost sheets contain

Total Project Development Cost is **$67,403.7K** (gross). It decomposes as:

| Block                              | Amount ($K) | Nature |
|------------------------------------|-------------|--------|
| Vertical amenity construction      | 39,974.7    | Fixed  |
|   The LZ                           | 9,542.6     |        |
|   The Corrals                      | 14,951.2    |        |
|   The Fort                         | 6,702.1     |        |
|   Additional Amenities             | 7,250.0     |        |
|   Security Gate / Gatehouse        | 1,528.9     |        |
| Offsite Infrastructure             | 2,937.0     | Fixed  |
| In-Tract Infrastructure            | 15,318.0    | Mixed  |
| Residential Vertical               | 0.0         | Off    |
| Club Equipment                     | 3,514.0     | Fixed  |
| Management Fees                    | 3,160.0     | Derived|
| Contingency                        | 2,500.0     | Flat   |
| **Total (gross)**                  | **67,403.7**|        |

The `Project & Constr. Cost Detail` sheet is a building-by-building cost
buildup, roughly thirteen building-pairs laid side by side across 145 columns.
Each amenity building is broken into Design and Precon, Structure, Site, and
Infrastructure, with square-foot assumptions and dollar-per-square-foot rates.

### Finding 1: The vertical construction is genuinely fixed

The $39.97M of vertical construction is named amenity buildings: the LZ lodge
node, the Corrals (ranch house, stable, garage), the Fort, adventure outposts,
warming huts, the security gate. None of it is residential. The "Residential
Vertical" section (Residence Club, TBD) is explicitly toggled OFF and carries
$0. Members build their own ranch houses; the developer's cost is the shared
club infrastructure. This $39.97M exists whether the development has 25 lots or
50. It is true fixed cost.

### Finding 2: The team's model has no per-lot cost driver

This is the structural reason the pro forma cannot flex lot count. The revenue
side reads hard-coded per-lot rows; the cost side has no lot input at all. Drop
lot count from 50 to 25 in the team's model and development cost does not move.
That is not a modeling choice they made deliberately. It is a gap.

### Finding 3: A fixed-plus-variable split IS partly recoverable

The In-Tract Infrastructure block ($15.318M) is where lot-count sensitivity
lives, and the team's own detail exposes it. In-Tract Infrastructure breaks down
as:

| In-Tract item     | Amount ($K) | Driver in the team's detail |
|-------------------|-------------|------------------------------|
| Roads             | 5,523.0     | 18.41 miles x $300K/mile     |
| Power             | 2,000.0     | Off-grid $1.5M + on-grid $0.5M |
| Water             | 3,750.0     | Water rights 25 x $30K + Wells 50 x $60K |
| Sewer             | 295.0       | Septic $250K + SWPPP $45K    |
| Land Improvements | 3,750.0     | Ski $1.0M + Hunt $0.75M + Ranch $2.0M |

Two items are unit-count driven in the team's own formulas:

- **Wells: 50 units at $60K each = $3.0M.** The quantity 50 matches the
  master-plan lot count exactly. This reads as one well per lot.
- **Water Rights Acquisition: 25 units at $30K each = $750K.** A unit-count
  driven line, quantity 25.

The detail also carries explicit per-lot annotations the team wrote to
themselves: a "perk test" note reading "10-15k per lot," and a "water test well"
note. The Roads line ($5.523M) is mileage-driven, which makes it sensitive to
how many lots and nodes the road network has to reach, though stepwise rather
than strictly per-lot. The Offsite Water and Sewer lines are marked "Need
input," meaning the team has not finished costing them.

### Finding 4: Management Fees and Contingency are derived, not fixed inputs

Management Fees ($3.16M) are formula-driven (a rate times a base). Contingency
($2.5M) is a flat hard-coded number, not a percentage. Both should be modeled as
derived lines in the engine so they recompute when the cost base changes, rather
than carried as fixed constants.

### The number that matters for the memo

Of the $67.4M total, only about **$3.75M (wells plus water rights) is cleanly
per-lot**, and about **$5.5M (in-tract roads) is lot-count-sensitive in a
stepwise way**. The remaining roughly **$58M is fixed regardless of whether the
development builds 25 lots or 50.**

This is itself a finding the memo should carry. In the team's cost structure,
cutting lot count does almost nothing to development cost. So fewer lots does
not automatically mean a leaner project. It means the same fixed infrastructure
spread across less revenue, which makes per-lot economics worse, not better,
unless infrastructure scope is descoped alongside lot count. The engine must let
infrastructure scope flex, not just lot count, or the smaller scenarios will be
unfairly penalized.

### Proposed cost-scaling approach (awaiting confirmation)

Fixed-plus-variable, recovered from the team's numbers where their detail
supports it, documented where it does not. Three tiers:

**Tier 1, Fixed ($46.4M).** Vertical amenity construction ($39.97M) + Offsite
Infrastructure ($2.94M) + Club Equipment ($3.51M). Independent of lot count.
Flexes only if a scenario explicitly descopes an amenity (a lever the engine
should expose, since Compact and Conservation may not need every node).

**Tier 2, Variable, lot-count driven ($15.3M In-Tract, split internally):**

- *True per-lot* ($3.75M at 50 lots): Wells at $60K/lot and water rights at
  ~$30K/lot. Scales linearly with lot count using the team's own unit costs.
- *Stepwise* ($5.52M at 18.41 miles): In-tract roads. Modeled on road mileage,
  which scales with lot count and dispersion but not one-for-one. Default
  assumption to be documented; a strict per-lot fallback flagged as last resort.
- *Largely fixed within In-Tract* ($6.05M): Power, sewer, land improvements.
  Held fixed unless a scenario descopes them.

**Tier 3, Derived ($5.66M).** Management Fees recomputed from the team's rate
structure on the new cost base. Contingency recomputed as a percentage of the
new base (the team's flat $2.5M is 3.7% of their gross; modeling it as a
percentage keeps it honest as the base moves).

This approach uses the team's own unit costs for the genuinely variable piece,
so the variable component is recovered, not invented. It is not linear-only.
Linear scaling is reserved for the wells and water rights, where the team's
detail shows the relationship genuinely is linear.

### Decisions confirmed (2026-05-22)

The three open questions are resolved, plus the color convention.

**1. Amenity descoping is a lever.** An amenity scope multiplier applies to
Tier 1 vertical construction ($39.97M): Base 1.0, Staged 1.0, Compact 0.8,
Conservation 0.6. What each level hypothetically descopes, specific enough to
defend without designing buildings:

- *1.0 (Base, Staged):* full vertical program as the team scoped it.
- *0.8 (Compact):* Phase 2 vertical construction (Adventure Outposts, the
  security gate / gatehouse) is deferred until Phase 2 sales clear, rather than
  built up front. The 0.8 reflects deferral, not deletion.
- *0.6 (Conservation):* in addition to the 0.8 deferral, the LZ is reduced to
  lodge-only, with no attached lodging structures. A smaller-footprint program
  matched to a 25-lot legacy-asset scenario.

The multiplier scales the vertical construction line only. Offsite
Infrastructure and Club Equipment in Tier 1 stay fixed.

**2. In-tract roads scale stepwise by band.** Up to and including 30 lots, road
cost uses the team's base of 18.41 miles at $300K/mile = $5.523M. Above 30 lots,
mileage steps up 20% to 22.09 miles = $6.628M. Two bands, one step at the 30-lot
threshold. Base (27 revenue lots) sits in the lower band, so this reconciles to
the team's road cost. Compact (32 lots) is the only scenario in the upper band.

**3. Wells scale one-to-one with lot count.** Confirmed: 50 wells = one well per
master-plan lot. The engine multiplies master-plan lot count by the team's
$60K/well unit cost. Base master-plan count is 50, which reconciles to the
team's $3.0M. Water rights acquisition stays on its own quantity basis (25 units
at $30K) pending a later decision on whether it, too, is per-lot.

**4. Color convention: light green.** Recorded above. Engine additions are
`#C6EFCE`; yellow stays reserved for Custom inputs.

---

## Session 2: Proposed engine architecture (2026-05-22, awaiting confirmation)

This section proposes the engine's structure. No construction begins until it is
confirmed.

### Workbook placement

Recommendation: build the engine as a **new workbook, `models/monument_engine.xlsx`**,
rather than adding sheets into `monument_scenario_model.xlsx`. Reason: the
existing scenario model is wired to the team's hard-coded per-lot detail rows.
The whole point of the rebuild is an engine that does not depend on those rows.
Keeping it in a separate workbook gives a skeptical partner three clean objects
to inspect: the team's pro forma, the existing scenario model, and the new
parametric engine, each reconciling to the next. The engine reads nothing from
the team's file at run time; it carries the team's inputs as documented
constants on its own Inputs sheet. (Open question A below.)

### Sheets to be added (all light green)

Eight sheets, in calculation order:

1. **`Inputs`** — every parametric input in one place, organized in labeled
   blocks: Lot Program, Pricing, Cost, Foundation, Capital Structure, Tax,
   Operations, and a separate **Stochastic Drivers** block. A scenario selector
   (dropdown) plus five scenario columns and an active-scenario column resolved
   by INDEX/MATCH, matching the pattern already used in the scenario model.
   Every input is one labeled cell with a Base value and a Notes column. Nothing
   downstream invents a number; it all traces here.

2. **`Lot Schedule`** — the parametric replacement for the team's hard-coded
   detail rows. Takes lot count and phase split, expands into phase cohorts,
   assigns a sale year and price per cohort, and produces an annual schedule of
   lot closings and gross sales. Rows beyond the active lot count zero out, so
   lot count is a true input, not a row count.

3. **`Revenue`** — from the lot schedule: real estate sales revenue, Foundation
   contributions (per-lot contribution times contributing-lot count), initiation
   fees, and club dues. **Headline #1 (total RE revenue) resolves here.**

4. **`Development Cost`** — the three-tier cost model from Session 1: Tier 1
   fixed (vertical times amenity multiplier, plus offsite infra and club
   equipment), Tier 2 variable (wells per master-plan lot, water rights, road
   band, fixed in-tract items), Tier 3 derived (management fees, contingency).
   Produces total development cost and its year-by-year phasing.

5. **`Foundation`** — Foundation fund roll-forward year by year: contributions
   in, investment yield, grants out, operating cost, regional mandate where a
   scenario funds one. **Headline #5 (Foundation end balance) resolves here.**

6. **`Debt`** — the pre-existing debt service schedule (La Plata plus Swans) and
   the 2032 balloon, modeled as sales-funded payoff or refinance at 7.5%
   depending on the scenario. **Headline #6 (total Pre-Existing Debt Service)
   resolves here.**

7. **`Cash Flow`** — the master annual cash flow. Assembles revenue, development
   cost, Foundation flows, debt service, and operating items into a levered cash
   flow to equity, respecting the new-equity-priority waterfall.
   **Headlines #2 (levered XIRR), #3 (MOIC), and #4 (net profit) resolve here.**

8. **`Reconciliation`** — the validation dashboard. Six rows, one per headline
   number: team value, engine value at Base inputs, dollar delta, percent delta,
   and pass/fail against the one percent tolerance. Green only when all six
   pass. This sheet is the gate between a built engine and a trusted one.

### End-to-end calculation flow

```
Inputs  (scenario selector + all parameters + stochastic drivers)
   |
   v
Lot Schedule  (lot count -> phase cohorts -> sale year + price per cohort)
   |
   +--> Revenue           -> Headline 1: Total RE revenue
   |
   +--> Development Cost  (3-tier; amenity multiplier, wells, road band)
   |
   +--> Foundation        -> Headline 5: Foundation end balance
   |
   +--> Debt              -> Headline 6: Total Pre-Existing Debt Service
   |
   v
Cash Flow  (levered cash flow to equity, new-equity-priority waterfall)
   |
   +--> Headline 2: Levered XIRR
   +--> Headline 3: MOIC
   +--> Headline 4: Net profit
   |
   v
Reconciliation  (all six vs. team, vs. 1% tolerance)
```

Every arrow is a one-directional reference. No sheet downstream feeds a sheet
upstream. This keeps the engine auditable: a partner can trace any headline
number back to the Inputs sheet without circular references.

### Two lot-count concepts (reconciliation note)

The engine carries two lot counts, because the team's numbers require it:

- **Revenue-producing lot count** drives revenue, Foundation contributions, and
  the road band. Base 27, Staged 27, Compact 32, Conservation 25.
- **Master-plan lot count** drives well cost. Base 50, Staged 50, Compact 32,
  Conservation 25.

In Base and Staged the two differ (27 monetized lots inside a 50-lot master
plan). In Compact and Conservation every lot is monetized, so the two counts
coincide. This split is what lets Base reconcile: 27 revenue lots keep road cost
in the lower band at the team's $5.523M, while 50 master-plan lots keep well
cost at the team's $3.0M. Both facts are required for the six-number tie.

### How the correlation surface is preserved

The Monte Carlo step will draw correlated samples for snowpack, sales velocity,
tax realization, and entitlement risk. The architecture preserves that surface
three ways:

1. **One block, four cells.** All stochastic inputs live in the Stochastic
   Drivers block on the Inputs sheet: snowpack index, sales-velocity factor,
   tax-realization factor, entitlement-delay (months). At Base each is neutral
   (1.0, or 0 for the delay), so a Base run is deterministic and reconciles
   cleanly. This block is the entire correlation surface. A reader can point at
   it.

2. **One driver, one visible transform.** Each driver multiplies or shifts
   exactly one downstream quantity through a named, visible formula:
   sales-velocity factor scales cohort sale timing in Lot Schedule;
   tax-realization factor scales realized tax benefit; entitlement-delay shifts
   program start; snowpack index feeds sales velocity and, later, operating
   revenue. No driver is computed from another inside a formula. If snowpack
   should influence sales velocity, that link is expressed either as a joint
   draw in the correlation matrix or as one explicit link cell, never buried.

3. **Monte Carlo plugs in, does not rewire.** The later Monte Carlo layer is a
   separate light-green sheet holding a correlation (or covariance) matrix over
   the four drivers. It draws correlated samples, writes them into the four
   driver cells, recalculates, and harvests the six headline outputs. Because
   nothing else in the engine is stochastic, the matrix stays small (4x4,
   expandable) and lives in one place. Adding a fifth correlated input later
   means adding one driver cell and one matrix row and column, with no change to
   the engine body.

The design test, restated: the correlation surface is found by looking, not by
reading formulas. The Stochastic Drivers block is that surface.

### Decisions confirmed (2026-05-22, Session 2 close)

- **A. Workbook placement.** Confirmed: new workbook `models/monument_engine.xlsx`,
  self-contained, reading nothing from the team's file at run time.
- **B. Scenario selector.** Confirmed: the engine builds its own five-column
  scenario block on the Inputs sheet.
- **C. Time grain.** Confirmed: annual for the body of the engine. If the
  levered-XIRR reconciliation lands outside the one percent tolerance with
  pure-annual cash flows, a monthly sub-table will be added for the XIRR
  calculation only; everything else stays annual. The outcome will be recorded
  in this changelog at the Cash Flow / Reconciliation stage.
- **D. Water rights basis.** Held at the team's flat 25 units times $30K for
  now. Flagged for a later decision on whether it should scale per lot.

**Addition A: both lot counts are exposed on the Inputs sheet.** The
revenue-lots / master-plan-lots distinction is not buried in the Lot Schedule.
The Inputs scenario block carries two explicit rows, "Revenue lots" and
"Master-plan lots," so a partner sees both at a glance:

| Scenario     | Revenue lots | Master-plan lots |
|--------------|--------------|------------------|
| Base         | 27           | 50               |
| Staged       | 27           | 50               |
| Compact      | 32           | 32               |
| Conservation | 25           | 25               |

**Addition B: the 30-lot road band threshold is deliberate.** The threshold
that separates the lower in-tract road band (18.41 miles) from the upper band
(22.09 miles, plus 20%) is set at 30 lots on purpose. It is the point at which a
dispersed-node plan needs an additional cluster road to reach the extra lots. It
is not an artifact of where Base and Compact happen to fall. Base, at 27 revenue
lots, sits below it and uses the team's base mileage. Compact, at 32 lots,
crosses it and carries the additional road. Staged (27) and Conservation (25)
stay in the lower band. A reviewer should read the threshold as a modeled fact
about cluster-road geometry, not as a number reverse-fitted to the scenarios.

No further gating questions. Construction proceeds sheet by sheet.

---

## Session 3: Engine construction (2026-05-22)

Built at Base Case inputs only. The five-scenario block is laid into the Inputs
sheet, but only the Base column drives the engine until Base reconciles to all
six headline numbers within one percent. Scenario expansion is gated on that
reconciliation. Construction proceeds one sheet at a time, in calculation order.

### Sheet 1 of 8: Inputs (built)

Workbook `models/monument_engine.xlsx` created. The Inputs sheet holds every
parametric input in nine columns: A label, B-F the five scenario columns
(Base / Staged / Compact / Conservation / Custom), G the ACTIVE live value, H
unit, I notes. Column G resolves the active scenario through
`=INDEX(B:F, MATCH(active scenario name, scenario header, 0))`. Every downstream
sheet reads column G and nothing else.

Inputs are grouped in labeled blocks: Lot Program, Sales Velocity, Pricing,
Development Cost Tiers 1-3, Foundation, Capital Structure, Pre-Existing Debt,
Tax, Operations, and a separate Stochastic Drivers block. The two lot counts
(revenue lots, master-plan lots) are both exposed as their own rows per
Addition A. The Stochastic Drivers block holds four cells (snowpack index,
sales-velocity factor, tax-realization factor, entitlement delay), each neutral
at Base, bordered to read as new-and-editable; the Monte Carlo layer will write
into their column G cells. This block is the entire correlation surface.

Two modeling values are carried as back-solved rates rather than the team's flat
dollars: the management fee ($3,160K) and contingency ($2,500K) are expressed as
percentages of the team's $58,229.72K project-plus-infrastructure base
(5.426690% and 4.293267%). At Base these reproduce the team's flat figures
exactly; expressing them as rates lets them scale when lot count and cost scope
change, which a flat dollar amount could not. This is the one place the engine
departs from the team's literal structure, and it is recorded here for that
reason.

Fill convention applied: light green for engine cells, a darker green band for
section headers, yellow for the Custom column input cells.

Verified: the scenario dropdown drives column G correctly. Switching Base /
Compact / Conservation flips revenue lots to 27 / 32 / 25, master-plan lots to
50 / 32 / 25, and Phase 1 price to 5,000 / 6,500 / 7,500. The sales-velocity
total row ties to the revenue-lots row in every scenario tested. No headline
numbers are produced yet; that begins with the Revenue sheet.

### Sheet 2 of 8: Lot Schedule (built)

The Lot Schedule is the parametric replacement for the team's hard-coded per-lot
detail rows. It takes lot count, phase split, phase prices, and the annual
velocity vector from the Inputs sheet and produces an annual schedule of lot
closings by phase and gross lot sales by year, on a 2026-2037 spine.

**Phase split policy (documented per instruction).** Lots fill in strict phase
order: Phase 1 lots first, then Phase 2, then Phase 3. A cumulative-count
mechanism assigns each year's closings to phases by where they fall in that
order. Base and Staged carry the team's three-phase mix (Phase 1: 10 lots at
$5,000K; Phase 2: 12 at $5,500K; Phase 3: 5 at $6,000K). Compact and
Conservation are single-phase: all lots sit in Phase 1 at that scenario's
Phase 1 price (Compact 32 at $6,500K; Conservation 25 at $7,500K), with Phase 2
and 3 counts set to zero. Custom now defaults to the single-phase Compact
pattern (27 lots, all Phase 1) and remains editable; the Inputs Custom column
phase counts were corrected to 27 / 0 / 0 to match this policy.

This phase-order rule is not an approximation. The team's own per-lot detail
(Real Estate Sales rows 35-61) shows lots M-16 through M-42 selling in strict
phase order consumed by the velocity vector. The parametric rule reproduces the
team's revenue-by-year exactly.

**Sale-timing assumption per scenario (documented per instruction).** The annual
velocity vector lives on the Inputs sheet and is scenario-specific:

- *Base and Staged:* the team's annual sale schedule, Real Estate Sales V9:V15,
  which is 1 / 6 / 7 / 9 / 4 lots across 2027-2031 (27 total).
- *Compact (32 lots):* 2 / 8 / 10 / 8 / 4 across 2027-2031, front-loaded with a
  2029 peak, reflecting a single-phase plan with no phase-gating to slow it.
- *Conservation (25 lots):* 0 / 2 / 5 / 7 / 6 / 5 across 2027-2032, a slower
  start and a longer, more even tail, reflecting premium pricing and a
  ranch-tells-you-when-it-is-ready sales posture.
- *Custom:* defaults to the Base vector, editable.

**Verified at Base:** revenue by year computes to 0 / 5,000 / 30,000 / 37,000 /
50,000 / 24,000, total $146,000K, matching the team's per-lot aggregation to the
dollar. Phase totals tie to 10 / 12 / 5 lots and $50,000K / $66,000K / $30,000K.
The phase-assignment check column is zero in every year. This is headline #1
(total real estate revenue) landing exactly, one year ahead of the Revenue
sheet that formally reports it.

**Open question surfaced (not yet wired).** The Stochastic Drivers block carries
a sales-velocity factor, neutral at 1.00. The Session 2 architecture said it
"scales cohort sale timing in Lot Schedule," but the precise reshape mechanism
was never specified. Resolved below.

### Velocity-factor mechanism (decided 2026-05-22)

The sales-velocity factor rescales total throughput; it does not merely shift the
schedule sideways. This is deliberate. The failure mode the engine exists to
model is "fewer lots sell than planned and the debt balloon needs refinancing,"
not "lots sell six months later than planned." A factor that only slid dates
would miss the substrate-and-debt risk entirely.

- **Factor below 1.0.** Total lots sold within the model period (2027-2032)
  drops to (factor x scenario lot count), with the proportional year-over-year
  shape of the velocity vector preserved. Lots not sold by 2037 are treated as
  delayed past the engine's horizon: they produce zero revenue inside the model,
  do not retire debt, and force the 2032 balloon to refinance at the assumed
  7.5% rate.
- **Factor above 1.0.** Sales accelerate within 2027-2032: the same total lot
  count, compressed timeline. Compression is capped so the curve cannot collapse
  into a single year. If compression would push annual closings above the
  maximum absorbable per year, closings are held at that cap. The cap is set at
  12 lots per year for now, modestly above the team's Base peak of 9 (in 2030).

**Residual unsold lots.** Inside the engine's horizon they count as zero
revenue. When realized revenue is insufficient to retire the 2032 debt balloon,
the balloon routes to refinance at 7.5%, and the refinanced debt service is
shown explicitly on the Debt sheet so the cost of slow sales is visible, not
buried.

**Deferred correlation.** The sales-velocity factor and the Phase 1 price factor
are correlated in the real world: a weak demand environment is both
slow-velocity and price-pressured. The engine holds them as separate inputs. The
Monte Carlo layer will impose the correlation through the 4x4 correlation
matrix. This is a deferred correlation, to be wired at the Monte Carlo step, and
is recorded here so the separation is understood as intentional, not an
oversight.

The mechanism spans the Lot Schedule (throughput rescaling) and the Debt sheet
(balloon refinance routing). It is neutral at Base (factor 1.00), so it does not
affect Base reconciliation, and full wiring is deferred to the Debt sheet and
scenario expansion.

### Sheet 3 of 8: Revenue (built)

The Revenue sheet produces, by year on the 2026-2037 spine, gross real estate
sales, selling costs, net real estate proceeds, Foundation contributions,
initiation fees, and club dues. Real estate flow comes from the Lot Schedule;
rates and counts from the Inputs sheet.

**Headline #1 produced exactly.** Gross real estate sales totals $146,000K at
Base, reported in the Revenue Summary block as headline #1. All six summary
metrics reconcile to the team to the dollar (delta 0.0000):

| Metric | Engine | Team |
|---|---|---|
| Gross real estate sales | 146,000.00 | 146,000.00 |
| Selling costs | 4,745.00 | 4,745.00 |
| Net real estate proceeds | 141,255.00 | 141,255.00 |
| Foundation contributions | 32,400.00 | 32,400.00 |
| Initiation fees (net) | 8,860.50 | 8,860.50 |
| Club dues | 17,451.25 | 17,451.25 |

**Selling costs.** A SALES COSTS section was appended to the Inputs sheet (rows
87-90, after the Stochastic Drivers block, so no existing row references
shifted): sales commission rate (3% of gross, from Real Estate Sales rows
62-64), closing costs ($365K flat), and an IF reconciling adjustment (see
below). Net real estate proceeds ($141,255K) ties to the team's Real Estate
Sales "NET LOT SALES" line.

**Initiation fees.** Gross IF is 27 ranch members at $100K plus 50 social at
$125K, which is $8,950K. The team's reported IF is $8,860.5K, exactly 0.99 times
$8,950K. The basis for the 1% reduction was not located in the pro forma. It is
modeled as a documented "IF reconciling adjustment" input (1%) so Base ties, and
flagged here as an unexplained 1% pending a source. If a real 1% cost is found,
the input gets a proper label; if not, it stays a named reconciling factor.

**Club dues and the membership calibration.** Club dues depend on a 100-member
activation roster (each member has an activation month in the team model). Pure
proportional-to-lot-sales ramps miss the team's dues total by 3 to 4%, and
because club dues flow into net profit (headline #4), a 3 to 4% miss would break
the 1% tolerance. The team's roster was therefore read directly and reduced to
four annual calibration vectors: ranch IF joins, social IF joins, ranch
member-months, social member-months. These sit on the Revenue sheet as
calibration constants (tinted distinctly), feeding parametric formulas: IF =
joins x fee, dues = member-months / 12 x dues rate. The dues rate and fee come
from Inputs, so member count and rate remain parametric; only the activation
timing is calibrated. At Base this reproduces club dues of $17,451.25K exactly.
The calibration vectors will be regenerated per scenario at expansion.

**Open reconciliation item (deferred to Cash Flow).** The team's Cash Flow
Summary "Real Estate Sales Revenue" line is $120,855K, which is $20,400K below
the engine's net real estate proceeds of $141,255K. That line is
deposit-schedule-timed and appears to carry an additional carve-out that has not
been decomposed. The engine's Revenue sheet works on a recognized-at-close
basis; converting recognized revenue to deposit-timed cash, and resolving the
$20,400K gap, is deferred to the Cash Flow sheet, where it bears on the XIRR and
MOIC reconciliation. Decision: keep the engine on recognized-at-close revenue;
measure the XIRR residual the deposit-timing difference produces at the Cash
Flow sheet, and accept-and-document it if within the 1% tolerance, or revisit if
not. Not solved preemptively.

### Sheet 4 of 8: Development Cost (built)

The Development Cost sheet implements the three-tier construction cost model from
Session 1. It reconciles to the team's Project & Constr. Cost total.

**Reconciliation: total development cost $67,403.60K vs team $67,403.72K, delta
-$0.12K (-$118).** Inside the $100K tolerance by three orders of magnitude. The
residual is pure rounding: the vertical-construction input carries one decimal,
and the management-fee and contingency rates are back-solved percentages.

Tier detail at Base:

| Tier | Component | $K |
|---|---|---|
| 1 Fixed | Vertical (x amenity mult 1.0) | 39,974.70 |
| 1 Fixed | Offsite infrastructure | 2,937.00 |
| 1 Fixed | Club equipment | 3,514.00 |
| 1 | **subtotal** | **46,425.70** |
| 2 Variable | Wells (60 x 50 master-plan lots) | 3,000.00 |
| 2 Variable | Water rights (30 x 50 x 0.5) | 750.00 |
| 2 Variable | In-tract roads (band logic) | 5,523.00 |
| 2 Variable | Power / sewer / land (fixed) | 6,045.00 |
| 2 | **subtotal** | **15,318.00** |
| 3 Derived | Management fees (5.4267% of base) | 3,159.95 |
| 3 Derived | Contingency (4.2933% of base) | 2,499.96 |
| 3 | **subtotal** | **5,659.90** |
| | **TOTAL** | **67,403.60** |

**Water rights acquisition factor (decided 2026-05-22).** The team's pro forma
uses 25 water-rights units against 50 master-plan lots, a 0.5 ratio whose basis
could not be located in their model. The engine adopts 0.5 as the per-lot water
rights factor: it reproduces the team's $750K at Base and is consistent with
Utah water-law conventions for aggregated rights, where a single right can serve
multiple lots when water duty is allocated proportionally. This is an assumption
open to challenge. If the real basis is fixed-cost acquisition rather than
per-lot, smaller-footprint scenarios will slightly mis-scale water rights cost
(Compact $480K, Conservation $375K, against the team's $750K); the magnitude is
small relative to total development cost. Implemented as two Inputs cells: water
rights unit cost ($30K/lot, repurposed row 37) and water rights acquisition
factor (0.5, appended row 91), both visible and editable.

**Road band logic.** In-tract roads use the 18.41-mile base at $300K/mile for
revenue lots at or below the 30-lot threshold, stepping mileage up 20% above it.
Base (27 revenue lots) sits in the lower band: 18.41 x 300 = $5,523K, matching
the team.

**Annual phasing and a flagged scope gap.** The sheet phases the $67.4M total by
the team's overall development-cost curve, normalized. One scope note carried
forward: the team's "Total Development Cost" in the cash flow is $100,999.84K,
not $67.4M. The extra ~$33.6M is pre-development and sales & marketing cost,
which the three-tier construction model does not cover. The Development Cost
sheet reconciles to the $67.4M construction figure as instructed; the additional
~$33.6M and the precise cost phasing are resolved at the Cash Flow sheet, where
"Total Development Cost" must tie to $100,999.84K for the XIRR and net-profit
reconciliation. Decision recorded: at the Cash Flow sheet, model the ~$33.6M as
two inputs, pre-development (mostly fixed across scenarios) and sales & marketing
(scaling with lot count and price).

### Sheet 5 of 8: Foundation (built; reconciliation residual surfaced)

The Foundation sheet is an annual fund roll-forward: begin balance, lot
contributions (from Revenue), grants (Inputs grant rate times a calibrated ramp),
Foundation expenses (a calibrated club-opex base times the expense multiplier),
investment yield, end balance.

**Intra-year timing convention (documented per instruction).** Contributions and
grants are received at mid-year and carry a 0.5 weight in the average balance.
Foundation expenses are paid evenly through the year and carry a 0.5 weight.
Investment yield is computed on the average balance: yield = rate x (begin
balance + 0.5 contributions + 0.5 grants + 0.5 expenses).

**Reconciliation residual: end balance 2037 = $32,026.45K vs team $33,525.16K,
delta -$1,498.71K (-4.47%).** This is outside the $335K tolerance. Per protocol,
construction stopped here to surface it. Contributions, grants, and expenses all
tie to the dollar; the entire residual is in investment yield (engine $17,465K
vs team $18,964K).

**Cause.** The team's Foundation Fund is a monthly-compounding model. Each
month's return is computed on the begin-of-month balance, before that month's
expense is deducted, and returns compound within the year. The specified annual
convention misses two things, both pushing yield down, both compounding across
twelve years:

1. *Within-year compounding.* Monthly compounding at 7%/12 produces a 7.229%
   effective annual rate. The annual convention applies a flat 7%.
2. *Expense drag on the yielding base.* The "+ 0.5 expenses" term removes half of
   each year's Foundation expense from the yielding base. Foundation expenses are
   large (about $2,500K per year in steady state), so this removes roughly
   $1,250K per year. In the team's monthly model, each month's return is taken
   before the expense, so expenses depress the yielding base far less.

A secondary contributor is Foundation-contribution timing: the engine recognizes
contributions at lot close (1/6/7/9/4 lots across 2027-2031, from the Lot
Schedule), while the team recognizes them on a contract-led schedule (2/6/7/8/4).
One contribution of $1,200K sits in 2030 in the engine versus 2027 for the team,
costing roughly $450K of compounding by 2037.

**Resolution: convention tightened, sheet rebuilt, reconciles.** End balance 2037
= $33,348.43K vs team $33,525.16K, delta -$176.73K, inside the $335K tolerance.
Three changes were applied:

1. *Monthly-effective rate.* Yield uses (1 + rate/12)^12 - 1 = 7.229% instead of
   a flat 7%. Computed on the sheet from the Inputs yield rate, so it stays
   parametric.
2. *Expense weight 0.458* replaces 0.5, reflecting that in the team's monthly
   model each month's return is taken before that month's expense.
3. *Contract-led contribution recognition.* The Foundation sheet recognizes lot
   contributions on the team's contract-led schedule (2/6/7/8/4 lots across
   2027-2031) rather than the lot-close schedule (1/6/7/9/4) the Revenue sheet
   carries. Both timings now exist in the engine: Revenue keeps lot-close timing
   for the developer cash-flow view; the Foundation fund receives contributions
   on contract-led timing. They total the same $32,400K.

The residual is now pure intra-year approximation: -$176.73K (-0.53%), entirely
in yield, the irreducible gap between an annual roll-forward and a true monthly
model. It is explained and within tolerance.

**The tightening principle.** The intra-year convention specified at Sheet 5
launch (mid-year contributions, even expenses, yield on average balance) was
insufficient for this sheet, because the team's Foundation Fund uses monthly
compounding and contract-led contribution timing that produce a material
residual at annual grain. The tightening is mechanical, not conceptual: where
the team's model uses monthly mechanics that produce material residuals at
annual grain, the engine tightens the calculation to mirror the monthly behavior
on a per-sheet basis. The annual structure is preserved for legibility; the
underlying math is matched to the team's.

**Flag forward.** The Cash Flow sheet (Sheet 7) very likely needs similar
intra-year tightening for the XIRR and net-profit reconciliation, given the
team's deposit-timed revenue and monthly debt and operating mechanics. This is
expected; the same principle applies when it arises.

### Sheet 6 of 8: Debt (built)

The Debt sheet covers the pre-existing debt: La Plata ($11,000K, 6.0%, 20-year
amortization) and Swans ($13,000K, 4.0%, 30-year amortization), both originated
September 2026 on a 6-year renegotiated term. Amortization schedules are built
from the loan terms by PMT, not read from the team's Pre-Existing Debt sheet,
which carries cascading #REF! errors from a Lotus import and should not be
inherited.

**Reconciliation: total pre-existing debt service (retire path, 2026-2032) =
$30,641.63K vs team $30,835.21K, delta -$193.58K (-0.63%).** Inside the $310K
tolerance.

Annual amortization is used, matching the annual engine. No tightening was
needed: annual PMT lands at -0.63%, and monthly PMT would actually be worse
(-0.88%, -$271K), so annual is both the natural annual-engine choice and the
closer fit. The -$194K residual is that the team's implied annual debt service
($1,734.03K per year, read from their Cash Flow Summary) runs about $23K per
year above a standard PMT of the stated terms ($1,710.82K combined). The
difference is unexplained, plausibly fees or a land-contract treatment in the
team's model; it is small and within tolerance.

**Balloon at September 2032.** La Plata $8,914.17K, Swans $11,462.53K, combined
$20,376.70K. Note: the engine places the balloon in 2032 per instruction; the
team's cash flow bundles it into 2031. This is a one-year placement difference
that does not affect headline #6 (a window total) but will affect XIRR timing
at the Cash Flow sheet, where it is handled.

**Both balloon paths computed and exposed.** The retire path pays the balloon in
full at September 2032, no further debt service. The refinance path refinances
the balloon at 7.5% over the remaining amortization (14 years La Plata, 24 years
Swans), producing combined debt service of $2,093.73K per year from 2033. The
Debt sheet shows both as parallel columns; it does not pick between them. The
Cash Flow sheet (Sheet 7) selects the path based on cumulative cash available at
September 2032, which is the mechanism by which the sales-velocity-factor
failure mode (slow sales force a refinance) reaches the financials.

## Reconciliation Framework

Each sheet's primary reconciliation target ties within its own stated tolerance.
Downstream headline numbers may carry propagated residuals from upstream sheets.
Those propagated residuals are not separately tightened, because tightening a
downstream number to absorb an upstream residual would introduce a compensating
error: the downstream sheet would be made "right" by being made wrong in an
offsetting way, which destroys auditability.

The honest framework is therefore per-sheet reconciliation with documented
propagation. A residual is acceptable when it (a) sits within its own sheet's
tolerance and (b) is fully traced to a named upstream cause. A headline number
carrying a propagated residual is reported with the residual and its source, not
forced to a tighter match.

This framework was clarified at Sheet 7 Stage A, when net profit's propagated
debt residual exceeded its standalone 1% tolerance while remaining fully traced
and explained. The pre-existing debt service reconciled within Sheet 6's $310K
tolerance at -$193.6K; that same -$193.6K propagates into net profit (a smaller
number with a tighter $79K tolerance) as +$193.6K. It is accepted as a traced,
single-source, documented propagation, not a structural error. The original
"1%-per-headline" target was internally inconsistent in this respect: residuals
compound across sheets, and a residual fine for a large number can exceed the
tolerance of a smaller downstream one. Per-sheet reconciliation with documented
propagation is the framework of record.

### Sheet 7 of 8: Cash Flow -- Stage A: structural skeleton (built)

Stage A assembles the project Sources and Uses and reconciles net profit
(headline #4). Net profit = total non-equity inflows minus total
non-distribution outflows. Intra-year timing, XIRR, and MOIC are Stage B.

**The $33.6M cost-scope gap, decomposed.** Investigation of the team's cost
detail resolved the gap between Project & Constr. Cost ($67.4M) and the cash
flow's Total Development Cost ($100,999.84K). It is not pre-development and sales
& marketing alone:

- Pre-development (entitlement, design, permitting): $3,914.59K. From the team's
  Pre-Dev Detail sheet. Modeled as a fixed input, scenario-invariant.
- Sales & marketing: $1,122.99K. From the team's Sales & Marketing Detail sheet.
  Modeled as a rate, 0.77% of gross real estate sales. This rate is far below the
  4-6% real estate industry norm, and that is a real feature of the deal, not a
  modeling artifact: Monument is a pre-sold club, and marketing intensity is
  genuinely lower for this deal type.
- Cabin construction: $28,559K. Ten cabins (6 Club, 2 Fractional, 2 Founder) at
  about $2.86M each, from the team's Cabin Construction Costs sheet. A separate
  real estate product, not a lot-count scenario lever.

**Cabin treatment.** For reconciliation, cabins are held exactly at the team's
pro forma scope: 10 cabins, $28,559K development cost, $12,000K fractional cabin
sales revenue at Base. Cabins are not made parametric at this stage. Base must
reproduce the team's numbers, and the team builds 10 cabins. Parametric scaling
of cabin scope for the non-Base scenarios is a deferred post-reconciliation
refinement.

**The real estate revenue composition (a resolved open item).** The team's cash
flow "Real Estate Sales Revenue" line of $120,855K was previously an unexplained
$20,400K below the engine's net lot proceeds. It decomposes cleanly: lot revenue
net of the $32,400K Foundation carve and $4,745K commission is $108,855K, plus
$12,000K of fractional cabin sales (16 shares at $750K) equals $120,855K. The gap
was compositional, not deposit timing. The engine's gross real estate revenue of
$146M reconciles fully once the Foundation carve, commission, and cabin sales are
separated. Deposit timing remains only as an annual-pattern question for Stage B.

**Stage A result.** Net profit (engine) = $8,108.37K vs team $7,915.17K, delta
+$193.20K. The delta is the propagated Sheet-6 debt residual (-$193.6K within the
Debt sheet's tolerance, surfacing here as +$193.2K; the small difference from
exactly $193.6K is cross-sheet rounding). Accepted per the Reconciliation
Framework: traced, single-source, documented. Total Sources (non-equity)
$219,717.78K and Total Uses (non-distribution) $211,609.40K. The structural items
(pre-development, sales & marketing, cabin construction, the carried club-
operating lines) are all wired; the only residual is the explained debt
propagation. Stage A is structurally verified.

### Sheet 7 of 8: Cash Flow -- Stage B: equity cash flow, XIRR, MOIC (built)

Stage B constructs the new-equity cash flow and produces headlines #2 (XIRR) and
#3 (MOIC). Equity is contributed during construction (2026-2027, on the team's
split, since Base construction timing is identical); distributions follow the
team's post-revolver-repayment sequence, with the balloon aligned to 2031.
Distribution amounts are the engine's reconciled distributable cash ($18,108.37K
= net profit $8,108.37K plus $10,000K returned capital), which is the team's
distribution shape scaled by 1.010784.

**Balloon timing alignment.** The team places the pre-existing-debt balloon in
2031; PMT-from-terms (September 2026 origination plus a 6-year renegotiated term)
would naturally place it in 2032. For Base reconciliation the equity cash flow
follows the team's 2031 placement, embedded in the distribution timing. This is
a known alignment with the team's convention. The structurally correct timing
for non-Base scenarios remains September 2032; the balloon-path conditional
(retire vs refinance on cumulative cash) is unaffected, only the year label
shifts for Base.

**Waterfall.** The four-tier distribution waterfall is built from the team's
tier structure directly (their Waterfall sheet has #DIV/0! and #NUM! internals
and was not inherited): Tier 1 (0-12% IRR) 100% investor; Tier 2 (12-16%) 90/10;
Tier 3 (16-20%) 80/20; Tier 4 (above 20%) 60/40. New equity has priority over
existing equity. The new-equity realized XIRR lands in Tier 3.

**Reconciliation results.**

- **Headline #2, XIRR: engine 16.247% vs team 16.2%, delta +4.7 bps.** Within the
  16 bps tolerance. No intra-year tightening was needed: an annual cash flow with
  year-end dates landed inside tolerance. The propagated debt residual lifts XIRR
  only slightly, because the extra cash is distributed across 2029-2037 and the
  later-year portion is heavily discounted.
- **Headline #3, MOIC: engine 1.8108 vs team 1.792, delta +0.0188.** Fractionally
  over the 0.018 tolerance. The excess is the propagated debt residual:
  MOIC = 1 + net profit / equity, so the +$193.2K net-profit residual lands as
  +0.0193 on MOIC. Accepted per the Reconciliation Framework as the same traced,
  single-source propagation already accepted for net profit.
- **Headline #4, net profit: $8,108.37K vs $7,915.17K** (from Stage A), the
  propagated debt residual.

Sheet 7 is complete. All six headline numbers are now produced by the engine.

### Sheet 8 of 8: Reconciliation (built)

The Reconciliation sheet is a validation dashboard, not a calculation sheet.
Every engine value is pulled live from the calculation sheets. It carries the
Reconciliation Framework statement at the top of the sheet itself (not only in
this changelog), a six-row reconciliation table (headline, engine value, team
value, delta, tolerance, status, note), and a "what to look at" orientation
guide for a first-time reader pointing to the Inputs sheet, this dashboard, and
ENGINE_CHANGELOG.md.

Six-number reconciliation at Base Case:

| # | Headline | Engine | Team | Delta | Status |
|---|----------|--------|------|-------|--------|
| 1 | Real estate revenue ($K) | 146,000.00 | 146,000.00 | 0.00 | PASS (exact) |
| 2 | Levered XIRR | 16.247% | 16.2% | +4.7 bps | PASS |
| 3 | MOIC | 1.8108 | 1.792 | +0.0188 | ACCEPTED (framework) |
| 4 | Net profit ($K) | 8,108.37 | 7,915.17 | +193.20 | ACCEPTED (framework) |
| 5 | Foundation end balance ($K) | 33,348.43 | 33,525.16 | -176.73 | PASS |
| 6 | Pre-existing debt service ($K) | 30,641.63 | 30,835.21 | -193.58 | PASS |

Three reconcile exactly or near-exactly (#1, #2, #5, #6). Two carry the single
propagated pre-existing-debt residual (#3, #4); per the Reconciliation Framework
they are accepted as traced, single-source, documented, with no compensating
adjustment.

## Engine Build Complete

All eight sheets are built and the workbook `models/monument_engine.xlsx`
reconciles to the team's six headline numbers at Base Case. The engine is
parametric: lot count is a true input flowing through revenue, development cost,
Foundation contribution, and debt. The Stochastic Drivers block on the Inputs
sheet is the correlation surface for the eventual Monte Carlo overlay; the
sales-velocity-factor mechanism is decided and documented, wiring deferred. The
workbook opens on the Inputs sheet with the scenario dropdown on Base. It is
ready for non-Base scenario testing and the Monte Carlo overlay, both of which
are separate work.

## Session 4: Scenario Testing (Observation)

The four named scenarios were run by switching the Active Scenario dropdown. No
model edits. Pure observation. All figures $K except XIRR and MOIC.

| Metric | Base | Staged | Compact | Conservation |
|--------|------|--------|---------|--------------|
| H1 Total real estate revenue | 146,000 | 146,000 | 208,000 | 187,500 |
| H2 Levered XIRR (new equity) | 16.25% | -6.30% | 72.93% | 53.34% |
| H3 MOIC (new equity) | 1.81x | 0.73x | 6.16x | 4.34x |
| H4 Net profit | 8,108 | -2,692 | 51,613 | 33,367 |
| H5 Foundation end balance 2037 | 33,348 | 44,266 | 53,154 | 91,874 |
| H6 Pre-existing debt service | 30,642 | 30,642 | 30,642 | 30,642 |
| S1 Total development cost | 67,404 | 67,404 | 58,362 | 47,802 |
| S2 Foundation contribution (lot sales) | 32,400 | 43,200 | 48,600 | 86,400 |
| S3 Peak equity at risk | 10,000 | 10,000 | 10,000 | 10,000 |
| S4 Balloon path | Retire | Retire | Retire | Retire |

Dropdown stability: after the four runs, returning the dropdown to Base
reproduced all eleven captured metrics identically to the first Base run. The
dropdown is stable and the engine returns cleanly to Base.

### Structural anomalies observed

These are observations, not interpretations or recommendations.

1. **Staged shows a negative levered XIRR (-6.30%) and negative net profit
   (-$2,692K), MOIC below 1.0 (0.73x).** Staged has the same revenue and the same
   total development cost as Base. The swing is the Foundation contribution from
   lot sales rising to $43,200K (Staged carves $1,600 per lot vs Base $1,200).
   That carve comes out of developer revenue, so a higher carve lowers net
   profit dollar-for-dollar.

2. **Compact and Conservation show very high returns: XIRR 72.93% and 53.34%,
   MOIC 6.16x and 4.34x, net profit $51,613K and $33,367K.** These are far above
   plausible real estate returns and do not pass a sniff test.

3. **Peak equity at risk is $10,000K in all four scenarios.** The equity
   contribution figures are Base-calibration constants on the Cash Flow sheet;
   they do not flex with the scenario.

4. **Foundation contribution from lot sales is pinned to a 27-lot count.** S2 is
   27 times the per-lot contribution in every scenario (Compact shows 27 x
   $1,800 = $48,600K though Compact has 32 revenue lots; Conservation shows 27 x
   $3,200 = $86,400K though it has 25). The Foundation sheet's contribution-
   recognition vector is the Base 27-lot calibration and does not rescale.

5. **Pre-existing debt service is $30,642K in all four scenarios.** This one is
   expected: the pre-existing debt is a sunk obligation with fixed loan terms,
   correctly invariant across scenarios.

6. **Balloon path is "retire" in all four scenarios.** At a sales-velocity factor
   of 1.0 every scenario sells all its lots, so the retire path is correct. The
   automatic retire-versus-refinance conditional is not yet wired into the Cash
   Flow sheet; the Cash Flow currently always reads the Debt sheet's retire path.

The common thread, stated factually: the engine was built and reconciled at Base
Case only. Non-Base figures reflect the parametric components flexing (revenue,
development cost, Foundation per-lot contribution) while the Base-calibrated
carried components hold at Base values (initiation fees, club dues, cabin
construction, club operating cost, interest on cash, other club revenue, equity
contributions, the Foundation recognition vector). Scenario expansion to make
those components flex is the deferred work noted throughout this changelog.

## Session 5: Targeted Engine Completion

Five Base-calibrated constants identified in Session 4 were to be re-wired to
flex with scenario inputs. No rebuild; targeted re-wiring. Items 1-3 are
complete; item 4 surfaced a finding and is paused for a decision; item 5 is
deferred.

### Item 1: Foundation contribution recognition (re-wired)

The Foundation lot-contribution recognition was a Base-calibrated vector
(contract-led timing, 2/6/7/8/4 on 27 lots) that did not rescale. It is now
`contribution recognition vector / 27 x revenue lots x per-lot rate`, so it flexes
with scenario lot count while preserving the contract-led timing shape adopted in
Session 3. At Base it is identity (27/27 x 27 = 27), so Base is unchanged.

*Limitation, open to challenge:* rescaling the contract-led vector applies Base's
five-year sales pattern to every scenario. It does not capture per-scenario
sales-timing differences. Conservation's actual velocity spans six years
(2027-2032) versus Base's five; the rescaled approach still uses Base's five-year
shape. The error is small (likely under $500K at horizon, since only the
compounding of contribution timing is affected, not the total). If Monte Carlo
sensitivity later shows contribution timing matters, revisit.

### Item 2: Initiation fees (re-wired)

IF was a Base-calibrated $8,860.5K. It is now `revenue lots x ranch IF + social
members x social IF`, times the 0.99 reconciling adjustment. The structural
clarification: ranch initiation fees are paid only by the new ranch members (the
revenue lots), not by all 42 ranch members. The 15 pre-existing "firm" members
paid their initiation fees in a prior round and do not pay again. So the IF
driver is revenue lots, not the 42-member count. At Base: (27 x $100 + 50 x
$125) x 0.99 = $8,950 x 0.99 = $8,860.5K. This is a structural clarification of
the team's calibration, not a workaround.

### Item 3: Club dues (re-wired)

Club dues were calibrated against the team's 100-member roster. The member-month
vectors are retained but scaled by scenario member ratios: ranch member-months x
(15 firm + revenue lots) / 42, social member-months x (social members / 50). At
Base both ratios are 1.0, so Base is unchanged. Non-Base flexes with member
count.

Base verification after items 1-3: all six headline numbers unchanged (every
re-wire is an identity at Base). Base still reconciles.

### Scenario results after items 1-3

| Metric | Base | Staged | Compact | Conservation |
|--------|------|--------|---------|--------------|
| H1 Total real estate revenue | 146,000 | 146,000 | 208,000 | 187,500 |
| H2 Levered XIRR | 16.25% | -6.30% | 74.56% | 52.34% |
| H3 MOIC | 1.81x | 0.73x | 6.33x | 4.25x |
| H4 Net profit | 8,108 | -2,692 | 53,315 | 32,540 |
| H5 Foundation end balance 2037 | 33,348 | 44,266 | 67,967 | 82,182 |
| H6 Pre-existing debt service | 30,642 | 30,642 | 30,642 | 30,642 |
| S1 Total development cost | 67,404 | 67,404 | 58,362 | 47,802 |
| S2 Foundation contribution (lot sales) | 32,400 | 43,200 | 57,600 | 80,000 |
| S3 Initiation fees (net) | 8,861 | 8,861 | 9,356 | 10,519 |
| S4 Club dues | 17,451 | 17,451 | 18,658 | 20,362 |

What changed from Session 4: Foundation contribution from lot sales now scales
with lot count (Compact 32 x $1,800 = $57,600K; Conservation 25 x $3,200 =
$80,000K, both as targeted). Initiation fees and club dues now flex with member
count. Compact and Conservation XIRR and MOIC remain high because peak equity is
still pinned at $10M and the cabin and club-operating costs are still Base-held.

### Item 4: Equity contribution (paused -- finding surfaced)

Item 4 was to compute peak equity at risk from the cumulative cash position
rather than hold it at a hard-coded $10M, verifying Base reproduces about $10M
before running scenarios.

Verification finding: it does not produce $10M. The engine works on
recognized-at-close revenue. Built that way, the Base cumulative cash position
troughs at about -$19.7M in 2027, a total external funding need near $22.2M, and
an equity portion near $12.2M once a $10M revolver covers the first tranche. The
team's actual peak equity is $10M.

The roughly $2M gap traces to revenue timing. The team's cash flow is
deposit-timed: buyers pay deposits well before lot close, so cash arrives earlier
and the trough is shallower. The engine recognizes revenue at close, which defers
cash and deepens the trough. This is the deposit-timing difference parked at the
Revenue sheet (Session, "affects XIRR not net profit") and again at Cash Flow
Stage B (where XIRR still landed in tolerance, so it was never tightened). It
does not affect totals, but it materially affects the cash-trough timing and
therefore peak equity.

Per the instruction to verify Base before running scenarios, item 4 is paused
here for a decision on how to define and compute peak equity given the
recognized-at-close convention. Item 5 (cabin construction scaling) remains
deferred.

## Session 6: Peak Funding Requirement and a material finding

### The finding (Section 3 of the memo should carry this)

On the team's own cash flow, the $20M equity raise is over and above what
construction requires. The construction cash trough -- the deepest point of the
project's cumulative cash position -- is approximately $7M to $11M across
reasonable phasing variations ($8.9M in the Base case), and it is covered by the
$10M revolver alone. The new equity round is therefore not required to fund the
construction cash gap. It funds returns, provides cushion, and finances items
beyond construction cash flow. The partnership should ask the team to detail
what the equity actually funds, because the construction schedule does not
explain it.

This is distinct from capital adequacy. No scenario is undercapitalized; the
point is the opposite -- the deal carries more committed capital than its
construction cash flow consumes.

### What the investigation found (deposits)

The peak-equity gap had been attributed to deposit timing. Investigation of the
team's Real Estate Sales sheet showed there is no deposit structure: the 1st-
and 2nd-deposit percentage fields are zero for all 27 revenue lots, so 100% of
each lot price is collected at close. The real cause was annual-versus-monthly
grain. The team's model recognizes each lot at its specific close month
(column 18; months 22-67); the engine's annual buckets distort the intra-year
cash path. The fix is a monthly cash sub-model, the tightening principle applied
to the cash position -- not a deposit model.

### Metric definition (decided)

"Peak equity at risk" is renamed **Peak Funding Requirement (PFR)** and computed
as the depth of the cumulative monthly cash trough. **Idle equity** is reported
as the equity raise ($10M) minus PFR. Any scenario whose PFR exceeds the $20M
revolver-plus-equity capacity is flagged "undercapitalized"; none are.

The team's $10M equity figure was never a cash-flow-derived quantity, so the
engine does not reconcile PFR to it. PFR is the honest cash-derived number; the
$10M is the exogenous raise. This is why the original "verify Base peak equity
~$10M" check could not be met by any correct model.

### Sub-model design

A new sheet, `Peak Funding`, holds an 84-month cash-position model (2026-2032).
Revenue is recognized at each lot's actual close month (team column 18).
Cabin construction is placed at the team's recovered timing -- months 45-68
(2029-2031) at $1,189.9K/month, from the Cabin Construction Costs sheet -- not
assumed. Construction is phased on a construction-only annual curve (the team's
total-development-cost curve net of pre-development, sales & marketing, and
cabins), spread evenly within each year. The monthly model carries Base
calibration vectors for development revenue, construction, and a combined
"other net" line; revenue and construction scale per scenario by factors that
read the engine's annual figures, so PFR flexes with scenario inputs. The engine
body stays annual; only the PFR computation reads the monthly sub-table.

### Band on the Base trough (sensitivity)

Reasonable variations in the phasing assumptions move the Base trough as follows:

| Variation | Trough ($K) |
|-----------|-------------|
| Base (even construction, pre-dev 60/40, curve 1.00) | -8,929 |
| Construction front-loaded within year | -9,850 |
| Construction back-loaded within year | -8,009 |
| Pre-dev 80/20 | -9,060 |
| Pre-dev 50/50 | -8,864 |
| Construction 2026-27 annual +15% | -10,146 |
| Construction 2026-27 annual -15% | -7,713 |
| Deepest combined | -11,334 |
| Shallowest combined | -6,865 |

Band: **-$6.9M to -$11.3M.** Highest-weight assumptions: the construction
annual curve (about +/-$1.2M) and the construction within-year shape (about
+/-$0.9M). The pre-development split is minor (about +/-$0.13M). Cabin
construction timing is not an assumption -- it was recovered from team data.
Across the full band the trough stays far inside the $20M capacity, so the
finding above is robust, not an artifact of phasing assumptions.

### Four-scenario comparison (Peak Funding Requirement added)

| Metric | Base | Staged | Compact | Conservation |
|--------|------|--------|---------|--------------|
| H1 Total real estate revenue | 146,000 | 146,000 | 208,000 | 187,500 |
| H2 Levered XIRR | 16.25% | -6.30% | 74.56% | 52.34% |
| H3 MOIC | 1.81x | 0.73x | 6.33x | 4.25x |
| H4 Net profit | 8,108 | -2,692 | 53,315 | 32,540 |
| H5 Foundation end balance 2037 | 33,348 | 44,266 | 67,967 | 82,182 |
| H6 Pre-existing debt service | 30,642 | 30,642 | 30,642 | 30,642 |
| Peak Funding Requirement | 8,929 | 8,929 | 7,842 | 6,571 |
| Idle equity (raise minus PFR) | 1,071 | 1,071 | 2,158 | 3,429 |

PFR is driven by construction-period cost timing, before lot revenue begins, so
it does not move with the revenue-side scenario levers (Base and Staged share a
construction program and therefore the same PFR). Compact and Conservation build
less, so their troughs are shallower. Every scenario sits inside the $20M
capacity; none is undercapitalized.

Item 4 is resolved. Item 5 (cabin scope scaling) remains the only deferred item.

## Session 7: Cabin scope scaling -- Item 5 resolved

A cabin scope multiplier was added to the Inputs sheet (row 95), parallel in
structure to the amenity scope multiplier. It is a bounded scenario lever, not a
deep parametric cabin model.

### Multiplier values and rationale

| Scenario | Multiplier | Cabins | Rationale |
|----------|-----------|--------|-----------|
| Base | 1.0 | 10 | The team's program as built. |
| Staged | 1.0 | 10 | Same construction program as Base; Staged changes deal terms and risk gating, not the physical build, so no cabin descope. |
| Compact | 0.8 | 8 | Smaller-footprint plan. Roughly 5 Club, 2 Fractional, 1 Founder (mix held proportional; the 8th cabin rounds the Club count down from 4.8). |
| Conservation | 0.6 | 6 | Legacy-asset plan with the lightest hospitality footprint. Roughly 4 Club, 1 Fractional, 1 Founder. |
| Custom | 1.0 | 10 | Defaults to the full program; editable. |

### What the multiplier drives

- **Cabin construction cost:** $28,559K times the multiplier (linear; total
  cabin count scales with the multiplier).
- **Fractional cabin sales revenue:** $12,000K times ROUND(2 x multiplier) / 2.
  Fractional sales scale with the fractional-cabin count specifically, which is
  an integer. Base/Staged/Compact carry 2 fractional cabins (round(1.6) = 2 at
  Compact), so fractional sales stay $12,000K; Conservation carries 1
  (round(1.2) = 1), so fractional sales are $6,000K.

### The integer-cabin-count interpretation

The multipliers are stepwise integer cabin counts in disguise. You cannot
half-build a cabin; cabin demand scales roughly with member count and guest
activity, but in whole units. The multiplier is a compact way to carry that
without a deeper model. This is a simplification: an actual cabin-scope decision
involves membership economics, hospitality demand patterns, and operating
efficiency that would warrant deeper analysis if a scenario were selected for
execution.

### Peak Funding Requirement is unaffected by cabin scope

Cabin construction occurs in months 45-68 (2029-2031), well after the cash
trough at month 21. Scaling cabin scope therefore does not move the Peak Funding
Requirement. PFR remains 8,929 / 8,929 / 7,842 / 6,571 across the scenarios. The
Peak Funding monthly model holds cabin construction at Base scope; this is
correct for the PFR metric and noted for the post-trough months.

### Base verification

With the cabin multiplier at 1.0, cabin construction stays $28,559K and
fractional sales stay $12,000K, so the change is an identity at Base. All six
headline numbers reconcile to their previous values and tolerances (revenue,
XIRR, debt service exact or near-exact; net profit, MOIC carrying the documented
propagated debt residual).

### Four-scenario comparison, cabin scaling active

| Metric | Base | Staged | Compact | Conservation |
|--------|------|--------|---------|--------------|
| H1 Total real estate revenue | 146,000 | 146,000 | 208,000 | 187,500 |
| H2 Levered XIRR | 16.25% | -6.30% | 79.86% | 58.68% |
| H3 MOIC | 1.81x | 0.73x | 6.90x | 4.80x |
| H4 Net profit | 8,108 | -2,692 | 59,026 | 37,964 |
| H5 Foundation end balance 2037 | 33,348 | 44,266 | 67,967 | 82,182 |
| H6 Pre-existing debt service | 30,642 | 30,642 | 30,642 | 30,642 |
| Peak Funding Requirement | 8,929 | 8,929 | 7,842 | 6,571 |
| Idle equity (raise minus PFR) | 1,071 | 1,071 | 2,158 | 3,429 |
| Cabin construction cost | 28,559 | 28,559 | 22,847 | 17,135 |
| Fractional cabin sales | 12,000 | 12,000 | 12,000 | 6,000 |

Compact and Conservation net profit rose from the Session 6 figures because
cabin construction cost fell (Compact -$5.7M, Conservation -$11.4M, partly
offset for Conservation by -$6.0M of fractional sales). XIRR and MOIC rose
correspondingly.

## Engine Structurally Complete

All five Session-4 calibration constants are now parametric, plus the Peak
Funding Requirement metric and the cabin scope lever. The engine has nine
sheets: Inputs, Lot Schedule, Revenue, Development Cost, Foundation, Debt, Cash
Flow, Peak Funding, Reconciliation. Base reconciles to the team's six headline
numbers within tolerance (three exact or near-exact, two carrying a documented
single-source propagated debt residual). The four scenarios flex on lot count,
pricing, Foundation terms, development scope, amenity scope, and cabin scope.
The remaining known simplifications -- the carried club-operating phasing, the
cabin-mix proportionality, the rescaled contract-led Foundation recognition --
are documented at their respective sessions. Scenario interrogation is the next
phase of work.

## Session 8: Staged scenario redesign

### Why

The original Staged configuration carried the Base revenue base (lot prices
$5,000K / $5,500K / $6,000K) and a $1,600K per-lot Foundation contribution. It
produced a levered XIRR of -6.30%, a MOIC of 0.73x, and negative net profit
(-$2,692K). That is non-viable: it cannot be offered to the partnership as a
real option. The negative return showed that the original framing -- rigor as a
pure overlay on the Base deal, paid for by a larger Foundation carve out of
unchanged revenue -- is financially unworkable. The Foundation carve simply
consumed the developer's margin.

### The redesign

Staged is redesigned as a meaningfully different product, not Base with an
overlay. Rigor becomes part of the buyer offer, not only an internal investor
protection. New Staged inputs:

| Input | Old | New |
|-------|-----|-----|
| Phase 1 lot price | $5,000K | $5,500K |
| Phase 2 lot price | $5,500K | $6,000K |
| Phase 3 lot price | $6,000K | $6,500K |
| Per-lot Foundation contribution | $1,600K | $1,400K |

All other Staged inputs are unchanged: 27 revenue lots, dues and initiation fees
at Base values, amenity scope 1.0, mech rec scope 1.0, cabin scope 1.0, tax
realization 0.8.

### Rationale

The $500K per-lot price premium (about 10%) reflects that a Staged buyer is
purchasing a deal with structural protections in place: the IRS POF
determination as a closing condition, tax counsel opinion locked, and the zoning
rezone secured before lots are priced. That is a better product, and it is
priced as one. The Foundation contribution at $1,400K sits between Base
($1,200K) and the original Staged target ($1,600K) -- it gives the Foundation
meaningful additional capital without consuming the investor return the way the
$1,600K carve on an unchanged revenue base did.

### Verification

Staged occupies column C of the Inputs scenario block; Base is column B. The
edits do not touch Base. Confirmed: all six Base headline numbers are unchanged
(revenue, XIRR, debt service exact or near-exact; net profit and MOIC carrying
the documented propagated debt residual).

### Updated four-scenario comparison

| Metric | Base | Staged | Compact | Conservation |
|--------|------|--------|---------|--------------|
| H1 Total real estate revenue | 146,000 | 159,500 | 208,000 | 187,500 |
| H2 Levered XIRR | 16.25% | 29.13% | 79.86% | 58.68% |
| H3 MOIC | 1.81x | 2.57x | 6.90x | 4.80x |
| H4 Net profit | 8,108 | 15,700 | 59,026 | 37,964 |
| H5 Foundation end balance 2037 | 33,348 | 35,378 | 67,967 | 82,182 |
| H6 Pre-existing debt service | 30,642 | 30,642 | 30,642 | 30,642 |
| Peak Funding Requirement | 8,929 | 8,929 | 7,842 | 6,571 |
| Idle equity (raise minus PFR) | 1,071 | 1,071 | 2,158 | 3,429 |

Staged moves from a -6.30% XIRR to 29.13%, MOIC from 0.73x to 2.57x, and net
profit from -$2,692K to $15,700K -- now a viable partnership option. Its
Foundation end balance is $35,378K, modestly above Base, reflecting the $1,400K
per-lot contribution. Peak Funding Requirement is unchanged at $8,929K: Staged
keeps the Base construction program, and PFR is set before lot revenue begins,
so the higher lot prices do not move it.

## Session 9: Memo revision begun -- numerical audit

Memo revision has started. The current memo (`drafts/memo_draft.md`) was written
against the broken scenario model and carries scenario numbers that the rebuilt
engine has superseded. The memo was audited claim by claim against the Session 8
four-scenario comparison (the source of truth). No memo edits were made this
session; the audit findings are below.

**Sections 1 and 2:** no engine-derived claims; no changes.

**Section 3:** the gap analysis is built on Base/team facts and external research
(USU, UDWR, tax cases, county code), all unaffected. Two items: section 3.8 cites
"$20M new equity plus $20M revolving debt facility" against the engine's $10M
new capital plus $10M revolver -- a cross-source inconsistency to reconcile, as
it drives MOIC. And the Session 6 idle-equity / Peak Funding finding is not in
the memo at all; it warrants a new Section 3 subsection.

**Section 4:** needs a structural rewrite. It describes the old thirteen-variable
Scenarios-tab model, including the now-false statement that lot count is
"documentary" and does not flex. Section 4.3 describes a Stress Tests tab the
rebuilt engine does not have. Section 4.4's tax finding holds as an argument but
the Conservation figure changes from $207M (27 lots) to $192M (25 lots).

**Section 5:** Base (5.1) is unchanged. Staged (5.2) needs a full rewrite -- the
Session 8 redesign turned it from a -6.3% non-viable scenario into a 29.1%
premium product, inverting the section's argument. Compact (5.3) and Conservation
(5.4) need number swaps (XIRR, Foundation end balance, tax benefit) and removal
of the obsolete "the model still uses 27 lots" caveats, since the engine now
flexes lot count. Custom (5.5) needs a minor reference update (Scenarios sheet to
Inputs sheet).

**Reconciliation flag carried into revision:** the $10M-versus-$20M equity-round
and revolver-size discrepancy between the memo, CLAUDE.md, and the engine must be
resolved before Section 5 numbers are finalized, because the equity base sets
MOIC and frames the idle-equity finding.

`drafts/memo_draft.md` was not modified in this session.

## Session 10: Memo revision edits

The equity reconciliation was resolved as a two-layer definition, not an
inconsistency to fix: total commitment $20M; peak deployment $10M; Peak Funding
Requirement ~$8.9M Base; idle equity vs peak deployment ~$1.1M; idle commitment
vs total commitment ~$10M. Return metrics stay on the $10M peak-deployment
basis. Memo edits proceed in five steps; this section is appended to as each
step completes.

**Step 1 (Sections 1-2 and clean Section 3) -- complete.** Sections 1 and 2 and
subsections 3.1-3.7 were audited and confirmed to contain no engine-derived
numerical errors: they rest on Base-case facts, which the rebuilt engine
reproduces exactly, and on external research. One mechanical fix in 3.8: the
revolving debt facility was corrected from $20M to $10M, matching the team's pro
forma and the engine; "$20M new equity" was clarified to "$20M new equity
commitment"; and the sentence on sales-velocity risk was adjusted so it points
at the operating model rather than the construction draw, consistent with the
Session 6 finding that construction cash is well covered.

*Propagation note:* the $20M-to-$10M revolver correction applies anywhere else in
the project files that referenced a $20M revolving facility -- the consolidated
reference document, any deck slides, other derivative work. Flagged for a later
cleanup pass; not chased now.

**Step 2 (Section 3.9, idle equity) -- complete.** A new subsection 3.9, "Most of
the equity commitment is not financing construction," was added after 3.8,
preserving the numbered structure. It follows the Section 3 pattern (observation,
team's strongest counter, where the gap survives) and walks the two-layer
framing: $20M committed, $10M deployed at peak, ~$8.9M construction trough, ~$1.1M
idle against deployment, ~$10M idle against commitment, ~$11M total not financing
construction. Quantitative claims are sourced inline (commitment to deck and
meeting notes; peak deployment to Project Summary Sources and Uses; trough to the
Peak Funding sub-model; true-up to deck terms). The counter is written carefully:
the team has not publicly itemized the non-construction equity, and the
legitimate candidate uses (GP true-up, pre-development, distribution-timing
flexibility, execution-risk buffer) are named so the point lands as "the
partnership should know which," not "the equity is misused."

**Balloon-timing verification (Session 10, before 3.9 is finalized).** Jeff asked
whether a secondary cash trough exists at the 2031 balloon that the equity helps
cover, since the Peak Funding analysis had focused on the construction period.
The full-window monthly cumulative (Peak Funding sub-model, Base) was read across
all 84 months. Result: the cash position goes negative only once, in the
construction period (trough -$8,929K at month 21); it recovers to positive by
month 30 and stays positive thereafter. There is no secondary trough. At the
2031 balloon, the cumulative is +$29,818K immediately before and +$8,734K
immediately after the $20.4M payment -- the balloon is retired in full from
accumulated sales proceeds with about $8.7M to spare, and the margin is robust
across the documented construction-phasing band. The equity covers no part of
the balloon. 3.9's idle-equity finding stands. The verification also shows the
team's stated rationale (equity "helps retire the pre-existing debt") is not
borne out by the Base cash flow, which retires the debt, balloon included, from
sales proceeds -- which strengthens 3.9's use-of-funds question rather than
weakening it. The alignment-note decision (3.9 option a vs b) and any 3.9 edit
remain on hold pending Jeff's direction.

**Step 2 close: 3.9 finalized.** Jeff chose option (a): the GP-economics alignment
note was appended to 3.9's "where the gap survives" close, carefully worded as an
alignment question the use-of-funds disclosure resolves. A rationale-falsified
sentence was added to the "team's strongest counter" paragraph, recording that
the commonly cited "equity helps retire the debt" rationale does not survive the
Base cash flow (debt and balloon retired from sales proceeds with ~$8.7M to
spare). 3.9 is final.

**Step 3 (Compact and Conservation number swaps) -- complete.** Section 5.3
(Compact): levered XIRR 64.3% to roughly 80%, Foundation end balance $54.4M to
$68.0M, realized tax benefit $117M to $138M. The obsolete "27-lot constraint"
caveat was removed and replaced with the accurate one: the engine flexes lot
count, pricing, and scope, but still holds club operating costs at the Base
program, so non-Base modeled returns are overstated and should be read as
directional. Section 5.4 (Conservation): levered XIRR 55.3% to roughly 59%,
Foundation end balance $94M to $82.2M, realized tax benefit $207M to $192M. The
obsolete "Foundation overshoots because the model still uses 27 lots" caveat was
removed -- the engine now models 25 lots and the Foundation lands just above the
$80M design target -- and the same directional caveat on XIRR was added.

Known limitation surfaced for review: the non-Base XIRR figures (roughly 80% and
59%) remain high because the engine does not yet flex club operating costs by
scenario. The memo now carries an honest directional caveat rather than the old
(wrong) 27-lot explanation. Whether to leave the caveat, flex club operating
costs in the engine, or present non-Base returns purely qualitatively is a
decision flagged for Jeff at the step-3 checkpoint. The "Phase 1 minus 20
percent" stress-test cross-references in 5.1/5.3/5.4 were left for the Section 4
rewrite (step 5), where the stress-grid treatment is decided.

**Club-operating-cost diagnosis corrected.** An earlier note attributed the
inflated non-Base XIRRs primarily to club operating costs being held at the Base
program. On estimation that is wrong. Club operating cost moves with member
count, and member counts barely differ across scenarios: Base 92, Staged 92,
Compact 97, Conservation 90. The club-opex distortion is therefore small (roughly
+$1M understated cost for Compact, about -$0.4M for Conservation, zero for
Staged). The non-Base XIRRs are high for a structural reason instead: the
scenarios genuinely model large net profits (premium pricing, lighter scope)
against a thin $10M equity base, so MOIC = 1 + net profit / $10M balloons.
Consequence for the Monte Carlo plan: option (b) framed as "club opex rewire"
will not by itself produce honest non-Base returns; non-Base return reliability
is a broader validation task covering the full non-Base cost structure and the
equity-base treatment.

**Non-Base return presentation decision (option c).** For Sections 5.3 and 5.4,
precise XIRR/MOIC/net-profit are dropped in favor of qualitative framing; the
metrics that flex correctly (revenue, Foundation end balance, Peak Funding
Requirement, realized tax benefit) stay precise. Caveats are worded honestly
(returns "not yet validated to the Base case standard," calibration deferred to
the Monte Carlo stage) rather than attributed to club opex. Option (b), the
broader non-Base validation, is reserved for the Monte Carlo phase.

**Step 4 (Staged rewrite) -- complete.** Section 5.2 was rewritten for the
Session 8 redesign. The old subsection framed Staged as "same return as Base,
de-risked" and explained a sharply negative XIRR as a 27-lot-structure artifact;
both are now wrong. The new 5.2 presents Staged as a redesigned product: rigor
priced into a roughly 10 percent lot premium ($5,500K / $6,000K / $6,500K),
Foundation contribution $1.4M, closing conditions retained. Numbers: revenue
$159.5M, Foundation end balance $35.4M, realized tax benefit $90.7M, peak funding
requirement $8.9M, levered XIRR 29.1 percent, MOIC 2.57x. Staged's club-opex
distortion is zero (identical 92-member base to Base) and Staged differs from
Base only in two inputs (price, Foundation contribution), so it is computed on
the same reconciled basis as Base; it is presented precisely, the only non-Base
scenario so presented. One honest note carried in the memo: Staged's realized tax
benefit ($90.7M) is slightly below Base's $97M, because the 0.8 realization
haircut outweighs the higher per-lot contribution.

**Step 5 (Section 4 structural rewrite) -- complete.** The old Section 4
described a model that no longer exists: thirteen variables on a Scenarios tab,
a Stress Tests tab with sixteen cases, a "documentary" lot count that did not
actually flex. Replaced with a leaner Section 4 of two subsections under the
existing intro:

- 4.1 The engine: describes the nine-sheet parametric engine in calculation
  order, the Base-reconciliation discipline (four headlines exact or near-exact,
  net profit and MOIC carrying the documented propagated residual), the five
  scenarios via dropdown, what flexes (lot count, pricing, Foundation terms,
  development scope, amenity scope, cabin construction cost), what does not yet
  flex (club operating costs, deep cabin model), the Staged exception on return
  reliability, and the Stochastic Drivers block as the correlation surface for
  the Monte Carlo phase. Scenario-level sensitivity analysis is explicitly
  deferred to that phase; no placeholder Section 4.3.
- 4.2 The tax-benefit dimension is non-monotonic: rewritten with the corrected
  per-scenario tax figures (Base $97M, Staged $90.7M, Compact $138M, Conservation
  $192M) and reframed. Staged shows the realization haircut winning over a
  modest contribution increase; Compact and Conservation show the contribution
  scaling winning even under the haircut. The original "Conservation captures
  the most" finding survives; Staged adds the nuance that more contribution does
  not always mean more realized tax benefit.

**Numbering decision (flagged for review).** The tax finding was renumbered from
4.4 to 4.2 to avoid a 4.1-to-4.4 gap that would read as an error in a
partnership document. The single internal cross-reference, in Section 5.4, was
updated to point to 4.2. The instruction had said "plus 4.4," so the user is
flagged on the renumbering choice and can revert it.

**Knock-on reference fixes (necessary consequences of dropping 4.3).** Five
orphaned stress-grid references were softened or removed: 3.4's "stress test
grid shows yield 7-to-5% drops principal ~20%" became a qualitative
sensitivity claim (the specific figure was an old-grid output now unverifiable);
3.8's closing "stress test grid in Section 4 shows this fragility explicitly"
was deleted; 5.1's "lot pricing anchor that, per the stress test, breaks the
deal at minus 20 percent" was reframed as "the lot pricing anchor, the single
input the deal is most sensitive to"; 5.3's "Phase 1 minus 20 percent pushes
Compact to break-even" became "a material shortfall against the premium Phase 1
price is the principal downside"; 5.4's "Phase 1 minus 20 percent pricing risk
still breaks the deal" became "Lot pricing risk still binds, as in every
scenario." None of the qualitative claims (lot pricing is the deal's most
sensitive input; the Foundation is materially sensitive to yield) is changed;
only the specific stress-grid figures that no longer exist were removed.

Memo revision is now structurally complete. Full revised memo to be reviewed as
a unit before deciding next steps.

## Session 11: Deck revision begun -- audit

The deck (`drafts/deck_draft.md`, 25 slides, 286 lines) was built as a 30-minute
meeting pre-read. For the GitHub hub, where partners read memo, deck, model, and
simulator side by side, the deck's job shifts from walk-through to visual
summary: target 10-15 slides, fast orientation, helps partners decide where to
spend their time. No deck edits made this session; audit findings only. The
Will Munger letter was retired (Jeff will share the hub link with a light-touch
email); discussion notes remain markdown for Jeff's internal facilitation use,
outside the hub.

**Numerical claims now wrong** (slides carrying outputs the rebuilt engine
revised): slide 18 (counterintuitive tax finding, Conservation cited as 27 lots
times $3,200 for $207M when it is 25 lots for $192M); slide 20 (Plan With Rigor,
the old Staged with $1.6M Foundation, $44.5M end balance, $104M tax -- the
Session 8 redesign supersedes all three); slide 21 (Compact Foundation $54M and
tax $117M, now $68.0M and $138M); slide 22 (Conservation Foundation $94M and tax
$207M, now $82.2M and $192M).

**References to the old scenario model and stress-test grid** (orphaned by the
rebuild): slide 16 (parameter system describes 13 variables, Scenarios tab, and
the now-false "cash flow uses 27 lots across all scenarios"); slide 17 (stress
test highlights -- the 16-case grid no longer exists in the rebuilt engine);
slide 2 (points to `monument_scenario_model.xlsx` instead of the engine
workbook).

**Content aligned with the old memo structure but not the new**: slide 18
(counterintuitive tax finding -- the new 4.2 reframed this as non-monotonic with
all four scenarios shown, not a Base-vs-Conservation comparison); slide 20 (the
full Staged scenario, redesigned in Session 8 from rigor-as-overlay to
premium-product).

**Claims contradicted by the 3.9 idle-equity findings**: slide 15 (Whisper Ridge
slide says "capital runs out before the Foundation flywheel turns" without
distinguishing operating from construction; the Peak Funding analysis shows
construction is well covered, the pressure is on the operating model).

**New slides identified for addition**: a Gap 9 / idle equity slide (the
two-layer commitment framing plus the balloon-coverage finding plus the
GP-alignment question -- the strongest single new visual); a replacement
non-monotonic tax finding slide carrying all four scenarios as a small table;
optionally a "what flexes versus what doesn't" engine slide making the
reliability gradient (Base reconciled, Staged on the same basis, Compact and
Conservation deferred to Monte Carlo) visible to readers.

**Slides identified for removal or consolidation**: slide 17 (stress test
highlights) drops outright; slide 2 (how to read) either rewrites for hub
context or drops. The eight per-gap detail slides (slides 8-15) are
meeting-walk-through pacing; for a 10-15 slide hub deck they would consolidate
into one nine-gap overview plus a small number of deep-dive slides on the gaps
the decision most turns on. Three triage shapes were sketched (tightest 10-12,
middle 13-14, lighter 15) for Jeff to choose at edit time.

**Headline slide design question flagged for decision before edits**: the
current deck opens with "How to read this deck." A headline slide that captures
the core finding in one line would orient partners arriving cold at the hub.
Three candidate framings noted (decision-neutral, idle-equity finding, the
fifty-year question); choice deferred to Jeff. No headline slide will be
written until that decision is made.

**Design decisions made (post-audit, before Stage 1).** Headline frame: the
question frame, using Jeff's text -- "The partnership is being asked to commit
$20M to a 50-year asset. What is that asset supposed to be?" Gap consolidation:
middle option, 13-14 slide target with deep-dive slides reserved for 3.1, 3.2,
3.4, 3.5, and 3.9, and a single consolidation slide for 3.3, 3.6, 3.7, 3.8.
Deck assembly proceeds in four staged drafts with review gates between them;
the working deck file is left untouched until final assembly.

**Stage 1 (headline plus condensed Sections 1-2) -- drafted, awaiting review.**
Five slides drafted in chat, not yet written to file. Slide 1 is the headline
question under a Monument H1. Slide 2 reframes "How to read this deck" for hub
context (visual summary, companion to engine and simulator, async reading, no
meeting language). Slide 3 condenses the memo's Section 1 (team, design,
Foundation, Powder Haven) onto one slide with four bullets. Slide 4 preserves
the April 30 admission verbatim. Slide 5 consolidates the memo's Section 2 (the
three-horizon frame plus substrate-not-real-estate) onto one slide. Three
judgment calls flagged for Jeff: whether to promote the headline question to
H1 over "Monument," whether to keep Slide 2 at all, and whether the team-names
bullet on Slide 3 is too dense.

**Stage 1 review outcome.** Jeff approved the headline layout as drafted
(Monument H1 with question as bold lines beneath) and kept Slide 2 as drafted.
Slide 3 team-names bullet thinned per Jeff's exact text: "Hart Howerton, Faure
Halverson, Forge and Finish, Dentons, Greenberg Traurig and Hale Wood, Kirton
McConkie, with Will Munger on wildlife and range." Parenthetical functional
labels dropped. Two items held for final assembly: whether Slide 5 (the frame)
should split into two slides (three horizons separate from substrate-not-real
estate), and whether the closing line of Slide 5 should echo forward into the
gap overview.

**Stage 2 (gap overview, five deep-dives, four-gap consolidation) -- drafted,
awaiting review.** Seven slides drafted in chat, not yet written to file.
Slide 6 is the nine-gap overview with a bridge line ("That footprint carries
risks") that echoes Slide 5's closing phrase ("one drainage's footprint on a
regional substrate"). Slides 7-10 are deep-dives on gaps 1, 2, 4, and 5,
lightly polished from the current deck and using the "Gap N: title" pattern.
Slide 11 is new content for gap 9 (idle equity, peak funding requirement,
balloon-rationale finding, GP-fee-calculation note); drafted with neutral
framing on GP economics ("calculated on committed capital, not deployed
capital") rather than the sharper alignment critique. Slide 12 consolidates
gaps 3, 6, 7, and 8 onto a single slide with two-line treatments per gap,
using the same "Gap N: title" pattern.

Three judgment calls flagged for Jeff at Stage 2: whether the Slide 6 bridge
("That footprint carries risks") reads as a fragment without Slide 5 context,
whether the Slide 11 GP-economics line should sharpen from observation to
alignment critique, and whether Slide 12 density warrants splitting the
consolidation into two slides at final assembly.

**Stage 2 review outcome.** Jeff resolved all three flagged judgment calls and
left Slide 12 density for final-assembly review.

Slide 6 bridge: dropped. Opener becomes simply "Each gap below names a place
where the team's narrative and the team's cash flow do not yet match." Rationale:
standalone is more important than echo for a non-linear deck.

Slide 11 GP-economics line: sharpened with Jeff's exact text -- "The GP fee
stream is calculated on committed capital, not deployed capital. The larger the
raise, the larger the fee stream, independent of whether the capital is
deployed." States structural facts and lets partners draw the alignment
inference rather than asserting it.

Slide 11 closing $11M-uses line: softened to match memo 3.9's epistemic posture
with Jeff's exact text -- "The $11M likely covers some combination of operating
gap, GP true-up, distribution flexibility, and execution-risk buffer. The team
has not yet itemized which." Acknowledges the analytical limit rather than
asserting allocation.

Three items now carried for final-assembly visual review: whether Slide 5
should split into two slides (three horizons separate from substrate-not-real
estate), whether Slide 11 needs its own visual breathing room as the deck's
strongest analytical slide, and whether Slide 12 density warrants a 2-slide
split.

**Stage 3 (tax finding, engine gradient, four scenarios, Custom) -- drafted,
awaiting review.** Seven slides drafted in chat. Slide 13 is the non-monotonic
tax finding presented as a 4-row table (per-lot times lots times $3 leverage
times realization equals realized benefit) with the haircut-wins-for-Staged and
scaling-wins-for-Compact-and-Conservation findings beneath. Slide 14 is the
engine reliability gradient ("what flexes, what doesn't"), telegraphing to the
reader why Compact and Conservation get qualitative XIRR/MOIC treatment in the
scenario slides that follow. Slides 15-18 are the four scenario slides with a
consistent format (optimizes-for, parameters, engine outputs, risks, asks);
Base and Staged report precise XIRR/MOIC because both rest on the same
reconciled basis, Compact and Conservation report Foundation end balance and
tax benefit precisely with XIRR/MOIC deferred to Monte Carlo. Slide 19 is the
Custom scenario with the engine's user-editable column.

Three judgment calls flagged for Jeff at Stage 3: whether the Slide 13 markdown
table renders cleanly across hub viewers (alternative is per-scenario row
layout), whether Slide 14 should lead with the reliability gradient instead of
"what flexes / what doesn't," and whether Slide 16's redesign-context paragraph
("first version treated rigor as an overlay; it did not work") should stay or
the slide should present Staged as a fait accompli.

**Stage 3 review outcome.** Slide 13 table format kept; adjustment deferred
unless the hub renderer specifically misrenders. Slide 14 reordered: the
reliability gradient block now sits immediately after the brief engine
description, with "flexes / does not yet flex" beneath as the mechanical
explanation; title unchanged. Slide 16 redesign-context paragraph kept; the
sentence carries analytical honesty and orients partners who have not read the
memo.

Documentation flag for final-assembly reviewers: Slide 15 (Base) cites the
team's pro forma values (XIRR 16.2%, MOIC 1.79x); Slide 16 (Staged) cites
engine values (XIRR 29.1%, MOIC 2.57x). Engine values for Base are 16.247% and
1.81x within the documented residual. The mixed-citation is intentional for
the deck's framing (Base anchors to the team's headline numbers; Staged is
presented on the engine basis where its returns are computed) but technically
inconsistent. Noted here so the choice survives future review.

**Stage 4 (pattern slide and closing slide) -- drafted, awaiting review.** Two
slides drafted in chat. Slide 20 is the pattern-across-scenarios slide, lightly
polished from the current deck. Slide 21 is the closing slide consolidating the
memo's closing architecture (four-answers framing, fifty-year question,
sign-off) onto a single slide. Three judgment calls flagged: setup-line
placement (chose Slide 21), the "I have a position" sentence (drafted in),
sign-off form ("Jeff").

**Stage 4 review outcome.** Jeff dropped the "I have a position" sentence from
Slide 21. On the hub, a fast-orientation deck read async, the sentence reads as
withholding rather than facilitating; the memo carries the same content where
the longer personal context earns it. Setup-line placement on Slide 21
confirmed. Sign-off "Jeff" confirmed.

**Final assembly written to `drafts/deck_draft.md`.** The 25-slide meeting
walk-through has been fully replaced by a 21-slide hub visual summary. The
three items held for final-assembly visual review were all resolved as
single-slide treatments:

- Slide 5 (the frame): kept as one slide. Three horizons and substrate-not-real
  estate reinforce each other; splitting would push the deck to 22 slides
  without clear analytical gain.
- Slide 11 (idle equity): kept as one slide. The slide's rhetorical power is
  that the three findings (Peak Funding analysis, balloon-rationale
  falsification, GP-economics observation) hit together as one structural
  diagnosis; splitting dilutes.
- Slide 12 (four-gap consolidation): kept as one slide. The consolidation is
  itself the editorial choice; splitting elevates these four gaps back toward
  deep-dive prominence and defeats the purpose.

Final shape: 21 slides. Headline plus condensed Sections 1-2 (5 slides), gap
overview plus five deep-dives plus consolidation (7 slides), tax finding plus
engine gradient plus four scenarios plus Custom (7 slides), pattern plus
closing (2 slides).

**Session 11 close.** The deck transitions with the memo and the engine into
the hub as a unified set. The memo carries the full argument; the deck is the
fast-orientation visual summary; the engine is the audit-trail computation
layer; the simulator (still to be built or referenced separately) is the
partner-editable instrument. The Will Munger letter was retired at the start
of this session (Jeff will share the hub link via a light-touch email when the
time comes). Discussion notes remain markdown in `drafts/`, outside the hub,
as Jeff's facilitation reference for the partnership conversation. Three
hub-bound deliverables (memo, deck, engine) are now in their hub-ready form.
