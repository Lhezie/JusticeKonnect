import express from 'express';
import { getCases, getCaseById, updateCaseStatus, createCase } from '../controllers/caseController.js';
import { updateAvailability } from '../controllers/availabilityController.js';
import {
  listAppointments, acceptAppointment, rescheduleAppointment, cancelAppointment
} from '../controllers/appointmentController.js';
import {authenticateJWT} from '../middleware/authenticateJWT.js';
import { checkRole } from '../middleware/checkRole.js';
// import validate from '../middleware/validate.js';
import { startCall, getCallStatus } from '../controllers/callController.js';
import { submitVideoReview, getVideoReview } from '../controllers/videoReviewController.js';

const router = express.Router();

// Case Management routes (all use authenticateJWT and checkRole('lawyer'))
router.get('/cases', authenticateJWT, checkRole('lawyer'), getCases);
// src/routes/lawyerRoutes.js
router.get('/cases/:id', authenticateJWT, checkRole('lawyer'), getCaseById);
router.post('/cases', authenticateJWT, checkRole('lawyer'), createCase);
router.get('/appointments', authenticateJWT, checkRole('lawyer'), listAppointments);

router.post(
    '/cases/:id/update-status',
    authenticateJWT,
    checkRole('lawyer'),
    
    updateCaseStatus
  );
  

router.post(
    '/appointments/:id/accept',
    authenticateJWT,
    checkRole('lawyer'),
    acceptAppointment
  );
  
router.post(
    '/availability',
    authenticateJWT,
    checkRole('lawyer'),
    updateAvailability
  );
  
router.post(
    '/appointments/:id/reschedule',
    authenticateJWT,
    checkRole('lawyer'),
    // Optionally: validate('rescheduleSchema'),
    rescheduleAppointment
  );
  
router.post(
    '/appointments/:id/cancel',
    authenticateJWT,
    checkRole('lawyer'),
    cancelAppointment
  );

// Call session routes
router.post('/calls/start', authenticateJWT, checkRole('lawyer'), startCall);
router.get('/calls/status/:callId', authenticateJWT, checkRole('lawyer'), getCallStatus);

// Video review routes
router.post('/video-review', authenticateJWT, checkRole('lawyer'), submitVideoReview);
router.get('/video-review/:appointmentId', authenticateJWT, checkRole('lawyer'), getVideoReview);



export default router;