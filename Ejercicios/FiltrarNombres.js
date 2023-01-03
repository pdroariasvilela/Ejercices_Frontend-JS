
//RESUELTO

function filterNames(names, maxLength) {
  
    const result = names.filter(names  => names.length <= maxLength);

    result;
  }
  
  
  filterNames(['Juan', 'Ana', 'Fernando', 'Magnanimo','ped'] , 3)