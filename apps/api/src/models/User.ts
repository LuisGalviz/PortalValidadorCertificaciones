import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface UserAttributes {
  id: number;
  name: string;
  shortName?: string | null;
  phone: number;
  email: string;
  authEmail?: string | null;
  otpCode?: string | null;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare name: string;
  declare shortName: string | null;
  declare phone: number;
  declare email: string;
  declare authEmail: string | null;
  declare otpCode: string | null;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  declare permission?: Permission;
  declare oiaUser?: OiaUsers;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shortName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'user',
    tableName: 'users',
  }
);

import { Permission } from './Permission.js';
import { OiaUsers } from './OiaUsers.js';
