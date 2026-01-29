import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface CheckListAttributes {
  id: number;
  description: string;
  active?: boolean | null;
  order: number;
}

interface CheckListCreationAttributes extends Optional<CheckListAttributes, 'id'> {}

export class CheckList
  extends Model<CheckListAttributes, CheckListCreationAttributes>
  implements CheckListAttributes
{
  declare id: number;
  declare description: string;
  declare active: boolean | null;
  declare order: number;
}

CheckList.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'checklist',
    tableName: 'checklist',
    timestamps: false,
  }
);
