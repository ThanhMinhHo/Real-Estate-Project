
//var app = angular.module("appControl", []);
var app = angular.module("indexApp", ['ngRoute']);
var jobCategory =
    [
        { type: "Accounting" },
        { type: "Information Technology" },
        { type: "Administrative Assistant/Secretary" },
        { type: "Advertising" },
        { type: "Consultant" },
        { type: "Government Jobs" },
        { type: "Lawyer" },
        { type: "Consultant" },
        { type: "Book Publishing" }
    ];
var jobType =
    [
        { type: "Part time" },
        { type: "Full time" },
        { type: "Contract/temp" },
        { type: "Casual/vacation" }
    ];
var language =
    {
        "German": "en-de",
        "Spanish": "en-es",
        "French": "en-fr",
        "Korean": "en-ko"
    };
app.factory('myService', function ($http) {
    return {
        // 1st function
        getTimer: function (data, model) {
            return $http({
                method: "post",
                url: "/getTranslater",
                data: { "parameter": data, "model": model }
            }).then(function mySuccess(response) {
                if (response.data.success) {
                    //console.log(response.data.response.translations);
                    console.log(response);
                    return response.data.response.translations;
                    //console.log(dataTranslated);

                }
                else {
                    console.log(response);
                    console.log(response.data.result);
                }
            });


        }
    }
});



app.controller('HeaderController', function ($scope, $window, $location, $window, $rootScope, $http) {


    $rootScope.$on('$routeChangeStart', function () {
        //console.log("Employeer token" +$window.localStorage.getItem("employeerToken"));
        if ($window.localStorage.getItem("employeer")) {
            console.log("employeer side " + $window.localStorage.getItem("employeer"));
            $scope.employerSide = true;
        }
        else {
            //console.log("employeer side " +$window.localStorage.getItem("employeer"));
            $scope.employerSide = false;
        }
        //jobSeeker token
        if ($window.localStorage.getItem("token")) {
            $scope.authenticated = true;

            //console.log("user login");
        }
        else {
            $scope.authenticated = false;
            //console.log("user is not login");
        }
        //Employeer token
        if ($window.localStorage.getItem("employeerToken")) {
            $scope.employeerAuthenticated = true;

            console.log("employeer authenticated " + $scope.employeerAuthenticated);
        }
        else {
            $scope.employeerAuthenticated = false;
            console.log("employeer authenticated " + $scope.employeerAuthenticated);
        }

    });


    $scope.JobJob = function () {
        console.log("Direct Home route");
        //Remove employeer side
        $window.localStorage.removeItem("employeer")
        $location.path('/');
    };
    //Logout function when the user click to the logout button
    $scope.logout = function () {
        console.log("user logout");
        $scope.authenticated = false;
        $window.localStorage.removeItem("token");
        $location.path('/');
    };
    $scope.employerClick = function () {
        $window.localStorage.setItem("employeer", true);
        console.log($window.localStorage.getItem("employeer"));

        console.log("direct to employeer side");
        $location.path('/employeerLogin');
    };
    $scope.employeerLogout = function () {

        $scope.authenticated = false;
        //remove employeer Token
        $window.localStorage.removeItem("employeerToken");
        //Remove employeer side
        $window.localStorage.removeItem("employeer")

        //console.log("direct to Home page");
        $location.path('/');
    };

});

app.controller('jobDetailController', function ($scope, $http, $window, $location) {

    //get the url including the data parsing
    var urlParams = $location.search();
    var id = urlParams.id;

    console.log("Job detail");
    console.log("id" + id);
    //Get the job detail which given the _id to retrived data from the database
    $http({
        method: "post",
        url: "/getJobDetail",
        data: { "id": id }
    }).then(function mySuccess(response) {
        if (response.data.success) {
            console.log(response);
            console.log(response.data.result);
            $scope.jobDetail = response.data.result;
        }
        else {
            console.log(response.data.result);
        }
    });
    $scope.ApplyTheJob = function () {
        console.log("apply clicked");
        var token = $window.localStorage.getItem("token")
        if (token) {
            //Check if professioanl profile is create
            $http({
                method: "post",
                url: "/getProfessionalProfile",
                data: { "token": token }
            }).then(function mySuccess(response) {
                if (response.data.success) {
                    console.log(response);
                    $scope.successMsg = "Job Apply"
                    //Store to the database
                }
                else {
                    console.log(response.data.result);
                    //Remember the Job ID.
                    $location.path('/userAccount');
                }
            });

        }
        else {
            //console.log("direct to Home page");
            $location.path('/login');
        }
    };

});


app.controller('homeController', function ($scope, $http, $window, $location, myService) {
    //Show the job list
    $http({
        method: "post",
        url: "/getJob"
    }).then(function mySuccess(response) {
        if (response.data.success) {
            console.log(response.data.result);


            $scope.JobList = response.data.result;
        }
        else {
            console.log(response.data.result);
        }
    });
    $scope.TextToSpeech = function (id) {
        console.log("translater clicked");
        console.log(id);
        var myData = myService.getJobDetail(id);
        myData.then(function mySuccess(dataGetJobDetail) {
            console.log(dataGetJobDetail);

            var myData = myService.requestingTextToSpeechService("abc");
            myData.then(function mySuccess(voiceData) {
                console.log(voiceData);
                //console.log("OK response");
                //console.log(voiceData);
                //var a = voiceData.blob();
                 //var byteArray = new Uint8Array(voiceData);
               var blob = new Blob([voiceData],{'type': 'audio/mpeg'});
                
                 var url = URL.createObjectURL(blob);
                 console.log(url);
                 $window.open(url);

                // $scope.audio = window.URL.createObjectURL(voiceData.data);
                // $scope.audio.play();
                
          
         

               //$scope.audio = url;
               //console.log($scope.audio);
               //$scope.audio.play();
                console.log("Ready to play");

            });



        });
    }
    $scope.Translator = function () {


        console.log("translater clicked");
        //console.log($scope.JobList);
        var model = $scope.Choselanguage;
        console.log(model);
        var JobListCollection = [];
        angular.forEach($scope.JobList, function (eachList, keyouter) {
            //console.log("Each list" + eachList);
            var arraylistJob = [];
            arraylistJob.push(eachList.title);
            arraylistJob.push(eachList.jobCategory);
            arraylistJob.push(eachList.keyPoint);
            arraylistJob.push(eachList.location);


            var myData = myService.requestingTranslatorService(arraylistJob, model);
            myData.then(function mySuccess(dataTranslated) {
                var dataJson = { "title": dataTranslated[0].translation, "jobCategory": dataTranslated[1].translation, "keyPoint": dataTranslated[2].translation, "location": dataTranslated[3].translation };
                JobListCollection.push(dataJson);
            });
        });
        console.log(JobListCollection);
        $scope.JobList = JobListCollection;
    }

    //Set the category
    $scope.category = jobCategory;
    $scope.language = language;

    //Search click
    $scope.SeachButtonClick = function (Search) {
        console.log(Search);
        $http({
            method: "post",
            url: "/jobSeekerSearchJob",
            data: Search
        }).then(function mySuccess(response) {
            if (response.data.success) {
                console.log(response);
                $scope.JobList = response.data.result;
            }
            else {
                console.log(response);
                $scope.successMsg = "Result could not foud";
            }
        });

    }
    //Click to each row click
    $scope.setClickedRow = function (id) {
        console.log(id);
        console.log("direct to detail job");
        $location.path('/jobDetail').search({ id: id })
    }
});
app.controller('employeerCreateJobController', function ($scope, $http, $window) {

    //assign the job category to the html
    $scope.category = jobCategory;

    //assign the job type  to the html element
    $scope.TypeOfJobs = jobType;

    $scope.selectedRow = null;  // initialize our variable to null
    $scope.setClickedRow = function (index, jobtype) {  //function that sets the value of selectedRow to current index
        $scope.selectedRow = index;
        $scope.JobCreateData.jobtype = jobtype;

    }
    //Post the job clicked
    $scope.PostTheJob = function () {
        var jobDescription = $scope.JobCreateData;
        console.log(jobDescription);
        console.log(jobDescription.title);
        if ($scope.JobCreateData.salary < 0) {
            $scope.errMessage = "Please correct the salary"
        }
        else {
            $http({
                method: "post",
                url: "/employeerCreateJob",
                data: {
                    "jobDescription": jobDescription,
                    "employeerToken": $window.localStorage.getItem("employeerToken")
                }
            }).then(function mySuccess(response) {
                if (response.data.success) {
                    console.log(response);
                    $scope.successMsg = "Job created succesfully"
                }
                else {
                    console.log(response);
                    $scope.successMsg = response.data.message;
                }
            });
        }

    }


});

//*******Current User Account****/
app.controller('userAccountController', function ($scope, $window, $location, $http, $rootScope) {
    var token = $window.localStorage.getItem("token");
    var profileCreated;
    $http({
        method: "post",
        url: "/currentUser",
        data: { "token": token }
    }).then(function mySuccess(response) {
        if (response.data.success) {
            console.log(response)

            $scope.userName = response.data.username;
            $scope.userEmail = response.data.email;
            $scope.name = response.data.username;
            $scope.Email = response.data.email;;
        }
        else {
            console.log(response);
        }


    });
    console.log("GEt professional profile");
    //Check if professioanl profile is create
    $http({
        method: "post",
        url: "/getProfessionalProfile",
        data: { "token": token }
    }).then(function mySuccess(response) {
        if (response.data.success) {
            console.log(response);
            console.log(response.data.result[0].education);
            $scope.personalBrand = response.data.result[0].personalBrand;
            $scope.education = response.data.result[0].education;
            $scope.phone = response.data.result[0].phone;
            $scope.jobTitile = response.data.result[0].jobTitile;
            $scope.companyName = response.data.result[0].companyName;
            profileCreated = true;

        }
        else {
            console.log("false" + response.data.result);
            profileCreated = false;
            //Remember the Job ID.

        }
    });


    //When Save is clicked
    $scope.Save = function (ProfessinalCareer) {
        if (!profileCreated) {
            console.log(ProfessinalCareer);
            $http({
                method: "post",
                url: "/jobSeekerProfessionalProfile",
                data: { "token": token, "ProfessinalCareer": ProfessinalCareer }
            }).then(function mySuccess(response) {
                if (response.data.success) {

                    console.log(response);
                    $scope.successMsg = "Profile Save";
                    $location.path('/userAccount')
                }
                else {
                    console.log(response);
                    $scope.errMessage = "Please Check all the field"

                }
            });
        }

    }


});
app.controller('employeerAccountController', function ($scope, $window, $location, $http, $rootScope) {

    var employeerToken = $window.localStorage.getItem("employeerToken");
    console.log("employeer controller" + employeerToken);
    $http({
        method: "post",
        url: "/currentEmployeer",
        data: { "employeerToken": employeerToken }
    }).then(function mySuccess(response) {
        if (response.data.success) {
            $scope.userName = response.data.result.username;
            $scope.userEmail = response.data.result.email;
            $scope.businessName = response.data.result.businessName;
            $scope.phoneNumber = response.data.result.phoneNumber;
            console.log("Current employeer" + response.data.result._id);

        }
        else {
            console.log(response);
        }
    });

    //Create job Click
    $scope.CreateJob = function () {
        console.log("direct to employeer create job page");
        $location.path('/employeerCreateJob');
    };

});
//******User Register*****/
app.controller('registerController', function ($scope, $http, $location) {
    console.log("this is reister controller");
    $scope.register = function () {
        console.log("This is scope" + $scope.regData.username);
        $scope.errMessage = false;
        $http({
            method: "post",
            url: "/jobseekersRegister",
            data: $scope.regData
        }).then(function mySuccess(response) {
            console.log(response.data.success);
            if (response.data.success) {
                console.log(response.data.message);
                $scope.successMsg = response.data.message;
                $location.path("/login");
            }
            else {
                console.log(response.data.message);
                $scope.errMessage = response.data.message;
            }
        });
    };
});

app.controller('employeerRegisterController', function ($scope, $http, $location) {
    console.log("this is reister controller");
    $scope.register = function () {
        console.log("This is scope" + $scope.regData.username);
        $scope.errMessage = false;
        $http({
            method: "post",
            url: "/employeerRegister",
            data: $scope.regData
        }).then(function mySuccess(response) {
            console.log(response.data.success);
            if (response.data.success) {
                console.log(response.data.message);
                $scope.successMsg = response.data.message;
                $location.path("/employeerLogin");
            }
            else {
                console.log(response.data.message);
                $scope.errMessage = response.data.message;
            }
        });
    };
});
//******User Login*****/
app.controller('loginController', function ($scope, $http, $location, $window) {
    console.log("this is login controller");

    $scope.login = function () {
        console.log($scope.loginData);
        $scope.errMessage = false;
        $http({
            method: "post",
            url: "/jobseekerLogin",
            data: $scope.loginData
        }).then(function mySuccess(response) {
            if (response.data.success) {
                //set token to local storage
                $window.localStorage.setItem("token", response.data.token)
                //set the error meassage
                $scope.successMsg = response.data.message;
                $location.path("/userAccount");
            }
            else {
                //console.log(response.data.message);
                $scope.errMessage = response.data.message;
            }
        });
    };
});
app.controller('employeerLoginController', function ($scope, $http, $location, $window) {
    $scope.login = function () {
        console.log($scope.loginData);
        $scope.errMessage = false;
        $http({
            method: "post",
            url: "/employeerLogin",
            data: $scope.loginData
        }).then(function mySuccess(response) {
            if (response.data.success) {
                console.log(response);
                //set token to local storage
                $window.localStorage.setItem("employeerToken", response.data.token)
                //set the error meassage
                $scope.successMsg = response.data.message;
                console.log("direct to employeer account");
                $location.path("/employeerAccount");
            }
            else {
                //console.log(response.data.message);
                $scope.errMessage = response.data.message;
            }
        });
    };
});

//App configuration
app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        //Jobseeker side
        .when("/", {
            templateUrl: "app/views/jobSeekerPages/home.html",
            controller: "homeController"
        })
        .when("/jobDetail", {
            templateUrl: "app/views/jobSeekerPages/jobdetail.html",
            controller: "jobDetailController"
        })
        .when("/userAccount", {
            templateUrl: "app/views/jobSeekerPages/userAccount.html",
            controller: "userAccountController"
        })
        .when("/register", {
            templateUrl: "app/views/jobSeekerPages/register.html",
            controller: "registerController"
        })
        .when("/login", {
            templateUrl: "app/views/jobSeekerPages/login.html",
            controller: "loginController"
        })
        //Employeer side
        .when("/employeerAccount", {
            templateUrl: "app/views/employeerPage/employeerAccount.html",
            controller: "employeerAccountController"
        })
        .when("/employeerLogin", {
            templateUrl: "app/views/employeerPage/employeerLogin.html",
            controller: "employeerLoginController"
        })
        .when("/employeerRegister", {
            templateUrl: "app/views/employeerPage/employeerRegister.html",
            controller: "employeerRegisterController"
        })
        .when("/employeerCreateJob", {
            templateUrl: "app/views/employeerPage/employeerCreateJob.html",
            controller: "employeerCreateJobController"
        })
        .otherwise({ redirectTo: "/" });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});
