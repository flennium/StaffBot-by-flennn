const mongoose = require('mongoose');

const casesSchema = new mongoose.Schema({
  Staff: {
    UserID: {
      type: String,
      required: false
    },
     Points: [{
         discord: {
             type: Number,
             default: 0,
             required: false
         },
         minecraft: {
             type: Number,
             default: 0,
             required: false
         },
         compensation: {
             type: Number,
             default: 0,
             required: false },
          tickets: {
             type: Number,
             default: 0,
             required: false }
    }],
    cases: [
      {
        platform:{
          type: String,
          enum: ['MINECRAFT', 'DISCORD', 'COMPENSATION'],
          required: true
        },
        IGN: {
          type: String,
          required: true
        },
        Reason: {
          type: String,
          required: true
        },
        PunishmentType: {
          type: String,
          enum: ['MUTE', 'BAN', 'WARN', 'KICK', 'TIMEOUT', 'NONE'],
          required: true
        },
        Timestamp: {
          type: Number,
          required: true
        },
        duration: {
          type: String,
          required: true
        },
        Evidence: {
          type: String,
          required: true
        },
        CaseID: {
          type: Number,
          default: 0,
          required: true
        }
      }
    ]
  }
});

const CaseModel = mongoose.model('Case', casesSchema);

module.exports = CaseModel;