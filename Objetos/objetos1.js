

let persona = {
    nombre : 'Pedro',
    apellido : 'Arias',
    email : 'pedroariasvilela@gmail.com',
    edad : 28,
    nombreCompleto : function(){
        return this.nombre + ' ' + this.apellido
    },
}
console.log(persona.nombreCompleto())
console.log()