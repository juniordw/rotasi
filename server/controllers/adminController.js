import User from "../models/User.js";
import Course from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";
import { clerkClient } from '@clerk/express';

// Get All Pending Course Registrations
export const getPendingRegistrations = async (req, res) => {
    try {
        const pendingRegistrations = await Purchase.find({ status: 'pending' })
            .populate('userId', 'name email imageUrl')
            .populate('courseId', 'courseTitle coursePrice discount');

        res.json({ success: true, pendingRegistrations });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Approve Course Registration
export const approveRegistration = async (req, res) => {
    try {
        const { purchaseId, notes } = req.body;
        const adminId = req.auth.userId;

        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) {
            return res.json({ success: false, message: 'Permintaan pendaftaran tidak ditemukan' });
        }

        const userData = await User.findById(purchase.userId);
        const courseData = await Course.findById(purchase.courseId);

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data User atau Kursus tidak ditemukan' });
        }

        // Update purchase status
        purchase.status = 'approved';
        purchase.approvedBy = adminId;
        purchase.approvalDate = new Date();
        purchase.notes = notes || '';
        await purchase.save();

        // Add student to course
        if (!courseData.enrolledStudents.includes(userData._id)) {
            courseData.enrolledStudents.push(userData);
            await courseData.save();
        }

        // Add course to user's enrolled courses
        if (!userData.enrolledCourses.includes(courseData._id)) {
            userData.enrolledCourses.push(courseData._id);
            await userData.save();
        }

        res.json({ success: true, message: 'Pendaftaran kursus berhasil disetujui' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Reject Course Registration
export const rejectRegistration = async (req, res) => {
    try {
        const { purchaseId, notes } = req.body;
        const adminId = req.auth.userId;

        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) {
            return res.json({ success: false, message: 'Permintaan pendaftaran tidak ditemukan' });
        }

        // Update purchase status
        purchase.status = 'rejected';
        purchase.approvedBy = adminId;
        purchase.approvalDate = new Date();
        purchase.notes = notes || '';
        await purchase.save();

        res.json({ success: true, message: 'Pendaftaran kursus ditolak' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Make a user an admin
export const makeAdmin = async (req, res) => {
    try {
        const { userId } = req.body;
        const adminId = req.auth.userId;

        // Verifikasi bahwa yang request adalah admin
        const adminData = await clerkClient.users.getUser(adminId);
        if (adminData.publicMetadata.role !== 'admin') {
            return res.json({ success: false, message: 'Anda tidak memiliki akses admin' });
        }

        // Set role user menjadi admin
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'admin',
            },
        });

        res.json({ success: true, message: 'User berhasil dijadikan admin' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}