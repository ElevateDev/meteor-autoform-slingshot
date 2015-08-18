Meteor.publish("files",function(){
  return [Files.find()];
});
