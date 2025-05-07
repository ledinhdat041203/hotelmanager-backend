// cloudinary.service.ts

import { CloudinaryResponse } from '@/commons';
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
// import streamifier from 'streamifier';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(
    file: Express.Multer.File,
    folderName: string,
  ): Promise<CloudinaryResponse> {
    console.log('flee::', file);
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderName },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
