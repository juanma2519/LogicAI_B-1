module.exports = session;

function session(req, res, next) {
        console.log(req.session);
        if (req.session.user){
            return next();
          }else{
            return res.status(401).json({ message: 'Desautorizado' });
        }

};