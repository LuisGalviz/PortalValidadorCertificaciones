import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

interface JobsAttributes {
  id: number;
  key: number;
  reportId?: number | null;
  jobType: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown> | null;
  status: string;
  userId?: number | null;
  retries?: number | null;
  createdat?: Date | null;
  updatedat?: Date | null;
}

interface JobsCreationAttributes extends Optional<JobsAttributes, 'id'> {}

export class Jobs extends Model<JobsAttributes, JobsCreationAttributes> implements JobsAttributes {
  declare id: number;
  declare key: number;
  declare reportId: number | null;
  declare jobType: string;
  declare input: Record<string, unknown>;
  declare output: Record<string, unknown> | null;
  declare status: string;
  declare userId: number | null;
  declare retries: number | null;
  declare createdat: Date | null;
  declare updatedat: Date | null;
}

Jobs.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reportId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    jobType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    input: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    output: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    retries: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdat: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedat: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'jobs',
    tableName: 'jobs_history',
    timestamps: false,
  }
);
