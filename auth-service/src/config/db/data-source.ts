import 'reflect-metadata';
import { config } from 'dotenv';
import { join } from 'path';
import { cwd } from 'process';
import { DataSource } from 'typeorm';
import { register } from 'tsconfig-paths';

// Register path aliases so @/ works , did this base TYPEORM doesn't undertand typescript alias
register({
  baseUrl: join(cwd(), 'src'),
  paths: { '@/*': ['*'] },
});

config({ path: join(cwd(), '.env.development') });

export const appDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [join(cwd(), 'src/**/*.entity{.ts,.js}')],
  migrations: [join(cwd(), 'src/migrations/*{.ts,.js}')],
  synchronize: false,
});
