// TODO: revert changes to the scheduled notif if database store fails

var express = require('express');
var app = express();
var http = require('http').Server(app);
var moment = require('moment');

var request = require('request'); // Http Requests

// Middleware
var bodyParser = require('body-parser')
var multer = require('multer');
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // Dev host
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

var notifsta_cronjob = require('./cronjob/cronjob.js');
var notifsta_mongodb = require('./mongodb/mongodb.js');

var SERVER_INITIALIZED = false;
function InitializeServer(callback) {
    if (SERVER_INITIALIZED) {
        throw "Already initialized the server with jobs in the database!"
    }
    SERVER_INITIALIZED = true;
    var promise = notifsta_mongodb.GetCronJobs();
    promise.success(function (docs) {
        docs.map(function (job) {
            if (moment(job.start_time, moment.ISO_8601) < moment()) {
                return;
            }
            console.log(job);
            notifsta_cronjob.AddJob(
                job.channel_id, 
                moment(job.start_time),
                job.message, job.id);
        });
        callback();
    });
    promise.error(function (err) {
        console.log(err);
    });
}


function StartServer() {
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    app.use(multer()); // for parsing multipart/form-data
    app.use(allowCrossDomain);
    
    function VerifyAdmin(user_email, user_token, channel_id, success, failure) {
        // Test to see if the user_email, user_token, channel_id is a valid triple
        console.log(JSON.stringify({
            type: "checking_authentication",
            user_email: user_email, 
            user_token: user_token, 
            channel_id: channel_id
        }));
        
        // First get the event that the channel_id belongs to
        request.get('http://api.notifsta.com/v1/channels/' + channel_id, {
            form: {
                'user_email': user_email,
                'user_token': user_token,
            }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) { // Successfully got the event_id
                try {
                    var data = JSON.parse(body);
                    var event_id = data.data.event_id;
                } catch (err) {
                    return failure();
                }

                // Check if user admin of th event 
                request.get('http://api.notifsta.com/v1/events/' + event_id + '/check_admin', { 
                    form: {
                        'user_email': user_email,
                        'user_token': user_token,
                    }
                }, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        success();
                    } else {
                        failure();
                    }
                }
                );
            } else {
                failure();
            }
        });

    }
    
    /* Gets a scheduled notification
     * Params: None
     */
    app.get('/scheduled_notifications/:channel_id', function (req, res) {
        try {
            var channel_id = parseInt(req.params.channel_id);
            var user_email = req.query.user_email;
            var user_token = req.query.user_token;
        } catch (err) {
            return res.send({ status: "error", data: err })
        }
        VerifyAdmin(user_email, user_token, channel_id, success, error);
        
        function error() {
            res.send({
                status: "error",
                data: "Authentication Failure"
            });
        }
        function success() {
            var promise = notifsta_mongodb.GetCronJobs(channel_id);
            promise.success(function (docs) {
                res.send({
                    status: "success",
                    data: docs.filter(function (job) {
                        return moment(job.start_time) > moment();
                    })
                });
                console.log(JSON.stringify({
                    type: "retrieved_notifications",
                    channel_id: channel_id
                }))
            })
        }
    });
    
    /* Create a scheduled notification
     * Params:
     *  user_email : String,
     *  user_token : String,
     *  notification[notification_guts] : String,
     *  notification[type] : { Survey | Message },
     *  notification[start_time]: ISO Datetime String
     *  options[] : Array[String],
     *
     */
    app.post('/scheduled_notifications/:channel_id', function (req, res) {
        try {
            var channel_id = parseInt(req.params.channel_id);
            var user_email = req.query.user_email;
            var user_token = req.query.user_token;
            if (!req.body || !req.body.notification) {
                var notifguts = req.query.notification.notification_guts;
                var type = req.query.notification.type;
                var start_time = moment(req.query.notification.start_time, moment.ISO_8601);
            } else {
                var notifguts = req.body.notification.notification_guts;
                var type = req.body.notification.type;
                var start_time = moment(req.body.notification.start_time, moment.ISO_8601);
            }
        } catch (err) {
            return res.send({ status: "error" , data: { name : "Invalid parameters", err: err } });
        }
        if (!start_time.isValid()) {
            return res.send({ status: "error", data: "Invalid Date - use ISO 8601" })
        }

        VerifyAdmin(user_email, user_token, channel_id, success, error);
        function error() {
            res.send({
                status: "error",
                data: "Authentication Failure"
            });
        }
        function success() {
            var new_job = notifsta_cronjob.AddJob(channel_id, start_time, notifguts);
            if (!new_job.cron_job) {
                return res.send({ status: "error", data: "Failed to schedule notification" })
            }
            var promise = notifsta_mongodb.InsertCronJob(
                new_job.id,
            new_job.channel_id,
            new_job.start_time,
            new_job.message
            );
            promise.success(function (docs) {
                res.send({
                    status: "success",
                    data: {
                        id: new_job.id,
                        channel_id: new_job.channel_id,
                        start_time: new_job.start_time.toISOString(),
                        message: new_job.message
                    }
                });
                console.log(JSON.stringify({
                    type: 'created_new_job',
                    id: new_job.id,
                    channel_id: new_job.channel_id,
                    start_time: new_job.start_time.toISOString(),
                    message: new_job.message
                }))
            })
            promise.error(function (err) {
                console.log(err);
                notifsta_cronjob.DeleteJob(new_job.id);// remove cron job
                res.send({ status: "error", data: "Failed to add notification to database" })
            })

        }

    });
    
    /* Updates a scheduled notification
     * Params:
     *  user_email : String,
     *  user_token : String,
     *  notification[notification_guts] : String,
     *  notification[type] : { Survey | Message },
     *  notification[start_time]: ISO Datetime String
     *  options[] : Array[String],
     *
     */
    app.patch('/scheduled_notifications/:channel_id/:job_id', function (req, res) {
        try {
            var job_id = req.params.job_id;
            var channel_id = parseInt(req.params.channel_id);
            var user_email = req.query.user_email;
            var user_token = req.query.user_token;
            if (!req.body || !req.body.notification) {
                var notifguts = req.query.notification.notification_guts;
                var type = req.query.notification.type;
                var start_time = moment(req.query.notification.start_time, moment.ISO_8601);
            } else {
                var notifguts = req.body.notification.notification_guts;
                var type = req.body.notification.type;
                var start_time = moment(req.body.notification.start_time, moment.ISO_8601);
            }
        } catch (err) {
            return res.send({ status: "error" , data: { name : "Invalid parameters", err: err } });
        }
        
        VerifyAdmin(user_email, user_token, channel_id, success, error);
        function error() {
            res.send({
                status: "error",
                data: "Authentication Failure"
            });
        }
        
        function success() {
            try {
                var job = notifsta_cronjob.UpdateJob(job_id, moment(start_time), notifguts);
            } catch (err) {
                return res.send({ status: "error", data: err })
            }
            var promise = notifsta_mongodb.UpdateCronJob(
                job.id,
            job.start_time,
            job.message
            );
            
            promise.success(function (docs) {
                res.send({
                    status: "success",
                    data: {
                        id: job.id,
                        channel_id: job.channel_id,
                        start_time: job.start_time.toISOString(),
                        message: job.message
                    }
                });
                console.log(JSON.stringify({
                    type: 'updated_job',
                    id: job.id,
                    channel_id: job.channel_id,
                    start_time: job.start_time.toISOString(),
                    message: job.message
                }))
            })
            promise.error(function (err) {
                console.log(err);
                res.send({ status: "error", data: "Failed to update notification in database" })
            })
        }
    });
    
    /* Deletes a scheduled notification
     * Params: None
     */
    app.delete('/scheduled_notifications/:channel_id/:job_id', function (req, res) {
        try {
            var job_id = req.params.job_id;
            var user_email = req.query.user_email;
            var user_token = req.query.user_token;
            notifsta_cronjob.DeleteJob(job_id);
        } catch (err) {
            return res.send({ status: "error", data: err })
        }
        VerifyAdmin(user_email, user_token, channel_id, success, error);
        function error() {
            res.send({
                status: "error",
                data: "Authentication Failure"
            });
        }
        
        function success(){
            var promise = notifsta_mongodb.DeleteCronJob(job_id);
            promise.success(function () {
                res.send({ status: "success", data: "Notification successfully deleted" })
                console.log(JSON.stringify({
                    type: 'deleted_job',
                    id: job_id,
                }))
            });
            promise.error(function () {
                res.send({ status: "error", data : "Failed to delete notification in database" })
                console.log(JSON.stringify({
                    type: 'error',
                    comment: "Failed to delete notification in database"
                }))
            });
        }
    });
    
    console.log('Listening on port 3403');
    app.listen(3403);
}











// Start server process after the jobs have been loaded from database
InitializeServer(StartServer);
