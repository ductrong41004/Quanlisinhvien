import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private gateway: NotificationsGateway,
  ) {}

  /**
   * Tạo thông báo cho 1 user, lưu DB + emit socket real-time
   */
  async createForUser(
    recipientId: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    link?: string,
  ): Promise<NotificationDocument> {
    const notification = await this.notificationModel.create({
      recipient: recipientId,
      message,
      type,
      link,
    });

    // Emit real-time qua socket (gửi vào room = recipientId)
    this.gateway.sendToUser(recipientId, {
      id: notification._id,
      message,
      type,
      link,
      isRead: false,
      createdAt: (notification as any).createdAt,
    });

    return notification;
  }

  /**
   * Tạo thông báo cho nhiều user cùng lúc
   */
  async createForMany(
    recipientIds: string[],
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    link?: string,
  ): Promise<void> {
    const docs = recipientIds.map((recipientId) => ({
      recipient: recipientId,
      message,
      type,
      link,
    }));

    const notifications = await this.notificationModel.insertMany(docs);

    // Emit real-time cho từng user
    for (let i = 0; i < recipientIds.length; i++) {
      this.gateway.sendToUser(recipientIds[i], {
        id: notifications[i]._id,
        message,
        type,
        link,
        isRead: false,
        createdAt: (notifications[i] as any).createdAt,
      });
    }
  }

  /**
   * Lấy thông báo của user hiện tại (phân trang)
   */
  async getByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.notificationModel
        .find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.notificationModel.countDocuments({ recipient: userId }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Đếm số thông báo chưa đọc
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ recipient: userId, isRead: false });
  }

  /**
   * Đánh dấu 1 thông báo đã đọc
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationModel.updateOne(
      { _id: notificationId, recipient: userId },
      { $set: { isRead: true } },
    );
  }

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } },
    );
  }
}
