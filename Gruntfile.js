module.exports = function (grunt) {
  require('jit-grunt')(grunt);

  const path = require('path');

  const sourceFolder = path.join(__dirname, 'src');
  const buildFolder = path.join(__dirname, 'build');
  const subFolder = {
    images: path.join('assets', 'images'),
    stylesheets: path.join('assets', 'stylesheets'),
    scripts: path.join('assets', 'scripts'),
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Load configuration
    cfg: grunt.file.readJSON('config.json'),

    aws_s3: {
      options: {
        accessKeyId: '<%= cfg.aws.AWSAccessKeyId %>', // Use the variables
        secretAccessKey: '<%= cfg.aws.AWSSecretKey %>', // You can also use env variables
        region: '<%= cfg.aws.AWSRegion %>',
        uploadConcurrency: 5, // 5 simultaneous uploads
        downloadConcurrency: 5, // 5 simultaneous downloads
      },
      production: {
        options: {
          bucket: '<%= cfg.aws.s3.production.bucket %>',
          differential: true, // Only uploads the files that have changed
          gzipRename: 'ext', // when uploading a gz file, keep the original extension
        },
        files: [
          {
            expand: true,
            cwd: buildFolder,
            src: ['*'],
            dest: '/',
          },
          {
            expand: true,
            cwd: path.join(buildFolder, 'assets'),
            src: ['**'],
            dest: 'assets/',
            params: {
              CacheControl: '2000',
              ContentEncoding: 'gzip',
            },
          },
          // CacheControl only applied to the assets folder
          // LICENCE inside that folder will have ContentType equal to 'text/plain'
        ],
      },
      clean_production: {
        options: {
          bucket: '<%= cfg.aws.s3.production.bucket %>',
          debug: true, // Doesn't actually delete but shows log
        },
        files: [
          {
            dest: '/',
            action: 'delete',
          },
          {
            dest: 'assets/',
            exclude: '**/*.tgz',
            action: 'delete',
          }, // will not delete the tgz
          {
            dest: 'assets/large/',
            exclude: '**/*copy*',
            flipExclude: true,
            action: 'delete',
          }, // will delete everything that has copy in the name
        ],
      },
      download_production: {
        options: {
          bucket: '<%= cfg.aws.s3.production.bucket %>',
        },
        files: [
          {
            dest: '/',
            cwd: 'backup/',
            action: 'download',
          }, // Downloads the content of app/ to backup/
          {
            dest: 'assets/',
            cwd: 'backup-assets/',
            exclude: '**/*copy*',
            action: 'download',
          }, // Downloads everything which doesn't have copy in the name
        ],
      },
    },

    // Transpile ES6 to ES5
    babel: {
      options: {
        sourceMap: true,
        presets: ['babel-preset-es2015'],
        // plugins: ['babel-plugin-transform-runtime'],
      },
      dev: {
        files: [{
          expand: true,
          cwd: path.join(sourceFolder, subFolder.scripts),
          src: ['**/*.js'],
          dest: path.join(buildFolder, subFolder.scripts),
          ext: '.js',
        }],
      },
      prod: {
        files: [{
          expand: true,
          cwd: path.join(sourceFolder, subFolder.scripts),
          src: ['**/*.js'],
          dest: path.join(buildFolder, subFolder.scripts),
          ext: '.js',
        }],
      },
    },

    // Clean folder(s)
    clean: {
      preBuild: [path.join(buildFolder, '**'), `!${buildFolder}`],
      postProduction: [
        path.join(buildFolder, '**', '*.map'),
      ],
    },

    // Compile handlebars
    // uncomment 'helpers' when you have helpers defined
    'compile-handlebars': {
      globbedTemplateAndOutput: {
        files: [{
          expand: true,
          cwd: sourceFolder,
          src: '*.hbs',
          dest: buildFolder,
          ext: '.html',
        }],
        // helpers: 'src/helpers/*.js',
        partials: 'src/partials/*.hbs',
        registerFullPath: true,
        templateData: 'src/data/en.json',
      },
    },

    // Compress assets
    compress: {
      main: {
        options: {
          mode: 'gzip',
        },
        expand: true,
        cwd: path.join(buildFolder, 'assets'),
        src: ['**/*'],
        dest: path.join(buildFolder, 'assets'),
      },
    },

    // Copy files and folders
    copy: {
      main: {
        files: [

          // includes files within path
          {
            expand: true,
            cwd: sourceFolder,
            src: ['browserconfig.xml', 'manifest.json'],
            dest: buildFolder,
            filter: 'isFile',
          },
          {
            expand: true,
            cwd: path.join(sourceFolder, subFolder.scripts, 'translations'),
            src: ['**/*'],
            dest: path.join(buildFolder, subFolder.scripts, 'translations'),
          },
        ],
      },
    },

    // Extract and inline critical-path CSS to HTML
    critical: {
      options: {
        base: path.join(buildFolder),
        minify: true,
        width: 1440,
        height: 900,
        ignore: [
          '@font-face',
          '@import',
        ],
      },
      pages: {
        expand: true,
        cwd: path.join(buildFolder),
        src: '{,**/}*.html',
        dest: path.join(buildFolder),
      },
    },

    // Minify CSS files
    cssnano: {
      options: {
        sourcemap: false,
        safe: true,
      },
      subtask1: {
        files: {
          'build/assets/stylesheets/main.css': 'build/assets/stylesheets/main.css',
          'build/assets/stylesheets/landing.css': 'build/assets/stylesheets/landing.css',
          'build/assets/stylesheets/landing-critical.css': 'build/assets/stylesheets/landing-critical.css',
          'build/assets/stylesheets/web-fonts.css': 'build/assets/stylesheets/web-fonts.css',
          'build/assets/stylesheets/cookie-message.css': 'build/assets/stylesheets/cookie-message.css',
        },
      },
      subtask2: {
        options: {
          safe: false,
        },
        files: {
          'build/assets/stylesheets/font-awesome.css': 'build/assets/stylesheets/font-awesome.css',
        },
      },
    },

    // JavaScript linting
    eslint: {
      options: {
        quiet: true,
        // configFile: '',
        // rulePaths: [],
      },
      target: ['**/*.js'],
    },

    // Express web server
    express: {
      all: {
        options: {
          port: 3000,
          hostname: 'localhost',
          bases: ['./build'],
          livereload: true,
        },
      },
    },

    // Minify HTML files
    htmlmin: {
      prod: {
        options: {
          removeComments: true,
          collapseWhitespace: true,
        },
        files: [{
          expand: true,
          cwd: buildFolder,
          src: ['*.html'],
          dest: buildFolder,
        }],
      },
    },

    // Minify images
    imagemin: {
      dynamic: {
        files: [
          {
            expand: true,
            cwd: path.join(sourceFolder, subFolder.images),
            src: ['*.{png,jpg,gif,svg}'],
            dest: path.join(buildFolder, subFolder.images),
          },
          {
            expand: true,
            cwd: path.join(sourceFolder, 'assets', 'icons'),
            src: ['*.{ico,png,svg}'],
            dest: buildFolder,
          },
        ],
      },
    },

    // Postprocessing for CSS files
    postcss: {
      options: {
        processors: [
          // require('pixrem')(), // add fallbacks for rem units
          require('autoprefixer'), // add vendor prefixes
        ],
      },
      dev: {
        options: {
          map: {
            inline: false, // save all sourcemaps as separate files...
            annotation: path.join(buildFolder, subFolder.stylesheets), // ...to the specified directory
          },
        },
        src: path.join(buildFolder, subFolder.stylesheets, '*.css'),
      },
      prod: {
        options: {
          map: false,
        },
        src: path.join(buildFolder, subFolder.stylesheets, '*.css'),
      },
    },

    // Purify CSS
    purifycss: {
      options: {
        minify: false,
        rejected: true, // Logs out removed selectors.

        // Array of selectors to always leave in.
        whitelist: [
          '.pac-container', // Google geocode pick list selector
        ],
      },
      target: {
        src: [
          path.join(buildFolder, '*.html'),
          path.join(buildFolder, subFolder.scripts, '**', '*.js'),
        ],
        css: [path.join(buildFolder, subFolder.stylesheets, '**', 'main.css')],
        dest: path.join(buildFolder, subFolder.stylesheets, 'main.css'),
      },
    },

    // Compile SASS files
    sass: {
      dev: {
        options: {
          sourceMap: true,
        },
        files: [{
          expand: true,
          cwd: path.join(sourceFolder, subFolder.stylesheets),
          src: '*.{scss, sass}',
          dest: path.join(buildFolder, subFolder.stylesheets),
          ext: '.css',
        }],
      },
      prod: {
        options: {
          sourceMap: false,
        },
        files: [{
          expand: true,
          cwd: path.join(sourceFolder, subFolder.stylesheets),
          src: '*.{scss, sass}',
          dest: path.join(buildFolder, subFolder.stylesheets),
          ext: '.css',
        }],
      },
    },

    // Minify JavaScript files
    uglify: {
      prod: {
        options: {
          sourceMap: false,
          mangle: { screw_ie8: true },
          compress: { screw_ie8: true, warnings: false },
          comments: false,
        },
        files: [{
          expand: true,
          cwd: path.join(buildFolder, subFolder.scripts),
          src: '**/*.js',
          dest: path.join(buildFolder, subFolder.scripts),
          ext: '.js',
        }],
      },
    },

    // Watch for changes
    watch: {
      options: {
        livereload: true,
      },
      imagemin: {
        files: [path.join(sourceFolder, subFolder.images, '*.{png,jpg,gif,svg}')],
        tasks: ['imagemin'],
      },
      babel: {
        files: [
          path.join(sourceFolder, subFolder.scripts, '**', '*.js'),
          `!${path.join(sourceFolder, subFolder.scripts, '**', '*lint_tmp*.js')}`,
        ],
        tasks: ['babel:dev'],
      },
      files: ['./build/**'],
      tasks: [],
      sass: {
        files: [
          path.join(sourceFolder, subFolder.stylesheets, '**', '*.{scss, sass}'),
        ],
        tasks: [
          'sass:dev',
          // 'purifycss',
          'postcss',
        ],
      },
      handlebars: {
        files: [
          path.join(sourceFolder, '*.{hbs,handlebars}'),
          path.join(sourceFolder, '**', '*.{hbs,handlebars}'),
          path.join(sourceFolder, 'partials', '*.{hbs,handlebars}'),
        ],
        tasks: [
          'compile-handlebars:globbedTemplateAndOutput',
        ],
      },
    },
  });

  // Register tasks

  // this would be run by typing "grunt dev" on the command line
  grunt.registerTask(
    'dev',
    [
      'clean:preBuild',             // Clean build folders
      'copy:main',                  // Copy some files and folders
      'imagemin',                   // Minify images
      'babel:dev',                  // Transpile ES6 to ES5
      'sass:dev',                   // Compile SASS to CSS
      'compile-handlebars:globbedTemplateAndOutput',  // Compile handlebar templates
      // 'purifycss',                  // Remove unused style selectors from CSS files
      'postcss:dev',                // Perform PostCSS tasks on CSS files
      'express',                    // Start web server
      'watch',                      // Watch for any changes and perform tasks when needed
    ]
  );

  // the default task can be run just by typing "grunt" on the command line
  grunt.registerTask(
    'prod',
    [
      'clean:preBuild',             // Clean build folders
      'copy:main',                  // Copy some files and folders
      'imagemin',                   // Minify images
      'eslint',                     // Check JavaScript code style
      'babel:prod',                 // Transpile ES6 to ES5
      'uglify:prod',                // Minify all JavaScript
      'sass:prod',                  // Compile SASS to CSS
      'compile-handlebars:globbedTemplateAndOutput',  // Compile handlebar files
      'purifycss',                  // Remove unused style selectors from CSS files
      'postcss:prod',               // Perform PostCSS tasks on css files
      'cssnano:subtask1',           // Minify CSS with the 'safe' option
      'cssnano:subtask2',           // Minify CSS
      'critical',                   // Extract and inline critical-path CSS to HTML
      'htmlmin:prod',               // Minify all HTML files
      'clean:postProduction',       // Clean folder(s) of left over files
    ]
  );

  // Backup current S3 bucket, compress and publish to S3 bucket
  grunt.registerTask(
    'publish',
    [
      'compress',
      'aws_s3:production',
    ]
  );

  // Download from S3
  grunt.registerTask(
    'download',
    [
      'aws_s3:download_production',
    ]
  );
};
