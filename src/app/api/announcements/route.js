import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const baranggay = searchParams.get('baranggay') || session.user.baranggay;

    const where = {};
    if (baranggay) {
      where.baranggay = baranggay;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, content, baranggay } = body;

    const targetBaranggay = baranggay || session.user.baranggay;

    if (!title || !content || !targetBaranggay) {
      return NextResponse.json({ error: 'Title, content, and baranggay are required' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        baranggay: targetBaranggay,
        authorId: session.user.id
      },
      include: {
        author: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
