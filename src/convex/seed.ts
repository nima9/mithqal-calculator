import { internalAction, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Currency metadata (from currencies.json)
// This is a subset - full list can be seeded from the JSON file
const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "$" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "ILS", name: "Israeli Shekel", symbol: "₪" },
  { code: "AED", name: "United Arab Emirates Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "CLP", name: "Chilean Peso", symbol: "$" },
  { code: "COP", name: "Colombian Peso", symbol: "$" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "QAR", name: "Qatari Riyal", symbol: "﷼" },
  { code: "OMR", name: "Omani Rial", symbol: "﷼" },
  { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب" },
  { code: "JOD", name: "Jordanian Dinar", symbol: "د.ا" },
  { code: "LBP", name: "Lebanese Pound", symbol: "ل.ل" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "د.م." },
  { code: "TWD", name: "Taiwan Dollar", symbol: "NT$" },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼" },
  { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د" },
];

// Seed all currencies with initial data
export const seedCurrencies = mutation({
  args: {},
  handler: async (ctx) => {
    // First, fetch current rates from fxratesapi
    let rates: Record<string, number> = {};

    try {
      const response = await fetch("https://api.fxratesapi.com/latest");
      const data = await response.json();
      if (data.success && data.rates) {
        rates = data.rates;
      }
    } catch (error) {
      console.error("Failed to fetch rates during seed:", error);
      // Default to 1 for all rates if API fails
    }

    // Insert currencies
    for (const currency of CURRENCIES) {
      const existing = await ctx.db
        .query("currencies")
        .withIndex("by_code", (q) => q.eq("code", currency.code))
        .first();

      const rateToUSD = rates[currency.code] ?? 1;

      if (existing) {
        await ctx.db.patch(existing._id, {
          name: currency.name,
          symbol: currency.symbol,
          rateToUSD,
        });
      } else {
        await ctx.db.insert("currencies", {
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol,
          rateToUSD,
        });
      }
    }

    // Also seed initial metal prices
    const now = Date.now();

    // Fetch gold price
    try {
      const goldResponse = await fetch(
        "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD",
      );
      const goldData = await goldResponse.json();
      const goldPrice = goldData[0]?.spreadProfilePrices?.[0]?.ask ?? 2750;

      const existingGold = await ctx.db
        .query("metals")
        .withIndex("by_name", (q) => q.eq("name", "gold"))
        .first();

      if (existingGold) {
        await ctx.db.patch(existingGold._id, { priceUSD: goldPrice, lastUpdated: now });
      } else {
        await ctx.db.insert("metals", { name: "gold", priceUSD: goldPrice, lastUpdated: now });
      }
    } catch (error) {
      console.error("Failed to fetch gold price:", error);
      // Insert with default value
      const existingGold = await ctx.db
        .query("metals")
        .withIndex("by_name", (q) => q.eq("name", "gold"))
        .first();
      if (!existingGold) {
        await ctx.db.insert("metals", { name: "gold", priceUSD: 2750, lastUpdated: now });
      }
    }

    // Fetch silver price
    try {
      const silverResponse = await fetch(
        "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAG/USD",
      );
      const silverData = await silverResponse.json();
      const silverPrice = silverData[0]?.spreadProfilePrices?.[0]?.ask ?? 30;

      const existingSilver = await ctx.db
        .query("metals")
        .withIndex("by_name", (q) => q.eq("name", "silver"))
        .first();

      if (existingSilver) {
        await ctx.db.patch(existingSilver._id, { priceUSD: silverPrice, lastUpdated: now });
      } else {
        await ctx.db.insert("metals", { name: "silver", priceUSD: silverPrice, lastUpdated: now });
      }
    } catch (error) {
      console.error("Failed to fetch silver price:", error);
      const existingSilver = await ctx.db
        .query("metals")
        .withIndex("by_name", (q) => q.eq("name", "silver"))
        .first();
      if (!existingSilver) {
        await ctx.db.insert("metals", { name: "silver", priceUSD: 30, lastUpdated: now });
      }
    }

    // Log the seed
    await ctx.db.insert("rateFetchLog", {
      fetchedAt: now,
      metalsSource: "swissquote",
      currencySource: "fxratesapi",
      success: true,
    });

    return { seeded: true, currencyCount: CURRENCIES.length };
  },
});
