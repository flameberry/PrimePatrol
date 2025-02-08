export async function GET(req) {
    // Example values to return
    const values = {
      message: "Hello, this is a sample response from a Next.js API route.",
      status: "success",
      data: {
        id: 1,
        name: "John Doe",
        role: "Developer",
        createdAt: new Date().toISOString(),
      },
    };
  
    // Returning the values as a JSON response
    return new Response(JSON.stringify(values), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  