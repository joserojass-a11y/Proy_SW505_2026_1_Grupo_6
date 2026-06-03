"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserProfileQueryHandler = void 0;
const user_not_found_exception_1 = require("../../domain/exceptions/user-not-found.exception");
const user_id_vo_1 = require("../../domain/value-objects/user-id.vo");
class GetUserProfileQueryHandler {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(query) {
        const user = await this.userRepository.findById(user_id_vo_1.UserId.create(query.userId));
        if (!user) {
            throw new user_not_found_exception_1.UserNotFoundException(query.userId);
        }
        return {
            id: user.id.value,
            email: user.email.value,
            fullName: user.fullName.value,
            role: user.role.value,
            status: user.status.value,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };
    }
}
exports.GetUserProfileQueryHandler = GetUserProfileQueryHandler;
