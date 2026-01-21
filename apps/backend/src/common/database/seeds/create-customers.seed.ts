import { DataSource } from 'typeorm';
import { Customer, CustomerStatusEnum } from '../../../app/modules/customers/domain/entities';
import { User } from '../../../app/modules/users/domain/entities';

export async function runCustomersSeed(dataSource: DataSource): Promise<void> {
  const customerRepository = dataSource.getRepository(Customer);
  const userRepository = dataSource.getRepository(User);

  // Buscar o usuário admin
  const adminUser = await userRepository.findOne({
    where: { email: 'admin@teddy.com' },
  });

  if (!adminUser) {
    console.log('⚠️  Admin user not found, skipping customers seed');
    return;
  }

  // Verificar se já existem customers
  const existingCount = await customerRepository.count({
    where: { userId: adminUser.id },
  });

  if (existingCount > 0) {
    console.log(`✓ Customers already exist (${existingCount} found)`);
    return;
  }

  // Dados dos 30 customers
  const customersData = [
    { name: 'João Silva', salary: 5500.00, company: 'Tech Solutions' },
    { name: 'Maria Santos', salary: 6200.00, company: 'Digital Innovations' },
    { name: 'Carlos Oliveira', salary: 4800.00, company: 'Marketing Plus' },
    { name: 'Ana Costa', salary: 7100.00, company: 'Financial Group' },
    { name: 'Pedro Martins', salary: 5300.00, company: 'Consultoria XYZ' },
    { name: 'Juliana Lima', salary: 6800.00, company: 'Software House' },
    { name: 'Roberto Alves', salary: 5900.00, company: 'Tech Solutions' },
    { name: 'Fernanda Dias', salary: 7500.00, company: 'Enterprise Corp' },
    { name: 'Lucas Rocha', salary: 4600.00, company: 'Startup Ventures' },
    { name: 'Amanda Souza', salary: 6300.00, company: 'Digital Innovations' },
    { name: 'Gustavo Pereira', salary: 5700.00, company: 'Consultoria XYZ' },
    { name: 'Beatriz Castro', salary: 7200.00, company: 'Financial Group' },
    { name: 'Thiago Mendes', salary: 5400.00, company: 'Tech Solutions' },
    { name: 'Camila Ribeiro', salary: 6600.00, company: 'Marketing Plus' },
    { name: 'Felipe Costa', salary: 4900.00, company: 'Software House' },
    { name: 'Isabela Gomes', salary: 7400.00, company: 'Enterprise Corp' },
    { name: 'Bruno Silva', salary: 5800.00, company: 'Consultoria XYZ' },
    { name: 'Leticia Monteiro', salary: 6900.00, company: 'Digital Innovations' },
    { name: 'Diego Teixeira', salary: 5100.00, company: 'Startup Ventures' },
    { name: 'Sophia Lemos', salary: 7600.00, company: 'Financial Group' },
    { name: 'Matheus Barbosa', salary: 5500.00, company: 'Tech Solutions' },
    { name: 'Victoria Matos', salary: 6400.00, company: 'Marketing Plus' },
    { name: 'Rafael Ferreira', salary: 5200.00, company: 'Software House' },
    { name: 'Gabriela Duarte', salary: 7300.00, company: 'Enterprise Corp' },
    { name: 'Neymar Santos', salary: 6100.00, company: 'Consultoria XYZ' },
    { name: 'Olivia Cardoso', salary: 6700.00, company: 'Digital Innovations' },
    { name: 'Victor Sousa', salary: 5000.00, company: 'Startup Ventures' },
    { name: 'Mariana Reis', salary: 7800.00, company: 'Financial Group' },
    { name: 'Alexandre Moura', salary: 5600.00, company: 'Tech Solutions' },
    { name: 'Estela Ribeiro', salary: 6500.00, company: 'Marketing Plus' },
  ];

  // Criar os customers
  const customers = customersData.map(data => 
    new Customer({
      ...data,
      userId: adminUser.id,
      status: CustomerStatusEnum.ACTIVE,
    })
  );

  await customerRepository.save(customers);
  console.log(`✓ ${customers.length} customers created successfully`);
}
