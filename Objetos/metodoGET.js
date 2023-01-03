let persona = {
    nombre : 'Pedro',
    apellido : 'Arias',
    email : 'pedroariasvilela@gmail.com',
    edad : 28,
     get nombreCompleto (){
        return this.nombre + ' ' + this.apellido
    },
}
console.log(persona.nombreCompleto)

// SE AGREGA GET Y SE ELIMINA  FUNCTION()

