Router.configure({
  loadingTemplate: 'loading',
  layoutTemplate: 'layout'
});

Router.plugin('dataNotFound', {dataNotFoundTemplate: 'notFound'});

if( Meteor.isClient ){
  Meteor.subscribe("files");
}
Router.route('/', function(){
  this.render('filesForm');
});
