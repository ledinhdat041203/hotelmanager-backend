// import { AppAbility } from '@/modules/casl/casl-ability.factory/casl-ability.factory';
// import { Request } from 'express';
// import { Action, Subject, UserPayload } from '../types';

// interface IPolicyHandler {
//   handle(ability: AppAbility): boolean;
// }

// type PolicyHandlerCallback = (ability: AppAbility) => boolean;

// export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

// //DEPARTMENT
// export class ReadDeptPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.READ, Subject.DEPARTMENT);
//   }
// }

// export class CreateDeptPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     const canUpdateWithCondition = ability.can(
//       Action.CREATE,
//       Subject.DEPARTMENT,
//     );

//     if (canUpdateWithCondition) {
//       return true;
//     }

//     return false;
//   }
// }

// export class DeleteDeptPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.DELETE, Subject.DEPARTMENT);
//   }
// }

// export class UpdateDeptPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     const canUpdateWithoutCondition = ability.rules.some(
//       (rule) =>
//         rule.action === Action.UPDATE &&
//         rule.subject === Subject.DEPARTMENT &&
//         !rule.conditions,
//     );

//     if (canUpdateWithoutCondition) {
//       return true;
//     }

//     const canUpdateWithCondition = ability.can(
//       Action.UPDATE,
//       Subject.DEPARTMENT,
//     );

//     if (canUpdateWithCondition) {
//       return true;
//     }

//     return false;
//   }
// }

// //ROLE
// export class CreateRolePolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.CREATE, Subject.ROLE);
//   }
// }

// export class UpdateRolePolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.UPDATE, Subject.ROLE);
//   }
// }

// export class DeleteRolePolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.DELETE, Subject.ROLE);
//   }
// }

// //USER
// export class ReadUserPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.READ, Subject.USER);
//   }
// }

// export class CreateUserPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.CREATE, Subject.USER);
//   }
// }

// export class UpdateUserPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.UPDATE, Subject.USER);
//   }
// }

// export class DeleteUserPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.DELETE, Subject.USER);
//   }
// }

// //Report config
// export class CreateReportConfigPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.CREATE, Subject.REPORT_CONFIG);
//   }
// }

// export class UpdateReportConfigPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.UPDATE, Subject.REPORT_CONFIG);
//   }
// }

// export class ReadReportConfigPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.READ, Subject.REPORT_CONFIG);
//   }
// }

// export class DeleteReportConfigPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.DELETE, Subject.REPORT_CONFIG);
//   }
// }

// //Report
// export class CreateReportPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.CREATE, Subject.REPORT);
//   }
// }

// export class ApproveReportPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return (
//       ability.can(Action.CREATE, Subject.REPORT) ||
//       ability.can(Action.UPDATE, Subject.REPORT)
//     );
//   }
// }

// export class UpdateReportPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.UPDATE, Subject.REPORT);
//   }
// }

// export class ReadReportPolicyHandler implements IPolicyHandler {
//   handle(ability: AppAbility) {
//     return ability.can(Action.READ, Subject.REPORT);
//   }
// }
