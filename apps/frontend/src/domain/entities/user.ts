export class User {
  id!: string;
  email!: string;
  name?: string;

  constructor(data: Partial<User> = {}) {
    Object.assign(this, data);
  }
}
