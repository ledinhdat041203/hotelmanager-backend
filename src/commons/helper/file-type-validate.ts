import { BadRequestException } from '../core';

export function fileTypeValidation(
  req: Request,
  file: Express.Multer.File,
  cb: any,
) {
  if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException({ message: 'định dạng file không phù hợp' }),
      false,
    );
  }
}

export function fileTypeExcelValidation(
  req: Request,
  file: Express.Multer.File,
  cb: any,
) {
  // Cho phép các định dạng file Excel phổ biến
  if (
    file.mimetype.match(
      /\/(vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.ms-excel|xlsm)$/,
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException({
        message:
          'Định dạng file không phù hợp, chỉ chấp nhận các file Excel (xlsx, xls, xlsm).',
      }),
      false,
    );
  }
}
