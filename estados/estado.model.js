const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Estado', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { timestamps: false, tableName: 'estados' });
};