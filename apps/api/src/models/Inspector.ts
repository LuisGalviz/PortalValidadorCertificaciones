import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface InspectorAttributes {
  id: number;
  identification: number;
  name: string;
  nameOrganism: string;
  codeCertificate: string;
  certificateEffectiveDate?: Date | null;
  email?: string | null;
  phone?: number | null;
  userId?: number | null;
  operatingUnitId?: number | null;
  status: number;
  comment?: string | null;
  oiaId: number;
  active?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InspectorCreationAttributes
  extends Optional<InspectorAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Inspector
  extends Model<InspectorAttributes, InspectorCreationAttributes>
  implements InspectorAttributes
{
  declare id: number;
  declare identification: number;
  declare name: string;
  declare nameOrganism: string;
  declare codeCertificate: string;
  declare certificateEffectiveDate: Date | null;
  declare email: string | null;
  declare phone: number | null;
  declare userId: number | null;
  declare operatingUnitId: number | null;
  declare status: number;
  declare comment: string | null;
  declare oiaId: number;
  declare active: boolean | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Inspector.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    identification: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nameOrganism: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    codeCertificate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    certificateEffectiveDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    operatingUnitId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: -1,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    oiaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'inspector',
    tableName: 'inspectors',
  }
);
