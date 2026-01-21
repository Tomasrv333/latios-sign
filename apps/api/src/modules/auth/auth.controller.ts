import { Controller, Post, Body, UnauthorizedException, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private prisma: PrismaService) { }

    @Public()
    @Post('login')
    async login(@Body() body: any) {
        // validateUser requires (email, password)
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Get('me')
    async getProfile(@Request() req) {
        // req.user is populated by JwtAuthGuard
        const userId = req.user.userId;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true, company: true }
        });
        return user;
    }
}
