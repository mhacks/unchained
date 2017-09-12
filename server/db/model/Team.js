var mongoose = require('../index.js'),
    sanitizerPlugin = require('mongoose-sanitizer-plugin'),
    escapeStringRegex = require('escape-string-regexp');

// Define the document Schema
var schema = new mongoose.Schema({
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
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

//Checks the amount of members on a team
schema.path('members').validate(function(val) {
  return val.length <= 4;
}, 'Teams may only consist of 4 members.');

//Checks the length of the description
schema.path('description').validate(function(val) {
  return val.length >= 100;
}, 'A descrpition must be at least 100 characters.');

// Allow us to query by name
schema.query.byTeamName = function(name) {
    var escapedName = escapeStringRegex(name);
    return this.findOne({
        name: new RegExp(escapedName, 'i')
    });
};

schema.query.allMembers = function(teamId) {
    this.findById(teamId, function(team){
        return {members: team.members}
    });
};

schema.methods.updateFields = function(fields) {
    for (var param in fields) {
        this[param] = fields[param];
    }
    this.save();
};

schema.statics.getUpdateableFields = function(groups) {
    var updateables = [];

    for (var key in schema.obj) {
        var field = schema.obj[key];

        if (field.form) {
            if (field.form.user_editable) {
                updateables.push(key);
            } else if (groups) {
                groups.forEach(function(group) {
                    if (
                        field.form.auth_groups &&
                        field.form.auth_groups.indexOf(group) !== -1
                    ) {
                        updateables.push(key);
                    }
                });
            }
        }
    }

    return updateables;
};

schema.plugin(sanitizerPlugin);

// Initialize the model with the schema, and export it
var model = mongoose.model('Team', schema);

module.exports = model;
