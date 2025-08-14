import { SignUpDto } from "../dtos/auth/requests/signup.dto";
import { plainToInstance } from "class-transformer";
import { UserDto } from "../dtos/auth/responses/user.dto";
import { Conflict, Unauthorized } from "http-errors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { SignInDto } from "../dtos/auth/requests/signin.dto";

const secretKey = process.env.SECRET_KEY || "";

export class AuthService {
  static async signup(body: SignUpDto): Promise<UserDto> {
    try {
      const password = await bcrypt.hash(body.password, 10);
      const user = await prisma.user.create({
        data: { ...body, password: password },
      });

      return plainToInstance(UserDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw new Conflict("User with this email already exists. ");
        }
      }
      throw e;
    }
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
    try {
      const token = jwt.sign({ email }, secretKey, { expiresIn: "15m" });

      await prisma.user.update({
        where: { email },
        data: {
          resetPasswordToken: token,
        },
      });

      return token;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          throw new Conflict("User with this email not exists.");
        }
      }
      throw e;
    }
  }

  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    const payload: any = jwt.verify(token, secretKey, (err, payload) => {
      if (err) throw err;

      return payload;
    });
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { email: payload.email, resetPasswordToken: token },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          throw new Conflict("Password reset failed: user not found with this token");
        }
      }
      throw e;
    }
  }
}
