var CronJob = require('cron').CronJob;
var moment = require('moment');
var request = require('request');


GLOBAL_ADMIN_EMAIL = 'admin@example.com'; //Make sure this account has admin access over all channels
GLOBAL_ADMIN_TOKEN = 'GsY6d6itxGxj_GsG1BjA'; //Make sure that this is up to date

//Test to see if the login credentials work
request.get('http://api.notifsta.com/v1/events',{
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



var ORIEL = 3;
var BALLIOL =  8;
var HUGHS =  1;
var KEBLE = 15;


/* Hard code these job 
 *  Make sure the that the start_time is a Date object
 */
var jobs_parsed = []
var jobs = jobs_parsed.map(function(j){
  return {
    start_time: moment(j.start_time).toDate(),
    channel_id: j.channel_id,
    message: j.message
  }
});



jobs.map(function (job){
    function on_job_start(){
        console.log('job started');
        SendNotification(job.channel_id, job.message)
    }
    
    function on_job_end(){
        console.log('job ended')
    }
    try {
        console.log(job.start_time);
        console.log(CronJob);
        var cron_job = new CronJob(
            job.start_time,
            on_job_start,
            on_job_end,
            true,
            null
        )
    } catch(err) {
        console.log('Incorrect cron pattern passed in')
        console.log(err);
    }
})

function SendNotification(channel_id, message){
    request.post('http://api.notifsta.com/v1/channels/' + channel_id + '/notifications',{
        form: {
                'user_email': GLOBAL_ADMIN_EMAIL,
                'user_token': GLOBAL_ADMIN_TOKEN,
                'notification[notification_guts]': message,
                'notification[type]': 'Message'
        }
    }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
            }
        }
    );
}
