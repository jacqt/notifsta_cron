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
var jobs_parsed = [
    {
        "channel_id": 28,
        "message": "Enjoy our glamorous champagne reception with the smooth jazz from the Edward Wren Trio",
        "start_time": "June 13, 2015 9:00 PM"
    },
    {
        "channel_id": 28,
        "message": "Made up of the eight choral scholars of the world-class New College Choir, the New Men bring fun, charisma and outstanding sound.  From upbeat humour to yearning close harmonies, this a cappella group has it all!",
        "start_time": "June 13, 2015 10:15 PM"
    },
    {
        "channel_id": 28,
        "message": "Hailing from Broadstairs in Kent, indie rock trio Fish Tank will take the energy levels on our main stage up a notch with noisy riffs and infectious energy.",
        "start_time": "June 13, 2015 11:15 PM"
    },
    {
        "channel_id": 28,
        "message": "Founded in 2011 by students at Wadham College, Garfunkel is a 13-piece feel-good funk and soul band.  With their set list ranging from soul classics to modern day tunes, get ready to dance the night away.",
        "start_time": "June 14, 2015 12:30 AM"
    },
    {
        "channel_id": 28,
        "message": "Our DJ from Decadent Times serves up some contemporary club classics to keep the party going well into the morning.",
        "start_time": "June 14, 2015 2:00 AM"
    },
    {
        "channel_id": 28,
        "message": "Experience some of the thrills of Rick?s Cafe with our Casino room, complete with our own special recipe of French 75 Cocktails.",
        "start_time": "June 13, 2015 10:00 PM"
    },
    {
        "channel_id": 28,
        "message": "Enjoy a touch a touch of class with the Wykeham Quartet as you enter the magical world of Linacre College Ball 2015.",
        "start_time": "June 13, 2015 9:00 PM"
    },
    {
        "channel_id": 28,
        "message": "Formed in 2013, the Wykeham Wanders consist of violinist Satya Tan, cellist Rosie Powell Davies and Linacre?s own guitarist Giles Masters.  They will be bringing their own fusion of folk, jazz and classical styles to the Dining Hall stage.",
        "start_time": "June 13, 2015 10:00 PM"
    },
    {
        "channel_id": 28,
        "message": "Combining soaring vocals and lush instrumental backdrops, Jake Downs is definitely a talent to watch.",
        "start_time": "June 13, 2015 11:00 PM"
    },
    {
        "channel_id": 28,
        "message": "Combining backgrounds in classical, American and Irish folk, rock, blues, and jazz, the Infamous Flapjack Affair plays its own unique, genre-defying brand of music.  Come and hear a talented group who are well known for their stunning live performances (featuring Linacre?s own James Mitchell).",
        "start_time": "June 14, 2015 12:00 AM"
    },
    {
        "channel_id": 28,
        "message": "Get your dancing shoes on for a mix of swing, funk, and soul classics with our DJ from Decadent Times.",
        "start_time": "June 14, 2015 1:30 AM"
    },
    {
        "channel_id": 28,
        "message": "Rick's Gin Cocktail is now being served in the Blue Parrot Bar",
        "start_time": "June 13, 2015 10:05 PM"
    },
    {
        "channel_id": 28,
        "message": "Moroccan Mint Mojito is now being served in Rick's Cafe",
        "start_time": "June 13, 2015 11:05 PM"
    },
    {
        "channel_id": 28,
        "message": "French 75 is now being served in the Casino",
        "start_time": "June 14, 2015 12:00 AM"
    },
    {
        "channel_id": 28,
        "message": "\"Here's to looking at You, Kid\" Whiskey Cocktail is now being served in the Blue Parrot Bar",
        "start_time": "June 14, 2015 1:00 AM"
    },
    {
        "channel_id": 28,
        "message": "Casablanca Sunrise is now being served in Rick's Cafe",
        "start_time": "June 14, 2015 1:15 AM"
    },
    {
        "channel_id": 28,
        "message": "Mimosas are now being served at the Fountain",
        "start_time": "June 14, 2015 4:00 AM"
    }
];

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
