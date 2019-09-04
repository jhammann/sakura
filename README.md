# Sakura.js
Sakura.js is an improved vanilla JS version of the [jQuery-Sakura](https://github.com/almightynay/jQuery-Sakura) plugin. It makes it rain petals on a (section) of your page. _Credits to the original creator of the jQuery plugin._ I made this plugin because I wanted a tweaked vanilla JS version with NPM support.

Sakura.js (like its original jQuery plugin) uses CSS3 animations and `requestAnimationFrame` to add elements which look like blossom petals to the DOM. You can add it on any element like the body, a div etc. They will animate on your page influenced by wind and gravity. Of course this doesn't have to be limited to blossom petals. It can be regular leafs as well or something completely different.

![](https://i.imgur.com/Qvmj4sM.gif)

## Demo
You can check a demo here: [jhammann.github.io/sakura/](https://jhammann.github.io/sakura/)

## Install
You can install Sakura.js with NPM:

```bash
$ npm install sakura-js
```

Or with Yarn if you prefer:

```bash
$ yarn add sakura-js
```

## Setup
Include the Sakura.js files inside your page and initialize it within your javascript.
Below code shows the petals in your body (see the [demo](https://jhammann.github.io/sakura/) for the results).

```html
<!DOCTYPE html>
<html lang="en">
<head>
    ...
    <link rel="stylesheet" href="path/to/sakura.min.css">
</head>
<body>
    ...
    <script src="path/to/sakura.min.js"></script>
    <script>
      var sakura = new Sakura('body');
    </script>
</body>
</html>
```

## Options

| Name                         | Description                                                                                                                                        | Type    | Default                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------- |
| `className`                  | Classname of the petals. This corresponds with the Sakura CSS.                                                                                     | String  | 'sakura'                   |
| `fallSpeed`                  | Speed factor in which the petal falls (the higher the number the slower it falls).                                                                 | Integer | 1                          |
| `maxSize`                    | The maximum size of the petals.                                                                                                                    | Integer | 14                         |
| `minSize`                    | The minimum size of the petals.                                                                                                                    | Integer | 10                         |
| `delay`                      | The delay between petals (in ms). If you increase it, it will take longer for a new petal to drop and vice versa.                                  | Integer | 300                        |
| `colors.gradientColorStart`  | The petals are made with a [linear-gradient](https://developer.mozilla.org/en-US/docs/Web/CSS/linear-gradient). This is the start color (in rgba). | String  | 'rgba(255, 183, 197, 0.9)' |
| `colors.gradientColorEnd`    | The linear-gradient end color (in rgba).                                                                                                           | String  | 'rgba(255, 197, 208, 0.9)' |
| `colors.gradientColorDegree` | The degree in which the linear-gradient tilts.                                                                                                     | Integer | 120                        |

##### Adding multiple colors
You can add multiple colors like the example below. Colors are randomly picked.

```js
var sakura = new Sakura('body', {
    colors: [
        {
            gradientColorStart: 'rgba(255, 183, 197, 0.9)',
            gradientColorEnd: 'rgba(255, 197, 208, 0.9)',
            gradientColorDegree: 120,
        },
        {
            gradientColorStart: 'rgba(255,189,189)',
            gradientColorEnd: 'rgba(227,170,181)',
            gradientColorDegree: 120,
        },
        {
            gradientColorStart: 'rgba(212,152,163)',
            gradientColorEnd: 'rgba(242,185,196)',
            gradientColorDegree: 120,
        },
    ],
});
```


## Methods

After you initialize Sakura you have its initialized instance in a variable (like the `sakura` variable in the example above) with helpful methods.

| Name                     | Description                                                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sakura.stop(graceful);` | Stops the petals from dropping and removes them from the DOM. Set `graceful` (_boolean_) to `true` to let the petals finish their animation instead of removing them from the DOM abruptly. |
| `sakura.start();`        | Start Sakura after stopping it.                                                                                                                                                             |

## Development

Sakura.js uses `gulp` to build development and production versions (both located in `/dist/`).
The plugin is originally made in ES6 Javascript and SCSS. With gulp we use babel to create browser compatible versions.

First you need to install [gulp-cli](https://gulpjs.com/) globally.

Then you have to install the project's dependencies. In the root of the repo do:

```bash
$ npm install
```

or if you use Yarn:

```bash
$ yarn install
```

##### Tasks

You can run the watch task if you're actively developing. This watches for file changes and builds the correct files. This command also runs eslint.

```bash
$ gulp watch
```
If you want to run eslint individually. You can run the lint task:

```bash
$ gulp lint
```

Finally to build the project without watching or linting run the default gulp task:

```bash
$ gulp
```

## Compatibility

I tested this with the latest versions of Chrome, Firefox, Safari and IE11 on desktop and with Chrome for Android, Samsung Internet and iOS Safari.

If you see compatibliy issues (or any issue for that matter) please add them in this repo's issue tracker.
