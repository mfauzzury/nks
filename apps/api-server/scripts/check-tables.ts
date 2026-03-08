import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

async function main() {
  const prisma = new PrismaClient();
  const [db] = await prisma.$queryRaw<Array<{ db: string | null }>>`SELECT DATABASE() AS db`;
  const tables = await prisma.$queryRaw<Array<{ name: string }>>`SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME`;
  console.log('DB=', db?.db ?? null, 'TABLE_COUNT=', tables.length);
  for (const t of tables) console.log(t.name);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
