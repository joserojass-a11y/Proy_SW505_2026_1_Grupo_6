"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const jwt = __importStar(require("jsonwebtoken"));
function loadPublicKey() {
    const inlineKey = process.env.JWT_PUBLIC_KEY;
    if (inlineKey) {
        return inlineKey.replace(/\\n/g, '\n');
    }
    const keyPath = process.env.JWT_PUBLIC_KEY_PATH;
    if (keyPath) {
        return (0, fs_1.readFileSync)(keyPath, 'utf8');
    }
    throw new Error('JWT public key is not configured');
}
let JwtAuthGuard = class JwtAuthGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authorizationHeader = request.headers.authorization;
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Missing bearer token');
        }
        const token = authorizationHeader.slice(7).trim();
        if (!token) {
            throw new common_1.UnauthorizedException('Missing bearer token');
        }
        try {
            const publicKey = loadPublicKey();
            const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
            if (!decoded?.sub || !decoded?.email || !decoded?.role) {
                throw new common_1.UnauthorizedException('Invalid token payload');
            }
            request.user = decoded;
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
