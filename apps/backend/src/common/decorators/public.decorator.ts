import { SetMetadata } from '@nestjs/common';

/**
 * @Public() - Marca uma rota como pública (não requer autenticação)
 * 
 * Uso:
 * @Post('login')
 * @Public()
 * async login() { ... }
 */
export const Public = () => SetMetadata('isPublic', true);
