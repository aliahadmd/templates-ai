export declare const sendEmail: (to: string, subject: string, html: string) => Promise<void>;
export declare const sendVerificationEmail: (to: string, token: string) => Promise<void>;
export declare const sendPasswordResetEmail: (to: string, token: string) => Promise<void>;
