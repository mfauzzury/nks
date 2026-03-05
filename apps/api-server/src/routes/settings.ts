import { Router } from "express";

import { prisma } from "../prisma.js";
import type { SettingsPayload } from "../types.js";
import { sendOk } from "../utils/responses.js";
import { adminMenuPrefsSchema, paymentGatewaysSchema, settingsInputSchema, sourceCategoriesSchema, sourceDataSchema, zakatTypesSchema } from "./schemas.js";

const DEFAULT_ZAKAT_TYPES = [
  {
    code: "ZFITRAH",
    name: "ZAKAT FITRAH",
    formula: "kadar_beras * bilangan_tanggungan",
    notes: "Zakat Fitrah wajib ditunaikan oleh setiap Muslim yang mampu sebelum solat Hari Raya Aidilfitri. Kadarnya berdasarkan harga makanan asasi (beras) bagi setiap tanggungan.",
    isActive: true,
    uiTemplate: "fitrah",
    codeSnippet: "// Optional custom logic for fitrah calculation",
    calculator: { mode: "none", expression: "", inputs: [] },
  },
  { code: "ZPENDAPATAN", name: "ZAKAT PENDAPATAN", formula: "tahun + jumlah_manual", notes: "Zakat Pendapatan dikenakan ke atas pendapatan yang diperoleh daripada penggajian, elaun, bonus, dan sumber pendapatan lain. Kadar zakat adalah 2.5% daripada jumlah pendapatan setelah ditolak perbelanjaan asasi.", isActive: true, uiTemplate: "standard_year_amount", codeSnippet: "", calculator: { mode: "none", expression: "", inputs: [] } },
  { code: "ZPERNIAGAAN", name: "ZAKAT PERNIAGAAN", formula: "tahun + jumlah_manual", notes: "Zakat Perniagaan wajib bagi harta perniagaan yang telah mencapai nisab dan cukup haul (setahun). Ia dikira berdasarkan modal kerja bersih atau keuntungan bersih syarikat.", isActive: true, uiTemplate: "standard_year_amount", codeSnippet: "", calculator: { mode: "none", expression: "", inputs: [] } },
  { code: "ZSIMPANAN", name: "ZAKAT SIMPANAN", formula: "tahun + jumlah_manual", notes: "Zakat Simpanan wajib dikeluarkan apabila simpanan wang di bank atau institusi kewangan telah mencapai nisab (bersamaan 85 gram emas) dan cukup haul setahun. Kadarnya 2.5%.", isActive: true, uiTemplate: "standard_year_amount", codeSnippet: "", calculator: { mode: "none", expression: "", inputs: [] } },
  { code: "ZSAHAM", name: "ZAKAT SAHAM", formula: "tahun + jumlah_manual", notes: "Zakat Saham dikenakan ke atas pemilikan saham di pasaran modal. Ia dikira berdasarkan nilai pasaran saham pada akhir haul atau keuntungan dividen yang diterima.", isActive: true, uiTemplate: "standard_year_amount", codeSnippet: "", calculator: { mode: "none", expression: "", inputs: [] } },
  { code: "ZKWSP", name: "ZAKAT KWSP", formula: "tahun + jumlah_manual", notes: "Zakat KWSP wajib apabila simpanan KWSP dikeluarkan dan mencapai nisab. Ia dikira pada masa pengeluaran sama ada pengeluaran penuh atau sebahagian.", isActive: true, uiTemplate: "standard_year_amount", codeSnippet: "", calculator: { mode: "none", expression: "", inputs: [] } },
  {
    code: "ZEMAS",
    name: "ZAKAT EMAS",
    formula: "max(0, berat_emas_gram - nisab_emas_gram) * harga_emas_segram * 0.025",
    notes: "Zakat Emas dikenakan ke atas emas yang tidak dipakai (emas simpanan) apabila mencapai nisab 85 gram dan cukup haul. Emas perhiasan yang dipakai biasa dikecualikan mengikut uruf setempat.",
    isActive: true,
    uiTemplate: "standard_year_amount",
    codeSnippet: "",
    calculator: { mode: "none", expression: "", inputs: [] },
  },
  { code: "ZKRIPTO", name: "ZAKAT KRIPTO", formula: "tahun + jumlah_manual", notes: "Zakat Kripto wajib bagi pemilikan aset kripto (Bitcoin, Ethereum, dsb.) apabila nilai pasaran telah mencapai nisab dan cukup haul. Kadarnya 2.5% daripada jumlah nilai semasa.", isActive: true, uiTemplate: "standard_year_amount", codeSnippet: "", calculator: { mode: "none", expression: "", inputs: [] } },
  { code: "ZHARTA", name: "ZAKAT HARTA", formula: "tahun + jumlah_manual", notes: "Zakat Harta merangkumi harta-harta lain yang wajib dizakatkan apabila mencapai nisab dan haul, termasuk hartanah sewaan dan aset pelaburan.", isActive: true, uiTemplate: "standard_year_amount", codeSnippet: "", calculator: { mode: "none", expression: "", inputs: [] } },
  { code: "ZTANAMAN", name: "ZAKAT TANAMAN", formula: "tahun + jumlah_manual", notes: "Zakat Tanaman dikenakan ke atas hasil tanaman seperti padi, buah-buahan, dan sayur-sayuran. Kadarnya 5% jika menggunakan pengairan berbayar atau 10% jika menggunakan air hujan.", isActive: true, uiTemplate: "standard_year_amount", codeSnippet: "", calculator: { mode: "none", expression: "", inputs: [] } },
  { code: "ZPADI", name: "ZAKAT PADI", formula: "tahun + jumlah_manual", notes: "Zakat Padi adalah sebahagian daripada zakat tanaman, khusus untuk hasil padi. Ia dikeluarkan apabila mencapai nisab 363 gantang (lebih kurang 1,300 kg).", isActive: true, uiTemplate: "standard_year_amount", codeSnippet: "", calculator: { mode: "none", expression: "", inputs: [] } },
  { code: "ZTERNAKAN", name: "ZAKAT TERNAKAN", formula: "tahun + jumlah_manual", notes: "Zakat Ternakan dikenakan ke atas haiwan ternakan seperti lembu, kambing, dan unta apabila mencapai nisab tertentu dan cukup haul setahun.", isActive: true, uiTemplate: "standard_year_amount", codeSnippet: "", calculator: { mode: "none", expression: "", inputs: [] } },
  {
    code: "FIDYAH",
    name: "FIDYAH PUASA",
    formula: "hari_tinggal * kadar_beras * penggandaan",
    notes: "Fidyah Puasa adalah bayaran ganti bagi mereka yang tidak mampu berpuasa kerana uzur kekal seperti sakit kronik atau tua. Kadarnya berdasarkan harga makanan asasi bagi setiap hari yang ditinggalkan.",
    isActive: true,
    uiTemplate: "fidyah",
    codeSnippet: "// Optional custom logic for fidyah calculation",
    calculator: { mode: "none", expression: "", inputs: [] },
  },
  { code: "ZPERAK", name: "ZAKAT PERAK", formula: "tahun + jumlah_manual", notes: "Zakat Perak dikenakan ke atas pemilikan perak apabila mencapai nisab 595 gram dan cukup haul setahun. Kadarnya 2.5% daripada nilai semasa.", isActive: true, uiTemplate: "standard_year_amount", codeSnippet: "", calculator: { mode: "none", expression: "", inputs: [] } },
  { code: "QADHA", name: "QADHA ZAKAT", formula: "tahun + jumlah_manual", notes: "Qadha Zakat adalah bayaran zakat yang tertunggak dari tahun-tahun sebelumnya. Ia wajib dibayar berdasarkan rekod tunggakan yang ada.", isActive: true, uiTemplate: "standard_year_amount", codeSnippet: "", calculator: { mode: "none", expression: "", inputs: [] } },
];

const DEFAULT_PAYMENT_GATEWAYS = [
  { code: "FPX", name: "FPX Online Banking", isActive: true, notes: "" },
  { code: "CARD", name: "Kad Kredit / Debit", isActive: true, notes: "" },
  { code: "JOMPAY", name: "JomPAY", isActive: true, notes: "" },
];

const DEFAULT_SOURCE_CATEGORIES = [
  { code: "SPG", name: "Skim Potongan Gaji (SPG)", isActive: true, notes: "" },
  { code: "PSP", name: "Platform Saluran Pembayaran (PSP)", isActive: true, notes: "" },
  { code: "BANK", name: "BANK", isActive: true, notes: "" },
];

const DEFAULT_SOURCE_DATA = [
  { code: "JAN", name: "Jabatan Akauntan Negara", categoryCode: "SPG", isActive: true, notes: "" },
  { code: "BILPIZ", name: "BilPiz", categoryCode: "PSP", isActive: true, notes: "" },
  { code: "BANK_ISLAM", name: "Bank Islam", categoryCode: "BANK", isActive: true, notes: "" },
  { code: "MAYBANK", name: "Maybank", categoryCode: "BANK", isActive: true, notes: "" },
];

const SETTINGS_KEYS: Array<keyof SettingsPayload> = [
  "siteTitle",
  "tagline",
  "titleFormat",
  "metaDescription",
  "siteIconUrl",
  "sidebarLogoUrl",
  "faviconUrl",
  "language",
  "timezone",
  "footerText",
];

export const settingsRouter = Router();

settingsRouter.get("/", async (_req, res) => {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value])) as Partial<SettingsPayload>;

  const payload: SettingsPayload = {
    siteTitle: map.siteTitle ?? "",
    tagline: map.tagline ?? "",
    titleFormat: map.titleFormat ?? "%page% | %site%",
    metaDescription: map.metaDescription ?? "",
    siteIconUrl: map.siteIconUrl ?? "",
    sidebarLogoUrl: map.sidebarLogoUrl ?? "",
    faviconUrl: map.faviconUrl ?? "",
    language: map.language ?? "en",
    timezone: map.timezone ?? "UTC",
    footerText: map.footerText ?? "",
  };

  return sendOk(res, payload);
});

settingsRouter.put("/", async (req, res) => {
  const payload = settingsInputSchema.parse(req.body);

  await prisma.$transaction(
    SETTINGS_KEYS.map((key) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: payload[key] },
        create: { key, value: payload[key] },
      }),
    ),
  );

  return sendOk(res, payload);
});

settingsRouter.get("/admin-menu-prefs", async (_req, res) => {
  const row = await prisma.setting.findUnique({ where: { key: "adminMenuPrefs" } });
  return sendOk(res, row ? JSON.parse(row.value) : null);
});

settingsRouter.put("/admin-menu-prefs", async (req, res) => {
  const prefs = adminMenuPrefsSchema.parse(req.body);
  await prisma.setting.upsert({
    where: { key: "adminMenuPrefs" },
    update: { value: JSON.stringify(prefs) },
    create: { key: "adminMenuPrefs", value: JSON.stringify(prefs) },
  });
  return sendOk(res, prefs);
});

settingsRouter.get("/zakat-types", async (req, res) => {
  const row = await prisma.setting.findUnique({ where: { key: "zakatTypes" } });
  const raw = row ? JSON.parse(row.value) : DEFAULT_ZAKAT_TYPES;
  const isPublic = !req.headers.authorization && !(req as unknown as Record<string, unknown>).auth;
  const isPublic = !req.headers.authorization && !((req as unknown as Record<string, unknown>).auth);
  const types = Array.isArray(raw)
    ? raw.map((item: unknown, index: number) => {
      if (typeof item === "string") {
        return {
          code: `ZAKAT_${index + 1}`,
          name: item.toUpperCase(),
          formula: "manual_input",
          notes: "",
          isActive: true,
          uiTemplate: "standard_year_amount",
          codeSnippet: "",
          calculator: { mode: "none", expression: "", inputs: [] },
        };
      }
      const obj = item as Record<string, unknown>;
      const rawTemplate = String(obj.uiTemplate ?? "standard_year_amount");
      const uiTemplate = rawTemplate === "fitrah" || rawTemplate === "fidyah" || rawTemplate === "standard_year_amount"
        ? rawTemplate
        : "standard_year_amount";
      return {
        code: String(obj.code ?? `ZAKAT_${index + 1}`).toUpperCase(),
        name: String(obj.name ?? `Zakat ${index + 1}`).toUpperCase(),
        formula: String(obj.formula ?? "manual_input"),
        notes: String(obj.notes ?? ""),
        isActive: Boolean(obj.isActive ?? true),
        uiTemplate,
        codeSnippet: String(obj.codeSnippet ?? ""),
        calculator: typeof obj.calculator === "object" && obj.calculator !== null
          ? obj.calculator
          : { mode: "none", expression: "", inputs: [] },
      };
    })
    : DEFAULT_ZAKAT_TYPES;

  if (isPublic) {
    const publicTypes = types.map((t) => ({
      code: t.code,
      name: t.name,
      isActive: t.isActive,
      description: t.notes || "",
    }));
    return sendOk(res, { types: publicTypes });
  }

  return sendOk(res, { types });
});

settingsRouter.put("/zakat-types", async (req, res) => {
  const payload = zakatTypesSchema.parse(req.body);
  await prisma.setting.upsert({
    where: { key: "zakatTypes" },
    update: { value: JSON.stringify(payload.types) },
    create: { key: "zakatTypes", value: JSON.stringify(payload.types) },
  });
  return sendOk(res, payload);
});

settingsRouter.get("/payment-gateways", async (_req, res) => {
  const row = await prisma.setting.findUnique({ where: { key: "paymentGateways" } });
  const gateways = row ? JSON.parse(row.value) : DEFAULT_PAYMENT_GATEWAYS;
  return sendOk(res, { gateways });
});

settingsRouter.put("/payment-gateways", async (req, res) => {
  const payload = paymentGatewaysSchema.parse(req.body);
  await prisma.setting.upsert({
    where: { key: "paymentGateways" },
    update: { value: JSON.stringify(payload.gateways) },
    create: { key: "paymentGateways", value: JSON.stringify(payload.gateways) },
  });
  return sendOk(res, payload);
});

settingsRouter.get("/source-categories", async (_req, res) => {
  const row = await prisma.setting.findUnique({ where: { key: "sourceCategories" } });
  const categories = row ? JSON.parse(row.value) : DEFAULT_SOURCE_CATEGORIES;
  return sendOk(res, { categories });
});

settingsRouter.put("/source-categories", async (req, res) => {
  const payload = sourceCategoriesSchema.parse(req.body);
  await prisma.setting.upsert({
    where: { key: "sourceCategories" },
    update: { value: JSON.stringify(payload.categories) },
    create: { key: "sourceCategories", value: JSON.stringify(payload.categories) },
  });
  // Sync to IntegrationSourceCategory so File Upload dropdown stays in sync
  for (const cat of payload.categories) {
    await prisma.integrationSourceCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name, isActive: cat.isActive, notes: cat.notes ?? null },
      create: { code: cat.code, name: cat.name, isActive: cat.isActive, notes: cat.notes ?? null },
    });
  }
  return sendOk(res, payload);
});

settingsRouter.get("/source-data", async (_req, res) => {
  const row = await prisma.setting.findUnique({ where: { key: "sourceData" } });
  const items = row ? JSON.parse(row.value) : DEFAULT_SOURCE_DATA;
  return sendOk(res, { items });
});

settingsRouter.put("/source-data", async (req, res) => {
  const payload = sourceDataSchema.parse(req.body);
  await prisma.setting.upsert({
    where: { key: "sourceData" },
    update: { value: JSON.stringify(payload.items) },
    create: { key: "sourceData", value: JSON.stringify(payload.items) },
  });
  // Sync to IntegrationSource so File Upload dropdown shows new sources
  for (const item of payload.items) {
    const category = await prisma.integrationSourceCategory.findUnique({
      where: { code: item.categoryCode },
    });
    if (category) {
      await prisma.integrationSource.upsert({
        where: { code: item.code },
        update: { name: item.name, categoryId: category.id, isActive: item.isActive, notes: item.notes ?? null },
        create: {
          code: item.code,
          name: item.name,
          categoryId: category.id,
          transportType: "MANUAL",
          isActive: item.isActive,
          notes: item.notes ?? null,
        },
      });
    }
  }
  return sendOk(res, payload);
});
