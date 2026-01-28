import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface ReportFileAttributes {
  id: number;
  reportId: number;
  fileType: string;
  fileName: string;
  fileUrl: string;
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
  declare fileType: string;
  declare fileName: string;
  declare fileUrl: string;
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
    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'reportFile',
    tableName: 'reportFiles',
  }
);
