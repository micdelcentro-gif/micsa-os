import express from "express";



import fs from "fs";
import path from "path";
import crypto from "crypto";
import { z } from "zod";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json({ limit: "15mb" }));

/* =========================
   ENV
========================= */
const PORT = Number(process.env.PORT ?? 8080);
const API_KEY = process.env.API_KEY ?? "micsa_key";
const DB_FILE = process.env.DB_FILE ?? path.join(process.cwd(), "db.json");
const IVA = Number(process.env.IVA ?? 0.16);

const EMAIL_ENABLED = String(process.env.EMAIL_ENABLED ?? "false") === "true";
const EMAIL_HOST = process.env.EMAIL_HOST ?? "";
const EMAIL_PORT = Number(process.env.EMAIL_PORT ?? 587);
const EMAIL_USER = process.env.EMAIL_USER ?? "";
const EMAIL_PASS = process.env.EMAIL_PASS ?? "";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "no-reply@micsa.local";

const WHATSAPP_ENABLED = String(process.env.WHATSAPP_ENABLED ?? "false") === "true";
const WHATSAPP_PROVIDER = process.env.WHATSAPP_PROVIDER ?? "stub";

/* =========================
   RULES MICSA
========================= */
const RULES = {
    labor: { weekly: 6489.25, weeksMonth: 4 },
    welding: { per10Month: { cost: 18446.96, price: 21213 } },
    weldingConsumablesPerWelderMonth: 3800,

    dc3: { sell: 500, package: 1500, cost: 100 },
    medical: { cost: 250, sell: 350 },

    managementPct: 0.15,

    platformPM: { feePerPersonMonth: Number(process.env.PM_FEE_PER_PERSON_MONTH ?? 180) },
    iso: { feePerProjectMonth: Number(process.env.ISO_FEE_PER_PROJECT_MONTH ?? 3500) },

    commercialization: { defaultMarginPct: Number(process.env.COMM_MARGIN_PCT ?? 0.20) },

    epp: { markupPct: Number(process.env.EPP_MARKUP_PCT ?? 0.25), workingDaysMonth: Number(process.env.WORKING_DAYS_MONTH ?? 26) }
};

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const cuid = () => crypto.randomBytes(12).toString("hex");

/* =========================
   DB JSON
========================= */
function loadDB() {
    if (!fs.existsSync(DB_FILE)) {
        const fresh = {
            version: 1,
            catalog: {
                epp: {
                    CASCO_MATRACA: { sku: "CASCO_MATRACA", name: "Casco con matraca", unit: "pz", pricePlusIva: 120.90 },
                    BARBIQUEJO_2P: { sku: "BARBIQUEJO_2P", name: "Barbiquejo 2 puntos", unit: "pz", pricePlusIva: 23.40 },
                    CHALECO_REF: { sku: "CHALECO_REF", name: "Chaleco reflejante", unit: "pz", pricePlusIva: 70.90 },
                    CALZADO_SEG: { sku: "CALZADO_SEG", name: "Calzado de seguridad", unit: "par", pricePlusIva: 240.00 },
                    LENTE_BASICO: { sku: "LENTE_BASICO", name: "Lente seguridad", unit: "pz", pricePlusIva: 16.20 },
                    GUANTE_NITRILO: { sku: "GUANTE_NITRILO", name: "Guante nitrilo", unit: "par", pricePlusIva: 16.90 },
                    TAPON_DESECHABLE: { sku: "TAPON_DESECHABLE", name: "Tapón auditivo", unit: "par", pricePlusIva: 7.90 }
                }
            },
            quotes: [],
            projects: [],
            signatureRequests: [],
            reports: []
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(fresh, null, 2), "utf-8");
        return fresh;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveDB(db) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

/* =========================
   AUTH
========================= */
app.use((req, res, next) => {
    if (req.path === "/health" || req.path.startsWith("/docs")) return next();
    if (req.header("x-api-key") !== API_KEY) return res.status(401).json({ error: "Unauthorized" });
    next();
});

/* =========================
   Swagger UI
========================= */
const openapiPath = new URL("./openapi.yaml", import.meta.url);
const openapiText = fs.readFileSync(openapiPath, "utf-8");
const openapi = YAML.parse(openapiText);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

/* =========================
   Schemas
========================= */
const QuoteCreateSchema = z.object({
    clientName: z.string().min(1),
    projectName: z.string().min(1),
    location: z.string().min(1),
    workType: z.string().min(1),

    durationMonths: z.number().positive(),
    paymentTerms: z.string().default("NETO 30"),

    peopleByRole: z.record(z.string(), z.number().int().nonnegative()),
    weldersCount: z.number().int().nonnegative().default(0),

    dc3PeopleCount: z.number().int().nonnegative().default(0),
    dc3PackageCount: z.number().int().nonnegative().default(0),

    medical: z.object({ enabled: z.boolean().default(true) }).default({ enabled: true }),
    epp: z.object({ enabled: z.boolean().default(true) }).default({ enabled: true }),
    platformPM: z.object({ enabled: z.boolean().default(true) }).default({ enabled: true }),
    iso: z.object({ enabled: z.boolean().default(true) }).default({ enabled: true }),

    commercialization: z.object({
        enabled: z.boolean().default(false),
        items: z.array(z.object({
            description: z.string().min(1),
            qty: z.number().positive(),
            unit: z.string().min(1).default("pz"),
            vendorCost: z.number().nonnegative(),
            marginPct: z.number().min(0).max(5).optional()
        })).default([])
    }).default({ enabled: false, items: [] }),

    logistics: z.object({
        enabled: z.boolean().default(false),
        travelPeopleCount: z.number().int().nonnegative().default(0),
        hotelNights: z.number().int().nonnegative().default(0),
        perDiemDays: z.number().int().nonnegative().default(0),
        roundTripTravelPerPerson: z.number().nonnegative().default(6342),
        hotelPerNight: z.number().nonnegative().default(1200),
        peoplePerRoom: z.number().int().positive().default(2),
        perDiemPerDay: z.number().nonnegative().default(350)
    }).default({
        enabled: false,
        travelPeopleCount: 0,
        hotelNights: 0,
        perDiemDays: 0,
        roundTripTravelPerPerson: 6342,
        hotelPerNight: 1200,
        peoplePerRoom: 2,
        perDiemPerDay: 350
    }),

    assumptions: z.array(z.string()).default([]),
    exclusions: z.array(z.string()).default([])
});

const ComplianceSchema = z.object({
    medicalOk: z.boolean(),
    dopingOk: z.boolean(),
    dc3Ok: z.boolean(),
    eppOk: z.boolean(),
    inductionOk: z.boolean(),
    isoDocsOk: z.boolean()
});

const SigReqSchema = z.object({
    projectId: z.string().min(1),
    signerName: z.string().min(1),
    signerRole: z.string().min(1)
});

const SigSignSchema = z.object({
    token: z.string().min(10),
    signatureBase64: z.string().min(20)
});

/* =========================
   Helpers
========================= */
function makeToken() {
    return crypto.randomBytes(24).toString("hex");
}
function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function estimateEpp(people, months, catalogEpp) {
    const qty = {};
    const add = (sku, q) => { qty[sku] = (qty[sku] ?? 0) + q; };

    add("CASCO_MATRACA", 1 * people);
    add("CHALECO_REF", 1 * people);
    add("BARBIQUEJO_2P", 1 * people);
    add("CALZADO_SEG", 1 * people);
    add("LENTE_BASICO", 4 * people * months);
    add("GUANTE_NITRILO", 4 * people * months);
    add("TAPON_DESECHABLE", 1 * people * (RULES.epp.workingDaysMonth * months));

    let costRealPlusIva = 0;
    const lines = Object.entries(qty).map(([sku, q]) => {
        const item = catalogEpp[sku];
        const unitPrice = item?.pricePlusIva ?? 0;
        const line = unitPrice * q;
        costRealPlusIva += line;
        return { sku, name: item?.name ?? "SKU_NO_ENCONTRADO", unit: item?.unit ?? "pz", qty: q, unitPricePlusIva: r2(unitPrice), lineCostPlusIva: r2(line) };
    });

    const sell = costRealPlusIva * (1 + RULES.epp.markupPct);
    return {
        lines,
        totals: {
            costRealPlusIva: r2(costRealPlusIva),
            sellPriceToMicsaPlusIva: r2(sell),
            profitPlusIva: r2(sell - costRealPlusIva),
            markupPct: RULES.epp.markupPct
        }
    };
}

function priceCommercialization(items) {
    let costReal = 0, price = 0;
    const lines = items.map(it => {
        const m = it.marginPct ?? RULES.commercialization.defaultMarginPct;
        const lineCost = it.vendorCost * it.qty;
        const linePrice = lineCost * (1 + m);
        costReal += lineCost; price += linePrice;
        return { ...it, marginPct: m, lineCost: r2(lineCost), linePrice: r2(linePrice), lineProfit: r2(linePrice - lineCost) };
    });
    return { costReal: r2(costReal), price: r2(price), profit: r2(price - costReal), lines };
}

function computeQuote(input, db) {
    const people = sum(Object.values(input.peopleByRole).map(Number));
    const months = input.durationMonths;

    const laborMonthly = RULES.labor.weekly * RULES.labor.weeksMonth;
    const laborCost = laborMonthly * months * people;

    const weldingUnits = input.weldersCount > 0 ? Math.ceil(input.weldersCount / 10) : 0;
    const weldingReal = weldingUnits * RULES.welding.per10Month.cost * months;
    const weldingBilled = weldingUnits * RULES.welding.per10Month.price * months;
    const weldingConsumables = input.weldersCount * RULES.weldingConsumablesPerWelderMonth * months;

    const dc3Cost = (input.dc3PeopleCount * RULES.dc3.cost) + (input.dc3PackageCount * RULES.dc3.cost * 3);
    const dc3Sell = (input.dc3PeopleCount * RULES.dc3.sell) + (input.dc3PackageCount * RULES.dc3.package);

    const medicalCost = input.medical.enabled ? people * RULES.medical.cost : 0;
    const medicalSell = input.medical.enabled ? people * RULES.medical.sell : 0;

    const epp = input.epp.enabled ? estimateEpp(people, months, db.catalog.epp) : null;
    const eppCost = input.epp.enabled ? epp.totals.costRealPlusIva : 0;
    const eppSell = input.epp.enabled ? epp.totals.sellPriceToMicsaPlusIva : 0;

    const comm = input.commercialization.enabled ? priceCommercialization(input.commercialization.items) : { costReal: 0, price: 0, profit: 0, lines: [] };

    const pmFee = input.platformPM.enabled ? (RULES.platformPM.feePerPersonMonth * people * months) : 0;
    const isoFee = input.iso.enabled ? (RULES.iso.feePerProjectMonth * months) : 0;

    let logisticsCost = 0;
    if (input.logistics.enabled) {
        const rooms = Math.ceil(input.logistics.travelPeopleCount / input.logistics.peoplePerRoom);
        const hotel = rooms * input.logistics.hotelPerNight * input.logistics.hotelNights;
        const perDiem = input.logistics.travelPeopleCount * input.logistics.perDiemPerDay * input.logistics.perDiemDays;
        const travel = input.logistics.travelPeopleCount * input.logistics.roundTripTravelPerPerson;
        logisticsCost = hotel + perDiem + travel;
    }

    const directReal = laborCost + weldingReal + weldingConsumables + dc3Cost + medicalCost + eppCost + comm.costReal + pmFee + isoFee + logisticsCost;
    const directPricingBase = laborCost + weldingBilled + weldingConsumables + dc3Sell + medicalSell + eppSell + comm.price + pmFee + isoFee + logisticsCost;

    const managementFee = directPricingBase * RULES.managementPct;

    const subtotal = directPricingBase + managementFee;
    const iva = subtotal * IVA;
    const total = subtotal + iva;

    const clientQuote = {
        header: {
            company: "GRUPO MICSA",
            clientName: input.clientName,
            projectName: input.projectName,
            location: input.location,
            workType: input.workType,
            durationMonths: input.durationMonths,
            paymentTerms: input.paymentTerms
        },
        commercial: {
            subtotal: r2(subtotal),
            iva: r2(iva),
            total: r2(total),
            currency: "MXN",
            validity: "15 días",
            notes: [
                "Tiempo extra no incluido. Se cotiza por separado conforme a ley.",
                "Gestión MICSA obligatoria (15%)."
            ]
        }
    };

    const grossProfit = (directPricingBase + managementFee) - directReal;
    const marginPct = subtotal > 0 ? (grossProfit / subtotal) * 100 : 0;

    const internal = {
        totals: {
            people,
            directRealCost: r2(directReal),
            pricingBase: r2(directPricingBase),
            managementFee15: r2(managementFee),
            grossProfitBeforeIva: r2(grossProfit),
            marginPct: r2(marginPct)
        },
        divisions: {
            labor: { cost: r2(laborCost) },
            welding: { units: weldingUnits, costReal: r2(weldingReal), billed: r2(weldingBilled), profit: r2(weldingBilled - weldingReal), consumables: r2(weldingConsumables) },
            dc3: { cost: r2(dc3Cost), sell: r2(dc3Sell), profit: r2(dc3Sell - dc3Cost) },
            medical: { cost: r2(medicalCost), sell: r2(medicalSell), profit: r2(medicalSell - medicalCost) },
            epp: input.epp.enabled ? epp.totals : { costRealPlusIva: 0, sellPriceToMicsaPlusIva: 0, profitPlusIva: 0, markupPct: RULES.epp.markupPct },
            commercialization: input.commercialization.enabled ? { cost: comm.costReal, sell: comm.price, profit: comm.profit } : { cost: 0, sell: 0, profit: 0 },
            platformPM: { sell: r2(pmFee) },
            iso: { sell: r2(isoFee) },
            logistics: { cost: r2(logisticsCost) }
        },
        eppLines: input.epp.enabled ? epp.lines : [],
        commLines: input.commercialization.enabled ? comm.lines : [],
        riskFlags: [
            input.paymentTerms.toUpperCase().includes("NETO 30") ? "⚠️ Riesgo financiero por cobranza (NETO 30)" : null,
            people > 50 ? "⚠️ Proyecto grande (>50 personas)" : null
        ].filter(Boolean)
    };

    return { clientQuote, internal, totals: { subtotal: r2(subtotal), iva: r2(iva), total: r2(total) } };
}

/* =========================
   Health
========================= */
app.get("/health", (_, res) => res.json({ ok: true, service: "MICSA Platform", version: "1.0.0" }));

/* =========================
   Catalog EPP
========================= */
app.get("/catalog/epp", (_, res) => {
    const db = loadDB();
    res.json(db.catalog.epp);
});

app.post("/catalog/epp/upsert", (req, res) => {
    const schema = z.object({
        items: z.array(z.object({
            sku: z.string().min(2),
            name: z.string().min(1),
            unit: z.enum(["pz", "par"]),
            pricePlusIva: z.number().nonnegative()
        }))
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const db = loadDB();
    for (const it of parsed.data.items) db.catalog.epp[it.sku] = it;
    saveDB(db);
    res.json({ ok: true, count: parsed.data.items.length });
});

/* =========================
   Quotes
========================= */
app.post("/quotes", (req, res) => {
    const parsed = QuoteCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const input = parsed.data;
    const db = loadDB();
    const result = computeQuote(input, db);

    const quote = {
        id: cuid(),
        createdAt: new Date().toISOString(),
        status: "DRAFT",
        input,
        clientQuote: result.clientQuote,
        internal: result.internal,
        totals: result.totals
    };

    db.quotes.push(quote);
    saveDB(db);

    res.status(201).json({ quoteId: quote.id, ...result });
});

app.get("/quotes", (_, res) => {
    const db = loadDB();
    const list = db.quotes.map(q => ({
        id: q.id,
        createdAt: q.createdAt,
        clientName: q.input.clientName,
        projectName: q.input.projectName,
        total: q.totals.total,
        status: q.status
    }));
    res.json(list);
});

app.get("/quotes/:id", (req, res) => {
    const db = loadDB();
    const q = db.quotes.find(x => x.id === req.params.id);
    if (!q) return res.status(404).json({ error: "Quote not found" });
    res.json(q);
});

app.get("/quotes/:id/print", (req, res) => {
    const db = loadDB();
    const q = db.quotes.find(x => x.id === req.params.id);
    if (!q) return res.status(404).send("Quote not found");

    const cq = q.clientQuote;
    const html = `<!doctype html>
<html><head><meta charset="utf-8"/>
<title>Cotización ${cq.header.projectName}</title>
<style>
body{font-family:Arial, sans-serif; margin:40px; color:#111;}
h1{margin:0 0 6px 0; color:#1a365d;}
.muted{color:#666; font-size:12px;}
table{width:100%; border-collapse:collapse; margin-top:14px;}
td,th{border:1px solid #ddd; padding:10px; vertical-align:top;}
.right{text-align:right;}
.section{margin-top:18px;}
ul{margin:8px 0 0 18px;}
.total{background:#f0f4f8; font-weight:bold;}
</style></head>
<body>
<h1>GRUPO MICSA</h1>
<div class="muted">Cotización | ${new Date(q.createdAt).toLocaleString("es-MX")}</div>
<div class="section">
<b>Cliente:</b> ${cq.header.clientName}<br/>
<b>Proyecto:</b> ${cq.header.projectName}<br/>
<b>Ubicación:</b> ${cq.header.location}<br/>
<b>Tipo:</b> ${cq.header.workType}<br/>
<b>Duración:</b> ${cq.header.durationMonths} mes(es)<br/>
<b>Pago:</b> ${cq.header.paymentTerms}<br/>
</div>
<div class="section">
<table>
<tr><th class="right">Subtotal</th><td class="right">$ ${cq.commercial.subtotal.toLocaleString("es-MX")} MXN</td></tr>
<tr><th class="right">IVA (16%)</th><td class="right">$ ${cq.commercial.iva.toLocaleString("es-MX")} MXN</td></tr>
<tr class="total"><th class="right">TOTAL</th><td class="right">$ ${cq.commercial.total.toLocaleString("es-MX")} MXN</td></tr>
</table>
<div class="muted" style="margin-top:10px;">Vigencia: ${cq.commercial.validity}</div>
<ul>${cq.commercial.notes.map((x) => `<li>${x}</li>`).join("")}</ul>
</div>
</body></html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
});

/* =========================
   Projects
========================= */
app.post("/projects/from-quote", (req, res) => {
    const schema = z.object({ quoteId: z.string().min(1), nameOverride: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const body = parsed.data;
    const db = loadDB();
    const quote = db.quotes.find(q => q.id === body.quoteId);
    if (!quote) return res.status(404).json({ error: "Quote not found" });

    const project = {
        id: cuid(),
        createdAt: new Date().toISOString(),
        quoteId: quote.id,
        name: body.nameOverride ?? quote.input.projectName,
        clientName: quote.input.clientName,
        location: quote.input.location,
        status: "ACTIVE"
    };

    db.projects.push(project);
    saveDB(db);

    res.status(201).json(project);
});

app.get("/projects", (_, res) => {
    const db = loadDB();
    res.json(db.projects);
});

app.get("/projects/:id", (req, res) => {
    const db = loadDB();
    const p = db.projects.find(x => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: "Project not found" });
    res.json(p);
});

app.post("/projects/:id/close", (req, res) => {
    const db = loadDB();
    const p = db.projects.find(x => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: "Project not found" });

    const pending = db.signatureRequests.filter(s => s.projectId === p.id && s.status === "PENDING").length;
    if (pending > 0) return res.status(409).json({ error: "❌ Cierre bloqueado: faltan firmas", pendingSignatures: pending });

    p.status = "CLOSED";
    p.closedAt = new Date().toISOString();
    saveDB(db);
    res.json({ ok: true, status: p.status, message: "✅ Proyecto cerrado" });
});

/* =========================
   Compliance gate
========================= */
app.post("/compliance/start-check", (req, res) => {
    const parsed = ComplianceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const d = parsed.data;
    const missing = [];
    if (!d.medicalOk) missing.push("Exámenes médicos vigentes");
    if (!d.dopingOk) missing.push("Antidoping vigente");
    if (!d.dc3Ok) missing.push("DC3 por puesto");
    if (!d.eppOk) missing.push("EPP asignado");
    if (!d.inductionOk) missing.push("Inducción / credenciales");
    if (!d.isoDocsOk) missing.push("Documentación ISO/HSE");

    res.json({
        startAllowed: missing.length === 0,
        status: missing.length === 0 ? "✅ LIBERADO" : "❌ BLOQUEADO",
        missingItems: missing,
        actions: missing.map(x => `Gestionar: ${x}`)
    });
});

/* =========================
   Signatures
========================= */
app.post("/signatures/request", (req, res) => {
    const parsed = SigReqSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const body = parsed.data;
    const db = loadDB();

    const token = makeToken();
    const tokenHash = hashToken(token);

    const row = {
        id: cuid(),
        createdAt: new Date().toISOString(),
        projectId: body.projectId,
        signerName: body.signerName,
        signerRole: body.signerRole,
        status: "PENDING",
        signedAt: null,
        signatureBase64: null,
        tokenHash
    };

    db.signatureRequests.push(row);
    saveDB(db);

    res.status(201).json({ signatureRequestId: row.id, token });
});

app.post("/signatures/:id/sign", (req, res) => {
    const parsed = SigSignSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const body = parsed.data;
    const db = loadDB();

    const row = db.signatureRequests.find(s => s.id === req.params.id);
    if (!row) return res.status(404).json({ error: "Signature request not found" });
    if (row.status === "SIGNED") return res.status(409).json({ error: "Already signed" });

    if (hashToken(body.token) !== row.tokenHash) return res.status(401).json({ error: "Invalid token" });

    row.status = "SIGNED";
    row.signedAt = new Date().toISOString();
    row.signatureBase64 = body.signatureBase64;

    saveDB(db);
    res.json({ ok: true, signedAt: row.signedAt, message: "✅ Firmado" });
});

app.get("/signatures/project/:projectId", (req, res) => {
    const db = loadDB();
    const list = db.signatureRequests.filter(s => s.projectId === req.params.projectId);
    res.json(list.map(s => ({
        id: s.id,
        signerName: s.signerName,
        signerRole: s.signerRole,
        status: s.status,
        signedAt: s.signedAt
    })));
});

/* =========================
   Dashboard CEO (KPIs)
========================= */
app.get("/dashboard/ceo", (_, res) => {
    const db = loadDB();

    const totalCotizado = db.quotes.reduce((a, q) => a + (q?.totals?.total ?? 0), 0);
    const totalUtilidad = db.quotes.reduce((a, q) => a + (q?.internal?.totals?.grossProfitBeforeIva ?? 0), 0);
    const proyectosActivos = db.projects.filter(p => p.status === "ACTIVE").length;
    const proyectosCerrados = db.projects.filter(p => p.status === "CLOSED").length;
    const cierresBloqueados = db.projects.filter(p => {
        const pending = db.signatureRequests.filter(s => s.projectId === p.id && s.status === "PENDING").length;
        return pending > 0 && p.status === "ACTIVE";
    }).length;

    res.json({
        quotes: db.quotes.length,
        projects: db.projects.length,
        proyectosActivos,
        proyectosCerrados,
        totalCotizado: r2(totalCotizado),
        totalUtilidad: r2(totalUtilidad),
        marginPromedio: totalCotizado > 0 ? r2((totalUtilidad / totalCotizado) * 100) : 0,
        cierresBloqueados
    });
});

/* =========================
   PDF Report (diario)
========================= */
app.get("/reports/project/:projectId/daily.pdf", (req, res) => {
    const db = loadDB();
    const project = db.projects.find(p => p.id === req.params.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="reporte-diario-${project.id}.pdf"`);

    const doc = new PDFDocument({ margin: 48 });
    doc.pipe(res);

    doc.fontSize(18).text("GRUPO MICSA – REPORTE DIARIO", { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Proyecto: ${project.name}`);
    doc.text(`Cliente: ${project.clientName}`);
    doc.text(`Ubicación: ${project.location}`);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-MX")}`);
    doc.text(`Status: ${project.status}`);
    doc.moveDown();

    doc.fontSize(12).text("Avances:", { underline: true });
    doc.fontSize(11).text("- Actividad 1: ______________________________");
    doc.text("- Actividad 2: ______________________________");
    doc.text("- Actividad 3: ______________________________");
    doc.moveDown();

    doc.fontSize(12).text("Incidencias / Riesgos:", { underline: true });
    doc.fontSize(11).text("- ____________________________________________");
    doc.text("- ____________________________________________");
    doc.moveDown();

    doc.fontSize(12).text("EPP / Seguridad / Cumplimiento:", { underline: true });
    doc.fontSize(11).text("- EPP completo: ____   DC3: ____   Médicos: ____");
    doc.text("- Observaciones: ______________________________");
    doc.moveDown();

    doc.fontSize(11).text("Firmas:", { underline: true });
    doc.text("Residente MICSA: _____________________________");
    doc.text("Representante Cliente: ________________________");

    doc.end();
});

/* =========================
   Email notifications
========================= */
app.post("/notifications/email", async (req, res) => {
    const schema = z.object({ to: z.string().min(3), subject: z.string().min(1), text: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const body = parsed.data;

    if (!EMAIL_ENABLED) return res.json({ ok: false, reason: "EMAIL_DISABLED", hint: "Activa EMAIL_ENABLED=true y configura SMTP" });

    try {
        const transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: EMAIL_PORT,
            secure: false,
            auth: { user: EMAIL_USER, pass: EMAIL_PASS }
        });

        await transporter.sendMail({ from: EMAIL_FROM, to: body.to, subject: body.subject, text: body.text });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

/* =========================
   WhatsApp notifications (stub)
========================= */
app.post("/notifications/whatsapp", async (req, res) => {
    const schema = z.object({ to: z.string().min(3), text: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const body = parsed.data;

    if (!WHATSAPP_ENABLED) return res.json({ ok: false, reason: "WHATSAPP_DISABLED", hint: "Activa WHATSAPP_ENABLED=true y configura proveedor (Twilio/WATI)" });

    res.json({ ok: true, provider: WHATSAPP_PROVIDER, delivered: false, note: "Integración pendiente de proveedor real" });
});

/* =========================
   E2E demo route
========================= */
app.post("/e2e/flow-demo", (req, res) => {
    const db = loadDB();

    const sample = {
        clientName: "Cliente Demo",
        projectName: "Proyecto Demo E2E",
        location: "Monclova, Coahuila",
        workType: "Montaje industrial",
        durationMonths: 1,
        paymentTerms: "NETO 30",
        peopleByRole: { soldador: 4, mecanico: 2 },
        weldersCount: 4,
        dc3PeopleCount: 6,
        dc3PackageCount: 0,
        medical: { enabled: true },
        epp: { enabled: true },
        platformPM: { enabled: true },
        iso: { enabled: true },
        commercialization: { enabled: false, items: [] },
        logistics: { enabled: false, travelPeopleCount: 0, hotelNights: 0, perDiemDays: 0, roundTripTravelPerPerson: 6342, hotelPerNight: 1200, peoplePerRoom: 2, perDiemPerDay: 350 },
        assumptions: [],
        exclusions: []
    };

    const result = computeQuote(sample, db);
    const quote = { id: cuid(), createdAt: new Date().toISOString(), status: "DRAFT", input: sample, ...result };
    db.quotes.push(quote);

    const project = { id: cuid(), createdAt: new Date().toISOString(), quoteId: quote.id, name: quote.clientQuote.header.projectName, clientName: quote.clientQuote.header.clientName, location: quote.clientQuote.header.location, status: "ACTIVE" };
    db.projects.push(project);

    const compliance = { startAllowed: false, status: "❌ BLOQUEADO", missingItems: ["DC3 por puesto", "Documentación ISO/HSE"] };

    const token = makeToken();
    const sr = { id: cuid(), createdAt: new Date().toISOString(), projectId: project.id, signerName: "Cliente Demo", signerRole: "Representante", status: "PENDING", signedAt: null, signatureBase64: null, tokenHash: hashToken(token) };
    db.signatureRequests.push(sr);

    saveDB(db);

    res.json({
        message: "🏭 Flujo E2E completado",
        quoteId: quote.id,
        projectId: project.id,
        compliance,
        signatureRequestId: sr.id,
        token,
        totals: quote.totals
    });
});

/* =========================
   START
========================= */
app.listen(PORT, () => {
    console.log(`🏭 MICSA Platform running on http://localhost:${PORT}`);
    console.log(`📚 Swagger: http://localhost:${PORT}/docs`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 4)}...`);
});
