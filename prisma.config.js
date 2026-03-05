/** @type {import('prisma').PrismaConfig} */
module.exports = {
  schema: "apps/api-server/prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "mysql://root:rootpass@localhost:3306/corrad_xpress",
  },
};
