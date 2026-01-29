import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface ReportFileAttributes {
  id: number;
  reportId: number;
  name: string;
  type?: string | null;
  path?: string | null;
  fileTypeCode?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReportFileCreationAttributes
  extends Optional<ReportFileAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class ReportFile
  extends Model<ReportFileAttributes, ReportFileCreationAttributes>
  implements ReportFileAttributes
{
  declare id: number;
  declare reportId: number;
  declare name: string;
  declare type: string | null;
  declare path: string | null;
  declare fileTypeCode: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ReportFile.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fileTypeCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'reportFile',
    tableName: 'report_files',
  }
);
