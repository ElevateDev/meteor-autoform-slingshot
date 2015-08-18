AutoForm.debug = true;
SimpleSchema.debug = true;

Template.filesForm.helpers({
  formType: function(){
    if( Files.findOne() ){
      return "update";
    }else{
      return "insert";
    }
  },
  editDoc: function(){
    return Files.findOne();
  }
});


AutoForm.addHooks(null,{
  onSuccess: function(){
    console.log( "Save success" );
  },
  onError: function( type, err ){
    console.error( err );
  }
});
