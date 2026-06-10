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
exports.CourtDatesController = void 0;
const common_1 = require("@nestjs/common");
const court_dates_service_1 = require("./court-dates.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CourtDatesController = class CourtDatesController {
    courtDatesService;
    constructor(courtDatesService) {
        this.courtDatesService = courtDatesService;
    }
    create(req, dto) {
        return this.courtDatesService.create(dto.caseId, dto.lawyerId, dto, req.user.userId || req.user.sub);
    }
    findByCase(caseId) {
        return this.courtDatesService.findByCase(caseId);
    }
    findByLawyer(req) {
        return this.courtDatesService.findByLawyer(req.user.userId || req.user.sub);
    }
    findUpcoming(req) {
        return this.courtDatesService.findUpcomingByUser(req.user.sub || req.user.userId);
    }
    updateStatus(id, body, req) {
        return this.courtDatesService.updateStatus(id, body.status, req.user.userId || req.user.sub, body.notes);
    }
};
exports.CourtDatesController = CourtDatesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CourtDatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('case/:caseId'),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CourtDatesController.prototype, "findByCase", null);
__decorate([
    (0, common_1.Get)('lawyer'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CourtDatesController.prototype, "findByLawyer", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CourtDatesController.prototype, "findUpcoming", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CourtDatesController.prototype, "updateStatus", null);
exports.CourtDatesController = CourtDatesController = __decorate([
    (0, common_1.Controller)('court-dates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [court_dates_service_1.CourtDatesService])
], CourtDatesController);
//# sourceMappingURL=court-dates.controller.js.map