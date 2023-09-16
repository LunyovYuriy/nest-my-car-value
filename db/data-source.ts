import { DataSource, DataSourceOptions } from 'typeorm';

const dbOptions: DataSourceOptions = {
  type: 'sqlite',
  database: '',
  entities: [],
  migrations: ['dist/db/migrations/*.js'],
};

switch (process.env.NODE_ENV) {
  case 'development':
    Object.assign(dbOptions, {
      database: 'db.sqlite',
      entities: ['**/*.entity.js'],
    });
    break;
  case 'test':
    Object.assign(dbOptions, {
      database: 'test.sqlite',
      entities: ['**/*.entity.ts'],
    });
    break;
  case 'production':
    break;
  default:
    throw new Error('unknown environment');
}

export const dataSourceOptions: DataSourceOptions = dbOptions;

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
