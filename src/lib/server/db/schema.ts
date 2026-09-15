import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const currencies = sqliteTable(
  "currencies",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    symbol: text("symbol").notNull(),
    rateToUsd: real("rate_to_usd").notNull(),
  },
  (table) => [uniqueIndex("currencies_code_unique").on(table.code)],
);

export const metals = sqliteTable(
  "metals",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    priceUsd: real("price_usd").notNull(),
    lastUpdated: integer("last_updated").notNull(),
  },
  (table) => [uniqueIndex("metals_name_unique").on(table.name)],
);

export const rateFetchLog = sqliteTable(
  "rate_fetch_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    fetchedAt: integer("fetched_at").notNull(),
    metalsSource: text("metals_source").notNull(),
    currencySource: text("currency_source").notNull(),
    success: integer("success", { mode: "boolean" }).notNull(),
  },
  (table) => [index("rate_fetch_log_fetched_at_idx").on(table.fetchedAt)],
);

export const rightOfGodQuotes = sqliteTable("right_of_god_quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  author: text("author").notNull(),
  source: text("source").notNull(),
  text: text("text").notNull(),
});
