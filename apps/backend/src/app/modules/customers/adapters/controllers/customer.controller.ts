import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
  ParseUUIDPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../authentication/infra/guards/jwt-auth.guard';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';
import { CustomerResponseDto } from '../dtos/customer-response.dto';
import { CustomerMapper } from '../../infra/mappers/customer.mapper';
import {
  CreateCustomerUseCase,
  FindCustomerByIdUseCase,
  FindAllCustomersUseCase,
  UpdateCustomerUseCase,
  DeleteCustomerUseCase,
} from '../../presentation/use-cases';

@ApiTags('👥 Clientes')
@Controller('v1/customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class CustomerController {
  private readonly logger = new Logger(CustomerController.name);

  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly findCustomerByIdUseCase: FindCustomerByIdUseCase,
    private readonly findAllCustomersUseCase: FindAllCustomersUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
    private readonly customerMapper: CustomerMapper,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo cliente',
    description: 'Cria um novo registro de cliente associado ao usuário autenticado',
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente criado com sucesso',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async create(
    @Req() request: any,
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    try {
      const userId = request.user.id;
      this.logger.log(`📝 Criando cliente para usuário: ${userId}`);

      const customer = await this.createCustomerUseCase.execute(userId, createCustomerDto);
      return this.customerMapper.toResponseDto(customer);
    } catch (error) {
      this.logger.error(`❌ Erro ao criar cliente: ${error}`);
      throw error;
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os clientes',
    description: 'Retorna uma lista paginada de clientes com filtros opcionais',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Número de registros a pular (default: 0)',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Número de registros a retornar (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Valor a buscar (ex: "Active", "João", "Tech")',
  })
  @ApiQuery({
    name: 'searchField',
    required: false,
    type: String,
    enum: ['status', 'name', 'company'],
    description: 'Campo onde buscar (default: "status")',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/CustomerResponseDto' },
        },
        total: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async findAll(
    @Query('skip') skip = 0,
    @Query('take') take = 10,
    @Query('search') search?: string,
    @Query('searchField') searchField = 'status',
  ): Promise<{ data: CustomerResponseDto[]; total: number }> {
    try {
      this.logger.log(`📋 Listando clientes: skip=${skip}, take=${take}, search=${search}, searchField=${searchField}`);

      const result = await this.findAllCustomersUseCase.execute(skip, take, search, searchField);
      return {
        data: this.customerMapper.toResponseDtoList(result.data),
        total: result.total,
      };
    } catch (error) {
      this.logger.error(`❌ Erro ao listar clientes: ${error}`);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter detalhes de um cliente',
    description: 'Retorna os dados completos de um cliente específico',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID do cliente (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (deve ser UUID)',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<CustomerResponseDto> {
    try {
      this.logger.log(`🔍 Buscando cliente: ${id}`);

      const customer = await this.findCustomerByIdUseCase.execute(id);
      if (!customer) {
        throw new NotFoundException('Cliente não encontrado');
      }

      return this.customerMapper.toResponseDto(customer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`❌ Erro ao buscar cliente: ${error}`);
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar cliente',
    description: 'Atualiza os dados de um cliente existente',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID do cliente (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente atualizado com sucesso',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (deve ser UUID)',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    try {
      this.logger.log(`✏️ Atualizando cliente: ${id}`);

      const customer = await this.updateCustomerUseCase.execute(id, updateCustomerDto);
      if (!customer) {
        throw new NotFoundException('Cliente não encontrado');
      }

      return this.customerMapper.toResponseDto(customer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`❌ Erro ao atualizar cliente: ${error}`);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deletar cliente',
    description: 'Remove um cliente (soft delete)',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'ID do cliente (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente deletado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido (deve ser UUID)',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autenticado',
  })
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string }> {
    try {
      this.logger.log(`🗑️ Deletando cliente: ${id}`);

      await this.deleteCustomerUseCase.execute(id);
      return { message: '✅ Cliente deletado com sucesso' };
    } catch (error) {
      this.logger.error(`❌ Erro ao deletar cliente: ${error}`);
      throw error;
    }
  }
}
