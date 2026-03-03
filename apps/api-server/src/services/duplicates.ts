import { prisma } from "../prisma.js";

export async function detectSpgEmployeeDuplicate(input: {
  employeeId: number;
  detectedBy?: number;
  source: "spg_import" | "manual";
}) {
  const employee = await prisma.spgEmployee.findUnique({ where: { id: input.employeeId } });
  if (!employee) return null;

  const candidates = await prisma.payerProfile.findMany({
    where: {
      payerType: "individu",
      status: { not: "merged" },
      OR: [
        { identityNo: employee.employeeIdentityNo },
        {
          individual: {
            mykadOrPassport: employee.employeeIdentityNo,
          },
        },
      ],
    },
    include: { individual: true },
  });

  if (candidates.length === 0) return null;

  const duplicateCase = await prisma.duplicateCase.create({
    data: {
      source: input.source,
      status: "open",
      detectedBy: input.detectedBy ?? null,
      notes: "Auto-detected SPG employee vs individu identity match",
      matches: {
        create: candidates.map((candidate) => ({
          candidatePayerId: candidate.id,
          matchedSpgEmployeeId: employee.id,
          matchScore: candidate.identityNo === employee.employeeIdentityNo ? 100 : 95,
          matchReasonJson: {
            type: "identity_exact",
            employeeIdentityNo: employee.employeeIdentityNo,
          },
        })),
      },
    },
    include: {
      matches: {
        include: {
          candidatePayer: true,
          matchedSpgEmployee: true,
        },
      },
    },
  });

  const best = duplicateCase.matches
    .slice()
    .sort((a, b) => Number(b.matchScore) - Number(a.matchScore))[0];
  if (best) {
    await prisma.spgEmployee.update({
      where: { id: employee.id },
      data: { linkedIndividualPayerId: best.candidatePayerId },
    });
  }

  return duplicateCase;
}
