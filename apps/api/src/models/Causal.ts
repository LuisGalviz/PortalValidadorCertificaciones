import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface CausalAttributes {
  id: number;
  code: string;
  description: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CausalCreationAttributes
  extends Optional<CausalAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Causal
  extends Model<CausalAttributes, CausalCreationAttributes>
  implements CausalAttributes
{
  declare id: number;
  declare code: string;
  declare description: string;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Causal.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
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
    modelName: 'causals',
    tableName: 'causals',
  }
);
