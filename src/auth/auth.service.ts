import {
    Injectable,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { I18nContext } from 'nestjs-i18n';

const SALT_ROUNDS = 10;
const EXPIRES_IN = '1h';
const TOKEN_TTL = 3600;

@Injectable()
export class AuthService {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: any,
        private readonly jwtService: JwtService,
        @Inject('TOKEN_BLACKLIST_SERVICE')
        private readonly authUtils: any,
    ) { }

    async register(registerDto: RegisterDto) {
        const { username, email, password } = registerDto;

        const existingUser = await this.userRepository.findOne({
            where: [{ email }, { username }],
        });

        if (existingUser) {
            throw new BadRequestException(I18nContext.current()!.t('auth.EMAIL_OR_USERNAME_EXISTS'));
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const newUser = this.userRepository.create({
            username,
            email,
            password: hashedPassword,
        });

        await this.userRepository.save(newUser);

        return {
            message: I18nContext.current()!.t('auth.REGISTER_SUCCESS'),
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) throw new BadRequestException(I18nContext.current()!.t('auth.INVALID_CREDENTIALS'));

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new BadRequestException(I18nContext.current()!.t('auth.INVALID_CREDENTIALS'));

        const payload = { id: user.id, username: user.username };
        const token = this.jwtService.sign(payload, { expiresIn: EXPIRES_IN });

        return {
            message: I18nContext.current()!.t('auth.LOGIN_SUCCESS'),
            token,
        };
    }

    async getProfile(userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        return {
            message: I18nContext.current()!.t('auth.GET_PROFILE_SUCCESS'),
            user: plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
        };
    }

    async terminateSession(token?: string) {
        if (token) {
            const decoded = this.jwtService.decode(token) as any;
            const ttl = decoded?.exp ? Math.max(0, decoded.exp - Math.floor(Date.now() / 1000)) : TOKEN_TTL;
            await this.authUtils.revokeToken(token, ttl);
        }
        return {
            message: I18nContext.current()!.t('auth.SESSION_ENDED'),
        };
    }
}
