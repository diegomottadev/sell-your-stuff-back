const express = require('express')
const bodyParser = require('body-parser')
const productsRouter = require('./api/resourses/products/products.route')
const app = express()
app.use(bodyParser.json())

app.use('/products',productsRouter)

app.get('/', (req,res)=> {
    res.send('API de vendetuscosas.com')
})

app.listen(3000,()=>{
    console.log('Escuchando el puerto 3000')
});