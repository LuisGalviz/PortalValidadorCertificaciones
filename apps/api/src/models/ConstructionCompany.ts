import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface ConstructionCompanyAttributes {
  id: number;
  nit: string;
  name: string;
  rufiCode: string;
  category: number;
  stateSIC: number;
  contractStatus: string;
  addressCompany: string;
  cityCompany: string;
  userId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ConstructionCompanyCreationAttributes
  extends Optional<ConstructionCompanyAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class ConstructionCompany
  extends Model<ConstructionCompanyAttributes, ConstructionCompanyCreationAttributes>
  implements ConstructionCompanyAttributes
{
  declare id: number;
  declare nit: string;
  declare name: string;
  declare rufiCode: string;
  declare category: number;
  declare stateSIC: number;
  declare contractStatus: string;
  declare addressCompany: string;
  declare cityCompany: string;
  declare userId: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

ConstructionCompany.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rufiCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stateSIC: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contractStatus: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addressCompany: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cityCompany: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'constructionCompany',
    tableName: 'construction_companies',
  }
);
