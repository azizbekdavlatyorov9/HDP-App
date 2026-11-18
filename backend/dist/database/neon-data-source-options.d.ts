import type { DataSourceOptions } from 'typeorm';
export declare function createNeonDataSourceOptions(environment: NodeJS.ProcessEnv): DataSourceOptions;
export declare function createStagingDataSourceOptions(environment: NodeJS.ProcessEnv): DataSourceOptions;
export declare function createBackupDataSourceOptions(environment: NodeJS.ProcessEnv): DataSourceOptions;
