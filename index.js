const express = require('express')
const bodyParser = require('body-parser')
const productsRouter = require('./api/resourses/products/products.route')
const morgan = require('morgan');
const logger = require("./api/resourses/utils/logger")
const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy

const app = express()
app.use(morgan('short',{
    stream:{
        write: message => logger.info(message.trim())
    }
}))

app.use(bodyParser.json())

passport.use(new BasicStrategy(
    (username,password,done)=>{
        if(username.valueOf() === 'daniel' && password.valueOf()==='appdelante123'){
            return done(null,true)
        }else{
            return done(null,false);
        }
    }
))

app.use(passport.initialize())

app.use('/products',productsRouter)

app.get('/',passport.authenticate('basic',{session:false}), (req,res)=> {
    res.send('API de vendetuscosas.com')
})

app.listen(3000,()=>{
    logger.info('Escuchando el puerto 3000')
});