import { validateAppId } from './appIdValidation';

export class AppId {
  constructor(private id: string) {
    validateAppId(id);
    this.id = id;
  }

  getValueAsString(): string {
    return this.id;
  }
}
