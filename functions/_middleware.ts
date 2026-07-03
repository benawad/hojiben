export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);

  if (url.hostname === 'www.hojiben.com') {
    url.hostname = 'hojiben.com';
    return Response.redirect(url.toString(), 301);
  }

  return next();
};
