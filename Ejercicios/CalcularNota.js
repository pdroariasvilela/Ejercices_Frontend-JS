function getGrade (s1, s2, s3) {
  
    let nota = (s1 + s2 + s3) / 3
  
    console.log(nota)
  
    if( nota >= 90 &&  nota <= 100 ){
      console.log('A')
      return 'A'
    } else if (nota >= 80 &&  nota < 90){
      console.log('B')
      return 'B'
    } else if (nota >= 70 &&  nota < 80){
      console.log('C')
      return 'C'
    }else if (nota >= 60 &&  nota < 70){
      console.log('D')
      return 'D'
    }else if (nota >= 0 &&  nota < 60){
      console.log('F')
    }
    // Code here
  }
  
  getGrade(44,55,52)