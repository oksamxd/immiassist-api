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
exports.LegalAssociatesController = void 0;
const common_1 = require("@nestjs/common");
const legal_associates_service_1 = require("./legal-associates.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let LegalAssociatesController = class LegalAssociatesController {
    legalAssociatesService;
    constructor(legalAssociatesService) {
        this.legalAssociatesService = legalAssociatesService;
    }
    findAll() {
        return this.legalAssociatesService.findAll();
    }
    findAvailable() {
        return this.legalAssociatesService.findAvailable();
    }
    getProfile(req) {
        return this.legalAssociatesService.getProfile(req.user.userId);
    }
    updateAvailability(req, available) {
        return this.legalAssociatesService.updateAvailability(req.user.userId, available);
    }
};
exports.LegalAssociatesController = LegalAssociatesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LegalAssociatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('available'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LegalAssociatesController.prototype, "findAvailable", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LegalAssociatesController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('availability'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('available')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", void 0)
], LegalAssociatesController.prototype, "updateAvailability", null);
exports.LegalAssociatesController = LegalAssociatesController = __decorate([
    (0, common_1.Controller)('legal-associates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [legal_associates_service_1.LegalAssociatesService])
], LegalAssociatesController);
//# sourceMappingURL=legal-associates.controller.js.map