import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createCase = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const { title, description, issueType } = req.body; 

    const newCase = await prisma.case.create({
      data: {
        title,
        description,
        lawyerId,
        issueType 
      },
    });

    return res.status(201).json(newCase);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create case' });
  }
};

export const updateCase = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    const caseId = Number(req.params.id);
    const { title, description } = req.body; 

    const updatedCase = await prisma.case.update({
      where: { id: caseId, lawyerId },
      data: { title, description },
    });

    return res.json(updatedCase);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update case' });
  }
};

export const getCases = async (req, res) => {
  try {
    const lawyerId = req.user.id;
    console.log('Lawyer ID from token:', lawyerId); // Debug log

    const cases = await prisma.case.findMany({
      where: { lawyerId },
    });

    console.log('Cases found:', cases); // Debug log
    return res.json(cases);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch cases' });
  }
};
// export const getCases = async (req, res) => {
//   try {
//     const lawyerId = req.user.id;
//     const cases = await prisma.case.findMany({
//       where: { lawyerId },
//       // Optionally include related data, e.g., client info
//     });
//     return res.json(cases);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Failed to fetch cases' });
//   }
// };

export const getCaseById = async (req, res) => {
    try {
      const lawyerId = req.user.id;
      const caseId = Number(req.params.id);
      const caseItem = await prisma.case.findFirst({
        where: { id: caseId, lawyerId }
      });
      if (!caseItem) {
        return res.status(404).json({ error: 'Case not found' });
      }
      return res.json(caseItem);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch case details' });
    }
  };
  // src/controllers/caseController.js
export const updateCaseStatus = async (req, res) => {
    try {
      const lawyerId = req.user.id;
      const caseId = Number(req.params.id);
      const { status } = req.body;
      // Example: validate status string manually or via middleware
      const allowedStatuses = ['open', 'in progress', 'closed'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      const updatedCase = await prisma.case.updateMany({
        where: { id: caseId, lawyerId },
        data: { status }
      });
      if (updatedCase.count === 0) {
        return res.status(404).json({ error: 'Case not found or not authorized' });
      }
      // Fetch updated case to return (or use updateUnique if guaranteed to exist)
      const caseItem = await prisma.case.findUnique({ where: { id: caseId } });
      return res.json(caseItem);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update case status' });
    }
  };
  
