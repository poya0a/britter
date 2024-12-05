export interface NofiticationsInterface {
  UID: string;
  recipient_uid: string;
  sender_uid: string;
  notify_type: string;
  create_date: Date;
}

export class NofiticationsModel implements NofiticationsInterface {
  UID: string;
  recipient_uid: string;
  sender_uid: string;
  notify_type: string;
  create_date: Date;

  constructor(notification: NofiticationsInterface) {
    this.UID = notification.UID;
    this.recipient_uid = notification.recipient_uid;
    this.sender_uid = notification.sender_uid;
    this.notify_type = notification.notify_type;
    this.create_date = notification.create_date;
  }
}
