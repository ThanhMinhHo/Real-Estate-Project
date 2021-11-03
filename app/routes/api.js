var JobSeeker = require("../models/jobseeker");
var Employeer = require("../models/employeer");
var JobDescription = require("../models/jobDescription");
var ProfessionalCareer = require("../models/professionalCareer");
var jwt = require('jsonwebtoken');
var jobSeekerescret = "JobSeekerSecret"
var EmployeerSescret = "EmployeerSescret"

var LanguageTranslatorV2 = require('watson-developer-cloud/language-translator/v2');

var languageTranslator = new LanguageTranslatorV2({
    username: "fd9a01cd-81aa-41ec-8fa8-c038189de52c",
    password: "WvqN2GpFsG4R",
    url: "https://gateway.watsonplatform.net/language-translator/api"
});
var TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
var text_to_speech = new TextToSpeechV1({
    username: "4c089ae5-fb10-4e12-bfc1-61dada16d179",
    password: "ktkbM1irpS30"
});
var fs = require('fs');

module.exports = function (router) {


    //Route for text to speech
    router.post('/getTextToSpeech', function (req, res) {
        var params = {
            text: 'Hello world, i am going to sleep',
            voice: 'en-US_AllisonVoice',
            accept: 'audio/mp3'
        };
        //Pipe the synthesized text to a file.
        text_to_speech.synthesize(params).on('error', function (error) {
            console.log('Error:', error);
        }).pipe(res);
        
    });

    //Route for text to speech
    router.post('/getTranslater', function (req, res) {
        console.log("i here");
        console.log(req.body.parameter);
        console.log(req.body.model);

        var parameters = {
            text: req.body.parameter,
            model_id: req.body.model
        };
        languageTranslator.translate(
            parameters,
            function (error, response) {
                if (error)
                    console.log(error)
                else
                    console.log(JSON.stringify(response, null, 2));
                res.json({ success: true, response });
            }
        );


    });



    //*******Search Job */
    router.post('/jobSeekerSearchJob', function (req, res) {
        console.log(req.body.location);
        console.log(req.body.JobCategory);
        console.log(req.body.what);

        var location = req.body.location;
        var category = req.body.JobCategory;
        var what = req.body.what;
        JobDescription.find({ $or: [{ role: what }, { jobSumary: what }, { title: what }, { location: location }, { jobCategory: category }] }, function (err, result) {
            if (err) {
                res.json({ success: false, message: 'Unable to retrive  the database' });
                return;
            }
            else {
                res.json({ success: true, result: result });
            }
        });
    });
    //***GEt jobSeekerProfile */
    router.post('/getProfessionalProfile', function (req, res) {
        token = req.body.token;
        jwt.verify(token, jobSeekerescret, function (err, decoded) {
            JobSeeker.findOne({ username: decoded.username }).select("_id").exec(function (err, result) {
                if (err) {
                    res.json({ success: false, message: err });
                }
                else {

                    var getid = result._id;
                    ProfessionalCareer.find({ userID: getid }, function (err, result) {
                        if (err) {
                            res.json({ success: false, message: 'Unable to retrive  the database' });
                            return;
                        }
                        else {
                            res.json({ success: true, result: result });
                        }
                    });

                }
            });
        });


    });

    //*****Employeer save professianl Profile the job description*/
    router.post('/jobSeekerProfessionalProfile', function (req, res) {

        console.log(req.body.token);
        console.log(req.body.ProfessinalCareer.personalBrand);

        req.checkBody('ProfessinalCareer.personalBrand', 'title is required').notEmpty();
        req.checkBody('ProfessinalCareer.phone', 'jobCategory is required').notEmpty();
        req.checkBody('ProfessinalCareer.education', 'jobtype is required').notEmpty();
        req.checkBody('ProfessinalCareer.companyName', 'keyPoint is required').notEmpty();

        var errors = req.validationErrors(); // returns an object with results of validation check
        if (errors) {
            res.json({ success: false, message: "Please completed all the field", nana: errors });
            return;
        } else {
            token = req.body.token;
            jwt.verify(token, jobSeekerescret, function (err, decoded) {
                JobSeeker.findOne({ username: decoded.username }).select("_id").exec(function (err, result) {
                    if (err) {
                        res.json({ success: false, message: err });
                    }
                    console.log(err);
                    var getid = result._id;

                    var professionalCareer = new ProfessionalCareer();

                    professionalCareer.userID = getid;
                    professionalCareer.personalBrand = req.body.ProfessinalCareer.personalBrand;
                    professionalCareer.phone = req.body.ProfessinalCareer.phone;
                    professionalCareer.companyName = req.body.ProfessinalCareer.companyName;
                    professionalCareer.education = req.body.ProfessinalCareer.education;

                    professionalCareer.save(function (err) {
                        if (err) {
                            res.json({ success: false, message: 'Unable to save to the database' });
                            return;
                        }
                        else {
                            res.json({ success: true, message: 'Professional Career created!' });
                        }
                    });
                });
            });
        }
    });


    //*****Get job detail */
    router.post('/getJobDetail', function (req, res) {
        JobDescription.findOne({ _id: req.body.id }).exec(function (err, result) {
            if (err) {
                throw err;
            }
            if (!result) {
                res.json({ success: false, message: "Could not get job detail" });
            }
            else {
                res.json({ success: true, result: result });
            }
        });
    });

    //*****Get all job */
    router.post('/getJob', function (req, res) {
        JobDescription.find(function (err, result) {
            if (err) {
                res.json({ success: false, message: 'Unable to get data from the database' });
                return;
            }
            else {
                res.json({ success: true, result: result });
            }

        });
    });

    //*****Employeer save the job description*/
    router.post('/employeerCreateJob', function (req, res) {
        console.log(req.body.employeerToken);
        console.log(req.body.jobDescription.title);

        req.checkBody('jobDescription.title', 'title is required').notEmpty();
        req.checkBody('jobDescription.location', 'location is required').notEmpty();
        req.checkBody('jobDescription.jobCategory', 'jobCategory is required').notEmpty();
        req.checkBody('jobDescription.jobtype', 'jobtype is required').notEmpty();
        req.checkBody('jobDescription.salary', 'salary is required').notEmpty();
        req.checkBody('jobDescription.keyPoint', 'keyPoint is required').notEmpty();
        req.checkBody('jobDescription.jobSumary', 'jobSumary  is required').notEmpty();
        req.checkBody('jobDescription.role', 'jobSumary  is required').notEmpty();
        var errors = req.validationErrors(); // returns an object with results of validation check
        if (errors) {
            res.json({ success: false, message: "Please completed all the field" });
            return;
        } else {
            token = req.body.employeerToken;
            jwt.verify(token, EmployeerSescret, function (err, decoded) {
                Employeer.findOne({ username: decoded.username }).select("_id").exec(function (err, result) {
                    var getid = result._id;

                    var jobDescription = new JobDescription();

                    jobDescription.id = getid;
                    jobDescription.title = req.body.jobDescription.title;
                    jobDescription.location = req.body.jobDescription.location;
                    jobDescription.jobCategory = req.body.jobDescription.jobCategory;
                    jobDescription.jobtype = req.body.jobDescription.jobtype;
                    jobDescription.salary = req.body.jobDescription.salary;
                    jobDescription.keyPoint = req.body.jobDescription.keyPoint;
                    jobDescription.jobSumary = req.body.jobDescription.jobSumary;
                    jobDescription.role = req.body.jobDescription.role;
                    jobDescription.save(function (err) {
                        if (err) {
                            res.json({ success: false, message: 'Unable to save to the database' });
                            return;
                        }
                        else {
                            res.json({ success: true, message: 'User created!' });
                        }
                    });
                });
            });
        }
    });

    //*****Employer route**********
    router.post('/employeerRegister', function (req, res) {
        // Validation prior to checking DB. Front end validation exists, but this functions as a fail-safe
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('businessName', 'Business is required').notEmpty();
        req.checkBody('phoneNumber', 'Phone number is required').notEmpty();

        var errors = req.validationErrors(); // returns an object with results of validation check
        if (errors) {
            res.json({ success: false, message: 'Username, email or password was left empty' });
            return;
        }
        var employeer = new Employeer();

        employeer.username = req.body.username;
        employeer.password = req.body.password;
        employeer.email = req.body.email;
        employeer.businessName = req.body.businessName;
        employeer.phoneNumber = req.body.phoneNumber;

        employeer.save(function (err) {
            if (err) {
                res.json({ success: false, message: 'User name or Email already exist' });
                return;
            }
            else {
                res.json({ success: true, message: 'User created!' });
            }
        });


    });

    router.post('/employeerLogin', function (req, res) {
        //Check the password is empty or not
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.json({ success: false, message: "Username, password was left empty" });
        }
        else {
            //look at the database to get the username, password and email base on the username
            Employeer.findOne({ username: req.body.username }).select("username password email").exec(function (err, result) {
                if (err) {
                    throw err;
                }
                if (!result) {
                    res.json({ success: false, message: "Could not authenticated user" });
                }
                else if (result) {
                    var valid = result.ComparePassword(req.body.password);
                    if (!valid) {
                        res.json({ success: false, message: "Could not authenticated password" });
                    }
                    else {
                        //generate the token
                        var token = jwt.sign({ username: result.username, email: result.email }, EmployeerSescret, { expiresIn: '2h' });
                        res.json({ success: true, message: "User authenticated", token: token });

                    }
                }

            });
        }
    });
    router.post("/currentEmployeer", function (req, res) {
        var token = req.body.employeerToken;

        console.log("current Employeer" + token);
        if (token) {
            jwt.verify(token, EmployeerSescret, function (err, decoded) {
                if (err) {
                    res.json({ success: false, message: "Token is invalid" });
                } else {
                    console.log("current Employeer")
                    Employeer.findOne({ username: decoded.username }).select("_id username password email businessName phoneNumber").exec(function (err, result) {
                        if (err) {
                            res.json({ success: false, message: "Could not find user" });
                        }
                        else {
                            res.json({ success: true, result });

                        }
                    });
                }
            });
        } else {
            res.json({ success: false, message: "No token provided" });
        }
    });

    //*****JobSeeker route**********

    //Job seeker register route
    router.post('/jobseekersRegister', function (req, res) {
        // Validation prior to checking DB. Front end validation exists, but this functions as a fail-safe
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        console.log(req.body.username);

        var errors = req.validationErrors(); // returns an object with results of validation check
        if (errors) {
            res.json({ success: false, message: 'Username, email or password was left empty' });
            return;
        }
        //console.log(req.body.username);
        var jobseeker = new JobSeeker();

        jobseeker.username = req.body.username;
        jobseeker.password = req.body.password;
        jobseeker.email = req.body.email;

        jobseeker.save(function (err) {
            if (err) {
                res.json({ success: false, message: 'User name or Email already exist' });
                return;
            }
            else {
                res.json({ success: true, message: 'user created!' });
            }
        });


    });


    //Login route
    router.post('/jobseekerLogin', function (req, res) {
        //Check the password is empty or not
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.json({ success: false, message: "Username, password was left empty" });
        }
        else {
            //look at the database to get the username, password and email base on the username
            JobSeeker.findOne({ username: req.body.username }).select("username password email").exec(function (err, result) {
                if (err) {
                    throw err;
                }
                if (!result) {
                    res.json({ success: false, message: "Could not authenticated user" });
                }
                else if (result) {
                    var valid = result.ComparePassword(req.body.password);
                    if (!valid) {
                        res.json({ success: false, message: "Could not authenticated password" });
                    }
                    else {
                        //generate the token
                        var token = jwt.sign({ username: result.username, email: result.email }, jobSeekerescret, { expiresIn: '2h' });
                        res.json({ success: true, message: "User authenticated", token: token });

                    }
                }

            });
        }
    });

    router.post("/currentUser", function (req, res) {
        var token = req.body.token;
        if (token) {
            jwt.verify(token, jobSeekerescret, function (err, decoded) {
                if (err) {
                    res.json({ success: false, message: "Token is invalid" });
                } else {
                    res.json({ success: true, email: decoded.email, username: decoded.username });
                }
            });
        } else {
            res.json({ success: false, message: "No token provided" });
        }
    });

    return router;
}


