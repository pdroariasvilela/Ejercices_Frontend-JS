function saludo(nombre) {

    if(nombre){
  
      console.log('Hola,' + nombre + ' un gusto conocerte')
      // return 'Hola,'+ nombre + ' un gusto conocerte'
    } else{
      console.log('Hola! No se tu nombre pero es un gusto conocerte')
      // return 'Hola! No se tu nombre pero es un gusto conocerte'
    }
      // completa el cuerpo de esta función
    
  }
  
  // No modifiques la siguiente linea:
  saludo('Maria');
  
  // Completa la función saludo que recibe un nombre de manera opcional. Si pasamos un 
  // nombre a la función saludo, esta debe retornar el texto 'Hola [nombre], un gusto conocerte'. 
  // Donde [nombre] es el nombre que le pasamos a la función. Si no pasamos un nombre, la 
  // función deberá retornar el texto 'Hola! No se tu nombre pero es un gusto conocerte'. 
  // Por ejemplo, si nombre es Ana, la función debe retornar el texto 'Hola Ana, un gusto 
  // conocerte'.