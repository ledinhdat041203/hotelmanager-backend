import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: process.env.HM_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.HM_CLOUDINARY_API_KEY,
      api_secret: process.env.HM_CLOUDINARY_API_SECRET,
    });
  },
};
