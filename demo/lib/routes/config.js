Router.configure({
  loadingTemplate: 'loading',
  layoutTemplate: 'layout'
});

Router.plugin('dataNotFound', {dataNotFoundTemplate: 'notFound'});

Router.route('/', {
  template: 'filesForm',
  waitOn: function(){
    return Meteor.subscribe("files");
  }
});
