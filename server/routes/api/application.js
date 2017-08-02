var router = require('express').Router(),
    Responses = require('../../responses/api'),
    User = require('../../db/model/User.js'),
    Application = require('../../db/model/Application.js'),
    Confirmation = require('../../db/model/Confirmation.js'),
    config = require('../../../config/default.js'),
    authMiddleware = require('../../middleware/auth.js'),
    uploadHelper = require('../../interactors/multer-s3.js')(
        config.AWS_BUCKET_NAME
    );

router.post('/', uploadHelper.fields([{ name: 'resume' }]), function(req, res) {
    User.find()
        .byToken(req.authToken)
        .exec()
        .then(user => {
            var updateable_fields = [
                'birthday',
                'full_name',
                'university',
                'major',
                'tshirt',
                'experience',
                'resume',
                'github',
                'linkedin',
                'devpost',
                'portfolio',
                'race',
                'sex',
                'why_mhacks',
                'favorite_memory',
                'anything_else',
                'needs_reimbursement',
                'departing_from',
                'requested_reimbursement'
            ];
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

            Application.find().byToken(req.authToken).then(application => {
                if (application) {
                    application.updateFields(fields);

                    res.send({
                        status: true,
                        app: application
                    });
                } else {
                    fields.user = user.email;
                    Application.create(fields)
                        .then(application => {
                            user.application_submitted = true;
                            user.save();

                            res.send({
                                status: true,
                                app: application
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
            });
        })
        .catch(err => {
            console.error(err);
            res.send({
                status: false,
                message: Responses.UNKNOWN_ERROR
            });
        });
});

// Returns application for the current user
router.get('/', function(req, res) {
    Application.find({}, '-_id -__v -score -reader -review_notes')
        .byToken(req.authToken)
        .then(application => {
            res.send({
                status: true,
                application: application || {}
            });
        })
        .catch(() => {
            res.send({
                status: false,
                message: Responses.UNKNOWN_ERROR
            });
        });
});

// Returns all applications
router.get('/all', authMiddleware('admin', 'api'), function(req, res) {
    Application.find()
        .select('-_id -__v')
        .then(applications => {
            User.find({
                email: {
                    $in: applications
                        .filter(application => application.user)
                        .map(application => application.user)
                }
            })
                .select('full_name email')
                .then(users => {
                    res.send({
                        status: true,
                        applications: applications.map(application => {
                            const associated_user = users.find(
                                user => user.email === application.user
                            );
                            if (!associated_user) {
                                return application;
                            }
                            return Object.assign({}, application._doc, {
                                full_name: associated_user.full_name
                            });
                        })
                    });
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).send({
                        status: false,
                        message: Responses.UNKNOWN_ERROR
                    });
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({
                status: false,
                message: Responses.UNKNOWN_ERROR
            });
        });
});

router.post('/confirm', function(req, res) {
    User.find()
        .byToken(req.authToken)
        .exec()
        .then(user => {
            var updateable_fields = [
                'phone',
                'graduation',
                'employment',
                'degree',
                'travel',
                'skills'
            ];
            var fields = {};

            for (var i in req.body) {
                if (updateable_fields.indexOf(i) !== -1) {
                    fields[i] = req.body[i];
                }
            }

            Confirmation.find()
                .byToken(req.authToken)
                .then(confirmation => {
                    if (confirmation) {
                        confirmation.updateFields(fields);

                        res.send({
                            status: true,
                            confirmation
                        });
                    } else {
                        fields.user = user;
                        Confirmation.create(fields)
                            .then(confirmation => {
                                // strip extra info out of response
                                res.send({
                                    status: true,
                                    confirmation: Object.assign(
                                        {},
                                        confirmation._doc,
                                        {
                                            user: undefined,
                                            __v: undefined,
                                            _id: undefined
                                        }
                                    )
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
        })
        .catch(err => {
            console.error(err);
            res.send({
                status: false,
                message: Responses.UNKNOWN_ERROR
            });
        });
});

router.get('/confirm', function(req, res) {
    Confirmation.find()
        .byToken(req.authToken)
        .then(confirmation => {
            res.send({
                status: true,
                confirmation: confirmation || {}
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({
                status: false,
                message: Responses.UNKNOWN_ERROR
            });
        });
});

module.exports = router;
