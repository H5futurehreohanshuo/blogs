function zipCode(code, location) {
  // 这样 _code 和 _location 就可以看做函数中的私有变量了，外部无法访问
  let _code = code;
  let _location = location || '';
  
  return {
    code: function() {
      return _code;
    },
    location: function() {
      return _location;
    },
    fromString: function(str) {
      let parts = str.split('-');
      return zipCode(parts[0], parts[1]);
    },
    toString: function() {
      return _code + '-' + _location;
    }
  };
}

const pricetonZip = zipCode('08544', '22345');
console.log(pricetonZip.code());