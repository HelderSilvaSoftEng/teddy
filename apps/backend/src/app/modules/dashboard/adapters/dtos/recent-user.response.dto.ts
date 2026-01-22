export class RecentCustomerResponseDto {
  id: string;
  name: string;
  company: string | null;
  createdAt: Date;

  constructor(data: { id: string; name: string; company: string | null; createdAt: Date }) {
    this.id = data.id;
    this.name = data.name;
    this.company = data.company;
    this.createdAt = data.createdAt;
  }
}
