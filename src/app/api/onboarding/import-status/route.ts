import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
  }

  try {
    // For now, return a mock status
    // In a real implementation, this would query the database for the job status
    return NextResponse.json({
      status: 'completed',
      progress: 100,
      processedWorks: 25,
      totalWorks: 25,
      error: null,
      completedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching import status:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
