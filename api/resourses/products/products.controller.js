const Producto = require('./products.model')

//retorna promesas
function crearProducto(producto, dueño){
    return new Producto({
        ...producto,
        dueño
    }).save()
}

function obtenerProductos(){
    return Producto.find({})
}

function obtenerProducto(id){
    return Producto.findById(id)
}

function borrarProducto(id){
    return Producto.findByIdAndRemove(id)
}

function reemplazarProducto(id,producto,username){
    return Producto.findOneAndUpdate({_id:id},{...producto,dueño:username},{new:true}) //regres el objeto modificado
}

module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProducto,
    borrarProducto,
    reemplazarProducto
}