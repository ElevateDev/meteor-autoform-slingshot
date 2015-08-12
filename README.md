elevatedevdesign:autoform-slingshot
=========================

`meteor add elevatedevdesign:autoform-slingshot`

## Config

type: String,
autoform: {
  type: "slingshot",
  hideList: true,
  slingshot: {
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
