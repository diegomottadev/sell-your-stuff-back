const mongoose  = require('mongoose')

const productosSchema = new mongoose.Schema({
    titulo:{
        type: String,
        require: [true, 'Producto debe tener un titulo']
    },
    precio:{
        type: Number,
        min:0,
        require:[true, 'Producto debe tener una precio']
    },
    moneda:{
        type: String,
        maxlength:3,
        minlength:3,
        require:[true, 'Producto debe tener una precio']
    },
    dueño:{
        type: String,
        require:[true, 'Producto debe tener un dueño']
    },
})

module.exports = mongoose.model('producto',productosSchema)