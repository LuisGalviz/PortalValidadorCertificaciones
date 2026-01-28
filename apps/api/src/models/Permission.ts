import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface PermissionAttributes {
  id: number;
  userId: number;
  permission?: string | null;
  status?: number | null;
  comment?: string | null;
}

interface PermissionCreationAttributes extends Optional<PermissionAttributes, 'id'> {}

export class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes
{
  declare id: number;
  declare userId: number;
  declare permission: string | null;
  declare status: number | null;
  declare comment: string | null;
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    permission: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'permission',
    tableName: 'permissions',
    timestamps: false,
  }
);
