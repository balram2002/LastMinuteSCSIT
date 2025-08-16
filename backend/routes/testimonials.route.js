import express from 'express';
import { deleteTestimonial, getAllTestimonials, getTestimonial, getTestimonialsByUser, updateTestimonial, uploadTestimonial } from '../controllers/TestimonialsController.js';

const router = express.Router();

router.get('/getalltestimonials', getAllTestimonials);
router.get('/gettestimonial/:id', getTestimonial);
router.get('/gettestimonialsbyuser/:id', getTestimonialsByUser);
router.post('/uploadtestimonial', uploadTestimonial);
router.put('/updatetestimonial/:id', updateTestimonial);
router.delete('/deletetestimonial/:id', deleteTestimonial);

export default router;