elevatedevdesign:autoform-slingshot
=========================

`meteor add elevatedevdesign:autoform-slingshot`

## Config

type: String,
autoform: {
  type: "slingshot",
  multi: true, // defaults to true, meta setting, changes defaults
  ui: {
    hideList: true,
    hideIcons: true,
    noPreview: true,
    hideDownload: true,
    multipleUpload  // only applies to file chooser
  }
  slingshot: {
    downloadUrl( data ) // for download btn and preview
    replaceOnChange
    directives: [
      { 
        name: "Files",
        onBeforeUpload: function(){}
      }
    ]
  }
}

// NOTICE! These are required for type: [Object].
'file.key': { type: String },
'file.filename': { type: String },
'file.src': { type: String },
'file.directive': { type: String },
'file.type': { type: String }

## Icons
Icons are set via CSS.

## TODO
Add Single file upload portion
Show errors
Correctly pass values to autoform
Add tests
