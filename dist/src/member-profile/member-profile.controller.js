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
exports.MemberProfileController = void 0;
const common_1 = require("@nestjs/common");
const member_profile_service_1 = require("./member-profile.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let MemberProfileController = class MemberProfileController {
    memberProfileService;
    constructor(memberProfileService) {
        this.memberProfileService = memberProfileService;
    }
    getProfile(req) {
        return this.memberProfileService.getProfile(req.user.userId);
    }
    updateProfile(req, dto) {
        return this.memberProfileService.updateProfile(req.user.userId, dto);
    }
};
exports.MemberProfileController = MemberProfileController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MemberProfileController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MemberProfileController.prototype, "updateProfile", null);
exports.MemberProfileController = MemberProfileController = __decorate([
    (0, common_1.Controller)('member-profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [member_profile_service_1.MemberProfileService])
], MemberProfileController);
//# sourceMappingURL=member-profile.controller.js.map