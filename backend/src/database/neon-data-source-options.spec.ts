import { describe, expect, it } from 'vitest';
import { getMetadataArgsStorage } from 'typeorm';
import { educationEntities } from './entities/index.js';
import {
  createBackupDataSourceOptions,
  createNeonDataSourceOptions,
  createStagingDataSourceOptions,
} from './neon-data-source-options.js';

describe('Neon migration DataSource options', () => {
  it('uses DATABASE_URL with verified TLS and keeps migrations/manual schema controls safe', () => {
    const options = createNeonDataSourceOptions({
      DATABASE_URL:
        'postgresql://test_user:test_password@ep-test.us-east-2.aws.neon.tech/education_center_migration_test?sslmode=require',
      DB_HOST: 'local-postgres.example.test',
      DB_PORT: '6543',
      DB_USERNAME: 'local_user',
      DB_PASSWORD: 'local_password',
      DB_DATABASE: 'local_database',
    });

    expect(options).toMatchObject({
      type: 'postgres',
      url: 'postgresql://test_user:test_password@ep-test.us-east-2.aws.neon.tech/education_center_migration_test?sslmode=require',
      ssl: { rejectUnauthorized: true },
      uuidExtension: 'pgcrypto',
      installExtensions: false,
      migrationsTableName: 'typeorm_migrations',
      migrationsRun: false,
      migrationsTransactionMode: 'all',
      synchronize: false,
    });
    expect(options.migrations).toEqual([
      expect.stringMatching(/[\\/]migrations[\\/]\*\{\.js,\.ts\}$/),
    ]);
  });

  it('declares nullability for every registered ManyToOne relation', () => {
    expect(educationEntities).toHaveLength(47);

    const manyToOneRelations = getMetadataArgsStorage().relations.filter(
      (relation) => relation.relationType === 'many-to-one',
    );

    expect(manyToOneRelations).toHaveLength(90);
    expect(
      manyToOneRelations.every(
        (relation) => typeof relation.options.nullable === 'boolean',
      ),
    ).toBe(true);
  });

  it('requires a dedicated staging URL and never falls back to production', () => {
    expect(() =>
      createStagingDataSourceOptions({
        DATABASE_URL:
          'postgresql://prod_user:secret@ep-prod.aws.neon.tech/neondb',
      }),
    ).toThrow('DATABASE_URL is never used as a fallback');
  });

  it('rejects the production Neon endpoint even if the staging URL uses pooler', () => {
    expect(() =>
      createStagingDataSourceOptions({
        DATABASE_URL:
          'postgresql://prod_user:secret@ep-prod.aws.neon.tech/neondb',
        STAGING_DATABASE_URL:
          'postgresql://stage_user:secret@ep-prod-pooler.aws.neon.tech/neondb',
      }),
    ).toThrow('separate Neon endpoint/branch');
  });

  it('fails closed when the primary URL is unavailable for the isolation comparison', () => {
    expect(() =>
      createStagingDataSourceOptions({
        STAGING_DATABASE_URL:
          'postgresql://stage_user:secret@ep-stage.aws.neon.tech/neondb',
      }),
    ).toThrow('PRODUCTION_NEON_ENDPOINT or DATABASE_URL');
  });

  it('can compare endpoints using a non-secret production Neon hostname', () => {
    expect(
      createStagingDataSourceOptions({
        PRODUCTION_NEON_ENDPOINT: 'ep-prod.us-east-2.aws.neon.tech',
        STAGING_DATABASE_URL:
          'postgresql://stage_user:secret@ep-stage.us-east-2.aws.neon.tech/neondb',
      }),
    ).toMatchObject({
      url: 'postgresql://stage_user:secret@ep-stage.us-east-2.aws.neon.tech/neondb',
      synchronize: false,
      migrationsRun: false,
    });
  });

  it('rejects a non-secret production endpoint that disagrees with DATABASE_URL', () => {
    expect(() =>
      createStagingDataSourceOptions({
        DATABASE_URL:
          'postgresql://prod_user:secret@ep-prod.us-east-2.aws.neon.tech/neondb',
        PRODUCTION_NEON_ENDPOINT: 'ep-other.us-east-2.aws.neon.tech',
        STAGING_DATABASE_URL:
          'postgresql://stage_user:secret@ep-stage.us-east-2.aws.neon.tech/neondb',
      }),
    ).toThrow('PRODUCTION_NEON_ENDPOINT does not match');
  });

  it('rejects malformed primary URLs without exposing either connection string', () => {
    expect(() =>
      createStagingDataSourceOptions({
        DATABASE_URL: 'not-a-postgres-url',
        STAGING_DATABASE_URL:
          'postgresql://stage_user:secret@ep-stage.aws.neon.tech/neondb',
      }),
    ).toThrow('DATABASE_URL must be a valid PostgreSQL connection string');
  });

  it('builds safe options for a separate staging Neon endpoint', () => {
    expect(
      createStagingDataSourceOptions({
        DATABASE_URL:
          'postgresql://prod_user:secret@ep-prod.aws.neon.tech/neondb',
        STAGING_DATABASE_URL:
          'postgresql://stage_user:secret@ep-stage.aws.neon.tech/neondb?sslmode=require',
      }),
    ).toMatchObject({
      type: 'postgres',
      url: 'postgresql://stage_user:secret@ep-stage.aws.neon.tech/neondb?sslmode=require',
      synchronize: false,
      migrationsRun: false,
      uuidExtension: 'pgcrypto',
      installExtensions: false,
    });
  });

  it('uses only the backup URL after confirming distinct staging and production endpoints', () => {
    const options = createBackupDataSourceOptions({
      DATABASE_URL:
        'postgresql://prod_user:secret@ep-prod.aws.neon.tech/neondb',
      STAGING_DATABASE_URL:
        'postgresql://stage_user:secret@ep-stage.aws.neon.tech/neondb',
      STAGING_BACKUP_DATABASE_URL:
        'postgresql://backup_user:secret@ep-backup.aws.neon.tech/neondb',
    });
    expect(options.url).toBe(
      'postgresql://backup_user:secret@ep-backup.aws.neon.tech/neondb',
    );
    expect(options).toMatchObject({
      type: 'postgres',
      ssl: { rejectUnauthorized: true },
      migrationsRun: false,
      synchronize: false,
      installExtensions: false,
    });
  });

  it('requires a separate backup URL and rejects matching pooler endpoints', () => {
    expect(() =>
      createBackupDataSourceOptions({
        DATABASE_URL:
          'postgresql://prod_user:secret@ep-prod.aws.neon.tech/neondb',
        STAGING_DATABASE_URL:
          'postgresql://stage_user:secret@ep-stage.aws.neon.tech/neondb',
      }),
    ).toThrow('STAGING_BACKUP_DATABASE_URL is required');

    expect(() =>
      createBackupDataSourceOptions({
        DATABASE_URL:
          'postgresql://prod_user:secret@ep-prod.aws.neon.tech/neondb',
        STAGING_DATABASE_URL:
          'postgresql://stage_user:secret@ep-stage.aws.neon.tech/neondb',
        STAGING_BACKUP_DATABASE_URL:
          'postgresql://backup_user:secret@ep-stage-pooler.aws.neon.tech/neondb',
      }),
    ).toThrow('Backup endpoint matches the staging endpoint');
  });

  it('rejects a backup URL that points to production, including a pooler alias', () => {
    expect(() =>
      createBackupDataSourceOptions({
        DATABASE_URL:
          'postgresql://prod_user:secret@ep-prod.aws.neon.tech/neondb',
        STAGING_DATABASE_URL:
          'postgresql://stage_user:secret@ep-stage.aws.neon.tech/neondb',
        STAGING_BACKUP_DATABASE_URL:
          'postgresql://backup_user:secret@ep-prod-pooler.aws.neon.tech/neondb',
      }),
    ).toThrow('Backup endpoint matches the production endpoint');
  });

  it('does not include secret connection values in backup validation errors', () => {
    const backupUrl =
      'postgresql://backup_user:secret@ep-stage.aws.neon.tech/neondb';
    let thrown: unknown;
    try {
      createBackupDataSourceOptions({
        DATABASE_URL:
          'postgresql://prod_user:secret@ep-prod.aws.neon.tech/neondb',
        STAGING_DATABASE_URL:
          'postgresql://stage_user:secret@ep-stage.aws.neon.tech/neondb',
        STAGING_BACKUP_DATABASE_URL: backupUrl,
      });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).not.toContain(backupUrl);
    expect((thrown as Error).message).not.toContain('secret');
  });

  it('requires DATABASE_URL instead of accepting split credential variables', () => {
    expect(() =>
      createNeonDataSourceOptions({
        DB_HOST: 'local-postgres.example.test',
        DB_PORT: '6543',
        DB_USERNAME: 'local_user',
        DB_PASSWORD: 'local_password',
        DB_DATABASE: 'local_database',
      }),
    ).toThrow('Database configuration is incomplete or invalid.');
  });
});
