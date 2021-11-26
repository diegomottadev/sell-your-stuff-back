const express = require('express')
const _ = require('underscore')
const usuarios = require("./../../../database").usuarios
const uuidv4 = require('uuid/v4')
const bcrypt = require('bcrypt')
const log = require('./../utils/logger')
const validarUsuario = require('./usuarios.validate').validarUsuario
const validarPedidoDeLogin = require('./usuarios.validate').validarPedidoDeLogin
const config = require('../../config')
const usuarioController = require('./usuarios.controller')
const usuariosRouter = express.Router()



const jwt = require('jsonwebtoken')

usuariosRouter.get('/',(req,res)=>{
    usuarioController.obtenerUsuarios().then(usuarios =>{
        res.json(usuarios)
    }).catch(err=>{
        log.error('Error al obtener todos los usuarios', err)
        res.sendStatus(500);
    })
})

usuariosRouter.post('/', validarUsuario, (req,res)=>{
    
    let nuevoUsuario = req.body

    usuarioController.usuarioExiste(nuevoUsuario,nuevoUsuario.email)
    .then(usuarioExiste =>{
        if(usuarioExiste){
            log.warn(`Email [${nuevoUsuario.email}] o username [${nuevoUsuario.username}] ya existen en la base de datos`)
            res.status(409).send('El email o usuario ya estan asociados con una cuenta')
            return
        }

        bcrypt.hash(nuevoUsuario.password, 10, (err, hashPassword)=>{
            if(err){
                log.error('Error ocurrio al tratar de obtener el hash de una constraseña')
                res.status(500).send('Ocurrio un error procesando creacion del usuario')
                return
            }

            usuarioController.crearUsuario(nuevoUsuario,hashPassword)
            .then(nuevoUsuario =>{
                res.status(201).send('Usuario creado exitosamente')
            })
            .catch(err =>{
                log.error("Error ocurrió al tratar de crear un nuevo usuario",err)
                res.status(500).send("Error ocurrio al tratar de crear nuevo usuario")
            })
        })
    }).catch (err =>{
        log.error(`Error ocurrió al tratar de verificar si usuario [${nuevoUsuario.username}] con el email [${nuevoUsuario.email}] ya existe`);
        res.status(500).send('Error ocurrió al tratar de crear nuevo usuario')
        return
    })

})

usuariosRouter.post('/login', validarPedidoDeLogin,(req,res)=> {
    let usuarioNoAutenticado = req.body

    let index = _.findIndex(usuarios, usuario => {
        return usuario.username === usuarioNoAutenticado.username
    })
    if (index === -1){
        log.info(`Usuario ${usuarioNoAutenticado.username} no existe. No puedo ser autenticado`)
        res.status(400).send(`Credenciales incorrectas. El usuario no existe`);
    }

    let hashedPassword = usuarios[index].password;
    bcrypt.compare(usuarioNoAutenticado.password, hashedPassword, (err,iguales)=>{
        if (iguales){
            let token = jwt.sign({id: usuarios[index].id}, config.jwt.secreto,{expiresIn:"20h"})
            log.info(`Usuario ${usuarioNoAutenticado.username} completo autenticacion exitosamente`)
            res.status(200).json({token});
        }else{
            log.info(`Usuario ${usuarioNoAutenticado.username} no completo autenticación. Contraseña incorrecta`)
            res.status(400).send(`Credenciales incorrectas. Asegurate que el username y la contraseña sean correctas`)
        }
    })
})


module.exports = usuariosRouter