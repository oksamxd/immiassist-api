"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberProfileModule = void 0;
const common_1 = require("@nestjs/common");
const member_profile_service_1 = require("./member-profile.service");
const member_profile_controller_1 = require("./member-profile.controller");
const prisma_service_1 = require("../prisma.service");
let MemberProfileModule = class MemberProfileModule {
};
exports.MemberProfileModule = MemberProfileModule;
exports.MemberProfileModule = MemberProfileModule = __decorate([
    (0, common_1.Module)({
        controllers: [member_profile_controller_1.MemberProfileController],
        providers: [member_profile_service_1.MemberProfileService, prisma_service_1.PrismaService],
    })
], MemberProfileModule);
//# sourceMappingURL=member-profile.module.js.map