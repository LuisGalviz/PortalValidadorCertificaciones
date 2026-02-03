import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

export const OiaFileTypeCode = {
  ONAC: 'ONAC',
  CRT: 'CRT',
} as const;

export type OiaFileTypeCodeType = (typeof OiaFileTypeCode)[keyof typeof OiaFileTypeCode];

interface OiaFileAttributes {
  id: number;
  oiaId: number;
  name: string;
  type: string;
  path?: string | null;
  fileTypeCode: OiaFileTypeCodeType;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OiaFileCreationAttributes
  extends Optional<OiaFileAttributes, 'id' | 'path' | 'createdAt' | 'updatedAt'> {}

export class OiaFile
  extends Model<OiaFileAttributes, OiaFileCreationAttributes>
  implements OiaFileAttributes
{
  declare id: number;
  declare oiaId: number;
  declare name: string;
  declare type: string;
  declare path: string | null;
  declare fileTypeCode: OiaFileTypeCodeType;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

OiaFile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    oiaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'oia',
        key: 'id',
      },
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
    modelName: 'oiaFile',
    tableName: 'oia_files',
    freezeTableName: true,
  }
);
