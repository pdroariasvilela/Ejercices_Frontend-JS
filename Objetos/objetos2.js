let persona = new Object

persona.nombre = 'Pedro'
persona.email = 'pedro@gmail.com'

console.log(persona.nombre)

for(nombreNuevo in persona){
    console.log(nombreNuevo)
    console.log(persona[nombreNuevo])
}