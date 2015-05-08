var CronJob = require('cron').CronJob;
var moment = require('moment');
var request = require('request');


GLOBAL_ADMIN_EMAIL = 'admin@example.com'; //Make sure this account has admin access over all channels
GLOBAL_ADMIN_TOKEN = 'GsY6d6itxGxj_GsG1BjA'; //Make sure that this is up to date


var ORIEL = 3;
var BALLIOL =  8;
var HUGHS =  1;
var KEBLE = 15;


/* Hard code these job 
 *  Make sure the that the start_time is a Date object
 */
var jobs = [
    {
        start_time: moment('2015-05-09 19:55:00').toDate(),
        channel_id: HUGHS,
        message: 'The Ball will be opening in 5 minutes. Make sure you have your wristbands reading to be scanned.'
    },
    {
        start_time: moment('2015-05-09 20:15:00').toDate(),
        channel_id: HUGHS,
        message: 'Welcome to the St Hugh’s Ball 2015. Our app will send you notifications throughout the night to keep you up to date.'
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
        message: 'The DJ Tent is now open with SWITCH from Oxford’s O2 Academy. Jamie Berry is on the Main Stage and Billie Black is now performing in The Enchanted Court.'
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
        message: 'The St Hugh’s Ball will be ending shortly, please follow directions from the Stewards and make your way to the exit.'
    },
    {
        start_time: moment('2015-05-09 04:30:00').toDate(),
        channel_id: HUGHS,
        message: 'We hope you had a truly unforgettable evening! Check our Facebook page as we will be releasing photos from tonight over the week.'
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
