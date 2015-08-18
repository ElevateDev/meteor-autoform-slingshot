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
    downloadUrl( data ) // for download btn and preview, should return err, resp { src: 'downloadUrl'}
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
Show errors
Add tests
Invert data structure. Currently uploader -> file info, make it file -> attached uploader
