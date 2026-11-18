import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { VideosService } from './videos.service.js';

const admin = {
  id: 'admin',
  displayName: 'Admin',
  roles: ['ADMIN'] as string[],
};
const student = {
  id: 'student',
  displayName: 'Student',
  roles: ['STUDENT'] as string[],
};

function setup(overrides: Record<string, unknown> = {}) {
  const videoRepo = {
    findOne: vi.fn(),
    find: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn((value) => value),
    save: vi.fn(async (value) => value),
  };
  const lessonRepo = { findOne: vi.fn() };
  const provider = {
    createUpload: vi.fn().mockResolvedValue({
      uid: 'cf-uid',
      uploadUrl: 'https://upload.example/once',
    }),
    createPlayback: vi.fn().mockResolvedValue({
      token: 'short-token',
      playbackUrl: 'https://customer.test/short-token/manifest/video.m3u8',
      expiresAt: new Date(),
    }),
    deleteVideo: vi.fn(),
    verifyWebhook: vi.fn(),
  };
  const access = {
    isAdmin: vi.fn(
      (user) =>
        user.roles.includes('ADMIN') || user.roles.includes('SUPER_ADMIN'),
    ),
    canManageCourse: vi.fn().mockResolvedValue({}),
    canAccessLesson: vi.fn().mockResolvedValue({ course: { id: 'course' } }),
    hasActiveEnrollment: vi.fn().mockResolvedValue(true),
  };
  Object.assign(videoRepo, overrides.videoRepo);
  Object.assign(provider, overrides.provider);
  Object.assign(access, overrides.access);
  const service = new VideosService(
    videoRepo as never,
    lessonRepo as never,
    provider as never,
    access as never,
  );
  return { service, videoRepo, lessonRepo, provider, access };
}

describe('video authorization and lifecycle', () => {
  it('allows administrators to create direct uploads after checking the lesson', async () => {
    const { service, lessonRepo, provider, videoRepo } = setup();
    lessonRepo.findOne.mockResolvedValue({
      id: 'lesson',
      title: 'Algebra',
      course: { id: 'course' },
    });
    const result = await service.createUpload('lesson', 600, admin as never);
    expect(provider.createUpload).toHaveBeenCalledWith(600, 'Algebra');
    expect(videoRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ cloudflareUid: 'cf-uid', status: 'pending' }),
    );
    expect(result.uploadUrl).toBe('https://upload.example/once');
  });

  it('rejects teacher uploads and invalid lesson IDs before contacting Cloudflare', async () => {
    const { service, provider } = setup();
    await expect(
      service.createUpload('lesson', 600, {
        ...admin,
        roles: ['TEACHER'],
      } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.createUpload('bad-id', 600, admin as never),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(provider.createUpload).not.toHaveBeenCalled();
  });

  it('rejects duration values outside Cloudflare limits', async () => {
    const { service, provider } = setup();
    await expect(
      service.createUpload('lesson', 36_001, admin as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(provider.createUpload).not.toHaveBeenCalled();
  });

  it('checks enrollment access before creating a playback token', async () => {
    const { service, videoRepo, access, provider } = setup({
      videoRepo: {
        findOne: vi.fn().mockResolvedValue({
          cloudflareUid: 'uid',
          status: 'ready',
          lesson: { id: 'lesson' },
        }),
      },
      access: {
        canAccessLesson: vi.fn().mockRejectedValue(new ForbiddenException()),
      },
    });
    await expect(
      service.playback('video', student as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(access.canAccessLesson).toHaveBeenCalledWith('lesson', student);
    expect(provider.createPlayback).not.toHaveBeenCalled();
    expect(videoRepo.findOne).toHaveBeenCalled();
  });

  it('does not issue playback tokens for videos that are not ready', async () => {
    const { service, provider } = setup({
      videoRepo: {
        findOne: vi.fn().mockResolvedValue({
          cloudflareUid: 'uid',
          status: 'processing',
          lesson: { id: 'lesson' },
        }),
      },
    });
    await expect(
      service.playback('video', student as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(provider.createPlayback).not.toHaveBeenCalled();
  });

  it('requires active enrollment even when the lesson is otherwise free to access', async () => {
    const { service, access, provider } = setup({
      videoRepo: {
        findOne: vi.fn().mockResolvedValue({
          cloudflareUid: 'uid',
          status: 'ready',
          lesson: { id: 'lesson' },
        }),
      },
      access: { hasActiveEnrollment: vi.fn().mockResolvedValue(false) },
    });
    await expect(
      service.playback('video', student as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(access.hasActiveEnrollment).toHaveBeenCalledWith(
      'course',
      'student',
    );
    expect(provider.createPlayback).not.toHaveBeenCalled();
  });

  it('returns only ready student metadata and omits provider identifiers', async () => {
    const { service } = setup({
      videoRepo: {
        find: vi.fn().mockResolvedValue([
          {
            id: 'ready-video',
            cloudflareUid: 'private-provider-id',
            title: 'Lesson video',
            status: 'ready',
            durationSeconds: 30,
            thumbnailUrl: null,
            position: 1,
            createdAt: new Date(),
            lesson: { id: 'lesson', course: { id: 'course' } },
          },
          {
            id: 'processing-video',
            cloudflareUid: 'another-private-id',
            status: 'processing',
            lesson: { id: 'lesson', course: { id: 'course' } },
          },
        ]),
      },
    });
    const result = await service.list(student as never);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'ready-video', lessonId: 'lesson' });
    expect(result[0]).not.toHaveProperty('cloudflareUid');
  });

  it('deletes only after checking administrator and course access', async () => {
    const video = {
      id: 'video',
      cloudflareUid: 'uid',
      status: 'ready',
      lesson: { course: { id: 'course' } },
    };
    const { service, provider, videoRepo, access } = setup({
      videoRepo: { findOne: vi.fn().mockResolvedValue(video) },
    });
    await expect(
      service.delete('video', student as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(provider.deleteVideo).not.toHaveBeenCalled();
    await service.delete('video', admin as never);
    expect(access.canManageCourse).toHaveBeenCalledWith('course', admin);
    expect(provider.deleteVideo).toHaveBeenCalledWith('uid');
    expect(video.status).toBe('deleted');
    expect(videoRepo.save).toHaveBeenCalledWith(video);
  });

  it('leaves the database row unchanged when Cloudflare deletion fails', async () => {
    const video = {
      id: 'video',
      cloudflareUid: 'uid',
      status: 'ready',
      lesson: { course: { id: 'course' } },
    };
    const { service, videoRepo } = setup({
      videoRepo: { findOne: vi.fn().mockResolvedValue(video) },
      provider: {
        deleteVideo: vi
          .fn()
          .mockRejectedValue(new ServiceUnavailableException()),
      },
    });
    await expect(
      service.delete('video', admin as never),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(video.status).toBe('ready');
    expect(videoRepo.save).not.toHaveBeenCalled();
  });

  it('handles duplicate webhook delivery without regressing a ready state', async () => {
    const video = { id: 'video', cloudflareUid: 'uid', status: 'ready' };
    const { service, provider, videoRepo } = setup({
      videoRepo: { findOne: vi.fn().mockResolvedValue(video) },
      provider: {
        verifyWebhook: vi.fn().mockReturnValue({
          uid: 'uid',
          readyToStream: false,
          status: { state: 'inprogress' },
        }),
      },
    });
    await expect(service.webhook(Buffer.from('{}'), 'sig')).resolves.toEqual({
      accepted: true,
      duplicate: true,
    });
    expect(provider.verifyWebhook).toHaveBeenCalled();
    expect(video.status).toBe('ready');
    expect(videoRepo.save).not.toHaveBeenCalled();
  });

  it('validates webhook payloads before looking up video state', async () => {
    const { service, videoRepo, provider } = setup({
      provider: {
        verifyWebhook: vi.fn().mockReturnValue({
          uid: 'uid',
          readyToStream: 'yes',
          status: { state: 'ready' },
        }),
      },
    });
    await expect(
      service.webhook(Buffer.from('{}'), 'sig'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(videoRepo.findOne).not.toHaveBeenCalled();
    expect(provider.verifyWebhook).toHaveBeenCalled();
  });

  it('rejects invalid webhook signatures before database access', async () => {
    const { service, videoRepo } = setup({
      provider: {
        verifyWebhook: vi.fn(() => {
          throw new ForbiddenException();
        }),
      },
    });
    await expect(
      service.webhook(Buffer.from('{}'), 'bad'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(videoRepo.findOne).not.toHaveBeenCalled();
  });
});
