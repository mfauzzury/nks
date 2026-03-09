import { Router } from "express";

import { prisma } from "../prisma.js";
import { sendOk } from "../utils/responses.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", async (_req, res) => {
  const [posts, pages, media, recentPosts, recentPages] = await Promise.all([
    prisma.post.count(),
    prisma.page.count(),
    prisma.media.count(),
    prisma.post.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.page.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
  ]);

  return sendOk(res, {
    counts: { posts, pages, media },
    recent: {
      posts: recentPosts,
      pages: recentPages,
    },
  });
});

/**
 * GET /api/dashboard/main
 * Aggregated zakat analytics for the admin main dashboard.
 * Query: ?year=2026 (optional)
 */
dashboardRouter.get("/main", async (req, res) => {
  const yearParam = req.query.year ? String(req.query.year) : null;

  const dateFilter: { paidAt?: { gte?: Date; lt?: Date } } = {};
  if (yearParam && /^\d{4}$/.test(yearParam)) {
    const y = Number(yearParam);
    dateFilter.paidAt = { gte: new Date(`${y}-01-01`), lt: new Date(`${y + 1}-01-01`) };
  }

  const paymentWhere = { status: "success", ...dateFilter };

  const [
    totalPayersCount,
    individualCount,
    corporateCount,
    spgEmployerCount,
    payments,
    topPayersRaw,
    genderCounts,
    recentPayerRows,
  ] = await Promise.all([
    prisma.payerProfile.count({ where: { status: "active" } }),
    prisma.payerProfile.count({ where: { status: "active", payerType: "individu" } }),
    prisma.payerProfile.count({ where: { status: "active", payerType: "korporat" } }),
    prisma.payerProfile.count({ where: { status: "active", payerType: "majikan_spg" } }),

    prisma.guestPayment.findMany({
      where: paymentWhere,
      select: {
        amount: true,
        paymentMethod: true,
        paidAt: true,
        source: true,
        identityNo: true,
      },
      orderBy: { paidAt: "desc" },
    }),

    prisma.guestPayment.groupBy({
      by: ["identityNo"],
      where: paymentWhere,
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 10,
    }),

    prisma.payerIndividual.groupBy({
      by: ["gender"],
      _count: { gender: true },
    }),

    prisma.payerProfile.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        payerCode: true,
        displayName: true,
        payerType: true,
        createdAt: true,
      },
    }),
  ]);

  // Aggregate payment data
  let totalAmount = 0;
  const monthMap = new Map<string, number>();
  const zakatMap = new Map<string, number>();
  const paymentMethodMap = new Map<string, number>();
  const identitySet = new Set<string>();

  for (const p of payments) {
    const amount = Number(p.amount);
    totalAmount += amount;
    identitySet.add(p.identityNo);

    const monthKey = p.paidAt.toISOString().slice(0, 7);
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + amount);

    const parts = p.paymentMethod.split("|").map((s: string) => s.trim());
    const zakatType = parts.length > 1 ? parts[1] : "Lain-lain";
    zakatMap.set(zakatType, (zakatMap.get(zakatType) || 0) + 1);

    const method = parts[0] || "Lain-lain";
    paymentMethodMap.set(method, (paymentMethodMap.get(method) || 0) + 1);
  }

  const monthNames: Record<string, string> = {
    "01": "Jan", "02": "Feb", "03": "Mac", "04": "Apr", "05": "Mei", "06": "Jun",
    "07": "Jul", "08": "Ogo", "09": "Sep", "10": "Okt", "11": "Nov", "12": "Dis",
  };

  const monthlyTrend = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, amount]) => ({
      month: `${monthNames[key.slice(5, 7)] || key.slice(5, 7)} ${key.slice(2, 4)}`,
      amount,
    }));

  const topIdentities = topPayersRaw.map((t) => t.identityNo);
  const payerNames = topIdentities.length > 0
    ? await prisma.payerProfile.findMany({
        where: { identityNo: { in: topIdentities } },
        select: { identityNo: true, displayName: true, payerType: true },
      })
    : [];
  const nameMap = new Map(payerNames.map((p) => [p.identityNo, p]));

  const topPayers = topPayersRaw.map((t) => {
    const profile = nameMap.get(t.identityNo);
    return {
      identityNo: t.identityNo,
      name: profile?.displayName || t.identityNo,
      payerType: profile?.payerType || "individu",
      amount: Number(t._sum.amount || 0),
    };
  });

  const genderDistribution = genderCounts.map((g) => ({
    label: g.gender || "TIADA MAKLUMAT",
    value: g._count.gender,
  }));

  const zakatTypeDistribution = Array.from(zakatMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const paymentMethodDistribution = Array.from(paymentMethodMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newPayersThisMonth = await prisma.payerProfile.count({
    where: { createdAt: { gte: startOfMonth } },
  });

  return sendOk(res, {
    summary: {
      totalPayers: totalPayersCount,
      totalIndividual: individualCount,
      totalCorporate: corporateCount,
      totalSpgEmployer: spgEmployerCount,
      totalAmount,
      totalTransactions: payments.length,
      uniquePayers: identitySet.size,
      newPayersThisMonth,
    },
    monthlyTrend,
    topPayers,
    genderDistribution,
    zakatTypeDistribution,
    paymentMethodDistribution,
    recentPayers: recentPayerRows,
  });
});
