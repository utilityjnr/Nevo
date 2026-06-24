/**
 * TypeORM CLI data-source configuration.
 *
 * Usage:
 *   npx typeorm migration:generate -d src/data-source.ts src/migrations/MigrationName
 *   npx typeorm migration:run       -d src/data-source.ts
 *   npx typeorm migration:revert    -d src/data-source.ts
 *
 * Make sure DATABASE_URL (or individual DB_* vars) is set in the environment
 * or in a .env file at the project root before running any migration command.
 */

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  migrations: ['src/migrations/**/*{.ts,.js}'],
  entities: ['src/**/*.entity{.ts,.js}'],
});
