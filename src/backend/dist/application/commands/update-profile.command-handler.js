"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileCommandHandler = void 0;
const user_not_found_exception_1 = require("../../domain/exceptions/user-not-found.exception");
const user_already_exists_exception_1 = require("../../domain/exceptions/user-already-exists.exception");
const email_vo_1 = require("../../domain/value-objects/email.vo");
const full_name_vo_1 = require("../../domain/value-objects/full-name.vo");
const user_id_vo_1 = require("../../domain/value-objects/user-id.vo");
class UpdateProfileCommandHandler {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(command) {
        const userId = user_id_vo_1.UserId.create(command.userId);
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new user_not_found_exception_1.UserNotFoundException(command.userId);
        }
        if (command.email) {
            const nextEmail = email_vo_1.Email.create(command.email);
            const emailAlreadyInUse = await this.userRepository.existsByEmail(nextEmail, userId);
            if (emailAlreadyInUse) {
                throw new user_already_exists_exception_1.UserAlreadyExistsException(nextEmail.value);
            }
        }
        user.updateProfile({
            email: command.email ? email_vo_1.Email.create(command.email) : undefined,
            fullName: command.fullName ? full_name_vo_1.FullName.create(command.fullName) : undefined,
        });
        await this.userRepository.update(user);
    }
}
exports.UpdateProfileCommandHandler = UpdateProfileCommandHandler;
