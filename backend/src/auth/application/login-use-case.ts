import { InvalidCredentialsError } from "./errors/invalid-credentials-error.js";
import type {
  IssuedToken,
  TokenIssuer,
} from "./ports/token-issuer.js";
import type { UserAuthenticator } from "./ports/user-authenticator.js";

export interface LoginCommand {
  username: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private readonly users: UserAuthenticator,
    private readonly tokens: TokenIssuer,
  ) {}

  execute(command: LoginCommand): IssuedToken {
    const user = this.users.authenticate(command.username, command.password);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    return this.tokens.issue(user);
  }
}
