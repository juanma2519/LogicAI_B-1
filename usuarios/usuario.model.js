const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
          usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
          },
          nombre: {
            type: DataTypes.STRING(50),
            allowNull: false
          },
          apellidos: {
            type: DataTypes.STRING(100),
            allowNull: false
          },
          dni: {
            type: DataTypes.STRING(9),
            allowNull: true,
            unique: true
          },
          fecha_nacimiento: {
            type: DataTypes.DATE,
            allowNull: true
          },
          correo_electronico: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
          },
          genero: {
            type: DataTypes.ENUM('hombre', 'mujer'),
            allowNull: true
          },
          telefono: {
            type: DataTypes.STRING(9),
            allowNull: true
          },
          profesion: {
            type: DataTypes.STRING(50),
            allowNull: true
          },
          contrasena: {
            type: DataTypes.STRING,
            allowNull: false
          },
          cus: {
            type: DataTypes.STRING,
            allowNull: true
          },
          verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
          },
          image: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'profile2.jpg'
          },
          rol: {
            type: DataTypes.ENUM('Admin', 'Cliente', 'Vendedor'),
            allowNull: false,
            defaultValue: 'Cliente'
          },
          credit:{
            type: DataTypes.STRING,
            allowNull: true,
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

    return sequelize.define('Usuario', attributes, options);
}