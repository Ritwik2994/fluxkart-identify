import { Controller, Post, Body } from '@nestjs/common';

import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactResponse } from './interface/contact.interface';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('/identify')
  async identify(
    @Body() createContactDto: CreateContactDto,
  ): Promise<ContactResponse> {
    return await this.contactService.create(createContactDto);
  }
}
