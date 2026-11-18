import 'dotenv/config';
import { DataSource } from 'typeorm';
import { createBackupDataSourceOptions } from './neon-data-source-options.js';

function safeErrorCode(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'string' && /^[A-Z0-9_]+$/.test(code)) return code;
  }
  if (error instanceof Error) {
    const message = error.message;
    if (message.includes('STAGING_BACKUP_DATABASE_URL is required'))
      return 'STAGING_BACKUP_DATABASE_URL_NOT_CONFIGURED';
    if (message.includes('STAGING_DATABASE_URL is required'))
      return 'STAGING_DATABASE_URL_NOT_CONFIGURED';
    if (message.includes('Backup endpoint matches the staging endpoint'))
      return 'BACKUP_ENDPOINT_MATCHES_STAGING';
    if (message.includes('Backup endpoint matches the production endpoint'))
      return 'BACKUP_ENDPOINT_MATCHES_PRODUCTION';
    if (message.includes('Staging endpoint matches the production endpoint'))
      return 'STAGING_ENDPOINT_MATCHES_PRODUCTION';
    if (message.includes('PRODUCTION_NEON_ENDPOINT'))
      return 'PRODUCTION_ENDPOINT_CONFIGURATION_INVALID';
    if (message.includes('is required') || message.includes('valid PostgreSQL'))
      return 'DATABASE_URL_CONFIGURATION_INVALID';
    if (message === 'BACKUP_READ_ONLY_NOT_CONFIRMED')
      return 'READ_ONLY_MODE_NOT_CONFIRMED';
  }
  return error instanceof Error ? error.name : 'UNKNOWN_ERROR';
}

let dataSource: DataSource | undefined;
let queryRunner: ReturnType<DataSource['createQueryRunner']> | undefined;

try {
  const options = createBackupDataSourceOptions(process.env);
  console.log('BACKUP_ENDPOINT_DISTINCT staging=true production=true');

  dataSource = new DataSource(options);
  await dataSource.initialize();
  queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  await queryRunner.query('SET TRANSACTION READ ONLY');
  const result = await queryRunner.query(
    "SELECT current_setting('transaction_read_only') AS read_only",
  );
  await queryRunner.rollbackTransaction();

  if (result[0]?.read_only !== 'on') {
    throw new Error('BACKUP_READ_ONLY_NOT_CONFIRMED');
  }

  console.log('BACKUP_CONNECTION_OK readOnly=true');
} catch (error) {
  const reason = safeErrorCode(error);
  const category =
    reason.startsWith('BACKUP_ENDPOINT_') ||
    reason.startsWith('STAGING_ENDPOINT_') ||
    reason.includes('URL_NOT_CONFIGURED') ||
    reason.includes('CONFIGURATION_INVALID')
      ? 'BACKUP_ENDPOINT_CHECK_FAILED'
      : 'BACKUP_CONNECTION_FAILED';
  console.error(category, reason);
  process.exitCode = 1;
} finally {
  if (queryRunner?.isTransactionActive) {
    await queryRunner.rollbackTransaction().catch(() => undefined);
  }
  await queryRunner?.release().catch(() => undefined);
  if (dataSource?.isInitialized) await dataSource.destroy();
}
