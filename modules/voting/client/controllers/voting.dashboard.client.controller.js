'use strict';

angular.module('voting')
    .controller('VotingDashboardController', ['$scope', '$stateParams', '$location', 'Authentication', 'Voting',
        function ($scope, $stateParams, $location, Authentication, Voting) {
            $scope.authentication = Authentication;

            $scope.selectVoting = function (voting) {
                $scope.votings.forEach(function (v) {
                    v.selected = false;
                });

                voting.selected = true;
            };

            $scope.find = function () {
                $scope.votings = Voting.query(function () {
                    $scope.votings[0].selected = true; // always select the first voting
                });
            };

            $scope.findOne = function () {
                $scope.voting = Voting.get({
                    votingId: $stateParams.votingId
                });
            };
        }
    ])
    .controller('VotingDashboardOpenVotingsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Voting',
        function ($scope, $stateParams, $location, Authentication, Voting) {
            dashboardWidgetTemplate($scope, 'Open Votings', Authentication, Voting.open);
            votingTemplate($scope, Voting);
        }
    ])
    .controller('VotingDashboardClosedVotingsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Voting',
        function ($scope, $stateParams, $location, Authentication, Voting) {
            dashboardWidgetTemplate($scope, 'My Closed Votings', Authentication, Voting.closedUser);
        }
    ])
    .controller('VotingDashboardMyVotingsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Voting',
        function ($scope, $stateParams, $location, Authentication, Voting) {
            dashboardWidgetTemplate($scope, 'My Votings', Authentication, Voting.query);
            votingTemplate($scope, Voting);

            $scope.showCreateLink = true;
        }
    ]);

function votingTemplate($scope, Voting) {
    $scope.answers = {};
    $scope.vote = function (answers) {
        var answerIds = parseAnswers(answers);
        Voting.vote({},
            {
                _id: $scope.voting._id,
                _answerId: answerIds
            });
        $scope.voting.hasVoted = true;
    };
}

function parseAnswers(answers) {
    var answerIds = [];
    if (answers instanceof Array) {
        for (var answer in answers) if (answers[answer]) answerIds.push(answer);
        return answerIds;
    } else {
        answerIds.push(answers._id);
    }

    return answerIds;
}

function dashboardWidgetTemplate($scope, title, Authentication, votingResource) {
    $scope.title = title;
    $scope.authentication = Authentication;

    var load = function () {
        votingResource().$promise.then(function (votings) {
            $scope.votings = votings;
            $scope.votings.forEach(function (voting) {
                var userId = Authentication.user._id;
                voting.answers.forEach(function (answer) {
                    if (answer.votes.indexOf(userId) !== -1) {
                        voting.hasVoted = true;
                        return;
                    }
                })
            });
        });
    };

    load();
    $scope.refresh = load;

    $scope.selectVoting = function (voting) {
        $scope.chartDataShown = true;
        $scope.voting = voting;
        var chartData = [];

        angular.forEach($scope.voting.answers, function (answer) {
            chartData.push([answer.title, (answer.votes && answer.votes.length) || 0]);
        });

        $scope.chartData = [chartData];
    };

    $scope.chartOptions = {
        seriesDefaults: {
            renderer: jQuery.jqplot.PieRenderer,
            rendererOptions: {
                showDataLabels: true
            }
        },
        legend: {show: true, location: 's'}
    };

    $(window).on('resize', function () {
        //Force redraw on resize
        var chartData = $scope.chartData;
        delete $scope.chartData;
        $scope.$apply();
        $scope.chartData = chartData;
        $scope.$apply();
    });
}
