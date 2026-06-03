"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourtDatesModule = void 0;
const common_1 = require("@nestjs/common");
const court_dates_service_1 = require("./court-dates.service");
const court_dates_controller_1 = require("./court-dates.controller");
const prisma_service_1 = require("../prisma.service");
const workflow_module_1 = require("../workflow/workflow.module");
const audit_module_1 = require("../audit/audit.module");
let CourtDatesModule = class CourtDatesModule {
};
exports.CourtDatesModule = CourtDatesModule;
exports.CourtDatesModule = CourtDatesModule = __decorate([
    (0, common_1.Module)({
        imports: [workflow_module_1.WorkflowModule, audit_module_1.AuditModule],
        controllers: [court_dates_controller_1.CourtDatesController],
        providers: [court_dates_service_1.CourtDatesService, prisma_service_1.PrismaService],
    })
], CourtDatesModule);
//# sourceMappingURL=court-dates.module.js.map