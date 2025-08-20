import { createClient } from "@supabase/supabase-js";

/**
 * Create a Supabase admin client for server-side operations
 * This uses the service role key which has admin privileges
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(
            "Missing Supabase environment variables for admin operations",
        );
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 12): string {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*";

    const allChars = lowercase + uppercase + numbers + symbols;

    let password = "";

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");
}

/**
 * Create a new user with admin privileges
 */
export async function createUserWithAdmin(
    name: string,
    email: string,
    role: string,
): Promise<{ user: any; password: string; error: any }> {
    try {
        const adminClient = createAdminClient();
        const password = generateSecurePassword();

        // Create user with admin API
        const { data: user, error } = await adminClient.auth.admin.createUser({
            email,
            password,
            user_metadata: {
                name,
                role,
            },
            email_confirm: true, // Auto-confirm email
        });

        if (error) {
            console.error("Error creating user:", error);
            return { user: null, password: "", error };
        }

        // The profile will be automatically created by the trigger
        return { user, password, error: null };
    } catch (error) {
        console.error("Error in createUserWithAdmin:", error);
        return { user: null, password: "", error };
    }
}

/**
 * Send welcome email with credentials
 *
 * IMPORTANT: Currently this is a placeholder that only logs to console.
 * To actually send emails, you need to implement one of these options:
 *
 * Option 1: Use Supabase's built-in SMTP (configure in Supabase dashboard)
 * Option 2: Use a service like Resend, SendGrid, or Nodemailer
 * Option 3: Use Supabase Edge Functions for email sending
 *
 * For now, the password is logged to the server console for admin reference.
 */
export async function sendWelcomeEmail(
    email: string,
    name: string,
    password: string,
): Promise<{ success: boolean; error?: string }> {
    // PLACEHOLDER: Currently only logging - replace with actual email sending
    console.log(`📧 User created for ${email}`);
    console.log(`📝 Name: ${name}`);
    console.log(`🔑 Temporary password: ${password}`);
    console.log(
        `⚠️  ADMIN: Please manually send these credentials to the user`,
    );

    // TODO: Implement actual email sending here
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'noreply@yourcompany.com',
    //   to: email,
    //   subject: 'Welcome to PestHub - Your Account Details',
    //   html: `
    //     <h1>Welcome to PestHub, ${name}!</h1>
    //     <p>Your account has been created with the following credentials:</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Temporary Password:</strong> ${password}</p>
    //     <p>Please log in and change your password.</p>
    //   `
    // });

    return { success: true };
}
