import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

interface OrderAttributes {
  id: number;
  taskTypeId?: number | null;
  operatingUnitId?: string | null;
  createdDate?: Date | null;
  assignedDate?: Date | null;
  subscriptionId?: number | null;
  address?: string | null;
  location?: string | null;
  causalOSF?: number | null;
  inspectorId?: number | null;
}

export class Order extends Model<OrderAttributes> implements OrderAttributes {
  declare id: number;
  declare taskTypeId: number | null;
  declare operatingUnitId: string | null;
  declare createdDate: Date | null;
  declare assignedDate: Date | null;
  declare subscriptionId: number | null;
  declare address: string | null;
  declare location: string | null;
  declare causalOSF: number | null;
  declare inspectorId: number | null;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    taskTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    operatingUnitId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    assignedDate: {
      type: DataTypes.DATE,
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
    causalOSF: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    inspectorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'orders',
    tableName: 'orders',
    timestamps: false,
  }
);
