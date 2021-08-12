const _ = require('underscore')
const log = require('./../resourses/utils/logger')
const usuarios = require('./../../database').usuarios
const bcrypt = require('bcrypt')
const passportJWT = require('passport-jwt')

//modulo de autenticacion con jwt
//ve a buscar el token el headear del request
let jwtOption = {
    secretOrKey: 'esto es un secreto',
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
}
module.exports = new passportJWT.Strategy(jwtOption,(jwtPayload,next) =>{
    let  index = _.findIndex(usuarios,usuario => usuario.id == jwtPayload.id)
    if (index === -1){
        log.info(`JWT token no es valido. Usuario con el id ${jwtPayload.id} no existe`)
        next(null,false)    
        return
    }else{
        log.info(`Usuario ${usuarios[index].username} suministro un token valido. Autenticacion completada`)
        //objeto que se agregar el request
        next(null,{
            username: usuarios[index].username,
            id: usuarios[index].id
        })
    }
})

//modulo de autenticacion basica
// const basicStrategyLogin = (username,password,done)=>{
//     let  index = _.findIndex(usuarios,usuario => usuario.username == username)
//     if (index === -1){
//         log.info(`Usuario ${username} no existe, no puede ser autentica`)
//         done(null,false)    
//         return
//     }

//     let hashedPassword = usuarios[index].password;
//     bcrypt.compare(password, hashedPassword, (err,some)=>{
//         if(some){
//             log.info(`Usuario ${username} completo la autenticación`)
//             done(null,true)
//             return
//         }else{
//             log.info(`Usuario ${username} no completo autenticación, contraseña incorrecta`)
//             done(null,false)  
//         }
//     })

// }

// module.exports = {
//     jwtStrategy,
//     // basicStrategyLogin
// }