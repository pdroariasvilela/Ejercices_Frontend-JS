//RESUELTO//

var num = [1, 0, 1, 1, 0, 0]
var sum = 0

for( var i = 0 ; i < num.length ; i++){

    sum = sum + num[i]* 2 **(num.length - 1 - i)

}

console.log(sum)

// number.length-1 es el último índice de la matriz number


//OTRA SOLUCION:;

const binaryArrayToNumber = arr => {
    return parseInt(arr.join(""), 2)
  };

//Aquí solo usamos la función estándar parseInt(); en Primer argumento - arr.join("") - .join("") 
//convierte arr de la vista [0,0,0,1] a '0001' en el segundo argumento - 2 - se refiere al sistema binario 
//   utilizado para la conversión. 







