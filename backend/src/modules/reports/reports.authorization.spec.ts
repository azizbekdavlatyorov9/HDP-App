import 'reflect-metadata';
import { REQUIRED_ROLES } from '../../common/decorators/roles.decorator.js';
import { ReportsController } from './reports.controller.js';

describe('reports authorization', () => {
  it('marks the report controller as administrator-only', () => {
    expect(Reflect.getMetadata(REQUIRED_ROLES, ReportsController)).toEqual([
      'ADMIN',
      'SUPER_ADMIN',
    ]);
  });
});
