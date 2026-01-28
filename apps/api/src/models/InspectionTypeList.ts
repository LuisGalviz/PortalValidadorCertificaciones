import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface InspectionTypeListAttributes {
  id: number;
  code: number;
  description: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface InspectionTypeListCreationAttributes
  extends Optional<InspectionTypeListAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class InspectionTypeList
  extends Model<InspectionTypeListAttributes, InspectionTypeListCreationAttributes>
  implements InspectionTypeListAttributes
{
  declare id: number;
  declare code: number;
  declare description: string;
  declare active: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

InspectionTypeList.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.INTEGER,
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
    modelName: 'inspectionTypeAssociated',
    tableName: 'inspectionTypeList',
  }
);
