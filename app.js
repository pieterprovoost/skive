var app = angular.module('app', ['ngRoute']);

app.controller('homeController', function($scope, albumService, deezerService, $q) {

	var audio = new Audio();

	var next = function() {
		$scope.index = $scope.index + 1;
		if ($scope.index >= $scope.album.deezer.tracks.data.length) {
			$scope.index = 1;
		}
		console.log($scope.index);
		$scope.track = $scope.album.deezer.tracks.data[$scope.index];
		audio.src = $scope.album.location + '/' + $scope.album.tracks[$scope.index];
		console.log(audio.src);
		audio.play();
	};

	audio.addEventListener('ended', function() {
		next();
	});

	var promise = albumService.albums();
	$q.all([promise]).then(function(res) {
		$scope.albums = res[0];
		$scope.albums.forEach(function(album) {
			var promise = deezerService.deezer(album.id);
			$q.all([promise]).then(function(res) {
				album.deezer = res[0];
			});
		});
	});

	$scope.play = function(album) {
		$scope.index = -1;
		$scope.album = album;
		next();
	};

	$scope.pause = function() {
		if (audio.paused) {
			audio.play();
		} else {
			audio.pause();
		}
	};

});

app.service('albumService', function($q) {

	this.albums = function() {
		var deferred = $q.defer();
		var ajax = $.ajax({
			url: 'music.js',
			dataType: 'json',
			success: function (data, status, headers, config) {
				deferred.resolve(data);
			}
		});
		return deferred.promise;
	};

});

app.service('deezerService', function($q) {

	this.deezer = function(id) {
		var deferred = $q.defer();
		var ajax = $.ajax({
			url: 'https://api.deezer.com/album/' + id + '?output=jsonp',
			dataType: 'jsonp',
			success: function (data, status, headers, config) {
				deferred.resolve(data);
			}
		});
		return deferred.promise;
	};

});

app.filter('secondsToDateTime', [function() {
	return function(seconds) {
		return new Date(1970, 0, 1).setSeconds(seconds);
	};
}])