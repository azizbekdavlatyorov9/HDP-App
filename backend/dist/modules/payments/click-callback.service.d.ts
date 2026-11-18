import { DataSource, Repository } from 'typeorm';
import { Payment, PaymentTransaction } from '../../database/entities/index.js';
import type { ClickCallbackDto } from './payments.dto.js';
import { ClickProvider } from './click.provider.js';
import { NotificationsService } from '../notifications/notifications.service.js';
export declare class ClickCallbackService {
    private readonly payments;
    private readonly transactions;
    private readonly db;
    private readonly provider;
    private readonly notifications?;
    constructor(payments: Repository<Payment>, transactions: Repository<PaymentTransaction>, db: DataSource, provider: ClickProvider, notifications?: NotificationsService | undefined);
    private response;
    private expire;
    prepare(payload: ClickCallbackDto): Promise<{
        error: number;
        error_note: string;
        merchant_prepare_id: number;
        click_trans_id: number;
        merchant_trans_id: string;
    } | {
        error: number;
        error_note: string;
        merchant_confirm_id: number;
        click_trans_id: number;
        merchant_trans_id: string;
    }>;
    complete(payload: ClickCallbackDto): Promise<{
        error: number;
        error_note: string;
        merchant_prepare_id: number;
        click_trans_id: number;
        merchant_trans_id: string;
    } | {
        error: number;
        error_note: string;
        merchant_confirm_id: number;
        click_trans_id: number;
        merchant_trans_id: string;
    }>;
    private notifyPayment;
    private activateEnrollment;
}
