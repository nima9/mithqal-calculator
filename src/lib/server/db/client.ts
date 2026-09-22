import { drizzle } from "drizzle-orm/tursodatabase-serverless";

export type DatabaseConfig = {
  url: string;
  authToken: string;
};

export function createDatabase(config: DatabaseConfig) {
  return drizzle({
    connection: {
      url: config.url,
      authToken: config.authToken,
    },
  });
}

export type Database = ReturnType<typeof createDatabase>;
