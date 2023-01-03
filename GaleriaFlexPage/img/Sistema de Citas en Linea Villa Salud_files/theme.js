angular
  .module('theme', [
    'ngAria',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate',
    //'easypiechart',
    //'NgSwitchery',
    'sun.scrollable',
    'ui.bootstrap',
    'ui.select',
    'cfp.hotkeys',
    'ui.grid',
    'ui.grid.selection',
    'ui.grid.edit',
    'ui.grid.rowEdit',
    'ui.grid.pagination',
    'ui.grid.cellNav',
    'ui.grid.resizeColumns',
    'ui.grid.autoResize',
    'ui.grid.moveColumns',
    'ui.grid.exporter',
    'ui.grid.pinning',
    'ui.select',
    'theme.core.templates',
    'theme.core.template_overrides',
    'theme.core.directives',
    'theme.core.main_controller',
    'theme.core.navigation_controller',
    'theme.core.messages_controller',
    'theme.core.notifications_controller',
    'gm.datepickerMultiSelect'
  ])
  .constant('nanoScrollerDefaults', {
    nanoClass: 'scroll-pane',
    paneClass: 'scroll-track',
    sliderClass: 'scroll-thumb',
    contentClass: 'scroll-content'
  })
  .config(function($ariaProvider) {
   $ariaProvider.config({
     tabindex: false,
     ariaHidden: false
   });
 });
  /*.run(['$window', function ($window) {
    $window.ngGrid.config = {
        footerRowHeight: 40,
        headerRowHeight: 40,
        rowHeight: 40
    };
  }]);*/