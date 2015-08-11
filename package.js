Package.describe({
  name: 'elevatedevdesign:autoform-slingshot',
  summary: 'Slingshot uploader for autoform',
  version: '0.0.1-rc.1',
  git: 'https://github.com/Elevate/meteor-autoform-slingshot'
});

Package.onUse(function(api) {
  api.use([
    'templating',
    'edgee:slingshot@0.6.2',
    'aldeed:template-extension@3.4.3',
    'aldeed:autoform@5.0.0'
  ],'client');


  api.addFiles([
    'template.html',
    'template.js'
  ], 'client');
});
