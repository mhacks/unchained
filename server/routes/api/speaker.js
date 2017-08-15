var router = require('express').Router(),
    Responses = require('../../responses/api'),
    SpeakerApplication = require('../../db/model/SpeakerApplication.js'),
    config = require('../../../config/default.js'),
    uploadHelper = require('../../interactors/multer-s3.js')(
        config.AWS_BUCKET_NAME
    );

router.post('/application', uploadHelper.fields([{ name: 'resume' }]), function(
    req,
    res
) {
    var updateable_fields = SpeakerApplication.getUpdateableFields(req.groups);
    var fields = {};

    if (req.files && req.files.resume) {
        req.body.resume =
            req.files.resume[0].location ||
            '/uploads/' + req.files.resume[0].filename;
    }

    for (var i in req.body) {
        if (i === 'birthday') {
            if (!parseInt(req.body[i])) {
                continue;
            }
        }

        if (updateable_fields.indexOf(i) !== -1) {
            fields[i] = req.body[i];
        }
    }

    SpeakerApplication.find()
        .byUser(req.user)
        .then(application => {
            if (application) {
                application.updateFields(fields);

                res.send({
                    status: true,
                    speaker_application: application
                });
            } else {
                fields.user = req.user;
                SpeakerApplication.create(fields)
                    .then(application => {
                        res.send({
                            status: true,
                            speaker_application: application
                        });
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).send({
                            status: false,
                            message: Responses.UNKNOWN_ERROR
                        });
                    });
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({
                status: false,
                message: Responses.UNKNOWN_ERROR
            });
        });
});

// Returns speaker application for the current user
router.get('/application', function(req, res) {
    SpeakerApplication.find({}, '-_id -__v')
        .byUser(req.user)
        .then(application => {
            res.send({
                status: true,
                speaker_application: application || {}
            });
        })
        .catch(() => {
            res.send({
                status: false,
                message: Responses.UNKNOWN_ERROR
            });
        });
});

module.exports = router;