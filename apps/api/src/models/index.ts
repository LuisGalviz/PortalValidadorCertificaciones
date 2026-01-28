import { Causal } from './Causal.js';
import { ConstructionCompany } from './ConstructionCompany.js';
import { InspectionTypeList } from './InspectionTypeList.js';
import { Inspector } from './Inspector.js';
import { Jobs } from './Jobs.js';
import { Oia } from './Oia.js';
import { OiaUsers } from './OiaUsers.js';
import { Order } from './Order.js';
import { Permission } from './Permission.js';
import { Report } from './Report.js';
import { ReportFile } from './ReportFile.js';
import { User } from './User.js';

// User associations
User.hasOne(Permission, { foreignKey: 'userId', as: 'permission' });
Permission.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(OiaUsers, { foreignKey: 'userId', as: 'oiaUser' });
OiaUsers.belongsTo(User, { foreignKey: 'userId' });

// Oia associations
Oia.hasMany(OiaUsers, { foreignKey: 'oiaId', as: 'oiaUsers' });
OiaUsers.belongsTo(Oia, { foreignKey: 'oiaId' });

Oia.hasMany(Inspector, { foreignKey: 'oiaId', as: 'inspectors' });
Inspector.belongsTo(Oia, { foreignKey: 'oiaId', as: 'oia' });

Oia.hasMany(Report, { foreignKey: 'oiaId', as: 'reports' });
Report.belongsTo(Oia, { foreignKey: 'oiaId', as: 'oia' });

// Inspector associations
Inspector.hasMany(Report, { foreignKey: 'inspectorId', as: 'reports' });
Report.belongsTo(Inspector, { foreignKey: 'inspectorId', as: 'inspector' });

// Report associations
Report.belongsTo(User, { foreignKey: 'userId', as: 'reviewer' });
Report.hasMany(ReportFile, { foreignKey: 'reportId', as: 'files' });
ReportFile.belongsTo(Report, { foreignKey: 'reportId' });

Report.belongsTo(Causal, { foreignKey: 'causalId', as: 'causal' });
Causal.hasMany(Report, { foreignKey: 'causalId' });

Report.belongsTo(InspectionTypeList, { foreignKey: 'inspectionType', as: 'inspectionTypeData' });

Report.belongsTo(ConstructionCompany, {
  foreignKey: 'constructionCompanyId',
  as: 'constructionCompany',
});
ConstructionCompany.hasMany(Report, { foreignKey: 'constructionCompanyId' });

Report.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(Report, { foreignKey: 'orderId' });

export {
  User,
  Permission,
  Oia,
  OiaUsers,
  Inspector,
  Report,
  ReportFile,
  ConstructionCompany,
  Order,
  Jobs,
  Causal,
  InspectionTypeList,
};

export { sequelize } from '../config/database.js';
