'use strict';

// Data
var calcAInfo = {
  keyBoxElem: document.querySelector('#calc-a .calculator-buttons'),
  viewerElem: document.querySelector('#calc-a .screen')
};

var calcBInfo = {
  keyBoxElem: document.querySelector('#calc-b .calculator-buttons'),
  viewerElem: document.querySelector('#calc-b .screen')
};


// Instance
var calcA = new CalculatorManager({
  keyBoxElem: calcAInfo.keyBoxElem,
  displayHandler: function(output) {
    calcAInfo.viewerElem.value = output;
  }
});

var calcB = new CalculatorManager({
  keyBoxElem: calcBInfo.keyBoxElem,
  displayHandler: function(output) {
    calcBInfo.viewerElem.value = output;
  }
});




document.addEventListener('DOMContentLoaded', function(e) {
  calcA.registerEvent();
  calcB.registerEvent();
});