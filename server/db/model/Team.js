var {
        mongoose,
        defaultOptions,
        modifySchema,
        defaultSchema,
        defaultEndSchema
    } = require('../index.js'),
    sanitizerPlugin = require('mongoose-sanitizer-plugin'),
    escapeStringRegex = require('escape-string-regexp');

// Define the document Schema
var schema = new mongoose.Schema(
    Object.assign(
        {},
        defaultSchema,
        {
            name: {
                type: String,
                form: {
                    user_editable: true,
                    label: 'Team Name',
                    placeholder: 'Hacker McHackerTeam'
                }
            },
            description: {
                type: String,
                form: {
                    user_editable: true,
                    label: 'Description',
                    placeholder: 'Your description goes here'
                }
            },
            //First user in the array will be the 'leader'
            members: {
                type: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User'
                    }
                ],
                form: {
                    auth_groups: ['admin'],
                    label: 'Members',
                    placeholder: 'Members'
                }
            }
        },
        defaultEndSchema
    ),
    defaultOptions
);

//Checks the length of the description
schema.path('description').validate(function(val) {
    return val.length >= 40;
}, 'A descrpition must be at least 100 characters.');

// Allow us to query by name
schema.query.byTeamName = function(name) {
    var escapedName = escapeStringRegex(name);
    return this.findOne({
        name: new RegExp(escapedName, 'i')
    });
};

schema.plugin(sanitizerPlugin);

modifySchema(schema);

// Initialize the model with the schema, and export it
var model = mongoose.model('Team', schema);

module.exports = model;
