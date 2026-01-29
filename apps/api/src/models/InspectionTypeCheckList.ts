import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

interface InspectionTypeCheckListAttributes {
  id: number;
  inspectionType: number;
  checklistId: number;
}

export class InspectionTypeCheckList
  extends Model<InspectionTypeCheckListAttributes>
  implements InspectionTypeCheckListAttributes
{
  declare id: number;
  declare inspectionType: number;
  declare checklistId: number;
}

InspectionTypeCheckList.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    inspectionType: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    checklistId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'inspectiontype_reportchecklist',
    tableName: 'inspectiontype_reportchecklist',
    timestamps: false,
  }
);
