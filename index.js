const express = require('express')
const bodyParser = require('body-parser')
const productsRouter = require('./api/resourses/products/products.route')
const usuariosRouter = require('./api/resourses/usuarios/usuarios.route')

const morgan = require('morgan');
const logger = require("./api/resourses/utils/logger")
//autenticacion basica
// const auth = require('./api/libs/auth').basicStrategyLogin
// const BasicStrategy = require('passport-http').BasicStrategy
const authJTW = require('./api/libs/auth')
const passport = require('passport')
passport.use(authJTW)

const app = express()
app.use(morgan('short',{
    stream:{
        write: message => logger.info(message.trim())
    }
}))

app.use(bodyParser.json())

//passport.use(new BasicStrategy(auth))
app.use(passport.initialize())

app.use('/products',productsRouter)
app.use('/usuarios',usuariosRouter)

// app.get('/',passport.authenticate('basic',{session:false}), (req,res)=> {
//     res.send('API de vendetuscosas.com')
// })
app.get('/',passport.authenticate('jwt',{session:false}), (req,res)=> {
    //tener el user en el requesr
    logger.info(req.user)
    res.send('API de vendetuscosas.com')
})
app.listen(3000,()=>{
    logger.info('Escuchando el puerto 3000')
});