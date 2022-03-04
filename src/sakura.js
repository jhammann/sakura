const Sakura = function(selector, options) {
  if (typeof selector === 'undefined') {
    throw new Error('No selector present. Define an element.');
  }

  this.el = document.querySelector(selector);

  // Defaults for the option object, which gets extended below.
  const defaults = {
    className: 'sakura', // Classname of the petal. This corresponds with the css.
    fallSpeed: 1, // Speed factor in which the petal falls (higher is slower).
    maxSize: 14, // The maximum size of the petal.
    minSize: 10, // The minimum size of the petal.
    delay: 300, // Delay between petals.
    colors: [
      {
        // You can add multiple colors (chosen randomly) by adding elements to the array.
        gradientColorStart: 'rgba(255, 183, 197, 0.9)', // Gradient color start (rgba).
        gradientColorEnd: 'rgba(255, 197, 208, 0.9)', // Gradient color end (rgba).
        gradientColorDegree: 120, // Gradient degree angle.
      },
    ],
    lifeTime: 0, // Lifetime of the petal.
  };

  // Merge defaults with user options.
  const extend = function(originalObj, newObj) {
    Object.keys(originalObj).forEach(key => {
      if (newObj && Object.prototype.hasOwnProperty.call(newObj, key)) {
        const origin = originalObj;
        origin[key] = newObj[key];
      }
    });

    return originalObj;
  };

  this.settings = extend(defaults, options);

  // Dictionary for remove the petals by timestamp + lifetime
  this.petalsWeak = new Map();

  // Every sec check petals for remove (by lifeTime)
  setInterval(() => {
    if (!this.settings.lifeTime)
      return;

    const keysForRemove = [];
    const stamp = Date.now();

    for (const [key, value] of this.petalsWeak) {
      if (key + this.settings.lifeTime < stamp) {
        keysForRemove.push(key);
        value.remove();
      }
    }

    for (const key of keysForRemove) {
      this.petalsWeak.delete(key);
    }
  }, 1000);

  // Hide horizontal scrollbars on the target element.
  this.el.style.overflowX = 'hidden';

  // Random array element
  function randomArrayElem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Random integer
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Check for animation events.
  const prefixes = ['webkit', 'moz', 'MS', 'o', ''];
  function PrefixedEvent(element, type, callback) {
    for (let p = 0; p < prefixes.length; p += 1) {
      let animType = type;

      if (!prefixes[p]) {
        animType = type.toLowerCase();
      }

      element.addEventListener(prefixes[p] + animType, callback, false);
    }
  }

  // Check if the element is in the viewport.
  function elementInViewport(el) {
    const rect = el.getBoundingClientRect();

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  this.createPetal = () => {
    if (this.el.dataset.sakuraAnimId) {
      setTimeout(() => {
        window.requestAnimationFrame(this.createPetal);
      }, this.settings.delay);
    }

    // Name the animations. These have to match the animations in the CSS file.
    const animationNames = {
      blowAnimations: [
        'blow-soft-left',
        'blow-medium-left',
        'blow-soft-right',
        'blow-medium-right',
      ],
      swayAnimations: [
        'sway-0',
        'sway-1',
        'sway-2',
        'sway-3',
        'sway-4',
        'sway-5',
        'sway-6',
        'sway-7',
        'sway-8',
      ],
    };

    // Get one random animation of each type and randomize fall time of the petals
    const blowAnimation = randomArrayElem(animationNames.blowAnimations);
    const swayAnimation = randomArrayElem(animationNames.swayAnimations);
    const fallTime =
      (document.documentElement.clientHeight * 0.007 +
        Math.round(Math.random() * 5)) *
      this.settings.fallSpeed;

    // Create animations
    const animationsArr = [
      `fall ${fallTime}s linear 0s 1`,
      `${blowAnimation} ${(fallTime > 30 ? fallTime : 30) -
        20 +
        randomInt(0, 20)}s linear 0s infinite`,
      `${swayAnimation} ${randomInt(2, 4)}s linear 0s infinite`,
    ];
    const animations = animationsArr.join(', ');

    // Create petal and give it a random size.
    const petal = document.createElement('div');
    petal.classList.add(this.settings.className);
    const height = randomInt(this.settings.minSize, this.settings.maxSize);
    const width = height - Math.floor(randomInt(0, this.settings.minSize) / 3);

    // Get a random color.
    const color = randomArrayElem(this.settings.colors);

    petal.style.background = `linear-gradient(${color.gradientColorDegree}deg, ${color.gradientColorStart}, ${color.gradientColorEnd})`;
    petal.style.webkitAnimation = animations;
    petal.style.animation = animations;
    petal.style.borderRadius = `${randomInt(
      this.settings.maxSize,
      this.settings.maxSize + Math.floor(Math.random() * 10),
    )}px ${randomInt(1, Math.floor(width / 4))}px`;
    petal.style.height = `${height}px`;
    petal.style.left = `${Math.random() * document.documentElement.clientWidth -
      100}px`;
    petal.style.marginTop = `${-(Math.floor(Math.random() * 20) + 15)}px`;
    petal.style.width = `${width}px`;

    // Remove petals of which the animation ended.
    PrefixedEvent(petal, 'AnimationEnd', () => {
      if (!elementInViewport(petal)) {
        petal.remove();
      }
    });

    // Remove petals that float out of the viewport.
    PrefixedEvent(petal, 'AnimationIteration', () => {
      if (!elementInViewport(petal)) {
        petal.remove();
      }
    });

    // Added petals in weakMap by stamp
    this.petalsWeak.set(Date.now(), petal);

    // Add the petal to the target element.
    this.el.appendChild(petal);
  };

  this.el.setAttribute(
    'data-sakura-anim-id',
    window.requestAnimationFrame(this.createPetal),
  );
};

Sakura.prototype.start = function() {
  const animId = this.el.dataset.sakuraAnimId;
  if (!animId) {
    this.el.setAttribute(
      'data-sakura-anim-id',
      window.requestAnimationFrame(this.createPetal),
    );
  } else {
    throw new Error('Sakura is already running.');
  }
};

Sakura.prototype.stop = function(graceful = false) {
  const animId = this.el.dataset.sakuraAnimId;
  if (animId) {
    window.cancelAnimationFrame(animId);
    this.el.setAttribute('data-sakura-anim-id', '');
  }

  // Remove all current blossoms at once.
  // You can also set 'graceful' to true to stop new petals from being created.
  // This way the petals won't be removed abruptly.
  if (!graceful) {
    setTimeout(() => {
      const petals = document.getElementsByClassName(this.settings.className);
      while (petals.length > 0) {
        petals[0].parentNode.removeChild(petals[0]);
      }
    }, this.settings.delay + 50);
  }
};
