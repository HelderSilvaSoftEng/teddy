import { DataSource } from 'typeorm';
import { User, UserStatusEnum } from '../../../app/modules/users/domain/entities';

export async function runAdminUserSeed(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  // Verifica se já existe um usuário admin
  const adminExists = await userRepository.findOne({
    where: { email: 'admin@teddy.com' },
  });

  if (adminExists) {
    console.log('✓ Admin user already exists');
    return;
  }

  // Cria o usuário admin
  const adminUser = new User({
    email: 'admin@teddy.com',
    status: UserStatusEnum.ACTIVE,
  });

  // Hasheado a senha
  adminUser.setPassword('admin123');

  await userRepository.save(adminUser);
  console.log('✓ Admin user created successfully: admin@teddy.com');
}
