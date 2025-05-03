import { signUp, login } from '../services/authService.js';

export const signUpController = async (req, res, next) => {
  try {
    const userData = req.body;
    const result = await signUp(userData);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Sign-up successful',
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (req, res, next) => {
  try {
    const loginData = req.body;
    const result = await login(loginData);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};
export default { 
  signUpController, 
  loginController 
};


