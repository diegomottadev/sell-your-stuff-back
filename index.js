const express = require('express')
const bodyParser = require('body-parser')
const productsRouter = require('./api/resourses/products/products.route')
const usuariosRouter = require('./api/resourses/usuarios/usuarios.route')

const morgan = require('morgan');
const logger = require("./api/resourses/utils/logger")
const passport = require('passport')
const auth = require('./api/libs/auth')
const BasicStrategy = require('passport-http').BasicStrategy

const app = express()
app.use(morgan('short',{
    stream:{
        write: message => logger.info(message.trim())
    }
}))

app.use(bodyParser.json())

passport.use(new BasicStrategy(auth))

app.use(passport.initialize())

app.use('/products',productsRouter)
app.use('/usuarios',usuariosRouter)

app.get('/',passport.authenticate('basic',{session:false}), (req,res)=> {
    res.send('API de vendetuscosas.com')
})

app.listen(3000,()=>{
    logger.info('Escuchando el puerto 3000')
});