let miNumero = '18';

// console.log( typeof miNumero)

let edad = Number(miNumero);

if(edad >= 18){
    console.log('Puede votar')
} else{
    console.log('No puede votar')
}

let votar = (edad >= 18) ? 'Puede votar' : 'No puede votar'
console.log(votar)

