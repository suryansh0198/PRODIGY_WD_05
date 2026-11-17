import mongoose from 'mongoose';

const savedLocationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Location must be associated with a user'],
      index: true,
    },
    label: {
      type: String,
      required: [true, 'Please provide a label for this location (e.g. Home, Work)'],
      trim: true,
      maxlength: [40, 'Label cannot exceed 40 characters'],
    },
    cityName: {
      type: String,
      required: [true, 'Please provide a city name'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude cannot be less than -90'],
      max: [90, 'Latitude cannot exceed 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude cannot be less than -180'],
      max: [180, 'Longitude cannot exceed 180'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

savedLocationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const SavedLocation = mongoose.model('SavedLocation', savedLocationSchema);

export default SavedLocation;
