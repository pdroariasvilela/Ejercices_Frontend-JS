// NaN = Not a Number

let miNumero = '18g';

// console.log( typeof miNumero)

let edad = Number(miNumero);

if(isNaN(edad)){
    console.log('No es un numero')
}else if(edad >= 18){
    console.log('Puede votar')
} else{
    console.log('No puede votar')
}

let votar = (edad >= 18) ? 'Puede votar' : 'No puede votar'
console.log(votar)
