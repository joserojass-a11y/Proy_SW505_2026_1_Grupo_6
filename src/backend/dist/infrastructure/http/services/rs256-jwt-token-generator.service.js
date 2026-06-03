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
exports.Rs256JwtTokenGeneratorService = void 0;
const fs_1 = require("fs");
const jwt = __importStar(require("jsonwebtoken"));
function loadPrivateKey() {
    const inlineKey = process.env.JWT_PRIVATE_KEY;
    if (inlineKey) {
        return inlineKey.replace(/\\n/g, '\n');
    }
    const keyPath = process.env.JWT_PRIVATE_KEY_PATH;
    if (keyPath) {
        return (0, fs_1.readFileSync)(keyPath, 'utf8');
    }
    throw new Error('JWT private key is not configured');
}
class Rs256JwtTokenGeneratorService {
    async generateToken(payload) {
        const privateKey = loadPrivateKey();
        const expiresIn = process.env.JWT_EXPIRES_IN ?? '1h';
        const issuer = process.env.JWT_ISSUER;
        const audience = process.env.JWT_AUDIENCE;
        const signOptions = {
            algorithm: 'RS256',
            expiresIn: expiresIn,
            issuer,
            audience,
        };
        return jwt.sign(payload, privateKey, signOptions);
    }
}
exports.Rs256JwtTokenGeneratorService = Rs256JwtTokenGeneratorService;
