"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegalAssociatesModule = void 0;
const common_1 = require("@nestjs/common");
const legal_associates_service_1 = require("./legal-associates.service");
const legal_associates_controller_1 = require("./legal-associates.controller");
const prisma_service_1 = require("../prisma.service");
let LegalAssociatesModule = class LegalAssociatesModule {
};
exports.LegalAssociatesModule = LegalAssociatesModule;
exports.LegalAssociatesModule = LegalAssociatesModule = __decorate([
    (0, common_1.Module)({
        controllers: [legal_associates_controller_1.LegalAssociatesController],
        providers: [legal_associates_service_1.LegalAssociatesService, prisma_service_1.PrismaService],
    })
], LegalAssociatesModule);
//# sourceMappingURL=legal-associates.module.js.map