directoryApp = '';
if (!window.location.origin) {
  window.location.origin = window.location.protocol+"//"+window.location.host;
}
dirWebRoot =  window.location.origin + '/';
console.log('dirWebRoot', dirWebRoot);

rootPathSH =  'https://sistemaerp.villasalud.pe/ci.php/';
rootPathFilesSH =  'https://sistemaerp.villasalud.pe/';

keyRecaptcha = '6LdHb-YUAAAAACULZ56GFwRjBG2iJIQXARjoQKav'; //Produccion

// chat - firebase
fireBaseApiKey = "AIzaSyA7JEcMGQDyU5APNCnPpMS_fM4UQg8yS5E";
fireBaseAuthDomain = "villasalud-10427.firebaseapp.com";
fireBaseDatabaseURL = "https://villasalud-10427.firebaseio.com";
fireBaseProjectId = "villasalud-10427";
fireBaseStorageBucket = "villasalud-10427.appspot.com";
fireBaseMessagingSenderId = "585182308433";
fireBaseAppId = "1:585182308433:web:69a25ba303b8940c0e3070";