import { IncomingMessage } from 'http';

/**
 * Parse request body manually from the HTTP stream
 * Handles form-encoded data (application/x-www-form-urlencoded)
 * Values that are valid JSON strings will be parsed into objects
 * In getServerSideProps, the request body arrives as a stream of chunks,
 * unlike API Routes where Next.js automatically parses req.body
 */
export async function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = '';

    // Listen for incoming data chunks - this event fires multiple times
    // as the request body data arrives in pieces
    req.on('data', (chunk: Buffer) => {
      // Convert binary chunk to string and accumulate it
      body += chunk.toString();
    });

    // Listen for the end event - fires when all data has been received
    req.on('end', () => {
      // Parse form data (application/x-www-form-urlencoded)
      // Format: key1=value1&key2=value2
      // Values can be JSON strings that will be parsed into objects
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formData: Record<string, any> = {};
      if (body) {
        const pairs = body.split('&');
        pairs.forEach((pair) => {
          const [key, value] = pair.split('=');
          if (!key) {
            return;
          }

          const decodedKey = decodeURIComponent(key);
          const decodedValue = decodeURIComponent(value || '');

          // Try to parse value as JSON, if it fails, use as string
          try {
            formData[decodedKey] = JSON.parse(decodedValue);
          } catch {
            // Not valid JSON, keep as string
            formData[decodedKey] = decodedValue;
          }
        });
      }

      // Return formatted JSON string for display
      resolve(JSON.stringify(formData, null, 2));
    });
  });
}
