//correr mongo brew services start mongodb-community
//sudo mkdir -p /System/Volumes/Data/data/db
//sudo chown -R `id -un` /System/Volumes/Data/data/db
//sudo mongod --dbpath  /System/Volumes/Data/data/db
//alias mongod='sudo mongod --dbpath /System/Volumes/Data/data/db'
//ps aux | grep -v grep | grep mongod  
//alias


/* brew services stop mongodb
brew uninstall homebrew/core/mongodb

# Use the migrated distribution from custom tap
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community */


// accede a la shell de mongo con el comando mongosh
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
const errorHandler = require('./api/libs/errorHandler')

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
app.use(errorHandler.procesarErrores)

if(config.ambiente === 'prod'){
    app.use(errorHandler.erroresEnProduccion)
}else{
    app.use(errorHandler.erroresEnDesarrollo)
}

// app.get('/',passport.authenticate('basic',{session:false}), (req,res)=> {
//     res.send('API de vendetuscosas.com')
// })
const server = app.listen(config.puerto,()=>{
    logger.info('Escuchando el puerto 3000')
});

module.exports = {
    app,server
}