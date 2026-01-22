import { DataSource } from 'typeorm';
import { User, UserStatusEnum } from '../../../app/modules/users/domain/entities';

export async function runAdminUserSeed(dataSource: DataSource): Promise<void> {
  try {
    const userRepository = dataSource.getRepository(User);

    // Check if admin user already exists
    const adminExists = await userRepository.findOne({
      where: { email: 'admin@teddy.com' },
    });

    if (adminExists) {
      return;
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@teddy.com',
      status: UserStatusEnum.ACTIVE,
    });

    adminUser.setPassword('admin123');
    await userRepository.save(adminUser);
  } catch (error) {
    console.error('Error in admin user seed:', error);
    throw error;
  }
}
