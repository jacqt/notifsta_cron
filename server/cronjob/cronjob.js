var DEBUGGING = true;

var CronJob = require('cron').CronJob; // NodeCron Library
var moment = require('moment'); // MomentJs Time library
var request = require('request'); // Http Requests
var uuid = require('node-uuid'); // Uuid generator

var jobs = {};

GLOBAL_ADMIN_EMAIL = 'admin@example.com'; // Make sure this account has admin access over all channels
GLOBAL_ADMIN_TOKEN = 'GsY6d6itxGxj_GsG1BjA'; // Make sure that this is up to date

// Test to see if the login credentials work
request.get('http://api.notifsta.com/v1/events', {
    form: {
        'user_email': GLOBAL_ADMIN_EMAIL,
        'user_token': GLOBAL_ADMIN_TOKEN,
    }
}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log('Validated authentication details');
    } else {
        console.log(error);
        console.log(response.body);
        throw "No interent connection or admin email and admin token incorrect!";
    }
}
);


/* Notifsta Cron Job Class */
function NotifstaCronJob(channel_id, start_time, message, job_id) {
    if (!job_id) {
        job_id = GenerateId();
    }
    this.id = job_id;
    this.channel_id = channel_id;
    this.start_time = start_time;
    this.message = message;
    this.UpdateCronJob();
}

NotifstaCronJob.prototype.Cancel = function () {
    try {
        if (this.cron_job) {
            this.cron_job.stop();
        }
    } catch (err) {
        console.log(err); // Possible error is when there is no cron_job, or the cro_job is already stopped
    }
}

NotifstaCronJob.prototype.Update = function (start_time, message) {
    this.start_time = start_time;
    this.message = message;
    this.UpdateCronJob();
}
NotifstaCronJob.prototype.UpdateCronJob = function () {
    this.Cancel();
    this.cron_job = SetJob({
        channel_id: this.channel_id,
        start_time: this.start_time,
        message: this.message,
        id: this.id
    });
}

function GenerateId() {
    return uuid.v1(); // A time based uuid
}

function SetJob(job) {
    function on_job_start() {
        SendNotification(job.channel_id, job.message, on_successful_send);
    }
    
    function on_job_end() {
    }
    
    function on_successful_send() {
        try {
            DeleteJob(job.id);
        } catch (err) {
            console.log(JSON.stringify({
                type: "error",
                message: err
            }));
        }
    }
    try {
        var cron_job = new CronJob(
          job.start_time.toDate(),
          on_job_start,
          on_job_end,
          true,
          null
        );
        return cron_job;
    } catch (err) {
        console.log('Incorrect cron pattern passed in')
        console.log(err);
        return null;
    }
}

function SendNotification(channel_id, message, callback) {
    console.log(JSON.stringify({
        type: 'notif_sent',
        channel_id: channel_id,
        message: message,
    }));
    if (DEBUGGING) {
        if (callback) {
            callback();
        }
        return;
    }
    request.post('http://api.notifsta.com/v1/channels/' + channel_id + '/notifications', {
        form: {
            'user_email': GLOBAL_ADMIN_EMAIL,
            'user_token': GLOBAL_ADMIN_TOKEN,
            'notification[notification_guts]': message,
            'notification[type]': 'Message'
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
            if (callback) {
                callback();
            }
        }
    }
    );
}

function AddJob(channel_id, start_time, message, job_id) {
    if (job_id) {
        var job = new NotifstaCronJob(channel_id, start_time, message, job_id);
    } else {
        var job = new NotifstaCronJob(channel_id, start_time, message);
    }
    jobs[job.id] = job;
    return job;
}

function DeleteJob(job_id) {
    var job = jobs[job_id];
    if (!job) {
        console.log(job_id);
        throw "Scheduled notification not found in database"
    }
    job.Cancel();
    delete jobs[job_id];
}

function UpdateJob(job_id, start_time, message) {
    var job = jobs[job_id];
    if (!job) {
        throw "Scheduled notification not found in database"
    }
    job.Update(start_time, message);
    return job;
}

module.exports = {
    AddJob : AddJob,
    DeleteJob: DeleteJob,
    UpdateJob: UpdateJob,
    Jobs: jobs
}
