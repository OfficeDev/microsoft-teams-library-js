import { MessageRequest } from './interfaces';

export class Communication {
  public static parentOrigin: string;
  public static parentWindow: Window | any;
  public static childWindow: Window;
  public static childOrigin: string;
  public static parentMessageQueue: MessageRequest[] = [];
  public static childMessageQueue: MessageRequest[] = [];
  public static nextMessageId: number = 0;
  public static handlers: {
    [func: string]: Function;
  } = {};
  public static callbacks: {
    [id: number]: Function;
  } = {};
}
