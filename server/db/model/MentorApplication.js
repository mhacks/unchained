var {
        mongoose,
        defaultOptions,
        modifySchema,
        defaultSchema
    } = require('../index.js'),
    sanitizerPlugin = require('mongoose-sanitizer-plugin'),
    config = require('../../../config/default.js'),
    skills = require('../../../static/misc/skills.json').map(str => {
        return {
            value: str,
            label: str
        };
    });

// Define the document Schema
var schema = new mongoose.Schema(
    Object.assign({}, defaultSchema, {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            form: {
                auth_groups: ['admin'],
                label: 'User ID',
                type_override: String
            }
        },
        general_header: {
            type: String,
            form: {
                label: 'General',
                type_override: 'sectionheader'
            }
        },
        skills: {
            type: [String],
            default: [],
            required: true,
            form: {
                user_editable: true,
                label: 'I can mentor in...',
                array_select: skills,
                type_override: 'array'
            }
        },
        qualifications: {
            type: String,
            required: true,
            form: {
                user_editable: true,
                label:
                    'List down anything that qualifies you to be a mentor (e.g. projects, classes, work experience, hobbies, past hackathons, etc.)',
                type_override: 'essay'
            }
        },
        hackathons_been: {
            type: Number,
            required: true,
            form: {
                user_editable: true,
                label: 'How many hackathons have you been to?'
            }
        },
        hackathons_mentored: {
            type: Number,
            required: true,
            form: {
                user_editable: true,
                label: 'How many hackathons have you mentored at?'
            }
        },
        availability_during: {
            type: String,
            required: true,
            form: {
                user_editable: true,
                label: 'Availability during the event'
            }
        },
        links_header: {
            type: String,
            form: {
                label: 'Links',
                type_override: 'sectionheader'
            }
        },
        resume: {
            type: String,
            form: {
                user_editable: true,
                label: 'Resume',
                type_override: 'file'
            }
        },
        github: {
            type: String,
            form: {
                user_editable: true,
                label: 'GitHub',
                placeholder: 'https://github.com/'
            }
        },
        linkedin: {
            type: String,
            form: {
                user_editable: true,
                label: 'LinkedIn',
                placeholder: 'https://linkedin.com/in/'
            }
        },
        devpost: {
            type: String,
            form: {
                user_editable: true,
                label: 'DevPost',
                placeholder: 'https://devpost.com/'
            }
        },
        portfolio: {
            type: String,
            form: {
                user_editable: true,
                label: 'Portfolio',
                placeholder: 'https://'
            }
        },
        demographics_header: {
            type: String,
            form: {
                label: 'Demographics',
                type_override: 'sectionheader'
            }
        },
        birthday: {
            type: Date,
            required: true,
            form: {
                user_editable: true,
                label: 'Date of Birth',
                placeholder: 'mm/dd/yyyy'
            }
        },
        tshirt: {
            type: String,
            required: true,
            enum: ['xs', 's', 'm', 'l', 'xl', '2xl', '3xl'],
            form: {
                user_editable: true,
                label: 'T-Shirt',
                select: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']
            }
        },
        race: {
            type: String,
            enum: [
                'unselected',
                'white',
                'black',
                'am-indian-alaskan',
                'asian',
                'hispanic',
                'other',
                'prefer-not'
            ],
            form: {
                user_editable: true,
                select: [
                    '',
                    'White',
                    'Black',
                    'American Indian/Alaskan',
                    'Asian',
                    'Hispanic',
                    'Other',
                    'Prefer not to answer'
                ],
                label: 'Race'
            }
        },
        sex: {
            type: String,
            enum: ['unselected', 'male', 'female', 'non-binary', 'prefer-not'],
            form: {
                user_editable: true,
                select: [
                    '',
                    'Male',
                    'Female',
                    'Non Binary',
                    'Prefer not to answer'
                ],
                label: 'Sex'
            }
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        save_button: {
            type: String,
            form: {
                label: 'Save',
                type_override: 'submit'
            }
        }
    }),
    defaultOptions
);

// Allow us to query by token
schema.query.byToken = function(findToken) {
    return mongoose
        .model('User')
        .find()
        .byToken(findToken)
        .then(user => {
            return this.findOne({ user: user });
        })
        .catch(() => {});
};

schema.query.byUser = function(user) {
    return this.findOne({ user: user });
};

schema.methods.getResume = function() {
    if (this.resume) {
        return (
            config.host +
            '/v1/artifact/resume/' +
            this.user.email +
            '?application=true'
        );
    }
    return null;
};

schema.plugin(sanitizerPlugin);

modifySchema(schema);

// Initialize the model with the schema, and export it
var model = mongoose.model('MentorApplication', schema);

module.exports = model;
