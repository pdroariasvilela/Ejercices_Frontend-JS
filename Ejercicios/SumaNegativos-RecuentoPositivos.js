// Dada una matriz de enteros.

// Devuelve una matriz, donde el primer elemento es el recuento de números positivos y el segundo elemento es la suma de números negativos. 0 no es ni positivo ni negativo.

// Si la entrada es una matriz vacía o es nula, devuelve una matriz vacía.
// Ejemplo

// para entrada [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, -11, -12, -13, -14, -15], deberías volver [10, -65].


function countPositivesSumNegatives(input) {
    // your code here
    let nuevaData = [];
    
    let positivos = [];
    
    let negativo = [];
    
    let b = 0
    
    for( let i = 0 ; i < input.length ; i++){
      
      if(!input[i] == 0 && input[i] > 0){
        positivos.push(input[i]) 
        
      } else if(input[i]< 0){
        negativo.push(input[i])
        b = negativo.reduce((a,b)=> a+b , 0)
      } 
      
    }
    
    nuevaData.push(positivos.length , b)
    return nuevaData
    
    //RESULETO//
  }
  
  countPositivesSumNegatives([0, 2, 3, 0, 5, 6, 7, 8, 9, 10, -11, -12, -13, -14])
  