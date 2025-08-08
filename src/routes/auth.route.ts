import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { signup, signin, signout, forgotPassword, resetPassword } from '../contollers/auth.controller'

const router = express.Router()

export function authRoutes(): Router {
    router.route('/signup').post(asyncHandler(signup))
    router.route('/signin').post(asyncHandler(signin))
    router.route('/signout').post(asyncHandler(signout))
    router.route('/forgot').post(asyncHandler(forgotPassword))
    router.route('/reset').post(asyncHandler(resetPassword))    
  return router
}