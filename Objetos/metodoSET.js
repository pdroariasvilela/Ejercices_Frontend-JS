let persona = {
    nombre : 'Pedro',
    apellido : 'Arias',
    email : 'pedroariasvilela@gmail.com',
    edad : 28,
    idioma : 'es',
    get lang(){
        return this.idioma.toUpperCase();
    },

    set lang(lang){
        this.idioma = lang.toUpperCase();
    },

    get nombreCompleto (){
        return this.nombre + ' ' + this.apellido
    },
}
console.log(persona.lang)
persona.lang = 'en'
console.log(persona.lang)

