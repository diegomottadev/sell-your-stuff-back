//correr mongo brew services start mongodb-community
//sudo mkdir -p /System/Volumes/Data/data/db
//sudo chown -R `id -un` /System/Volumes/Data/data/db
//sudo mongod --dbpath  /System/Volumes/Data/data/db
//alias mongod='sudo mongod --dbpath /System/Volumes/Data/data/db'
//ps aux | grep -v grep | grep mongod  
//alias


const express = require('express')
const bodyParser = require('body-parser')
const productosRouter = require('./api/resourses/products/products.route')
const usuariosRouter = require('./api/resourses/usuarios/usuarios.route')

const morgan = require('morgan');
const mongoose = require('mongoose')

const logger = require("./api/resourses/utils/logger")
//autenticacion basica
// const auth = require('./api/libs/auth').basicStrategyLogin
// const BasicStrategy = require('passport-http').BasicStrategy
const authJTW = require('./api/libs/auth')
const config = require('./api/config')
const passport = require('passport')
passport.use(authJTW)

mongoose.connect('mongodb://127.0.0.1:27017/vendetuscosas')
mongoose.connection.on('error',()=>{
    logger.error('Fallo la conexion a mongodb')
    process.exit(1)
})

const app = express()
app.use(morgan('short',{
    stream:{
        write: message => logger.info(message.trim())
    }
}))

app.use(bodyParser.json())

//passport.use(new BasicStrategy(auth))
app.use(passport.initialize())

app.use('/productos',productosRouter)
app.use('/usuarios',usuariosRouter)

// app.get('/',passport.authenticate('basic',{session:false}), (req,res)=> {
//     res.send('API de vendetuscosas.com')
// })
app.listen(config.puerto,()=>{
    logger.info('Escuchando el puerto 3000')
});