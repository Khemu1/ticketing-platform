import { ROLES_KEY } from "@/decorators/roles.decorator";
import { RequestWithUser, Roles } from "@/types";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "@auth/auth/auth.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedRoles = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowedRoles) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const foundUser = await this.userService.doesUserWithRoleExist(
      request.user.user_id,
      allowedRoles,
    );
    return allowedRoles.includes(foundUser.role);
  }
}
