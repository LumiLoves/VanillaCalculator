'use strict';

/**
 *  validator
 */

const clacValidator = {
  isOverNumberLength: (number, limitLength) => {
    const result = (!number)? false : (number.toString().length >= limitLength);
    return result;
  },
  isOverDecimalPointLength: (number, limitLength) => {
    const belowPointNumber = number.toString().split('.')[1];
    const result = (!belowPointNumber)? false : (belowPointNumber.length >= limitLength);
    return result;
  }
};


/**
 *  ERROR_MSG
 */

const ERROR_MSG = ((displayHandler) => {
  const LIMITED_NUMBER_LENGTH = '숫자는 10자까지 입력할 수 있습니다.';
  const LIMITED_DECIMAL_POINT_LENGTH = '소수점 이하 5자까지 입력할 수 있습니다.';

  return {
    show: displayHandler,
    isOverNumberLength: () => LIMITED_NUMBER_LENGTH,
    isOverDecimalPointLength: () => LIMITED_DECIMAL_POINT_LENGTH
  };
})((msg) => { console.warn(msg); });


/**
 *  Calculator
 */

function Calculator(validator, errorMsg) {
  this.validator = clacValidator;
  this.ERROR_MSG = errorMsg;
  this.resetAllData();
}

Calculator.prototype = {
  resetAllData() {
    this.currentNumber = null;
    this.firstNumber = null;
    this.operator = null;
    this.secondNumber = null;
    this.resultNumber = null;
  },
  
  add(x, y) { return parseFloat(x, 10) + parseFloat(y, 10); },
  substract(x, y) { return parseFloat(x, 10) - parseFloat(y, 10); },
  multiply(x, y) { return parseFloat(x, 10) * parseFloat(y, 10); },
  divide(x, y) { return parseFloat(x, 10) / parseFloat(y, 10); },

  updateCurrentNumber(number) {
    const n = parseFloat(number, 10);
    const LIMITED_NUMBER_LENGTH = 10;
    const isZero = (!this.currentNumber && !n);
    const isOverNumberLength = this.validator.isOverNumberLength(this.currentNumber, LIMITED_NUMBER_LENGTH);

    if (isZero) { return false; }
    if (isOverNumberLength) {
      ERROR_MSG.show(ERROR_MSG.isOverNumberLength());
      return false;
    }

    this.currentNumber = n;
  },
  _resetCurrentNumber() {
    this.currentNumber = null;
  },
  saveFirstNumber(number) {
    this.firstNumber = number || this.currentNumber;
    this._resetCurrentNumber();
  },
  saveSecondNumber(number) {
    this.secondNumber = number || this.currentNumber;
    this._resetCurrentNumber();
  },
  saveOperator(operator) {
    this.operator = operator;
  },
  saveResultNumber(resultNumber) {
    this.resultNumber = resultNumber;
  }
}


/**
 *  CalcViewer
 */

function CalcViewer(displayHandler, refreshHandler) {
  this.displayHandler = displayHandler;
  this.refreshHandler = refreshHandler;
}

CalcViewer.prototype = {
  displayValue(number) {
    const numberForViewer = this._handleValue(number);
    this.displayHandler(numberForViewer);
  },
  _handleValue(number) {
    const resultNumber = (!number)? 0 : this._numberWithComma(number);
    return resultNumber;
  },
  _numberWithComma(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  refresh() {
    this.refreshHandler && this.refreshHandler();
  }
};


/**
 *  CalculatorManager
 */

function CalculatorManager(opt) {
  const validator = opt.validator || clacValidator;
  const errorMsg = opt.errorMsg || ERROR_MSG;

  this.calculator = new Calculator(validator, errorMsg);
  this.viewer = new CalcViewer(opt.displayHandler);
  this.dom = {
    wrapper: opt.dom.wrapper,
    numbers: opt.dom.numbers || opt.dom.wrapper.querySelectorAll('[data-role="number"]'),
    operators: opt.dom.operators || opt.dom.wrapper.querySelectorAll('[data-role="operator"]'),
    pointer: opt.dom.pointer || opt.dom.wrapper.querySelector('[data-role="pointer"]'),
    result: opt.dom.result || opt.dom.wrapper.querySelector('[data-role="result"]'),
    reset: opt.dom.reset || opt.dom.wrapper.querySelector('[data-role="reset"]')
  };

  this._reset();
}

CalculatorManager.prototype = {
  registerEvent() {
    this.dom.wrapper.addEventListener('click', (e) => {
      e.target.classList.contains('button') && e.preventDefault();
    });
    this._registerEventToNumberKey();
    this._registerEventToOperatorKey();
    this._registerEventToPointerKey();
    this._registerEventToResultKey();
    this._registerEventToResetKey();
  },
  _registerEventToNumberKey() {
    this.dom.numbers.forEach((elem) => {
      elem.addEventListener('click', ({ target }) => {
        this._updateNumber(target.dataset.value);
      });
    });
  },
  _registerEventToOperatorKey() {
    this.dom.operators.forEach((elem) => {
      elem.addEventListener('click', ({ target }) => {
        this._updateOperator(target.dataset.value);
      });
    });
  },
  _registerEventToPointerKey() {
    this.dom.pointer.addEventListener('click', ({ target }) => {
      this._changeDecimal();
    });
  },
  _registerEventToResultKey() {
    this.dom.result.addEventListener('click', ({ target }) => {
      this._calculateResult();
    });
  },
  _registerEventToResetKey() {
    this.dom.reset.addEventListener('click', ({ target }) => {
      this._reset();
    });
  },
  _updateNumber(attachedNumber) {
    const calc = this.calculator;
    const viewer = this.viewer;
    let currentNumber = calc.currentNumber;
    let resultNumber;
    
    currentNumber = (currentNumber)? currentNumber.toString() : '';
    resultNumber = currentNumber + attachedNumber;

    if (calc.resultNumber) { calc.resetAllData(); }
    calc.updateCurrentNumber(resultNumber);
    viewer.displayValue(calc.currentNumber);
  },
  _changeDecimal() {
    const calc = this.calculator;
    const viewer = this.viewer;
    let currentNumber = calc.currentNumber;
    const isInteger = parseInt(currentNumber, 10) === currentNumber;
    let resultNumber;

    currentNumber = (currentNumber)? currentNumber.toString() : '0';
    resultNumber = currentNumber + '.';

    calc.updateCurrentNumber(resultNumber);
    viewer.displayValue(resultNumber);
  },
  _updateOperator(operator) {
    const calc = this.calculator;
    const viewer = this.viewer;

    calc.saveFirstNumber();
    calc.saveOperator(operator);
    viewer.refresh();
  },
  _calculateResult() {
    const calc = this.calculator;
    const viewer = this.viewer;
    const operatorFunc = {
      '+': 'add',
      '-': 'substract',
      '*': 'multiply',
      '/': 'divide'
    }[calc.operator];
    let resultNumber;

    if (typeof calc[operatorFunc] !== 'function') { return; }

    if (calc.currentNumber) {
      calc.saveSecondNumber();
      resultNumber = calc[operatorFunc](calc.firstNumber, calc.secondNumber);
    } else {
      resultNumber = calc[operatorFunc](calc.resultNumber, calc.secondNumber);
    }

    calc.saveResultNumber(resultNumber);
    viewer.displayValue(calc.resultNumber);
  },
  _reset() {
    const calc = this.calculator;
    const viewer = this.viewer;

    calc.resetAllData();
    viewer.displayValue();
  }
};
