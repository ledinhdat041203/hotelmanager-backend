import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import 'dotenv/config';
import { DataSource } from 'typeorm';

export const dbConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: process.env.HM_DB_HOST,
    port: parseInt(process.env.HM_DB_PORT, 10),
    username: process.env.HM_DB_USER,
    password: process.env.HM_DB_PASSWORD,
    database: process.env.HM_DB_DATABASE,
    entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
    synchronize: true,
    logging: false,
    migrationsRun: true,
    autoLoadEntities: true,
  };
};

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.HM_DB_HOST,
  port: parseInt(process.env.HM_DB_PORT, 10),
  username: process.env.HM_DB_USER,
  password: process.env.HM_DB_PASSWORD,
  database: process.env.HM_DB_DATABASE,
  synchronize: true,
  logging: false,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
});

export default AppDataSource;
