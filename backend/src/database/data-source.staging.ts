import 'dotenv/config';
import { DataSource } from 'typeorm';
import { createStagingDataSourceOptions } from './neon-data-source-options.js';

const dataSource = new DataSource(
  createStagingDataSourceOptions(process.env),
);

export default dataSource;
