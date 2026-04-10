const mongoose = require('mongoose');

const certTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['volunteer_completion', 'volunteer_passport', 'achievement_badge', 'hours_milestone', 'skill_certification'],
    default: 'volunteer_completion',
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  bodyText: { type: String, required: true },
  signatoryName: { type: String, default: 'UNITEE Administrator' },
  signatoryTitle: { type: String, default: 'Platform Director, UNITEE' },
  footerNote: { type: String, default: 'Verify at unitee.cm/verify/{{certificateId}}' },
  accentColor: { type: String, default: '#f97316' },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

// Only one default per type
certTemplateSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { type: this.type, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model('CertificateTemplate', certTemplateSchema);
