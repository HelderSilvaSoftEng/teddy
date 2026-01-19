export class CustomerResponseDto {
  id: string;
  userId: string;
  userName: string | null;
  personalId: string | null;
  mobile: string | null;
  salary: number | null;
  enterprise: string | null;
  status: string;
  accessCount: number;
  createdAt: Date;
  updatedAt: Date;
}
