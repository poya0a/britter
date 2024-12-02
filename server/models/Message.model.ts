export interface MessageInterface {
  UID: string;
  recipient_uid: string;
  sender_uid: string;
  message: string;
  confirm: boolean;
}

export class MessageModel implements MessageInterface {
  UID: string;
  recipient_uid: string;
  sender_uid: string;
  message: string;
  confirm: boolean;

  constructor(message: MessageInterface) {
    this.UID = message.UID;
    this.recipient_uid = message.recipient_uid;
    this.sender_uid = message.sender_uid;
    this.confirm = message.confirm;
    this.confirm = message.confirm;
  }
}
