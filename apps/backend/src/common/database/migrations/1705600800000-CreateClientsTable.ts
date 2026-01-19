import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateClientsTable1705600800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela clients com todas as colunas
    await queryRunner.createTable(
      new Table({
        name: 'clients',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          }),
          new TableColumn({
            name: 'userName',
            type: 'varchar',
            isNullable: true,
          }),
          new TableColumn({
            name: 'email',
            type: 'varchar',
            isUnique: true,
          }),
          new TableColumn({
            name: 'password',
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
            name: 'status',
            type: 'varchar',
            default: "'ACTIVE'",
          }),
          new TableColumn({
            name: 'refreshTokenHash',
            type: 'varchar',
            isNullable: true,
          }),
          new TableColumn({
            name: 'refreshTokenExpires',
            type: 'timestamp',
            isNullable: true,
          }),
          new TableColumn({
            name: 'recoveryTokenHash',
            type: 'varchar',
            isNullable: true,
          }),
          new TableColumn({
            name: 'recoveryTokenExpires',
            type: 'timestamp',
            isNullable: true,
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
          new TableColumn({
            name: 'accessCount',
            type: 'integer',
            default: 0,
          }),
        ],
      }),
      true, // ifNotExists
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('clients', true);
  }
}
