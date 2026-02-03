import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface OiaAttributes {
  id: number;
  identification: number;
  name: string;
  codeAcred: string;
  effectiveDate?: Date | null;
  cedRepLegal?: number | null;
  nameRepLegal?: string | null;
  addressRepLegal?: string | null;
  typeOrganismId?: number | null;
  addressOrganism?: string | null;
  nameContact?: string | null;
  phoneContact?: number | null;
  phoneContactAlternative?: number | null;
  emailContact?: string | null;
  userId?: number | null;
  codeOrganism?: number | null;
  organismCodes?: Record<string, unknown> | Record<string, unknown>[] | null;
  acceptedTermsAndConditions?: boolean | null;
  status: number;
  comment?: string | null;
  active?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OiaCreationAttributes extends Optional<OiaAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Oia extends Model<OiaAttributes, OiaCreationAttributes> implements OiaAttributes {
  declare id: number;
  declare identification: number;
  declare name: string;
  declare codeAcred: string;
  declare effectiveDate: Date | null;
  declare cedRepLegal: number | null;
  declare nameRepLegal: string | null;
  declare addressRepLegal: string | null;
  declare typeOrganismId: number | null;
  declare addressOrganism: string | null;
  declare nameContact: string | null;
  declare phoneContact: number | null;
  declare phoneContactAlternative: number | null;
  declare emailContact: string | null;
  declare userId: number | null;
  declare codeOrganism: number | null;
  declare organismCodes: Record<string, unknown> | Record<string, unknown>[] | null;
  declare acceptedTermsAndConditions: boolean | null;
  declare status: number;
  declare comment: string | null;
  declare active: boolean | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Oia.init(
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
    codeAcred: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    cedRepLegal: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    nameRepLegal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addressRepLegal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    typeOrganismId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    addressOrganism: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nameContact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneContact: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    phoneContactAlternative: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    emailContact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    codeOrganism: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    organismCodes: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    acceptedTermsAndConditions: {
      type: DataTypes.BOOLEAN,
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
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'oia',
    tableName: 'oia',
    freezeTableName: true,
  }
);
