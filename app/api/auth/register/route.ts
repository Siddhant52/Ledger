import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createOpaqueToken, hashString, splitOpaqueToken } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import { validateEmail, validateName, validatePassword, validateUsername } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const { name, username, email, password, confirmPassword } = await req.json();
    const cleanedUsername = String(username || '').trim().toLowerCase();
    const cleanedEmail = String(email || '').trim().toLowerCase();

    const nameValidation = validateName(name);
    if (!nameValidation.valid) return NextResponse.json({ error: nameValidation.message }, { status: 400 });

    const usernameValidation = validateUsername(cleanedUsername);
    if (!usernameValidation.valid) return NextResponse.json({ error: usernameValidation.message }, { status: 400 });

    const emailValidation = validateEmail(cleanedEmail);
    if (!emailValidation.valid) return NextResponse.json({ error: emailValidation.message }, { status: 400 });

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) return NextResponse.json({ error: passwordValidation.message }, { status: 400 });

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
    }

    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: cleanedEmail } }),
      prisma.user.findUnique({ where: { username: cleanedUsername } }),
    ]);

    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        username: cleanedUsername,
        email: cleanedEmail,
        password: hashedPassword,
      },
    });

    const verificationToken = createOpaqueToken(user.id);
    const parsed = splitOpaqueToken(verificationToken);
    const verificationHash = parsed ? await hashString(parsed.secret) : null;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationHash,
        emailVerificationTokenExpires: expiresAt,
      },
    });

    await sendVerificationEmail(user.email, user.name, verificationToken);
    return NextResponse.json({ message: 'Registration successful. Check your email to verify your account.' });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
