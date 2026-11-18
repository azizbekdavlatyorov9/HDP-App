import 'dotenv/config';
import { DataSource } from 'typeorm';
import { createStagingDataSourceOptions } from './neon-data-source-options.js';
let dataSource;
let queryRunner;
try {
    dataSource = new DataSource(createStagingDataSourceOptions(process.env));
    await dataSource.initialize();
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await queryRunner.query('SET TRANSACTION READ ONLY');
    const result = await queryRunner.query("SELECT current_setting('transaction_read_only') AS read_only");
    await queryRunner.rollbackTransaction();
    if (result[0]?.read_only !== 'on') {
        throw new Error('Staging connection did not enter read-only mode.');
    }
    console.log('STAGING_CONNECTION_OK readOnly=true');
}
catch (error) {
    console.error('STAGING_CONNECTION_FAILED', error && typeof error === 'object' && 'code' in error
        ? String(error.code)
        : error instanceof Error
            ? error.message.startsWith('Staging database')
                ? error.message
                : error.name
            : 'Unknown error');
    process.exitCode = 1;
}
finally {
    if (queryRunner?.isTransactionActive) {
        await queryRunner.rollbackTransaction().catch(() => undefined);
    }
    await queryRunner?.release().catch(() => undefined);
    if (dataSource?.isInitialized)
        await dataSource.destroy();
}
//# sourceMappingURL=check-staging-connection.js.map