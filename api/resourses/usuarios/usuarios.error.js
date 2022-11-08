class DatosDeUsuarioYaEnUso extends Error {
    constructor(message){
        super(message)
        this.message = message || 'El email o usuario ya estan asociados con una cuenta'
        this.status = 409
        this.name = "DatosDeUsuarioYaEnUso"
    }
}

class CredencialesIncorrectas extends Error {
    constructor(message){
        super(message)
        this.message = message || 'Credenciales incorrectas. Asegure que el username y contraseña sean correctas'
        this.status = 409
        this.name = "Credenciales"
    }
}

module.exports = {
    DatosDeUsuarioYaEnUso,
    CredencialesIncorrectas
}