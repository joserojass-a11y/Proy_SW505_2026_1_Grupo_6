"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterOwnerCommandHandler = void 0;
const crypto_1 = require("crypto");
const user_entity_1 = require("../../domain/entities/user.entity");
const user_already_exists_exception_1 = require("../../domain/exceptions/user-already-exists.exception");
const email_vo_1 = require("../../domain/value-objects/email.vo");
const full_name_vo_1 = require("../../domain/value-objects/full-name.vo");
const user_id_vo_1 = require("../../domain/value-objects/user-id.vo");
const password_hash_vo_1 = require("../../domain/value-objects/password-hash.vo");
class RegisterOwnerCommandHandler {
    constructor(userRepository, passwordHasher) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }
    async execute(command) {
        const email = email_vo_1.Email.create(command.email);
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new user_already_exists_exception_1.UserAlreadyExistsException(email.value);
        }
        const passwordHash = await this.passwordHasher.hash(command.password);
        const user = user_entity_1.User.create({
            id: user_id_vo_1.UserId.create((0, crypto_1.randomUUID)()),
            email,
            passwordHash: password_hash_vo_1.PasswordHash.create(passwordHash),
            fullName: full_name_vo_1.FullName.create(command.fullName),
            role: 'OWNER',
        });
        const savedUser = await this.userRepository.save(user);
        return { id: savedUser.id.value };
    }
}
exports.RegisterOwnerCommandHandler = RegisterOwnerCommandHandler;
