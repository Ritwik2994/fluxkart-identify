import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateContactDto } from './dto/create-contact.dto';
import { Contact } from './entities/contact.entity';
import { ContactResponse } from './interface/contact.interface';
import { ResponseHandlerModel } from '../../shared/model/response-handler.model';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private readonly responseHandlerModel: ResponseHandlerModel,
  ) {}

  /**
   * @description This function creates a new contact with the provided email and phone number, and handles
   * cases where the contact already exists or has missing information.
   * @param {CreateContactDto} createContactDto
   * @returns a Promise that resolves to either a ContactResponse object or a string.
   * @author Ritwik Rohitashwa
   */
  async create(createContactDto: CreateContactDto): Promise<ContactResponse> {
    const { email, phoneNumber } = createContactDto;

    if (!email && !phoneNumber) {
      this.responseHandlerModel.error(
        'Both email and phoneNumber are missing',
        HttpStatus.BAD_REQUEST,
      );
    }

    let existingContact = await this.findByEmailOrPhoneNumber(
      email,
      phoneNumber,
    );

    const contactInstance = new Contact();
    contactInstance.email = email;
    contactInstance.phoneNumber = phoneNumber;

    if (!existingContact) {
      contactInstance.linkPrecedence = 'primary';
      existingContact = await this.contactRepository.save(contactInstance);
    } else if (
      (!existingContact.email && email) ||
      (!existingContact.phoneNumber && phoneNumber)
    ) {
      const linkedId =
        existingContact.linkPrecedence === 'primary'
          ? existingContact.id
          : existingContact.linkedId;
      contactInstance.linkedId = linkedId;
      contactInstance.linkPrecedence = 'secondary';
      await this.contactRepository.save(contactInstance);
    }

    const primaryContactId =
      existingContact.linkPrecedence === 'primary'
        ? existingContact.id
        : existingContact.linkedId;
    const secondaryContacts = await this.findAllSecondaryContacts(
      primaryContactId,
    );

    const contactData = {
      primaryContactId,
      emails: [existingContact.email],
      phoneNumbers: [existingContact.phoneNumber],
      secondaryContactIds: secondaryContacts.map((contact) => contact.id),
    };

    if (contactInstance.linkPrecedence === 'secondary') {
      contactData.emails.push(contactInstance.email);
      contactData.phoneNumbers.push(contactInstance.phoneNumber);
      contactData.secondaryContactIds.push(contactInstance.id);
    }
    return { contact: contactData };
  }

  /**
   * @description This function takes an email and a phone number as parameters and returns
   * a Promise that resolves to a Contact object found in the contactRepository based on the provided
   * email or phone number.
   * @param {string} email - A string representing the email address of a contact.
   * @param {string} phoneNumber - A string representing the phone number of a contact.
   * @returns a Promise that resolves to a Contact object.
   */
  async findByEmailOrPhoneNumber(
    email: string,
    phoneNumber: string,
  ): Promise<Contact> {
    return this.contactRepository.findOne({
      where: [{ email }, { phoneNumber }],
    });
  }

  /**
   * @description This function retrieves all secondary contacts linked to a primary
   * contact based on the provided primary contact ID.
   * @param {number} primaryContactId - The primaryContactId is a number that represents the ID of the
   * primary contact.
   * @returns The function `findAllSecondaryContacts` returns a Promise that resolves to an array of
   * `Contact` objects.
   */
  async findAllSecondaryContacts(primaryContactId: number): Promise<Contact[]> {
    return this.contactRepository.find({
      where: { linkedId: primaryContactId },
    });
  }
}
