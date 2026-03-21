import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? ['.env.production', '.env'] : ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const host = cfg.get<string>('DATABASE_HOST');
        const url = cfg.get<string>('DATABASE_URL');
        const useSSL = cfg.get<string>('DB_SSL') === 'true';

        if (host) {
          return {
            type: 'postgres',
            host,
            port: parseInt(cfg.get('DATABASE_PORT', '5432'), 10),
            username: cfg.get('DATABASE_USER', 'postgres'),
            password: cfg.get('DATABASE_PASSWORD', 'password'),
            database: cfg.get('DATABASE_NAME', 'apa_byos_db'),
            autoLoadEntities: true,
            synchronize: false,
            migrations: [__dirname + "/migrations/*{.ts,.js}"],
            migrationsRun: false,
            ssl: useSSL ? { rejectUnauthorized: false } : false,
          } as any;
        }
        if (url) {
          return {
            type: 'postgres',
            url,
            autoLoadEntities: true,
            synchronize: false,
            logging: ['error', 'schema', 'query'],
            migrations: [__dirname + "/migrations/*{.ts,.js}"],
            migrationsRun: false,
            ssl: useSSL ? { rejectUnauthorized: false } : false,
          } as any;
        }
        return {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          password: 'password',
          database: 'apa_byos_db',
          autoLoadEntities: true,
          synchronize: false,
          migrations: [__dirname + "/migrations/*{.ts,.js}"],
          migrationsRun: false,
        } as any;
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
