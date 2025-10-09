import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email';
import {username} from "better-auth/plugins";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        username({
            usernameNormalization: false
        })
    ],
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
            Promise.race([
                sendEmail({
                    to: user.email,
                    subject: 'Verify your email address',
                    text: `Click the link to verify your email: ${url}?verified=1`
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout email')), 5000))
            ]).catch(err => {
                console.error('Erreur envoi email:', err);
            });
            return;
        }
    }
})