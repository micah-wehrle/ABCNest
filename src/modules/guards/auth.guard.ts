import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // can use this to verify the auth stuff. We'll need an auth service to register a user and then validate if the auto token isn't expired
    console.log(request.headers);

    return true;
  }
}
