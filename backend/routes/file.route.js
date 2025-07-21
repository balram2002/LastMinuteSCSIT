import express from 'express'
import multer from 'multer';
import { fetchFilesCourseAndSemester, proxyPdf, uploadFile } from '../controllers/file.controller.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), uploadFile);
router.post('/fetchCourseAndSemester', fetchFilesCourseAndSemester);
router.get('/proxy', proxyPdf)

export default router;
