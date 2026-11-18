var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, MoreThan, Repository } from 'typeorm';
import { Classroom, GroupSchedule, LessonSession } from '../../database/entities/index.js';
let ClassroomsService = class ClassroomsService {
    rooms;
    schedules;
    sessions;
    db;
    constructor(rooms, schedules, sessions, db) {
        this.rooms = rooms;
        this.schedules = schedules;
        this.sessions = sessions;
        this.db = db;
    }
    admin(u) { return u.roles.includes('ADMIN') || u.roles.includes('SUPER_ADMIN'); }
    async create(dto, u) { if (!this.admin(u))
        throw new ForbiddenException(); if (await this.rooms.exists({ where: { code: dto.code } }))
        throw new ConflictException('Room code already exists'); return this.rooms.save(this.rooms.create({ ...dto, location: dto.location ?? null, description: dto.description ?? null, isActive: true })); }
    async list(includeInactive, u) { return this.rooms.find({ where: includeInactive && this.admin(u) ? {} : { isActive: true }, order: { name: 'ASC' } }); }
    async get(id) { const room = await this.rooms.findOne({ where: { id } }); if (!room)
        throw new NotFoundException('Classroom not found'); return room; }
    async update(id, dto, u) { if (!this.admin(u))
        throw new ForbiddenException(); return this.db.transaction(async (m) => { await m.query('SELECT pg_advisory_xact_lock(hashtext($1),hashtext($2))', ['schedule-resource:' + id, id]); const repo = m.getRepository(Classroom); const room = await repo.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } }); if (!room)
        throw new NotFoundException('Classroom not found'); if (dto.code && dto.code !== room.code && await repo.exists({ where: { code: dto.code } }))
        throw new ConflictException('Room code already exists'); if (dto.capacity !== undefined) {
        const schedules = await m.getRepository(GroupSchedule).find({ where: { classroom: { id }, isActive: true }, relations: { group: true } });
        if (schedules.some(s => s.group.capacity > dto.capacity))
            throw new BadRequestException('Classroom capacity cannot be below an assigned group capacity');
        const future = await m.getRepository(LessonSession).find({ where: { classroom: { id }, status: In(['SCHEDULED', 'IN_PROGRESS']), startAt: MoreThan(new Date()) }, relations: { group: true } });
        if (future.some(s => s.group.capacity > dto.capacity))
            throw new BadRequestException('Classroom capacity cannot be below a future session group capacity');
    } Object.assign(room, dto); return repo.save(room); }); }
    async setActive(id, isActive, u) { if (!this.admin(u))
        throw new ForbiddenException(); return this.db.transaction(async (m) => { await m.query('SELECT pg_advisory_xact_lock(hashtext($1),hashtext($2))', ['schedule-resource:' + id, id]); const repo = m.getRepository(Classroom); const room = await repo.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } }); if (!room)
        throw new NotFoundException('Classroom not found'); room.isActive = isActive; return repo.save(room); }); }
};
ClassroomsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Classroom)),
    __param(1, InjectRepository(GroupSchedule)),
    __param(2, InjectRepository(LessonSession)),
    __metadata("design:paramtypes", [Repository, Repository, Repository, DataSource])
], ClassroomsService);
export { ClassroomsService };
//# sourceMappingURL=classrooms.service.js.map