import 'dotenv/config';
import { DataSource } from 'typeorm';
import { createNeonDataSourceOptions } from './neon-data-source-options.js';
const dataSource = new DataSource(createNeonDataSourceOptions(process.env));
export default dataSource;
//# sourceMappingURL=data-source.js.map