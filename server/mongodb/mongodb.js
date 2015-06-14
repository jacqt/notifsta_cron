/* Anthony Guo (anthony.guo@some.ox.ac.uk)
 * Code that pushes data into our mongodb
 */

var monk = require('monk');
var db = monk('localhost:27017/notifsta_crondb')

// Assert function
function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

function IsACronJob(job) {
    return (job.start_time && job.channel_id && job._id && job.message);
}

function SetIndexes() {
  //Indexes
}

function GetCronJobs(channel_id) {
    if (!channel_id) {
        return db.get('cronjobs').find({}, {});
    } else {
        return db.get('cronjobs').find({ channel_id: channel_id }, {});
    }
}

function GetCronJob(job_id) {
    return db.get('cronjobs').findOne({ id: job_id }, {});
}

function InsertCronJob(id, channel_id, start_time, message) {
    var cronjobs = db.get('cronjobs');
    return cronjobs.insert({
        id: id,
        channel_id: channel_id,
        start_time: start_time.toISOString(),
        message: message
    }, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log(JSON.stringify({
                type: 'job_added_to_db',
                channel_id: channel_id,
                start_time: start_time.toISOString(),
                message: message,
            }));
        }
    })
}

function DeleteCronJob(job_id) {
    return db.get('cronjobs').remove({ id: job_id }, {});
}
function UpdateCronJob(job_id, start_time, message) {
    return db.get('cronjobs').update({ id: job_id }, {
        id: job_id,
        start_time: start_time.toISOString(),
        message: message
    });
}

SetIndexes();

module.exports = {
    GetCronJobs: GetCronJobs,
    GetCronJob: GetCronJob,
    InsertCronJob: InsertCronJob,
    DeleteCronJob: DeleteCronJob,
    UpdateCronJob: UpdateCronJob
}
