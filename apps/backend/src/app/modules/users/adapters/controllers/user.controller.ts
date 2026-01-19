import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, Inject, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { FindUserByIdUseCase } from '../../presentation/use-case/find-user-by-id.ucase';
import type {
  ICreateUserPort,
  IFindUserByIdPort,
  IFindAllUsersPort,
  IUpdateUserPort,
  IDeleteUserPort,
  IChangePasswordPort,
} from '../../presentation/ports';
import {
  CREATE_USER_PORT,
  FIND_USER_BY_ID_PORT,
  FIND_ALL_USERS_PORT,
  UPDATE_USER_PORT,
  DELETE_USER_PORT,
  CHANGE_PASSWORD_PORT,
} from '../../presentation/ports';
import { UserMapper } from '../../infra/mappers/user.mapper';
import { JwtAuthGuard } from '../../../../../common/guards/jwt-auth.guard';

@ApiTags('👥 Usuários')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('v1/users')
export class UserController {
  constructor(
    @Inject(CREATE_USER_PORT)
    private readonly createUserPort: ICreateUserPort,
    @Inject(FIND_USER_BY_ID_PORT)
    private readonly findUserByIdPort: IFindUserByIdPort,
    @Inject(FIND_ALL_USERS_PORT)
    private readonly findAllUsersPort: IFindAllUsersPort,
    @Inject(UPDATE_USER_PORT)
    private readonly updateUserPort: IUpdateUserPort,
    @Inject(DELETE_USER_PORT)
    private readonly deleteUserPort: IDeleteUserPort,
    @Inject(CHANGE_PASSWORD_PORT)
    private readonly changePasswordPort: IChangePasswordPort,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly UserMapper: UserMapper,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserPort.execute(createUserDto);
    return this.UserMapper.toResponseDto(user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários' })
  async findAll(
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ): Promise<{ data: UserResponseDto[]; total: number }> {
    const { data, total } = await this.findAllUsersPort.execute(skip, take);
    return {
      data: this.UserMapper.toResponseDtoList(data),
      total,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um usuário' })
  @ApiResponse({ status: 200, description: 'Detalhes do usuário', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.findUserByIdUseCase.execute(id);
    return this.UserMapper.toResponseDto(user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.updateUserPort.execute(id, updateUserDto);
    return this.UserMapper.toResponseDto(user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar usuário (soft delete)' })
  @ApiResponse({ status: 200, description: 'Usuário deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.deleteUserPort.execute(id);
    return { message: 'Usuário deletado com sucesso' };
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

