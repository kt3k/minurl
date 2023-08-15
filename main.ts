// Copyright 2023 Yoshiya Hinosawa. All rights reserved. MIT license.
const kv = await Deno.openKv();
Deno.serve(async (req) => {
  const { origin, pathname } = new URL(req.url);
  if (req.method === "POST") {
    const url = new URL(await req.text());
    const path = crypto.getRandomValues(new BigUint64Array(1))[0].toString(36);
    const key = ["urls", "/" + path];
    await kv.atomic().check({ key, versionstamp: null }).set(key, url.href)
      .commit();
    return new Response(`Created ${origin}/${path}\n`);
  }
  if (pathname === "/") {
    return new Response(
      `Welcome to URL Shortner! Create a short url with the command:\n\n curl -d https://example.com ${origin}`,
    );
  }
  const v = (await kv.get<string>(["urls", pathname])).value;
  return v ? Response.redirect(v) : new Response("404", { status: 404 });
});
