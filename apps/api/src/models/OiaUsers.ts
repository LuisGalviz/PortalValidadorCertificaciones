import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

interface OiaUsersAttributes {
  oiaId: number;
  userId: number;
  createdAt?: Date;
}

export class OiaUsers extends Model<OiaUsersAttributes> implements OiaUsersAttributes {
  declare oiaId: number;
  declare userId: number;
  declare readonly createdAt: Date;
}

OiaUsers.init(
  {
    oiaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'oiaUsers',
    tableName: 'oia_users',
    timestamps: false,
  }
);
