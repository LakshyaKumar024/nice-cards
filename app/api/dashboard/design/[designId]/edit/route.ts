import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: NextRequest,
) {
    return NextResponse.json(
        { message: "empty" },
    );
}
