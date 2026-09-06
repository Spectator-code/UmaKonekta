import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (session.user.role === 'provider') {
      const assets = await prisma.asset.findMany({
        where: { providerId: session.user.id }
      })
      const requests = await prisma.dispatchRequest.findMany({
        where: { asset: { providerId: session.user.id } },
        include: { farmer: true, asset: true }
      })
      return NextResponse.json({ assets, requests });
    }
    
    if (session.user.role === 'farmer') {
      const requests = await prisma.dispatchRequest.findMany({
        where: { farmerId: session.user.id },
        include: { asset: { include: { provider: true } } }
      })
      return NextResponse.json({ requests });
    }

    return NextResponse.json({ message: 'Dashboard data available.' });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
