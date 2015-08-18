UI.registerHelper('formatMoney',function( amount ){
  // since we store in cents and accounting.js takes in dollars
  // I fucking hate the inconsancy among libs
  return accounting.formatMoney( amount/100 );
});
