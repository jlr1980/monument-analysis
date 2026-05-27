function SourceEntry({ eyebrow, title, href, description }) {
  const titleNode = href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {title}
    </a>
  ) : (
    title
  );
  return (
    <div className="source-entry">
      <div className="source-eyebrow">{eyebrow}</div>
      <h4 className="source-title">{titleNode}</h4>
      <p className="source-description">{description}</p>
    </div>
  );
}

function SourceGroup({ eyebrow, heading, intro, items }) {
  return (
    <section className="sources-group">
      <div className="section-block">
        <div className="section-eyebrow">{eyebrow}</div>
        <h2 className="section-heading">{heading}</h2>
      </div>
      {intro ? <p className="sources-group-intro">{intro}</p> : null}
      <div className="sources-list">
        {items.map((it, i) => (
          <SourceEntry key={i} {...it} />
        ))}
      </div>
    </section>
  );
}

const SUBSTRATE = [
  {
    eyebrow: "Snowpack",
    title: "USU Janet Quinney Lawson Institute annual report",
    description:
      "Source for peak Utah snowpack declining 16 percent since 1979, cited in memo section 3.2. Also documents the Powder Mountain SNOTEL site installed at the Weber and Bear headwaters in 2022 because the hydrology warrants continuous measurement.",
  },
  {
    eyebrow: "Wildlife populations",
    title: "UDWR April 2026 permit recommendations",
    description:
      "Statewide mule deer at 73 percent of management objective; statewide elk at or just above objective. Basis for the memo section 3.2 wildlife claim.",
  },
  {
    eyebrow: "Habitat damage",
    title: "UDWR June 2024 wildlife board action on Ensign Ranches",
    description:
      "Wildlife board approved additional antlerless elk permits on Ensign Ranches and four other northern Utah CWMUs for “long-term habitat damage from overgrazing” affecting struggling deer populations. Source for memo section 3.2 management framing.",
  },
  {
    eyebrow: "CWMU regulation",
    title: "Sharp Mountain CWMU registration, Utah CWMU directory",
    href: "https://utahcwmu.com/find-a-cwmu",
    description:
      "Lists Sharp Mountain as a 17,650-acre Cooperative Wildlife Management Unit, registered with UDWR. Source for the CWMU governance framework referenced in memo sections 3.2 and 3.6.",
  },
  {
    eyebrow: "Heli-skiing disturbance",
    title: "Gill et al. 2025, Journal of Wildlife Management",
    description:
      "Documents caribou home-range expansion during the COVID reduction in heli-skiing operations. Source for the memo section 3.6 claim that mechanized recreation is a restrictor of ungulate movement.",
  },
  {
    eyebrow: "Elk flight distance",
    title: "Cassirer et al. 1992",
    description:
      "Elk in low-disturbance areas flee 1,675 meters from a skier; habituated elk flee 40 meters. Source for the memo section 3.6 habituation argument.",
  },
  {
    eyebrow: "Alpine winter recreation",
    title: "Rixen and Rolando 2013 meta-analysis",
    description:
      "Alpine fauna richness, abundance, and diversity are lower in areas affected by winter recreation than in undisturbed areas. Supporting reference for memo section 3.6.",
  },
  {
    eyebrow: "Elk road avoidance",
    title: "Sawyer et al. 2007, Wyoming",
    description:
      "Peak elk use occurs 2.8 km from major roads in summer, 1.2 km in winter; road density depresses use of the broader landscape, not just road-adjacent strips. Supporting reference for memo section 3.2.",
  },
  {
    eyebrow: "Road density threshold",
    title: "TRCP and Colorado Parks and Wildlife 2022",
    description:
      "Threshold of one linear mile of route per square mile of habitat above which big-game habitat security degrades. Primary source for the road density math in memo section 3.2.",
  },
  {
    eyebrow: "Grazing standard",
    title: "USFS Wasatch-Cache 2003 Revised Forest Plan, Standard S26",
    description:
      "Maximum 50 percent of current year’s growth on woody vegetation in big-game winter range and riparian areas. Benchmark used to evaluate the 4,000-head sheep operation noted in the deck.",
  },
  {
    eyebrow: "Grazing comparable",
    title: "USU Extension case study, Osguthorpe sheep operation",
    description:
      "3,000-head Osguthorpe sheep operation in Snyderville Basin on 4,000 private acres plus federal grazing permits. Reference point for Monument’s 4,000-head, 15,000-acre stocking rate.",
  },
  {
    eyebrow: "Dark sky ordinance",
    title: "Weber County Outdoor Lighting Ordinance (2000, updated 2017)",
    description:
      "Utah’s first dark-sky ordinance, requires fully shielded, downward-focused outdoor lighting for all new construction. Basis for the lumens budget calculation in memo section 3.2.",
  },
  {
    eyebrow: "Dark sky asset",
    title: "DarkSky International, North Fork Park designation (2015)",
    description:
      "North Fork Park, immediately adjacent to Monument, designated an International Dark Sky Park in 2015. One of the only IDA-designated parks within two hours of a major urban center.",
  },
  {
    eyebrow: "Water allocation",
    title: "Weber Basin Water Conservancy District, Replacement Water Program",
    description:
      "Anyone developing a new well in the Weber Basin must contract with WBWCD to release storage rights downstream to replace the groundwater they extract. Binding regulatory constraint for memo section 3.7.",
  },
  {
    eyebrow: "Ground-water policy",
    title: "Utah State Engineer, interim Ground-water Management Plan for Ogden Valley",
    description:
      "Regulatory framework governing new well permits in the Ogden Valley, under which Monument’s water needs must be met. Basis for memo section 3.7.",
  },
  {
    eyebrow: "Water rights jurisdiction",
    title: "Utah Division of Water Rights, Areas 25 and 35",
    description:
      "Monument’s parcels straddle two water rights administrative areas: Weber/Ogden River (Area 35) and Bear/Cache Valley (Area 25). Source for the multi-jurisdictional water claim in memo section 3.7.",
  },
];

const ZONING = [
  {
    eyebrow: "FR-40 occupancy rule",
    title: "Cache County Code, Title 17.10.030.B",
    description:
      "FR-40 (Forest Recreation 40) zoning prohibits year-round residences and limits dwelling occupancy to 180 days per year. Cited in 2013 Ordinance Amendment Ord. 2013-06. Primary source for memo section 3.3.",
  },
  {
    eyebrow: "Precedent rezone",
    title: "Powder Mountain Cache County rezone, February 25, 2025",
    description:
      "Cache County Council voted 4-3 to rezone 1,621 Powder Mountain acres from FR-40 to Resort Recreation. One vote either way. Source for the procedural-risk framing in memo section 3.3.",
  },
  {
    eyebrow: "Referendum precedent",
    title: "Wasatch Peaks Ranch litigation, Morgan County (2019–2024)",
    description:
      "Original 2019 rezone challenged by a five-resident referendum petition; county clerk rejected the petition; four years of litigation followed. Reported in KSL.com, Salt Lake Tribune, Standard-Examiner. Source for the referendum-risk argument in memo section 3.3.",
  },
  {
    eyebrow: "WPR injunction",
    title: "Judge Noel Hyde preliminary injunction, December 2023",
    description:
      "Halted all Wasatch Peaks Ranch construction. The ruling included the line “Constitutional rights are not for sale.” Source for the timeline-risk claim in memo section 3.3.",
  },
  {
    eyebrow: "WPR settlement",
    title: "Wasatch Peaks Ranch settlement, January 2024",
    description:
      "2,300-acre conservation easement plus undisclosed funding commitment to Morgan County resident projects, after $92M raised and ski lifts built during the litigation. Source for the sunk-cost framing in memo section 3.3.",
  },
  {
    eyebrow: "State constitution",
    title: "Utah Constitution, referendum rights",
    description:
      "Utah residents may petition to put a county-council legislative action to public referendum. The legal mechanism underlying the WPR precedent and the procedural risk Monument inherits.",
  },
];

const TAX = [
  {
    eyebrow: "Federal tax code",
    title: "IRC §170(h), qualified conservation contributions",
    description:
      "Statutory framework for deductible conservation contributions. Basis for the team’s structural choice to organize Monument’s Foundation outside §170(h) as a non-easement charitable contribution to a POF.",
  },
  {
    eyebrow: "Partnership deduction cap",
    title: "IRC §170(h)(7), 2.5x rule",
    description:
      "If a §170(h) contribution by a partnership exceeds 2.5 times the sum of each member’s relevant basis, the deduction is statutorily disallowed. Source for the structural analysis in memo section 3.5.",
  },
  {
    eyebrow: "Tax court (2025)",
    title: "Beaverdam Creek Holdings, T.C. Memo 2025-53",
    description:
      "Court accepted the highest-and-best-use but rejected the DCF yield-plan methodology as “fantasy economics,” reducing a $22M deduction to under $200K. Source for the HBU vulnerability claim in memo section 3.5.",
  },
  {
    eyebrow: "Tax court (2025)",
    title: "Ranch Springs, 164 T.C. No. 6",
    description:
      "Rejected DCF yield-plan valuation of a conservation deduction as speculative. Supporting precedent for memo section 3.5.",
  },
  {
    eyebrow: "Tax court (2025)",
    title: "Jackson Stone South, T.C. Memo 2025-96",
    description:
      "Court “dismantled” the structure on similar grounds. Third of the four 2025 Tax Court decisions cited in memo section 3.5.",
  },
  {
    eyebrow: "Tax court (2025)",
    title: "Excelsior Aggregates",
    description:
      "Fourth 2025 Tax Court decision rejecting DCF-based yield-plan valuation. Completes the precedent set cited in memo section 3.5.",
  },
  {
    eyebrow: "Tax law change",
    title: "OBBBA 2026, effective January 1, 2026",
    description:
      "35 percent cap on top-bracket itemized deductions versus the 37 percent marginal rate, plus a 0.5 percent AGI floor on charitable deductions. Combined effect is roughly a 10 percent reduction in tax benefit. Source for memo section 3.5 OBBBA claim.",
  },
  {
    eyebrow: "POF qualification",
    title: "IRC §4942, Private Operating Foundation requirements",
    description:
      "Requires 85 percent of adjusted net income spent on direct charitable activities (income test) plus one of: assets test, endowment test, or support test. Source for the POF qualification framing in memo section 3.5.",
  },
  {
    eyebrow: "POF prohibition",
    title: "IRC §4941, self-dealing",
    description:
      "Prohibits self-dealing between a private foundation and disqualified persons. Relevant to member-dues / Foundation-services quid-pro-quo questions raised in memo section 3.5.",
  },
  {
    eyebrow: "IRS publication",
    title: "IRS Publication 526, Charitable Contributions",
    description:
      "General guidance on deductibility of charitable contributions, including the 2.5x rule for partnerships and POF treatment.",
  },
  {
    eyebrow: "Regulatory action",
    title:
      "Treasury final regulations on Syndicated Conservation Easement transactions, October 2024",
    description:
      "Identified SCETs as “listed transactions” requiring disclosure; the rules exempt some fee-simple structures from the listed-transaction designation while preserving underlying valuation scrutiny.",
  },
  {
    eyebrow: "Practitioner commentary",
    title: "Chamberlain Hrdlicka tax counsel publications on IRS enforcement",
    description:
      "Published analysis noting that the IRS approach in recent SCET and fee-simple cases is to fully disallow charitable deductions on donative-intent and HBU grounds, regardless of structure.",
  },
];

const COMPARABLES = [
  {
    eyebrow: "Comparable — YC",
    title: "Yellowstone Club operating history",
    description:
      "750 households on 15,200 acres; same master planner (Hart Howerton) and architect (Kip Halverson) as Monument; 20 percent conservation footprint versus Monument’s proposed 80 percent. Founded 2000, bankrupt 2008, acquired by CrossHarbor 2009. Source for the scale comparison in memo section 5.6. Reporting from Wikipedia, YC Environmental Stewardship reports, CrossHarbor / Lone Mountain Land Company.",
  },
  {
    eyebrow: "Comparable — WPR",
    title: "Wasatch Peaks Ranch (Morgan County, Utah)",
    description:
      "750 households on 12,700 acres, 30 minutes south of Monument; zero original conservation footprint. Same scale, adjacent geography, same procedural-risk profile. Source for memo sections 3.3 and 3.8.",
  },
  {
    eyebrow: "Comparable — WR",
    title: "Whisper Ridge prior operations",
    description:
      "Monument is the rebranded Whisper Ridge property. WR ran heli/cat skiing on roughly 70,000 acres of private tenure, founded by Dan Lockwood in 2015, exited operations after running heli/cat as a profit center failed economically. Sources: PRNewswire 2018, Ski Mag coverage, First Tracks Online, and confirmation from Jeff Reece.",
  },
  {
    eyebrow: "Adjacent institutional asset",
    title: "Powder Mountain and Powder Haven (Reed Hastings acquisition)",
    description:
      "Hastings’s acquisition of Powder Mountain and its conversion to Powder Haven gives Monument institutional underwriting of the ski amenity for the asset’s full economic life. Source for memo section 1.4.",
  },
];

const TEAM_DOCS = [
  {
    eyebrow: "Internal — deck",
    title: "Monument Development Update (the team’s deck)",
    description:
      "The team’s investor-facing presentation; primary document the memo analyzes against. Held by the partnership; not publicly distributed. Stored in the project archive.",
  },
  {
    eyebrow: "Internal — model",
    title: "Team’s pro forma cash flow model",
    description:
      "The cash flow workbook to which the parametric engine reconciles. Source for the six headline numbers: revenue, levered XIRR, MOIC, net profit, Foundation end balance, and pre-existing debt service. Held by the partnership.",
  },
  {
    eyebrow: "Internal — meeting notes",
    title: "April 30, 2026 quarterly member meeting notes",
    description:
      "Verbatim source for the team’s acknowledgment that “not all of these lots may survive the final planning due to potential issues like water constraints or conflicts with hunting and wildlife concerns.” Cited throughout the memo as the April 30 admission.",
  },
  {
    eyebrow: "Internal — research compilation",
    title: "Monument Rigor Consolidated Reference (May 4, 2026)",
    description:
      "The project’s internal research compilation underlying the research blocks. Roughly 24 pages of source citations and context, stored in the project archive.",
  },
];

const METHOD = [
  {
    eyebrow: "Methodology",
    title: "Parametric engine architecture",
    description:
      "Nine-sheet calculation engine that powers the scenario writeups and the Monte Carlo: Inputs, Lot Schedule, Revenue, Development Cost, Foundation, Debt, Cash Flow, Peak Funding, Reconciliation. See the Model tab for the workbook and the Change Log for the build history.",
  },
  {
    eyebrow: "Methodology",
    title: "Monte Carlo simulation design",
    description:
      "10,000 iterations per scenario, five stochastic drivers (snowpack, sales velocity, tax realization, entitlement delay, Foundation yield), correlated input distributions, two-tier criteria (survival, objective). Construction documented in the Monte Carlo Change Log.",
  },
  {
    eyebrow: "Methodology",
    title: "Validation approach",
    description:
      "Base case reconciles exactly to the team’s six headline numbers within documented tolerance. Non-Base scenarios reconcile on metrics that flex (revenue, Foundation, peak funding, tax benefit); precise XIRR and MOIC for Compact and Conservation are deferred to Monte Carlo. Python simulation kernel diverges from the Excel engine by +1.6 percent on Compact and −6.6 percent on Conservation, documented in the Change Log.",
  },
];

export default function Sources() {
  return (
    <article className="markdown-page sources-page">
      <h1>Sources</h1>
      <p>
        This index organizes the sources behind the memo&rsquo;s empirical
        claims, grouped by topic. Each entry pairs a brief description with a
        link where one exists; project-internal documents are marked as such.
        The memo&rsquo;s citations and the engine&rsquo;s assumptions trace
        back to this set.
      </p>

      <SourceGroup
        eyebrow="Part 01"
        heading="Substrate and ecology"
        intro="Sources for memo sections 3.2 (carrying capacity), 3.6 (four pillars), and 3.7 (water cost). Snowpack, wildlife populations, road density, mechanized-recreation disturbance, grazing, dark sky, and water-rights regulation."
        items={SUBSTRATE}
      />

      <SourceGroup
        eyebrow="Part 02"
        heading="Zoning and entitlement"
        intro="Sources for memo section 3.3 (FR-40 zoning and referendum risk). Cache County code, the Powder Mountain rezone precedent, and the Wasatch Peaks Ranch litigation history."
        items={ZONING}
      />

      <SourceGroup
        eyebrow="Part 03"
        heading="Tax law and IRS precedent"
        intro="Sources for memo section 3.5 (tax timing and POF determination). Federal tax code, the four 2025 Tax Court decisions on DCF yield-plan valuations, OBBBA 2026 provisions, and the POF qualification framework."
        items={TAX}
      />

      <SourceGroup
        eyebrow="Part 04"
        heading="Comparable developments"
        intro="Sources for memo sections 3.6 (scale comparison), 3.8 (operating undercapitalization), and 5.6 (the pattern across scenarios). Yellowstone Club, Wasatch Peaks Ranch, Whisper Ridge, and the Powder Mountain / Powder Haven adjacency."
        items={COMPARABLES}
      />

      <SourceGroup
        eyebrow="Part 05"
        heading="Team’s documents"
        intro="The team’s materials the memo analyzes against. Held by the partnership; not publicly distributed."
        items={TEAM_DOCS}
      />

      <SourceGroup
        eyebrow="Part 06"
        heading="Methodology references"
        intro="The analytical infrastructure the memo and Monte Carlo work sits on. Documented in detail in the Model tab and the Change Log."
        items={METHOD}
      />
    </article>
  );
}
