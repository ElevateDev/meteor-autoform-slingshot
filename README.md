elevatedevdesign:autoform-slingshot
=========================

`meteor add elevatedevdesign:autoform-slingshot`

## Config

    type: afSlingshot.fileSchema,
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

Type can also be

* `String`
* `[afSlingshot.fileSchema]`


## TODO
* The big one - Show errors
* Correctly stop uploads that are removed
* Add Remove button for multi = false type
* i18n support
* Support for more than just bootstrap and plain
* Better icon support for non-images
* Detect when a previously saved file is an image (currently only on recent uploads)
* Add more tests
