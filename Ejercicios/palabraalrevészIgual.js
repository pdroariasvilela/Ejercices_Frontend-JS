
//RESUELTO//

function palabrita(letras){


    letras = letras.toLocaleLowerCase()
    
    if(letras === [...letras].reverse().join('')){
      console.log(true)
      
    } else console.log(false)
  }
  
  palabrita('Madam')
  