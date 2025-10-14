const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      default:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      expires:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3600,
      }
    };

const options = {
  defaultScope: {
      // exclude hash by default
      attributes: { exclude: ['hash'] }
  },
  scopes: {
      // include hash with this scope
      withHash: { attributes: {}, }
  },
  timestamps: false,
};

return sequelize.define('Token', attributes, options);
}