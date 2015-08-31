elevatedevdesign:autoform-slingshot
=========================

`meteor add elevatedevdesign:autoform-slingshot`

## Demo

[Demo](http://autoform-slingshot-demo.meteor.com)

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

### Allowed File Types
Allowed file types is pulled from the first directive defined.

## TODO
* The big one - Show errors
* i18n support
* Support for more than just bootstrap and plain
* Add more tests
