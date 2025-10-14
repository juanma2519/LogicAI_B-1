const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
  const attributes = {
    mensaje_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    fecha_envio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    leido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  };

  const options = {
    tableName: 'Messages', // ajusta al nombre real de tu tabla si difiere
    timestamps: false
  };

  return sequelize.define('Message', attributes, options);
}
