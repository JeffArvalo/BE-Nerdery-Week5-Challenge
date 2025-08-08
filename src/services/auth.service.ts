import { SignUpDto } from "../dtos/auth/requests/signup.dto";
import { plainToInstance } from "class-transformer";
import { UserDto } from "../dtos/auth/responses/user.dto";
import { Conflict, Unauthorized } from "http-errors";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "../prisma";
import { SignInDto } from "../dtos/auth/requests/signin.dto";

export class AuthService {
  static async signup(body: SignUpDto): Promise<UserDto> {
    const exists = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (exists) {
      throw new Conflict("User with this email already exists");
    }
    const password = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: { ...body, password: password },
    });

    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  static async signin(body: SignInDto): Promise<UserDto> {
    const user = await prisma.user.findUnique({ where: { email: body.email } });

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new Unauthorized("Invalid email or password");
    }

    return plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }

  static async forgotPassword(email: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Conflict("User with this email not exists");
    }

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: token,
      },
    });

    return token;
  }

  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!user) throw new Unauthorized("Invalid or expired token");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
      },
    });
  }
}
