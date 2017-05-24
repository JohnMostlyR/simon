# New Static Website

My starting point for a new static website project

## Setting Up

Install all dependanties:

```shell
npm init
```

## Basic Usage

Start the included webserver:

```shell
grunt run:server
```

This will serve all content in the `./dist` folder on port 3000

Run the development Grunt tasks:

```shell
grunt dev
```

This will:

- Look for any new, or changed, images in the `src/assets/images` folder and copies them to `dist/assets/images` and optimizes them.
- Look for any new, or changed, site icons, ico, png, svg, in the `src/assets/icons` folder, copies them to `dist` and optimizes them.
- Look for any new, or changed, JavaScript in the `src/assets/scripts` folder and copies those to `dist/assets/scripts` folder where they are compiled from ES6 to ES5 and minimized.
- Look for any new, or changed, SASS files in the `src/assets/stylesheets` folder and copies and compiles them to the `dist/assets/stylesheets` folder and minize the CSS files.
- Look for any new, or changes, handlebar files in the `src` folder and copies and compile them to the `dist` folder and minimize the HTML files.
- Create and minifies an above-the-fold CSS in the `dist/assets/stylesheets` folder.
- Watches for any changes in these folders and runs the above task(s) again when necessary.

## Includes

- InuitCSS: [https://github.com/inuitcss/inuitcss](http://)
- Handlebars: [http://handlebarsjs.com/](http://)
- criticalCSS: [https://github.com/filamentgroup/criticalcss](http://)
