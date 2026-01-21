export class RecentCustomerResponseDto {
  id: string;
  name: string;
  email: string;
  createdAt: Date;

  constructor(data: { id: string; name: string; email: string; createdAt: Date }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.createdAt = data.createdAt;
  }
}
