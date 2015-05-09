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
var jobs = [
//St hugh's notifications
    //{
        //start_time: moment('2015-05-09 17:00:00').toDate(),
        //channel_id: HUGHS,
        //message: "Don't forget your tickets, St Hugh's Ball will be opening in 3 hours!"
    //},
    {
        start_time: moment('2015-05-09 19:55:00').toDate(),
        channel_id: HUGHS,
        message: "St Hugh's Ball will be opening in 5 minutes. Make sure you have your wristbands reading to be scanned."
    },
    {
        start_time: moment('2015-05-09 20:15:00').toDate(),
        channel_id: HUGHS,
        message: "Welcome to the St Hugh's Ball 2015. Our app will send you notifications throughout the night to keep you up to date."
    },
    {
        start_time: moment('2015-05-09 20:40:00').toDate(),
        channel_id: HUGHS,
        message: 'Oxford University Jazz Orchestra will be opening the Main Stage in 5 minutes!'
    },
    {
        start_time: moment('2015-05-09 21:00:00').toDate(),
        channel_id: HUGHS,
        message: 'Remember to head over to our hair and makeup studio in The Meadows where our stylists will be providing touch ups all night. '
    },
    {
        start_time: moment('2015-05-09 21:50:00').toDate(),
        channel_id: HUGHS,
        message: 'Please proceed to The Glade and following instructions from the Stewards in preparation for our firework and light show!'
    },
    {
        start_time: moment('2015-05-09 22:20:00').toDate(),
        channel_id: HUGHS,
        message: "The DJ Tent is now open with SWITCH from Oxford's O2 Academy. Jamie Berry is on the Main Stage and Billie Black is now performing in The Enchanted Court."
    },
    {
        start_time: moment('2015-05-09 23:15:00').toDate(),
        channel_id: HUGHS,
        message: 'K Stewart is now performing in The Enchanted Court. DFO will be beginning on the Main Stage shortly.'
    },
    {
        start_time: moment('2015-05-10 00:15:00').toDate(),
        channel_id: HUGHS,
        message: 'Amber Run will now be taking over The Enchanted Court and our DJ headliner, Karma Kid is now starting in the DJ Tent.'
    },
    {
        start_time: moment('2015-05-10 00:55:00').toDate(),
        channel_id: HUGHS,
        message: 'The Correspondents will be closing our Main Stage in 5 minutes.'
    },
    {
        start_time: moment('2015-05-10 02:00:00').toDate(),
        channel_id: HUGHS,
        message: 'Head over to the Main Stage to experience our enormous silent disco!'
    },
    {
        start_time: moment('2015-05-10 03:00:00').toDate(),
        channel_id: HUGHS,
        message: 'We will shortly be serving a selection of breakfast pastries in The Orchard, where tea and coffee is still available.'
    },
    {
        start_time: moment('2015-05-10 04:15:00').toDate(),
        channel_id: HUGHS,
        message: "The St Hugh's Ball will be ending shortly, please follow directions from the Stewards and make your way to the exit."
    },
    {
        start_time: moment('2015-05-10 04:30:00').toDate(),
        channel_id: HUGHS,
        message: 'We hope you had a truly unforgettable evening! Check our Facebook page as we will be releasing photos from tonight over the week.'
    },

//Keble ball notifications
    {
        start_time: moment('2015-05-09 19:55:00').toDate(),
        channel_id: KEBLE,
        message: 'Keble Ball will be opening in 5 minutes!'
    },
    {
        start_time: moment('2015-05-09 20:15:00').toDate(),
        channel_id: KEBLE,
        message: 'Welcome to the Keble Ball 2015. Our app will send you notifications throughout the night to keep you up to date.'
    },
    {
        start_time: moment('2015-05-09 20:30:00').toDate(),
        channel_id: KEBLE,
        message: 'Head over to Hayward Quad to hear Beer Pressure perform!'
    },
    {
        start_time: moment('2015-05-09 21:00:00').toDate(),
        channel_id: KEBLE,
        message: 'Mama Brass will now begin playing in Pusey Quad'
    },
    {
        start_time: moment('2015-05-09 21:15:00').toDate(),
        channel_id: KEBLE,
        message: 'Reprobate will now start their performance at Hayward Quad'
    },
    {
        start_time: moment('2015-05-09 22:00:00').toDate(),
        channel_id: KEBLE,
        message: 'The Little Comets is now performing in Pusey Quad'
    },
    {
        start_time: moment('2015-05-09 22:00:00').toDate(),
        channel_id: KEBLE,
        message: 'Garfunkel is about to start playing in the Hayward Quad'
    },
    {
        start_time: moment('2015-05-09 23:00:00').toDate(),
        channel_id: KEBLE,
        message: 'The Busy Twist will now take over music in the Hayward Quad'
    },
    {
        start_time: moment('2015-05-09 23:15:00').toDate(),
        channel_id: KEBLE,
        message: 'Welcome Applebottom to the stage in Pusey Quad'
    },
    {
        start_time: moment('2015-05-10 00:00:00').toDate(),
        channel_id: KEBLE,
        message: 'Toddla T will begin his performance in Pusey Quad now'
    },
    {
        start_time: moment('2015-05-10 00:30:00').toDate(),
        channel_id: KEBLE,
        message: 'Sink the Pink will now be performing in Hayward Quad'
    },
    {
        start_time: moment('2015-05-10 01:00:00').toDate(),
        channel_id: KEBLE,
        message: 'Jonas Rathsman will begin his performance at Pusey Quad'
    },
    {
        start_time: moment('2015-05-10 02:00:00').toDate(),
        channel_id: KEBLE,
        message: "It's time for our Silent Disco! Head over to Hayword & Liddon Quad to get started"
    },
    {
        start_time: moment('2015-05-10 04:15:00').toDate(),
        channel_id: KEBLE,
        message: 'We hope you had a truly unforgettable evening! Check our Facebook page as we will be releasing photos from tonight over the week.'
    },

// Balliol Ball
    {
        start_time: moment('2015-05-09 19:25:00').toDate(),
        channel_id: BALLIOL,
        message: 'Balliol Ball will be opening in 5 minutes!'
    },
    {
        start_time: moment('2015-05-09 19:30:00').toDate(),
        channel_id: BALLIOL,
        message: 'Welcome to the Balliol Ball 2015. Our app will send you notifications throughout the night to keep you up to date.'
    },
    {
        start_time: moment('2015-05-09 19:30:00').toDate(),
        channel_id: BALLIOL,
        message: 'Fourplay will begin in the Front Quad now'
    },
    {
        start_time: moment('2015-05-09 19:45:00').toDate(),
        channel_id: BALLIOL,
        message: 'Head over to the Fellows Garden to check out the Fire Poi performance!'
    },
    {
        start_time: moment('2015-05-09 20:00:00').toDate(),
        channel_id: BALLIOL,
        message: 'The Casino is open at the JCR, and the DFO is starting at the Mainstage now'
    },
    {
        start_time: moment('2015-05-09 21:00:00').toDate(),
        channel_id: BALLIOL,
        message: 'Welcome DJ Walt Frisbee to the Mainstage'
    },
    {
        start_time: moment('2015-05-09 22:00:00').toDate(),
        channel_id: BALLIOL,
        message: 'Whitecliffe will now takeover at the Mainstage'
    },
    {
        start_time: moment('2015-05-09 23:00:00').toDate(),
        channel_id: BALLIOL,
        message: 'Welcome Bipolar Sunshine to the stage!'
    },
    {
        start_time: moment('2015-05-10 00:00:00').toDate(),
        channel_id: BALLIOL,
        message: 'Silent Disco will begin now at the Mainstage'
    },
    {
        start_time: moment('2015-05-10 02:15:00').toDate(),
        channel_id: BALLIOL,
        message: 'We hope you had a truly unforgettable evening! Check our Facebook page as we will be releasing photos from tonight over the week.'
    },
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
