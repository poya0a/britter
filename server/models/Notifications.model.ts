export interface NofiticationsInterface {
  UID: string;
  recipient_uid: string;
  sender_uid: string;
  notify_type: string;
  notify_seq: string;
  confirm: boolean;
}

export class NofiticationsModel implements NofiticationsInterface {
  UID: string;
  recipient_uid: string;
  sender_uid: string;
  notify_type: string;
  notify_seq: string;
  confirm: boolean;

  constructor(notification: NofiticationsInterface) {
    this.UID = notification.UID;
    this.recipient_uid = notification.recipient_uid;
    this.sender_uid = notification.sender_uid;
    this.notify_type = notification.notify_type;
    this.notify_seq = notification.notify_seq;
    this.confirm = notification.confirm;
  }
}
