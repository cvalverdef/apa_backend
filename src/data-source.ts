import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as fs from 'fs';

config();

const configService = new ConfigService();

const dbSsl = configService.get('DB_SSL') === 'true';
const dbSslCaPath = configService.get('DB_SSL_CA_PATH');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST') || 'localhost',
  port: parseInt(configService.get('DATABASE_PORT') || '5432', 10),
  username: configService.get('DATABASE_USER') || 'postgres',
  password: configService.get('DATABASE_PASSWORD') || 'password',
  database: configService.get('DATABASE_NAME') || 'apa_byos_db',
  url: configService.get('DATABASE_URL'),
  ssl: dbSsl ? {
    rejectUnauthorized: true,
    ca: dbSslCaPath ? fs.readFileSync(dbSslCaPath).toString() : undefined,
  } : false,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*-*.js'],
  migrationsTableName: 'migrations_history',
});
