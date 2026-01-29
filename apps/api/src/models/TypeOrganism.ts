import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';

interface TypeOrganismAttributes {
  id: number;
  name: string;
  active: boolean;
}

export class TypeOrganism extends Model<TypeOrganismAttributes> implements TypeOrganismAttributes {
  declare id: number;
  declare name: string;
  declare active: boolean;
}

TypeOrganism.init(
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
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'typeOrganism',
    tableName: 'typeOrganism',
    freezeTableName: true,
    timestamps: false,
  }
);
