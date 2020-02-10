import { Get, Controller } from "@nestjs/common";

import { TagEntity } from './tag.entity';
import { TagService } from './tag.service';

<<<<<<< HEAD
import { ApiBearerAuth } from "@nestjs/swagger";

@ApiBearerAuth()
=======
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";

@ApiBearerAuth()
@ApiTags('tags')
>>>>>>> 635d760783eac8ac3563eb56146f0849ac448b72
@Controller('tags')
export class TagController {

  constructor(private readonly tagService: TagService) {}

  @Get()
  async findAll(): Promise<TagEntity[]> {
    return await this.tagService.findAll();
  }

}