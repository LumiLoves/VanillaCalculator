'use strict';

function main() {
  const calcAWrapper = document.querySelector('#calc-a');
  const calcBWrapper = document.querySelector('#calc-b');
 
  const calcA = new CalculatorManager({
    validator: clacValidator,
    errorMsg: ERROR_MSG,
    dom: {
      wrapper: calcAWrapper,
      numbers: calcAWrapper.querySelectorAll('[data-role="number"]'),
      operators: calcAWrapper.querySelectorAll('[data-role="operator"]'),
      pointer: calcAWrapper.querySelector('[data-role="pointer"]'),
      result: calcAWrapper.querySelector('[data-role="result"]'),
      reset: calcAWrapper.querySelector('[data-role="reset"]')
    },
    displayHandler: function(output) {
      calcAWrapper.querySelector('.screen').value = output;
    }
  });

  const calcB = new CalculatorManager({
    dom: {
      wrapper: calcBWrapper
    },
    displayHandler: function(output) {
      calcBWrapper.querySelector('.screen').value = output;
    }
  });

  calcA.registerEvent();
  calcB.registerEvent();
}

document.addEventListener('DOMContentLoaded', main);