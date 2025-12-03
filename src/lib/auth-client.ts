import { createAuthClient } from 'better-auth/react'
import {usernameClient} from "better-auth/client/plugins";

export const { signIn, signUp, signOut, useSession, isUsernameAvailable, sendVerificationEmail } = createAuthClient({
    plugins: [
        usernameClient()
    ]
})