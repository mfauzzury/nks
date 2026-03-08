import { Router } from "express";

import { prisma } from "../prisma.js";
import { sendOk } from "../utils/responses.js";

type DbNameRow = { dbName: string | null };
type TableRow = {
  tableName: string;
  tableComment: string | null;
  engine: string | null;
  rowFormat: string | null;
};
type ColumnRow = {
  tableName: string;
  columnName: string;
  ordinalPosition: number;
  columnType: string;
  isNullable: number;
  columnDefault: string | null;
  extra: string | null;
  columnKey: string;
  columnComment: string | null;
};
type RelationshipRow = {
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  constraintName: string;
  onUpdateRule: string;
  onDeleteRule: string;
};

export const developmentRouter = Router();

developmentRouter.get("/database-schema", async (_req, res) => {
  const [dbNameRows, tableRows, columnRows, relationshipRows] = await Promise.all([
    prisma.$queryRaw<DbNameRow[]>`SELECT DATABASE() AS dbName`,
    prisma.$queryRaw<TableRow[]>`
      SELECT
        TABLE_NAME AS tableName,
        TABLE_COMMENT AS tableComment,
        ENGINE AS engine,
        ROW_FORMAT AS rowFormat
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `,
    prisma.$queryRaw<ColumnRow[]>`
      SELECT
        TABLE_NAME AS tableName,
        COLUMN_NAME AS columnName,
        ORDINAL_POSITION AS ordinalPosition,
        COLUMN_TYPE AS columnType,
        (IS_NULLABLE = 'YES') AS isNullable,
        COLUMN_DEFAULT AS columnDefault,
        EXTRA AS extra,
        COLUMN_KEY AS columnKey,
        COLUMN_COMMENT AS columnComment
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `,
    prisma.$queryRaw<RelationshipRow[]>`
      SELECT
        kcu.TABLE_NAME AS sourceTable,
        kcu.COLUMN_NAME AS sourceColumn,
        kcu.REFERENCED_TABLE_NAME AS targetTable,
        kcu.REFERENCED_COLUMN_NAME AS targetColumn,
        kcu.CONSTRAINT_NAME AS constraintName,
        rc.UPDATE_RULE AS onUpdateRule,
        rc.DELETE_RULE AS onDeleteRule
      FROM information_schema.KEY_COLUMN_USAGE kcu
      INNER JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
        ON rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
        AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
        AND rc.TABLE_NAME = kcu.TABLE_NAME
      WHERE kcu.TABLE_SCHEMA = DATABASE()
        AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY kcu.TABLE_NAME, kcu.ORDINAL_POSITION
    `,
  ]);

  const dbName = dbNameRows[0]?.dbName ?? null;
  const columnsByTable = new Map<string, ColumnRow[]>();
  for (const column of columnRows) {
    const list = columnsByTable.get(column.tableName) ?? [];
    list.push(column);
    columnsByTable.set(column.tableName, list);
  }

  const relationshipsByTable = new Map<string, RelationshipRow[]>();
  for (const relationship of relationshipRows) {
    const list = relationshipsByTable.get(relationship.sourceTable) ?? [];
    list.push(relationship);
    relationshipsByTable.set(relationship.sourceTable, list);
  }

  const tables = tableRows.map((table) => {
    const columns = columnsByTable.get(table.tableName) ?? [];
    const foreignKeys = relationshipsByTable.get(table.tableName) ?? [];

    return {
      name: table.tableName,
      comment: table.tableComment || null,
      engine: table.engine || null,
      rowFormat: table.rowFormat || null,
      columnCount: columns.length,
      primaryKey: columns.filter((column) => column.columnKey === "PRI").map((column) => column.columnName),
      columns: columns.map((column) => ({
        name: column.columnName,
        type: column.columnType,
        nullable: Boolean(column.isNullable),
        default: column.columnDefault,
        extra: column.extra || "",
        key: column.columnKey || "",
        comment: column.columnComment || null,
      })),
      foreignKeys: foreignKeys.map((fk) => ({
        name: fk.constraintName,
        column: fk.sourceColumn,
        referencesTable: fk.targetTable,
        referencesColumn: fk.targetColumn,
        onUpdate: fk.onUpdateRule,
        onDelete: fk.onDeleteRule,
      })),
    };
  });

  return sendOk(res, {
    database: dbName,
    tableCount: tables.length,
    relationshipCount: relationshipRows.length,
    tables,
    relationships: relationshipRows,
  });
});

