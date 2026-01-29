import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface InspectionTypeListAttributes {
  id: number;
  description?: string | null;
  active?: boolean | null;
  abbreviation?: string | null;
}

interface InspectionTypeListCreationAttributes
  extends Optional<InspectionTypeListAttributes, 'id'> {}

export class InspectionTypeList
  extends Model<InspectionTypeListAttributes, InspectionTypeListCreationAttributes>
  implements InspectionTypeListAttributes
{
  declare id: number;
  declare description: string | null;
  declare active: boolean | null;
  declare abbreviation: string | null;
}

InspectionTypeList.init(
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
    abbreviation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'inspectionTypeAssociated',
    tableName: 'inspection_type',
    timestamps: false,
  }
);
