import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /notifications?page=1&limit=20
   * Lấy danh sách thông báo của user đang đăng nhập
   */
  @Get()
  async getMyNotifications(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.notificationsService.getByUser(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  /**
   * GET /notifications/unread-count
   * Đếm số thông báo chưa đọc
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  /**
   * PATCH /notifications/:id/read
   * Đánh dấu 1 thông báo đã đọc
   */
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    await this.notificationsService.markAsRead(id, userId);
    return { success: true };
  }

  /**
   * PATCH /notifications/read-all
   * Đánh dấu tất cả đã đọc
   */
  @Patch('read-all')
  async markAllAsRead(@Request() req: any) {
    const userId = req.user.userId || req.user.sub;
    await this.notificationsService.markAllAsRead(userId);
    return { success: true };
  }
}
