'use strict';

/**
 *  validator
 */

var validator = {
  isOverNumberLength: function(number) {
    var LIMITED_NUMBER_LENGTH = 10;
    var result = (!number)? false : (number.toString().length >= LIMITED_NUMBER_LENGTH);
    return result;
  },
  isOverDecimalPointLength: function(number) {
    var LIMITED_DECIMAL_POINT_LENGTH = 5;
    var belowPointNumber = number.toString().split('.')[1];
    var result = (!belowPointNumber)? false : (belowPointNumber >= LIMITED_DECIMAL_POINT_LENGTH);
    return result;
  }
};


/**
 *  ERROR_MSG
 */

var ERROR_MSG = (function(displayHandler) {
  var LIMITED_NUMBER_LENGTH = '숫자는 10자까지 입력할 수 있습니다.';
  var LIMITED_DECIMAL_POINT_LENGTH = '소수점 이하 5자까지 입력할 수 있습니다.';

  return {
    show: displayHandler,
    isOverNumberLength: function() { return LIMITED_NUMBER_LENGTH; },
    isOverDecimalPointLength: function() { return LIMITED_DECIMAL_POINT_LENGTH; }
  };
})(function(msg) { console.warn(msg); });



/**
 *  Calculator
 */

function Calculator() {
  this.validator = validator;
  this.ERROR_MSG = ERROR_MSG;
  this.resetAllData();
}

Calculator.prototype.add = function(x, y) {
  return parseFloat(x, 10) + parseFloat(y, 10);
};

Calculator.prototype.substract = function(x, y) {
  return parseFloat(x, 10) - parseFloat(y, 10);
};

Calculator.prototype.multiply = function(x, y) {
  return parseFloat(x, 10) * parseFloat(y, 10);
};

Calculator.prototype.divide = function(x, y) {
  return parseFloat(x, 10) / parseFloat(y, 10);
};

Calculator.prototype.resetAllData = function() {
  this.currentNumber = null;
  this.firstNumber = null;
  this.operator = null;
  this.secondNumber = null;
  this.resultNumber = null;
};

Calculator.prototype.updateCurrentNumber = function(number) {
  var number = parseFloat(number, 10);
  var isZero = (!this.currentNumber && !number);
  var isOverNumberLength = validator.isOverNumberLength(this.currentNumber);

  if (isZero) { return false; }
  if (isOverNumberLength) {
    ERROR_MSG.show(ERROR_MSG.isOverNumberLength());
    return false;
  }

  this.currentNumber = number;
};

Calculator.prototype._resetCurrentNumber = function() {
  this.currentNumber = null;
};

Calculator.prototype.saveFirstNumber = function(number) {
  this.firstNumber = number || this.currentNumber;
  this._resetCurrentNumber();
};

Calculator.prototype.saveSecondNumber = function(number) {
  this.secondNumber = number || this.currentNumber;
  this._resetCurrentNumber();
};

Calculator.prototype.saveOperator = function(operator) {
  this.operator = operator;
};

Calculator.prototype.saveResultNumber = function(resultNumber) {
  this.resultNumber = resultNumber;
};


/**
 *  CalcViewer
 */

function CalcViewer(displayHandler, refreshHandler) {
  this.displayHandler = displayHandler;
  this.refreshHandler = refreshHandler;
}

CalcViewer.prototype.displayValue = function(number) {
  var numberForViewer = this._handleValue(number);
  this.displayHandler(numberForViewer);
};

CalcViewer.prototype._handleValue = function(number) {
  var resultNumber = (!number) ? 0 : this._numberWithComma(number);
  return resultNumber;
}

CalcViewer.prototype._numberWithComma = function(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

CalcViewer.prototype.refresh = function() {
  this.refreshHandler && this.refreshHandler();
};


/**
 *  CalculatorManager
 */

function CalculatorManager(obj) {
  this.keyBoxElem = obj.keyBoxElem;
  this.calculator = new Calculator();
  this.viewer = new CalcViewer(obj.displayHandler);

  this._reset();  
}

CalculatorManager.prototype.registerEvent = function() {
  this.keyBoxElem.addEventListener('click', function(e) {
    e.preventDefault();

    var calculator = this.calculator;
    var viewer = this.viewer;

    var thisValue = e.target.value;
    var isNumber = /^[0-9]*$/.test(thisValue);
    var isPointer = (thisValue === '.');
    var isOperator = ['+', '-', '*', '/'].indexOf(thisValue) > - 1;
    var isResult = (thisValue === '=');
    var isReset = (thisValue === 'R');

    if (!(isNumber || isOperator || isPointer || isResult || isReset)) { return false; }

    if (isNumber) {
      this._updateNumber(thisValue);
      return;
    }

    if (isPointer) {
      this._changeDecimal();
      return;
    }

    if (isOperator) {
      this._updateOperator(thisValue);
      return;
    }

    if (isResult) {
      this._calculateResult();
      return;
    }

    if (isReset) {
      this._reset();
      return;
    }
  }.bind(this));
};

CalculatorManager.prototype._updateNumber = function(attachedNumber) {
  var calc = this.calculator;
  var viewer = this.viewer;
  var currentNumber = calc.currentNumber;
  var resultNumber;
  
  currentNumber = (currentNumber)? currentNumber.toString() : '';
  resultNumber = currentNumber + attachedNumber;

  if (calc.resultNumber) { calc.resetAllData(); }
  calc.updateCurrentNumber(resultNumber);
  viewer.displayValue(calc.currentNumber);
};

CalculatorManager.prototype._changeDecimal = function() {
  var calc = this.calculator;
  var viewer = this.viewer;
  var currentNumber = calc.currentNumber;
  var isInteger = parseInt(currentNumber, 10) === currentNumber;
  var resultNumber;

  currentNumber = (currentNumber)? currentNumber.toString() : '0';
  resultNumber = currentNumber + '.';

  calc.updateCurrentNumber(resultNumber);
  viewer.displayValue(resultNumber);
};

CalculatorManager.prototype._updateOperator = function(operator) {
  var calc = this.calculator;
  var viewer = this.viewer;

  calc.saveFirstNumber();
  calc.saveOperator(operator);
  viewer.refresh();
}

CalculatorManager.prototype._calculateResult = function() {
  var calc = this.calculator;
  var viewer = this.viewer;
  var operatorFunc = {
    '+': 'add',
    '-': 'substract',
    '*': 'multiply',
    '/': 'divide'
  }[calc.operator];
  var resultNumber;

  if (typeof calc[operatorFunc] !== 'function') { return; }

  if (calc.currentNumber) {
    calc.saveSecondNumber();
    resultNumber = calc[operatorFunc](calc.firstNumber, calc.secondNumber);
  } else {
    resultNumber = calc[operatorFunc](calc.resultNumber, calc.secondNumber);
  }

  calc.saveResultNumber(resultNumber);
  viewer.displayValue(calc.resultNumber);
};

CalculatorManager.prototype._reset = function() {
  var calc = this.calculator;
  var viewer = this.viewer;

  calc.resetAllData();
  viewer.displayValue();
};


