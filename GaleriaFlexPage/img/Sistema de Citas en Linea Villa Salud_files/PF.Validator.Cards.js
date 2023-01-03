PF.Validator.Cards={
	cardTypes: [
      {
        name: 'amex',
        code : 'AMEX',
        range: '34,37',
        valid_length: [15],
        format: 'xxxx xxxxxxx xxxx'
      }, {
        name: 'diners_club_international',
        code : 'DINC',
        range: '36',
        valid_length: [14],
        format: 'xxxx xxxx xxxx xx'
      }, {
        name: 'visa_electron',
        code : 'VISA',
        range: '4026, 417500, 4508, 4844, 4913, 4917',
        valid_length: [16],
        format: 'xxxx xxxx xxxx xxxx'
      }, {
        name: 'visa',
        code : 'VISA',
        range: '4',
        valid_length: [13, 14, 15, 16, 17, 18, 19],
        format: 'xxxx xxxx xxxx xxxx'
      }, {
        name: 'mastercard',
        range: '51-55,2221-2720',
        code : 'MSCD',
        valid_length: [16],
        format: 'xxxx xxxx xxxx xxxx'
      }, {
        name: 'maestro',
        range: '50, 56-69',
        code : 'MSCD',
        valid_length: [12, 13, 14, 15, 16, 17, 18, 19],
        format: 'xxxx xxxx xxxx xxxx'
      }
    ],
	indexOf : [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
	Trie: (function() {
	    function Trie() {
	      this.trie = {};
	    }
	    Trie.prototype.push = function(value) {
	      var char, i, j, len, obj, ref, results;
	      value = value.toString();
	      obj = this.trie;
	      ref = value.split('');
	      results = [];
	      for (i = j = 0, len = ref.length; j < len; i = ++j) {
	        char = ref[i];
	        if (obj[char] == null) {
	          if (i === (value.length - 1)) {
	            obj[char] = null;
	          } else {
	            obj[char] = {};
	          }
	        }
	        results.push(obj = obj[char]);
	      }
	      return results;
	    };

	    Trie.prototype.find = function(value) {
	      var char, i, j, len, obj, ref;
	      value = value.toString();
	      obj = this.trie;
	      ref = value.split('');
	      for (i = j = 0, len = ref.length; j < len; i = ++j) {
	        char = ref[i];
	        if (obj.hasOwnProperty(char)) {
	          if (obj[char] === null) {
	            return true;
	          }
	        } else {
	          return false;
	        }
	        obj = obj[char];
	      }
	    };
	    return Trie;
	 })(),
	 Range : (function() {
	    function Range(trie1) {
	      this.trie = trie1;
	      if (this.trie.constructor !== PF.Validator.Cards.Trie) {
	        throw Error('Range constructor requires a Trie parameter');
	      }
	    }

	    Range.rangeWithString = function(ranges) {
	      var j, k, len, n, r, range, ref, ref1, trie;
	      if (typeof ranges !== 'string') {
	        throw Error('rangeWithString requires a string parameter');
	      }
	      ranges = ranges.replace(/ /g, '');
	      ranges = ranges.split(',');
	      trie = new PF.Validator.Cards.Trie;
	      for (j = 0, len = ranges.length; j < len; j++) {
	        range = ranges[j];
	        if (r = range.match(/^(\d+)-(\d+)$/)) {
	          for (n = k = ref = r[1], ref1 = r[2]; ref <= ref1 ? k <= ref1 : k >= ref1; n = ref <= ref1 ? ++k : --k) {
	            trie.push(n);
	          }
	        } else if (range.match(/^\d+$/)) {
	          trie.push(range);
	        } else {
	          throw Error("Invalid range '" + r + "'");
	        }
	      }
	      return new Range(trie);
	    };

	    Range.prototype.match = function(number) {
	      return this.trie.find(number);
	    };

	    return Range;
	})(),	
	validateCard:function(callback, options) {
	    var bind, card, card_type, card_types, get_card_type, is_valid_length, is_valid_luhn, j, len, normalize, ref, validate, validate_number;
	    card_types = PF.Validator.Cards.cardTypes;
	    bind = false;
	    if (callback) {
	      if (typeof callback === 'object') {
	        options = callback;
	        bind = false;
	        callback = null;
	      } else if (typeof callback === 'function') {
	        bind = true;
	      }
	    }
	    if (options == null) {
	      options = {};
	    }
	    if (options.accept == null) {
	      options.accept = (function() {
	        var j, len, results;
	        results = [];
	        for (j = 0, len = card_types.length; j < len; j++) {
	          card = card_types[j];
	          results.push(card.code);
	        }
	        return results;
	      })();
	    }
	    ref = options.accept;
	    for (j = 0, len = ref.length; j < len; j++) {
	      card_type = ref[j];
	      if (PF.Validator.Cards.indexOf.call((function() {
	        var k, len1, results;
	        results = [];
	        for (k = 0, len1 = card_types.length; k < len1; k++) {
	          card = card_types[k];
	          results.push(card.code);
	        }
	        return results;
	      })(), card_type) < 0) {
	        throw Error("Credit card type '" + card_type + "' is not supported");
	      }
	    }
	    get_card_type = function(number) {
	      var k, len1, r, ref1;
	      ref1 = (function() {
	        var l, len1, ref1, results;
	        results = [];
	        for (l = 0, len1 = card_types.length; l < len1; l++) {
	          card = card_types[l];
	          if (ref1 = card.code, PF.Validator.Cards.indexOf.call(options.accept, ref1) >= 0) {
	            results.push(card);
	          }
	        }
	        return results;
	      })();
	      for (k = 0, len1 = ref1.length; k < len1; k++) {
	        card_type = ref1[k];
	        r = PF.Validator.Cards.Range.rangeWithString(card_type.range);
	        if (r.match(number)) {
	          return card_type;
	        }
	      }
	      return null;
	    };
	    var get_possible_card_type=function(number){
	    	 var k, len1, possibleValues=[],_possibleValues={};
		 	 var validCards = (function() {
		        var l, len1, ref1, validCardsList;
		        validCardsList = [];
		        for (l = 0, len1 = card_types.length; l < len1; l++) {
		          var currentCard = card_types[l];
		          if (ref1 = currentCard.code, PF.Validator.Cards.indexOf.call(options.accept, ref1) >= 0) {
		        	  validCardsList.push(currentCard);
		          }
		        }
		        return validCardsList;
		      })();
		      for (k = 0, len1 = validCards.length; k < len1; k++) {
		    	  var current_card_type = validCards[k];
		    	  var cardTypeRanges=current_card_type.range.split(',');
		    	  var posibleValue=null;
		    	  PF.DOM.each(cardTypeRanges,function(index,cardTypeRange){
		    		  
		    		  if(cardTypeRange.indexOf(number)==0){
		    			  posibleValue=current_card_type.code;
		    		  }
		    	  })
		    	  if(posibleValue){
		    		  _possibleValues[posibleValue]=posibleValue;
		    		  
		    	  }
		      }
		      for(var _possibleValue in _possibleValues){
		    	  possibleValues.push(_possibleValue);  
		      }
		      return possibleValues;
	    };
	    
	    is_valid_luhn = function(number) {
	      var digit, k, len1, n, ref1, sum;
	      sum = 0;
	      ref1 = number.split('').reverse();
	      for (n = k = 0, len1 = ref1.length; k < len1; n = ++k) {
	        digit = ref1[n];
	        digit = +digit;
	        if (n % 2) {
	          digit *= 2;
	          if (digit < 10) {
	            sum += digit;
	          } else {
	            sum += digit - 9;
	          }
	        } else {
	          sum += digit;
	        }
	      }
	      return sum % 10 === 0;
	    };
	    is_valid_length = function(number, card_type) {
	      var ref1;
	      return ref1 = number.length, PF.Validator.Cards.indexOf.call(card_type.valid_length, ref1) >= 0;
	    };
	    validate_number = function(number) {
	      var cardNumber=number.replace(new RegExp(' ', 'g'),'');
	      var length_valid, luhn_valid;
	      card_type = get_card_type(cardNumber);
	      var possible_card_type=get_possible_card_type(cardNumber);
	      luhn_valid = false;
	      length_valid = false;
	      if (card_type != null) {
	        luhn_valid = is_valid_luhn(cardNumber);
	        length_valid = is_valid_length(cardNumber, card_type);
	      }
	      return {
	        card_type: card_type,
	        valid: luhn_valid && length_valid,
	        luhn_valid: luhn_valid,
	        possible_card_type:possible_card_type,
	        length_valid: length_valid
	      };
	    };
	    validate = (function(_this) {
	      return function() {
	        var number;
	        number = normalize(options.cardValue);
	        return validate_number(number);
	      };
	    })(this);
	    normalize = function(number) {
	      return number.replace(/[ -]/g, '');
	    };
	    if (!bind) {
	      return validate();
	    }else{
	    	callback.call(this, validate());
	    }
	}
}