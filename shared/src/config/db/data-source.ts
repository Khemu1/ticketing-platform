import "reflect-metadata";
import { config } from "dotenv";
import { join } from "path";
import { cwd } from "process";
import { DataSource } from "typeorm";
import { register } from "tsconfig-paths";

// Register ALL path aliases
register({
  baseUrl: join(cwd()),
  paths: {
    "@/*": ["src/*"],
    "@shared/*": ["src/*"],
    "@bookings/*": ["../booking-service/src/*"],
    "@auth/*": ["../auth-service/src/*"],
    "@events/*": ["../events-service/src/*"],
    "@payments/*": ["../payment-service/src/*"],
  },
});

config({ path: join(cwd(), ".env.development") });

console.log("shared database config started ", process.env.DATABASE_URL);
console.log("migrations path:", join(cwd(), "src/migrations/*{.ts,.js}"));

export const appDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [
    join(cwd(), "src/**/*.entity{.ts,.js}"),
    join(cwd(), "../auth-service/src/**/*.entity{.ts,.js}"),
    join(cwd(), "../booking-service/src/**/*.entity{.ts,.js}"),
    join(cwd(), "../events-service/src/**/*.entity{.ts,.js}"),
    join(cwd(), "../payment-service/src/**/*.entity{.ts,.js}"),
  ],
  migrations: [join(cwd(), "src/migrations/*{.ts,.js}")],
  synchronize: false,
});
