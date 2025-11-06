// _helpers/db.js
const config = require('../config.json');
const mysql = require('mysql2/promise');
const mysql2 = require('mysql2');
const { Sequelize } = require('sequelize');

const db = {};
let sequelize;

db.init = async function init() {
  const { host, port, user, password, database } = config.database;

  // 1) Crear DB si no existe
  const bootstrap = await mysql.createConnection({ host, port, user, password });
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  await bootstrap.end();

  // 2) Conectar Sequelize
  sequelize = new Sequelize(database, user, password, {
    host,
    port: Number(port) || 3306,
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: false,
    pool: { max: 5, min: 0, acquire: 20000, idle: 10000 },
    // dialectOptions: { ssl: { require: true, rejectUnauthorized: true } },
    timezone: '+00:00',
  });

  db.Sequelize = Sequelize;
  db.sequelize = sequelize;

  // 3) Modelos
  db.Token        = require('../usuarios/token.model')(sequelize);
  db.Usuario      = require('../usuarios/usuario.model')(sequelize);
  db.Leads        = require('../leads/leads.model')(sequelize);
  db.Webhooks     = require('../webhooks/webhooks.model')(sequelize);
  db.Messages     = require('../messages/message.model')(sequelize);
  db.UsageEvent   = require('../usage-event/usage.event.model')(sequelize);
  db.ModelPricing = require('../pricing/pricing.model')(sequelize);
  db.Estado       = require('../estados/estado.model')(sequelize);
  db.Concepto     = require('../conceptos/concepto.model')(sequelize);
  db.Consultoria  = require('../webhooks/consultoria.model')(sequelize);
  db.WhatsAppCredential = require('../whatsapp-credential/whatsapp-credential.model')(sequelize);
  db.EmailMarketing = require('../email/email.model')(sequelize);
  
  
  
  // 4) Asociaciones
  db.Usuario.hasMany(db.Leads, { foreignKey: 'usuario_id' });
  db.Leads.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  db.Leads.belongsTo(db.Estado,   { foreignKey: 'estado_id',   as: 'estado' });
  db.Leads.belongsTo(db.Concepto, { foreignKey: 'concepto_id', as: 'concepto' });

  db.Usuario.hasMany(db.Webhooks, { foreignKey: 'usuario_id' });
  db.Webhooks.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  db.Usuario.hasMany(db.Messages, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
  db.Messages.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  db.Usuario.hasMany(db.UsageEvent, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
  db.UsageEvent.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  db.Usuario.hasMany(db.Consultoria, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
  db.Consultoria.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  db.Leads.hasMany(db.Consultoria, { foreignKey: 'lead_id' });
  db.Consultoria.belongsTo(db.Leads, { foreignKey: 'lead_id', as: 'leads' });

  db.Usuario.hasOne(db.WhatsAppCredential, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
  db.WhatsAppCredential.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  
  
  db.Usuario.hasMany(db.EmailMarketing, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
  db.EmailMarketing.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  
  db.Leads.hasOne(db.EmailMarketing, { foreignKey: 'lead_id'});
  db.EmailMarketing.belongsTo(db.Leads, { foreignKey: 'lead_id', as: 'leads' });

  db.Consultoria.hasOne(db.EmailMarketing, { foreignKey: 'consultoria_id'});
  db.EmailMarketing.belongsTo(db.Consultoria, { foreignKey: 'consultoria_id', as: 'Consultoria' });
    
  // 5) Sync
  await sequelize.sync();
};

module.exports = db;
