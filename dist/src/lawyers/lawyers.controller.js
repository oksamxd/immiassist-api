"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LawyersController = void 0;
const common_1 = require("@nestjs/common");
const lawyers_service_1 = require("./lawyers.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let LawyersController = class LawyersController {
    lawyersService;
    constructor(lawyersService) {
        this.lawyersService = lawyersService;
    }
    findAll() {
        return this.lawyersService.findAll();
    }
    findAvailable() {
        return this.lawyersService.findAvailable();
    }
    getProfile(req) {
        return this.lawyersService.getProfile(req.user.userId);
    }
    updateAvailability(req, available) {
        return this.lawyersService.updateAvailability(req.user.userId, available);
    }
    updateProfile(req, dto) {
        return this.lawyersService.updateProfile(req.user.userId, dto);
    }
};
exports.LawyersController = LawyersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('available'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "findAvailable", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('availability'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('available')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "updateAvailability", null);
__decorate([
    (0, common_1.Patch)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "updateProfile", null);
exports.LawyersController = LawyersController = __decorate([
    (0, common_1.Controller)('lawyers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [lawyers_service_1.LawyersService])
], LawyersController);
//# sourceMappingURL=lawyers.controller.js.map