const express = require('express')
const _ = require('underscore')
const uuidv4 = require('uuid/v4')
const bcrypt = require('bcrypt')
const log = require('./../utils/logger')
const validarUsuario = require('./usuarios.validate').validarUsuario
const validarPedidoDeLogin = require('./usuarios.validate').validarPedidoDeLogin
const config = require('../../config')
const usuarioController = require('./usuarios.controller')
const usuariosRouter = express.Router()
const procesarErrores  = require('../../libs/errorHandler').procesarErrores
const {DatosDeUsuarioYaEnUso,CredencialesIncorrectas} = require('./usuarios.error')

const jwt = require('jsonwebtoken')

function transformarBodyALowerCase(req,res,next){
    req.body.username && (req.body.username = req.body.username.toLowerCase())
    req.body.email && (req.body.email = req.body.email.toLowerCase())
    next()
}


usuariosRouter.get('/',procesarErrores((req,res)=>{
   return usuarioController.obtenerUsuarios().then(usuarios =>{
        res.json(usuarios)
    })
}))

usuariosRouter.post('/', [validarUsuario,transformarBodyALowerCase], procesarErrores( (req,res)=>{
    
    let nuevoUsuario = req.body

    return usuarioController.usuarioExiste(nuevoUsuario.username,nuevoUsuario.email)
    .then(usuarioExiste =>{
        if(usuarioExiste){
            log.warn(`Email [${nuevoUsuario.email}] o username [${nuevoUsuario.username}] ya existen en la base de datos`)
            res.status(409).send('El email o usuario ya estan asociados con una cuenta')
            throw new DatosDeUsuarioYaEnUso()
        }
           return bcrypt.hash(nuevoUsuario.password, 10)
        }).then((hash) => {
            return usuarioController.crearUsuario(nuevoUsuario,hashedPassword)
            .then(nuevoUsuario =>{
                res.status(201).send('Usuario creado exitosamente')
            })

        })
}))

usuariosRouter.post('/login', [validarPedidoDeLogin,transformarBodyALowerCase],procesarErrores(async (req,res)=> {
    let usuarioNoAutenticado = req.body

    let usuarioRegistrado

    usuarioRegistrado = await usuarioController.obtenerUsuario({
        username: usuarioNoAutenticado.username
    })
   

    if(!usuarioRegistrado){
        log.error(`Usuario[ ${usuarioNoAutenticado.username}] no existe. No pudo ser autenticado`)
        throw new CredencialesIncorrectas() 
    }

    let contraseñaCorrecta
    
    contraseñaCorrecta = await bcrypt.compare(usuarioNoAutenticado.password, usuarioRegistrado.password)
    if (contraseñaCorrecta){
        let token = jwt.sign({id: usuarioRegistrado.id}, config.jwt.secreto,{expiresIn:"20h"})
        log.info(`Usuario ${usuarioNoAutenticado.username} completo autenticacion exitosamente`)
        res.status(200).json({token});
    }else{
        log.info(`Usuario ${usuarioNoAutenticado.username} no completo autenticación. Contraseña incorrecta`)
        throw new CredencialesIncorrectas() 
    }

}))


module.exports = usuariosRouter