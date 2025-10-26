require('rootpath')();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./_middleware/error-handler');
const db = require('./_helpers/db');

(async () => {
  try {
    // 1️⃣ Inicializa la base de datos antes de montar las rutas
    await db.init();
    console.log('✅ Base de datos inicializada correctamente');

    // 2️⃣ Configura Express
    const app = express();

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));

    const corsOptions = {
      origin: ['https://dsol.vercel.app', 'http://localhost:4200', 'https://app.wesolai.com', 'https://app.logicai.es'],
      credentials: true
    };
    app.use(cors(corsOptions));

    // 3️⃣ Rutas API
    app.use('/usuarios', require('./usuarios/usuarios.controller'));
    app.use('/metodos', require('./metodos_pago/metodos_pago.controller'));
    app.use('/pagos', require('./pagos/pagos.controller'));
    app.use('/leads', require('./leads/leads.controller'));
    app.use('/webhooks', require('./webhooks/webhooks.controller'));
    app.use('/messages', require('./messages/message.controller'));
    app.use('/usage', require('./usage-event/usage.controller'));
    app.use('/pricing', require('./pricing/pricing.controller'));
    app.use('/eleven', require('./elevenlabs/elevenlabs.controller'));
    app.use('/conceptos', require('./conceptos/conceptos.controller'));
    app.use('/estados', require('./estados/estados.controller'));
    app.use('/whatsapp', require('./whatsapp-credential/whatsapp-credential.controller'));
    app.use('/emailmarketing', require('./email/email.controller'));
    // 4️⃣ Recursos estáticos y middleware de errores
    app.use('/resources', express.static('resources'));
    app.use(errorHandler);

    // 5️⃣ Inicia el servidor
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
  } catch (err) {
    console.error('❌ Error iniciando el servidor:', err);
    process.exit(1);
  }
})();