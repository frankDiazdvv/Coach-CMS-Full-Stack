import { createRouteHandler  } from "uploadthing/next";

import { ourFileRouter } from "./core";

export const { POST, GET } = createRouteHandler({
  router: ourFileRouter,
});
