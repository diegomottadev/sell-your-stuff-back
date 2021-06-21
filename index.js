const express = require('express')
const bodyParser = require('body-parser')
const productsRouter = require('./api/resourses/products/products.route')
const morgan = require('morgan');
const logger = require("./api/resourses/utils/logger")

const app = express()
app.use(morgan('short',{
    stream:{
        write: message => logger.info(message.trim())
    }
}))
app.use(bodyParser.json())

app.use('/products',productsRouter)

app.get('/', (req,res)=> {
    res.send('API de vendetuscosas.com')
})

app.listen(3000,()=>{
    logger.info('Escuchando el puerto 3000')
});