"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("./prisma.service");
const auth_module_1 = require("./auth/auth.module");
const cases_module_1 = require("./cases/cases.module");
const travel_module_1 = require("./travel/travel.module");
const documents_module_1 = require("./documents/documents.module");
const sessions_module_1 = require("./sessions/sessions.module");
const ai_module_1 = require("./ai/ai.module");
const workflow_module_1 = require("./workflow/workflow.module");
const assignment_module_1 = require("./assignment/assignment.module");
const notifications_module_1 = require("./notifications/notifications.module");
const users_module_1 = require("./users/users.module");
const audit_module_1 = require("./audit/audit.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            auth_module_1.AuthModule,
            cases_module_1.CasesModule,
            travel_module_1.TravelModule,
            documents_module_1.DocumentsModule,
            sessions_module_1.SessionsModule,
            ai_module_1.AiModule,
            workflow_module_1.WorkflowModule,
            assignment_module_1.AssignmentModule,
            notifications_module_1.NotificationsModule,
            users_module_1.UsersModule,
            audit_module_1.AuditModule,
        ],
        providers: [prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map