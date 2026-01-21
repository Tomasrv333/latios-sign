import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    UseGuards,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        fileFilter: (req, file, cb) => {
            if (file.mimetype !== 'application/pdf') {
                return cb(new BadRequestException('Only PDF files are allowed!'), false);
            }
            cb(null, true);
        }
    }))
    uploadFile(@UploadedFile() file: any) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        // Return relative path for frontend
        return {
            url: `/uploads/${file.filename}`,
            filename: file.filename,
            originalname: file.originalname,
            size: file.size
        };
    }
}
