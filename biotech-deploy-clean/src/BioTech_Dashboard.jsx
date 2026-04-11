import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Building2, Users, FlaskConical, Wallet, TrendingUp, TrendingDown, Settings, Plus, Trash2, Check, X, DollarSign, Euro, Calendar, AlertTriangle, ChevronDown, ChevronRight, Edit3, ArrowUpRight, Cloud, CloudOff, Loader2, Upload, FileSpreadsheet } from "lucide-react";
import { useSharedState } from "./useSharedState";

const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
const DEPTS = ["Direction","R&D","Réglementaire","Finance/Admin","Commercial","Production","Qualité","Autre"];
const CONTRACTS = ["CDI","CDD","Freelance","Stage","Alternance"];
const STATUSES = ["Actif","Planifié","Terminé"];
const ENTITY_TYPES = ["Société mère","Filiale","Joint-Venture","Partenariat","Autre"];
const COLORS = ["#2E5090","#27AE60","#8E44AD","#E74C3C","#F39C12","#1ABC9C","#E67E22","#3498DB"];
const ENT_COLORS = ["#2E5090","#27AE60","#8E44AD","#E74C3C","#F39C12","#1ABC9C","#E67E22","#3498DB","#34495E","#16A085"];

// ============================================================
// INITIAL DATA
// ============================================================
const initialSettings = {
  year: 2026, eurUsd: 1.08, inflation: 0.025, salaryIncrease: 0.03,
  pass: 47700, smicAnnuel: 21600,
  maladie: 0.07, maladieComplement: 0.06,
  allocFamiliales: 0.0345, allocFamilialesFort: 0.0525,
  vieillessePlaf: 0.0855, vieillesseDepl: 0.0202,
  agircT1: 0.0601, agircT2: 0.0864,
  chomage: 0.0405, ags: 0.002,
  fnal: 0.005, csa: 0.003, dialogueSocial: 0.00016,
  apprentissage: 0.0068, formationPro: 0.01,
  transport: 0.0295, accidentTravail: 0.018,
  provisionCP: 0.10,
  effectifPlus50: false, zoneIDF: true, reductionFillon: true,
  joursOuvres: 228, coutM2: 350, surfaceParEmploye: 12,
};

const initialEntities = [
  { id: 1, name: "BioTech Main SAS", type: "Société mère", siren: "123 456 789 00012", currency: "EUR", date: "2020-03-15", participation: 100, color: "#2E5090" },
  { id: 2, name: "JV Pharma GmbH", type: "Joint-Venture", siren: "DE123456789", currency: "EUR", date: "2023-09-01", participation: 55, color: "#27AE60" },
  { id: 3, name: "Partenariat Univ. Pasteur", type: "Partenariat", siren: "N/A", currency: "EUR", date: "2025-01-01", participation: 0, color: "#8E44AD" },
];

const initialEmployees = [
  { id: 1, name: "Dr. Martin Dupont", dept: "Direction", entityId: 1, contract: "CDI", startDate: "2020-03-15", salary: 120000, fte: 1.0, status: "Actif", endDate: "", comment: "CEO / Fondateur", ticketsResto: 1584, transportBenefit: 480, bonus: 15000 },
  { id: 2, name: "Sophie Laurent", dept: "R&D", entityId: 1, contract: "CDI", startDate: "2021-06-01", salary: 65000, fte: 1.0, status: "Actif", endDate: "", comment: "Responsable labo", ticketsResto: 1584, transportBenefit: 480, bonus: 5000 },
  { id: 3, name: "Pierre Moreau", dept: "R&D", entityId: 1, contract: "CDI", startDate: "2021-09-15", salary: 55000, fte: 1.0, status: "Actif", endDate: "", comment: "Chercheur senior", ticketsResto: 1584, transportBenefit: 480, bonus: 3000 },
  { id: 4, name: "Amina Benali", dept: "R&D", entityId: 2, contract: "CDI", startDate: "2024-01-01", salary: 60000, fte: 1.0, status: "Actif", endDate: "", comment: "Chef de projet onco", ticketsResto: 1584, transportBenefit: 480, bonus: 4000 },
  { id: 5, name: "Lucas Petit", dept: "Réglementaire", entityId: 1, contract: "CDI", startDate: "2022-03-01", salary: 58000, fte: 1.0, status: "Actif", endDate: "", comment: "Affaires réglementaires", ticketsResto: 1584, transportBenefit: 480, bonus: 3500 },
  { id: 6, name: "Marie Dubois", dept: "Finance/Admin", entityId: 1, contract: "CDI", startDate: "2021-01-15", salary: 52000, fte: 1.0, status: "Actif", endDate: "", comment: "Comptabilité & admin", ticketsResto: 1584, transportBenefit: 480, bonus: 3000 },
  { id: 7, name: "Jean Leroy", dept: "R&D", entityId: 3, contract: "CDD", startDate: "2025-09-01", salary: 42000, fte: 1.0, status: "Actif", endDate: "2027-08-31", comment: "Post-doc détaché", ticketsResto: 1584, transportBenefit: 480, bonus: 0 },
  { id: 8, name: "CRO Project Manager", dept: "R&D", entityId: 2, contract: "Freelance", startDate: "2025-04-01", salary: 85000, fte: 0.8, status: "Actif", endDate: "2026-12-31", comment: "Consultant externe CRO", ticketsResto: 0, transportBenefit: 0, bonus: 0 },
];

const initialFteAlloc = {
  1: { 1: 0.60, 2: 0.30, 3: 0.10 },
  2: { 1: 0.70, 2: 0.20, 3: 0.10 },
  3: { 1: 0.80, 2: 0.10, 3: 0.10 },
  4: { 1: 0.00, 2: 1.00, 3: 0.00 },
  5: { 1: 0.60, 2: 0.30, 3: 0.10 },
  6: { 1: 0.70, 2: 0.20, 3: 0.10 },
  7: { 1: 0.00, 2: 0.00, 3: 1.00 },
  8: { 1: 0.00, 2: 1.00, 3: 0.00 },
};

const initialRevenue = {
  "Subventions & Aides (BPI, ANR, EU)": [50000,50000,50000,50000,50000,50000,50000,50000,50000,50000,50000,50000],
  "Licences & Royalties": [0,0,0,0,0,0,0,0,0,0,0,0],
  "Revenus JV Pharma": [0,0,0,15000,15000,15000,15000,15000,15000,15000,15000,15000],
  "Revenus Partenariat Recherche": [0,0,0,0,0,10000,10000,10000,10000,10000,10000,10000],
  "Autres revenus": [0,0,0,0,0,0,0,0,0,0,0,0],
};

// Overhead = frais généraux NON liés aux projets R&D
// Les coûts R&D (CRO, réactifs, équipements, PI) viennent des projets
const initialOverhead = {
  "Loyer & Charges locaux": [12000,12000,12000,12000,12000,12000,12000,12000,12000,12000,12000,12000],
  "IT, Logiciels & Licences": [4000,4000,4000,4000,4000,4000,4000,4000,4000,4000,4000,4000],
  "Déplacements & Congrès (hors R&D)": [2000,1000,5000,2000,1000,3000,1000,1000,5000,2000,1000,3000],
  "Honoraires (juridique, audit)": [3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000,3000],
  "Assurances": [2500,2500,2500,2500,2500,2500,2500,2500,2500,2500,2500,2500],
  "Autres frais généraux": [1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500],
};

// Projets R&D = source de vérité pour les coûts directs R&D (hors personnel, qui vient de RH)
const initialProjects = [
  { id: 1, name: "Prog. Oncologie Phase I", entityId: 2, cro: 320000, reagents: 45000, equipment: 30000, ip: 15000, travel: 12000, other: 8000 },
  { id: 2, name: "Prog. Immunothérapie Préclin.", entityId: 1, cro: 95000, reagents: 60000, equipment: 25000, ip: 20000, travel: 8000, other: 5000 },
  { id: 3, name: "Plateforme Biomarqueurs", entityId: 1, cro: 40000, reagents: 35000, equipment: 50000, ip: 10000, travel: 5000, other: 3000 },
  { id: 4, name: "Collab. Pasteur — Mécanismes", entityId: 3, cro: 0, reagents: 20000, equipment: 5000, ip: 0, travel: 3000, other: 2000 },
  { id: 5, name: "Discovery — Nouvelle Cible", entityId: 1, cro: 25000, reagents: 30000, equipment: 10000, ip: 5000, travel: 4000, other: 2000 },
];

// Augmentations individuelles : { empId: { pct: %, effectiveMonth: 0-11, comment: "" } }
// Se combinent avec le taux global settings.salaryIncrease
const initialRaises = {
  1: { pct: 0.02, effectiveMonth: 0, comment: "Performance exceptionnelle" },
  2: { pct: 0.04, effectiveMonth: 3, comment: "Promotion responsable" },
  3: { pct: 0.025, effectiveMonth: 6, comment: "" },
  4: { pct: 0.03, effectiveMonth: 0, comment: "Alignement marché" },
  5: { pct: 0.02, effectiveMonth: 6, comment: "" },
  6: { pct: 0.015, effectiveMonth: 0, comment: "" },
  7: { pct: 0, effectiveMonth: 0, comment: "CDD — pas d'augmentation" },
  8: { pct: 0, effectiveMonth: 0, comment: "Freelance — tarif fixe" },
};

const overheadKeys = {
  "Loyer & charges locaux": { 1: 0.50, 2: 0.30, 3: 0.20 },
  "IT & Licences": { 1: 0.40, 2: 0.35, 3: 0.25 },
  "Assurances": { 1: 0.50, 2: 0.30, 3: 0.20 },
  "Services généraux": { 1: 0.45, 2: 0.30, 3: 0.25 },
  "Direction & Admin": { 1: 0.60, 2: 0.25, 3: 0.15 },
};

// ============================================================
// FRENCH EMPLOYER CHARGES CALCULATOR
// ============================================================
const calculateChargesFR = (salaireBrut, contract, s) => {
  if (contract === "Freelance") return { total: 0, taux: 0, detail: { "Pas de charges (Freelance)": 0 }, totalCharged: salaireBrut };
  const pass = s.pass, smic = s.smicAnnuel, detail = {};
  let total = 0;
  const mal = salaireBrut * s.maladie;
  const malCompl = salaireBrut > 2.5 * smic ? salaireBrut * s.maladieComplement : 0;
  detail["Assurance maladie (7%)"] = mal;
  if (malCompl > 0) detail["Complément maladie (6%)"] = malCompl;
  total += mal + malCompl;
  const afTaux = salaireBrut > 3.5 * smic ? s.allocFamilialesFort : s.allocFamiliales;
  detail[`Alloc. familiales (${(afTaux*100).toFixed(2)}%)`] = salaireBrut * afTaux;
  total += salaireBrut * afTaux;
  const baseVP = Math.min(salaireBrut, pass);
  detail["Vieillesse plafonnée (8.55%)"] = baseVP * s.vieillessePlaf;
  total += baseVP * s.vieillessePlaf;
  detail["Vieillesse déplafonnée (2.02%)"] = salaireBrut * s.vieillesseDepl;
  total += salaireBrut * s.vieillesseDepl;
  detail["AGIRC-ARRCO T1 (6.01%)"] = baseVP * s.agircT1;
  total += baseVP * s.agircT1;
  const baseT2 = Math.max(0, Math.min(salaireBrut, 8 * pass) - pass);
  if (baseT2 > 0) { detail["AGIRC-ARRCO T2 (8.64%)"] = baseT2 * s.agircT2; total += baseT2 * s.agircT2; }
  const baseChom = Math.min(salaireBrut, 4 * pass);
  detail["Chômage (4.05%)"] = baseChom * s.chomage; total += baseChom * s.chomage;
  detail["AGS (0.20%)"] = baseChom * s.ags; total += baseChom * s.ags;
  const fnal = s.effectifPlus50 ? salaireBrut * s.fnal : baseVP * 0.001;
  detail[s.effectifPlus50 ? "FNAL (0.50%)" : "FNAL (0.10% plaf.)"] = fnal; total += fnal;
  detail["CSA (0.30%)"] = salaireBrut * s.csa; total += salaireBrut * s.csa;
  detail["Dialogue social"] = salaireBrut * s.dialogueSocial; total += salaireBrut * s.dialogueSocial;
  detail["Taxe apprentissage (0.68%)"] = salaireBrut * s.apprentissage; total += salaireBrut * s.apprentissage;
  detail["Formation pro. (1.00%)"] = salaireBrut * s.formationPro; total += salaireBrut * s.formationPro;
  if (s.zoneIDF) { detail[`Transport IDF (${(s.transport*100).toFixed(2)}%)`] = salaireBrut * s.transport; total += salaireBrut * s.transport; }
  detail[`Accident travail (${(s.accidentTravail*100).toFixed(1)}%)`] = salaireBrut * s.accidentTravail; total += salaireBrut * s.accidentTravail;
  if (s.reductionFillon && salaireBrut <= 1.6 * smic && salaireBrut > 0) {
    const T = 0.3194, coeff = Math.min(Math.max((T / 0.6) * ((1.6 * smic / salaireBrut) - 1), 0), T);
    const fillon = -salaireBrut * coeff;
    if (fillon < 0) { detail["Réduction Fillon"] = fillon; total += fillon; }
  }
  detail["Provision congés payés (10%)"] = salaireBrut * s.provisionCP; total += salaireBrut * s.provisionCP;
  return { total, taux: salaireBrut > 0 ? total / salaireBrut : 0, detail, totalCharged: salaireBrut + total };
};

// ============================================================
// UTILITY
// ============================================================
const fmt = (n, currency = "EUR") => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  const abs = Math.abs(n);
  const s = n < 0 ? "(" : "", se = n < 0 ? ")" : "";
  return currency === "EUR" ? `${s}${abs.toLocaleString("fr-FR")} €${se}` : `${s}$${abs.toLocaleString("en-US")}${se}`;
};
const fmtPct = (n) => n != null ? `${(n * 100).toFixed(1)}%` : "—";
const fmtNum = (n) => n != null ? n.toLocaleString("fr-FR") : "—";
let _nextId = 100;
const nextId = () => ++_nextId;

// ============================================================
// SHARED COMPONENTS
// ============================================================
const KPICard = ({ icon: Icon, label, value, subtitle, color = "#2E5090", warning = false }) => (
  <div className={`bg-white rounded-xl shadow-sm border p-5 ${warning ? "border-red-300 bg-red-50" : "border-gray-100"}`}>
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg" style={{ backgroundColor: color + "18" }}><Icon size={20} style={{ color }} /></div>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
  </div>
);

const TabBtn = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
    <Icon size={16} />{label}
  </button>
);

const Badge = ({ text, color }) => {
  const c = { green: "bg-green-100 text-green-700", orange: "bg-orange-100 text-orange-700", red: "bg-red-100 text-red-700", blue: "bg-blue-100 text-blue-700", purple: "bg-purple-100 text-purple-700", gray: "bg-gray-100 text-gray-600" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c[color] || c.gray}`}>{text}</span>;
};

const Btn = ({ onClick, children, variant = "primary", className = "" }) => {
  const v = { primary: "bg-blue-600 text-white hover:bg-blue-700", danger: "bg-red-50 text-red-600 hover:bg-red-100", ghost: "bg-gray-100 text-gray-600 hover:bg-gray-200", success: "bg-green-600 text-white hover:bg-green-700" };
  return <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${v[variant]} ${className}`}>{children}</button>;
};

const Input = ({ value, onChange, type = "text", className = "", ...props }) => (
  <input type={type} value={value}
    onChange={e => {
      if (type === "number") { const raw = e.target.value; onChange(raw === "" ? "" : (parseFloat(raw) || 0)); }
      else onChange(e.target.value);
    }}
    onBlur={e => { if (type === "number" && e.target.value === "") onChange(0); }}
    className={`border rounded-lg p-1.5 text-sm text-blue-700 font-medium ${className}`} {...props} />
);

const Select = ({ value, onChange, options, className = "" }) => (
  <select value={value} onChange={e => onChange(e.target.value)} className={`border rounded-lg p-1.5 text-sm text-blue-700 font-medium bg-white ${className}`}>
    {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
  </select>
);

// ============================================================
// MAIN APP
// ============================================================
// Indicateur de statut de sauvegarde
const SaveStatus = ({ status, lastSaved }) => {
  const icons = {
    loading: <Loader2 size={14} className="animate-spin text-blue-500" />,
    saving: <Loader2 size={14} className="animate-spin text-orange-500" />,
    saved: <Cloud size={14} className="text-green-500" />,
    error: <CloudOff size={14} className="text-red-500" />,
    local: <CloudOff size={14} className="text-gray-400" />,
  };
  const labels = {
    loading: "Chargement…",
    saving: "Sauvegarde…",
    saved: lastSaved ? `Sauvegardé ${lastSaved.toLocaleTimeString("fr-FR")}` : "Sauvegardé",
    error: "Erreur de connexion",
    local: "Mode local (pas de base de données)",
  };
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      {icons[status]}<span>{labels[status]}</span>
    </div>
  );
};

export default function BioTechDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [showCurrency, setShowCurrency] = useState("EUR");

  // --- Données persistées (partagées via Supabase) ---
  const { state: shared, updateField, status: saveStatus, lastSaved } = useSharedState({
    settings: initialSettings,
    entities: initialEntities,
    employees: initialEmployees,
    fteAlloc: initialFteAlloc,
    revenue: initialRevenue,
    overhead: initialOverhead,
    projects: initialProjects,
    cashBalance: 1500000,
    overheadAlloc: overheadKeys,
    raises: initialRaises,
  });

  // Raccourcis pour accéder aux données et les modifier
  const settings = shared.settings;
  const entities = shared.entities;
  const employees = shared.employees;
  const fteAlloc = shared.fteAlloc;
  const revenue = shared.revenue;
  const overhead = shared.overhead;
  const projects = shared.projects;
  const cashBalance = shared.cashBalance;
  const overheadAlloc = shared.overheadAlloc;
  const raises = shared.raises;

  const setSettings = (v) => updateField("settings", v);
  const setEntities = (v) => updateField("entities", v);
  const setEmployees = (v) => updateField("employees", v);
  const setFteAlloc = (v) => updateField("fteAlloc", v);
  const setRevenue = (v) => updateField("revenue", v);
  const setOverhead = (v) => updateField("overhead", v);
  const setProjects = (v) => updateField("projects", v);
  const setCashBalance = (v) => updateField("cashBalance", v);
  const setOverheadAlloc = (v) => updateField("overheadAlloc", v);
  const setRaises = (v) => updateField("raises", v);

  const computed = useMemo(() => {
    // --- PERSONNEL (source: RH) ---
    // Calcul avec augmentations : salaire de base avant date effective, salaire augmenté après
    const empCosts = employees.map(e => {
      const raise = raises[e.id] || { pct: 0, effectiveMonth: 0 };
      const globalPct = settings.salaryIncrease || 0;
      const individualPct = raise.pct || 0;
      const totalRaisePct = globalPct + individualPct;
      const effMonth = raise.effectiveMonth || 0;
      const salaryAfter = e.salary * (1 + totalRaisePct);

      // Coûts mensuels : avant augmentation = salaire actuel, après = salaire augmenté
      const monthlyBefore = e.salary / 12;
      const monthlyAfter = salaryAfter / 12;
      const monthlyBreakdown = MONTHS_FR.map((_, mi) => mi >= effMonth ? monthlyAfter : monthlyBefore);
      const annualEffective = monthlyBreakdown.reduce((s, m) => s + m, 0);

      const charges = calculateChargesFR(annualEffective, e.contract, settings);
      const benefits = (e.ticketsResto || 0) + (e.transportBenefit || 0) + (e.bonus || 0);
      const benefitsMonthly = benefits / 12;
      return {
        ...e, charges, charged: charges.totalCharged + benefits, tauxCharges: charges.taux,
        benefits, salaryAfter, annualEffective, totalRaisePct, raise,
        monthlyBreakdown, monthlyCostBreakdown: monthlyBreakdown.map(m => {
          const annualized = m * 12;
          const ch = calculateChargesFR(annualized, e.contract, settings);
          return m + (ch.total / 12) + benefitsMonthly;
        })
      };
    });
    const monthlySalary = MONTHS_FR.map((_, mi) => empCosts.reduce((s, e) => s + (e.monthlyCostBreakdown[mi] || 0), 0));
    const monthlySalaryAvg = monthlySalary.reduce((a, b) => a + b, 0) / 12;
    const totalMasse = empCosts.reduce((s, e) => s + e.charged, 0);

    // --- R&D DIRECT COSTS (source: Projets R&D) ---
    // Consolidation mensuelle : coûts annuels répartis uniformément sur 12 mois
    const rdCostKeys = ["cro","reagents","equipment","ip","travel","other"];
    const rdCostLabels = {"cro":"CRO & Sous-traitance","reagents":"Réactifs & Consommables","equipment":"Équipements & Amortissements","ip":"PI / Brevets","travel":"Déplacements R&D","other":"Autres coûts R&D"};
    const rdByCategory = {};
    rdCostKeys.forEach(k => { rdByCategory[k] = projects.reduce((s, p) => s + (p[k] || 0), 0); });
    const rdMonthly = {}; // { categoryKey: [12 monthly values] }
    rdCostKeys.forEach(k => { rdMonthly[k] = Array(12).fill(Math.round(rdByCategory[k] / 12)); });
    const rdTotalAnnual = rdCostKeys.reduce((s, k) => s + rdByCategory[k], 0);
    const rdPerMonth = MONTHS_FR.map((_, mi) => rdCostKeys.reduce((s, k) => s + rdMonthly[k][mi], 0));

    // --- OVERHEAD (source: saisie directe Budget) ---
    const overheadPerMonth = MONTHS_FR.map((_, mi) => Object.values(overhead).reduce((s, arr) => s + (arr[mi] || 0), 0));

    // --- CONSOLIDATION ---
    const revPerMonth = MONTHS_FR.map((_, mi) => Object.values(revenue).reduce((s, arr) => s + (arr[mi] || 0), 0));
    const totalRevenue = revPerMonth.reduce((a, b) => a + b, 0);
    const expPerMonth = MONTHS_FR.map((_, mi) => monthlySalary[mi] + rdPerMonth[mi] + overheadPerMonth[mi]);
    const totalExpenses = expPerMonth.reduce((a, b) => a + b, 0);
    const netPerMonth = MONTHS_FR.map((_, mi) => revPerMonth[mi] - expPerMonth[mi]);
    const cashFlow = []; let bal = cashBalance;
    for (let mi = 0; mi < 12; mi++) { bal += netPerMonth[mi]; cashFlow.push({ month: MONTHS_FR[mi], revenus: revPerMonth[mi], depenses: expPerMonth[mi], net: netPerMonth[mi], solde: bal }); }
    const currentCash = cashFlow[0]?.solde || cashBalance;
    const avgBurn = totalExpenses / 12;
    const runway = avgBurn > 0 ? currentCash / avgBurn : Infinity;

    // --- ALLOCATION PAR ENTITÉ ---
    const allocCosts = {}; entities.forEach(e => { allocCosts[e.id] = 0; });
    Object.entries(fteAlloc).forEach(([empIdStr, alloc]) => {
      const emp = empCosts.find(e => e.id === parseInt(empIdStr));
      if (!emp) return;
      Object.entries(alloc).forEach(([eid, pct]) => { allocCosts[parseInt(eid)] = (allocCosts[parseInt(eid)] || 0) + emp.charged * pct; });
    });
    const projCosts = {}; entities.forEach(e => { projCosts[e.id] = 0; });
    projects.forEach(p => { const t = rdCostKeys.reduce((s, k) => s + (p[k] || 0), 0); projCosts[p.entityId] = (projCosts[p.entityId] || 0) + t; });

    // --- KPIs RH ---
    const activeHC = empCosts.filter(e => e.status === "Actif").reduce((s, e) => s + e.fte, 0);
    const plannedHC = empCosts.filter(e => e.status === "Planifié").reduce((s, e) => s + e.fte, 0);
    const deptBreakdown = {}; empCosts.forEach(e => { deptBreakdown[e.dept] = (deptBreakdown[e.dept] || 0) + e.charged; });

    return { empCosts, monthlySalary, monthlySalaryAvg, totalMasse, rdCostKeys, rdCostLabels, rdByCategory, rdMonthly, rdTotalAnnual, rdPerMonth, overheadPerMonth, revPerMonth, expPerMonth, netPerMonth, cashFlow, totalRevenue, totalExpenses, currentCash, avgBurn, runway, allocCosts, projCosts, activeHC, plannedHC, deptBreakdown };
  }, [settings, entities, employees, fteAlloc, revenue, overhead, projects, cashBalance, raises]);

  const cv = (val) => showCurrency === "USD" ? val * settings.eurUsd : val;
  const cur = showCurrency;

  // ============================================================
  // DASHBOARD
  // ============================================================
  const DashboardTab = () => {
    const entityPieData = entities.map(e => ({ name: e.name.length > 20 ? e.name.substring(0, 18) + "…" : e.name, value: (computed.allocCosts[e.id] || 0) + (computed.projCosts[e.id] || 0), color: e.color })).filter(d => d.value > 0);
    const deptPieData = Object.entries(computed.deptBreakdown).map(([dept, val], i) => ({ name: dept, value: val, color: COLORS[i % COLORS.length] }));
    const runwayColor = computed.runway < 6 ? "#E74C3C" : computed.runway < 12 ? "#F39C12" : "#27AE60";
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon={Wallet} label="Trésorerie" value={fmt(cv(computed.currentCash), cur)} subtitle={`Solde initial: ${fmt(cv(cashBalance), cur)}`} color="#2E5090" />
          <KPICard icon={TrendingDown} label="Burn rate / mois" value={fmt(cv(computed.avgBurn), cur)} subtitle={`Dépenses annuelles: ${fmt(cv(computed.totalExpenses), cur)}`} color="#E74C3C" />
          <KPICard icon={Calendar} label="Runway" value={`${computed.runway.toFixed(1)} mois`} color={runwayColor} warning={computed.runway < 12} subtitle={computed.runway < 12 ? "Attention — moins de 12 mois" : "Situation confortable"} />
          <KPICard icon={Users} label="Effectif (ETP)" value={computed.activeHC.toFixed(1)} subtitle={`+ ${computed.plannedHC.toFixed(1)} planifiés`} color="#27AE60" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Trésorerie 2026</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={computed.cashFlow}>
                <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2E5090" stopOpacity={0.15} /><stop offset="95%" stopColor="#2E5090" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => fmt(cv(v), cur)} /><Area type="monotone" dataKey="solde" stroke="#2E5090" fill="url(#cg)" strokeWidth={2.5} name="Solde" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Revenus vs Dépenses</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={computed.cashFlow}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => fmt(cv(v), cur)} /><Legend /><Bar dataKey="revenus" fill="#27AE60" name="Revenus" radius={[4,4,0,0]} /><Bar dataKey="depenses" fill="#E74C3C" name="Dépenses" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Coûts par entité</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={entityPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>{entityPieData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip formatter={v => fmt(cv(v), cur)} /></PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4">Masse salariale par département</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={deptPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>{deptPieData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip formatter={v => fmt(cv(v), cur)} /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Consolidation par entité</h3>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50"><th className="text-left p-3 font-semibold text-gray-600">Entité</th><th className="text-right p-3 font-semibold text-gray-600">Personnel</th><th className="text-right p-3 font-semibold text-gray-600">R&D</th><th className="text-right p-3 font-semibold text-gray-600">Total</th></tr></thead>
            <tbody>{entities.map(e => { const p = computed.allocCosts[e.id]||0, r = computed.projCosts[e.id]||0; return (
              <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="p-3"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor:e.color}}/><span className="font-medium">{e.name}</span></div></td><td className="p-3 text-right">{fmt(cv(p),cur)}</td><td className="p-3 text-right">{fmt(cv(r),cur)}</td><td className="p-3 text-right font-bold">{fmt(cv(p+r),cur)}</td></tr>
            );})}</tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============================================================
  // BUDGET TAB — vue consolidation
  // Personnel = auto (RH) | R&D = auto (Projets) | Overhead = éditable
  // ============================================================
  const BudgetTab = () => {
    const [editCell, setEditCell] = useState(null);
    const [editVal, setEditVal] = useState("");
    const [newRevLine, setNewRevLine] = useState("");
    const [newOhLine, setNewOhLine] = useState("");
    const [editCash, setEditCash] = useState(false);
    const [cashVal, setCashVal] = useState(String(cashBalance));

    const startEdit = (section, key, mi) => {
      setEditCell({ section, key, mi });
      setEditVal(String((section === "rev" ? revenue : overhead)[key][mi]));
    };
    const saveEdit = () => {
      if (!editCell) return;
      const v = parseFloat(editVal) || 0;
      const { section, key, mi } = editCell;
      if (section === "rev") setRevenue(p => ({...p, [key]: p[key].map((x,i) => i===mi?v:x)}));
      else setOverhead(p => ({...p, [key]: p[key].map((x,i) => i===mi?v:x)}));
      setEditCell(null);
    };
    const addRevLine = () => { if (!newRevLine.trim()) return; setRevenue(p => ({...p, [newRevLine.trim()]: Array(12).fill(0)})); setNewRevLine(""); };
    const addOhLine = () => { if (!newOhLine.trim()) return; setOverhead(p => ({...p, [newOhLine.trim()]: Array(12).fill(0)})); setNewOhLine(""); };
    const delLine = (section, key) => {
      if (section === "rev") setRevenue(p => { const n = {...p}; delete n[key]; return n; });
      else setOverhead(p => { const n = {...p}; delete n[key]; return n; });
    };

    const monthlySal = computed.monthlySalary;
    const revTotal = MONTHS_FR.map((_, mi) => Object.values(revenue).reduce((s, a) => s + a[mi], 0));
    const expTotal = computed.expPerMonth;
    const netTotal = computed.netPerMonth;

    // Sous-totaux pour affichage
    const rdSubTotal = computed.rdPerMonth;
    const ohSubTotal = computed.overheadPerMonth;

    const Row = ({ label, values, section, isTotal = false, isSubTotal = false, isAuto = false, autoSource = "", deletable = false }) => (
      <tr className={`${isTotal ? "bg-gray-50 font-bold" : isSubTotal ? "bg-gray-50/50 font-semibold" : "hover:bg-blue-50/30"} border-t border-gray-100`}>
        <td className={`p-2 text-left text-xs sticky left-0 ${isTotal ? "bg-gray-50 font-bold" : isSubTotal ? "bg-gray-50/50" : "bg-white"}`}>
          <div className="flex items-center gap-1">
            {deletable && <button onClick={() => delLine(section, label)} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 size={12}/></button>}
            <span className={isAuto ? "text-purple-700" : ""}>{label}</span>
            {isAuto && <span className="text-purple-400 text-xs ml-1" title={`Calculé depuis ${autoSource}`}>↗ {autoSource}</span>}
          </div>
        </td>
        {values.map((v, mi) => (
          <td key={mi} className={`p-2 text-right text-xs ${!isTotal && !isSubTotal && !isAuto ? "text-blue-700 cursor-pointer" : ""} ${isAuto ? "text-purple-600" : ""}`}
            onDoubleClick={() => !isTotal && !isSubTotal && !isAuto && startEdit(section, label, mi)}>
            {editCell?.key === label && editCell?.mi === mi ? (
              <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={saveEdit} onKeyDown={e => e.key==="Enter" && saveEdit()} className="w-20 p-1 border rounded text-right text-xs" autoFocus />
            ) : fmtNum(Math.round(cv(v)))}
          </td>
        ))}
        <td className="p-2 text-right font-bold text-xs">{fmt(cv(values.reduce((a,b)=>a+b,0)), cur)}</td>
      </tr>
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Budget Consolidé {settings.year}</h2>
            <p className="text-sm text-gray-500">
              <span className="text-purple-600">Violet ↗</span> = calculé automatiquement (RH, Projets R&D) •
              <span className="text-blue-600"> Bleu</span> = éditable (double-clic)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Solde initial :</span>
            {editCash ? (
              <div className="flex items-center gap-1">
                <Input type="number" value={cashVal} onChange={v => setCashVal(String(v))} className="w-32 text-right" />
                <Btn variant="success" onClick={() => { setCashBalance(parseFloat(cashVal)||0); setEditCash(false); }}><Check size={12}/></Btn>
                <Btn variant="ghost" onClick={() => setEditCash(false)}><X size={12}/></Btn>
              </div>
            ) : (
              <button onClick={() => { setCashVal(String(cashBalance)); setEditCash(true); }} className="text-blue-700 font-bold text-sm hover:underline">{fmt(cv(cashBalance), cur)}</button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-blue-800 text-white">
              <th className="p-2 text-left text-xs sticky left-0 bg-blue-800 min-w-56">Poste budgétaire</th>
              {MONTHS_FR.map(m => <th key={m} className="p-2 text-right text-xs min-w-20">{m}</th>)}
              <th className="p-2 text-right text-xs min-w-24">Total</th>
            </tr></thead>
            <tbody>
              {/* === REVENUS === */}
              <tr className="bg-green-50"><td colSpan={14} className="p-2 font-bold text-green-800 text-xs">REVENUS</td></tr>
              {Object.entries(revenue).map(([k, v]) => <Row key={k} label={k} values={v} section="rev" deletable />)}
              <tr className="border-t border-gray-200"><td className="p-2 text-xs sticky left-0 bg-white" colSpan={14}>
                <div className="flex items-center gap-2"><input value={newRevLine} onChange={e=>setNewRevLine(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addRevLine()} placeholder="+ Ajouter une ligne de revenu…" className="border rounded-lg p-1.5 text-xs flex-1" />
                <Btn onClick={addRevLine}><Plus size={12}/>Ajouter</Btn></div>
              </td></tr>
              <Row label="TOTAL REVENUS" values={revTotal} section="rev" isTotal />

              {/* === DÉPENSES : PERSONNEL (auto RH) === */}
              <tr className="bg-red-50"><td colSpan={14} className="p-2 font-bold text-red-800 text-xs">DÉPENSES</td></tr>
              <tr className="bg-purple-50/50"><td colSpan={14} className="p-2 font-semibold text-purple-800 text-xs">Personnel — source: onglet RH</td></tr>
              <Row label="Masse salariale chargée" values={monthlySal} isAuto autoSource="RH" />

              {/* === DÉPENSES : R&D (auto Projets) === */}
              <tr className="bg-purple-50/50"><td colSpan={14} className="p-2 font-semibold text-purple-800 text-xs">Coûts R&D directs — source: onglet Projets R&D</td></tr>
              {computed.rdCostKeys.map(k => (
                <Row key={k} label={computed.rdCostLabels[k]} values={computed.rdMonthly[k]} isAuto autoSource="R&D" />
              ))}
              <Row label="Sous-total R&D" values={rdSubTotal} isSubTotal />

              {/* === DÉPENSES : OVERHEAD (éditable) === */}
              <tr className="bg-orange-50"><td colSpan={14} className="p-2 font-semibold text-orange-800 text-xs">Frais généraux — saisie directe</td></tr>
              {Object.entries(overhead).map(([k, v]) => <Row key={k} label={k} values={v} section="oh" deletable />)}
              <tr className="border-t border-gray-200"><td className="p-2 text-xs sticky left-0 bg-white" colSpan={14}>
                <div className="flex items-center gap-2"><input value={newOhLine} onChange={e=>setNewOhLine(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addOhLine()} placeholder="+ Ajouter un poste de frais généraux…" className="border rounded-lg p-1.5 text-xs flex-1" />
                <Btn onClick={addOhLine}><Plus size={12}/>Ajouter</Btn></div>
              </td></tr>
              <Row label="Sous-total frais généraux" values={ohSubTotal} isSubTotal />

              {/* === TOTAL DÉPENSES === */}
              <Row label="TOTAL DÉPENSES" values={expTotal} isTotal />

              {/* === RÉSULTAT NET === */}
              <tr className="bg-blue-900 text-white font-bold">
                <td className="p-2 text-xs sticky left-0 bg-blue-900">RÉSULTAT NET</td>
                {netTotal.map((v,mi) => <td key={mi} className={`p-2 text-right text-xs ${v<0?"text-red-300":"text-green-300"}`}>{fmtNum(Math.round(cv(v)))}</td>)}
                <td className="p-2 text-right text-xs">{fmt(cv(netTotal.reduce((a,b)=>a+b,0)), cur)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Légende source des données */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3"><AlertTriangle size={18} className="text-blue-600 mt-0.5 flex-shrink-0"/>
            <div className="text-sm text-blue-800">
              <strong>Source unique de données :</strong> Les coûts de personnel sont calculés depuis l'onglet RH (salaires + charges sociales). Les coûts R&D proviennent de l'onglet Projets R&D (répartis uniformément sur 12 mois). Seuls les frais généraux sont saisis directement ici.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Projection de trésorerie</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={computed.cashFlow}>
              <defs><linearGradient id="cg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2E5090" stopOpacity={0.2}/><stop offset="95%" stopColor="#2E5090" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="month" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} tickFormatter={v=>`${(v/1000000).toFixed(1)}M`}/>
              <Tooltip formatter={v=>fmt(cv(v),cur)}/><Area type="monotone" dataKey="solde" stroke="#2E5090" fill="url(#cg2)" strokeWidth={2} name="Solde"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // ============================================================
  // HR TAB — full CRUD + charge details
  // ============================================================
  const HRTab = () => {
    const [expandedEmp, setExpandedEmp] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [showRaises, setShowRaises] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [importData, setImportData] = useState(null); // { rows: [...], fileName: "" }
    const [importStatus, setImportStatus] = useState(""); // "", "parsing", "preview", "done", "error"
    const statusColor = { Actif: "green", Planifié: "orange", Terminé: "gray" };
    const contractColor = { CDI: "blue", CDD: "orange", Freelance: "purple", Stage: "gray", Alternance: "gray" };

    const blankEmp = { name: "", dept: "R&D", entityId: entities[0]?.id || 1, contract: "CDI", startDate: "", salary: 0, fte: 1.0, status: "Planifié", endDate: "", comment: "", ticketsResto: 0, transportBenefit: 0, bonus: 0 };

    const startEdit = (emp) => { setEditingId(emp.id); setEditForm({ ...emp }); };
    const saveEdit = () => {
      setEmployees(p => p.map(e => e.id === editingId ? { ...e, ...editForm } : e));
      // Update FTE alloc if needed
      if (!fteAlloc[editingId]) {
        const defaultAlloc = {}; entities.forEach(ent => { defaultAlloc[ent.id] = ent.id === editForm.entityId ? 1 : 0; });
        setFteAlloc(p => ({ ...p, [editingId]: defaultAlloc }));
      }
      setEditingId(null);
    };
    const addEmp = () => {
      const id = nextId();
      setEmployees(p => [...p, { ...editForm, id }]);
      const defaultAlloc = {}; entities.forEach(ent => { defaultAlloc[ent.id] = ent.id === editForm.entityId ? 1 : 0; });
      setFteAlloc(p => ({ ...p, [id]: defaultAlloc }));
      setShowAddForm(false); setEditForm({});
    };
    const delEmp = (id) => {
      setEmployees(p => p.filter(e => e.id !== id));
      setFteAlloc(p => { const n = { ...p }; delete n[id]; return n; });
    };

    const EmpFormRow = ({ form, setForm, onSave, onCancel, isNew }) => (
      <tr className="bg-blue-50 border-t border-blue-200">
        <td colSpan={12} className="p-4">
          <div className="space-y-3">
            <div className="text-xs font-bold text-blue-800 mb-1">{isNew ? "Nouvel employé" : "Modifier l'employé"}</div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div><label className="text-xs text-gray-500 block mb-1">Nom / Poste</label><Input value={form.name} onChange={v => setForm(f=>({...f,name:v}))} placeholder="Nom / Poste" className="w-full text-xs" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Département</label><Select value={form.dept} onChange={v => setForm(f=>({...f,dept:v}))} options={DEPTS} className="w-full text-xs" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Entité</label><Select value={form.entityId} onChange={v => setForm(f=>({...f,entityId:parseInt(v)}))} options={entities.map(e=>({value:e.id,label:e.name.length>15?e.name.substring(0,13)+"…":e.name}))} className="w-full text-xs" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Contrat</label><Select value={form.contract} onChange={v => setForm(f=>({...f,contract:v}))} options={CONTRACTS} className="w-full text-xs" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Statut</label><Select value={form.status} onChange={v => setForm(f=>({...f,status:v}))} options={STATUSES} className="w-full text-xs" /></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div><label className="text-xs text-gray-500 block mb-1">Salaire brut annuel (€)</label><Input type="number" value={form.salary} onChange={v => setForm(f=>({...f,salary:v}))} className="w-full text-xs text-right" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">ETP</label><Input type="number" value={form.fte} onChange={v => setForm(f=>({...f,fte:v}))} className="w-full text-xs text-right" step="0.1" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Tickets restaurant (€/an)</label><Input type="number" value={form.ticketsResto ?? 0} onChange={v => setForm(f=>({...f,ticketsResto:v}))} className="w-full text-xs text-right" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Transport (€/an)</label><Input type="number" value={form.transportBenefit ?? 0} onChange={v => setForm(f=>({...f,transportBenefit:v}))} className="w-full text-xs text-right" /></div>
              <div><label className="text-xs text-gray-500 block mb-1">Bonus annuel (€)</label><Input type="number" value={form.bonus ?? 0} onChange={v => setForm(f=>({...f,bonus:v}))} className="w-full text-xs text-right" /></div>
            </div>
            <div className="flex gap-2">
              <Btn variant="success" onClick={onSave}><Check size={12}/>{isNew?"Ajouter":"Enregistrer"}</Btn>
              <Btn variant="ghost" onClick={onCancel}><X size={12}/>Annuler</Btn>
            </div>
          </div>
        </td>
      </tr>
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div><h2 className="text-lg font-bold text-gray-900">RH & Effectifs</h2>
            <p className="text-sm text-gray-500">{computed.activeHC.toFixed(1)} ETP actifs • {computed.plannedHC.toFixed(1)} planifiés • Masse salariale: {fmt(cv(computed.totalMasse), cur)}</p></div>
          <div className="flex items-center gap-2">
            <Btn variant="ghost" onClick={() => setShowImport(!showImport)}><Upload size={14}/>Importer</Btn>
            <Btn onClick={() => { setShowAddForm(true); setEditForm({...blankEmp}); }}><Plus size={14}/>Ajouter un employé</Btn>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-green-700 text-white">
              <th className="p-2.5 text-left text-xs w-6"></th>
              <th className="p-2.5 text-left text-xs">Nom / Poste</th>
              <th className="p-2.5 text-left text-xs">Département</th>
              <th className="p-2.5 text-left text-xs">Entité</th>
              <th className="p-2.5 text-center text-xs">Contrat</th>
              <th className="p-2.5 text-right text-xs">Salaire brut</th>
              <th className="p-2.5 text-right text-xs">Charges</th>
              <th className="p-2.5 text-right text-xs">Avantages</th>
              <th className="p-2.5 text-right text-xs">Taux</th>
              <th className="p-2.5 text-center text-xs">ETP</th>
              <th className="p-2.5 text-center text-xs">Statut</th>
              <th className="p-2.5 text-right text-xs">Actions</th>
            </tr></thead>
            <tbody>
              {showAddForm && <EmpFormRow form={editForm} setForm={fn => setEditForm(prev => typeof fn === 'function' ? fn(prev) : fn)} onSave={addEmp} onCancel={() => setShowAddForm(false)} isNew />}
              {computed.empCosts.map(emp => {
                const entity = entities.find(e => e.id === emp.entityId);
                const isExpanded = expandedEmp === emp.id;
                if (editingId === emp.id) return <EmpFormRow key={emp.id} form={editForm} setForm={fn => setEditForm(prev => typeof fn === 'function' ? fn(prev) : fn)} onSave={saveEdit} onCancel={() => setEditingId(null)} isNew={false} />;
                return [
                  <tr key={emp.id} className="border-t border-gray-100 hover:bg-green-50/30">
                    <td className="p-2.5 text-gray-400 cursor-pointer" onClick={() => setExpandedEmp(isExpanded ? null : emp.id)}>
                      {emp.contract !== "Freelance" ? (isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>) : null}
                    </td>
                    <td className="p-2.5 font-medium text-xs">{emp.name}</td>
                    <td className="p-2.5 text-xs">{emp.dept}</td>
                    <td className="p-2.5 text-xs"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:entity?.color}}/>{entity?.name.length>18?entity.name.substring(0,16)+"…":entity?.name}</div></td>
                    <td className="p-2.5 text-center"><Badge text={emp.contract} color={contractColor[emp.contract]}/></td>
                    <td className="p-2.5 text-right text-blue-700 text-xs">{fmt(cv(emp.salary),cur)}</td>
                    <td className="p-2.5 text-right text-xs text-orange-700">{fmt(cv(emp.charges.total),cur)}</td>
                    <td className="p-2.5 text-right text-xs text-teal-700">{emp.benefits > 0 ? fmt(cv(emp.benefits),cur) : "—"}</td>
                    <td className="p-2.5 text-right text-xs font-medium">{fmtPct(emp.tauxCharges)}</td>
                    <td className="p-2.5 text-center text-xs">{emp.fte}</td>
                    <td className="p-2.5 text-center"><Badge text={emp.status} color={statusColor[emp.status]}/></td>
                    <td className="p-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(emp)} className="text-blue-500 hover:text-blue-700"><Edit3 size={13}/></button>
                        <button onClick={() => delEmp(emp.id)} className="text-red-400 hover:text-red-600"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>,
                  isExpanded && emp.contract !== "Freelance" && (
                    <tr key={`${emp.id}-d`} className="bg-amber-50/50">
                      <td></td>
                      <td colSpan={11} className="p-3">
                        <div className="text-xs font-bold text-gray-600 mb-2">Détail des charges — {emp.name} (brut: {fmt(cv(emp.salary),cur)})</div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                          {Object.entries(emp.charges.detail).map(([l, a]) => (
                            <div key={l} className="flex justify-between text-xs py-0.5">
                              <span className={a < 0 ? "text-green-700 font-medium" : "text-gray-600"}>{l}</span>
                              <span className={`font-mono ${a < 0 ? "text-green-700 font-bold" : "text-gray-900"}`}>{a < 0 ? "−" : ""}{fmt(cv(Math.abs(a)),cur)}</span>
                            </div>
                          ))}
                        </div>
                        {emp.benefits > 0 && (
                          <div className="mt-3 pt-2 border-t border-amber-200">
                            <div className="text-xs font-bold text-teal-700 mb-1">Avantages salariés</div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                              {(emp.ticketsResto || 0) > 0 && <div className="flex justify-between text-xs py-0.5"><span className="text-gray-600">Tickets restaurant</span><span className="font-mono text-gray-900">{fmt(cv(emp.ticketsResto),cur)}</span></div>}
                              {(emp.transportBenefit || 0) > 0 && <div className="flex justify-between text-xs py-0.5"><span className="text-gray-600">Transport</span><span className="font-mono text-gray-900">{fmt(cv(emp.transportBenefit),cur)}</span></div>}
                              {(emp.bonus || 0) > 0 && <div className="flex justify-between text-xs py-0.5"><span className="text-gray-600">Bonus annuel</span><span className="font-mono text-gray-900">{fmt(cv(emp.bonus),cur)}</span></div>}
                              <div className="flex justify-between text-xs py-0.5 font-bold"><span className="text-teal-700">Total avantages</span><span className="font-mono text-teal-700">{fmt(cv(emp.benefits),cur)}</span></div>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between text-xs font-bold mt-2 pt-2 border-t border-amber-200">
                          <span>Coût total employeur</span><span>{fmt(cv(emp.charged),cur)} (brut + charges{emp.benefits > 0 ? " + avantages" : ""})</span>
                        </div>
                      </td>
                    </tr>
                  )
                ];
              })}
            </tbody>
          </table>
        </div>

        {/* Module d'import CSV / Excel */}
        {showImport && (
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100"><FileSpreadsheet size={18} className="text-blue-600"/></div>
                <div><h3 className="text-sm font-bold text-blue-800">Importer des données RH</h3>
                  <p className="text-xs text-gray-500">Fichiers CSV ou Excel (.xlsx) acceptés</p>
                </div>
              </div>
              <button onClick={() => { setShowImport(false); setImportData(null); setImportStatus(""); }} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
            </div>
            <div className="p-5 space-y-4">
              {importStatus !== "preview" && (
                <div>
                  <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload size={32} className="mx-auto text-blue-300 mb-2"/>
                    <p className="text-sm text-gray-600 mb-2">Glissez un fichier ou cliquez pour sélectionner</p>
                    <input type="file" accept=".csv,.xlsx,.xls" className="hidden" id="import-file-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImportStatus("parsing");
                        const reader = new FileReader();
                        const isCSV = file.name.toLowerCase().endsWith(".csv");

                        if (isCSV) {
                          reader.onload = (evt) => {
                            try {
                              const text = evt.target.result;
                              // Detect separator (semicolon or comma)
                              const sep = (text.split(";").length > text.split(",").length) ? ";" : ",";
                              const lines = text.split(/\r?\n/).filter(l => l.trim());
                              if (lines.length < 2) { setImportStatus("error"); return; }
                              const headers = lines[0].split(sep).map(h => h.trim().replace(/^["']|["']$/g, ""));
                              const rows = lines.slice(1).map(line => {
                                const vals = line.split(sep).map(v => v.trim().replace(/^["']|["']$/g, ""));
                                const obj = {};
                                headers.forEach((h, i) => { obj[h] = vals[i] || ""; });
                                return obj;
                              }).filter(r => Object.values(r).some(v => v));
                              setImportData({ rows, fileName: file.name, headers });
                              setImportStatus("preview");
                            } catch(parseErr) { console.error(parseErr); setImportStatus("error"); }
                          };
                          reader.readAsText(file, "UTF-8");
                        } else {
                          // Excel: load SheetJS from CDN (no npm dependency needed)
                          reader.onload = async (evt) => {
                            try {
                              if (!window.XLSX) {
                                const script = document.createElement("script");
                                script.src = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
                                document.head.appendChild(script);
                                await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; });
                              }
                              const data = new Uint8Array(evt.target.result);
                              const workbook = window.XLSX.read(data, { type: "array" });
                              const sheet = workbook.Sheets[workbook.SheetNames[0]];
                              const json = window.XLSX.utils.sheet_to_json(sheet, { defval: "" });
                              if (json.length === 0) { setImportStatus("error"); return; }
                              const headers = Object.keys(json[0]);
                              setImportData({ rows: json, fileName: file.name, headers });
                              setImportStatus("preview");
                            } catch(xlsErr) { console.error(xlsErr); setImportStatus("error"); }
                          };
                          reader.readAsArrayBuffer(file);
                        }
                        e.target.value = "";
                      }}
                    />
                    <label htmlFor="import-file-input" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700 transition-colors">
                      Choisir un fichier
                    </label>
                    {importStatus === "parsing" && <p className="text-xs text-blue-500 mt-2">Analyse en cours…</p>}
                    {importStatus === "error" && <p className="text-xs text-red-500 mt-2">Erreur lors de l'analyse du fichier. Vérifiez le format.</p>}
                  </div>
                  <div className="mt-3 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-bold mb-1">Format attendu :</p>
                    <p className="text-xs text-gray-500">Colonnes : <span className="font-mono bg-gray-200 px-1 rounded">Nom</span>, <span className="font-mono bg-gray-200 px-1 rounded">Département</span>, <span className="font-mono bg-gray-200 px-1 rounded">Contrat</span>, <span className="font-mono bg-gray-200 px-1 rounded">Salaire</span>, <span className="font-mono bg-gray-200 px-1 rounded">ETP</span>, <span className="font-mono bg-gray-200 px-1 rounded">Statut</span>, <span className="font-mono bg-gray-200 px-1 rounded">Tickets Restaurant</span>, <span className="font-mono bg-gray-200 px-1 rounded">Transport</span>, <span className="font-mono bg-gray-200 px-1 rounded">Bonus</span></p>
                    <p className="text-xs text-gray-400 mt-1">Les colonnes manquantes seront ignorées. Le séparateur CSV est détecté automatiquement (virgule ou point-virgule).</p>
                  </div>
                </div>
              )}

              {importStatus === "preview" && importData && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-gray-700">{importData.fileName} — {importData.rows.length} ligne(s) détectée(s)</p>
                    <div className="flex gap-2">
                      <Btn variant="ghost" onClick={() => { setImportData(null); setImportStatus(""); }}><X size={12}/>Annuler</Btn>
                      <Btn variant="success" onClick={() => {
                        // Map imported rows to employee objects
                        const colMap = {};
                        const hLower = importData.headers.map(h => h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
                        const findCol = (keywords) => {
                          for (const kw of keywords) {
                            const idx = hLower.findIndex(h => h.includes(kw));
                            if (idx >= 0) return importData.headers[idx];
                          }
                          return null;
                        };
                        colMap.name = findCol(["nom","name","poste","employe"]);
                        colMap.dept = findCol(["departement","department","dept","service"]);
                        colMap.contract = findCol(["contrat","contract","type"]);
                        colMap.salary = findCol(["salaire","salary","brut","remuneration"]);
                        colMap.fte = findCol(["etp","fte","temps"]);
                        colMap.status = findCol(["statut","status"]);
                        colMap.ticketsResto = findCol(["ticket","resto","restaurant"]);
                        colMap.transportBenefit = findCol(["transport","navigo","mobilite"]);
                        colMap.bonus = findCol(["bonus","prime"]);
                        colMap.comment = findCol(["commentaire","comment","note"]);
                        colMap.startDate = findCol(["date debut","date d'embauche","start","embauche"]);

                        const newEmps = importData.rows.map(row => {
                          const emp = { ...blankEmp, id: nextId() };
                          if (colMap.name) emp.name = String(row[colMap.name] || "").trim();
                          if (colMap.dept && DEPTS.includes(String(row[colMap.dept] || "").trim())) emp.dept = String(row[colMap.dept]).trim();
                          if (colMap.contract && CONTRACTS.includes(String(row[colMap.contract] || "").trim())) emp.contract = String(row[colMap.contract]).trim();
                          if (colMap.salary) emp.salary = parseFloat(String(row[colMap.salary]).replace(/[^\d.,]/g,"").replace(",",".")) || 0;
                          if (colMap.fte) emp.fte = parseFloat(String(row[colMap.fte]).replace(",",".")) || 1.0;
                          if (colMap.status && STATUSES.includes(String(row[colMap.status] || "").trim())) emp.status = String(row[colMap.status]).trim();
                          if (colMap.ticketsResto) emp.ticketsResto = parseFloat(String(row[colMap.ticketsResto]).replace(/[^\d.,]/g,"").replace(",",".")) || 0;
                          if (colMap.transportBenefit) emp.transportBenefit = parseFloat(String(row[colMap.transportBenefit]).replace(/[^\d.,]/g,"").replace(",",".")) || 0;
                          if (colMap.bonus) emp.bonus = parseFloat(String(row[colMap.bonus]).replace(/[^\d.,]/g,"").replace(",",".")) || 0;
                          if (colMap.comment) emp.comment = String(row[colMap.comment] || "").trim();
                          if (colMap.startDate) emp.startDate = String(row[colMap.startDate] || "").trim();
                          return emp;
                        }).filter(e => e.name);

                        if (newEmps.length > 0) {
                          setEmployees(prev => [...prev, ...newEmps]);
                          // Init FTE alloc for new employees
                          const newAllocs = {};
                          newEmps.forEach(emp => {
                            const a = {};
                            entities.forEach(ent => { a[ent.id] = ent.id === emp.entityId ? 1 : 0; });
                            newAllocs[emp.id] = a;
                          });
                          setFteAlloc(prev => ({ ...prev, ...newAllocs }));
                        }
                        setImportStatus("done");
                      }}><Check size={12}/>Importer {importData.rows.length} employé(s)</Btn>
                    </div>
                  </div>
                  <div className="overflow-x-auto max-h-64 overflow-y-auto border rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 sticky top-0"><tr>
                        {importData.headers.map(h => <th key={h} className="p-2 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {importData.rows.slice(0, 20).map((row, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            {importData.headers.map(h => <td key={h} className="p-2 whitespace-nowrap">{String(row[h] || "")}</td>)}
                          </tr>
                        ))}
                        {importData.rows.length > 20 && <tr><td colSpan={importData.headers.length} className="p-2 text-center text-gray-400">… et {importData.rows.length - 20} ligne(s) supplémentaire(s)</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importStatus === "done" && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2"><Check size={24} className="text-green-600"/></div>
                  <p className="text-sm font-bold text-green-800">Import réussi !</p>
                  <p className="text-xs text-gray-500 mt-1">Les employés ont été ajoutés à la liste. Vérifiez les données et ajustez si nécessaire.</p>
                  <Btn variant="ghost" className="mt-3" onClick={() => { setShowImport(false); setImportData(null); setImportStatus(""); }}>Fermer</Btn>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Augmentations individuelles — panneau dépliable */}
        {(() => {
          const totalImpact = computed.empCosts.reduce((s, e) => s + (e.annualEffective - e.salary), 0);
          const avgRaisePct = employees.length > 0 ? computed.empCosts.reduce((s, e) => s + e.totalRaisePct, 0) / employees.length : 0;

          return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button onClick={() => setShowRaises(!showRaises)} className="w-full flex items-center justify-between p-5 hover:bg-orange-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100"><ArrowUpRight size={18} className="text-orange-600"/></div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-gray-800">Augmentations salariales {settings.year}</h3>
                    <p className="text-xs text-gray-500">
                      Entreprise: {fmtPct(settings.salaryIncrease)} + individuelles • Impact: {fmt(cv(totalImpact), cur)} • Moyenne totale: {fmtPct(avgRaisePct)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-orange-600">{fmt(cv(totalImpact), cur)}</span>
                  {showRaises ? <ChevronDown size={16} className="text-gray-400"/> : <ChevronRight size={16} className="text-gray-400"/>}
                </div>
              </button>

              {showRaises && (
                <div className="border-t border-gray-100 p-5">
                  <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-xs text-orange-800">
                      <strong>Augmentation entreprise :</strong> {fmtPct(settings.salaryIncrease)} (paramétrable dans Hypothèses).
                      L'augmentation individuelle ci-dessous s'ajoute au taux entreprise.
                      Le mois effectif détermine à partir de quand le nouveau salaire s'applique dans le budget.
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-orange-600 text-white">
                        <th className="p-2.5 text-left text-xs">Employé</th>
                        <th className="p-2.5 text-center text-xs">Contrat</th>
                        <th className="p-2.5 text-right text-xs">Salaire actuel</th>
                        <th className="p-2.5 text-center text-xs">Augm. entreprise</th>
                        <th className="p-2.5 text-center text-xs">Augm. individuelle</th>
                        <th className="p-2.5 text-center text-xs">Total augm.</th>
                        <th className="p-2.5 text-center text-xs">Mois effectif</th>
                        <th className="p-2.5 text-right text-xs">Salaire projeté</th>
                        <th className="p-2.5 text-right text-xs">Impact annuel</th>
                        <th className="p-2.5 text-left text-xs">Commentaire</th>
                      </tr></thead>
                      <tbody>
                        {computed.empCosts.map(emp => {
                          const r = raises[emp.id] || { pct: 0, effectiveMonth: 0, comment: "" };
                          const impact = emp.annualEffective - emp.salary;
                          return (
                            <tr key={emp.id} className="border-t border-gray-100 hover:bg-orange-50/30">
                              <td className="p-2.5 text-xs font-medium">{emp.name}</td>
                              <td className="p-2.5 text-center"><Badge text={emp.contract} color={emp.contract==="CDI"?"blue":emp.contract==="CDD"?"orange":"purple"}/></td>
                              <td className="p-2.5 text-right text-xs">{fmt(cv(emp.salary), cur)}</td>
                              <td className="p-2.5 text-center text-xs text-gray-500">{fmtPct(settings.salaryIncrease)}</td>
                              <td className="p-2.5 text-center">
                                <input type="number" step="0.1" min="-10" max="50"
                                  value={parseFloat(((r.pct || 0) * 100).toFixed(2))}
                                  onChange={ev => { const v = (parseFloat(ev.target.value) || 0) / 100; setRaises(p => ({...p, [emp.id]: {...(p[emp.id] || {}), pct: v}})); }}
                                  className="w-16 p-1 border rounded text-center text-xs text-orange-700 font-medium" />
                                <span className="text-xs text-gray-400 ml-0.5">%</span>
                              </td>
                              <td className="p-2.5 text-center text-xs font-bold text-orange-700">{fmtPct(emp.totalRaisePct)}</td>
                              <td className="p-2.5 text-center">
                                <select value={r.effectiveMonth || 0}
                                  onChange={ev => { setRaises(p => ({...p, [emp.id]: {...(p[emp.id] || {}), effectiveMonth: parseInt(ev.target.value)}})); }}
                                  className="p-1 border rounded text-xs text-blue-700 font-medium bg-white">
                                  {MONTHS_FR.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                </select>
                              </td>
                              <td className="p-2.5 text-right text-xs font-medium text-green-700">{fmt(cv(emp.salaryAfter), cur)}</td>
                              <td className={`p-2.5 text-right text-xs font-bold ${impact > 0 ? "text-orange-600" : "text-gray-400"}`}>
                                {impact > 0 ? `+${fmt(cv(impact), cur)}` : "—"}
                              </td>
                              <td className="p-2.5">
                                <input type="text" value={r.comment || ""}
                                  onChange={ev => { setRaises(p => ({...p, [emp.id]: {...(p[emp.id] || {}), comment: ev.target.value}})); }}
                                  placeholder="Motif…"
                                  className="w-full p-1 border rounded text-xs text-gray-600" />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot><tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                        <td colSpan={2} className="p-2.5 text-xs">Total</td>
                        <td className="p-2.5 text-right text-xs">{fmt(cv(employees.reduce((s,e) => s + e.salary, 0)), cur)}</td>
                        <td className="p-2.5 text-center text-xs">{fmtPct(settings.salaryIncrease)}</td>
                        <td className="p-2.5 text-center text-xs">{fmtPct(employees.length > 0 ? computed.empCosts.reduce((s,e) => s + (e.raise.pct || 0), 0) / employees.length : 0)}</td>
                        <td className="p-2.5 text-center text-xs">{fmtPct(avgRaisePct)}</td>
                        <td></td>
                        <td className="p-2.5 text-right text-xs">{fmt(cv(computed.empCosts.reduce((s,e) => s + e.salaryAfter, 0)), cur)}</td>
                        <td className="p-2.5 text-right text-xs text-orange-600">+{fmt(cv(totalImpact), cur)}</td>
                        <td></td>
                      </tr></tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* FTE Allocation — editable */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Allocation FTE par entité <span className="font-normal text-gray-400">(modifiable)</span></h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-purple-700 text-white">
                <th className="p-2.5 text-left text-xs">Employé</th>
                {entities.map(e => <th key={e.id} className="p-2.5 text-center text-xs">{e.name.length>15?e.name.substring(0,13)+"…":e.name}</th>)}
                <th className="p-2.5 text-center text-xs">Total</th>
                <th className="p-2.5 text-right text-xs">Coût chargé</th>
              </tr></thead>
              <tbody>
                {employees.map(emp => {
                  const alloc = fteAlloc[emp.id] || {};
                  const empC = computed.empCosts.find(e => e.id === emp.id);
                  const total = entities.reduce((s, e) => s + (alloc[e.id] || 0), 0);
                  return (
                    <tr key={emp.id} className="border-t border-gray-100 hover:bg-purple-50/30">
                      <td className="p-2.5 text-xs font-medium">{emp.name}</td>
                      {entities.map(e => (
                        <td key={e.id} className="p-2.5 text-center">
                          <input type="number" min="0" max="1" step="0.05"
                            value={alloc[e.id] ?? 0}
                            onChange={ev => { const v = parseFloat(ev.target.value)||0; setFteAlloc(p => ({...p, [emp.id]: {...(p[emp.id]||{}), [e.id]: v}})); }}
                            className="w-16 p-1 border rounded text-center text-xs text-blue-700 font-medium" />
                        </td>
                      ))}
                      <td className={`p-2.5 text-center text-xs font-bold ${Math.abs(total-1)>0.01?"text-red-600":"text-green-700"}`}>{fmtPct(total)}</td>
                      <td className="p-2.5 text-right text-xs">{fmt(cv(empC?.charged||0),cur)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot><tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                <td className="p-2.5 text-xs">Total par entité</td>
                {entities.map(e => <td key={e.id} className="p-2.5 text-center text-xs">{fmt(cv(computed.allocCosts[e.id]||0),cur)}</td>)}
                <td></td><td className="p-2.5 text-right text-xs">{fmt(cv(computed.totalMasse),cur)}</td>
              </tr></tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // R&D TAB — full CRUD
  // ============================================================
  const RDTab = () => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAdd, setShowAdd] = useState(false);
    // Coûts directs R&D uniquement (personnel géré dans RH)
    const costKeys = ["cro","reagents","equipment","ip","travel","other"];
    const costLabels = ["CRO","Réactifs","Équipements","PI/Brevets","Déplacements","Autres"];
    const projTotal = (p) => costKeys.reduce((s,k)=>s+(p[k]||0),0);
    const grandTotal = projects.reduce((s,p)=>s+projTotal(p),0);
    const blank = { name: "", entityId: entities[0]?.id||1, cro:0, reagents:0, equipment:0, ip:0, travel:0, other:0 };

    const startEdit = (p) => { setEditingId(p.id); setEditForm({...p}); };
    const saveEdit = () => { setProjects(p => p.map(x => x.id===editingId ? {...x,...editForm} : x)); setEditingId(null); };
    const addProj = () => { setProjects(p => [...p, {...editForm, id: nextId()}]); setShowAdd(false); };
    const delProj = (id) => setProjects(p => p.filter(x => x.id!==id));

    const sfn = fn => setEditForm(prev => typeof fn === 'function' ? fn(prev) : fn);

    const ProjForm = ({ form, setForm, onSave, onCancel }) => (
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 space-y-3">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div><label className="text-xs text-gray-500 block mb-1">Nom du projet</label><Input value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Nom du projet" className="w-full text-xs"/></div>
          <div><label className="text-xs text-gray-500 block mb-1">Entité</label><Select value={form.entityId} onChange={v=>setForm(f=>({...f,entityId:parseInt(v)}))} options={entities.map(e=>({value:e.id,label:e.name}))} className="w-full text-xs"/></div>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {costKeys.map((k,i) => (
            <div key={k}><label className="text-xs text-gray-500 block mb-1">{costLabels[i]}</label><Input type="number" value={form[k]} onChange={v=>setForm(f=>({...f,[k]:v}))} className="w-full text-xs text-right"/></div>
          ))}
        </div>
        <div className="flex gap-2"><Btn variant="success" onClick={onSave}><Check size={12}/>Enregistrer</Btn><Btn variant="ghost" onClick={onCancel}><X size={12}/>Annuler</Btn></div>
      </div>
    );

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div><h2 className="text-lg font-bold text-gray-900">Coûts R&D par projet</h2><p className="text-sm text-gray-500">{projects.length} projets • Total coûts directs: {fmt(cv(grandTotal),cur)} • Personnel: voir onglet RH</p></div>
          <Btn onClick={()=>{setShowAdd(true);setEditForm({...blank});}}><Plus size={14}/>Ajouter un projet</Btn>
        </div>

        {showAdd && <ProjForm form={editForm} setForm={sfn} onSave={addProj} onCancel={()=>setShowAdd(false)}/>}

        {projects.map(p => {
          if (editingId===p.id) return <ProjForm key={p.id} form={editForm} setForm={sfn} onSave={saveEdit} onCancel={()=>setEditingId(null)}/>;
          const ent = entities.find(e=>e.id===p.entityId);
          const total = projTotal(p);
          return (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-gray-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor:ent?.color}}/>
                  <div><h4 className="font-bold text-gray-900 text-sm">{p.name}</h4><span className="text-xs text-gray-500">{ent?.name}</span></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-900">{fmt(cv(total),cur)}</span>
                  <div className="flex gap-1 border-l pl-3">
                    <button onClick={()=>startEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700" title="Modifier"><Edit3 size={16}/></button>
                    <button onClick={()=>delProj(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600" title="Supprimer"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
                {costKeys.map((k,i) => (
                  <div key={k} className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500">{costLabels[i]}</div>
                    <div className="text-xs font-bold mt-0.5">{fmt(cv(p[k]),cur)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-red-700 text-white">
              <th className="p-2.5 text-left text-xs">Projet</th><th className="p-2.5 text-left text-xs">Entité</th>
              {costLabels.map(l=><th key={l} className="p-2.5 text-right text-xs">{l}</th>)}
              <th className="p-2.5 text-right text-xs font-bold">Total</th>
            </tr></thead>
            <tbody>
              {projects.map(p => {
                const ent = entities.find(e=>e.id===p.entityId);
                return (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="p-2.5 text-xs font-medium">{p.name}</td>
                    <td className="p-2.5 text-xs">{ent?.name.length>15?ent.name.substring(0,13)+"…":ent?.name}</td>
                    {costKeys.map(k=><td key={k} className="p-2.5 text-right text-xs">{fmt(cv(p[k]),cur)}</td>)}
                    <td className="p-2.5 text-right text-xs font-bold">{fmt(cv(projTotal(p)),cur)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot><tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
              <td colSpan={2} className="p-2.5 text-xs">TOTAL R&D</td>
              {costKeys.map(k=><td key={k} className="p-2.5 text-right text-xs">{fmt(cv(projects.reduce((s,p)=>s+p[k],0)),cur)}</td>)}
              <td className="p-2.5 text-right text-xs">{fmt(cv(grandTotal),cur)}</td>
            </tr></tfoot>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Répartition par projet</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={projects.map(p=>({name:p.name.length>20?p.name.substring(0,18)+"…":p.name,CRO:p.cro,Réactifs:p.reagents,Équipements:p.equipment,"PI/Brevets":p.ip}))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis type="number" tick={{fontSize:10}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/><YAxis dataKey="name" type="category" tick={{fontSize:10}} width={150}/>
              <Tooltip formatter={v=>fmt(cv(v),cur)}/><Legend/><Bar dataKey="CRO" stackId="a" fill="#27AE60"/><Bar dataKey="Réactifs" stackId="a" fill="#F39C12"/><Bar dataKey="Équipements" stackId="a" fill="#8E44AD"/><Bar dataKey="PI/Brevets" stackId="a" fill="#2E5090"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // ============================================================
  // ENTITIES TAB — full CRUD
  // ============================================================
  const EntitiesTab = () => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAdd, setShowAdd] = useState(false);
    const blank = { name: "", type: "Joint-Venture", siren: "", currency: "EUR", date: "", participation: 0, color: ENT_COLORS[entities.length % ENT_COLORS.length] };

    const startEdit = (e) => { setEditingId(e.id); setEditForm({...e}); };
    const saveEdit = () => { setEntities(p => p.map(e => e.id===editingId ? {...e,...editForm} : e)); setEditingId(null); };
    const addEnt = () => {
      const id = nextId();
      setEntities(p => [...p, {...editForm, id}]);
      // Add default FTE alloc column for all employees
      setFteAlloc(p => {
        const n = {...p};
        Object.keys(n).forEach(empId => { n[empId] = {...n[empId], [id]: 0}; });
        return n;
      });
      setShowAdd(false);
    };
    const delEnt = (id) => {
      if (employees.some(e => e.entityId === id)) { alert("Impossible : des employés sont rattachés à cette entité."); return; }
      setEntities(p => p.filter(e => e.id !== id));
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div><h2 className="text-lg font-bold text-gray-900">Registre des Entités</h2><p className="text-sm text-gray-500">{entities.length} entités suivies</p></div>
          <Btn onClick={()=>{setShowAdd(true);setEditForm({...blank});}}><Plus size={14}/>Ajouter une entité</Btn>
        </div>

        {showAdd && (
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 space-y-3">
            <h3 className="text-sm font-bold text-blue-800">Nouvelle entité</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div><label className="text-xs text-gray-500">Nom</label><Input value={editForm.name} onChange={v=>setEditForm(f=>({...f,name:v}))} className="w-full"/></div>
              <div><label className="text-xs text-gray-500">Type</label><Select value={editForm.type} onChange={v=>setEditForm(f=>({...f,type:v}))} options={ENTITY_TYPES} className="w-full"/></div>
              <div><label className="text-xs text-gray-500">SIREN</label><Input value={editForm.siren} onChange={v=>setEditForm(f=>({...f,siren:v}))} className="w-full"/></div>
              <div><label className="text-xs text-gray-500">Participation (%)</label><Input type="number" value={editForm.participation} onChange={v=>setEditForm(f=>({...f,participation:v}))} className="w-full"/></div>
            </div>
            <div className="flex gap-2"><Btn variant="success" onClick={addEnt}><Check size={12}/>Créer</Btn><Btn variant="ghost" onClick={()=>setShowAdd(false)}><X size={12}/>Annuler</Btn></div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {entities.map(e => {
            const ac = computed.allocCosts[e.id]||0, pc = computed.projCosts[e.id]||0;
            const empCount = employees.filter(emp=>emp.entityId===e.id&&emp.status==="Actif").length;
            const projCount = projects.filter(p=>p.entityId===e.id).length;
            const isEditing = editingId === e.id;

            if (isEditing) return (
              <div key={e.id} className="bg-blue-50 rounded-xl border border-blue-200 p-5 space-y-3">
                <div className="space-y-2">
                  <Input value={editForm.name} onChange={v=>setEditForm(f=>({...f,name:v}))} className="w-full font-bold"/>
                  <Select value={editForm.type} onChange={v=>setEditForm(f=>({...f,type:v}))} options={ENTITY_TYPES} className="w-full"/>
                  <Input value={editForm.siren} onChange={v=>setEditForm(f=>({...f,siren:v}))} placeholder="SIREN" className="w-full"/>
                  <div className="flex gap-2 items-center"><span className="text-xs text-gray-500">Participation</span><Input type="number" value={editForm.participation} onChange={v=>setEditForm(f=>({...f,participation:v}))} className="w-20 text-right"/><span className="text-xs">%</span></div>
                </div>
                <div className="flex gap-2"><Btn variant="success" onClick={saveEdit}><Check size={12}/>Enregistrer</Btn><Btn variant="ghost" onClick={()=>setEditingId(null)}><X size={12}/></Btn></div>
              </div>
            );

            return (
              <div key={e.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{backgroundColor:e.color}}/>
                    <div><h4 className="font-bold text-gray-900">{e.name}</h4><Badge text={e.type} color={e.type==="Société mère"?"blue":e.type==="Joint-Venture"?"green":"purple"}/></div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={()=>startEdit(e)} className="text-blue-500 hover:text-blue-700"><Edit3 size={14}/></button>
                    <button onClick={()=>delEnt(e.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">SIREN</span><span className="font-mono text-xs">{e.siren}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Participation</span><span className="font-bold">{e.participation}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Employés actifs</span><span>{empCount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Projets R&D</span><span>{projCount}</span></div>
                  <hr className="my-2"/>
                  <div className="flex justify-between"><span className="text-gray-500">Personnel alloué</span><span className="font-bold">{fmt(cv(ac),cur)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">R&D directe</span><span className="font-bold">{fmt(cv(pc),cur)}</span></div>
                  <div className="flex justify-between text-lg"><span className="text-gray-700 font-bold">Total</span><span className="font-bold" style={{color:e.color}}>{fmt(cv(ac+pc),cur)}</span></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-4">Clés de répartition overhead</h3>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-700 text-white">
              <th className="p-2.5 text-left text-xs">Poste</th>
              {entities.map(e=><th key={e.id} className="p-2.5 text-center text-xs">{e.name.length>15?e.name.substring(0,13)+"…":e.name}</th>)}
              <th className="p-2.5 text-center text-xs">Total</th>
            </tr></thead>
            <tbody>{Object.entries(overheadAlloc).map(([label, alloc]) => {
              const total = entities.reduce((s,e)=>s+(alloc[e.id]||0),0);
              return (
                <tr key={label} className="border-t border-gray-100">
                  <td className="p-2.5 text-xs">{label}</td>
                  {entities.map(e=>(
                    <td key={e.id} className="p-2.5 text-center">
                      <input type="number" min="0" max="1" step="0.05" value={alloc[e.id]??0}
                        onChange={ev=>{const v=parseFloat(ev.target.value)||0; setOverheadAlloc(p=>({...p,[label]:{...(p[label]||{}),[e.id]:v}}));}}
                        className="w-16 p-1 border rounded text-center text-xs text-blue-700 font-medium"/>
                    </td>
                  ))}
                  <td className={`p-2.5 text-center text-xs font-bold ${Math.abs(total-1)>0.01?"text-red-600":"text-green-700"}`}>{fmtPct(total)}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============================================================
  // SETTINGS TAB
  // ============================================================
  const SettingsTab = () => {
    const [openSec, setOpenSec] = useState("general");
    const generalFields = [
      {key:"year",label:"Année budgétaire",type:"number"},{key:"eurUsd",label:"Taux EUR/USD",type:"number",step:0.01},
      {key:"inflation",label:"Inflation annuelle",type:"percent"},{key:"salaryIncrease",label:"Augmentation salariale",type:"percent"},
      {key:"joursOuvres",label:"Jours ouvrés / an",type:"number"},{key:"coutM2",label:"Coût m² bureaux (€/an)",type:"number"},{key:"surfaceParEmploye",label:"Surface / employé (m²)",type:"number"},
    ];
    const referenceFields = [{key:"pass",label:"PASS (Plafond Annuel Sécu. Sociale)",type:"number",step:100},{key:"smicAnnuel",label:"SMIC brut annuel",type:"number",step:100}];
    const chargeGroups = [
      {title:"Sécurité Sociale",fields:[{key:"maladie",label:"Assurance maladie",type:"percent",info:"Sur totalité"},{key:"maladieComplement",label:"Complément maladie (> 2.5x SMIC)",type:"percent"},{key:"allocFamiliales",label:"Alloc. familiales (taux réduit)",type:"percent",info:"≤ 3.5x SMIC"},{key:"allocFamilialesFort",label:"Alloc. familiales (taux plein)",type:"percent",info:"> 3.5x SMIC"},{key:"vieillessePlaf",label:"Vieillesse plafonnée",type:"percent",info:"Jusqu'à PASS"},{key:"vieillesseDepl",label:"Vieillesse déplafonnée",type:"percent"},{key:"csa",label:"CSA",type:"percent"}]},
      {title:"Retraite complémentaire",fields:[{key:"agircT1",label:"AGIRC-ARRCO T1",type:"percent",info:"Jusqu'à PASS"},{key:"agircT2",label:"AGIRC-ARRCO T2",type:"percent",info:"De PASS à 8x PASS"}]},
      {title:"Chômage & Garantie",fields:[{key:"chomage",label:"Assurance chômage",type:"percent",info:"Jusqu'à 4x PASS"},{key:"ags",label:"AGS",type:"percent"}]},
      {title:"Taxes & Contributions",fields:[{key:"fnal",label:"FNAL",type:"percent"},{key:"dialogueSocial",label:"Dialogue social",type:"percent"},{key:"apprentissage",label:"Taxe d'apprentissage",type:"percent"},{key:"formationPro",label:"Formation pro.",type:"percent"},{key:"transport",label:"Versement mobilité (IDF)",type:"percent"},{key:"accidentTravail",label:"Accident du travail",type:"percent",info:"Variable selon secteur"}]},
      {title:"Provisions",fields:[{key:"provisionCP",label:"Provision congés payés",type:"percent"}]},
    ];
    const toggles = [{key:"effectifPlus50",label:"Entreprise de 50+ salariés",info:"Change le FNAL"},{key:"zoneIDF",label:"Île-de-France",info:"Active versement mobilité"},{key:"reductionFillon",label:"Réduction Fillon",info:"Pour salaires ≤ 1.6x SMIC"}];

    const Field = ({f}) => (
      <div className="flex items-center justify-between py-1">
        <div><label className="text-sm text-gray-700">{f.label}</label>{f.info&&<div className="text-xs text-gray-400">{f.info}</div>}</div>
        {f.type==="percent"?(
          <div className="flex items-center"><input type="number" step="0.01" value={parseFloat((settings[f.key]*100).toFixed(3))} onChange={e=>setSettings(p=>({...p,[f.key]:parseFloat(e.target.value)/100||0}))} className="w-20 p-1.5 border rounded-lg text-right text-sm text-blue-700 font-medium"/><span className="ml-1 text-gray-500 text-sm">%</span></div>
        ):(
          <input type="number" step={f.step||1} value={settings[f.key]} onChange={e=>setSettings(p=>({...p,[f.key]:parseFloat(e.target.value)||0}))} className="w-28 p-1.5 border rounded-lg text-right text-sm text-blue-700 font-medium"/>
        )}
      </div>
    );

    const Section = ({id,title,children}) => (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <button onClick={()=>setOpenSec(openSec===id?null:id)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
          <span className="text-sm font-bold text-gray-800">{title}</span>{openSec===id?<ChevronDown size={16} className="text-gray-400"/>:<ChevronRight size={16} className="text-gray-400"/>}
        </button>
        {openSec===id&&<div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">{children}</div>}
      </div>
    );

    const simSalaries = [30000,45000,60000,85000,120000];
    const simResults = simSalaries.map(s => { const r = calculateChargesFR(s,"CDI",settings); return {salaire:s,charges:r.total,taux:r.taux,charged:r.totalCharged}; });

    return (
      <div className="space-y-4 max-w-3xl">
        <h2 className="text-lg font-bold text-gray-900">Hypothèses & Paramètres</h2>
        <p className="text-sm text-gray-500">Tous les taux sont modifiables et recalculent automatiquement les coûts</p>
        <Section id="general" title="Paramètres généraux">{generalFields.map(f=><Field key={f.key} f={f}/>)}</Section>
        <Section id="references" title="Plafonds de référence (PASS, SMIC)">
          {referenceFields.map(f=><Field key={f.key} f={f}/>)}
          <div className="text-xs text-gray-400 mt-1">Seuil Fillon: {fmt(settings.smicAnnuel*1.6)} • Seuil maladie: {fmt(settings.smicAnnuel*2.5)} • Seuil alloc. fam.: {fmt(settings.smicAnnuel*3.5)}</div>
        </Section>
        {chargeGroups.map((g,i)=><Section key={i} id={`c-${i}`} title={`Cotisations — ${g.title}`}>{g.fields.map(f=><Field key={f.key} f={f}/>)}</Section>)}
        <Section id="toggles" title="Options de calcul">
          {toggles.map(t=>(
            <div key={t.key} className="flex items-center justify-between py-1">
              <div><label className="text-sm text-gray-700">{t.label}</label><div className="text-xs text-gray-400">{t.info}</div></div>
              <button onClick={()=>setSettings(p=>({...p,[t.key]:!p[t.key]}))} className={`w-12 h-6 rounded-full transition-colors ${settings[t.key]?"bg-green-500":"bg-gray-300"}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[t.key]?"translate-x-6":"translate-x-0.5"}`}/>
              </button>
            </div>
          ))}
        </Section>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Simulation par tranche salariale</h3>
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50"><th className="p-2 text-left text-xs font-semibold text-gray-600">Salaire brut</th><th className="p-2 text-right text-xs font-semibold text-gray-600">Charges</th><th className="p-2 text-right text-xs font-semibold text-gray-600">Taux effectif</th><th className="p-2 text-right text-xs font-semibold text-gray-600">Coût employeur</th></tr></thead>
            <tbody>{simResults.map(r=>(
              <tr key={r.salaire} className="border-t border-gray-100"><td className="p-2 text-xs font-medium">{fmt(r.salaire)}</td><td className="p-2 text-right text-xs text-orange-700">{fmt(Math.round(r.charges))}</td><td className="p-2 text-right text-xs font-bold">{fmtPct(r.taux)}</td><td className="p-2 text-right text-xs font-bold">{fmt(Math.round(r.charged))}</td></tr>
            ))}</tbody>
          </table>
          <p className="text-xs text-gray-400 mt-2">Les bas salaires bénéficient de la réduction Fillon. Les hauts salaires subissent le complément maladie et les alloc. familiales au taux plein.</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3"><AlertTriangle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0"/>
            <div className="text-sm text-yellow-800"><strong>Note :</strong> Taux basés sur la réglementation française 2025-2026 (estimations). Vérifiez avec votre expert-comptable pour les taux exacts (AT/MP, versement mobilité).</div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // LAYOUT
  // ============================================================
  const tabs = [
    {id:"dashboard",label:"Tableau de Bord",icon:TrendingUp},{id:"budget",label:"Budget",icon:Wallet},
    {id:"hr",label:"RH & Effectifs",icon:Users},{id:"rd",label:"Coûts R&D",icon:FlaskConical},
    {id:"entities",label:"Entités",icon:Building2},{id:"settings",label:"Hypothèses",icon:Settings},
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3"><h1 className="text-xl font-bold text-gray-900">BioTech — Pilotage Financier</h1><SaveStatus status={saveStatus} lastSaved={lastSaved} /></div>
            <p className="text-xs text-gray-500 mt-0.5">Budget {settings.year} • {entities.length} entités • {computed.activeHC.toFixed(0)} ETP</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button onClick={()=>setShowCurrency("EUR")} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${showCurrency==="EUR"?"bg-white shadow-sm text-blue-700":"text-gray-500"}`}><Euro size={14}/> EUR</button>
              <button onClick={()=>setShowCurrency("USD")} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${showCurrency==="USD"?"bg-white shadow-sm text-green-700":"text-gray-500"}`}><DollarSign size={14}/> USD</button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-4 overflow-x-auto">
          {tabs.map(t=><TabBtn key={t.id} active={tab===t.id} onClick={()=>setTab(t.id)} icon={t.icon} label={t.label}/>)}
        </div>
      </div>
      <div className="p-6 max-w-screen-xl mx-auto">
        {tab==="dashboard"&&<DashboardTab/>}{tab==="budget"&&<BudgetTab/>}{tab==="hr"&&<HRTab/>}
        {tab==="rd"&&<RDTab/>}{tab==="entities"&&<EntitiesTab/>}{tab==="settings"&&<SettingsTab/>}
      </div>
    </div>
  );
}
