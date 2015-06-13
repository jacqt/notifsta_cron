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
var TEST = 26;
var ROBINSON = 41;


/* Hard code these job 
 *  Make sure the that the start_time is a Date object
 */
var jobs = [
    {
        start_time: moment('2015-06-12 22:00:00').toDate(),
        channel_id: ROBINSON,
        message: "Get pumped. It's time for our headliner, Sunset Sons"
    },
    {
        start_time: moment('2015-06-12 22:30:00').toDate(),
        channel_id: ROBINSON,
        message: "It's sushi time! Head to High Court"
    },
    {
        start_time: moment('2015-06-12 22:45:00').toDate(),
        channel_id: ROBINSON,
        message: "Don't miss the fireworks! Head to the Gardens for the best view"
    },
    {
        start_time: moment('2015-06-12 23:10:00').toDate(),
        channel_id: ROBINSON,
        message: "Saint Raymond time on Main Stage!"
    },
    {
        start_time: moment('2015-06-13 00:00:00').toDate(),
        channel_id: ROBINSON,
        message: "Pretend to be an adult and head up to the 'Grown Ups Only Area' for wine, cheese, and jazz..."
    },
    {
        start_time: moment('2015-06-13 00:30:00').toDate(),
        channel_id: ROBINSON,
        message: "Stick around Main Stage for our third headliner, Romare!"
    },
    {
        start_time: moment('2015-06-13 01:00:00').toDate(),
        channel_id: ROBINSON,
        message: "Getting sleepy? Coffee and Tea is available from the Garden Restaraunt"
    },
    {
        start_time: moment('2015-06-13 01:10:00').toDate(),
        channel_id: ROBINSON,
        message: "Ahir Shah at the 'Robinson Fringe' in the Auditorium"
    },
    {
        start_time: moment('2015-06-13 01:25:00').toDate(),
        channel_id: ROBINSON,
        message: "Learn to Salsa Dance in the Hall"
    },
    {
        start_time: moment('2015-06-13 02:05:00').toDate(),
        channel_id: ROBINSON,
        message: "Patrizio and Richard Smith on Main Stage now!"
    },
    {
        start_time: moment('2015-06-13 02:40:00').toDate(),
        channel_id: ROBINSON,
        message: "It's our final Comedy Headliner, John Gordillo at the 'Robinson Fringe'"
    },
    {
        start_time: moment('2015-06-13 03:00:00').toDate(),
        channel_id: ROBINSON,
        message: "Breakfast is served. Bacon butties in the Garden, pastries and juices in the Garden Restaurant"
    },
    {
        start_time: moment('2015-06-13 03:25:00').toDate(),
        channel_id: ROBINSON,
        message: "It's tribute time! The Killerz on the Main Stage"
    },
    {
        start_time: moment('2015-06-13 04:55:00').toDate(),
        channel_id: ROBINSON,
        message: "Survivors photo now in the Gardens!"
    }
]



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
