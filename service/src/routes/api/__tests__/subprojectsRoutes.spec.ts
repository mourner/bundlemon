import { Compression } from 'bundlemon-utils';
import { app } from '@tests/app';
import { createTestProject } from '@tests/projectUtils';
import { generateRandomString } from '@tests/utils';
import { createCommitRecord } from '../../../framework/mongo';

describe('sub projects routes', () => {
  describe('get sub projects', () => {
    test('project id not exist', async () => {
      const projectId = generateRandomString(24);

      const response = await app.inject({
        method: 'GET',
        url: `/v1/projects/${projectId}/subprojects`,
      });

      expect(response.statusCode).toEqual(200);

      const subProjects = response.json<string[]>();

      expect(subProjects).toHaveLength(0);
    });

    test('no sub projects', async () => {
      const { projectId } = await createTestProject();
      const { projectId: projectId2 } = await createTestProject();

      await createCommitRecord(projectId, {
        branch: 'other',
        commitSha: generateRandomString(8),
        files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
        groups: [],
      });

      await createCommitRecord(projectId, {
        branch: 'other',
        commitSha: generateRandomString(8),
        files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
        groups: [],
        // @ts-expect-error
        subProject: null,
      });

      await createCommitRecord(projectId2, {
        branch: 'other',
        commitSha: generateRandomString(8),
        files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
        groups: [],
        subProject: 'test',
      });

      const response = await app.inject({
        method: 'GET',
        url: `/v1/projects/${projectId}/subprojects`,
      });

      expect(response.statusCode).toEqual(200);

      const subProjects = response.json<string[]>();

      expect(subProjects).toHaveLength(0);
    });

    test('with sub projects', async () => {
      const { projectId } = await createTestProject();
      const { projectId: projectId2 } = await createTestProject();

      await createCommitRecord(projectId, {
        branch: 'other',
        commitSha: generateRandomString(8),
        files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
        groups: [],
      });

      await createCommitRecord(projectId, {
        branch: 'other',
        commitSha: generateRandomString(8),
        files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
        groups: [],
        subProject: 'sub1',
      });

      await createCommitRecord(projectId, {
        branch: 'other',
        commitSha: generateRandomString(8),
        files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
        groups: [],
        subProject: 'sub2',
      });

      await createCommitRecord(projectId, {
        branch: 'other',
        commitSha: generateRandomString(8),
        files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
        groups: [],
        subProject: 'sub1',
      });

      await createCommitRecord(projectId2, {
        branch: 'other',
        commitSha: generateRandomString(8),
        files: [{ path: 'file.js', pattern: '*.js', size: 100, compression: Compression.None }],
        groups: [],
        subProject: 'test',
      });

      const response = await app.inject({
        method: 'GET',
        url: `/v1/projects/${projectId}/subprojects`,
      });

      expect(response.statusCode).toEqual(200);

      const subProjects = response.json<string[]>();

      expect(subProjects).toHaveLength(2);
      expect(subProjects).toEqual(['sub1', 'sub2']);
    });
  });
});
