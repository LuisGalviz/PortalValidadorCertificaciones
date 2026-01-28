import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface ReportAttributes {
  id: number;
  orderExternal?: string | null;
  orderId?: number | null;
  certificateIdOSF?: number | null;
  certificate?: string | null;
  data?: Record<string, unknown> | null;
  status: number;
  reviewDate?: Date | null;
  userId?: number | null;
  comment?: string | null;
  causalId?: number | null;
  inspectionType?: number | null;
  inspectionResult?: number | null;
  inspectionDate?: Date | null;
  oiaId?: number | null;
  subscriptionId?: number | null;
  address?: string | null;
  location?: string | null;
  lineType?: number | null;
  inspectorId?: number | null;
  causalCriticalDefects?: Record<string, unknown> | null;
  causalNoCriticalDefects?: Record<string, unknown> | null;
  causalArtifacts?: Record<string, unknown> | null;
  origin?: number | null;
  internalVacuum?: number | null;
  project?: string | null;
  osfDate?: Date | null;
  ludyOrderDate?: Date | null;
  onBaseDate?: Date | null;
  camundaDate?: Date | null;
  salesDate?: Date | null;
  retries?: number | null;
  lastError?: string | null;
  constructionCompanyId?: number | null;
  unregisteredConstructionCompany?: string | null;
  department?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReportCreationAttributes
  extends Optional<ReportAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Report
  extends Model<ReportAttributes, ReportCreationAttributes>
  implements ReportAttributes
{
  declare id: number;
  declare orderExternal: string | null;
  declare orderId: number | null;
  declare certificateIdOSF: number | null;
  declare certificate: string | null;
  declare data: Record<string, unknown> | null;
  declare status: number;
  declare reviewDate: Date | null;
  declare userId: number | null;
  declare comment: string | null;
  declare causalId: number | null;
  declare inspectionType: number | null;
  declare inspectionResult: number | null;
  declare inspectionDate: Date | null;
  declare oiaId: number | null;
  declare subscriptionId: number | null;
  declare address: string | null;
  declare location: string | null;
  declare lineType: number | null;
  declare inspectorId: number | null;
  declare causalCriticalDefects: Record<string, unknown> | null;
  declare causalNoCriticalDefects: Record<string, unknown> | null;
  declare causalArtifacts: Record<string, unknown> | null;
  declare origin: number | null;
  declare internalVacuum: number | null;
  declare project: string | null;
  declare osfDate: Date | null;
  declare ludyOrderDate: Date | null;
  declare onBaseDate: Date | null;
  declare camundaDate: Date | null;
  declare salesDate: Date | null;
  declare retries: number | null;
  declare lastError: string | null;
  declare constructionCompanyId: number | null;
  declare unregisteredConstructionCompany: string | null;
  declare department: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Report.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderExternal: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    certificateIdOSF: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    certificate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: -1,
    },
    reviewDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    causalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    inspectionType: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    inspectionResult: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    inspectionDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    oiaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    subscriptionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lineType: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    inspectorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    causalCriticalDefects: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    causalNoCriticalDefects: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    causalArtifacts: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    origin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    internalVacuum: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    project: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    osfDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ludyOrderDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    onBaseDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    camundaDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    salesDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    retries: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lastError: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    constructionCompanyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    unregisteredConstructionCompany: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'report',
    tableName: 'reports',
  }
);
