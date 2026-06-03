"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginCommandHandler = void 0;
const user_not_found_exception_1 = require("../../domain/exceptions/user-not-found.exception");
const email_vo_1 = require("../../domain/value-objects/email.vo");
const invalid_credentials_exception_1 = require("../exceptions/invalid-credentials.exception");
class LoginCommandHandler {
    constructor(userRepository, passwordHasher, jwtTokenGenerator) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.jwtTokenGenerator = jwtTokenGenerator;
    }
    async execute(command) {
        const email = email_vo_1.Email.create(command.email);
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new user_not_found_exception_1.UserNotFoundException(email.value);
        }
        const isPasswordValid = await this.passwordHasher.compare(command.password, user.passwordHash.value);
        if (!isPasswordValid) {
            throw new invalid_credentials_exception_1.InvalidCredentialsException();
        }
        if (!user.status.isActive()) {
            throw new invalid_credentials_exception_1.InvalidCredentialsException();
        }
        const accessToken = await this.jwtTokenGenerator.generateToken({
            sub: user.id.value,
            email: user.email.value,
            role: user.role.value,
        });
        return {
            accessToken,
            tokenType: 'Bearer',
        };
    }
}
exports.LoginCommandHandler = LoginCommandHandler;
