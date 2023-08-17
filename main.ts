// Copyright 2023 Yoshiya Hinosawa. All rights reserved. MIT license.

const kv = await Deno.openKv();

Deno.serve(async (req) => {
  const { origin, pathname } = new URL(req.url);

  if (req.method === "POST") {
    const key = [crypto.getRandomValues(new BigUint64Array(1))[0].toString(36)];
    const val = new URL(await req.text()).href;

    await kv.atomic().check({ key, versionstamp: null }).set(key, val).commit();
    return new Response(`Created ${origin}/${key[0]}\n`);
  }

  if (pathname === "/") {
    const msg = "Welcome! Shorten the url with the command:\n\n  " +
      `curl -d https://example.com ${origin}`;
    return new Response(msg);
  }

  const v = (await kv.get<string>([pathname.slice(1)])).value;
  return v ? Response.redirect(v) : new Response("Not Found", { status: 404 });
});
