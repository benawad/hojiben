export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);

  if (url.hostname === 'www.hojiben.com') {
    url.hostname = 'hojiben.com';
    return Response.redirect(url.toString(), 301);
  }

  const response = await next();

  const headers = new Headers(response.headers);

  if (url.hostname === 'hojiben.com' && url.pathname === '/.well-known/api-catalog') {
    headers.set('Content-Type', 'application/linkset+json; charset=utf-8');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  if (url.hostname === 'hojiben.com' && url.pathname === '/') {
    headers.append('Link', '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"');
    headers.append('Link', '</spots.json>; rel="service-desc"; type="application/json"; title="Hojicha spot data"');
    headers.append('Link', '</llms.txt>; rel="service-doc"; type="text/plain"; title="LLM guide"');
    headers.append('Link', '</about/>; rel="describedby"; type="text/html"; title="About Hoji Ben"');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
};
