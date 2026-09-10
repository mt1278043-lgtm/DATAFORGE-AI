import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const data = {
      items: [
        { id: 1, name: 'Item 1', value: 100, status: 'active' },
        { id: 2, name: 'Item 2', value: 250, status: 'active' },
        { id: 3, name: 'Item 3', value: 175, status: 'pending' },
      ],
      total: 3,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newItem = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
