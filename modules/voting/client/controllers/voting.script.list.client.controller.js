'use strict';

angular.module('voting').controller('VotingScriptController', ['$scope', '$stateParams', '$location', 'Authentication', 'Voting',
    function ($scope, $stateParams, $location, Authentication, Voting) {
        $scope.authentication = Authentication;

        $scope.find = function () {
            Voting.unapprovedScripts(function (votings) {
                $scope.votings = votings;
            });
        };

        $scope.selectAnswer = function (answer) {
            $scope.selectedAnswer = answer;
        };

        $scope.updateScript = function (approve) {
            if (approve) {
                $scope.selectedAnswer.dynamicGenerationScript.adminApproved = !!approve;
            }

            var scriptId = $scope.selectedAnswer.dynamicGenerationScript._id;
            delete $scope.selectedAnswer.dynamicGenerationScript._id;
            Voting.updateScript({
                scriptId: scriptId
            }, $scope.selectedAnswer.dynamicGenerationScript).$promise
                .then(function () {
                    alert("approved!")
                }, function () {
                    alert("error!")
                });
        };
    }
]);