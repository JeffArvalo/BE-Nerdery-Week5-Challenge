import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignInDto {
	@IsEmail()
	readonly email!: string;
	
	@IsString()
	@MinLength(4)
	readonly password!: string;
}
