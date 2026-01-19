import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class SplitClientsIntoUsersAndCustomers1705600900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1️⃣ Renomear tabela 'clients' para 'users'
    await queryRunner.renameTable('clients', 'users');

    // 2️⃣ Remover colunas de dados que não pertencem a users
    await queryRunner.dropColumn('users', 'userName');
    await queryRunner.dropColumn('users', 'personalId');
    await queryRunner.dropColumn('users', 'mobile');

    // 3️⃣ Criar tabela 'customers' com os dados separados
    await queryRunner.createTable(
      new Table({
        name: 'customers',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          }),
          new TableColumn({
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          }),
          new TableColumn({
            name: 'userName',
            type: 'varchar',
            isNullable: true,
          }),
          new TableColumn({
            name: 'personalId',
            type: 'varchar',
            isNullable: true,
          }),
          new TableColumn({
            name: 'mobile',
            type: 'varchar',
            isNullable: true,
          }),
          new TableColumn({
            name: 'salary',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: true,
          }),
          new TableColumn({
            name: 'enterprise',
            type: 'varchar',
            isNullable: true,
          }),
          new TableColumn({
            name: 'status',
            type: 'varchar',
            default: "'ACTIVE'",
          }),
          new TableColumn({
            name: 'accessCount',
            type: 'integer',
            default: 0,
          }),
          new TableColumn({
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          }),
          new TableColumn({
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          }),
          new TableColumn({
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          }),
        ],
      }),
      true, // ifNotExists
    );

    // 4️⃣ Adicionar foreign key de userId para users
    await queryRunner.createForeignKey(
      'customers',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter a migração
    
    // 1️⃣ Remover foreign key
    const table = await queryRunner.getTable('customers');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('customers', foreignKey);
    }

    // 2️⃣ Remover tabela customers
    await queryRunner.dropTable('customers', true);

    // 3️⃣ Adicionar colunas de volta à tabela users
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'userName',
        type: 'varchar',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'personalId',
        type: 'varchar',
        isNullable: true,
      }),
    );
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'mobile',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // 4️⃣ Renomear tabela 'users' de volta para 'clients'
    await queryRunner.renameTable('users', 'clients');
  }
}
