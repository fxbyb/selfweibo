/**
 * Created by Administrator on 2016/12/29.
 */
angular.module('fx',['ionic'])
    .run(function($rootScope,$state,$stateParams){
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    })
    .config(function ($stateProvider,$urlRouterProvider) {
        // $urlRouterProvider.;
        /* $stateProvider
         .state()*/
    })
    .controller('modal',function ($scope,$ionicModal) {
        $ionicModal.fromTemplateUrl('my-modal.html',{
            scope:$scope,
            animation:'slide-in-up'
        }).then(function (modal) {
            $scope.modal=modal;
        });
        $scope.openModal=function () {
            $scope.modal.show();
        };
        $scope.closeModal = function () {
            $scope.modal.hide();
        };
    })