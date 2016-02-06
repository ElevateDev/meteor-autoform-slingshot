elevatedevdesign:autoform-slingshot
=========================

`meteor add elevatedevdesign:autoform-slingshot`

## Notice

As far as I can tell it works with the most recent versions, I don't plan on much future development on this.

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
        replaceOnChange // Make field values the same as what was last entered in file input
        onRemove( record)
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

### onRemove

Can be used to remove files from s3.  Be aware though, this does't take into
account wether or not the record is currently saved with the removed file.

### Allowed File Types
Allowed file types is pulled from the first directive defined.

## TODO
* The big one - Show errors
* i18n support
* Support for more than just bootstrap and plain
* Add more tests
