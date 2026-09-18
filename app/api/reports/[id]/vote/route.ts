import {
  ReportNotFoundError,
  SelfVoteError,
  voteOnReport,
} from "@/features/reports/reports";
import type { ReportVote } from "@/features/reports/reportTypes";

function isValidVote(body: unknown): body is { deviceId: string; vote: ReportVote } {
  if (!body || typeof body !== "object") return false;

  const input = body as Record<string, unknown>;

  return (
    typeof input.deviceId === "string" &&
    input.deviceId.length > 0 &&
    (input.vote === "confirm" || input.vote === "deny")
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidVote(body)) {
    return Response.json({ error: "Missing or invalid vote fields" }, { status: 400 });
  }

  try {
    const report = await voteOnReport(id, body.deviceId, body.vote);

    return Response.json({ report });
  } catch (error) {
    if (error instanceof ReportNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof SelfVoteError) {
      return Response.json({ error: error.message }, { status: 403 });
    }

    console.error("Report vote error:", error);

    return Response.json({ error: "Failed to record vote" }, { status: 500 });
  }
}
