Package.describe({
  name: 'elevatedevdesign:autoform-slingshot',
  summary: 'Slingshot uploader for autoform',
  version: '0.0.2',
  git: 'https://github.com/ElevateDev/meteor-autoform-slingshot'
});

Package.onUse(function(api) {
  api.use([
    'aldeed:simple-schema@1.3.3',
  ]);

  api.use([
    'templating@1.1.1',
    'edgee:slingshot@0.6.2',
    'aldeed:template-extension@3.4.3',
    'aldeed:autoform@5.0.0',
    'reactive-var@1.0.5'
  ],'client');

  api.addFiles([
    'fileSchema.js',
  ]);

  api.addFiles([
    'fileRecord.js',
    'template.html',
    'template.js',
    'template.css',
  ], 'client');

  api.export('afSlingshot');
});

Package.onTest(function(api) {
  api.use([
    'sanjo:jasmine@0.17.0',
    'velocity:core',
    'velocity:html-reporter@0.6.2',
    'velocity:console-reporter',
    'pstuart2:velocity-notify@0.0.5',
    'elevatedevdesign:autoform-slingshot'
  ]);

  api.addFiles([
    'tests/file-spec.js',
    'tests/afSlingshot-spec.js'
  ], 'client');
});
