import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const SECTIONS = [
  { id: "system", label: "The System", icon: "🏛️", stat: "$5.3T", desc: "How Medicare, Medicaid, and private insurance actually work — and why the same hip replacement generates four different prices.", category: "STRUCTURE & FINANCING" },
  { id: "hospitals", label: "How Hospitals Get Paid", icon: "🏥", stat: "4 payers", desc: "DRGs, chargemaster, cross-subsidy, and the payment mechanisms that drive hospital economics.", category: "STRUCTURE & FINANCING" },
  { id: "insurance", label: "Insurance Mechanics", icon: "📋", stat: "HMO/PPO/EPO", desc: "Medicare Parts A–D, employer insurance, prior auth, PBMs, plan types, and retail health.", category: "STRUCTURE & FINANCING" },
  { id: "insurers", label: "The Insurers", icon: "🏢", stat: "19% denied", desc: "Claim denial rates, the Big Five, Kaiser's integrated model, and how medical necessity gets decided.", category: "PAYERS & PROVIDERS" },
  { id: "pharma", label: "Drugs & Innovation", icon: "💊", stat: "$467B", desc: "Drug pricing, patents, generics, the FDA, the $200B+ patent cliff, and pharmaceutical R&D economics.", category: "PAYERS & PROVIDERS" },
  { id: "outcomes", label: "Health Outcomes", icon: "📊", stat: "79.0 yr", desc: "Life expectancy, infant mortality, cancer survival — where the US excels and where it fails.", category: "OUTCOMES & WORKFORCE" },
  { id: "workforce", label: "Workforce Economics", icon: "👩‍⚕️", stat: "$21.2B GME", desc: "CRNAs, residents, NPs/PAs, SRNA schools, physician-owned facilities, and self-referral economics.", category: "OUTCOMES & WORKFORCE" },
  { id: "international", label: "International Comparison", icon: "🌍", stat: "2.5× OECD", desc: "US vs UK (NHS) vs Canada vs Australia: spending, coverage, outcomes, trade-offs.", category: "ASSESSMENT" },
  { id: "crisis", label: "The 2026 Crisis", icon: "⚠️", stat: "+10M uninsured", desc: "ACA subsidy expiration, Medicaid restructuring, hospital closures, and the coverage cliff.", category: "ASSESSMENT" },
  { id: "assessment", label: "Honest Assessment", icon: "⚖️", stat: "It's the prices", desc: "What the evidence shows, the trade-offs nobody discusses, and what would actually help.", category: "ASSESSMENT" },
];

// ── Shared Components ──
const SH = ({ children }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginBottom: 8 }}>
    <div style={{ width: 4, minHeight: 32, background: "#2dd4bf", borderRadius: 2, marginRight: 14, flexShrink: 0, marginTop: 2 }} />
    <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.2 }}>{children}</h2>
  </div>
);

const Sub = ({ children }) => <div style={{ color: "#94a3b8", fontSize: "0.92rem", marginBottom: 22, paddingLeft: 18 }}>{children}</div>;

const StatCards = ({ cards }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 14, marginBottom: 32 }}>
    {cards.map((c, i) => (
      <div key={i} style={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 8, padding: "18px 16px", borderTop: `3px solid ${c.color || "#2dd4bf"}` }}>
        <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontWeight: 600, marginBottom: 5 }}>{c.label}</div>
        <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "1.85rem", fontWeight: 800, lineHeight: 1.1 }}>{c.value}</div>
        {c.note && <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 3 }}>{c.note}</div>}
      </div>
    ))}
  </div>
);

const Callout = ({ children, type = "yellow" }) => {
  const colors = { yellow: ["rgba(251,191,36,0.1)", "rgba(251,191,36,0.25)", "#fbbf24"], teal: ["rgba(45,212,191,0.1)", "rgba(45,212,191,0.25)", "#2dd4bf"], red: ["rgba(248,113,113,0.1)", "rgba(248,113,113,0.25)", "#f87171"] };
  const [bg, border, accent] = colors[type] || colors.yellow;
  return <div style={{ background: bg, border: `1px solid ${border}`, borderLeft: `4px solid ${accent}`, borderRadius: 8, padding: "18px 22px", margin: "24px 0", fontSize: "0.92rem", lineHeight: 1.7 }}>{children}</div>;
};

const FeatureCards = ({ cards }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, margin: "20px 0 32px" }}>
    {cards.map((c, i) => (
      <div key={i} style={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 8, padding: "22px 18px" }}>
        <div style={{ fontSize: "1.7rem", marginBottom: 10 }}>{c.icon}</div>
        <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "1rem", fontWeight: 700, marginBottom: 7, color: c.titleColor || "#2dd4bf" }}>{c.title}</div>
        <div style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6 }}>{c.body}</div>
      </div>
    ))}
  </div>
);

const ChartBox = ({ title, subtitle, children }) => (
  <div style={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 8, padding: 22, margin: "22px 0 32px" }}>
    <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: 3 }}>{title}</div>
    {subtitle && <div style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: 18 }}>{subtitle}</div>}
    {children}
  </div>
);

const TB = ({ children }) => <div style={{ marginBottom: 32 }}>{children}</div>;
const P = ({ children }) => <p style={{ marginBottom: 14, color: "#94a3b8", fontSize: "0.92rem", lineHeight: 1.7 }}>{children}</p>;
const Divider = () => <hr style={{ border: "none", borderTop: "1px solid rgba(148,163,184,0.15)", margin: "44px 0" }} />;

const ttStyle = { background: "#1e293b", border: "1px solid rgba(148,163,184,0.25)", borderRadius: 6 };
const ttLabel = { color: "#f1f5f9" };
const ttItem = { color: "#94a3b8" };

const B = ({ children }) => <strong style={{ color: "#fbbf24" }}>{children}</strong>;
const BT = ({ children }) => <strong style={{ color: "#2dd4bf" }}>{children}</strong>;
const BR = ({ children }) => <strong style={{ color: "#f87171" }}>{children}</strong>;

// ── SECTIONS ──

function TheSystem() {
  const covData = [
    { name: "Employer", value: 174 },
    { name: "Medicare", value: 66.6 },
    { name: "Medicaid", value: 84.3 },
    { name: "ACA/Direct", value: 22.8 },
    { name: "Uninsured", value: 28 },
    { name: "Military/VA", value: 14 },
  ];
  const srcData = [
    { name: "Private Insurance", value: 1645 },
    { name: "Medicare", value: 1118 },
    { name: "Medicaid", value: 932 },
    { name: "Out of Pocket", value: 557 },
    { name: "Other Programs", value: 591 },
  ];
  return (
    <>
      <StatCards cards={[
        { label: "Total Spending 2024", value: "$5.3T", note: "↑ 7.2% from 2023", color: "#fbbf24" },
        { label: "Per Person", value: "$15,474", note: "2.5× OECD average", color: "#f87171" },
        { label: "Share of GDP", value: "18.0%", note: "Projected 20.3% by 2033", color: "#60a5fa" },
        { label: "Insured Rate", value: "91.8%", note: "28M still uninsured", color: "#4ade80" },
      ]} />
      <Callout type="teal"><BT>If You're Used to the NHS:</BT> In the UK: one system, one payer, free at point of use. In the US: <BT>multiple overlapping programs</BT> for different populations, each with different eligibility, funding, payment mechanisms, and benefits. The same hip replacement generates four completely different payments depending on whether the patient has Medicare, Medicaid, employer insurance, or nothing.</Callout>
      <SH>Who Covers Whom</SH>
      <Sub>America's ~335 million residents by coverage source (2024)</Sub>
      <ChartBox title="Coverage by Source" subtitle="Millions of people (categories overlap slightly)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={covData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" /><XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} /><YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} /><Tooltip contentStyle={ttStyle} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v) => [`${v}M`, "People"]} /><Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#60a5fa" /></BarChart>
        </ResponsiveContainer>
      </ChartBox>
      <SH>The Five Doors Into US Healthcare</SH>
      <Sub>How Americans actually get coverage</Sub>
      <FeatureCards cards={[
        { icon: "🏢", title: "Employer Insurance", titleColor: "#60a5fa", body: "~174M people. Employer picks the plan, negotiates with an insurer, splits the premium. Average family premium: ~$25,572/yr. Employer pays ~73%, you pay the rest plus deductibles, copays, and coinsurance." },
        { icon: "🏥", title: "Medicare", titleColor: "#4ade80", body: "66.6M people. Federal program for 65+, disabled, or ESRD. Part A (hospital, payroll tax funded). Part B (outpatient, premiums + general revenue). Part D (drugs, 2006). Part C (Medicare Advantage — private insurer manages all)." },
        { icon: "🛡️", title: "Medicaid / CHIP", titleColor: "#a78bfa", body: "84.3M people. Joint federal-state program for low-income. States set eligibility within federal guardrails. Pays providers the lowest rates — ~70% of Medicare on average." },
        { icon: "🛒", title: "ACA Marketplace", titleColor: "#fbbf24", body: "22.8M enrolled for 2026. Individual market with income-based subsidies. Metal tiers (Bronze–Platinum). Enhanced subsidies expired end 2025 — projected 4.7M enrollment drop." },
        { icon: "⚠️", title: "Uninsured", titleColor: "#f87171", body: "28M people. EMTALA guarantees ER stabilization. Beyond that: FQHCs, county programs, charity care. No access to elective surgery, specialists, or consistent chronic disease management." },
      ]} />
      <SH>Where the Money Comes From</SH>
      <Sub>$5.3 trillion by funding source (2024)</Sub>
      <ChartBox title="Spending by Source" subtitle="Billions of dollars">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={srcData} layout="vertical" margin={{ left: 100 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" /><XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} /><YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} width={98} /><Tooltip contentStyle={ttStyle} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v) => [`$${v}B`, "Spending"]} /><Bar dataKey="value" fill="#2dd4bf" radius={[0, 4, 4, 0]} /></BarChart>
        </ResponsiveContainer>
      </ChartBox>
      <Callout><B>The fundamental structure:</B> Federal government finances 31%, households 28%, private businesses 18%, state/local 16%. Unlike the NHS (81% government) or Canada (~71%), the US splits financing across multiple sources — creating the administrative complexity that itself consumes ~25–30% of spending.</Callout>
      <TB>
        <P>The US does not have a healthcare "system" in the way the UK or Canada does. It has a collection of programs built at different times for different populations, with different rules, different payment rates, and different administrative structures. Medicare (1965 for seniors), Medicaid (1965 for the poor), employer insurance (WWII wage controls), ACA marketplace (2014 for everyone else). Each layer has its own logic and its own dysfunction.</P>
      </TB>
    </>
  );
}

function HowHospitalsGetPaid() {
  const payerData = [
    { name: "Private Insurance", rate: 250, color: "#fbbf24" },
    { name: "Medicare", rate: 100, color: "#4ade80" },
    { name: "Medicaid", rate: 70, color: "#a78bfa" },
    { name: "Uninsured (collected)", rate: 30, color: "#f87171" },
  ];
  const catData = [
    { name: "Hospital Care", value: 1635 },
    { name: "Physicians & Clinical", value: 1110 },
    { name: "Rx Drugs", value: 467 },
    { name: "Nursing/Home Health", value: 290 },
    { name: "Dental", value: 180 },
    { name: "Other", value: 618 },
  ];
  return (
    <>
      <SH>How the Same Procedure Gets Paid</SH>
      <Sub>Relative payment rates by payer (Medicare = 100% baseline)</Sub>
      <ChartBox title="Payment by Payer Type" subtitle="Percentage of Medicare reimbursement rate">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={payerData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" /><XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} /><YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} domain={[0, 300]} tickFormatter={(v) => `${v}%`} /><Tooltip contentStyle={ttStyle} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v) => [`${v}%`, "% of Medicare"]} /><Bar dataKey="rate" radius={[4, 4, 0, 0]}>{payerData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart>
        </ResponsiveContainer>
      </ChartBox>
      <Callout><B>Private insurance pays 2–3× what Medicare pays</B> for the same service. Medicaid pays ~70% of Medicare. Uninsured patients are billed at chargemaster rates but hospitals collect ~30%. This cross-subsidy is how the entire system works — private insurance profits cover Medicaid and uninsured losses.</Callout>
      <SH>Payment Mechanisms</SH>
      <Sub>Four completely different payment logics</Sub>
      <FeatureCards cards={[
        { icon: "📊", title: "Medicare: DRGs", titleColor: "#60a5fa", body: "Fixed payment per diagnosis regardless of length of stay or resources. ~770 DRG categories. Efficient hospitals profit; complex cases lose money. Adjusted for geography, teaching status, case mix. Physicians paid separately via RBRVS/RVU fee schedule." },
        { icon: "📋", title: "Medicaid: Managed Care", titleColor: "#a78bfa", body: "Most patients in managed care plans negotiating rates. Fee-for-service among lowest nationally. Many hospitals lose money on every Medicaid patient. States set fee schedules — California's Medi-Cal rates are notoriously low." },
        { icon: "🤝", title: "Private: Negotiated Rates", titleColor: "#fbbf24", body: "Each insurer negotiates with hospital networks. Large systems negotiate from strength. This is where hospitals make their margin. Rates are proprietary — the same MRI can cost $500 or $3,000 within the same city." },
        { icon: "🎰", title: "Uninsured: Good Luck", titleColor: "#f87171", body: "Billed at chargemaster rates (3–10× what insurers pay). Collection rates very low. Hospitals absorb as 'uncompensated care.' Some recovery via DSH payments and Emergency Medi-Cal." },
      ]} />
      <SH>The Chargemaster: America's Most Absurd Document</SH>
      <TB>
        <P>Every US hospital maintains a "chargemaster" — a list of prices for every item and service, from an aspirin tablet to a day in the ICU. These prices bear almost no relationship to actual costs. No insurer pays chargemaster rates. Medicare ignores them entirely.</P>
        <P>The only people who see chargemaster prices are the uninsured — the population least able to pay. Federal price transparency rules now require hospitals to publish negotiated rates, but compliance has been uneven.</P>
        <P>For a UK-trained clinician, this is perhaps the most alien feature. In the NHS, there are national tariffs set by NHS England. You don't negotiate what a hip replacement costs. There's a published price. Everyone pays it.</P>
      </TB>

      <SH>Real Chargemaster Prices: UC Davis Health</SH>
      <Sub>Actual published charges from the UC Davis CDM (June 2025) — what's listed vs what you'd pay elsewhere</Sub>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", minWidth: 550 }}>
          <thead><tr>
            <th style={{ textAlign: "left", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontWeight: 600, padding: "11px 12px", borderBottom: "1px solid rgba(148,163,184,0.25)" }}>Item</th>
            <th style={{ textAlign: "right", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontWeight: 600, padding: "11px 12px", borderBottom: "1px solid rgba(148,163,184,0.25)" }}>Chargemaster Price</th>
            <th style={{ textAlign: "right", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontWeight: 600, padding: "11px 12px", borderBottom: "1px solid rgba(148,163,184,0.25)" }}>Pharmacy / Real Cost</th>
            <th style={{ textAlign: "right", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 1.5, color: "#f87171", fontWeight: 600, padding: "11px 12px", borderBottom: "1px solid rgba(148,163,184,0.25)" }}>Markup</th>
          </tr></thead>
          <tbody>
            {[
              { item: "Aspirin 325mg tablet", charge: "$1.00", real: "$0.02", markup: "50×", cat: "💊 Drugs You Recognise" },
              { item: "Ibuprofen 600mg tablet", charge: "$16.22", real: "$0.10", markup: "162×" },
              { item: "Acetaminophen 325mg", charge: "$1.00", real: "$0.03", markup: "33×" },
              { item: "Ondansetron 4mg IV (Zofran)", charge: "$22.71", real: "$0.50", markup: "45×" },
              { item: "Ketorolac 30mg IV (Toradol)", charge: "$52.90", real: "$1.50", markup: "35×" },
              { item: "Dexamethasone 4mg tablet", charge: "$16.22", real: "$0.15", markup: "108×" },
              { item: "sep", cat: "🏥 Anesthesia Drugs" },
              { item: "Propofol 1000mg (100mL)", charge: "$666–1,013", real: "$8–15", markup: "~70×" },
              { item: "Fentanyl patch 12mcg/hr", charge: "$68.13", real: "$3–8", markup: "~12×" },
              { item: "Midazolam 5mg IV", charge: "$44.89", real: "$1.50", markup: "30×" },
              { item: "Rocuronium 50mg", charge: "$124–553", real: "$6–12", markup: "~30×" },
              { item: "Succinylcholine 200mg", charge: "$83.86", real: "$5–10", markup: "~12×" },
              { item: "Sugammadex 200mg", charge: "$1,454", real: "$40–80", markup: "~25×" },
              { item: "Neostigmine 3mg", charge: "$1,051", real: "$3–5", markup: "~280×" },
              { item: "Bupivacaine 0.5% PF 30mL", charge: "$22.71", real: "$3–5", markup: "~6×" },
              { item: "Ketamine 500mg (5mL)", charge: "$430", real: "$8–15", markup: "~40×" },
              { item: "Lidocaine 2% 100mL", charge: "$28.53", real: "$2–4", markup: "~10×" },
              { item: "sep", cat: "🔬 Labs & Imaging" },
              { item: "CBC (complete blood count)", charge: "$226–237", real: "$10–15 (Quest)", markup: "~18×" },
              { item: "Basic metabolic panel", charge: "$391.50", real: "$15–25 (Quest)", markup: "~20×" },
              { item: "Comprehensive metabolic panel", charge: "$1,115", real: "$20–35 (Quest)", markup: "~40×" },
              { item: "Troponin (quantitative)", charge: "$268.50", real: "$15–30", markup: "~12×" },
              { item: "Chest X-ray (2 views)", charge: "$1,049", real: "$40–75 (imaging center)", markup: "~18×" },
              { item: "CT head without contrast", charge: "$4,543", real: "$200–400 (imaging center)", markup: "~15×" },
              { item: "CT chest without contrast", charge: "$4,871", real: "$200–400", markup: "~16×" },
              { item: "sep", cat: "🛏️ Room & Board (per day)" },
              { item: "General medical/surgical bed", charge: "$7,287", real: "—", markup: "" },
              { item: "Bed with telemetry", charge: "$8,073", real: "—", markup: "" },
              { item: "Special care unit", charge: "$10,776", real: "—", markup: "" },
              { item: "Surgical ICU", charge: "$21,747", real: "—", markup: "" },
              { item: "Medical ICU", charge: "$21,747", real: "—", markup: "" },
              { item: "Pediatric ICU", charge: "$21,747", real: "—", markup: "" },
              { item: "sep", cat: "⏱️ Recovery Room (PACU)" },
              { item: "Class I (stable) — first hour", charge: "$4,010", real: "—", markup: "" },
              { item: "Class II (basic) — first hour", charge: "$4,587", real: "—", markup: "" },
              { item: "Class III (extended) — first hour", charge: "$4,980", real: "—", markup: "" },
              { item: "Each additional 30 min", charge: "$1,415–1,503", real: "—", markup: "" },
              { item: "sep", cat: "💉 IV Fluids & Blood" },
              { item: "Normal saline 1000mL", charge: "$26.78", real: "$1–3", markup: "~12×" },
              { item: "Lactated Ringer's 1000mL", charge: "$167.63", real: "$2–4", markup: "~55×" },
              { item: "Heparin 5,000 units", charge: "$121.57", real: "$3–5", markup: "~30×" },
              { item: "Enoxaparin 40mg (Lovenox)", charge: "$913.43", real: "$20–40", markup: "~30×" },
              { item: "Insulin 100 units/mL vial", charge: "$1,011–1,448", real: "$25–100 (retail)", markup: "~15×" },
            ].map((row, i) => {
              if (row.item === "sep") return (
                <tr key={i}><td colSpan={4} style={{ padding: "16px 12px 8px", color: "#f1f5f9", fontWeight: 700, fontSize: "0.88rem", borderBottom: "none" }}>{row.cat}</td></tr>
              );
              return (
                <tr key={i}>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(148,163,184,0.1)", color: "#f1f5f9", fontWeight: 400, fontSize: "0.84rem" }}>{row.item}</td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(148,163,184,0.1)", color: "#fbbf24", fontWeight: 600, textAlign: "right", fontSize: "0.84rem" }}>{row.charge}</td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(148,163,184,0.1)", color: "#4ade80", textAlign: "right", fontSize: "0.84rem" }}>{row.real}</td>
                  <td style={{ padding: "9px 12px", borderBottom: "1px solid rgba(148,163,184,0.1)", color: row.markup ? "#f87171" : "#64748b", fontWeight: row.markup ? 700 : 400, textAlign: "right", fontSize: "0.84rem" }}>{row.markup || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Callout type="red"><BR>Nobody pays these prices</BR> — except the uninsured. Medicare pays a flat DRG rate regardless of itemised charges. Private insurers negotiate 40–60% discounts off chargemaster, or set their own rates entirely. Medicaid pays even less. The chargemaster exists primarily as a starting point for negotiation and as the default bill for anyone without an insurer to negotiate on their behalf. A bag of Lactated Ringer's that costs the hospital ~$2 is listed at $167.63. Neostigmine that costs ~$3 wholesale is listed at $1,051. These aren't errors — they're the structural reality of a system where list prices are fictional and actual prices are negotiated behind closed doors.</Callout>

      <TB>
        <P style={{ fontSize: "0.82rem", color: "#64748b", fontStyle: "italic" }}>Data source: UC Davis Health Charge Description Master (CDM), published June 2025. "Pharmacy / Real Cost" column reflects approximate wholesale acquisition cost (WAC) or cash-pay pricing at retail pharmacies and independent imaging centers for comparison. Chargemaster prices are required to be published under CMS price transparency rules (45 CFR §180.50). These are standard academic medical center charges and are comparable to other US teaching hospitals.</P>
      </TB>
      <SH>Where $5.3 Trillion Goes</SH>
      <Sub>Spending by category of service (2024, billions)</Sub>
      <ChartBox title="Spending by Service Category" subtitle="Billions of dollars, 2024">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={catData} layout="vertical" margin={{ left: 125 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" /><XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} /><YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} width={122} /><Tooltip contentStyle={ttStyle} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v) => [`$${v}B`, "Spending"]} /><Bar dataKey="value" fill="#60a5fa" radius={[0, 4, 4, 0]} /></BarChart>
        </ResponsiveContainer>
      </ChartBox>
      <Callout><B>When the payer mix shifts</B> — more Medicaid, fewer privately insured — the cross-subsidy breaks down. California has lost 70+ hospitals since 1995, predominantly in low-income and rural areas where the privately insured population was too small to cover losses.</Callout>
    </>
  );
}

function InsuranceMechanics() {
  const thS = { textAlign: "left", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontWeight: 600, padding: "11px 12px", borderBottom: "1px solid rgba(148,163,184,0.25)" };
  const tdS = { padding: "11px 12px", borderBottom: "1px solid rgba(148,163,184,0.12)", color: "#94a3b8", fontSize: "0.85rem", verticalAlign: "top" };
  return (
    <>
      <SH>Medicare: The Parts You Need to Know</SH>
      <Sub>A program built in layers over 60 years</Sub>
      <FeatureCards cards={[
        { icon: "🏥", title: "Part A — Hospital", titleColor: "#4ade80", body: "Inpatient hospital, SNF, hospice, some home health. Funded by payroll tax (2.9% split employer/employee). Most pay no premium. Deductible: $1,676/benefit period (2025). No out-of-pocket maximum." },
        { icon: "🩺", title: "Part B — Outpatient", titleColor: "#60a5fa", body: "Physician visits, outpatient procedures, labs, DME, ambulance. Premium: $185/month (2025), income-adjusted. 20% coinsurance with no cap — a $100K cancer treatment = $20K OOP. Why Medigap exists." },
        { icon: "💊", title: "Part D — Drugs", titleColor: "#fbbf24", body: "Prescription drug coverage added 2006. Run by private insurers. The IRA introduced a $2,000/year OOP cap (2025) and Medicare drug price negotiation (10 drugs initially, expanding to 60+ by 2029)." },
        { icon: "📦", title: "Part C — Medicare Advantage", titleColor: "#fb923c", body: "Private insurer bundles A+B+D+extras. ~54% of beneficiaries now choose MA. Plans restrict networks and use prior auth aggressively. CMS overpays MA by an estimated $83B/year via risk score gaming." },
      ]} />
      <Callout type="teal"><BT>For the NHS-trained clinician:</BT> Imagine if the government covered hospital care under one program, required a separate monthly subscription for outpatient/GP care, and made you buy drug coverage from a private company — then offered a fourth option where a private insurer manages everything for a capitated fee. It's exactly as fragmented as it sounds.</Callout>
      <SH>How Employer Insurance Actually Works</SH>
      <TB>
        <P>The majority of non-elderly Americans get coverage through an employer. This isn't because employers are naturally in the health insurance business — it's a historical accident from WWII wage controls. The tax exclusion for employer health insurance (~$300B/year, the largest tax expenditure in the US) locked in this model permanently.</P>
        <P>Large employers (~65%) are "self-insured" — they don't buy an insurance product. They pay claims directly and hire a TPA (Third-Party Administrator) to manage the network and process claims. The employer bears the financial risk, not the insurer. Self-insured plans are regulated by federal ERISA law, not state insurance commissioners, creating a regulatory gap that bypasses state mandated benefits.</P>
      </TB>
      <StatCards cards={[
        { label: "Avg Family Premium", value: "$25,572", note: "Per year (2025)", color: "#fbbf24" },
        { label: "Avg Deductible", value: "$1,787", note: "Before insurance pays", color: "#f87171" },
        { label: "Employer Pays", value: "~73%", note: "Of the premium", color: "#60a5fa" },
        { label: "Self-Insured", value: "~65%", note: "Of covered workers", color: "#4ade80" },
      ]} />
      <SH>Prior Authorization: The Hidden Gatekeeper</SH>
      <TB>
        <P>In the NHS, if a consultant decides a patient needs an MRI, the patient gets an MRI (with a wait). In US private insurance and Medicare Advantage, the clinical decision triggers a <em>request</em> — the insurer must approve the service first. This is "prior authorization" (PA).</P>
        <P>The AMA's 2024 survey: 94% of physicians reported care delays due to PA, 78% reported PA led to treatment abandonment, average practice spends ~14 hours/week on PA-related admin. CMS finalized rules requiring MA plans to respond to urgent PA within 24 hours, standard within 7 days.</P>
      </TB>
      <SH>PBMs: The Middlemen of Drug Pricing</SH>
      <TB>
        <P>Pharmacy Benefit Managers sit between drug manufacturers, insurers, and pharmacies. Three companies — CVS Caremark, Express Scripts (Cigna), OptumRx (UnitedHealth) — control ~80% of the market. They negotiate rebates, manage formularies, and set pharmacy reimbursement rates.</P>
        <P>The perverse incentive: PBMs favor higher-priced drugs because rebates are percentage-based. A drug with a $500 list price and $200 rebate looks better to a PBM than a $100 drug with a $60 rebate — even though the net cost is lower. This systematically inflates US drug prices.</P>
      </TB>
      <Callout type="red"><BR>The administrative burden is real:</BR> Hospital admin costs reached $687B in 2023 — nearly 2× the $346B spent on direct patient care. The multi-payer system requires every provider to negotiate with dozens of insurers, each with different rules and billing codes. McKinsey estimates $265B/year in achievable savings through standardization.</Callout>

      <Divider />

      <SH>HMO vs PPO vs EPO: The Plan Types Explained</SH>
      <Sub>The alphabet soup that determines how Americans access care</Sub>
      <TB>
        <P>In the NHS, there's one access model: you register with a GP, the GP refers you to a specialist if needed, and the NHS pays. In the US, the type of insurance plan you have determines which doctors you can see, whether you need a referral, what you'll pay, and sometimes whether you can go out of state for care. The three main plan architectures:</P>
      </TB>

      <FeatureCards cards={[
        { icon: "🔒", title: "HMO (Health Maintenance Organization)", titleColor: "#60a5fa", body: "Most restrictive, lowest premiums. You must choose a Primary Care Physician (PCP) who acts as your gatekeeper — all specialist referrals go through them. No out-of-network coverage except emergencies. Must use the HMO's network of providers and facilities. Kaiser Permanente is the largest HMO. Copays are predictable and typically low ($20–40 for visits). Best analogy to the NHS: you're locked into a defined system, but costs are contained." },
        { icon: "🔓", title: "PPO (Preferred Provider Organization)", titleColor: "#4ade80", body: "Most flexible, highest premiums. No PCP or referral required — you can self-refer to any specialist. Can see out-of-network providers (but pay more — typically 60/40 vs 80/20 for in-network). No prior authorization for most in-network services. The 'gold standard' plan for those who want maximum choice. Employer PPOs are what most well-insured Americans have. Monthly premiums for a family PPO can exceed $2,500." },
        { icon: "⚡", title: "EPO (Exclusive Provider Organization)", titleColor: "#fbbf24", body: "Hybrid: no referral needed (like PPO), but no out-of-network coverage (like HMO). Premiums fall between HMO and PPO. Growing in popularity because they offer specialist access without gatekeeping while keeping costs down by restricting the network. If you see a doctor outside the network, you pay 100% out of pocket (except emergencies)." },
      ]} />

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", minWidth: 550 }}>
          <thead><tr><th style={thS}>Feature</th><th style={thS}>HMO</th><th style={thS}>PPO</th><th style={thS}>EPO</th><th style={thS}>HDHP/HSA</th></tr></thead>
          <tbody>
            {[
              ["PCP required?", "✓ Yes", "✕ No", "✕ No", "Varies"],
              ["Referral needed?", "✓ Yes", "✕ No", "✕ No", "Varies"],
              ["Out-of-network coverage?", "✕ Emergencies only", "✓ Yes (at higher cost)", "✕ Emergencies only", "Varies"],
              ["Monthly premium", "Lowest", "Highest", "Middle", "Lowest"],
              ["Deductible", "Low or none", "Moderate", "Moderate", "High ($1,650+/$3,300+ family)"],
              ["Best for", "Budget-conscious, routine care", "Maximum flexibility", "Flexibility + cost control", "Healthy, tax-savvy savers"],
              ["NHS analogy", "Closest to NHS model", "No NHS equivalent", "Partial NHS analogy", "No NHS equivalent"],
            ].map((r, i) => <tr key={i}>{r.map((c, j) => {
              const isCheck = typeof c === "string" && c.startsWith("✓");
              const isCross = typeof c === "string" && c.startsWith("✕");
              return <td key={j} style={{ ...tdS, ...(j === 0 ? { color: "#f1f5f9", fontWeight: 500 } : {}), ...(isCheck ? { color: "#2dd4bf" } : {}), ...(isCross ? { color: "#f87171" } : {}) }}>{c}</td>;
            })}</tr>)}
          </tbody>
        </table>
      </div>

      <TB>
        <P>A fourth category worth noting: <strong style={{color:"#fbbf24"}}>HDHP with HSA</strong> (High-Deductible Health Plan with Health Savings Account). These plans have low premiums but high deductibles ($1,650+ individual / $3,300+ family in 2025). The trade-off: you can contribute pre-tax dollars to a tax-advantaged HSA ($4,300 individual / $8,550 family in 2025), which rolls over year to year and can be invested. For healthy, high-income individuals, HDHPs function as both insurance and a tax shelter. For people with chronic conditions, the high deductible can be a barrier to accessing care.</P>
        <P>Medicare Advantage plans are essentially HMOs or PPOs offered by private insurers under Medicare. Traditional Medicare (Parts A+B) functions like a fee-for-service PPO with no network restrictions — any provider that accepts Medicare assignment is in-network. This is why some beneficiaries prefer traditional Medicare despite MA plans offering lower out-of-pocket costs: traditional Medicare provides unrestricted provider choice.</P>
      </TB>

      <SH>Retail Health & Pharmacy-Based Care</SH>
      <Sub>When your pharmacy tries to become your doctor's office</Sub>
      <TB>
        <P>One of the most distinctly American healthcare experiments of the past two decades has been the attempt by retail pharmacies to provide primary care services — and the mixed results are instructive about the economics of low-acuity medicine.</P>
      </TB>

      <FeatureCards cards={[
        { icon: "🏪", title: "CVS MinuteClinic / Oak Street Health", titleColor: "#f87171", body: "CVS operates 1,000+ walk-in and primary care clinics. MinuteClinics (staffed by NPs/PAs) handle vaccinations, minor illnesses, lab tests. Oak Street Health (acquired 2023 for $10.6B) provides Medicare-focused primary care with 300+ centers by 2026. Strategy: steer Aetna members into CVS-owned care. The vertically integrated play: insurance (Aetna) → clinic (Oak Street/MinuteClinic) → pharmacy (CVS) → PBM (Caremark)." },
        { icon: "💊", title: "Walgreens / VillageMD", titleColor: "#60a5fa", body: "Invested $10B+ in VillageMD to place doctor-staffed clinics in pharmacies. Result: $6B in losses, 160 clinic closures, and eventual divestiture. Recruiting physicians to work in retail settings proved extremely difficult. Now operating as a standalone company separate from VillageMD. A cautionary tale in retail health economics." },
        { icon: "🛒", title: "Walmart Health (Closed)", titleColor: "#64748b", body: "Opened 51 full-service health centers offering primary care, dental, behavioral health, and labs. Shut down entirely in 2024 despite revenue growth — operating costs exceeded reimbursement, particularly in markets with high Medicaid populations. Demonstrated that low-cost retail pricing couldn't overcome the fundamental economics of primary care delivery." },
        { icon: "💉", title: "Pharmacy Scope Expansion", titleColor: "#4ade80", body: "Pharmacists in many states can now prescribe for common conditions (UTIs, strep throat, flu antivirals, birth control), administer vaccines, order and interpret lab tests, and initiate/adjust some chronic disease medications. COVID-19 accelerated this dramatically — pharmacists administered hundreds of millions of vaccines. 46 states now allow pharmacist prescriptive authority for at least some conditions." },
      ]} />

      <Callout type="teal"><BT>Why retail health struggles:</BT> The core problem is reimbursement economics. A MinuteClinic NP visit for a sinus infection generates ~$100–150 in revenue. The NP's salary, facility costs, liability insurance, and administrative overhead consume most of that. There's no high-margin procedure to cross-subsidise (unlike a physician practice that can do in-office procedures). Retail clinics work as loss leaders to drive pharmacy foot traffic — but as standalone healthcare businesses, the margins are razor-thin. This is why Walmart and Walgreens exited and CVS is pivoting to higher-margin Medicare primary care through Oak Street.</Callout>

      <TB>
        <P>For a UK-trained clinician, the idea of walking into a Boots or Tesco and seeing a nurse practitioner for a prescription is roughly analogous — the UK has pharmacy-based minor illness services and Pharmacy First. But the US version is far more commercially driven: CVS isn't trying to offload pressure from the NHS. It's trying to capture a profitable segment of healthcare delivery and channel it through its vertically integrated insurance-pharmacy-PBM stack. The clinical care may be similar; the business logic is fundamentally different.</P>
      </TB>
    </>
  );
}

function InternationalComparison() {
  const spendData = [
    { name: "United States", value: 15474, color: "#f87171", gdp: "18.0%" },
    { name: "Australia", value: 7469, color: "#fbbf24", gdp: "10.3%" },
    { name: "Canada", value: 7301, color: "#a78bfa", gdp: "11.3%" },
    { name: "United Kingdom", value: 6200, color: "#60a5fa", gdp: "11.1%" },
    { name: "OECD Average", value: 5967, color: "#64748b", gdp: "9.3%" },
  ];
  const CustomTT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const item = spendData.find((d) => d.name === label);
    return (<div style={{ ...ttStyle, padding: "10px 14px", fontSize: "0.85rem" }}><div style={ttLabel}>{label}</div><div style={ttItem}>${payload[0].value.toLocaleString()} USD PPP</div>{item && <div style={ttItem}>GDP: {item.gdp}</div>}</div>);
  };
  const rows = [
    ["Funding model", "Multi-payer hybrid", "Tax-funded (Beveridge)", "Provincial single-payer", "Two-tier universal"],
    ["Per capita (USD PPP)", "$15,474 ⚠️", "~$6,200", "$7,301", "$7,469"],
    ["% GDP", "18.0% ⚠️", "11.1%", "11.3%", "10.3%"],
    ["Govt share", "~49%", "81%", "~71%", "~70%"],
    ["Universal coverage", "✕ 28M uninsured", "✓ Yes", "✓ Hospital/physician", "✓ Yes"],
    ["Life expectancy", "78.9 yr ⚠️", "81.3 yr", "81.7 yr", "83.0 yr"],
    ["Physicians/1,000", "2.7", "3.2", "2.7", "4.2"],
    ["Beds/1,000", "2.8", "2.4", "2.5", "3.8"],
    ["Elective waits", "Short (if insured)", "7.6M waiting list", "Median 27.7 wks", "Moderate (public)"],
    ["Drug coverage", "Part D / employer", "Included (£9.90 Rx)", "✕ Not universal", "PBS (subsidized)"],
    ["Admin costs (est.)", "25–30% ⚠️", "~12%", "~17%", "~15%"],
  ];
  const thS = { textAlign: "left", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontWeight: 600, padding: "11px 12px", borderBottom: "1px solid rgba(148,163,184,0.25)" };
  const tdS = { padding: "11px 12px", borderBottom: "1px solid rgba(148,163,184,0.12)", color: "#94a3b8", fontSize: "0.85rem", verticalAlign: "top" };
  return (
    <>
      <StatCards cards={[
        { label: "US Per Capita", value: "$15,474", note: "18.0% of GDP", color: "#f87171" },
        { label: "UK Per Capita", value: "~$6,200", note: "11.1% of GDP", color: "#60a5fa" },
        { label: "Canada Per Capita", value: "$7,301", note: "11.3% of GDP", color: "#a78bfa" },
        { label: "Australia Per Capita", value: "$7,469", note: "10.3% of GDP", color: "#fbbf24" },
      ]} />
      <ChartBox title="Health Spending Per Capita" subtitle="USD PPP (OECD Health at a Glance 2025)">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={spendData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" /><XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} /><YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} /><Tooltip content={<CustomTT />} /><Bar dataKey="value" radius={[4, 4, 0, 0]}>{spendData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart>
        </ResponsiveContainer>
      </ChartBox>
      <SH>Four Models, Four Trade-Offs</SH>
      <FeatureCards cards={[
        { icon: "🇺🇸", title: "US: Multi-Payer Hybrid", titleColor: "#f87171", body: "Employer + Medicare + Medicaid + ACA + uninsured. Highest spending, shortest waits (if insured), best tech access. But 28M uninsured, highest admin costs, worst equity. Life expectancy: 78.9 yr." },
        { icon: "🇬🇧", title: "UK: National Health Service", titleColor: "#60a5fa", body: "Single-payer, single-provider. Tax-funded, free at point of use. Universal. Low admin (~12%). Trade-off: 7.6M on waiting lists, A&E targets missed, £15.9B capital backlog. Life expectancy: 81.3 yr." },
        { icon: "🇨🇦", title: "Canada: Single-Payer", titleColor: "#a78bfa", body: "Provincial insurance covers hospital/physician. No user charges for covered services. But drugs, dental, vision mostly uncovered. Median 27.7 weeks GP to treatment. Life expectancy: 81.7 yr." },
        { icon: "🇦🇺", title: "Australia: Two-Tier Universal", titleColor: "#fbbf24", body: "Public Medicare covers all. Private insurance (46%) provides faster access. Government incentivizes private via tax surcharges. Dual system reduces public waits. Life expectancy: 83.0 yr." },
      ]} />
      <SH>Head-to-Head Comparison</SH>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", minWidth: 600 }}>
          <thead><tr><th style={thS}>Metric</th><th style={thS}>🇺🇸 US</th><th style={thS}>🇬🇧 UK</th><th style={thS}>🇨🇦 Canada</th><th style={thS}>🇦🇺 Australia</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => {
                  const isWarn = typeof cell === "string" && cell.includes("⚠️");
                  const isCheck = typeof cell === "string" && cell.startsWith("✓");
                  const isCross = typeof cell === "string" && cell.startsWith("✕");
                  return <td key={j} style={{ ...tdS, ...(j === 0 ? { color: "#f1f5f9", fontWeight: 500 } : {}), ...(isWarn ? { color: "#fbbf24", fontWeight: 600 } : {}), ...(isCheck ? { color: "#2dd4bf" } : {}), ...(isCross ? { color: "#f87171" } : {}) }}>{cell.replace(" ⚠️", "")}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout><B>The uncomfortable truth:</B> The US spends 2–2.5× more per person than any of these countries and has the worst population health outcomes among them. It also has the shortest waits and best access to cutting-edge therapeutics for those with good insurance. The question isn't "which system is better" — it's "better for whom, at what cost, and who bears the trade-offs."</Callout>
      <SH>What the US Does Better</SH>
      <FeatureCards cards={[
        { icon: "⚡", title: "Speed of Access", body: "Same-day specialist appointments, MRI within 48 hours, surgery within 1–2 weeks. The NHS 18-week target is routinely breached. Canadian median specialist wait: 27+ weeks." },
        { icon: "🔬", title: "Innovation & Technology", titleColor: "#fbbf24", body: "US accounts for ~45% of global pharma R&D. Fastest FDA approval pathways. Patients access new drugs 1–3 years before NICE/PBAC/CADTH approvals." },
        { icon: "🏆", title: "Cancer Outcomes", titleColor: "#60a5fa", body: "US 5-year cancer survival rates among highest globally — notably breast, prostate, colorectal. Reflects earlier detection and faster access to treatment." },
      ]} />
    </>
  );
}

function TheCrisis() {
  return (
    <>
      <StatCards cards={[
        { label: "ACA Subsidy Expiry", value: "–4.7M", note: "Projected enrollment drop 2026", color: "#f87171" },
        { label: "Health Share of GDP", value: "20.3%", note: "Projected by 2033", color: "#fbbf24" },
        { label: "Medicaid Cuts (est.)", value: "$1T+", note: "OBBBA over 10 years", color: "#a78bfa" },
        { label: "Projected Uninsured", value: "+10M", note: "By 2034 (CBO)", color: "#60a5fa" },
      ]} />
      <SH>Three Crises Converging</SH>
      <FeatureCards cards={[
        { icon: "📉", title: "ACA Subsidy Expiration", titleColor: "#f87171", body: "Enhanced Marketplace premium subsidies expired end of 2025. CMS projects 4.7M enrollment drop in 2026 (–12.3%). States with high Marketplace enrollment (FL, TX, CA) hardest hit. Insured rate projected to fall to ~90.9% by 2027." },
        { icon: "✂️", title: "Medicaid Restructuring", titleColor: "#fbbf24", body: "Reconciliation bill includes provisions CBO estimates will reduce Medicaid/ACA spending by $1T+ over a decade. Work requirements, more frequent eligibility checks, matching rate changes. CBO projects +10M uninsured by 2034." },
        { icon: "💰", title: "Unsustainable Cost Growth", titleColor: "#fb923c", body: "Healthcare grew 7.2% in 2024 vs GDP growth of 5.7%. Per capita projected to reach $24,200 by 2033. Hospital spending alone grew 8.9% to $1.635T. Health spending on track to exceed 20% of GDP within a decade." },
      ]} />
      <Callout type="red"><BR>The coverage cliff is real:</BR> Enhanced ACA subsidies made Marketplace coverage affordable for millions. Without them, a 60-year-old earning $60,000 could see their annual premium jump from ~$1,200 to $10,000+. Many will simply drop coverage and join the uninsured.</Callout>
      <SH>The Medicaid Squeeze</SH>
      <TB>
        <P>Medicaid already pays the lowest rates of any major payer — ~70% of Medicare. California's Medi-Cal reimbursement is particularly low, contributing to severe provider access problems: many physicians simply won't accept Medi-Cal because rates don't cover costs.</P>
        <P>The Medicaid unwinding removed 7+ million from rolls in 2024. Many disenrolled were younger, healthier — leaving a sicker, more expensive population. Per-enrollee spending jumped 16.6% in 2024, even as enrollment fell.</P>
        <P>Further federal restructuring — per-capita caps or block grants — shifts risk to states. States typically respond by cutting provider rates (worsening access), restricting benefits, or tightening eligibility. Downstream: more uninsured, more uncompensated care, more hospital financial distress.</P>
      </TB>
      <SH>Hospital Financial Stress</SH>
      <TB>
        <P>When hospitals lose insured patients, they lose the cross-subsidy margin. Over 150 rural hospitals have closed since 2010. Closures concentrate in states that didn't expand Medicaid — the "coverage gap" states.</P>
        <P>For ASCs, the math differs — most don't accept Medicaid. But hospital-based outpatient facilities must treat all comers. The 340B drug pricing program has become a critical revenue source for safety-net facilities, but it's also under political threat.</P>
      </TB>
      <Callout><B>The spiral:</B> Coverage losses → more uninsured → more uncompensated care → hospital financial distress → closures and service cuts → reduced access → worse outcomes → higher downstream costs. This is the observed pattern in non-expansion states, now at risk of accelerating nationally.</Callout>
    </>
  );
}

function HonestAssessment() {
  const tradeoffs = [
    ["Universal coverage", "Higher taxes or less provider choice", "UK covers everyone; GP referral required"],
    ["No wait times", "Higher prices and/or uninsured population", "US: fast if insured, but 28M without coverage"],
    ["Drug price controls", "Potentially slower access to new drugs", "NICE rejects drugs available in US; costs 2–3× less"],
    ["Low admin costs", "Single-payer or tight payer regulation", "Canada ~17% vs US ~25-30%; one payer"],
    ["High physician salaries", "Higher total system cost", "US anesthesiologists earn 2–3× UK equivalents"],
    ["Innovation leadership", "Someone pays for R&D (currently US consumers)", "US = ~45% of global pharma R&D spending"],
  ];
  const thS = { textAlign: "left", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontWeight: 600, padding: "11px 12px", borderBottom: "1px solid rgba(148,163,184,0.25)" };
  const tdS = { padding: "11px 12px", borderBottom: "1px solid rgba(148,163,184,0.12)", color: "#94a3b8", fontSize: "0.85rem", verticalAlign: "top" };
  return (
    <>
      <SH>An Honest Assessment</SH>
      <Sub>What the data actually tells us, stripped of political framing</Sub>
      <Callout type="teal"><BT>The core problem is not a mystery.</BT> The US pays higher prices for the same services, medications, and devices than any other developed nation. It uses roughly the same amount of healthcare per capita. The spending gap is almost entirely explained by prices, administrative costs, and pharmaceutical margins — not overutilization.</Callout>
      <SH>What the Evidence Shows</SH>
      <FeatureCards cards={[
        { icon: "📊", title: "It's the Prices", body: "Papanicolas et al. 2018 (JAMA): the US doesn't use more healthcare — it pays more. Physician salaries 2–3× higher, drug prices 2–3× higher, hospital per-diem costs higher. Utilization similar to or lower than OECD peers." },
        { icon: "🏗️", title: "Administrative Waste Is Real", titleColor: "#fbbf24", body: "Hospital admin costs: $687B in 2023 — nearly 2× the $346B in direct patient care. Multi-payer system = dozens of insurers with different rules. McKinsey estimates $265B/year in achievable savings." },
        { icon: "💊", title: "Drug Pricing Is an Outlier", titleColor: "#f87171", body: "Rx spending: $467B in 2024 (+7.9%). Only major economy that historically didn't negotiate drug prices. PBM rebate structures and DTC advertising (legal only in US and NZ) inflate costs further." },
        { icon: "🏥", title: "Consolidation Raises Prices", titleColor: "#60a5fa", body: "Hospital mergers → 20–40% price increases without quality improvement. Physician practice acquisitions convert outpatient visits into higher-cost 'facility fee' visits. Market power works in one direction: up." },
      ]} />
      <Divider />
      <SH>The Trade-Offs Nobody Wants to Discuss</SH>
      <TB><P>Every healthcare system makes trade-offs. The political debate typically pretends these don't exist — that you can have universal coverage, zero wait times, unlimited choice, and cutting-edge innovation all at lower cost. You can't.</P></TB>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", minWidth: 550 }}>
          <thead><tr><th style={thS}>If You Want</th><th style={thS}>You Have to Accept</th><th style={thS}>Example</th></tr></thead>
          <tbody>{tradeoffs.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ ...tdS, ...(j === 0 ? { color: "#f1f5f9", fontWeight: 500 } : {}) }}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <Divider />
      <SH>What Would Actually Help</SH>
      <Sub>Evidence-based reforms most health economists agree on, regardless of political alignment</Sub>
      <FeatureCards cards={[
        { icon: "📋", title: "Standardize Admin Processes", body: "Single claims format, standardized prior auth, universal credentialing, interoperable EHR. Could save ~$265B/year. Doesn't require single-payer — just agreement on forms. Germany and Switzerland have done this with multi-payer." },
        { icon: "💰", title: "Reference Pricing for Drugs", titleColor: "#fbbf24", body: "Set US drug prices relative to comparable countries. IRA Medicare negotiation is a start but covers too few drugs. Extending to all federal payers and creating all-payer reference pricing would address the largest price differential." },
        { icon: "🔍", title: "Enforce Price Transparency", titleColor: "#60a5fa", body: "Hospital price transparency rules exist but compliance is partial. Making negotiated rates genuinely accessible and creating comparison tools would introduce actual competition. The current system isn't a market — it's a negotiation between powerful intermediaries." },
        { icon: "🏥", title: "Anti-Consolidation Enforcement", titleColor: "#4ade80", body: "Enforce antitrust in healthcare with the same rigor as other industries. Block anti-competitive mergers. Address the 'facility fee' loophole. Politically challenging — hospital systems are major employers and donors." },
      ]} />
      <Callout><B>The bottom line:</B> The US spends $5.3 trillion/year on healthcare — more per person than any nation on earth — and achieves middling population health outcomes. The spending is driven by higher prices, not higher utilization. Administrative complexity consumes a quarter of every dollar. These are structural problems with known solutions. Whether the political system can implement them is a different question entirely.</Callout>
      <div style={{ marginTop: 28, color: "#64748b", fontSize: "0.82rem", fontStyle: "italic", lineHeight: 1.7 }}>Written for clinicians who trained in single-payer systems and wonder how the US version works. Data: CMS NHE Accounts (2024), OECD Health at a Glance 2025, Health Affairs, CIHI NHEX 2025, AIHW, UK House of Commons Library, The King's Fund, Peterson-KFF, Commonwealth Fund. All figures most recent available as of April 2026.</div>
    </>
  );
}

function TheInsurers() {
  const denialData = [
    { name: "Kaiser Permanente", rate: 6, color: "#4ade80" },
    { name: "BCBS (avg)", rate: 15, color: "#60a5fa" },
    { name: "Cigna", rate: 17, color: "#a78bfa" },
    { name: "UnitedHealth", rate: 20, color: "#fbbf24" },
    { name: "Aetna", rate: 22, color: "#fb923c" },
    { name: "Oscar Health", rate: 25, color: "#f87171" },
  ];
  const thS = { textAlign: "left", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontWeight: 600, padding: "11px 12px", borderBottom: "1px solid rgba(148,163,184,0.25)" };
  const tdS = { padding: "11px 12px", borderBottom: "1px solid rgba(148,163,184,0.12)", color: "#94a3b8", fontSize: "0.85rem", verticalAlign: "top" };
  return (
    <>
      <StatCards cards={[
        { label: "ACA Denial Rate (2024)", value: "19%", note: "Tied for highest on record", color: "#f87171" },
        { label: "Claims Appealed", value: "<1%", note: "Of denied claims", color: "#fbbf24" },
        { label: "Appeals Overturned", value: "44%", note: "When patients do appeal", color: "#4ade80" },
        { label: "Industry Revenue", value: "$1.6T", note: "Private insurance 2024", color: "#60a5fa" },
      ]} />

      <SH>How Claims Get Decided</SH>
      <Sub>The lifecycle of a medical claim in the US</Sub>
      <TB>
        <P>When you receive care in the US, the provider submits a claim to the insurer using standardized CPT/ICD-10 codes. For many services — particularly imaging, specialty drugs, surgery, and anything above a cost threshold — the insurer requires <em>prior authorization</em> (PA) before the service is provided. The claim then enters a review pipeline that varies by insurer but typically follows this sequence:</P>
      </TB>

      <FeatureCards cards={[
        { icon: "1️⃣", title: "Pre-Service Review (PA)", titleColor: "#60a5fa", body: "Provider submits clinical documentation justifying the service. Insurer reviews against internal medical policies and evidence guidelines. CMS requires MA plans to respond within 24 hours (urgent) or 7 days (standard). Commercial plans vary — some take 15–30 days." },
        { icon: "2️⃣", title: "Claims Adjudication", titleColor: "#4ade80", body: "After service delivery, the claim is auto-adjudicated against rules engines — checking eligibility, benefit design, coding accuracy, duplicate claims, and bundling rules. Most clean claims are paid automatically within 30–45 days. Roughly 80–85% of claims pass without issue." },
        { icon: "3️⃣", title: "Denial & Review", titleColor: "#fbbf24", body: "~15–19% of claims are initially denied. Common reasons: administrative errors (25%), excluded services (13%), lack of prior auth (9%), medical necessity (5%), and 'other' (36%). The provider or patient can appeal — but fewer than 1% of denied claims are ever appealed." },
        { icon: "4️⃣", title: "Appeals Process", titleColor: "#f87171", body: "Internal appeal: insurer reviews with a different reviewer. If upheld, external appeal to an independent review organization (IRO). When patients do appeal, 44% of internal appeals are overturned. External appeals are harder to track but often favor the patient. Most people never reach this stage." },
      ]} />

      <Callout type="red"><BR>The denial-appeal gap:</BR> Insurers denied ~8.8 million in-network ACA claims in 2024. Fewer than 1% were appealed. Of those appealed, 44% were overturned — meaning the care should have been approved. This suggests millions of legitimate claims go unpaid simply because patients don't know they can appeal, or lack the resources to do so. Providers spend an estimated $19.7B/year on claims review, more than half on claims that are eventually paid anyway.</Callout>

      <SH>Denial Rates by Insurer</SH>
      <Sub>ACA Marketplace in-network claim denial rates, Plan Year 2024</Sub>

      <ChartBox title="Claim Denial Rate by Insurer" subtitle="Percentage of in-network claims denied (HealthCare.gov plans, 2024)">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={denialData} layout="vertical" margin={{ left: 120 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" /><XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} domain={[0, 30]} tickFormatter={(v) => `${v}%`} /><YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} width={118} /><Tooltip contentStyle={ttStyle} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v) => [`${v}%`, "Denial Rate"]} /><Bar dataKey="rate" radius={[0, 4, 4, 0]}>{denialData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart>
        </ResponsiveContainer>
      </ChartBox>

      <TB>
        <P>The nearly 20-percentage-point gap between Kaiser Permanente (~6%) and the highest-denying insurers illustrates how much model structure matters. Kaiser's integrated model — where the insurer, hospital, and physician group are part of the same organization — eliminates the adversarial dynamic between payer and provider. There's no incentive to deny care when you're also the one delivering it.</P>
      </TB>

      <SH>The Big Five: Who Controls US Health Insurance</SH>
      <Sub>Market concentration and business models</Sub>

      <FeatureCards cards={[
        { icon: "🏢", title: "UnitedHealth Group", titleColor: "#fbbf24", body: "Largest US health company. UnitedHealthcare (insurance, ~52M members) + Optum (care delivery, PBM, data analytics, ~100M patients touched). Revenue: $372B (2023). Vertically integrated: owns clinics, surgery centers, home health, and OptumRx (one of three dominant PBMs). Increasingly acts as payer, provider, and pharmacy simultaneously." },
        { icon: "🏢", title: "Elevance Health (Anthem)", titleColor: "#60a5fa", body: "~46M members across 14 Blue Cross Blue Shield states. Largest BCBS licensee. Operates Carelon (care delivery, behavioral health, pharmacy). Revenue: $171B (2023). Strong government segment — largest commercial Medicaid managed care insurer." },
        { icon: "🏢", title: "CVS Health / Aetna", titleColor: "#f87171", body: "CVS acquired Aetna in 2018 for $69B. ~25M Aetna members + CVS retail pharmacies (9,000+) + CVS Caremark (PBM, ~110M lives). Minute Clinics expanding to primary care. Another vertically integrated stack: insurance + pharmacy + PBM + clinics." },
        { icon: "🏢", title: "Cigna / Express Scripts", titleColor: "#4ade80", body: "Cigna merged with Express Scripts (PBM) in 2018. ~18M medical members, but Express Scripts covers ~100M pharmacy lives. Sold Medicare/Medicaid businesses. Revenue: $195B (2023). Primarily employer-sponsored commercial market." },
        { icon: "🏢", title: "Humana", titleColor: "#a78bfa", body: "Primarily Medicare-focused: ~16M members, ~5M in Medicare Advantage (2nd largest MA insurer after UHG). Revenue: $106B (2023). CenterWell (primary care clinics, home health, pharmacy). Being acquired by Cigna — deal pending regulatory review." },
      ]} />

      <Callout><B>Vertical integration is the trend:</B> The major insurers are no longer just insurance companies. They own PBMs, clinics, surgery centers, home health agencies, data analytics platforms, and pharmacies. UnitedHealth Group alone employs or contracts with 90,000+ physicians. This concentration raises serious antitrust questions — when your insurer also owns the pharmacy, the PBM, the clinic, and the data platform, the incentive alignment favors the corporate entity, not necessarily the patient.</Callout>

      <SH>The Kaiser Model: What's Different</SH>
      <Sub>Why one system consistently outperforms</Sub>
      <TB>
        <P>Kaiser Permanente serves 12.6 million members across 40 hospitals and 610 medical facilities in 10 states. It's structured as three interlocking nonprofits: Kaiser Foundation Health Plan (insurance), Kaiser Foundation Hospitals (facilities), and the Permanente Medical Groups (physicians — who are salaried, not fee-for-service).</P>
        <P>The key structural difference: Kaiser is prepaid. Members pay dues; Kaiser is then responsible for their health. This inverts the fee-for-service incentive entirely — instead of being rewarded for doing more, Kaiser benefits from keeping people healthy. Physicians are salaried with no volume incentives. The insurer and provider share a single EHR, eliminating the billing/coding friction that drives administrative costs elsewhere.</P>
        <P>The results are measurable: Kaiser's ACA marketplace denial rate is ~6% versus the industry average of 19%. Colon cancer patients at Kaiser Southern California showed 25% lower mortality than other insured patients, with no socioeconomic disparities in outcomes. Their chronic disease management programs (diabetes, hypertension, heart failure) consistently outperform national benchmarks. HEDIS quality scores routinely rank in the top decile nationally.</P>
        <P>The limitation: Kaiser's model requires scale and geographic concentration. It works in California, Colorado, and the Pacific Northwest where KP has density. It's difficult to replicate in rural or fragmented markets. And members must use Kaiser facilities — there's no out-of-network option except for emergencies. For clinicians used to the NHS, Kaiser is probably the closest US analogue to an integrated system, though members still pay premiums, copays, and coinsurance.</P>
      </TB>

      <SH>How Medical Necessity Gets Decided</SH>
      <TB>
        <P>When an insurer reviews a prior authorization or disputed claim for "medical necessity," they're applying internal clinical policies — often based on published guidelines (ACC/AHA, NCCN, ASA, etc.) but interpreted and sometimes narrowed by the insurer's own medical directors. The review hierarchy typically runs: automated rules engine → nurse reviewer → physician reviewer (same specialty as the request) → medical director.</P>
        <P>Medicare has explicit coverage determination processes: National Coverage Determinations (NCDs) and Local Coverage Determinations (LCDs) with public comment periods. Private insurers have no equivalent transparency requirement — their medical policies are proprietary. This means two patients with the same diagnosis at the same hospital can get different coverage decisions depending on which insurer they have, because each insurer applies its own medical necessity criteria.</P>
        <P>Medicare Advantage adds another layer: MA plans can apply prior authorization more aggressively than traditional Medicare. A 2022 OIG report found that 13% of MA prior auth denials met Medicare coverage rules and should have been approved — representing care that Medicare would have covered but the MA plan refused. CMS has since tightened MA rules, but enforcement remains a challenge.</P>
      </TB>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", minWidth: 550 }}>
          <thead><tr><th style={thS}>Payer Type</th><th style={thS}>Initial Denial Rate</th><th style={thS}>PA Required?</th><th style={thS}>Response Time</th><th style={thS}>Appeal Success</th></tr></thead>
          <tbody>
            {[
              ["Traditional Medicare", "~8.4%", "Limited (some DME, drugs)", "NCDs/LCDs published", "~50% (ALJ level)"],
              ["Medicare Advantage", "~15.7%", "Extensive", "24hr urgent / 7 days std", "~44–54%"],
              ["Commercial (employer)", "~11–14%", "Varies by plan", "Varies (often 15–30 days)", "~54%"],
              ["ACA Marketplace", "~19%", "Varies by insurer", "Varies widely", "~44%"],
              ["Medicaid (managed care)", "~15.1%", "Moderate", "State-regulated", "Varies by state"],
            ].map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ ...tdS, ...(j === 0 ? { color: "#f1f5f9", fontWeight: 500 } : {}) }}>{c}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    </>
  );
}

function DrugsAndInnovation() {
  const patentCliffData = [
    { name: "Keytruda", value: 29.3, color: "#f87171" },
    { name: "Eliquis", value: 13.0, color: "#fb923c" },
    { name: "Trulicity", value: 10.5, color: "#fbbf24" },
    { name: "Stelara", value: 7.7, color: "#a78bfa" },
    { name: "Entresto", value: 7.8, color: "#60a5fa" },
    { name: "Ibrance", value: 5.1, color: "#4ade80" },
  ];
  return (
    <>
      <StatCards cards={[
        { label: "US Rx Spending 2024", value: "$467B", note: "↑ 7.9% from 2023", color: "#f87171" },
        { label: "Patent Cliff 2025–30", value: "$200B+", note: "Annual branded revenue at risk", color: "#fbbf24" },
        { label: "FDA Novel Approvals", value: "~50/yr", note: "New molecular entities", color: "#4ade80" },
        { label: "US Share of Global R&D", value: "~45%", note: "Of pharma R&D spending", color: "#60a5fa" },
      ]} />

      <SH>How Drug Pricing Works in the US</SH>
      <Sub>The system that produces $100,000 cancer drugs and $300 insulin</Sub>
      <TB>
        <P>In the NHS, NICE evaluates a drug's cost-effectiveness (typically £20–30k per QALY threshold), negotiates a price with the manufacturer, and the drug either gets approved for NHS use or it doesn't. Patients pay a flat prescription charge (£9.90 in England, free in Scotland/Wales). In the US, there is no equivalent single price-setter. Instead, drug pricing emerges from a labyrinth of manufacturers, PBMs, insurers, formulary committees, and federal programs — each with different incentives.</P>
        <P>A manufacturer sets a "list price" (WAC — Wholesale Acquisition Cost). The PBM negotiates rebates off that price (typically 20–50% for brand drugs). The insurer sets the formulary tier (Tier 1: generics, low copay; Tier 2: preferred brands; Tier 3: non-preferred; Tier 4–5: specialty drugs with coinsurance). The patient pays according to their plan's cost-sharing structure — which can mean $10 for a generic or $10,000+ for a specialty biologic before reaching their out-of-pocket maximum.</P>
        <P>The result: the same drug can cost dramatically different amounts depending on who's paying. Medicare now negotiates prices for 10 drugs (expanding to 60+ by 2029) under the IRA. But the vast majority of drug prices are still set by the manufacturer and modified through opaque PBM rebate negotiations. The US is the only major economy where this is the case.</P>
      </TB>

      <SH>The Patent System & Drug Lifecycle</SH>
      <Sub>20 years on paper, 8–12 years of actual market exclusivity</Sub>

      <FeatureCards cards={[
        { icon: "🔬", title: "Discovery to Market: 10–15 Years", titleColor: "#60a5fa", body: "A US patent lasts 20 years from filing. But drug development takes 8–15 years: preclinical (3–6 yr), Phase I–III trials (6–10 yr), FDA review (1–2 yr). If a patent is filed at discovery, only 5–12 years of commercial exclusivity remain after approval. Average cost to develop: $2.3B (PhRMA estimate, disputed — independent estimates range $1–2B)." },
        { icon: "📄", title: "Patent Thickets & Evergreening", titleColor: "#fbbf24", body: "Branded manufacturers don't rely on a single patent. They file dozens covering the molecule, formulation, dosing regimen, delivery device, and manufacturing process — creating 'patent thickets.' Humira had 130+ patents. Each additional patent can delay generic entry by years. The FTC and courts are increasingly pushing back: in 2024, a federal court removed device patents from Teva's Orange Book listing for ProAir HFA." },
        { icon: "📋", title: "The Hatch-Waxman Framework", titleColor: "#4ade80", body: "The 1984 Hatch-Waxman Act created the ANDA (Abbreviated New Drug Application) pathway: generics prove bioequivalence to the brand drug without repeating full clinical trials. Paragraph IV challenge: a generic manufacturer can challenge the brand's patent before expiry. First filer gets 180 days of market exclusivity. This creates a 'race to file' that drives early generic entry — but also triggers automatic 30-month litigation stays." },
        { icon: "🧬", title: "Biologics & Biosimilars", titleColor: "#a78bfa", body: "Biologics (antibodies, proteins, cell therapies) follow a different path: 12 years of exclusivity under the BPCIA (2010), with biosimilar approval requiring demonstration of 'high similarity' — more complex and expensive than generic small-molecule drugs. Biosimilars typically capture market share more slowly than generics (30–40% in year 1 vs 90% for small molecules). The first Humira biosimilars launched in 2023; prices dropped ~60% within 18 months." },
      ]} />

      <SH>The $200 Billion Patent Cliff</SH>
      <Sub>The largest wave of drug patent expirations in pharmaceutical history</Sub>

      <ChartBox title="Blockbuster Drugs Facing Patent Expiry 2025–2030" subtitle="Annual global sales, billions (2024)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={patentCliffData} layout="vertical" margin={{ left: 80 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" /><XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} tickFormatter={(v) => `$${v}B`} /><YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} width={78} /><Tooltip contentStyle={ttStyle} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v) => [`$${v}B`, "2024 Sales"]} /><Bar dataKey="value" radius={[0, 4, 4, 0]}>{patentCliffData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart>
        </ResponsiveContainer>
      </ChartBox>

      <Callout><B>The cliff is real and imminent:</B> Between 2025 and 2030, drugs generating over $200B in annual branded revenue will lose patent exclusivity. Keytruda alone ($29.3B) faces biosimilar competition from 2028. When generics launch for small-molecule drugs, they typically capture 90% of the market within 18 months and prices drop 60–80%. Merck is investing $12B in next-gen cancer drugs to replace Keytruda revenue. The industry response: M&A acceleration — Bristol Myers bought Karuna for $4.1B, AbbVie bought Cerevel for $8.7B.</Callout>

      <SH>The FDA: Gatekeeper Under Stress</SH>
      <TB>
        <P>The FDA approves ~50 novel drugs per year and oversees the safety of all marketed drugs, biologics, devices, and food. It's funded partly by congressional appropriation and partly by user fees (PDUFA fees paid by drug companies to fund review staff — ~$2.7M per new drug application). Review timelines: standard review ~12 months, priority review ~8 months, breakthrough therapy ~6 months, accelerated approval (based on surrogate endpoints) even faster.</P>
        <P>The agency is currently under significant strain. The 2025 reduction in force (20% staff cut) excluded drug reviewers but affected support staff, slowing operations. FDA has missed several approval deadlines in 2025. Commissioner Makary has signalled a desire for faster approvals, but the appointment of critics of the current approval process to senior positions has created uncertainty. For generic drugs, product-specific guidance documents that help manufacturers prepare complete applications are at risk of delays — potentially slowing the very generic entries that could reduce drug costs.</P>
      </TB>

      <SH>Quality Assurance: From FDA to Pharmacy Shelf</SH>
      <Sub>How the US ensures drug safety — and where the system breaks down</Sub>

      <FeatureCards cards={[
        { icon: "🏭", title: "Manufacturing Standards (cGMP)", titleColor: "#60a5fa", body: "All drugs sold in the US must be manufactured under Current Good Manufacturing Practices (cGMP). FDA inspects domestic and foreign manufacturing facilities. ~78% of active pharmaceutical ingredients (APIs) used in the US are manufactured overseas (primarily India and China). FDA conducts ~3,000 foreign inspections/year, but the supply chain's offshore concentration is a recognised vulnerability." },
        { icon: "📊", title: "Post-Market Surveillance", titleColor: "#4ade80", body: "FDA monitors safety after approval via the Adverse Event Reporting System (FAERS), REMS (Risk Evaluation and Mitigation Strategies) for high-risk drugs, and required post-marketing studies. Drug recalls averaged ~70/year over the past decade. The system is reactive — it depends on voluntary reporting by physicians and patients, which significantly underestimates true adverse event rates." },
        { icon: "💊", title: "Generic Equivalence", titleColor: "#fbbf24", body: "FDA requires generics to demonstrate bioequivalence: same active ingredient, dosage form, strength, route of administration, and comparable blood levels (within 80–125% of the brand). For most drugs, this ensures clinical equivalence. For narrow therapeutic index drugs (warfarin, levothyroxine, some anti-epileptics), even small differences matter — some physicians and patients prefer brand for these drugs." },
        { icon: "⚠️", title: "Drug Shortages", titleColor: "#f87171", body: "The US experiences ~300 active drug shortages at any time, particularly generic injectables (local anesthetics, chemotherapy, antibiotics). Root causes: thin margins on generics incentivize manufacturers to exit unprofitable products, offshore supply chain concentration, and just-in-time manufacturing with no stockpile. For anesthesiologists, drug shortages are a daily operational reality — propofol, succinylcholine, and bupivacaine have all faced recent shortages." },
      ]} />

      <Callout type="teal"><BT>The NICE comparison:</BT> In the UK, NICE rejection means a drug isn't available on the NHS (though patients can pay privately via the Cancer Drugs Fund or individual funding requests). In the US, FDA approval means the drug is legal to sell — but whether you can actually <em>access</em> it depends on whether your insurer covers it, which formulary tier it's on, what your copay/coinsurance is, and whether prior authorization is required. FDA says yes; your insurance says "let's see." This is fundamentally different from the NHS model where NICE approval = NHS availability.</Callout>
    </>
  );
}

function HealthOutcomes() {
  const lifeExpData = [
    { name: "Australia", value: 83.0, color: "#fbbf24" },
    { name: "Japan", value: 84.5, color: "#fb923c" },
    { name: "Canada", value: 81.7, color: "#a78bfa" },
    { name: "UK", value: 81.3, color: "#60a5fa" },
    { name: "OECD Avg", value: 81.1, color: "#64748b" },
    { name: "United States", value: 79.0, color: "#f87171" },
  ];
  const infantMortData = [
    { name: "Japan", value: 1.7, color: "#4ade80" },
    { name: "Norway", value: 1.6, color: "#2dd4bf" },
    { name: "Australia", value: 3.2, color: "#fbbf24" },
    { name: "UK", value: 3.5, color: "#60a5fa" },
    { name: "Canada", value: 4.3, color: "#a78bfa" },
    { name: "OECD Avg", value: 4.2, color: "#64748b" },
    { name: "United States", value: 5.4, color: "#f87171" },
  ];
  return (
    <>
      <StatCards cards={[
        { label: "US Life Expectancy", value: "79.0 yr", note: "2024 (record high)", color: "#f87171" },
        { label: "OECD Peer Avg", value: "82.7 yr", note: "3.7 years longer", color: "#4ade80" },
        { label: "US Infant Mortality", value: "5.4/1k", note: "Ranked 33rd of 38 OECD", color: "#fbbf24" },
        { label: "Maternal Mortality", value: "17/100k", note: "3× most peer nations", color: "#a78bfa" },
      ]} />

      <SH>Life Expectancy: The Headline Metric</SH>
      <Sub>Years of life at birth, most recent data</Sub>

      <ChartBox title="Life Expectancy at Birth" subtitle="Years (most recent available data, OECD / CDC)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={lifeExpData} layout="vertical" margin={{ left: 85 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" /><XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} domain={[74, 86]} /><YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} width={82} /><Tooltip contentStyle={ttStyle} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v) => [`${v} years`, "Life Expectancy"]} /><Bar dataKey="value" radius={[0, 4, 4, 0]}>{lifeExpData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart>
        </ResponsiveContainer>
      </ChartBox>

      <Callout type="teal"><BT>Context matters:</BT> US life expectancy hit 79.0 years in 2024, its highest ever — but comparable wealthy nations average 82.7 years. The 3.7-year gap has been widening since 2003, when the US was only 0.2 years behind the OECD average. The gap was widest during COVID (3.7 years in 2021) and hasn't meaningfully closed.</Callout>

      <SH>Infant and Maternal Mortality</SH>
      <Sub>Where spending and outcomes diverge most sharply</Sub>

      <ChartBox title="Infant Mortality Rate" subtitle="Deaths per 1,000 live births">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={infantMortData} layout="vertical" margin={{ left: 85 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" /><XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} domain={[0, 7]} /><YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} width={82} /><Tooltip contentStyle={ttStyle} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v) => [`${v}/1,000`, "Infant Mortality"]} /><Bar dataKey="value" radius={[0, 4, 4, 0]}>{infantMortData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart>
        </ResponsiveContainer>
      </ChartBox>

      <TB>
        <P>US infant mortality (5.4 per 1,000 live births) is higher than all but five OECD nations. Even adjusting for reporting differences — the US and Canada register a higher proportion of very-low-birthweight deaths — the adjusted US rate (4.9) still exceeds the peer average of 2.9. US maternal mortality (17 per 100,000 live births) is over 3× the rate in most comparable countries.</P>
        <P>Racial disparities are stark: Black infant mortality is 10.9 per 1,000, 3.1× the rate for Asian Americans (3.5). Mississippi's infant mortality (9.0) is more than double the OECD average. New Hampshire (3.2) performs on par with Germany and Australia — demonstrating that some US states achieve world-class outcomes while others rival middle-income countries.</P>
      </TB>

      <SH>Where the US Excels</SH>
      <Sub>Outcomes that money can buy — for those with access</Sub>

      <FeatureCards cards={[
        { icon: "🎗️", title: "Cancer Survival", titleColor: "#4ade80", body: "US 5-year survival rates for breast, prostate, and colorectal cancer are among the highest globally. Aggressive screening programs, rapid access to treatment, and early adoption of novel therapeutics contribute. The gap is particularly pronounced for prostate cancer (97% 5-year survival vs ~85% in the UK)." },
        { icon: "❤️", title: "Acute Cardiac Care", titleColor: "#f87171", body: "30-day mortality after AMI in the US is lower than in many OECD countries. US door-to-balloon times for STEMI are among the shortest. When you're insured and within reach of a PCI-capable center, acute cardiac care is excellent." },
        { icon: "🏥", title: "Surgical Capacity", titleColor: "#60a5fa", body: "No meaningful wait for elective surgery (if insured). The UK has 7.6M people on surgical waiting lists. Canada's median GP-to-treatment time is 27.7 weeks. A US patient with a PPO can often see a specialist within a week and schedule surgery within 2–3 weeks." },
        { icon: "💊", title: "Drug Access", titleColor: "#fbbf24", body: "New drugs reach US patients 1–3 years before NICE (UK), CADTH (Canada), or PBAC (Australia) approve them. The trade-off: US patients pay vastly more for those drugs, and drug coverage is fragmented across plans with varying formularies and copay structures." },
      ]} />

      <SH>Where the US Underperforms</SH>
      <Sub>Population health failures that spending doesn't fix</Sub>

      <FeatureCards cards={[
        { icon: "🫀", title: "Chronic Disease Burden", titleColor: "#f87171", body: "30% of US adults report 2+ chronic conditions (highest among OECD). Obesity rate 42.8% — nearly 2× the OECD average (25%). Diabetes prevalence ~11%. These drive the spending-outcomes gap: the US treats chronic disease expensively rather than preventing it effectively." },
        { icon: "🧠", title: "Mental Health", titleColor: "#a78bfa", body: "~22% of US adults have a mental health condition. Access to treatment is limited by insurance coverage, provider shortages (especially in rural areas), and prior authorization barriers. The US has one of the highest rates of deaths of despair (suicide, overdose, alcoholic liver disease) in the OECD." },
        { icon: "🏘️", title: "Health Equity", titleColor: "#fbbf24", body: "The within-country variation is staggering. Life expectancy in Hawaii (80.7) vs Mississippi (71.9) is a 9-year gap — wider than the gap between the US and most developing nations. Black Americans have a life expectancy of 74.8 years; Asian Americans 85.6 years. The system produces excellent care for some and catastrophic neglect for others." },
        { icon: "🩺", title: "Primary Care Access", titleColor: "#60a5fa", body: "The US has 2.7 physicians per 1,000 population vs 4.2 in Australia. More critically, the US underinvests in primary care relative to specialist and hospital care. ~5-6% of health spending goes to primary care vs 12-14% in the UK. Weak primary care means more unmanaged chronic disease and more expensive downstream acute care." },
      ]} />

      <Callout><B>The paradox in one sentence:</B> The US has the world's best healthcare for a 65-year-old with employer insurance who develops cancer in Boston, and some of the worst healthcare outcomes in the developed world for a 30-year-old uninsured diabetic in rural Mississippi. The average hides two completely different realities.</Callout>

      <SH>The Integrated Care Evidence</SH>
      <Sub>What Kaiser Permanente's outcomes tell us about system design</Sub>
      <TB>
        <P>Kaiser Permanente's outcomes data provides a natural experiment in what the US system could achieve with aligned incentives. Their colon cancer patients show 25% lower mortality than other insured patients, with no socioeconomic disparities. Their diabetes management, hypertension control, and screening rates consistently exceed national benchmarks. Their claim denial rate (~6%) is one-third the industry average.</P>
        <P>The lesson isn't that Kaiser is perfect — it has its own challenges with wait times, mental health access, and geographic limitations. The lesson is that when you align incentives (prepaid capitation), integrate data (one shared EHR), employ physicians on salary (removing volume incentives), and invest in prevention (because you bear the cost of disease), outcomes improve and costs moderate. The rest of the US system does the opposite on every dimension.</P>
      </TB>
    </>
  );
}

function WorkforceEconomics() {
  const compData = [
    { name: "Anesthesiologist", value: 428, color: "#f87171" },
    { name: "Surgeon (general)", value: 402, color: "#fb923c" },
    { name: "Cardiologist", value: 385, color: "#fbbf24" },
    { name: "CRNA", value: 232, color: "#4ade80" },
    { name: "NP (primary care)", value: 125, color: "#60a5fa" },
    { name: "PA (surgical)", value: 130, color: "#a78bfa" },
    { name: "Resident (PGY-1)", value: 65, color: "#64748b" },
  ];
  const thS = { textAlign: "left", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: 1.5, color: "#64748b", fontWeight: 600, padding: "11px 12px", borderBottom: "1px solid rgba(148,163,184,0.25)" };
  const tdS = { padding: "11px 12px", borderBottom: "1px solid rgba(148,163,184,0.12)", color: "#94a3b8", fontSize: "0.85rem", verticalAlign: "top" };
  return (
    <>
      <StatCards cards={[
        { label: "Medicare GME Funding", value: "$21.2B", note: "FY2023 (DGME + IME)", color: "#60a5fa" },
        { label: "CRNAs in US", value: "59,000+", note: "58M+ anesthetics/year", color: "#4ade80" },
        { label: "NPs in Practice", value: "385,000+", note: "Full practice in 28 states", color: "#a78bfa" },
        { label: "Residents in Training", value: "~155,000", note: "FTE caps frozen since 1996", color: "#fbbf24" },
      ]} />

      <SH>The Economics of Midlevel & Advanced Practice Providers</SH>
      <Sub>How the US uses workforce substitution to manage costs — and the politics behind it</Sub>

      <ChartBox title="Annual Compensation by Provider Type" subtitle="Mean total compensation, thousands (2023–2024 data)">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={compData} layout="vertical" margin={{ left: 125 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" /><XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} tickFormatter={(v) => `$${v}k`} /><YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={{ stroke: "rgba(148,163,184,0.2)" }} width={122} /><Tooltip contentStyle={ttStyle} labelStyle={ttLabel} itemStyle={ttItem} formatter={(v) => [`$${v}k`, "Compensation"]} /><Bar dataKey="value" radius={[0, 4, 4, 0]}>{compData.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar></BarChart>
        </ResponsiveContainer>
      </ChartBox>

      <Callout type="teal"><BT>For the UK-trained clinician:</BT> The US has no direct equivalent to the UK's consultant-SAS-trainee structure. Instead, it has a complex layering of physicians, advanced practice providers (NPs, PAs, CRNAs), residents, and fellows — each with different training pathways, scope of practice laws (that vary by state), billing mechanisms, and compensation structures. The economic incentives driving workforce composition are as important as the clinical ones.</Callout>

      <SH>CRNAs: The Anesthesia Economics Case Study</SH>
      <Sub>A microcosm of the entire midlevel debate</Sub>
      <TB>
        <P>CRNAs deliver over 58 million anesthetics annually in the US — more than half of all anesthesia care. There are 59,000+ CRNAs in practice, earning a mean of ~$232,000/year versus ~$428,000 for anesthesiologists. Medicare reimburses CRNA-only services at 85% of the physician fee schedule. The clinical safety data is clear: multiple large studies including a &gt;1 million obstetric patient analysis show comparable complication rates regardless of provider type.</P>
        <P>The delivery models span a spectrum: CRNA-only (no physician involvement), medical direction (1 anesthesiologist directing up to 4 CRNAs — the "care team model"), supervision (1 anesthesiologist overseeing 4+ CRNAs with less direct involvement), and anesthesiologist-only. As of 2024, 25 states have opted out of the federal Medicare requirement for physician supervision of CRNAs, allowing fully independent practice.</P>
        <P>The economics are stark. A 5-FTE anesthesiologist group costs ~$550–620k per FTE (total compensation + benefits). A 5-FTE CRNA group costs ~$246–295k per FTE. Revenue per case is identical between provider types under fee-for-service billing (same CPT codes, same base + time units). The care team model splits the revenue: the anesthesiologist bills the medical direction component (QZ modifier), the CRNA bills the service component (QX modifier). Independent CRNA practice generates the same revenue at roughly half the labor cost.</P>
        <P>This is why hospitals and ASCs increasingly favor CRNA-heavy staffing models — particularly in ambulatory settings where case complexity is lower. UnitedHealthcare's 2025 policy change reducing CRNA reimbursement rates reflects the commercial payer pushback, while the state-level opt-out trend reflects the opposing market force: demand for cost-effective anesthesia access, especially in rural areas where anesthesiologists are scarce.</P>
      </TB>

      <SH>Teaching Hospitals & Resident Economics</SH>
      <Sub>How $21.2 billion in Medicare GME funding shapes the system</Sub>
      <TB>
        <P>Medicare funds residency training through two mechanisms: Direct GME (DGME, ~$4.5B/year) covers resident salaries, faculty, and program administration. Indirect Medical Education (IME, ~$11.7B/year) is an add-on payment to teaching hospitals' DRG payments, compensating for the "inefficiency" of care delivered by trainees and the higher acuity patients teaching hospitals serve (trauma, NICU, complex referrals).</P>
        <P>The economic reality for teaching hospitals: a PGY-1 resident earns ~$60–70k/year and works 60–80 hours/week. They generate substantial clinical revenue — a busy internal medicine resident may see 15–20 patients/day on inpatient service, a surgery resident assists in 3–5 cases/day. The hospital bills for these services at attending physician rates (with the attending providing oversight and attestation). The Medicare DGME payment supplements the resident's salary; the IME payment supplements the DRG. Together, residents represent the lowest-cost physician labor in the system.</P>
        <P>This creates a structural incentive: teaching hospitals benefit financially from having large residency programs. The IME multiplier (currently 1.35× the intern-to-bed ratio) means that each additional resident increases the hospital's Medicare DRG payments across all Medicare discharges. More residents = more IME = higher per-discharge revenue. This is why teaching hospitals lobbied hard for the 1,000 new GME slots in the 2021 Consolidated Appropriations Act — the first expansion since the 1996 cap was imposed.</P>
      </TB>

      <Callout><B>The 1996 cap paradox:</B> Medicare froze GME slots at 1996 levels, creating a permanent bottleneck. US medical schools have expanded enrollment 35% since 2002, but residency positions haven't kept pace. The result: thousands of US medical graduates compete for a fixed pool of positions, and the physician shortage persists despite growing medical school output. The 1,000 new slots (200/year over 5 years) barely dent the gap.</Callout>

      <SH>NPs and PAs: The Expanding Middle</SH>
      <Sub>Scope of practice battles and the economics of provider substitution</Sub>

      <FeatureCards cards={[
        { icon: "🩺", title: "Nurse Practitioners (NPs)", titleColor: "#a78bfa", body: "385,000+ in practice. 28 states + DC grant full practice authority (independent prescribing and diagnosis without physician oversight). DNP is now the entry degree. Mean compensation: ~$125k. Medicare reimburses at 85% of physician fee schedule. Primarily in primary care, urgent care, and rural settings. Growing presence in specialty care (cardiology, oncology, dermatology)." },
        { icon: "⚕️", title: "Physician Assistants (PAs)", titleColor: "#60a5fa", body: "~168,000 in practice. Licensed in all 50 states but most require a 'collaborative agreement' with a supervising physician (though many states are moving toward Optimal Team Practice). Master's degree entry. Mean compensation: ~$130k. Strong surgical and emergency medicine presence. Medicare reimburses at 85% of physician fee schedule. Recently rebranded as 'Physician Associates' by AAPA." },
        { icon: "👩‍⚕️", title: "The Scope Wars", titleColor: "#fbbf24", body: "Physician organizations (AMA, specialty societies) consistently oppose independent practice for NPs and PAs, citing shorter training (NP: ~6,000 clinical hours vs physician: ~15,000–20,000+). APP organizations counter with outcomes data showing comparable quality in primary care settings. The debate is as much economic as clinical — independent APPs can bill directly without physician overhead, reducing the revenue that flows through physician-led practices." },
      ]} />

      <SH>How This Compares Internationally</SH>
      <Sub>Different systems, different workforce models</Sub>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", minWidth: 600 }}>
          <thead><tr><th style={thS}>Role</th><th style={thS}>🇺🇸 US</th><th style={thS}>🇬🇧 UK</th><th style={thS}>🇨🇦 Canada</th><th style={thS}>🇦🇺 Australia</th></tr></thead>
          <tbody>
            {[
              ["Nurse anesthetist", "CRNAs: 59,000+, independent in 25 states", "No equivalent; anesthesia by physicians + ODPs", "No equivalent; anesthesia by physicians", "No equivalent; anaesthetic nurses assist only"],
              ["NP equivalent", "385,000+ NPs, 28 states full practice", "Advanced Clinical Practitioners (ACPs), limited prescribing", "NPs exist, scope varies by province", "Nurse Practitioners, expanding but limited"],
              ["PA equivalent", "~168,000 PAs", "Physician Associates (growing, ~4,000)", "PAs exist (~800), limited to few provinces", "No established PA role"],
              ["Residency funding", "Medicare GME ($21.2B), capped since 1996", "NHS-funded, centrally planned", "Provincial funding, no federal cap", "Commonwealth-funded positions"],
              ["Resident salary", "$60–70k PGY-1, 60–80 hr/wk", "~£32–40k FY1, 48 hr/wk (EWTD)", "~$60–65k CAD, varies by province", "~$85–95k AUD, varies by state"],
              ["Physician salary (specialist)", "$350–500k+", "£80–120k consultant", "$300–500k CAD", "$300–500k AUD"],
            ].map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={{ ...tdS, ...(j === 0 ? { color: "#f1f5f9", fontWeight: 500 } : {}) }}>{c}</td>)}</tr>)}
          </tbody>
        </table>
      </div>

      <Divider />

      <SH>The Economic Logic</SH>
      <TB>
        <P>The US workforce model is shaped by three forces that don't exist in single-payer systems. First, the fee-for-service billing structure means anyone who can bill an insurance claim independently has economic value — CRNAs, NPs, and PAs can all bill Medicare directly. Second, physician compensation is 2–3× higher than in the UK, Canada, or Australia, creating a strong economic incentive to substitute lower-cost providers where clinically appropriate. Third, the geographic distribution of physicians leaves vast rural areas underserved, making APPs essential for access — 77% of rural primary care relies on NPs or PAs.</P>
        <P>Teaching hospitals sit at the intersection of all these forces. They use residents as cost-effective clinical labor, receive federal funding (DGME + IME) to subsidize it, bill at attending rates for resident-delivered care, and train the next generation of physicians — all while their faculty physicians earn top-quartile salaries. The system is simultaneously a public investment in workforce development, a labor market, and a revenue-generating business model. Understanding this is essential to understanding why US healthcare costs what it does.</P>
      </TB>

      <Divider />

      <SH>SRNA Schools: The Same Economics, Different Pipeline</SH>
      <Sub>Why hospitals are launching nurse anesthetist training programs</Sub>
      <TB>
        <P>Hospital-based SRNA (Student Registered Nurse Anesthetist) programs follow a strikingly similar economic logic to medical residency programs. SRNAs in the later stages of training serve as in-room anesthesia providers under the medical direction of an anesthesiologist — performing the same clinical work as a CRNA or anesthesiology resident, but at no salary cost to the hospital. The student typically pays tuition to the affiliated university; the hospital provides the clinical training site and preceptors.</P>
        <P>The economics for the hospital are favourable on multiple levels. An SRNA in their final year can staff an operating room under medical direction, generating the same anesthesia billing revenue as a CRNA or resident would. The hospital doesn't pay the SRNA a salary (some programs offer stipends of $20–40k, but many don't). The anesthesiologist directing the SRNA bills the medical direction component. Surgical revenue continues uninterrupted. The hospital gains a pipeline of future CRNAs who are already trained in its systems, culture, and case mix — reducing recruitment costs for one of the most in-demand provider types in the country.</P>
        <P>Unlike medical residency GME funding (which is capped by Medicare since 1996), there is no federal cap on SRNA training positions. A hospital can expand its SRNA school as quickly as it can accredit through the COA (Council on Accreditation of Nurse Anesthesia Educational Programs, which accredits ~140 programs nationally) and recruit qualified applicants. Some states, like Arizona, are now providing direct grant funding ($700k in 2025–26) to expand SRNA clinical rotation capacity.</P>
        <P>For a teaching hospital already running anesthesiology residency programs, adding an SRNA school creates a dual-pipeline model: residents fill the complex cases (cardiac, trauma, pediatric), SRNAs fill the ambulatory and lower-acuity cases, and the same attending anesthesiologists direct both — maximising OR coverage while diversifying the future workforce supply. This is the model many academic medical centers, including UC Davis, are now pursuing.</P>
      </TB>

      <Callout><B>The training pipeline comparison:</B> An anesthesiology resident trains for 4 years post-medical school (12+ years total education), earns ~$65–75k during training, and the hospital receives Medicare GME funding. An SRNA trains for 3 years post-BSN/MSN (8–10 years total), often pays tuition rather than receiving a salary, and the hospital receives no federal GME equivalent — but also faces no cap on positions. Both generate clinical revenue for the hospital during training. The economic incentive to expand SRNA programs is clear.</Callout>

      <SH>Physician-Owned Facilities & Entrepreneurial Medicine</SH>
      <Sub>The uniquely American phenomenon of doctors as business owners</Sub>
      <TB>
        <P>In the NHS, a consultant radiologist is a salaried employee. In the US, a radiologist can own an independent imaging center with multiple MRI and CT scanners, employ technologists, contract with referring physicians, and bill insurers directly — operating as both a clinician and a business owner. This "entrepreneurial medicine" model exists across specialties and is one of the most distinctive features of US healthcare.</P>
      </TB>

      <FeatureCards cards={[
        { icon: "🏗️", title: "Physician-Owned ASCs", titleColor: "#4ade80", body: "Ambulatory Surgery Centers: ~6,100 in the US, majority physician-owned. Surgeons/anesthesiologists invest equity, refer their own patients, and profit from the facility fee. Medicare reimburses ASC facility fees at ~55–65% of hospital outpatient rates — still profitable because overhead is lower. ASCs handle ~70% of outpatient surgeries. Federal ban on new physician-owned hospitals (ACA §6001) does NOT apply to ASCs." },
        { icon: "📡", title: "Independent Imaging Centers", titleColor: "#60a5fa", body: "Radiologists or non-radiologist physician groups own MRI/CT facilities. A referring orthopedist who owns an MRI can order scans for their own patients (using the Stark Law 'in-office ancillary services exception' if equipment is in their office). Studies show self-referring physicians order 2–8× more imaging than non-self-referring peers. Medicare imaging spending doubled from $6.6B to $13.7B between 2000–2005, partly driven by self-referral." },
        { icon: "💊", title: "Physician-Owned Practices", titleColor: "#fbbf24", body: "~45% of physicians are still practice owners (down from 76% in 1983). Owner-physicians capture both professional fees and practice revenue (ancillary services, facility fees, dispensing). Dermatology, ophthalmology, and gastroenterology practices are particularly profitable because of high-margin in-office procedures (Mohs surgery, cataract extraction, colonoscopy)." },
        { icon: "🏥", title: "Physician-Owned Hospitals", titleColor: "#f87171", body: "ACA §6001 (2010) banned new physician-owned hospitals and froze existing ones from expanding. ~200 grandfathered facilities remain. Data shows they tend to be more profitable, have shorter stays, and cherry-pick healthier patients — leaving sicker, uninsured patients to community hospitals. The ban remains politically contentious: proponents cite quality/efficiency; opponents cite unfair competition with community hospitals." },
      ]} />

      <SH>The Stark Law & Self-Referral</SH>
      <TB>
        <P>The Stark Law (named for Rep. Pete Stark, D-CA) prohibits physicians from referring Medicare/Medicaid patients for "designated health services" — including radiology, lab work, physical therapy, and DME — to entities in which they have a financial interest. Violations carry penalties up to $15,000 per service and exclusion from Medicare. However, the law contains several critical exceptions that shape the entire landscape of physician-owned facilities.</P>
        <P>The most important exception is the "in-office ancillary services exception" (IOASE): a physician can refer patients to equipment they own if it's located in their own office and the service is supervised by a physician in the group. This is how an orthopedic group can own an MRI in their office suite and refer their own patients to it. The IOASE has been called "the biggest loophole in the Stark Law" — it allows the exact self-referral behavior the law was designed to prevent, as long as the equipment is on-site.</P>
        <P>The economic incentive is powerful. An orthopedic group that buys a $1.5M MRI scanner can recoup the investment within 2–3 years through self-referred scans billed to insurers. The referring physician captures both the professional fee (reading the scan, or paying a radiologist to read it) and the technical fee (the facility/equipment charge). Studies consistently show that self-referring physicians order significantly more imaging than physicians who refer to independent facilities — raising both cost and overutilization concerns.</P>
      </TB>

      <Callout type="teal"><BT>Why this doesn't exist in the NHS:</BT> In the UK, a consultant cannot own an MRI scanner and refer their own NHS patients to it for profit. Diagnostic equipment is owned by NHS Trusts or private companies contracted by the NHS. The consultant is salaried regardless of how many scans they order. The entire self-referral incentive structure — and the elaborate legal framework (Stark, Anti-Kickback) built to regulate it — is a uniquely American phenomenon created by the fee-for-service payment model. Remove fee-for-service, and the self-referral problem largely disappears.</Callout>
    </>
  );
}

// ── MAIN APP ──
function SectionIndex({ onNavigate }) {
  const categories = [...new Set(SECTIONS.map(s => s.category))];
  const catColors = { "STRUCTURE & FINANCING": "#f87171", "PAYERS & PROVIDERS": "#fbbf24", "OUTCOMES & WORKFORCE": "#4ade80", "ASSESSMENT": "#a78bfa" };
  return (
    <>
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: 40 }}>
          <div style={{ fontSize: "0.7rem", letterSpacing: 2.5, textTransform: "uppercase", color: catColors[cat] || "#64748b", fontWeight: 700, marginBottom: 16 }}>{cat}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
            {SECTIONS.filter(s => s.category === cat).map(s => (
              <div key={s.id} onClick={() => onNavigate(s.id)} style={{ background: "#1e293b", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 8, padding: "22px 20px", cursor: "pointer", borderTop: `3px solid ${catColors[cat]}`, transition: "transform 0.15s, border-color 0.15s" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(148,163,184,0.3)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(148,163,184,0.15)"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: "1.6rem" }}>{s.icon}</span>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: catColors[cat], background: "rgba(0,0,0,0.3)", padding: "3px 8px", borderRadius: 4 }}>{s.stat}</span>
                </div>
                <div style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "1.05rem", fontWeight: 700, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5 }}>{s.desc}</div>
                <div style={{ marginTop: 12, fontSize: "0.82rem", color: catColors[cat], fontWeight: 500 }}>Explore →</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState(null);
  const sectionMap = { system: TheSystem, hospitals: HowHospitalsGetPaid, insurance: InsuranceMechanics, insurers: TheInsurers, pharma: DrugsAndInnovation, outcomes: HealthOutcomes, workforce: WorkforceEconomics, international: InternationalComparison, crisis: TheCrisis, assessment: HonestAssessment };
  const Section = tab ? sectionMap[tab] : null;
  const currentSection = SECTIONS.find(s => s.id === tab);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "'Source Sans 3',-apple-system,sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(15,23,42,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(148,163,184,0.15)", padding: "0 22px", display: "flex", alignItems: "center", height: 54 }}>
        <span onClick={() => setTab(null)} style={{ fontFamily: "'Playfair Display',Georgia,serif", fontWeight: 800, fontSize: "1.1rem", color: "#fbbf24", cursor: "pointer" }}>US Healthcare</span>
        {tab && <span onClick={() => setTab(null)} style={{ marginLeft: 18, fontSize: "0.85rem", color: "#2dd4bf", cursor: "pointer" }}>← All Sections</span>}
      </nav>
      {/* Hero (only on index) */}
      {!tab && (
        <header style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderBottom: "1px solid rgba(148,163,184,0.15)", padding: "44px 22px 36px" }}>
          <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: "0.72rem", letterSpacing: 3, textTransform: "uppercase", color: "#64748b", marginBottom: 10, fontWeight: 600 }}>Interactive Policy Analysis — April 2026</div>
            <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(1.7rem,4vw,2.4rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: 8 }}>US Healthcare Financing:</h1>
            <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(1.5rem,3.5vw,2.2rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: 16 }}>How It Actually Works</h1>
            <p style={{ fontSize: "1rem", color: "#94a3b8", lineHeight: 1.6, maxWidth: 660, margin: "0 auto" }}>10 interactive sections examining how the US pays for healthcare — Medicare, Medicaid, employer insurance, the ACA, drug pricing, workforce economics — and how it compares to the NHS, Canada, and Australia. Data-driven. Source-cited. Blunt where necessary.</p>
          </div>
        </header>
      )}
      {/* Section header (when viewing a section) */}
      {tab && currentSection && (
        <header style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderBottom: "1px solid rgba(148,163,184,0.15)", padding: "36px 22px 28px" }}>
          <div style={{ maxWidth: 880, margin: "0 auto" }}>
            <div style={{ fontSize: "0.72rem", letterSpacing: 3, textTransform: "uppercase", color: "#64748b", marginBottom: 10, fontWeight: 600 }}>Policy Analysis — April 2026</div>
            <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "clamp(1.5rem,3.5vw,2.2rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: 8 }}>{currentSection.label}</h1>
            <p style={{ fontSize: "0.95rem", color: "#94a3b8", lineHeight: 1.5, maxWidth: 620 }}>{currentSection.desc}</p>
          </div>
        </header>
      )}
      {/* Content */}
      <main style={{ maxWidth: 880, margin: "0 auto", padding: "36px 22px 72px" }}>
        {tab ? <Section /> : <SectionIndex onNavigate={(id) => { setTab(id); window.scrollTo({ top: 0 }); }} />}
      </main>
      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(148,163,184,0.15)", padding: 22, textAlign: "center" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", fontSize: "0.75rem", color: "#64748b", lineHeight: 1.8 }}>
          <strong style={{ color: "#94a3b8" }}>Sources:</strong> CMS NHE Accounts (2024), Health Affairs, OECD Health at a Glance 2025, CIHI NHEX 2025, AIHW, UK House of Commons Library, The King's Fund, Peterson-KFF, Commonwealth Fund Mirror Mirror 2024, McKinsey, Trilliant Health, FDA Orange Book, KFF Claims Denial Analysis 2024
        </div>
      </footer>
    </div>
  );
}
