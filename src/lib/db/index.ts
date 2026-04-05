import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

const client = createClient({
	url: process.env.DATABASE_URL!,
	authToken: process.env.DATABASE_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
