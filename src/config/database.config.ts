import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  dialect: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT, 10) ?? 5432,
  database: process.env.DB_NAME ?? 'coffeeapp',
  username: process.env.DB_USERNAME ?? 'coffeeapp',
  password: process.env.DB_PASSWORD ?? 'localpassword',
  autoLoadModels: true,
  synchronize: process.env.NODE_ENV !== 'production',
}));
