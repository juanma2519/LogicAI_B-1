const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../_helpers/db');
const sendEmail = require("../_middleware/email");
const uploadFile = require("../_middleware/upload");

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    verified,
    upload,
    logout
};

async function authenticate(req) {
    const correo_electronico = req.body.correo_electronico;
    const user = await db.Usuario.scope('withHash').findOne({ where: { correo_electronico } });

    if (!user || !(await bcrypt.compare(req.body.contrasena, user.contrasena)))
        throw 'No se ha encontrado un usuario con esta combinación de correo/contraseña.';
    if (!user.verified)
        throw 'Usuario no verificado, por favor revise su correo.';

    const token = jwt.sign({ sub: user.usuario_id  }, config.secret, { expiresIn: '7d' });

    return {
        usuario: omitHash(user.get()),
        token
    };
}

async function logout(req){
    req.session.destroy();
}

async function getAll() {
    return await db.Usuario.findAll();
}

async function getById(id) {
    return await getUsuario(id);
}

async function verified(params) {
    try {
        const user = await db.Usuario.findOne({ usuario_id: params.id });
        if (!user) return "Enlace no válido";
    
        const token = await db.Token.findOne({
          userId: user._id,
          token: params.token,
        });

        if (!token){
            const response = resendVerification(params.id);
            if(response){
                return "Comencemos";
            }else{
                return "Enlace no válido";
            }
            
        } 

        const userAux = user;
        userAux.verified = true;

        // copy params to user and save
        Object.assign(user, userAux);
        await user.save();

        await token.destroy();
    
        return "Comencemos";
      } catch (error) {
        const response = resendVerification(params.id);
        if(response){
            return "Comencemos";
        }else{
            return "Enlace no válido";
        }
      }
}

async function resendVerification(usuario_id) {
    const user = await db.Usuario.findOne({ usuario_id: usuario_id });
    if(user.verified){
        const tokenAux = await db.Token.findOne({ where: { userId: usuario_id} });
        if (tokenAux) {
            await tokenAux.destroy();
        }
    
        const token = await db.Token.create({ userId: usuario_id, token: require('crypto').randomBytes(32).toString('hex')});
    
        const message = `https://dsol-b.vercel.app/usuarios/verify/${user.usuario_id}/${token.token}`;
        const correo = await sendEmail(user.nombre + " " + user.apellidos, user.correo_electronico, "WesolAI.es - Verifica tu correo electronico", message);
        return "send";
    }else{
        return "verified";
    }

}

async function create(params) {
    // validate
    if (await db.Usuario.findOne({ where: { correo_electronico: params.correo_electronico } })) {
        throw 'Este correo "' + params.correo_electronico + '" se encuentra en uso';
    }

    // hash password
    if (params.contrasena) {
        params.contrasena = await bcrypt.hash(params.contrasena, 10);
    }
    // save user
    if(params.rol == "Anfitrión"){
        params.rol = "Vendedor";
    }
    const user = await db.Usuario.create(params);

    const tokenAux = await db.Token.findOne({ where: { userId: user.usuario_id} });
    if (tokenAux) {
        await tokenAux.destroy();
    }

    const token = await db.Token.create({ userId: user.usuario_id, token: require('crypto').randomBytes(32).toString('hex')});

    const message = `https://dsol-b.vercel.app/usuarios/verify/${user.usuario_id}/${token.token}`;
    const correo = await sendEmail(user.nombre + " " + user.apellidos, user.correo_electronico, "WesolAI.es - Verifica tu correo electronico", message, 'email');
    return user;
}

async function update(id, params) {
    const user = await getUsuario(id);

    // validate
    const usernameChanged = params.username && user.username !== params.username;
    if (usernameChanged && await db.Usuario.findOne({ where: { username: params.username } })) {
        throw 'Username "' + params.username + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.hash = await bcrypt.hash(params.password, 10);
    }

    // copy params to user and save
    Object.assign(user, params);
    await user.save();

    return omitHash(user.get());
}

async function _delete(id) {
    const user = await getUsuario(id);
    await user.destroy();
}

// helper functions

async function getUsuario(id) {
    const user = await db.Usuario.findByPk(id);
    if (!user) throw 'Usuario not found';
    return user;
}

function omitHash(user) {
    const { hash, ...userWithoutHash } = user;
    return userWithoutHash;
}

async function upload (req, res) {
    try {
      await uploadFile(req, res);
  
      if (req.file == undefined) {
        return res.status(400).send({ message: "Please upload a file!" });
      }
  
      res.status(200).send({
        message: "Uploaded the file successfully: " + req.file.originalname,
      });
    } catch (err) {
      res.status(500).send({
        message: `Could not upload the file: ${req.file.originalname}. ${err}`,
      });
    }
  };