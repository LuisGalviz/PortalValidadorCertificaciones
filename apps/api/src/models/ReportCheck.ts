import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface ReportCheckAttributes {
  id: number;
  reportId: number;
  checkId: number;
  review?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReportCheckCreationAttributes
  extends Optional<ReportCheckAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class ReportCheck
  extends Model<ReportCheckAttributes, ReportCheckCreationAttributes>
  implements ReportCheckAttributes
{
  declare id: number;
  declare reportId: number;
  declare checkId: number;
  declare review: boolean | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ReportCheck.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reportId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    checkId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    review: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'reportCheck',
    tableName: 'report_checks',
  }
);
