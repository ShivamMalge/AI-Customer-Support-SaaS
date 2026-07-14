import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';

@Controller('notifications')
export class NotificationsController {
  @Public()
  @Get()
  stub(@Res() res: Response) {
    return res.status(HttpStatus.NOT_IMPLEMENTED).json({ status: 'not_implemented', module: 'notifications' });
  }
}


