import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Fetch rates daily at 6 AM UTC
crons.daily("fetch-rates", { hourUTC: 6, minuteUTC: 0 }, internal.rates.fetchAllRates);

export default crons;
