require('angular')
var app = angular.module('app', [])


app.controller('MainCtrl', function ($rootScope, $scope, facebook, $q) {
    $scope.results = [];
    $scope.title = "Alfacloud Moon";
	$scope.subscriptions = [];// {id, name}
	$scope.posts = [];// {id, story}
	$scope.topShares = [];// {link, count}
	$scope.howManyPostPerSubscription = 3;


	$scope.getSubscriptions = function () {
		var deferred = $q.defer();
		FB.api('/me/likes?limit=1000', {
			fields: ''
		}, function (response) {
			if (!response || response.error) {
				deferred.reject('Error occured');
			} else {
				for (let i = 0; i < response.data.length; i++) {
					$scope.subscriptions.push({ id: response.data[i].id, name: response.data[i].name });
				}
				$scope.$apply();
				deferred.resolve(response);
			}
		});
		return deferred.promise;
	}


	$scope.getLast100Posts = function (subscription) {
		$scope.posts = [];
		$scope.currentSubscription = subscription;
		var deferred = $q.defer();
		FB.api(
			'/' + subscription.id,
			'GET',
			{ "fields": "posts.limit(100)" },

			function (response) {
				if (!response || response.error) {
					deferred.reject('Error occured');
				} else {
					for (let i = 0; i < response.posts.data.length; i++) {
						$scope.posts.push({ id: response.posts.data[i].id, story: response.posts.data[i].story });
					}

					//$scope.$apply();
					deferred.resolve($scope.posts);
				}
			});
		return deferred.promise;
	}


	$scope.getSharesCount = function (postID) {
		var deferred = $q.defer();
		FB.api(
			'/' + postID,
			'GET',
			{ "fields": "shares,link" },
			function (response) {
				if (!response || response.error) {
					deferred.reject('Error occured');
				} else {
					let shareCount = 0;
					if (response.shares != undefined)
						shareCount = response.shares.count;
					deferred.resolve({ link: response.link, count: shareCount });
				}
			});
		return deferred.promise;
	}


	$scope.getCommentsCount = function () {
		//"443283869018830_1417737434906797/comments?limit=1&summary=1"
		var deferred = $q.defer();
		FB.api(
			'/443283869018830_1417737434906797/comments',
			'GET',
			{ "limit": "1", "summary": "1" },
			function (response) {
				if (!response || response.error) {
					deferred.reject('Error occured');
				} else {
					deferred.resolve(response.summary.total_count);
				}
			});
		return deferred.promise;
	}


	$scope.getLikesCount = function () {
		//"443283869018830_1417737434906797/likes?limit=1&summary=1"
		var deferred = $q.defer();
		FB.api(
			'/443283869018830_1417737434906797/likes',
			'GET',
			{ "limit": "1", "summary": "1" },
			function (response) {
				if (!response || response.error) {
					deferred.reject('Error occured');
				} else {
					deferred.resolve(response.summary.total_count);
				}
			});
		return deferred.promise;
	}


	$scope.getTopShared = function (subscription) {
		$scope.topShares = [];
		$scope.getLast100Posts(subscription).then(function () {
			let howManyPostPerSubscription = $scope.howManyPostPerSubscription;
			if ($scope.howManyPostPerSubscription > $scope.posts.length)
				howManyPostPerSubscription = $scope.posts.length;

			let postToConsider = [];
			for (let i = 0; i < howManyPostPerSubscription; i++)
				postToConsider.push($scope.posts[i]);

			return $q.all(postToConsider.map(function (post) {
				return $scope.getSharesCount(post.id);
            }))
				.then(function (topShares) {
					$scope.topShares = topShares.sort(function (a, b) { return b.count - a.count });
					//$scope.$apply();
					return $scope.topShares;
				});


		})
	}


	//SDK initialization
	$rootScope.$on("fb.init", function () {
		console.log("SDK Ready");
		FB.login(function (response) {
			// handle the response
			var x = response;
		}, { scope: 'user_posts,user_likes,email,user_about_me' });
	});


});



app.provider('facebook', function () {
	var config = {};
	var sdkLang = "en_US"
	var permissions = [];
	this.setInitParams = function (appId, status, xfbml, cookie, apiVersion, sdkLangParam) {
		config = {
			appId: appId,
			status: status,
			xfbml: xfbml,
			cookie: cookie,
			version: apiVersion
		};
		sdkLang = sdkLangParam || sdkLang;
		/*if(typeof sdkLang !== "undefined"){
		 sdkLang = sdkLangParam;
		 }*/
	}


	this.setAppId = function (appId) {
		config.appId = appId;
	}

	this.setApiVersion = function (apiVersion) {
		config.version = apiVersion;
	}

	this.setCookie = function (cookie) {
		config.cookie = cookie;
	}



	var sdkInit = function ($rootScope, $timeout) {
		(function (d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) return;
			js = d.createElement(s);
			js.id = id;
			js.src = "//connect.facebook.net/" + sdkLang + "/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		} (document, 'script', 'facebook-jssdk'));
		if (typeof window.FB == 'undefined') {
			window.fbAsyncInit = function () {
				window.FB.init(config);
				$rootScope.$broadcast("fb.init", window.FB);
			};
		} else {

			$timeout(function () {
				window.FB.init(config);
				$rootScope.$broadcast("fb.init", window.FB);
			}, 0)
		}
	}

	this.setPermissions = function (perms) {
		permissions = perms;
	}

	this.$get = ["$rootScope", "$timeout", function ($rootScope, $timeout) {

		sdkInit($rootScope, $timeout);
	}]

});



//Insert here APP parameters 
app.config(function (facebookProvider) {
	facebookProvider.setInitParams('611598122333881', true, true, true, 'v2.7', "en_US");
	facebookProvider.setPermissions(['user_likes', ' user_posts', ' user_likes', 'user_about_me', 'user_birthday', 'user_hometown', 'user_website']);
});