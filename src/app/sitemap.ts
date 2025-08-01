import { url } from "inspector";
import { MetadataRoute } from "next";

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
 
    return Promise.resolve([
        {
            url: "https://litetrainer.com",
            lastModified: new Date(),
        },
        {
            url: `https://litetrainer.com/en`,
            lastModified: new Date(),
        },
        {
            url: `https://litetrainer.com/es`,
            lastModified: new Date(),
        },
        {
            url: `https://litetrainer.com/en/login`,
            lastModified: new Date(),
        },
        {
            url: `https://litetrainer.com/en/sign-up`,
            lastModified: new Date(),
        },
        {
            url: `https://litetrainer.com/es/login`,
            lastModified: new Date(),
        },
        {
            url: `https://litetrainer.com/es/sign-up`,
            lastModified: new Date(),
        },
    ]);
}