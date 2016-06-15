var app = angular.module('tagifier', [
'ui.router',
'ui.bootstrap',
'youtube-embed',
'ngSanitize',
'pascalprecht.translate',
'cgNotify',
'angular-electron'
    ]);

app.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /
  $urlRouterProvider.otherwise("/");
  //
  // Now set up the states
  $stateProvider
    .state('main', {
      url: "/",
      templateUrl: "views/index.html",
      reload:true
    })
    .state('about', {
      url: "/about",
      templateUrl: "views/about.html"
    })
    .state('file', {
      url: "/{fileUrl:.*?}",
      templateUrl: "views/file.html",
      controller: "fileCtrl",
      reload:true
    });
});

app.config(['$translateProvider', function($translateProvider) {
  $translateProvider.useSanitizeValueStrategy('sanitize');
  $translateProvider.useStaticFilesLoader({
    prefix: 'locales/',
    suffix: '.json'
});
  $translateProvider.preferredLanguage('en');
}]);

app.filter("trustUrl", ['$sce', function ($sce) { //used by media player
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);

app.controller('mainCtrl', ['$scope', '$http','$rootScope','$translate','$window','$location','$state', function($scope, $http,$rootScope,$translate,$window,$location,$state)
{
  $rootScope.remote = require('electron').remote;

    var Menu = $rootScope.remote.Menu;
    var MenuItem = $rootScope.remote.MenuItem;

    var template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New task',
            click : function() { $state.go('main'); }
          }
        ]
      },
      {
        label: 'About',
        role: 'about',
        submenu: [
          {
            label: 'Tagifier (Beta)'
          },
          {
            type: 'separator'
          },
          {
            label: 'Github page',
            click : function() { $rootScope.remote.shell.openExternal('https://github.com/Cyriaqu3/tagifier'); }
          },
          {
            label: 'Report an issue',
            click : function() { $rootScope.remote.shell.openExternal('https://github.com/Cyriaqu3/tagifier/issues/new'); }
          },
          {
            label: 'Facebook Page',
            click : function(){ $rootScope.remote.shell.openExternal('https://www.facebook.com/Tagifier-1172453299437404/'); }
          }
        ]
      }
    ];
    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

  $scope.docReady = false;
  $(window).load(function(){

    $window.ga('create', 'UA-48635201-13', 'auto');  //initialize GA
    $scope.docReady = true;
    $scope.$apply();
  });

  $scope.ipc = $rootScope.remote.ipcMain;
  console.log($rootScope.remote);
  $scope.ipc.on('connect', function()
  {
    console.log("Socket connected !");
  });

  //auto focus the form
  $(document).hover(function(){
    $("#youtube-url").focus();
  });

  $(document).click(function(){
    $("#youtube-url").focus();
  });

  //retreive last commit infos
  $scope.lastCommit = "Tagifier";
  $http({
  	method: 'GET',
  	url: 'https://api.github.com/repos/CYRIAQU3/tagifier/commits'
	}).then(function successCallback(response) {
    	$scope.lastCommit = response.data[0].sha.substring(0,8);
    	$scope.lastUser = response.data[0].author.login;
  });

	// request permission for notifications (used when the file is ready)
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    //remove all the notifs when a page change
    $('.toast').remove();
  });
  $rootScope.$on('$stateChangeSuccess', function (event) {
      //ga event for page change
      $window.ga('send', 'pageview', $location.path());
  });

}]);

app.directive('targetBlank', function () {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var href = element.href;
          if(true) {  // replace with your condition
            element.attr("target", "_blank");
          }
        }
    };
});