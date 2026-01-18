import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { ClientResponseDto } from '../dtos/client-response.dto';
import type {
  ICreateClientPort,
  IFindClientByIdPort,
  IFindAllClientsPort,
  IUpdateClientPort,
  IDeleteClientPort,
  IChangePasswordPort,
} from '../../presentation/ports';
import {
  CREATE_CLIENT_PORT,
  FIND_CLIENT_BY_ID_PORT,
  FIND_ALL_CLIENTS_PORT,
  UPDATE_CLIENT_PORT,
  DELETE_CLIENT_PORT,
  CHANGE_PASSWORD_PORT,
} from '../../presentation/ports';
import { ClientMapper } from '../../infra/mappers/client.mapper';

@ApiTags('clients')
@Controller('v1/clients')
export class ClientController {
  constructor(
    @Inject(CREATE_CLIENT_PORT)
    private readonly createClientPort: ICreateClientPort,
    @Inject(FIND_CLIENT_BY_ID_PORT)
    private readonly findClientByIdPort: IFindClientByIdPort,
    @Inject(FIND_ALL_CLIENTS_PORT)
    private readonly findAllClientsPort: IFindAllClientsPort,
    @Inject(UPDATE_CLIENT_PORT)
    private readonly updateClientPort: IUpdateClientPort,
    @Inject(DELETE_CLIENT_PORT)
    private readonly deleteClientPort: IDeleteClientPort,
    @Inject(CHANGE_PASSWORD_PORT)
    private readonly changePasswordPort: IChangePasswordPort,
    private readonly clientMapper: ClientMapper,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo cliente' })
  @ApiResponse({ status: 201, description: 'Cliente criado com sucesso', type: ClientResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    const client = await this.createClientPort.execute(createClientDto);
    return this.clientMapper.toResponseDto(client);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  async findAll(
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ): Promise<{ data: ClientResponseDto[]; total: number }> {
    const { data, total } = await this.findAllClientsPort.execute(skip, take);
    return {
      data: this.clientMapper.toResponseDtoList(data),
      total,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um cliente' })
  @ApiResponse({ status: 200, description: 'Detalhes do cliente', type: ClientResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async findOne(@Param('id') id: string): Promise<ClientResponseDto> {
    const client = await this.findClientByIdPort.execute(id);
    return this.clientMapper.toResponseDto(client);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  @ApiResponse({ status: 200, description: 'Cliente atualizado com sucesso', type: ClientResponseDto })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<ClientResponseDto> {
    const client = await this.updateClientPort.execute(id, updateClientDto);
    return this.clientMapper.toResponseDto(client);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar cliente (soft delete)' })
  @ApiResponse({ status: 200, description: 'Cliente deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.deleteClientPort.execute(id);
    return { message: 'Cliente deletado com sucesso' };
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Alterar senha do cliente' })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou senha atual incorreta' })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.changePasswordPort.execute(id, changePasswordDto);
  }
}

