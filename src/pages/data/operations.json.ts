import operations from '../../data/operations.json';

export const prerender = true;

export function GET() {
  return new Response(JSON.stringify(operations, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
