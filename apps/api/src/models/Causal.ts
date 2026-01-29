import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface CausalAttributes {
  id: number;
  description: string;
  typeCausal: string;
  active?: boolean | null;
}

interface CausalCreationAttributes extends Optional<CausalAttributes, 'id'> {}

export class Causal
  extends Model<CausalAttributes, CausalCreationAttributes>
  implements CausalAttributes
{
  declare id: number;
  declare description: string;
  declare typeCausal: string;
  declare active: boolean | null;
}

Causal.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    typeCausal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'causals',
    tableName: 'causals',
    timestamps: false,
  }
);
