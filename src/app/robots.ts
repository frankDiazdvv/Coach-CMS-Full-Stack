import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/coach/coach-dashboard", "/coach/coach-profile", "/coach", "/client", "/api"],
            },
        ],
        sitemap: `https://litetrainer.com/sitemap.xml`,
    };
}