import express from 'express'
import { deleteFile, fetchAdminFiles, fetchAllFiles, fetchFilesCourseAndSemester, proxyPdf, updateFile, uploadFile } from '../controllers/file.controller.js';

import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);
router.post('/fetchCourseAndSemester', fetchFilesCourseAndSemester);
router.get('/proxy', proxyPdf);
router.get('/allfiles', fetchAllFiles);
router.post('/adminfiles', fetchAdminFiles);
router.put('/update', updateFile);
router.post('/delete', deleteFile);

export default router;