/*!
 * Sakura.js 1.1.1
 * Vanilla JS version of jQuery-Sakura: Make it rain sakura petals.
 * https://github.com/jhammann/sakura
 *
 * Copyright 2019-2026 Jeroen Hammann
 *
 * Released under the MIT License
 *
 * Released on: October 9, 2026
 */
"use strict";

var Sakura = function Sakura(selector, options) {
  var _this = this;
  if (typeof selector === 'undefined') {
    throw new Error('No selector present. Define an element.');
  }
  this.el = document.querySelector(selector);

  // Defaults for the option object, which gets extended below.
  var defaults = {
    className: 'sakura',
    // Classname of the petal. This corresponds with the css.
    fallSpeed: 1,
    // Speed factor in which the petal falls (higher is slower).
    maxSize: 14,
    // The maximum size of the petal.
    minSize: 10,
    // The minimum size of the petal.
    delay: 300,
    // Delay between petals.
    colors: [{
      // You can add multiple colors (chosen randomly) by adding elements to the array.
      gradientColorStart: 'rgba(255, 183, 197, 0.9)',
      // Gradient color start (rgba).
      gradientColorEnd: 'rgba(255, 197, 208, 0.9)',
      // Gradient color end (rgba).
      gradientColorDegree: 120 // Gradient degree angle.
    }],
    lifeTime: 0,
    // Maximum lifetime of the petal in milliseconds (0 disables the limit).
    position: 'auto',
    // Fixed for the body, absolute for other containers.
    hideScrollbars: true // Hide horizontal scrollbars on the target element.
  };

  // Merge defaults with user options.
  var extend = function extend(originalObj, newObj) {
    Object.keys(originalObj).forEach(function (key) {
      if (newObj && Object.prototype.hasOwnProperty.call(newObj, key)) {
        var origin = originalObj;
        origin[key] = newObj[key];
      }
    });
    return originalObj;
  };
  this.settings = extend(defaults, options);

  // Track active petals and their optional lifetime timers.
  this.petals = new Map();
  this.removePetal = function (petal) {
    clearTimeout(_this.petals.get(petal));
    _this.petals.delete(petal);
    petal.remove();
  };
  var petalPosition = this.settings.position;
  if (petalPosition === 'auto') {
    petalPosition = this.el === document.body ? 'fixed' : 'absolute';
  }

  // Allow pages with sticky elements to preserve their overflow styles.
  if (this.settings.hideScrollbars) {
    this.el.style.overflowX = 'hidden';
  }

  // Random array element
  function randomArrayElem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Random integer
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Check for animation events.
  var prefixes = ['webkit', 'moz', 'MS', 'o', ''];
  function PrefixedEvent(element, type, callback) {
    for (var p = 0; p < prefixes.length; p += 1) {
      var animType = type;
      if (!prefixes[p]) {
        animType = type.toLowerCase();
      }
      element.addEventListener(prefixes[p] + animType, callback, false);
    }
  }

  // Check if the element is in the viewport.
  function elementInViewport(el) {
    var rect = el.getBoundingClientRect();
    return rect.bottom > 0 && rect.right > 0 && rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.left < (window.innerWidth || document.documentElement.clientWidth);
  }
  this.createPetal = function () {
    if (!_this.el.dataset.sakuraAnimId) {
      return;
    }
    _this.createTimer = setTimeout(function () {
      _this.el.setAttribute('data-sakura-anim-id', window.requestAnimationFrame(_this.createPetal));
    }, _this.settings.delay);

    // Name the animations. These have to match the animations in the CSS file.
    var animationNames = {
      blowAnimations: ['blow-soft-left', 'blow-medium-left', 'blow-soft-right', 'blow-medium-right'],
      swayAnimations: ['sway-0', 'sway-1', 'sway-2', 'sway-3', 'sway-4', 'sway-5', 'sway-6', 'sway-7', 'sway-8']
    };

    // Get one random animation of each type and randomize fall time of the petals
    var blowAnimation = randomArrayElem(animationNames.blowAnimations);
    var swayAnimation = randomArrayElem(animationNames.swayAnimations);
    var fallTime = (document.documentElement.clientHeight * 0.007 + Math.round(Math.random() * 5)) * _this.settings.fallSpeed;

    // Create animations
    var animationsArr = ["fall ".concat(fallTime, "s linear 0s 1 forwards"), "".concat(blowAnimation, " ").concat((fallTime > 30 ? fallTime : 30) - 20 + randomInt(0, 20), "s linear 0s infinite"), "".concat(swayAnimation, " ").concat(randomInt(2, 4), "s linear 0s infinite")];
    var animations = animationsArr.join(', ');

    // Create petal and give it a random size.
    var petal = document.createElement('div');
    petal.classList.add(_this.settings.className);
    var height = randomInt(_this.settings.minSize, _this.settings.maxSize);
    var width = height - Math.floor(randomInt(0, _this.settings.minSize) / 3);

    // Get a random color.
    var color = randomArrayElem(_this.settings.colors);
    petal.style.position = petalPosition;
    petal.style.background = "linear-gradient(".concat(color.gradientColorDegree, "deg, ").concat(color.gradientColorStart, ", ").concat(color.gradientColorEnd, ")");
    petal.style.webkitAnimation = animations;
    petal.style.animation = animations;
    petal.style.borderRadius = "".concat(randomInt(_this.settings.maxSize, _this.settings.maxSize + Math.floor(Math.random() * 10)), "px ").concat(randomInt(1, Math.floor(width / 4)), "px");
    petal.style.height = "".concat(height, "px");
    petal.style.left = "".concat(Math.random() * document.documentElement.clientWidth - 100, "px");
    petal.style.marginTop = "".concat(-(Math.floor(Math.random() * 20) + 15), "px");
    petal.style.width = "".concat(width, "px");

    // Always remove petals when their fall animation ends.
    PrefixedEvent(petal, 'AnimationEnd', function (event) {
      if (event.animationName === 'fall') {
        _this.removePetal(petal);
      }
    });

    // Remove petals that float out of the viewport.
    PrefixedEvent(petal, 'AnimationIteration', function () {
      if (!elementInViewport(petal)) {
        _this.removePetal(petal);
      }
    });
    var lifeTimer = _this.settings.lifeTime ? setTimeout(function () {
      return _this.removePetal(petal);
    }, _this.settings.lifeTime) : null;
    _this.petals.set(petal, lifeTimer);

    // Add the petal to the target element.
    _this.el.appendChild(petal);
  };
  this.el.setAttribute('data-sakura-anim-id', window.requestAnimationFrame(this.createPetal));
};
Sakura.prototype.start = function () {
  var animId = this.el.dataset.sakuraAnimId;
  if (!animId) {
    this.el.setAttribute('data-sakura-anim-id', window.requestAnimationFrame(this.createPetal));
  } else {
    throw new Error('Sakura is already running.');
  }
};
Sakura.prototype.stop = function () {
  var _this2 = this;
  var graceful = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var animId = this.el.dataset.sakuraAnimId;
  clearTimeout(this.createTimer);
  if (animId) {
    window.cancelAnimationFrame(animId);
    this.el.setAttribute('data-sakura-anim-id', '');
  }

  // Remove all current blossoms at once.
  // You can also set 'graceful' to true to stop new petals from being created.
  // This way the petals won't be removed abruptly.
  if (!graceful) {
    this.petals.forEach(function (timer, petal) {
      _this2.removePetal(petal);
    });
  }
};