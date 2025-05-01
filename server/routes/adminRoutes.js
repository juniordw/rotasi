import express from 'express';
import { 
    getPendingRegistrations, 
    approveRegistration, 
    rejectRegistration,
    makeAdmin
} from '../controllers/adminController.js';
import { protectAdmin } from '../middlewares/authMiddleware.js';

const adminRouter = express.Router();

// Get all pending registrations
adminRouter.get('/pending-registrations', protectAdmin, getPendingRegistrations);

// Approve a registration
adminRouter.post('/approve-registration', protectAdmin, approveRegistration);

// Reject a registration
adminRouter.post('/reject-registration', protectAdmin, rejectRegistration);

// Make a user an admin
adminRouter.post('/make-admin', protectAdmin, makeAdmin);

export default adminRouter;