import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Joi from 'joi';
import { educationEntities } from './entities/index.js';
const databaseEnvironmentSchema = Joi.object({
    DATABASE_URL: Joi.string()
        .uri({ scheme: ['postgres', 'postgresql'] })
        .required(),
}).unknown(true);
const currentDirectory = dirname(fileURLToPath(import.meta.url));
export function createNeonDataSourceOptions(environment) {
    const { value, error } = databaseEnvironmentSchema.validate(environment, {
        abortEarly: false,
        convert: true,
    });
    if (error) {
        throw new Error('Database configuration is incomplete or invalid. Set DATABASE_URL to a PostgreSQL connection string.');
    }
    return {
        type: 'postgres',
        url: value.DATABASE_URL,
        ssl: { rejectUnauthorized: true },
        uuidExtension: 'pgcrypto',
        installExtensions: false,
        entities: [...educationEntities],
        migrations: [join(currentDirectory, 'migrations', '*{.js,.ts}')],
        migrationsTableName: 'typeorm_migrations',
        migrationsRun: false,
        migrationsTransactionMode: 'all',
        synchronize: false,
    };
}
function neonEndpointIdentity(connectionString) {
    const connection = new URL(connectionString);
    return normalizedNeonHost(connection.hostname);
}
function normalizedNeonHost(hostname) {
    const host = hostname.trim().toLowerCase();
    if (!host.endsWith('.neon.tech')) {
        throw new Error('Staging isolation requires Neon endpoint hostnames for both databases.');
    }
    return host.replace(/-pooler(?=\.|$)/, '');
}
function validatedNeonEndpoint(connectionString, variableName) {
    const { error } = Joi.string()
        .uri({ scheme: ['postgres', 'postgresql'] })
        .validate(connectionString);
    if (error) {
        throw new Error(`${variableName} must be a valid PostgreSQL connection string.`);
    }
    return neonEndpointIdentity(connectionString);
}
function productionEndpointIdentity(environment) {
    const productionUrl = environment.DATABASE_URL;
    const productionEndpoint = environment.PRODUCTION_NEON_ENDPOINT;
    if (!productionUrl && !productionEndpoint) {
        throw new Error('Set PRODUCTION_NEON_ENDPOINT or DATABASE_URL so database isolation can be verified.');
    }
    const fromUrl = productionUrl
        ? validatedNeonEndpoint(productionUrl, 'DATABASE_URL')
        : undefined;
    const fromHost = productionEndpoint
        ? normalizedNeonHost(productionEndpoint)
        : undefined;
    if (fromUrl && fromHost && fromUrl !== fromHost) {
        throw new Error('PRODUCTION_NEON_ENDPOINT does not match the DATABASE_URL endpoint.');
    }
    return fromHost ?? fromUrl;
}
export function createStagingDataSourceOptions(environment) {
    const stagingUrl = environment.STAGING_DATABASE_URL;
    if (!stagingUrl) {
        throw new Error('Staging database is not configured. Set STAGING_DATABASE_URL to a separate Neon staging branch; DATABASE_URL is never used as a fallback.');
    }
    const stagingIdentity = validatedNeonEndpoint(stagingUrl, 'STAGING_DATABASE_URL');
    const productionIdentity = productionEndpointIdentity(environment);
    if (stagingIdentity === productionIdentity) {
        throw new Error('Staging database must use a separate Neon endpoint/branch from DATABASE_URL.');
    }
    return createNeonDataSourceOptions({ DATABASE_URL: stagingUrl });
}
export function createBackupDataSourceOptions(environment) {
    const backupUrl = environment.STAGING_BACKUP_DATABASE_URL;
    const stagingUrl = environment.STAGING_DATABASE_URL;
    if (!backupUrl) {
        throw new Error('STAGING_BACKUP_DATABASE_URL is required.');
    }
    if (!stagingUrl) {
        throw new Error('STAGING_DATABASE_URL is required to verify backup isolation.');
    }
    const backupIdentity = validatedNeonEndpoint(backupUrl, 'STAGING_BACKUP_DATABASE_URL');
    const stagingIdentity = validatedNeonEndpoint(stagingUrl, 'STAGING_DATABASE_URL');
    const productionIdentity = productionEndpointIdentity(environment);
    if (stagingIdentity === productionIdentity) {
        throw new Error('Staging endpoint matches the production endpoint.');
    }
    if (backupIdentity === stagingIdentity) {
        throw new Error('Backup endpoint matches the staging endpoint.');
    }
    if (backupIdentity === productionIdentity) {
        throw new Error('Backup endpoint matches the production endpoint.');
    }
    return createNeonDataSourceOptions({ DATABASE_URL: backupUrl });
}
//# sourceMappingURL=neon-data-source-options.js.map