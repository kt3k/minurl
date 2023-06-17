// Copyright 2023 Yoshiya Hinosawa. All rights reserved. MIT license.

const kv = await Deno.openKv();

Deno.serve(async (req) => {
  const { origin, pathname } = new URL(req.url);

  if (req.method === "POST") {
    const url = new URL(await req.text());
    const slug = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
    const key = ["urls", slug];
    await kv.atomic().check({ key, versionstamp: null }).set(key, url.href)
      .commit();
    return new Response(`Created ${origin}/${slug}\n`);
  }

  if (pathname === "/") {
    return new Response(
      `Welcome to URL Shortner! Create a short url with the command:

  curl -d https://example.com ${origin}`,
    );
  }

  const { value } = await kv.get<string>(["urls", pathname.slice(1)]);
  return value
    ? Response.redirect(value, 307)
    : new Response("Not Found", { status: 404 });
});
