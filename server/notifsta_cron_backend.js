var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var http = require('http').Server(app);
var moment = require('moment');
var multer = require('multer');

var notifsta_cronjob = require('./cronjob/cronjob.js');
var notifsta_mongodb = require('./mongodb/mongodb.js');

var SERVER_INITIALIZED = false;
function InitializeServer(callback){
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


function ValidateTime(time_string){

}

function StartServer(){
    /* Create a scheduled notification
     * Params: None
     */
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
    app.use(multer()); // for parsing multipart/form-data
    

    app.get('/scheduled_notifications/:channel_id', function (req, res) {
        var channel_id = parseInt(req.params.channel_id);
        var promise = notifsta_mongodb.GetCronJobs(channel_id);
        promise.success(function (docs){
            res.send(docs.filter(function (job) {
                return moment(job.start_time) > moment();
            }));
        })
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
        var channel_id = parseInt(req.params.channel_id);
        var user_email = req.query.user_email;
        var user_token = req.query.user_token;
        var notifguts  = req.body.notification.notification_guts;
        var type       = req.body.notification.type;
        var start_time = moment(req.body.notification.start_time, moment.ISO_8601);
        if (!start_time.isValid()) {
            res.send({ status: "error", data: "Invalid Date - use ISO 8601" })
            return;
        }

        var new_job = notifsta_cronjob.AddJob(channel_id, start_time, notifguts);
        if (!new_job.cron_job) {
            res.send({ status: "error"})
            return;
        }
        var promise = notifsta_mongodb.InsertCronJob(
            new_job.id,
            new_job.channel_id,
            new_job.start_time,
            new_job.message
        );
        promise.success(function (docs){
            res.send({
                status: "success",
                data: {
                    id: new_job.id,
                    channel_id: new_job.channel_id,
                    start_time: new_job.start_time.toISOString(),
                    message: new_job.message
                }
            });
        })
        promise.error(function (err){
            console.log(err);
            notifsta_cronjob.RemoveJob(new_job.id);// remove cron job
            res.send({
                status: "error"
            })
        })
    });
    app.patch('/scheduled_notifications/:channel_id/:job_id', function (req, res) {
        var job_id     = req.params.job_id;
        var channel_id = parseInt(req.params.channel_id);
        var user_email = req.query.user_email;
        var user_token = req.query.user_token;
        var notifguts  = req.body.notification.notification_guts;
        var type       = req.body.notification.type;
        var start_time = moment(req.body.notification.start_time, moment.ISO_8601);
        if (!start_time.isValid()) {
            res.send({ status: "error", data: "Invalid Date - use ISO 8601" })
            return;
        }
        var job = notifsta_cronjob.UpdateJob(job_id, moment(start_time), notifguts);
        var promise = notifsta_mongodb.UpdateCronJob(
            job.id,
            job.start_time,
            job.message
        );
        promise.success(function (docs){
            res.send({
                status: "success"
            });
        })
        promise.error(function (err){
            console.log(err);
            notifsta_cronjob.RemoveJob(new_job.id);// remove cron job
            res.send({
                status: "error"
            })
        })
    });

    app.listen(3403);
}











// Start server process after the jobs have been loaded from database
InitializeServer(StartServer);