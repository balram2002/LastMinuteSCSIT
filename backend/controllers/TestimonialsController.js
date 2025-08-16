import mongoose from 'mongoose';
import { Testimonials } from '../models/TestimonialsModel.js';

export const getAllTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonials.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: testimonials.length, testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

export const getTestimonial = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid testimonial ID' });
        }
        const testimonial = await Testimonials.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }
        res.status(200).json({ success: true, testimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

export const getTestimonialsByUser = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }
        const testimonials = await Testimonials.find({ userId: req.params.id });
        if (!testimonials || testimonials.length === 0) {
            return res.status(404).json({ success: false, message: 'No testimonials found for this user' });
        }
        res.status(200).json({ success: true, testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

export const uploadTestimonial = async (req, res) => {
    try {
        const { text, rating, userId, username, userEmail, isUserAdmin, course, semester } = req.body;

        if (!text?.trim() || !userId || !username || !userEmail) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const newTestimonial = new Testimonials({
            text,
            rating,
            userId,
            username,
            userEmail,
            course,
            semester: Number(semester),
            isUserAdmin: isUserAdmin || false,
        });

        await newTestimonial.save();
        res.status(201).json({ success: true, testimonial: newTestimonial });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

export const updateTestimonial = async (req, res) => {
    const { course, semester, text, rating } = req.body;
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid testimonial ID' });
        }

        const updateData = {};
        if (text) updateData.text = text;
        if (rating) updateData.rating = rating;
        if (course) updateData.course = course;
        if (semester) updateData.semester = Number(semester);

        const updatedTestimonial = await Testimonials.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedTestimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }

        res.status(200).json({ success: true, testimonial: updatedTestimonial });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

export const deleteTestimonial = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid testimonial ID' });
        }

        const deletedTestimonial = await Testimonials.findByIdAndDelete(req.params.id);
        if (!deletedTestimonial) {
            return res.status(404).json({ success: false, message: 'Testimonial not found' });
        }
        res.status(200).json({ success: true, message: 'Testimonial deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};