import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { SignUpDto } from "../dtos/auth/requests/signup.dto";
import { validate } from "class-validator";
import { AuthService } from "../services/auth.service";
import { SignInDto } from "../dtos/auth/requests/signin.dto";
import { UserDto } from "../dtos/auth/responses/user.dto";
import { ForgotPasswordDto } from "../dtos/auth/requests/forgot-password.dto";

declare module "express-session" {
  interface SessionData {
    user: UserDto;
  }
}

export async function signup(req: Request, res: Response): Promise<void> {
  const dto = plainToInstance(SignUpDto, req.body);
  const errors = await validate(dto);

  if (errors.length > 0) {
    res.status(400).send({ message: "Validation failed", details: errors });
    return;
  }

  try {
    const result = await AuthService.signup(dto);

    res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;

      res.status(statusCode).json({
        message: error.message || "Internal server error",
        name: error.name,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        name: "UnknownError",
      });
    }
  }
}

export async function signin(req: Request, res: Response): Promise<void> {
  const dto = plainToInstance(SignInDto, req.body);
  const errors = await validate(dto);

  if (errors.length > 0) {
    res.status(400).send({ message: "Validation failed", details: errors });
    return;
  }

  try {
    if (req.session.user) {
      res
        .status(200)
        .json(`A session already exist: ${req.session.user.email}`);
      return;
    }
    const result = await AuthService.signin(dto);
    req.session.user = result;
    res.status(200).json(result);
    return;
  } catch (error: unknown) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;

      res.status(statusCode).json({
        message: error.message || "Internal server error",
        name: error.name,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        name: "UnknownError",
      });
    }
  }
}

export async function signout(req: Request, res: Response): Promise<void> {
  try {
    if (req.session.user) {
      req.session.destroy((err) => {
        if (err) {
          res.status(500).json({
            message: "Failed to destroy session",
            name: "SessionError",
          });
        } else {
          res.status(200).json({ message: "Successfully signed out" });
        }
      });
    } else {
      res.status(404).json({ message: "Session not found" });
    }
    return;
  } catch (error: unknown) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;

      res.status(statusCode).json({
        message: error.message || "Internal server error",
        name: error.name,
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        name: "UnknownError",
      });
    }
  }
}

export async function forgotPassword(
  req: Request,
  res: Response
): Promise<void> {
  const dto = plainToInstance(ForgotPasswordDto, req.body);
  const errors = await validate(dto);

  if (errors.length > 0) {
    res.status(400).send({ message: "Validation failed", details: errors });
    return;
  }

  const userToken = await AuthService.forgotPassword(dto.email);
  res
    .status(200)
    .json({ message: "Password reset token generated.", token: userToken });
}

export async function resetPassword(
  req: Request,
  res: Response
): Promise<void> {
  const { token } = req.query;
  const { password } = req.body;
  try {
    await AuthService.resetPassword(token as string, password);
    res.status(200).json({ message: "Password reset successful." });
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Invalid or expired token.",
      name: error.name || "Error",
    });
  }
}
