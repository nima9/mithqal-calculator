import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Currency metadata + exchange rates
  currencies: defineTable({
    code: v.string(), // "USD", "EUR", etc.
    name: v.string(), // "US Dollar"
    symbol: v.string(), // "$" (symbol_native)
    rateToUSD: v.number(), // Exchange rate (1 USD = X of this currency)
  }).index("by_code", ["code"]),

  // Metal prices in USD
  metals: defineTable({
    name: v.string(), // "gold", "silver"
    priceUSD: v.number(), // Price per troy ounce in USD
    lastUpdated: v.number(), // Unix timestamp
  }).index("by_name", ["name"]),

  // Rate fetch log
  rateFetchLog: defineTable({
    fetchedAt: v.number(), // Unix timestamp
    metalsSource: v.string(), // "swissquote"
    currencySource: v.string(), // "fxratesapi"
    success: v.boolean(),
  }),

  // Right of God quotes
  rightOfGodQuotes: defineTable({
    author: v.string(),
    source: v.string(),
    text: v.string(), // The quote text
  }),
});
