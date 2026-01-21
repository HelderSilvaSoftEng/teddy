export class RecentUserResponseDto {
  id: string;
  email: string;
  name: string;
  createdAt: Date;

  constructor(data: { id: string; email: string; name: string; createdAt: Date }) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.createdAt = data.createdAt;
  }
}
